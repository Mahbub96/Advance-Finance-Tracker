# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm TypeScript monorepo for an offline-first personal finance app. `apps/mobile` contains the Expo React Native app, with route files in `app/`, reusable UI in `src/components`, local data access in `src/database` and `src/repositories`, and feature logic under `src/features`. `apps/api` contains the NestJS API, currently centered on `src/main.ts`, `src/app.module.ts`, config, and health checks. Shared workspace packages live in `packages/`: `types`, `validation`, `api-client`, `config`, and `eslint-config`. Product, architecture, UX, AI, and engineering references are in `docs/`; start with `docs/DOCS.md`.

## Build, Test, and Development Commands

Use Node 20+ and pnpm 9.15.0.

- `pnpm install`: install all workspace dependencies.
- `cp .env.example .env`: create local environment settings.
- `docker compose up -d`: start PostgreSQL and Redis for later API phases.
- `pnpm dev:mobile`: start Expo for the mobile app.
- `pnpm dev:api`: run the NestJS API in watch mode.
- `pnpm lint`: run ESLint across workspaces.
- `pnpm typecheck`: run TypeScript checks across workspaces.
- `pnpm test`: run all Jest tests.
- `pnpm format`: format the repository with Prettier.

## Coding Style & Naming Conventions

Write TypeScript throughout. Follow the existing two-space indentation and Prettier formatting. ESLint uses `@eslint/js` and `typescript-eslint` recommended rules, with `no-explicit-any` enabled and unused arguments allowed only when prefixed with `_`. Prefer feature-oriented names such as `transaction-service.ts`, `AccountForm.tsx`, and `health.controller.spec.ts`. Keep application-specific behavior inside `apps/*`; only move stable, reusable contracts or utilities into `packages/*`.

## Testing Guidelines

Jest with `ts-jest` is the current test runner. API tests use `*.spec.ts` under `apps/api/src`; mobile and shared type tests use `*.test.ts` under `src`. Prioritize deterministic unit and domain tests for money, balances, transactions, offline behavior, and data integrity. Run `pnpm test`, plus `pnpm lint` and `pnpm typecheck`, before opening a PR.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit style, for example `feat: add local-first finance foundation` and `chore: bootstrap finance tracker monorepo`. Keep commits focused and use prefixes such as `feat:`, `fix:`, `chore:`, or `docs:`. Pull requests should describe the change, list verification commands, link any related issue or decision record, and include screenshots for mobile UI changes. Note any schema, environment, or Docker changes explicitly.

## Security & Configuration Tips

Do not commit secrets or local database files. Use `.env.example` as the template for required variables. Treat financial correctness as the priority: avoid floating-point money calculations unless a shared domain utility already handles precision.
