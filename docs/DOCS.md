# Personal Finance App — Documentation & Project Guide

> Central documentation index, project structure, architectural direction, development workflow, and documentation governance for the application.

---

## 1. Project Overview

This project is a production-grade, open-source personal finance application designed to make financial tracking **fast, intelligent, explainable, and effortless**.

The application is not intended to be a basic expense tracker.

It is designed as a complete personal financial management platform supporting:

- Income tracking
- Expense tracking
- Transfers
- Multiple accounts/wallets
- Categories and subcategories
- Budgets
- Budget alerts
- Recurring transactions
- Bills and subscriptions
- Lending and borrowing
- Repayment tracking
- Reminder and email notifications
- Financial goals
- Savings planning
- Financial reports
- Advanced analytics
- Spending trends
- Forecasting
- Financial health analysis
- What-if simulations
- Data export
- Backup and restore
- Offline-first usage
- Future cloud synchronization
- AI-powered insights
- AI-powered recommendations
- Future conversational financial assistant

The application should remain useful without AI.

AI is an enhancement layer, not a dependency of the core financial system.

---

# 2. Product Principles

The following principles govern the entire project.

## 2.1 Frictionless Input

Financial data must be extremely easy to enter.

The user should be able to record a normal transaction within seconds.

Every unnecessary:

- tap
- field
- screen
- confirmation
- typing requirement

should be considered UX friction.

---

## 2.2 Offline First

The core application must work without an internet connection.

Transactions should be stored locally first.

Cloud synchronization should be an additional capability rather than a requirement for basic usage.

---

## 2.3 Privacy First

Financial data is highly sensitive.

The architecture must minimize unnecessary transmission of financial information.

AI providers must never receive raw financial data unless explicitly required and permitted.

---

## 2.4 Deterministic Financial Calculations

Financial calculations must not depend on an LLM.

Examples:

- balances
- totals
- budgets
- percentages
- cash flow
- repayment amounts
- savings rates

must be calculated deterministically.

AI may explain or interpret those results.

---

## 2.5 AI as an Intelligence Layer

AI should operate on structured financial insights rather than blindly receiving raw transaction history.

Example:

```text
Application
    ↓
Transaction Data
    ↓
Financial Analytics Engine
    ↓
Structured Metrics
    ↓
Forecasting / Rules
    ↓
AI Interpretation
    ↓
User-Friendly Insight
```

---

## 2.6 Production Quality From Day One

The project should not be built as a prototype that is later rewritten.

The initial implementation should consider:

- scalability
- maintainability
- security
- testing
- observability
- migrations
- error handling
- performance
- accessibility
- internationalization
- data integrity
- backup
- future synchronization

---

# 3. Technology Stack

## 3.1 Mobile Application

```text
React Native
Expo
TypeScript
Expo Router
```

The mobile application is Android-first.

iOS support should remain possible without requiring a separate application architecture.

---

## 3.2 Backend

### Selected Backend: NestJS

```text
NestJS
TypeScript
Node.js
```

NestJS is preferred over FastAPI for this project.

### Reasons

- Same language across mobile and backend
- Strong modular architecture
- Dependency injection
- Excellent TypeScript support
- Strong ecosystem
- Guards and authorization
- Validation
- Background processing
- WebSocket support if required
- Easy integration with PostgreSQL
- Easy integration with Redis
- Easier shared types and contracts
- Suitable for a large modular backend

---

## 3.3 Database

Primary database:

```text
PostgreSQL
```

ORM:

```text
Prisma
```

PostgreSQL is the source of truth for synchronized/cloud data.

---

## 3.4 Local Database

```text
SQLite
```

The mobile application should use SQLite for persistent offline data.

The application architecture should isolate database access behind repositories so the UI does not directly depend on SQLite implementation details.

---

## 3.5 Cache and Background Jobs

```text
Redis
```

Potential uses:

- caching
- job queues
- scheduled jobs
- notification processing
- email processing
- AI task processing
- rate limiting
- temporary state

Redis should not be used as the primary financial data store.

---

## 3.6 AI / ML

The AI architecture should use a provider abstraction.

Possible providers may include:

```text
NVIDIA NIM
OpenAI-compatible APIs
Local LLMs
Other future providers
```

The application should never be tightly coupled to a single AI provider.

For genuine ML workloads, a future Python service may be introduced:

```text
NestJS
   │
   └── ML Service
          │
          └── Python
```

This should only happen when the ML workload justifies it.

---

## 3.7 Infrastructure

Production deployment should be containerized.

```text
Docker
Docker Compose
PostgreSQL
Redis
NestJS
```

