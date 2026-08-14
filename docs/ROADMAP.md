# Personal Finance — Roadmap

**Document:** `ROADMAP.md`  
**Version:** 1.0  
**Status:** Living Log  
**Last Updated:** 2026-08-14  
**Product:** Personal Finance  
**Repository:** Advance-Finance-Tracker  
**Purpose:** Define implementation phases and releases  
**Current Phase:** Phase 3 — Core Product (in progress)

---

# 1. Purpose

This document defines committed implementation phases and releases.

It is not a dump of every possible idea. Uncommitted ideas belong in:

```text
docs/IDEAS_BACKLOG.md
```

Product behavior belongs in:

```text
docs/02_PRD.md
docs/03_PRODUCT_SCOPE.md
docs/04_FEATURES.md
docs/product/
```

---

# 2. Current Status

```text
Phase 0 — Product Discovery        Done
Phase 1 — UX Research              Done
Phase 2 — Technical Architecture   Done
Phase 3 — Core Product             Done
Phase 4 — Advanced Finance         Not started
Phase 5 — Intelligence             Not started
Phase 6 — Cloud                    Not started
Phase 7 — Public Release           Not started
```


Release 1 of Phase 3 (local-first financial foundation) is implemented:

```text
Tooling / runnable monorepo
Local SQLite
Onboarding
Accounts
Categories
Transactions
Transfers
Home + basic totals
NestJS GET /health only
```

The mobile app works fully offline. Cloud finance APIs wait for Phase 6.

---

# 3. How to Use This Document

Mark work `[x]` only after it is implemented or the owning document is an approved baseline.

Do not invent new phases here. Align with `docs/DOCS.md`.

New ideas go to `IDEAS_BACKLOG.md` first.

---

# 4. Phase 0 — Product Discovery

- [x] `docs/DOCS.md`
- [x] `docs/01_PROJECT_VISION.md`
- [x] `docs/02_PRD.md`
- [x] `docs/03_PRODUCT_SCOPE.md`
- [x] `docs/04_FEATURES.md`

---

# 5. Phase 1 — UX Research

- [x] `docs/ux/UX_RESEARCH.md`
- [x] `docs/ux/INFORMATION_ARCHITECTURE.md`
- [x] `docs/ux/USER_FLOWS.md`
- [x] `docs/ux/UI_DESIGN.md`
- [x] `docs/ux/DESIGN_SYSTEM.md`

---

# 6. Phase 2 — Technical Architecture

- [x] `docs/architecture/SYSTEM_ARCHITECTURE.md`
- [x] `docs/architecture/DATABASE.md`
- [x] `docs/architecture/LOCAL_STORAGE.md`
- [x] `docs/architecture/SYNC_ARCHITECTURE.md`
- [x] `docs/architecture/API.md`
- [x] `docs/architecture/SECURITY.md`

---

# 7. Phase 3 — Core Product (Done)

Accounts · Categories · Transactions · Transfers · Budgets · Recurring Transactions

## Release 1 — Financial Foundation (local-first)

- [x] Tooling / runnable pnpm monorepo
- [x] Local SQLite schema
- [x] Onboarding (currency + first account)
- [x] Accounts
- [x] Categories
- [x] Transactions (expense / income)
- [x] Transfers
- [x] Home + basic totals
- [x] Shared money types (`packages/types`)
- [x] NestJS health shell
- [x] Lint / typecheck / test / CI

## Release 2 — Budgets & Recurring Transactions Engine

- [x] Budgets (all-expenses & subcategory aggregation)
- [x] Recurring transactions (execution engine, auto-process on load, pause/resume/delete)


---

# 8. Phase 4 — Advanced Finance

- [ ] Lending & borrowing
- [ ] Financial goals
- [ ] Reports
- [ ] Analytics
- [ ] Notifications

Owning specs already exist under `docs/product/`.

---

# 9. Phase 5 — Intelligence

- [ ] Forecasting
- [ ] Financial health
- [ ] Recommendations
- [ ] AI insights
- [ ] AI assistant

AI remains an enhancement layer. Core finance must work without it.

Owning specs exist under `docs/ai/`.

---

# 10. Phase 6 — Cloud

- [ ] Authentication
- [ ] Cloud sync
- [ ] Backup
- [ ] Multi-device support

Until this phase, the NestJS API stays health-only. PostgreSQL is the future cloud source of truth; SQLite remains the local operational store.

---

# 11. Phase 7 — Public Release

- [ ] Testing complete against `TESTING.md`
- [ ] Security audit against `SECURITY.md`
- [ ] Performance against `PERFORMANCE.md`
- [ ] Documentation reconciled
- [ ] CI/CD production path
- [ ] Android release
- [ ] Open-source release

---

# 12. Engineering Documentation

- [x] `docs/engineering/DEVELOPMENT_GUIDELINES.md`
- [x] `docs/engineering/TESTING.md`
- [x] `docs/engineering/PERFORMANCE.md`
- [x] `docs/engineering/DEPLOYMENT.md`
- [x] `docs/DECISION_LOG.md`

---

# 13. Roadmap Rules

```text
Idea            → IDEAS_BACKLOG.md
Committed work  → this file
Behavior        → PRD / FEATURES / product specs
Why             → DECISION_LOG.md
Shipped change  → CHANGELOG.md
```

Do not mark a phase complete because the specification exists. Mark it complete when the software exists, except Phase 0–2 which are documentation phases.

---

# 14. Related Documents

```text
docs/DOCS.md
docs/IDEAS_BACKLOG.md
docs/CHANGELOG.md
docs/DECISION_LOG.md
docs/02_PRD.md
docs/03_PRODUCT_SCOPE.md
docs/04_FEATURES.md
```
