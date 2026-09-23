# Code Review — Backend BE-DEV 3 & BE-DEV 4

**Date:** 2026-09-23 · **Scope:** `backend/src` per ownership in `task.md`
**BE-DEV 3:** `src/modules/orders/`, `src/modules/payments/`, `src/modules/reviews/`, `src/config/payos.ts`, `src/config/redis.ts`
**BE-DEV 4:** `src/modules/reports/`, `src/modules/vouchers/`, `src/cron/`, `src/config/mail.ts`

Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low / nit

---

## 1. Overall verdict

BE-4's scope is largely complete and well-structured: `authorize('ADMIN')` guards every admin route, dispute detail has an explicit IDOR check, voucher redemption uses proper conditional `updateMany` guards (`quantity gt 0`, `campusCoins gte`) against oversell/double-spend, indexes were added to `Order`/`UserVoucher`, and the KYC emails are wired. BE-3 has good layering and transactional order/handshake/review flows.

The main problems: **the server currently cannot boot** (`requireAuth` is imported from a middleware that doesn't export it), **the payment webhook is completely unauthenticated** (anyone can mark any order PAID), **Task 3.2's GHTK shipping webhook doesn't exist at all** (shipping status is self-declared by the seller), the handshake token ignores the required HMAC design, and dispute "refunds" move no money.

---

## 2. BE-DEV 3 findings

### 🔴 B3-1. `requireAuth` does not exist — app crashes on startup
`order.routes.ts:3,8` and `review.routes.ts:3,8` import `requireAuth` from `middlewares/auth.middleware`, but that file only exports `authenticate` and `authorize`. `requireAuth` is `undefined`, and `router.use(undefined)` throws `TypeError: argument handler must be a function` at require time → **`app.ts` fails to load and the entire server won't start**. Tests didn't catch it because no route-level test boots `app.ts` with the orders/reviews routers mounted.
**Fix:** change both to `authenticate` (as every other module does) and add a smoke test that imports `app`.

### 🔴 B3-2. Payment webhook has no signature verification or auth
`POST /api/payments/webhook` (`payment.routes.ts:7`) is public with zero validation: no HMAC check, no shared secret, no IP allowlist. Every field in `webhookPaymentSchema` is optional — anyone can `POST {}`-adjacent bodies guessing `orderCode` (format `ORD-<6 digits>-<4 hex>` is highly enumerable) and force any order to `PAID`. Meanwhile:
- `SHIPPING_WEBHOOK_SECRET` / `HANDSHAKE_QR_SECRET` are defined in `env.ts:67-68` but **never used anywhere**;
- `app.ts:59-64` captures `rawBody` for `/api/webhooks/*`, but the payment webhook lives at `/api/payments/webhook` so it doesn't even get the raw buffer.
Additionally `processPaymentWebhook` never compares `transferAmount` against `order.payment.totalAmount` — a 1.000đ transfer "pays" a 2.000.000đ order.
**Fix:** verify HMAC signature (SePay uses an `api-secret` token header; PayOS uses checksum on `req.body`), reject when `transferAmount < totalAmount`, and put the route under the `/api/webhooks` prefix (or move the rawBody capture).

### 🟠 B3-3. Task 3.2 (GHTK/GHN shipping webhook) is not implemented
The spec requires `webhook.service.ts` + `webhook.routes.ts` with `POST /api/webhooks/shipping` (HMAC verify + idempotency + auto `DELIVERED` → 48h warranty + notifications). None of these files exist. The substitute is `PATCH /api/orders/:id/shipping` where the **seller self-declares** `SHIPPING`/`DELIVERED` with no carrier proof — a dishonest seller can flip `DELIVERED` immediately to start the clock and pressure the buyer.
**Fix:** implement the real webhook receiver; keep the seller route only for manual partner-less cases, or clearly document the spec deviation in `task.md`.

### 🟠 B3-4. Handshake token ignores the required HMAC-SHA256 design
`order.service.ts:84-85`: token is a plain `crypto.randomUUID()` stored in the DB and OTP is `Math.random()` (not cryptographically secure) with **6 digits**, while Task 3.1 specifies `HMAC-SHA256(orderCode + sellerId + secret)` + a 4-digit OTP (`1000-9999`) from `HANDSHAKE_QR_SECRET`. The secret is also never used server-side (it exists in `env.ts` for this purpose). Verification (`:375-376`) uses plain `===` instead of `crypto.timingSafeEqual`, and there is no attempt throttling — the 6-digit OTP space is small enough to brute-force over the network.
**Fix:** derive the QR token via HMAC with `HANDSHAKE_QR_SECRET` (verify = recompute, no need to trust a stored plaintext token), use `crypto.randomInt` for the OTP, add a per-order attempt counter (Redis is already wired), and compare with `timingSafeEqual`.

### 🟠 B3-5. `createOrder` check-then-act race on product status
Lines 41-43 check `product.status === 'AVAILABLE'` outside the transaction, then the tx at :112 unconditionally writes `RESERVED`. Two concurrent buyers both pass the check → both orders created, both deducted coins, one silently stranded. The coin decrement at :94 also has no `gte` guard (unlike voucher redemption, which does it right).
**Fix:** inside the tx use `tx.product.updateMany({ where: { id, status: 'AVAILABLE' } })` and abort if `count === 0`; use `updateMany` with `campusCoins: { gte: actualCoinsUsed }` for the coin spend.

### 🟠 B3-6. VietQR uses a hardcoded personal bank account
`order.service.ts:88` embeds `MB-0982345892` / "MARKET FU ESCROW" as a literal, while `VIETQR_BANK_ID`, `VIETQR_ACCOUNT_NO`, `VIETQR_ACCOUNT_NAME` env vars exist (`env.ts:71-74`) and go unused. Real buyer money is directed at whatever number is hardcoded in source; `payos.ts` is a 700-byte stub and no PayOS API call exists despite the module name.
**Fix:** build the URL from `ENV.VIETQR_*`; either finish the PayOS integration or rename the task item to avoid implying it exists.

### 🟠 B3-7. Blind-review / coin reward diverges from spec in several ways
`review.service.ts`:
- **No 7-day auto-reveal.** Task 3.3 says reviews unlock when both sides review *or after 7 days*. A `warrantyEndsAt + 7d` reveal job doesn't exist anywhere (checked `cron/`), so if one party never reviews, the other's review stays private forever and the reputation delta never applies.
- **Review allowed during warranty window** — spec says only after bao-test ends; the code only checks `status === 'COMPLETED'` (:27). A buyer can review, then dispute, then re-review? (existing-review check is check-then-create with no unique `(orderId, reviewerId)` constraint → double-submit possible.)
- **Rewards don't match spec**: code gives +50 Xu to the reviewer (spec: buyer +100, +200 with test video, seller +5 reputation for 5★). The `CoinTransaction` is missing `balanceAfter` (other modules set it).
- Reputation is applied only when both reviews exist, using `calculateScoreChange` on each side — fine, but spec's "+5 điểm uy tín cho cả 2 bên khi handshake" exists in `verifyHandshake` (:415) as +2, another silent constant drift.
**Fix:** add the nightly reveal sweep (natural fit: BE-4's cron or a new `blind-review.cron.ts`), add `@@unique([orderId, reviewerId])` to `Review`, and align constants with `task.md` or document the change.

### 🟡 B3-8. Order responses leak counterpart PII including KYC card image
`createOrder` (:164-177) and `getOrderDetail` (:300-313) select buyer/seller `email` plus **`profile: true`** — the full Profile embed, which contains `kyc.cardImageUrl` and `bankAccount`. So a meetup counterparty sees the other's student-card image URL and bank number. Restrict to `fullName, avatarUrl, campus`, and reveal `phoneNumber`/`email` only (task says phone is revealed at handshake time).

### 🟡 B3-9. Order state machine is unenforced
`updateShippingStatus` accepts `DELIVERED` directly from `PENDING`, works on `MEETUP` orders (only `sellerId` is checked — a MEETUP order has no shipping but the code fabricates an empty shipping object at :464-469), and never sets the product to `SOLD` on `DELIVERED` (Task 3.2 requires it; the missing webhook was supposed to do this). `cancelOrder` is OK (PENDING-only + coin refund with ledger entry — good). Add explicit allowed-transition maps per `orderType`.

### 🔵 B3-10. Misc
- `trackingCode: TRACK-${timestampStr}` (:146) — only 6 digits of time, collides across orders in the same second, and not unique-constrained. Use `orderCode`.
- `getOrderDetail` matches `{ id: orderIdOrCode }` with arbitrary strings — an invalid Mongo ObjectId throws Prisma error → 500 instead of 404. Validate length/hex first.
- `POST /api/orders/:id/dispute` (Task 3.1) doesn't exist in orders module — disputes live under `POST /api/reports/disputes` (BE-4). Fine functionally; note the ownership shift in `task.md` so the two devs don't both/none own the happy path.
- Response shape: `task.md` wants `{ success, message, data }`; `utils/response.ts` emits `{ success, data, meta }` with no `message`. Project-wide inconsistency with the spec — pick one and update `task.md` or the util.
- `coinsUsed` caps at `min(coins*1000, 100000, price)` (:73) — spec says max 10% of item value; 100k flat cap on a 50k item is >10%. Use `Math.min(price * 0.1, …)` per Task 3.3 item 2.

---

## 3. BE-DEV 4 findings

### 🟠 B4-1. Dispute resolution moves no money and leaves records inconsistent
`report.service.ts resolveDispute` (:470-549): `REFUND_BUYER` just flips `order.status = 'CANCELLED'` — no coin refund of `payment.coinsUsed`, no escrow refund record, and the **product stays `SOLD`** even though the item goes back to the buyer. `PAY_SELLER` only sets `COMPLETED`. The ledger (`CoinTransaction`) never sees a `DISPUTE_REFUND` entry, contradicting the "ghi sổ cái" convention used everywhere else.
**Fix:** in the resolve tx, refund coins, restore product status (refund: `AVAILABLE` / rejected: keep `SOLD`), and write a ledger entry for any Xu movement.

### 🟠 B4-2. Disputes can be opened on orders that were never delivered
`createDispute` (:277-347) only blocks when `warrantyEndsAt` is in the past. A `PENDING`/`SHIPPING` order has `warrantyEndsAt = null` → the check passes, and a buyer can immediately force `DISPUTED` on an order before handshake, bypassing `cancelOrder` and freezing it in the admin queue. Require `status ∈ {COMPLETED, DELIVERED}` and `warrantyEndsAt` set.

### 🟠 B4-3. Any user can burn anyone else's voucher
`POST /api/vouchers/use` (`voucher.routes.ts:16`, `voucher.service.ts:334-396`): only requires login + knowing the code — no ownership, no staff/partner role. A student who observes a code (or brute-forces the 8-hex `FUV-XXX-XXXXXXXX` space) can mark another user's voucher `USED`. Also check-then-update is racy: two simultaneous scans both pass the `status === 'USED'` check and both "succeed".
**Fix:** `updateMany({ where: { id, status: 'UNUSED', expiredAt: { gte: now } } })` and fail on `count === 0`; restrict redemption-at-counter to ADMIN or the owner (with a counter-side PIN/QR secret), per real "quét tại quầy" flows.

### 🟡 B4-4. BAN_USER / KYC approve side effects incomplete
- `resolveReport` BAN (:225-235): sets `isActive = false` but doesn't bump `tokenVersion`, so the banned user keeps full API access for the token TTL, and their live products stay `AVAILABLE` on the marketplace. Ban should also unlist/hide active products and revoke sessions (Redis + tokenVersion plumbing already exists from BE-1).
- `approveKyc` (:745-749): unconditionally overwrites `role: 'SELLER'` — if the subject is an ADMIN (e.g. test account), approving their KYC demotes them. Guard: only promote when `role === 'BUYER'`. Also `balanceAfter` is computed pre-transaction (:713) → the ledger can record a stale balance under concurrent coin events (same bug class as B1-11).

### 🟡 B4-5. `sendOrderCompletedReceiptEmail` is dead code
Defined at `mail.ts:179` and wired nowhere — Task 4.3 explicitly requires the receipt email when an order completes. The natural call sites are `verifyHandshake` (orders) and the (missing) shipping webhook. Either call it from the completion path via an event/helper exported from BE-4, or mark the task incomplete in `task.md`.

### 🟡 B4-6. Cron: fragile reminder window and sequential awaits
`expire-products.cron.ts`:
- The day-27 scan uses a 24h window `[now+2d, now+3d]` with no `expiringReminderSentAt` flag on Product — if the server is down at 00:00 one day (or runs twice via two instances — no Redis lock, and `cron.schedule` has no timezone option so it uses server-local TZ, spec is Vietnam 00:00), sellers get duplicate or zero reminders. Add a persisted sent-flag and pass `{ timezone: 'Asia/Ho_Chi_Minh' }`.
- `await sendPostExpiringEmail(...)` in the per-product loop: one slow SMTP call stalls the whole sweep; batch/Promise.allSettled and catch per-email.
- EXPIRE sweep only covers `status: 'AVAILABLE'` — `RESERVED` posts whose order later cancelled stay in limbo forever if the order never re-checks. Minor, but consider RESERVED+stale cleanup.
- Cron uses `new NotificationService()` (:6) while reports (:19) and vouchers (:13) also instantiate their own copies, instead of the exported `notificationService` singleton used by BE-3 — duplicate FCM init/state. Same pattern was flagged for BE-1 (B1-11); standardize on the singleton.

### 🟡 B4-7. Report spam / no dedupe
`createReport` has no throttle or uniqueness (same reporter, same target, PENDING) and no per-user rate limit → an admin queue can be flooded with identical pending reports. Add a "you already reported this, we're on it" short-circuit, plus the existing `globalRateLimiter` covers some volume.

### 🔵 B4-8. Misc
- Routes `/me` + `/my-vouchers` duplicate the same handler — keep one, alias the other with a comment (same nit as B1-11).
- `getDisputes` (admin list) is fine, but `getMyReports` doesn't exist — a reporter can never check their own report status; spec only lists admin views, so this is a suggestion.
- `QueryKycSchema` allows `status: 'NONE'` but `KycVerification` records never have status NONE → dead filter option.
- `useVoucher` response leaks owner identity (`usedBy: fullName/email`) to whoever calls the endpoint — combined with B4-3, that's a privacy leak; trim once access is restricted.
- Admin list endpoints (`getReports`, `getDisputes`, `getKycVerifications`) return other users' emails/phones to ADMIN — acceptable, but ensure this router is never mounted anywhere other than `/api/reports` (it isn't — OK).
- Unit tests exist (`bedev4.unit.test.ts`, voucher e2e/integration) — good coverage of redeem/oversell paths; orders/reports have none beyond `bedev3.unit.test.ts`. Add an integration test for `PATCH /kyc/:id/approve` (coin increment + role change) and for dispute resolve.

---

## 4. Task-list status vs `task.md` checkboxes

- **BE-DEV 3:** Tasks 3.1/3.2/3.3 are all still `- [ ]` in `task.md`, and the code matches that — 3.1 and 3.3 are ~80% implemented (with the deviations above), **3.2 is not implemented at all**. Leave unchecked until B3-1, B3-2, B3-3 are fixed.
- **BE-DEV 4:** Tasks 4.1/4.2/4.3 are marked `- [x]`. Fair for 4.1/4.2 modulo B4-1..B4-3 (dispute money movement and counter-scan security are arguably "not done"), and 4.3 is missing the receipt-email wiring (B4-5). Consider a follow-up task row for "dispute refund ledger + voucher counter auth".

## 5. Suggested fix order

1. 🔴 B3-1 (`requireAuth` crash) — nothing works until this ships.
2. 🔴 B3-2 (unauthenticated payment webhook) + B3-4 (HMAC handshake secret) — money/security.
3. 🟠 B4-3 (voucher burn) and B4-1 (dispute refunds) — integrity of the coin economy.
4. 🟠 B3-3 (shipping webhook) or explicit spec downgrade; B3-5/B3-6 race + hardcoded account.
5. 🟡 B3-8/B4-6 remaining PII, singleton and cron hardening; B3-7 blind-review reveal job.