The infrastructure should remain compatible with future:

- Kubernetes
- managed PostgreSQL
- managed Redis
- cloud object storage
- CI/CD

without requiring architectural redesign.

---

# 4. Repository Structure

The repository should use a monorepo architecture.

```text
personal-finance/
│
├── apps/
│   │
│   ├── mobile/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── store/
│   │   ├── database/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   ├── config/
│   │   ├── tests/
│   │   ├── app.json
│   │   ├── eas.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/
│       ├── src/
│       │   ├── common/
│       │   ├── config/
│       │   ├── database/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── accounts/
│       │   ├── transactions/
│       │   ├── categories/
│       │   ├── budgets/
│       │   ├── recurring/
│       │   ├── lending/
│       │   ├── goals/
│       │   ├── reports/
│       │   ├── notifications/
│       │   ├── analytics/
│       │   ├── forecasting/
│       │   ├── ai/
│       │   ├── sync/
│       │   ├── files/
│       │   ├── health/
│       │   ├── app.module.ts
│       │   └── main.ts
│       │
│       ├── test/
│       ├── prisma/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   │
│   ├── types/
│   ├── validation/
│   ├── api-client/
│   ├── config/
│   └── eslint-config/
│
├── docs/
│   ├── DOCS.md
│   │
│   ├── 01_PROJECT_VISION.md
│   ├── 02_PRD.md
│   ├── 03_PRODUCT_SCOPE.md
│   ├── 04_FEATURES.md
│   │
│   ├── ux/
│   │   ├── UX_RESEARCH.md
│   │   ├── INFORMATION_ARCHITECTURE.md
│   │   ├── USER_FLOWS.md
│   │   ├── UI_DESIGN.md
│   │   └── DESIGN_SYSTEM.md
│   │
│   ├── architecture/
│   │   ├── SYSTEM_ARCHITECTURE.md
│   │   ├── DATABASE.md
│   │   ├── LOCAL_STORAGE.md
│   │   ├── SYNC_ARCHITECTURE.md
│   │   ├── API.md
│   │   └── SECURITY.md
│   │
│   ├── ai/
│   │   ├── AI.md
│   │   ├── AI_INSIGHTS.md
│   │   ├── AI_FORECASTING.md
│   │   └── AI_ASSISTANT.md
│   │
│   ├── product/
│   │   ├── BUDGETING.md
│   │   ├── LENDING_BORROWING.md
│   │   ├── FINANCIAL_GOALS.md
│   │   ├── REPORTING.md
│   │   ├── NOTIFICATIONS.md
│   │   ├── RECURRING_TRANSACTIONS.md
│   │   └── MEDIA_FILES.md
│   │
│   ├── engineering/
│   │   ├── DEVELOPMENT_GUIDELINES.md
│   │   ├── TESTING.md
│   │   ├── PERFORMANCE.md
│   │   └── DEPLOYMENT.md
│   │
│   ├── DECISION_LOG.md
│   ├── IDEAS_BACKLOG.md
│   ├── ROADMAP.md
│   └── CHANGELOG.md
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   ├── scripts/
│   └── monitoring/
│
├── .github/
│   └── workflows/
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── README.md
└── LICENSE
```

This structure is a target architecture.

Directories should only be created when their corresponding functionality is actually introduced.

---

# 5. Mobile Architecture

The mobile application should be feature-oriented.

Example:

```text
apps/mobile/features/

transactions/
├── components/
├── hooks/
├── screens/
├── services/
├── types/
└── utils/

budgets/
├── components/
├── hooks/
├── screens/
├── services/
└── types/

lending/
├── components/
├── hooks/
├── screens/
├── services/
└── types/
```

Shared functionality belongs outside feature modules.

This prevents the application from becoming a large collection of unrelated global files.

---

# 6. Backend Architecture

NestJS should follow a modular architecture.

Example:

```text
apps/api/src/transactions/

transactions.module.ts
transactions.controller.ts
transactions.service.ts
transactions.repository.ts
transactions.dto.ts
transactions.mapper.ts
transactions.types.ts
```

A module owns its business logic.

Controllers should remain thin.

Business logic belongs in services/domain layers.

Database access should not be scattered across controllers.

---

# 7. Financial Domain Architecture

Financial operations should be treated as domain operations rather than simple CRUD.

For example:

```text
Transaction
├── Income
├── Expense
└── Transfer
```

Transfers must not incorrectly appear as income or expenses.

Similarly:

```text
Lending
├── Lent
├── Repayment
└── Outstanding Balance
```

and:

```text
Borrowing
├── Borrowed
├── Repayment
└── Outstanding Liability
```

