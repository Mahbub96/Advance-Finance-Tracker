# 💎 Advance Finance Tracker — Offline-First Personal Finance & Wealth Management

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Expo React Native](https://img.shields.io/badge/Expo-52.0-000000.svg?logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E.svg?logo=nestjs)](https://nestjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Offline--First-003B57.svg?logo=sqlite)](https://www.sqlite.org/)

**Advance Finance Tracker** is a state-of-the-art, **offline-first personal finance and wealth management application** engineered for total privacy, instant performance, and multi-device synchronization. Take 100% control of your ledger with local SQLite storage, cryptographic security, and seamless multi-device cloud synchronization.

---

## 🌟 Why Install Advance Finance Tracker?

Traditional personal finance apps store your private net worth data exclusively in cloud silos, forcing you to depend on servers, tolerate slow load times, and risk data exposure. **Advance Finance Tracker** flips this model:

- 🔒 **100% Data Sovereignty**: Your financial records reside primary on your phone inside an embedded SQLite database. Works flawlessly without internet access.
- ⚡ **Zero-Latency Performance**: Operations happen instantaneously on-device. No waiting for API spinners.
- 🔄 **Bidirectional Cloud Sync**: Seamlessly sync changes across multiple smartphones with offline change queuing and soft-delete tombstone propagation.
- 🗑️ **True Soft-Delete & Privacy Guarantee**: Data deletions are never silently overwritten or resurrected by cloud sync. Soft-delete markers ensure absolute scope control across local and remote PostgreSQL databases.
- 🧠 **AI-Powered Financial Intelligence**: Embedded predictive forecasting, cash flow analysis, and budget health alerts calculated locally.

---

## 🔥 Key Features

### 🏦 Multi-Account & Multi-Currency Management
- Track Bank Accounts, Cash Wallets, Credit Cards, and Savings Buckets.
- Native multi-currency support with dynamic precision math (never floating-point errors).
- Single-tap Account Archiving and Permanent Soft-Deletion with automatic activity cascading.

### 💸 Income & Expense Ledger
- Fast transaction entry with intelligent category matching and merchant auto-complete.
- Support for complex transfer legs between accounts (e.g. Bank to Cash).
- Flexible recurring rules with automated transaction generation.

### 🎯 Budgets & Financial Goals
- Create monthly or custom budget caps per category with visual progress indicators.
- Set targeted saving goals (e.g., Emergency Fund, Vacation) with contribution tracking.

### 🤝 Debt & Loan Tracking (Lending / Borrowing)
- Track money lent to friends or borrowed from creditors.
- Automated payment reminders and email preview triggers.

### 🛡️ Complete Data Control & Deletion
- **Granular Scoped Deletions**: Soft-delete records for Current Month, Current Year, or All-Time.
- **Tombstone Sync**: Deletions update `deleted_at` timestamps locally and propagate to cloud PostgreSQL, preventing unwanted data restoration upon synchronization.
- **Account Self-Deletion**: Instantly soft-delete any account along with all associated transaction records.

---

## 🔑 Quick Start & Default Credentials

Launch the app instantly with pre-configured offline-first credentials:

| Setting | Value |
| ------- | ----- |
| **Default Email** | `user@mahbub.dev` |
| **Default Password** | `user@1230` |
| **Offline Mode** | Fully supported without server connectivity |

*(You can also register a custom account for cloud sync)*

---

## 🏗️ Architecture & Technology Stack

Built as a high-performance **pnpm monorepo**:

```text
Advance-Finance-Tracker/
├── apps/
│   ├── mobile/         # Expo React Native App (iOS & Android)
│   └── api/            # NestJS Backend API & Sync Engine
├── packages/
│   ├── types/          # Shared TypeScript Interfaces & Models
│   ├── validation/     # Zod Schemas for Data Integrity
│   ├── api-client/     # Typed HTTP Client for Sync
│   └── config/         # Shared App Environment Constants
└── docs/               # Architecture, UX, & Engineering Specifications
```

### Technology Matrix

| Layer | Framework / Library |
| ----- | ------------------- |
| **Mobile Client** | React Native 0.76 + Expo SDK 52 (TypeScript, Expo Router) |
| **Local Database** | Embedded SQLite (`expo-sqlite`) with schema migrations |
| **Backend API** | NestJS 11 + Prisma ORM |
| **Cloud Database** | PostgreSQL 16 + Redis Cache |
| **Monorepo Manager** | pnpm 9.15 workspaces |

---

## 🚀 Development Setup

### Prerequisites
- **Node.js**: 20+
- **pnpm**: 9.15.0+
- **Docker**: (Optional, for running cloud PostgreSQL & Redis)

### Installation Commands

```bash
# 1. Clone the repository
git clone https://github.com/Mahbub96/Advance-Finance-Tracker.git
cd Advance-Finance-Tracker

# 2. Install workspace dependencies
pnpm install

# 3. Create local environment configuration
cp .env.example .env

# 4. Start local development servers
pnpm dev:mobile   # Starts Expo Dev Server for Android/iOS
pnpm dev:api      # Starts NestJS API in watch mode

# 5. Run Quality Checks
pnpm lint         # Run ESLint across monorepo
pnpm typecheck    # Run TypeScript validation
pnpm test         # Run Jest test suites
```

---

## 🔒 Security & Data Privacy

1. **Local Encryption & Storage**: All financial records are written to phone-local SQLite storage using strict parameterized queries.
2. **Deterministic Money Operations**: All monetary totals use integer/scaled-decimal string math (`MoneyString`), preventing float rounding inaccuracies.
3. **No Unsolicited Tracking**: Zero telemetry or third-party ad tracking. Your financial habits stay entirely private.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<p align="center">
  Built with ❤️ for privacy, accuracy, and financial sovereignty.
</p>
