# Code Review — Backend BE-DEV 1 & BE-DEV 2

**Date:** 2026-09-22 · **Scope:** `backend/src` per ownership in `task.md`
**BE-DEV 1:** `src/config/`, `src/modules/auth/`, `src/modules/users/`, `src/modules/profile/`, `src/modules/products/`, `src/modules/categories/`
**BE-DEV 2:** `src/modules/chats/`, `src/modules/ai/`, `src/modules/notifications/`, `src/utils/socket.ts`

Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low / nit

---

## 1. Overall verdict

Both scopes are structurally solid: clean controller → service → DTO layering, Zod validation everywhere, consistent `AppError`/`sendSuccess` format, JWT dual-token with `tokenVersion` revocation, atomic coin spending with `gte` guards, and thoughtful fallbacks (Redis/Meilisearch/Gemini offline). Tests exist (unit + integration + e2e).

The main problems are **PII leakage in public product responses**, **public exposure of KYC card images via static `/uploads`**, **missing authorization in one socket handler**, **AI endpoints without the rate limiter that was written for them**, and **task-spec drift** (no MongoDB indexes, no 3-posts/<500k rule, refresh-token not rotated).

---

## 2. BE-DEV 1 findings

### 🔴 B1-1. Public product endpoints leak seller PII
`product.service.ts` — `getProducts()` (lines ~203–225, 288–313) and especially `getProductById()` (lines 331–359) select **`seller.email`**, and the detail view also returns **`profile.phoneNumber` and `profile.campusCoins`** for the seller. These routes are public (`GET /api/products`, `GET /api/products/:id` in `product.routes.ts`).
`user.service.getUserById()` deliberately masks email/phone for strangers — the product module undoes that protection.
**Fix:** restrict the seller select to `id, fullName, avatarUrl, campus, reputationScore, kyc status`; phone should only be revealed after an order/handshake exists.

### 🔴 B1-2. KYC student-card images are publicly served
`profile.service.submitStudentKyc` stores card images via `saveImageToStorage(..., 'kyc_cards')`, which **falls back to local disk** under `UPLOAD_ROOT` when R2 isn't configured (`config/storage.ts:108-114`). `app.ts:73-79` serves the **entire `uploads/` directory statically, unauthenticated**. Anyone who guesses/receives the URL gets other students' ID cards (student ID, photo, campus).
**Fix:** store KYC media in a separate bucket/prefix not exposed by the static route, or serve private media through an authorized streaming endpoint; at minimum don't fall back to the public static dir for `kyc_cards`.

### 🟠 B1-3. Task-spec business rules not implemented (drift)
Task 1.4 requires: unverified users → max **3 posts/month, price < 500,000 VNĐ**; verified → unlimited. `createProduct()` instead hard-requires `KYC APPROVED || SELLER || ADMIN` ("Phương án 3", lines 66–78). It's a defensible product decision, but it neither implements nor documents removing the cap/price rules; there is no monthly-post quota at all for SELLER-role users either. Also `PATCH /api/products/:id/status` (AVAILABLE/RESERVED/SOLD/HIDDEN transitions, Task 1.4) is **missing** — only soft-delete-to-HIDDEN exists via `DELETE`.

