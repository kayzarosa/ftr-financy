# syntax=docker/dockerfile:1

FROM node:22-slim AS base
WORKDIR /app
RUN corepack enable

# ---- deps: instala todas as dependências (dev + prod), usadas só para o build ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build: gera o client do Prisma e compila o TypeScript ----
# DATABASE_URL/JWT_SECRET aqui são só placeholders para satisfazer a validação
# de env em tempo de build (prisma generate/tsc não conectam de verdade a nada;
# os valores reais entram em runtime via docker-compose).
FROM deps AS build
COPY . .
ENV DATABASE_URL="file:./dev.db"
ENV JWT_SECRET="build-time-placeholder-not-used-at-runtime"
RUN pnpm exec prisma generate
RUN pnpm build

# ---- prod-deps: instala só as dependências de produção (imagem final mais enxuta) ----
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ---- runner: imagem final, só com o necessário para rodar ----
FROM base AS runner
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/package.json ./package.json

EXPOSE 3333

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/infra/http/server.js"]
