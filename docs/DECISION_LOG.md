# Decision Log

> Records important architectural and product decisions.

| Date | Decision | Choice | Status | Notes |
| ---- | -------- | ------ | ------ | ----- |
| — | Mobile framework | React Native + Expo | Accepted | See DOCS.md §23 |
| — | Backend | NestJS | Accepted | See DOCS.md §23 |
| — | Primary database | PostgreSQL + Prisma | Accepted | See DOCS.md §23 |
| — | Local database | SQLite | Accepted | Offline-first |
| — | Cache / jobs | Redis | Accepted | Not primary financial store |
| — | Repository | Monorepo (pnpm) | Accepted | See DOCS.md §4 |
| 2026-08-14 | SQLite money storage | TEXT decimal string (scale 2) + decimal.js | Accepted | LOCAL_STORAGE.md §9 Option A. Never JS number. Amounts are positive magnitude; direction is type. |
| 2026-08-14 | First implementation track | Mobile local-first; NestJS health only | Accepted | F-002 / Phase 6. No finance APIs until cloud sync. |
