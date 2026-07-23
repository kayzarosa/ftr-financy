# 💰 Financy

Aplicação fullstack de **gestão de finanças pessoais** — controle de transações e categorias com autenticação, construída como desafio prático da Pós-Graduação FTR (Rocketseat).

Cada usuário tem seu próprio espaço: só enxerga e gerencia as próprias categorias e transações, com um dashboard que resume saldo, receitas, despesas e gastos por categoria.

<p align="center">
  <img src="./.github/assets/demo.gif" alt="Demonstração do Financy — cadastro, criação de categorias e transações e dashboard atualizando em tempo real" width="100%" />
</p>

## ✨ Funcionalidades

- **Autenticação completa** — cadastro, login e logout, com _access token_ (JWT) + _refresh token_ rotativo e revogável.
- **Categorias** — CRUD completo, com ícone e cor personalizados por categoria.
- **Transações** — CRUD completo de receitas e despesas, com listagem **paginada** e filtros por tipo, categoria, busca por descrição e mês.
- **Dashboard** — saldo total, receitas e despesas do mês, transações recentes e gasto agregado por categoria, tudo calculado a partir dos dados reais.
- **Multi-tenant por usuário** — toda query e mutation é escopada ao usuário autenticado; ninguém acessa dado de outra conta.

## 🛠️ Stack

**Backend** — API GraphQL

- TypeScript · [Fastify](https://fastify.dev) · [Apollo Server](https://www.apollographql.com/docs/apollo-server)
- [Prisma 7](https://www.prisma.io) + SQLite (via driver adapter `better-sqlite3`)
- [Zod](https://zod.dev) para validação · [bcryptjs](https://github.com/dcodeIO/bcrypt.js) + JWT para auth
- [Vitest](https://vitest.dev) para testes (unitários + e2e) · [Biome](https://biomejs.dev) para lint/format

**Frontend** — SPA React

- TypeScript · [React 19](https://react.dev) · [Vite 8](https://vite.dev)
- [TailwindCSS v4](https://tailwindcss.com) · [Radix UI](https://www.radix-ui.com) / [Base UI](https://base-ui.com)
- [TanStack Query](https://tanstack.com/query) + [graphql-request](https://github.com/jasonkuhrt/graphql-request) (estado de servidor)
- [React Hook Form](https://react-hook-form.com) + Zod (formulários) · [Zustand](https://zustand-demo.pmnd.rs) (estado de auth persistido)
- [React Router 7](https://reactrouter.com) · [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) + [MSW](https://mswjs.io) · [Playwright](https://playwright.dev) (e2e)

## 📁 Estrutura

```
financy/
├── backend/      # API GraphQL (arquitetura hexagonal / ports & adapters)
└── frontend/     # SPA React (Vite)
```

Os dois lados são **projetos independentes** — cada um com seu próprio `package.json`, lockfile e config de lint/format. Compartilham apenas o repositório.

## 🚀 Como rodar

Pré-requisitos: **Node.js** e **pnpm**.

### 1. Backend

```bash
cd backend
pnpm install
cp .env.example .env          # preencha JWT_SECRET e DATABASE_URL
pnpm exec prisma migrate dev  # cria o banco SQLite e aplica as migrations
pnpm dev                      # sobe a API em http://localhost:3333/graphql
```

### 2. Frontend

```bash
cd frontend
pnpm install
cp .env.example .env          # VITE_BACKEND_URL=http://localhost:3333/graphql
pnpm dev                      # sobe o app em http://localhost:5173
```

> Suba o backend **antes** do frontend, para que as requisições GraphQL tenham a API respondendo.

## 🧪 Testes

```bash
# backend
pnpm test            # unitários (repositórios em memória)
pnpm test:e2e        # e2e com banco real
pnpm test:coverage   # relatório de cobertura

# frontend
pnpm test            # unitários + integração (jsdom + MSW)
pnpm test:e2e        # e2e no navegador (Playwright)
```

## 🏛️ Destaques de arquitetura

- **Backend hexagonal (Ports & Adapters)** — `domain` e `use-cases` nunca importam de `infra`; as dependências apontam sempre para dentro. Cada área de domínio (`auth`, `user`, `category`, `transaction`) segue a mesma fatia vertical: entidade → interface de repositório → use-case → adapter Prisma → resolver GraphQL.
- **Dinheiro em centavos** — `Transaction.value` é `Int` (centavos), nunca `Float`, evitando erros de arredondamento de ponto flutuante. A conversão reais↔centavos acontece só nas bordas.
- **Refresh token stateful** — token opaco persistido e rotacionado a cada uso, permitindo revogação real (logout e troca de senha invalidam sessões).
- **Ownership por usuário** — resolvers nunca confiam em `userId` vindo do cliente; ele sempre vem do token. Registros de outro usuário retornam _not found_ (sem vazar existência).

---

<p align="center">
  Feito com ❤️ by <strong>Kayza</strong> — desafio <strong>Financy</strong> · Pós FTR / Rocketseat
</p>
