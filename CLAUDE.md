# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working agreement — read this first

**Do not edit any file in this repository unless the user explicitly asks for that edit.** This is a graduate-level challenge: the user writes the code, Claude explains and answers questions. Default to guidance — explanations, roadmaps, pointing at the file and the concept — not to Write/Edit.

- A question ("how do I make this responsive?", "why does this break?") is a request for an **explanation**, never a license to edit.
- Even when an edit *is* requested, it covers **only the file and change named**. Do not touch adjacent files, do not "fix" things noticed in passing, do not add config files (`.claude/launch.json`, etc.). Surface those as suggestions and let the user decide.
- Do not write a whole screen/component when asked about part of it. Scope stays where the user put it.
- When in doubt about scope, ask before writing.

## Repository overview

Financy is a fullstack finance-tracking app built for a graduate-level challenge, split into two independent projects in one repo:

- `backend/` — GraphQL API (TypeScript, Fastify, Apollo Server, Prisma, SQLite). Auth and category CRUD are implemented and working end-to-end; transaction CRUD is not started.
- `frontend/` — React app (Vite, GraphQL client). Not started yet — empty directory.

There is no root-level `package.json`; each side is set up and run independently from its own folder. Package manager is **pnpm** everywhere.

## Commands (run from `backend/`)

```bash
pnpm dev              # tsx watch src/infra/http/server.ts — dev server with hot reload
pnpm build            # tsc -p tsconfig.build.json — compiles src/ to dist/
pnpm start            # node dist/infra/http/server.js — run compiled build

pnpm lint             # biome check .
pnpm format           # biome check --write .

pnpm test             # vitest run — full suite, single run
pnpm test:watch       # vitest — watch mode
pnpm test:coverage    # vitest run --coverage — text + HTML report (coverage/index.html)
pnpm test src/use-cases/auth/sign-up.spec.ts   # run a single test file

pnpm exec prisma migrate dev --name <name>     # create + apply a migration
pnpm exec prisma generate                      # regenerate the Prisma Client
```

Test the API manually with `insomnia_export.json` (import via Insomnia → Import Data → From File). It has a "Base Environment" with `base_url`/`accessToken`/`refreshToken` variables — run `signUp` or `signIn`, paste the returned tokens into the environment (raw value, no surrounding quotes), and every authenticated request picks them up automatically via `Authorization: Bearer {{ _.accessToken }}`.

### pnpm build-script approval gotcha

pnpm blocks postinstall scripts for new native/build-dependent packages by default. If `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS`, run `pnpm approve-builds`, select the listed package(s) with space (this project needs `better-sqlite3`, `@prisma/engines`, `prisma`), confirm with enter, then `pnpm install` again. If the packages were already declined once, a plain `pnpm install` won't retry the build even after re-approving — run `pnpm rebuild <package>` (e.g. `pnpm rebuild better-sqlite3`) to force it.

## Backend architecture

The backend follows **Hexagonal Architecture** (Ports & Adapters), with SOLID's dependency inversion as the organizing rule: dependencies always point inward. `domain/` and `use-cases/` never import from `infra/`; `infra/` implements the interfaces `domain/` defines.

```
src/
  domain/
    entities/              # plain data shapes (User, Category, RefreshToken) — no framework/DB knowledge
    repositories/           # interfaces ("ports") the use-cases depend on, e.g. IUserRepository
    repositories/memory/    # in-memory fake implementations, used only in tests
  use-cases/
    auth/                   # sign-up, sign-in, refresh-token, logout
    user/                   # update-user, update-password
    category/               # create/update/delete/list-category
    errors/                 # business-rule errors, one class per rule (e.g. CategoryNotFoundError)
  infra/
    crypto/                 # password hashing (bcryptjs), access-token JWT + opaque refresh-token generation
    env/                    # infra/env/index.ts — Zod-validated process.env, single source of truth
    database/prisma/        # Prisma client singleton (prisma.ts) + concrete repository adapters
    factories/               # make-<use-case>.ts — wires a use-case to its Prisma repositories
    http/
      server.ts              # Fastify + Apollo entrypoint
      graphql/
        context.ts            # builds { userId } from the Authorization header
        ensure-authenticated.ts  # throws UNAUTHENTICATED if context.userId is null, else returns it
        validate-input.ts     # wraps a Zod schema, throws BAD_USER_INPUT GraphQLError on failure
        serialize-date.ts     # normalizes Date | number → ISO string (see Prisma 7 note below)
        modules/<name>/{typedefs,resolvers}.ts   # one pair per domain area, merged in server.ts
  generated/prisma/           # Prisma Client output — never edit, regenerated from schema.prisma
```