The domain model must preserve financial correctness before UI convenience.

---

# 8. Analytics Architecture

Analytics should be separated from transaction CRUD.

```text
Transactions
     ↓
Financial Aggregation
     ↓
Analytics Engine
     ↓
Metrics
     ↓
Forecasting
     ↓
Rules Engine
     ↓
AI Interpretation
```

Examples of deterministic metrics:

- Monthly spending
- Daily spending rate
- Savings rate
- Category distribution
- Budget utilization
- Cash flow
- Outstanding lending
- Outstanding borrowing
- Recurring commitments
- Financial goal progress

---

# 9. AI Architecture

AI should never directly control financial calculations.

```text
Financial Database
       ↓
Analytics Engine
       ↓
Structured Financial Context
       ↓
AI Provider
       ↓
Insight
       ↓
Validation
       ↓
User
```

AI output must be treated as a recommendation or explanation.

Critical financial numbers should always originate from deterministic application logic.

---

# 10. Documentation Structure

Documentation is organized into the following areas:

```text
docs/
│
├── Product
├── UX
├── Architecture
├── AI
├── Product Modules
├── Engineering
└── Project Management
```

Each document has a single responsibility.

---

# 11. Core Documentation

## `01_PROJECT_VISION.md`

Defines:

- Why the product exists
- Long-term vision
- Product philosophy
- Problems being solved
- Target users
- Differentiation
- Core principles
- Success criteria

---

## `02_PRD.md`

Defines:

- Functional requirements
- Non-functional requirements
- Product modules
- User requirements
- Business rules
- Acceptance criteria
- Product behavior
- Release scope

This is the primary product requirements document.

---

## `03_PRODUCT_SCOPE.md`

Defines:

- Current scope
- Future scope
- Out-of-scope functionality
- Deferred functionality
- Release boundaries

---

## `04_FEATURES.md`

Defines the complete feature inventory and status.

---

# 12. UX Documentation

### `UX_RESEARCH.md`

Researches:

- Competitors
- User behavior
- Input friction
- Navigation
- Mobile ergonomics
- Usability
- Accessibility

### `INFORMATION_ARCHITECTURE.md`

Defines:

- Navigation
- Tabs
- Screen hierarchy
- Feature grouping

### `USER_FLOWS.md`

Defines important user journeys.

### `UI_DESIGN.md`

Defines actual screen composition and interaction behavior.

### `DESIGN_SYSTEM.md`

Defines reusable visual and interaction standards.

---

# 13. Architecture Documentation

### `SYSTEM_ARCHITECTURE.md`

Overall technical architecture.

### `DATABASE.md`

PostgreSQL data model.

### `LOCAL_STORAGE.md`

SQLite and offline-first architecture.

### `SYNC_ARCHITECTURE.md`

Future synchronization architecture.

### `API.md`

Backend API contract.

### `SECURITY.md`

Security and privacy architecture.

---

# 14. AI Documentation

### `AI.md`

Overall AI strategy.

### `AI_INSIGHTS.md`

AI-powered insights and recommendations.

### `AI_FORECASTING.md`

Forecasting and statistical/ML models.

### `AI_ASSISTANT.md`

Future conversational assistant.

---

# 15. Product Module Documentation

```text
BUDGETING.md
LENDING_BORROWING.md
FINANCIAL_GOALS.md
REPORTING.md
NOTIFICATIONS.md
RECURRING_TRANSACTIONS.md
MEDIA_FILES.md
```

Each document defines the complete behavior of its respective module.

---

# 16. Engineering Documentation

```text
DEVELOPMENT_GUIDELINES.md
TESTING.md
PERFORMANCE.md
DEPLOYMENT.md
```

These documents define engineering standards.

---

# 17. Project Management Documentation

## `DECISION_LOG.md`

Records important architectural and product decisions.

## `IDEAS_BACKLOG.md`

Contains ideas that have not yet become requirements.

## `ROADMAP.md`

Defines implementation phases and releases.

## `CHANGELOG.md`

Contains released changes.

---

# 18. Documentation Lifecycle

Every major feature should follow:

```text
Idea
 ↓
IDEAS_BACKLOG
 ↓
Product Evaluation
 ↓
PRD / FEATURES
 ↓
UX Research
 ↓
Information Architecture
 ↓
User Flow
 ↓
UI Design
 ↓
Architecture
 ↓
Implementation
 ↓
Testing
 ↓
Release
 ↓
CHANGELOG
```

---

# 19. Authority Hierarchy

When documents conflict:

