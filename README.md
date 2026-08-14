# Personal Finance App

Production-grade, offline-first personal finance platform.

## Stack

| Layer | Choice |
| ----- | ------ |
| Mobile | React Native + Expo (TypeScript, Expo Router) |
| Backend | NestJS |
| Cloud DB | PostgreSQL + Prisma |
| Local DB | SQLite |
| Cache / jobs | Redis |
| Repo | pnpm monorepo |

## Repository

```text
apps/mobile   Expo mobile app (Android-first, offline-first)
apps/api      NestJS API
packages/     Shared types, validation, API client, config
docs/         Product, UX, architecture, AI, engineering docs
infrastructure/
```

## Documentation

Start at [docs/DOCS.md](docs/DOCS.md).

**Phase 0 (current):** product discovery docs — next file is `docs/01_PROJECT_VISION.md`.

## Getting started

```bash
pnpm install
cp .env.example .env
docker compose up -d   # PostgreSQL + Redis
```

App scaffolding lands after Phase 0–2 documentation is complete.

## License

See [LICENSE](LICENSE).