Every domain area (`auth`, `user`, `category`) follows the same vertical slice: `domain/entities/*` → `domain/repositories/*` (interface + in-memory fake) → `use-cases/<area>/*` (+ `.spec.ts`) → `infra/database/prisma/repositories/*` (adapter) → `infra/factories/make-*` → `infra/http/graphql/modules/<area>/*`. Replicate this exact shape for `transaction`, the remaining domain.

### Auth & authorization design

- **Access token**: JWT, signed in `infra/crypto/jwt.ts` (`signAccessToken`/`verifyToken`), 15 minutes (`ACCESS_TOKEN_TTL_SECONDS`), verified by signature only — no DB lookup.
- **Refresh token**: an opaque random string (`infra/crypto/refresh-token.ts`), persisted in the `RefreshToken` table via `IRefreshTokenRepository`. Chosen over a second JWT so it can actually be revoked. `RefreshTokenUseCase` rotates it on every use (deletes the old record, issues a new pair); `LogoutUseCase`/`UpdatePasswordUseCase` delete it outright (password change revokes *all* of a user's refresh tokens via `deleteAllByUserId`, logging out every other session).
- **GraphQL context** (`infra/http/graphql/context.ts`) parses `Authorization: Bearer <token>` into `{ userId: string | null }`. It never throws for a missing/invalid token — public mutations (`signUp`, `signIn`) just ignore `userId`. Any resolver that requires a login calls `ensureAuthenticated(context)` first, which throws a `GraphQLError` (code `UNAUTHENTICATED`) if `userId` is null.
- **Ownership pattern** (`updateCategory`, `deleteCategory`, and the same idea applies to `updateUser`/`updatePassword`): the resolver never trusts a client-supplied `userId` — it always comes from `ensureAuthenticated(context)`. Use-cases that operate on an existing record (e.g. `UpdateCategoryUseCase`, `DeleteCategoryUseCase`) fetch the record first and check `record.userId !== userId`; if it doesn't match *or* the record doesn't exist, both cases throw the **same** not-found error (`CategoryNotFoundError`) — deliberately, so a client can't distinguish "doesn't exist" from "belongs to someone else."
- Errors are mapped from domain exceptions to `GraphQLError` with an `extensions.code` inside each resolver's `try/catch` (e.g. `CategoryAlreadyExistsError` → code `CATEGORY_ALREADY_EXISTS`). Uncaught errors are rethrown as-is.
- Category names are unique per user (DB-level `@@unique([userId, name])` in `schema.prisma` + an app-level check via `findByNameAndUserId`, both needed — the DB constraint guards against races, the app check gives a clean error message). When updating, the uniqueness check must exclude the record's own id, same idea as email uniqueness in `UpdateUserUseCase`.
- Money (`Transaction.value`, once that model is implemented) is stored as `Int` in **cents**, not `Float` — a deliberate choice to avoid floating-point rounding errors. Convert to/from a display value at the edges (resolvers/UI), never store fractional currency.
- `Category.color` is typed `string | null` in the domain entity (not `string | undefined`) — a deliberate choice to mirror Prisma's nullable-column convention directly, so repository adapters need no null↔undefined translation layer.

### Input validation

GraphQL's type system only checks shape (`String!` = present and a string), not business rules. Every mutation validates its args with a Zod schema via `validateInput(schema, args)` (throws `BAD_USER_INPUT` on failure) before calling its use-case. Optional args use `.optional()` per-field (not `.partial()` on the whole schema, since most inputs mix required and optional fields).

### Testing convention

Test files are co-located with the code they test (`*.spec.ts` next to the `.ts` file), using Vitest with `beforeEach` to re-create a fresh `sut` (system under test) and its in-memory repositories for every test. Use-cases are tested against the in-memory repositories in `domain/repositories/memory/`, never against the real Prisma/SQLite database — that's the point of depending on repository interfaces instead of Prisma directly. When seeding a repository directly in a test's arrange step, use a real hash (`await hashPassword(...)`) only if the use-case under test actually reads/compares that value (e.g. login, change-password) — otherwise a plain placeholder string is correct and faster, not a shortcut.

Coverage (`pnpm test:coverage`) excludes generated code, spec files, and pure-wiring infra (`infra/http/**`, `infra/database/prisma/**`, `infra/factories/**`, `infra/env/**`, `domain/repositories/memory/**`) — those either need integration tests (not yet set up) or are thin enough that unit coverage on them isn't meaningful.

### Prisma 7 specifics

This project pins a Prisma major version with a few behavior changes worth knowing:

- SQLite requires an explicit driver adapter — `new PrismaClient()` alone doesn't work. See `infra/database/prisma/prisma.ts`, which wires `@prisma/adapter-better-sqlite3` using `env.DATABASE_URL`.
- Config lives in `prisma.config.ts` (schema path, migrations path, datasource url), not implied entirely by `.env`. `.env` is **not** auto-loaded by Node/tsx/Vitest — `infra/env/index.ts` (which every other module reads env vars through) does `import "dotenv/config"` itself, so importing `env` from anywhere loads the `.env` as a side effect.
- A SQLite `file:` URL in `DATABASE_URL` resolves relative to the project root (where the process runs from), not relative to `prisma/schema.prisma` like older Prisma versions.
- The `@prisma/adapter-better-sqlite3` driver returns `DateTime` columns as raw numbers (epoch ms), not `Date` instances — GraphQL's default `String` scalar would otherwise leak `"1783795593234"` instead of an ISO date. Every GraphQL type with a `createdAt` field needs an explicit field resolver using `serialize-date.ts`'s `serializeDate()` (see `authResolvers.User` / `categoryResolvers.Category` for the pattern, and merge it into `server.ts`'s `resolvers` object at the type level, not just `Mutation`).

### Environment variables

`infra/env/index.ts` parses `process.env` through a Zod schema once at import time and exports a typed `env` object; every other module reads env vars through `env`, never `process.env` directly. If you add a new required env var, add it to that schema **and** to `.env.example`.

### tsconfig split

- `tsconfig.json` — base config used by the editor, `tsx`, and Vitest. No `rootDir`, so root-level files like `prisma.config.ts` and `vitest.config.ts` type-check correctly alongside `src/`.
- `tsconfig.build.json` — extends the base, adds `rootDir`/`outDir`/`include: ["src/**/*"]`. Only used by `pnpm build`, to keep the compiled `dist/` limited to actual app code.

Both use the `@/*` → `./src/*` path alias (imports still need the `.js` extension per NodeNext resolution, even though the source files are `.ts` — e.g. `import { env } from "@/infra/env/index.js"`).

`exactOptionalPropertyTypes` is on, which comes up often: a hand-written `field?: T` means "if present, must be exactly `T`, never `undefined`" — but Zod's `.optional()` and object destructuring both naturally produce `T | undefined`. Either widen the type to `field?: T | undefined`, or omit the key entirely with a conditional spread (`...(value !== undefined && { field: value })`) instead of assigning `undefined` to it. Prefer the conditional-spread/omit approach when constructing objects; widen the type only when consuming already-validated data (e.g. use-case request types fed by a Zod schema).

### Linting/formatting

Biome (not ESLint/Prettier) handles both, configured in `biome.json`. `organizeImports` is on, so import order is auto-managed — don't hand-sort imports.