```text
PROJECT_VISION
      ↓
PRD
      ↓
PRODUCT_SCOPE
      ↓
FEATURES
      ↓
UX
      ↓
ARCHITECTURE
      ↓
IMPLEMENTATION
```

A conflict must be resolved by updating the appropriate authoritative document.

Implementation must not silently redefine product requirements.

---

# 20. Development Rules

The project follows these rules:

1. Do not implement major functionality without requirements.
2. Do not put business logic inside UI components.
3. Do not put database logic inside controllers.
4. Do not use AI for deterministic financial calculations.
5. Do not send unnecessary financial data to external AI services.
6. Do not sacrifice data integrity for UI convenience.
7. Do not introduce dependencies without justification.
8. Do not duplicate business logic between mobile and backend unnecessarily.
9. Do not create abstractions without a real architectural purpose.
10. Do not allow documentation and implementation to drift.
11. Every significant architectural decision must be documented.
12. Every production feature must have appropriate tests.
13. Security and privacy must be considered before release.
14. Offline behavior must be considered for core financial operations.
15. Performance must be considered for large datasets.

---

# 21. Production Readiness Requirements

Before a feature can be considered production-ready, it should satisfy the applicable requirements:

```text
[ ] Functional requirements implemented
[ ] UX reviewed
[ ] Error states handled
[ ] Loading states handled
[ ] Empty states handled
[ ] Offline behavior handled
[ ] Validation implemented
[ ] Security reviewed
[ ] Data integrity verified
[ ] Unit tests implemented
[ ] Integration tests implemented where required
[ ] E2E tests implemented where required
[ ] Performance reviewed
[ ] Accessibility reviewed
[ ] Analytics/logging considered
[ ] Documentation updated
```

---

# 22. Recommended Implementation Order

## Phase 0 — Product Discovery

```text
DOCS.md
01_PROJECT_VISION.md
02_PRD.md
03_PRODUCT_SCOPE.md
04_FEATURES.md
```

## Phase 1 — UX Research

```text
UX_RESEARCH.md
INFORMATION_ARCHITECTURE.md
USER_FLOWS.md
UI_DESIGN.md
DESIGN_SYSTEM.md
```

## Phase 2 — Technical Architecture

```text
SYSTEM_ARCHITECTURE.md
DATABASE.md
LOCAL_STORAGE.md
SYNC_ARCHITECTURE.md
API.md
SECURITY.md
```

## Phase 3 — Core Product

```text
Accounts
Categories
Transactions
Transfers
Budgets
Recurring Transactions
```

## Phase 4 — Advanced Finance

```text
Lending & Borrowing
Financial Goals
Reports
Analytics
Notifications
```

## Phase 5 — Intelligence

```text
Forecasting
Financial Health
Recommendations
AI Insights
AI Assistant
```

## Phase 6 — Cloud

```text
Authentication
Cloud Sync
Backup
Multi-device support
```

## Phase 7 — Public Release

```text
Testing
Security Audit
Performance Optimization
Documentation
CI/CD
Android Release
Open-source Release
```

---

# 23. Current Architectural Decisions

| Decision           | Choice                        | Status                    |
| ------------------ | ----------------------------- | ------------------------- |
| Mobile framework   | React Native + Expo           | Accepted                  |
| Language           | TypeScript                    | Accepted                  |
| Mobile navigation  | Expo Router                   | Accepted                  |
| Backend            | NestJS                        | Accepted                  |
| Backend language   | TypeScript                    | Accepted                  |
| Primary database   | PostgreSQL                    | Accepted                  |
| ORM                | Prisma                        | Accepted                  |
| Local database     | SQLite                        | Accepted                  |
| Cache / jobs       | Redis                         | Accepted                  |
| API style          | REST initially                | Accepted                  |
| AI architecture    | Provider abstraction          | Accepted                  |
| ML architecture    | Python service when justified | Planned                   |
| Architecture style | Modular / feature-oriented    | Accepted                  |
| Mobile strategy    | Offline-first                 | Accepted                  |
| Platform priority  | Android                       | Accepted                  |
| Future platform    | iOS                           | Supported architecturally |
| Repository         | Monorepo                      | Accepted                  |
| Containerization   | Docker                        | Accepted                  |

---

# 24. Next Document

The next document is:

```text
01_PROJECT_VISION.md
```

It should be written before the detailed PRD.

It will define the product at a deeper level:

- What we are building
- Why we are building it
- Who it is for
- The problems it solves
- Product philosophy
- Core UX philosophy
- Financial intelligence philosophy
- Privacy philosophy
- AI philosophy
- Long-term vision
- Product differentiation
- Success criteria
- Non-negotiable principles

This document becomes the foundation for everything that follows.