### 🟠 B1-4. No database indexes despite explicit requirement
Task 1.1 required compound indexes (campus+category+status+createdAt, text index on title/description). `prisma/schema.prisma` contains **zero `@@index` directives**, and the fallback search uses `{ contains, mode: 'insensitive' }` (product.service.ts:263–268) which cannot use an index. On MongoDB/Atlas this will table-scan every listing query once data grows. Meilisearch mitigates search but not filter/sort queries (and it's optional/offline-tolerant).

### 🟠 B1-5. Refresh-token flow: no rotation / reuse detection
`auth.service.refreshToken()` (lines 340–380) validates and re-mints tokens but the **old refresh token stays valid** until its 30-day expiry — the response cookie is overwritten, but a stolen refresh token is still usable by the attacker even after the victim "renews", until they explicitly log out. Consider token rotation with `jti` + used-token blacklist (Redis is already wired), or shortening refresh TTL.

### 🟠 B1-6. Email case normalization bug
`register` stores `input.email` as-is; `login`/`refreshToken` look up with the raw string; `forgotPassword`/reset and the brute-force store use `.trim().toLowerCase()`. A user registering `Name@GMail.com` cannot log in with lowercase (Prisma Mongo queries are case-sensitive), and lock counters can be bypassed by changing case. Normalize once at the DTO layer (`z.string().email().toLowerCase()`).

### 🟡 B1-7. In-memory security state breaks multi-instance deploys
`passwordResetStore`, `loginAttemptStore` (auth.service.ts) and `viewCooldownStore` (product.service.ts) are process-local `Map`s. With more than one server instance: OTP attempts and login locks are per-node (defeats brute-force lockout), view anti-spam is per-node. Redis helpers (`getCache/setCache`) already exist — move these there.

### 🟡 B1-8. Account enumeration via forgot-password
`forgotPassword` throws `404 EMAIL_NOT_FOUND` (auth.service.ts:437) while login says generic invalid credentials. Return a neutral "if the email exists, an OTP was sent" message. Also `login` leaks "you have N attempts left" for **nonexistent** emails the same way — acceptable, but combined with the lockout it tells an attacker which accounts exist.

### 🟡 B1-9. `renewProduct` resurrects SOLD items
Line 403–409 unconditionally sets `status: 'AVAILABLE'` on renew. A seller who sold an item can "renew" it back into the marketplace even after a paid order exists. Guard: only renew when status ∈ {EXPIRED, AVAILABLE, HIDDEN} or explicitly reject SOLD/RESERVED.

### 🟡 B1-10. Meilisearch result path drops DB status filter
`getProducts()` (lines 185–243) takes `meiliResult.productIds` and re-fetches with only `id: { in: [...] }` — **no `status: 'AVAILABLE'`**. Anything stale in the index (just sold/expired, before `deleteProductFromMeili` catches up, e.g. the cron only runs nightly) is publicly listed. Add the status filter to the Prisma re-fetch.

### 🔵 B1-11. Misc
- `addFavorite`/`removeFavorite`: check-then-write; two racing PUTs can double-increment/decrement `likesCount` (can go negative). Use the unique-constraint error (P2002) to make it truly idempotent.
- `boostProduct`: `newBalance` is computed **before** the transaction, so the `coinTransaction.balanceAfter` ledger entry can be wrong under concurrent spending (the decrement itself is safe). Recompute inside the tx.
- Route duplication: `/renew` + `/renewals`, `/boost` + `/boosts`, `PUT`/`DELETE`/`POST-toggle` favorite — pick one canonical shape, alias with deprecation comments at most.
- `authenticate` middleware doesn't check `isActive`/`tokenVersion`, so a banned user keeps API access for up to 15 min (acceptable trade-off, but pair with socket disconnect on ban).
- Dev fallback in `env.ts:100-107` embeds default secrets in source. Guarded to non-production; fine, but keep `.env.example` as the sharing mechanism.
- Cross-scope coupling: `profile.service.ts` (BE-1) imports `NotificationService` from the BE-2 module and instantiates its own copy (`new NotificationService()` at line 13) instead of the exported singleton — see B2 notes; document an events interface instead.

---

## 3. BE-DEV 2 findings

### 🔴 B2-1. Socket `message_read` has no membership check (IDOR)
`utils/socket.ts:272–293`: any authenticated socket can emit `message_read` with **any** `conversationId` and mark the other party's messages read — the handler updates `Message` where `senderId != userId` without verifying the requester is `buyerId`/`sellerId`. Every other handler (`join_conversation`, `send_message`) checks. REST `markAsRead` checks too — the socket path is the hole. **Fix:** fetch conversation and verify membership before the `updateMany`.

### 🟠 B2-2. `aiRateLimiter` written but never wired
`rateLimit.middleware.ts:44` defines a dedicated Gemini limiter (20/min) and `ai.routes.ts` only applies `authenticate`. Unauthenticated-budget Gemini Vision calls (image upload + model call per request) are a direct cost/DoS vector. Apply `aiRateLimiter` to `/vision-post` and `/assistant-chat` in `ai.routes.ts`.

### 🟠 B2-3. FCM push can never actually deliver
`notification.service.sendNotification` accepts `fcmTokens`, but **nothing in the schema stores device tokens** (no `fcmToken`/`deviceToken` field anywhere in `prisma/schema.prisma` or the codebase), and no caller passes tokens. The task's "Push FCM Multicast khi có tin nhắn mới / kết quả duyệt KYC" is effectively dead code. Needs a device-token model + registration endpoint, and call sites from chat/KYC flows.

### 🟠 B2-4. Socket text messages are unvalidated
`send_message` (socket.ts:111–224) persists `text` with no length/type checks (REST DTO caps at 2000 chars, `chat.dto.ts:18`), no rate limit per user, and accepts an arbitrary client-supplied `mediaUrl` string (embeddable phishing links). Also oversized payloads hit Mongo directly. Validate the socket payload with the same `sendMessageSchema` the REST path uses.

### 🟡 B2-5. Duplicated offer-price logic (socket vs service)
The 50%-floor rule, summary-text formatting, and last-message update exist twice: `socket.ts:141–207` and `chat.service.ts:335–397`. One already had to be bug-fixed in tandem. Extract into `chatService.persistOutboundMessage()` and have the socket handler call it — the socket layer should only do auth + room broadcast.

### 🟡 B2-6. Sockets survive logout / account ban
Logout increments `tokenVersion` (good for REST refresh), but `io` rooms are keyed on the connection made at handshake; a logged-out or banned user's socket keeps receiving `conversation_*` broadcasts and can send messages. Add middleware: on logout/ban, `io.in(`user_${id}`).socketsLeave(...)` or verify tokenVersion periodically.

### 🟡 B2-7. AI chatbot ignores real conversation history
`ai.service.assistantChat` saves sessions/messages, but each call starts a **fresh** Gemini chat with a canned 2-turn history (lines 238–243) and only sends the current message. Follow-ups like "cái đầu giá sao?" lose context. Rebuild `history` from the last N `aiChatMessage` rows, and use the `systemInstruction` field instead of faking a user/model turn for the system prompt.

### 🟡 B2-8. N+1 unread-count queries
`chat.service.getUserConversations` (lines 209–229) fires one `message.count` per conversation per request (up to `limit=20` counts). Replace with a single `groupBy` (`prisma.message.groupBy({ by: ['conversationId'], where: {...isRead:false, conversationId in ids}, _count })`).

### 🔵 B2-9. Misc
- `sendNotification` `await`s FCM + SMTP inline — the caller (e.g. KYC submit) pays that latency; fire-and-forget with a catch, or queue it.
- Email HTML interpolates `${title}`/`${body}` raw (notification.service.ts:98–101); if user-generated content ever flows into a notification title, that's HTML injection in mail. Escape or use the templates in `config/mail.ts`.
- `visionScanPost` error message surfaces Gemini's internal error text to clients (ai.service.ts:86–91) — sanitize.
- `getProductSessions`… `getSessionDetail` ownership check ✔ good; `ai/sessions/:id` properly scoped to `userId`.
- Socket shorthand `send_offer_price` reaching into `socket.listeners('send_message')[0]` (socket.ts:228) is fragile — factor the handler into a named function and call it directly.

---

## 4. Shared/cross-cutting observations

1. **Module ownership blur:** BE-1's `profile.service.ts` news up BE-2's `NotificationService`; BE-2's socket layer queries BE-1's `Product`/prisma directly. Workable for a student project, but a small `notification.emit` façade (or EventEmitter) would decouple the four devs' scopes as `task.md` intends ("code song song không conflict").
2. **Redis unused by these two scopes:** `config/redis.ts` has cache helpers, but products listing (hot query), rate limits, socket rooms, and auth attempt stores are all in-memory/uncached.
3. **Response-shape inconsistency:** chats/notifications use `sendPaginated`, products/users return `sendSuccess(res, data, pagination)` — pick one meta contract for the frontend.
4. **Tests:** auth/products/chats/notification integration tests exist; the two critical socket/notification gaps above (B2-1, B2-3) have no coverage — add an IDOR regression test for `message_read`.

## 5. Suggested fix order

| # | Item | Severity | Effort |
|---|------|----------|--------|
| 1 | B2-1 socket `message_read` authz | 🔴 | S |
| 2 | B1-1 strip email/phone/coins from product includes | 🔴 | S |
| 3 | B1-2 stop serving `kyc_cards` via static /uploads | 🔴 | M |
| 4 | B2-2 wire `aiRateLimiter` | 🟠 | XS |
| 5 | B1-6 normalize email lowercase at DTO | 🟠 | XS |
| 6 | B1-10/B1-9 status filter on Meili re-fetch + renew guard | 🟠 | S |
| 7 | B2-3 FCM device-token model + register endpoint | 🟠 | M |
| 8 | B2-4 socket input validation via shared schema | 🟠 | S |
| 9 | B1-4 add `@@index` (Mongo needs `createindex` / atlas indexes too) | 🟠 | M |
| 10 | B1-5 refresh rotation, B1-7 Redis-backed stores, B2-5 dedupe, B2-8 groupBy | 🟡 | L |
