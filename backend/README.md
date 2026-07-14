# Financy — Backend

API GraphQL do Financy, uma aplicação de gestão de finanças pessoais (transações e categorias), desenvolvida como desafio prático da Pós-Graduação da Rocketseat.

Cada usuário cria uma conta, faz login, e só consegue ver/gerenciar as categorias e transações criadas por ele mesmo.

## Stack

- **TypeScript**
- **GraphQL** ([Apollo Server](https://www.apollographql.com/docs/apollo-server/)) + [Fastify](https://fastify.dev/)
- **Prisma** + **SQLite** (via driver adapter `@prisma/adapter-better-sqlite3`)
- **Zod** para validação de entrada
- **Vitest** para testes
- **Biome** para lint/format
- **JWT** (access token) + refresh token opaco persistido no banco, para autenticação

## Arquitetura

O projeto segue **Arquitetura Hexagonal** (Ports & Adapters): a lógica de negócio (`use-cases/`) depende só de interfaces (`domain/repositories/`), nunca de detalhes de infraestrutura como Prisma ou GraphQL. Isso permite testar as regras de negócio com repositórios em memória, sem precisar de banco de dados real.

```
src/
  domain/          # entidades e interfaces de repositório (contratos)
  use-cases/        # regras de negócio, um arquivo por operação
  infra/
    crypto/          # hash de senha, JWT, geração de refresh token
    env/             # validação das variáveis de ambiente (Zod)
    database/prisma/ # client Prisma + implementações concretas dos repositórios
    factories/        # monta cada caso de uso com seus repositórios Prisma
    http/              # servidor Fastify + Apollo, schema e resolvers GraphQL
  generated/prisma/    # client do Prisma (gerado, não editar)
```

Cada domínio (`auth`, `user`, `category`, `transaction`) segue essa mesma organização — se for mexer em algo, procure a pasta correspondente em cada uma dessas camadas.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 11+
- (Opcional) [Docker](https://www.docker.com/) + Docker Compose, se preferir rodar em container

## Como rodar localmente

### 1. Instalar as dependências

```bash
pnpm install
```

### 2. Configurar as variáveis de ambiente

Copia o `.env.example` para `.env`:

```bash
cp .env.example .env
```

Preenche:

```
JWT_SECRET=       # string aleatória e longa — gere com: openssl rand -hex 64
DATABASE_URL=     # ex: file:./dev.db
```

### 3. Gerar o client do Prisma e rodar as migrations

```bash
pnpm exec prisma generate
pnpm exec prisma migrate dev
```

### 4. Subir o servidor

```bash
pnpm dev
```

O servidor sobe em `http://localhost:3333/graphql`. Abrindo essa URL no navegador, aparece o **Apollo Sandbox** — uma interface pra explorar o schema (types, queries, mutations, com descrições) e testar chamadas direto, sem precisar de nenhuma ferramenta externa.

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `pnpm dev` | Sobe o servidor em modo desenvolvimento (recarrega ao salvar) |
| `pnpm build` | Compila o projeto para `dist/` (produção) |
| `pnpm start` | Roda a versão compilada (`dist/`) — use depois do `build` |
| `pnpm lint` | Checa problemas de formatação/estilo |
| `pnpm format` | Corrige formatação automaticamente |
| `pnpm test` | Roda a suíte de testes uma vez |
| `pnpm test:watch` | Roda os testes em modo watch |
| `pnpm test:coverage` | Roda os testes com relatório de cobertura (`coverage/index.html`) |

## Testando a API

Duas formas:

1. **Apollo Sandbox** (navegador) — `http://localhost:3333/graphql`, com o servidor rodando.
2. **Insomnia** — importa o arquivo [`insomnia_export.json`](./insomnia_export.json) (Insomnia → Import Data → From File). Já vem com todas as mutations/queries organizadas por domínio (Auth, User, Category, Transaction) e um Environment pronto — só rodar `signUp`/`signIn`, colar o `accessToken`/`refreshToken` retornados nas variáveis do Environment, e as requests autenticadas já funcionam.

## Rodando com Docker

```bash
docker build -t financy-backend .
docker compose up -d
```

Isso builda a imagem e sobe o container já com `prisma migrate deploy` rodando na inicialização e um volume persistente para o banco SQLite. O `.env` (o mesmo usado localmente) é lido automaticamente pelo `docker-compose.yml`.

## Autenticação

- **Access token**: JWT de vida curta (15 minutos), enviado no header `Authorization: Bearer <token>` em toda requisição autenticada.
- **Refresh token**: string opaca de vida longa (7 dias), salva no banco — permite gerar um novo access token sem precisar logar de novo (`mutation refreshToken`), e pode ser revogada (`mutation logout`, ou automaticamente ao trocar a senha).

## Testes

Os casos de uso são testados com repositórios em memória (sem tocar no banco de verdade), seguindo o mesmo padrão em toda a suíte. Cobertura atual: **100%** nas regras de negócio (`pnpm test:coverage`).
