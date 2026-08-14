# Personal Finance App

Production-grade, offline-first personal finance platform.

## Stack

| Layer        | Choice                                        |
| ------------ | --------------------------------------------- |
| Mobile       | React Native + Expo (TypeScript, Expo Router) |
| Backend      | NestJS                                        |
| Cloud DB     | PostgreSQL + Prisma (Phase 6)                 |
| Local DB     | SQLite                                        |
| Cache / jobs | Redis                                         |
| Repo         | pnpm monorepo                                 |

## Repository

```text
apps/mobile   Expo mobile app (Android-first, offline-first)
apps/api      NestJS API (health shell until Phase 6)
packages/     Shared types, validation, API client, config
docs/         Product, UX, architecture, AI, engineering docs
```

## Documentation

Start at [docs/DOCS.md](docs/DOCS.md).

**Current:** Phase 3 — local-first financial foundation (accounts, categories, transactions, transfers).

## Getting started

```bash
pnpm install
cp .env.example .env
docker compose up -d   # PostgreSQL + Redis (API later)

pnpm dev:mobile        # Expo
pnpm dev:api           # NestJS GET /health

pnpm lint
pnpm typecheck
pnpm test
```

The mobile app works fully offline. Cloud sync is Phase 6.

## License

See [LICENSE](LICENSE).
