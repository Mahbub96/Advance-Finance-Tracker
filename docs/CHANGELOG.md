# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.0.5] - 2026-08-15

- Added native OS-backed mobile date fields with readable display values and ISO `YYYY-MM-DD` storage.
- Added reusable mobile form validation helpers for ISO dates, money, email, and percentage fields.
- Fixed account registration/login response handling and API dependency injection for reliable authentication flows.
- Added Expo app icon configuration and native date picker support.
- Moved financial data deletion into the danger area with final confirmation and a 5-second undo window.
- Fixed All Records deletion to purge local child records before parent records.
- Fixed pull-to-refresh restoring deleted data by publishing sync delete markers before local purge and resolving sync identity from bearer tokens.

- Runnable pnpm monorepo: Expo app, NestJS `/health`, lint/typecheck/test, CI
- Local SQLite schema for settings, accounts, categories, transactions
- P0 local-first flows: onboarding, accounts, categories, expenses, income, transfers
- Decision log expanded to DEC-001–026
- Restored `ROADMAP.md` as the Phase 0–7 implementation plan
- Moved speculative ideas into `IDEAS_BACKLOG.md`
- Replaced duplicated testing content in `PERFORMANCE.md` with a performance spec
- **Feature A — Lending Repayment Email Reminders**: Optional, validated recipient email on lent records, deterministic multi-stage scheduling (7-day before, 3-day before, due date, overdue), polite non-aggressive templates, partial repayment balance tracking, automatic cancellation on full repayment or preference toggle, idempotent deduplicated background dispatch, and mobile in-app email preview.
- **Feature B — Secure Financial Data Deletion**: High-risk financial data deletion engine supporting `CURRENT_MONTH`, `CURRENT_YEAR`, and `ALL_DATA` scopes. Features read-only server previews with exact timezone date boundaries and entity counts, short-lived HMAC confirmation tokens, GitHub-style typed email confirmation challenges, and atomic deletion with sync tombstone propagation.
