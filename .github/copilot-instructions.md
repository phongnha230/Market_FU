# GitHub Copilot Instructions - FU Student Second-hand Market

When working on the `backend/` codebase:
- Follow the 3-Tier Layered Architecture strictly (`routes` -> `controller` -> `service` -> `prisma`).
- Every module must have 4 files in `src/modules/<feature>/`: `<feature>.dto.ts`, `<feature>.controller.ts`, `<feature>.service.ts`, `<feature>.routes.ts`.
- All request validation must use Zod schemas in `*.dto.ts`.
- Controller must delegate 100% of business logic to Service.
- Always use `sendSuccess` from `src/utils/response.ts` for successful responses.
- Always throw `AppError` from `src/middlewares/error.middleware.ts` for business/validation errors.
- Wrap multi-table/collection writes in `prisma.$transaction`.
- Read all secrets from `src/config/env.ts`.
- For detailed guidelines, refer to `backend/RULES.md`.
