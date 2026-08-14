# Personal Finance — Decision Log

**Document:** `DECISION_LOG.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-14  
**Product:** Personal Finance  
**Repository:** Advance-Finance-Tracker  
**Purpose:** Record why significant decisions were made

---

# 1. Purpose

This document records important architectural, technical, product, UX, and operational decisions that affect the long-term direction of the project.

The purpose is to document **why** a decision was made, not to repeat implementation details already defined elsewhere.

> **Record the decision. Keep the specification in the owning document.**

---

# 2. Decision Format

Each significant decision should record:

```text
ID
Title
Date
Status
Context
Decision
Rationale
Consequences
Related Documents
```

Status values:

```text
Proposed
Accepted
Superseded
Deprecated
```

---

# 3. Decision Index

| ID      | Decision                                                 | Status   |
| ------- | -------------------------------------------------------- | -------- |
| DEC-001 | React Native + Expo                                      | Accepted |
| DEC-002 | NestJS Backend                                           | Accepted |
| DEC-003 | PostgreSQL as Primary Cloud Database                     | Accepted |
| DEC-004 | Prisma ORM                                               | Accepted |
| DEC-005 | SQLite for Mobile Local Storage                          | Accepted |
| DEC-006 | Offline-First Mobile Architecture                        | Accepted |
| DEC-007 | PostgreSQL Is the Cloud Source of Truth                  | Accepted |
| DEC-008 | Transactions Are the Core Financial Ledger               | Accepted |
| DEC-009 | Transfers Are Not Income or Expense                      | Accepted |
| DEC-010 | Financial Values Must Use Decimal-Safe Representation    | Accepted |
| DEC-011 | AI Is Not the Source of Financial Truth                  | Accepted |
| DEC-012 | AI Provider Must Be Replaceable                          | Accepted |
| DEC-013 | AI Write Operations Require User Confirmation            | Accepted |
| DEC-014 | Product Documentation Is the Engineering Source of Truth | Accepted |
| DEC-015 | Living Logs Remain Lightweight                           | Accepted |
| DEC-016 | Product Modules Are Domain-Oriented                      | Accepted |
| DEC-017 | Reports and Analytics Must Be Explainable                | Accepted |
| DEC-018 | Forecasts Must Be Clearly Distinguished From Actuals     | Accepted |
| DEC-019 | Use the Simplest Forecast Model That Works               | Accepted |
| DEC-020 | File Storage Uses Object Storage                         | Accepted |
| DEC-021 | Financial Files Are Private by Default                   | Accepted |
| DEC-022 | Notifications Are Event-Driven                           | Accepted |
| DEC-023 | Background Jobs Must Be Idempotent                       | Accepted |
| DEC-024 | Core Financial Features Must Not Depend on AI            | Accepted |
| DEC-025 | Production Deployments Must Be Reproducible              | Accepted |
| DEC-026 | Database Migrations Must Be Controlled                   | Accepted |

---

# 4. DEC-001 — React Native + Expo

**Date:** 2026-08-14  
**Status:** Accepted

### Context

The application is initially intended for Android while keeping the option to support iOS in the future.

### Decision

Use:

```text
React Native
+
Expo
+
TypeScript
```

for the mobile application.

### Rationale

```text
Android-first development is straightforward.
Expo reduces native setup and maintenance overhead.
React Native provides a path toward future iOS support.
TypeScript improves maintainability and type safety.
The architecture is suitable for an offline-first mobile application.
```

### Consequences

The project should remain compatible with the supported Expo ecosystem and avoid unnecessary native dependencies.

### Related Documents

- `docs/DOCS.md`
- `docs/architecture/SYSTEM_ARCHITECTURE.md`

---

# 5. DEC-002 — NestJS Backend

**Date:** 2026-08-14  
**Status:** Accepted

### Context

The application requires a scalable API capable of supporting authentication, financial domains, synchronization, reporting, background jobs, AI, and future integrations.

### Decision

Use:

```text
NestJS
+
TypeScript
```

for the backend.

### Rationale

```text
Strong module architecture.
TypeScript consistency with the mobile and shared packages.
Good support for dependency injection.
Suitable for REST APIs and background services.
Good fit for a modular monorepo.
Allows the application to grow without introducing multiple primary backend languages prematurely.
```

### Consequences

Backend modules should follow clear domain boundaries and application-service patterns.

### Related Documents

- `docs/architecture/SYSTEM_ARCHITECTURE.md`
- `docs/architecture/API.md`
- `docs/engineering/DEVELOPMENT_GUIDELINES.md`

---

# 6. DEC-003 — PostgreSQL as Primary Cloud Database

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Use PostgreSQL as the authoritative cloud database.

### Rationale

The application requires:

```text
Strong consistency
Transactions
Financial precision
Relational integrity
Indexes
Complex reporting
Aggregation
Concurrent writes
```

PostgreSQL is therefore a better fit than a document-oriented database for the core financial ledger.

### Consequences

Financial source data must remain relationally consistent and transactional.

### Related Documents

- `docs/architecture/DATABASE.md`

---

# 7. DEC-004 — Prisma ORM

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Use Prisma for application-level PostgreSQL access.

### Rationale

```text
Strong TypeScript integration.
Explicit schema.
Migration support.
Developer productivity.
Good fit for the NestJS backend.
```

### Consequences

Complex or performance-critical queries may still use optimized SQL where justified.

### Related Documents

- `docs/architecture/DATABASE.md`
- `docs/engineering/DEVELOPMENT_GUIDELINES.md`

---

# 8. DEC-005 — SQLite for Mobile Local Storage

**Date:** 2026-08-14  
**Status:** Accepted

### Context

The application must be useful without an internet connection.

### Decision

Use SQLite as the mobile local database.

### Rationale

SQLite provides:

```text
Reliable local persistence
Transactional writes
Indexing
Structured queries
Offline-first capability
Good fit for financial records
```

### Consequences

The mobile application must use a repository/data-access abstraction so local persistence remains replaceable.

### Related Documents

- `docs/architecture/LOCAL_STORAGE.md`

---

# 9. DEC-006 — Offline-First Mobile Architecture

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Normal financial operations should work locally first.

Preferred flow:

```text
User Action
    ↓
Local Database
    ↓
Immediate UI Update
    ↓
Sync Queue
    ↓
Cloud Synchronization
```

### Rationale

Financial tracking must remain usable when the user has:

```text
No Internet
Poor Internet
Intermittent Connectivity
```

Data entry should not depend on network availability.

### Consequences

Every synchronizable entity requires:

```text
Stable ID
Version
Sync State
Conflict Strategy
Deletion / Tombstone Strategy
```

### Related Documents

- `docs/architecture/LOCAL_STORAGE.md`
- `docs/architecture/SYNC_ARCHITECTURE.md`

---

# 10. DEC-007 — PostgreSQL Is the Cloud Source of Truth

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

PostgreSQL is the authoritative server-side financial source.

SQLite is the mobile operational store.

### Rationale

This provides a clear hierarchy:

```text
Mobile Local State
        ↓
Synchronization
        ↓
Cloud Authoritative State
```

### Consequences

Local data may temporarily differ from the server during offline operation, but synchronization must eventually reconcile the state.

### Related Documents

- `docs/architecture/DATABASE.md`
- `docs/architecture/SYNC_ARCHITECTURE.md`

---

# 11. DEC-008 — Transactions Are the Core Financial Ledger

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Transactions are the primary source for actual financial activity.

Accounts, budgets, reports, analytics, and other derived systems should ultimately depend on valid transaction/account state.

### Rationale

This makes financial information:

```text
Traceable
Reproducible
Auditable
Explainable
```

### Consequences

Derived values such as balances and report totals must be rebuildable from authoritative source data.

### Related Documents

- `docs/architecture/DATABASE.md`
- `docs/product/REPORTING.md`
- `docs/product/BUDGETING.md`

---

# 12. DEC-009 — Transfers Are Not Income or Expense

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Moving money between accounts owned by the same user is represented as a transfer.

Transfers must not normally affect:

```text
Income
Expenses
Savings
```

### Rationale

Otherwise moving:

```text
Bank → bKash
```

would incorrectly appear to create income or spending.

### Consequences

Transfer operations must be atomic.

### Related Documents

- `docs/architecture/DATABASE.md`
- `docs/product/REPORTING.md`

---

# 13. DEC-010 — Financial Values Must Use Decimal-Safe Representation

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Do not use binary floating-point numbers as the authoritative representation of monetary values.

Use:

```text
PostgreSQL NUMERIC / DECIMAL
+
Decimal-safe application handling
```

### Rationale

Financial calculations require predictable precision.

### Consequences

Money-related logic must use the project's centralized monetary representation and rounding policy.

### Related Documents

- `docs/architecture/DATABASE.md`
- `docs/engineering/DEVELOPMENT_GUIDELINES.md`
- `docs/engineering/TESTING.md`

---

# 14. DEC-011 — AI Is Not the Source of Financial Truth

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

AI must never be treated as the authoritative source of financial calculations.

Preferred architecture:

```text
Financial Data
     ↓
Deterministic Domain Logic
     ↓
Analytics / Forecasting
     ↓
Structured Context
     ↓
AI
```

### Rationale

LLMs can produce plausible but incorrect numerical statements.

### Consequences

AI must retrieve financial facts through trusted application tools/services.

### Related Documents

- `docs/ai/AI.md`
- `docs/ai/AI_INSIGHTS.md`
- `docs/ai/AI_ASSISTANT.md`

---

# 15. DEC-012 — AI Provider Must Be Replaceable

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

AI integration must use a provider abstraction.

Conceptually:

```text
AIService
    ↓
AIProvider
    ├── Provider A
    ├── Provider B
    └── Local Model
```

### Rationale

The project may later change:

```text
Model
Provider
Pricing
Privacy Requirements
Deployment Strategy
```

### Consequences

Provider-specific implementation must remain isolated from domain logic.

### Related Documents

- `docs/ai/AI.md`

---

# 16. DEC-013 — AI Write Operations Require User Confirmation

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

AI may prepare financial actions, but actual mutations require explicit confirmation.

Preferred:

```text
User Request
    ↓
AI Interpretation
    ↓
Draft
    ↓
User Review
    ↓
Confirmation
    ↓
Normal Domain API
```

### Rationale

AI interpretation is probabilistic while financial mutations are authoritative.

### Consequences

AI must never silently:

```text
Create Transactions
Delete Transactions
Move Money
Change Budgets
Change Goals
Send Financial Messages
```

### Related Documents

- `docs/ai/AI.md`
- `docs/ai/AI_ASSISTANT.md`

---

# 17. DEC-014 — Product Documentation Is the Engineering Source of Truth

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Production behavior should be documented before or alongside implementation.

Documentation is organized into:

```text
docs/
├── architecture/
├── product/
├── ai/
├── engineering/
└── ux/
```

### Rationale

The project is intentionally designed as a production-grade system rather than a prototype.

### Consequences

Material behavior changes should update the corresponding documentation.

### Related Documents

- `docs/DOCS.md`

---

# 18. DEC-015 — Living Logs Remain Lightweight

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

The following documents should remain lightweight:

```text
CHANGELOG.md
IDEAS_BACKLOG.md
DECISION_LOG.md
ROADMAP.md
README.md
```

### Rationale

These are living project-management and repository documents, not detailed specifications.

### Consequences

Do not expand these documents merely to increase documentation volume.

Detailed requirements belong in the appropriate specification documents.

This log records decisions, not full module specifications.

### Related Documents

- `docs/DOCS.md`
- `docs/ROADMAP.md`
- `docs/CHANGELOG.md`
- `docs/IDEAS_BACKLOG.md`

---

# 19. DEC-016 — Product Modules Are Domain-Oriented

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Backend and documentation domains should remain aligned.

Examples:

```text
accounts
transactions
budgets
categories
goals
lending
notifications
recurring
reports
analytics
forecasting
files
sync
ai
```

### Rationale

Clear domain boundaries improve:

```text
Maintainability
Testing
Ownership
Scalability
```

### Consequences

New modules should represent meaningful business boundaries rather than generic technical groupings.

### Related Documents

- `docs/DOCS.md`
- `docs/engineering/DEVELOPMENT_GUIDELINES.md`

---

# 20. DEC-017 — Reports and Analytics Must Be Explainable

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Important financial numbers should be traceable back to source data.

Preferred flow:

```text
Report / Insight
      ↓
Calculation
      ↓
Supporting Metrics
      ↓
Source Transactions
```

### Rationale

Users must be able to understand why the application shows a specific financial value.

### Consequences

Derived results should not become opaque, irreproducible values.

### Related Documents

- `docs/product/REPORTING.md`
- `docs/ai/AI_INSIGHTS.md`

---

# 21. DEC-018 — Forecasts Must Be Clearly Distinguished From Actuals

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

The product must distinguish:

```text
Actual
Scheduled
Forecast
Scenario
```

### Rationale

Predictions are estimates, not historical facts.

### Consequences

Forecasts should communicate:

```text
Prediction
Confidence
Range where available
Generation Time
Model Version where useful
```

### Related Documents

- `docs/ai/AI_FORECASTING.md`
- `docs/product/REPORTING.md`

---

# 22. DEC-019 — Use the Simplest Forecast Model That Works

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Forecasting should follow a tiered approach:

```text
Deterministic Baseline
        ↓
Moving / Weighted Average
        ↓
Regression
        ↓
Advanced Time-Series / ML
```

### Rationale

A complicated model is not automatically a better model.

### Consequences

Advanced models must demonstrate measurable improvement over simpler baselines before becoming the default.

### Related Documents

- `docs/ai/AI_FORECASTING.md`
- `docs/engineering/TESTING.md`

---

# 23. DEC-020 — File Storage Uses Object Storage

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Financial files and receipts should be stored in private object storage rather than PostgreSQL binary fields.

### Rationale

This provides better scalability and clearer separation between metadata and binary files.

### Consequences

PostgreSQL stores:

```text
File Metadata
Ownership
Storage Key
Checksum
```

Object storage stores:

```text
Binary Content
```

### Related Documents

- `docs/MEDIA_FILES.md`
- `docs/architecture/DATABASE.md`

---

# 24. DEC-021 — Financial Files Are Private by Default

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Receipts and financial attachments must not be public by default.

### Rationale

Files may contain:

```text
Income Information
Purchase Information
Addresses
Identifiers
Personal Data
```

### Consequences

Access should use:

```text
Authorization
+
Short-Lived Signed URLs
```

where appropriate.

### Related Documents

- `docs/MEDIA_FILES.md`
- `docs/architecture/SECURITY.md`

---

# 25. DEC-022 — Notifications Are Event-Driven

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Notifications should originate from meaningful domain events.

Preferred:

```text
Domain Event
    ↓
Notification Eligibility
    ↓
Deduplication
    ↓
Channel
    ↓
Delivery
```

### Rationale

This prevents business logic from becoming tightly coupled to notification delivery.

### Consequences

Notification failures must never alter financial state.

### Related Documents

- `docs/product/NOTIFICATIONS.md`

---

# 26. DEC-023 — Background Jobs Must Be Idempotent

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Background jobs must safely handle retries.

Relevant jobs include:

```text
Emails
Notifications
Reports
AI Insights
Forecasts
OCR
File Cleanup
Recurring Transactions
```

### Rationale

Workers can restart or retry.

### Consequences

Repeated job execution must not cause duplicate financial effects or duplicate important notifications.

### Related Documents

- `docs/engineering/DEVELOPMENT_GUIDELINES.md`
- `docs/engineering/DEPLOYMENT.md`
- `docs/product/RECURRING_TRANSACTIONS.md`

---

# 27. DEC-024 — Core Financial Features Must Not Depend on AI

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Core functionality must continue working when AI is unavailable.

Examples:

```text
Transactions
Accounts
Budgets
Goals
Reports
Basic Analytics
Basic Forecasting
```

### Rationale

AI providers can experience:

```text
Outage
Rate Limits
Latency
Cost Restrictions
Model Changes
```

### Consequences

AI is an enhancement layer, not a platform dependency for core finance functionality.

### Related Documents

- `docs/ai/AI.md`
- `docs/03_PRODUCT_SCOPE.md`

---

# 28. DEC-025 — Production Deployments Must Be Reproducible

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Production deployments should use versioned, immutable artifacts.

Preferred:

```text
Commit
 ↓
CI
 ↓
Test
 ↓
Build
 ↓
Versioned Artifact
 ↓
Deploy
```

### Rationale

Manual production modification is difficult to reproduce and recover.

### Consequences

Production should not depend on developers manually modifying source files on servers.

### Related Documents

- `docs/engineering/DEPLOYMENT.md`

---

# 29. DEC-026 — Database Migrations Must Be Controlled

**Date:** 2026-08-14  
**Status:** Accepted

### Decision

Schema changes must go through versioned migrations.

### Rationale

Financial applications cannot safely rely on undocumented schema changes.

### Consequences

High-risk migrations require:

```text
Testing
Backup
Compatibility Review
Rollback / Recovery Plan
```

### Related Documents

- `docs/architecture/DATABASE.md`
- `docs/engineering/DEPLOYMENT.md`
- `docs/engineering/TESTING.md`

---

# 30. Decision Lifecycle

Decisions may move through:

```text
PROPOSED
    ↓
ACCEPTED
    ↓
SUPERSEDED
    ↓
DEPRECATED
```

A superseded decision should remain documented rather than silently removed.

When a decision is superseded, record:

```text
Superseded By
Date
Reason
```

---

# 31. Decision Logging Rules

Record a decision when it materially affects:

```text
Architecture
Database
Security
Data Integrity
AI
Synchronization
Infrastructure
Major UX Direction
Technology Choice
Production Operations
```

Do not record trivial implementation choices.

Do not duplicate full module specifications here. Link to the owning document instead.

---

# 32. Related Documents

Primary architecture documents:

```text
docs/architecture/
├── SYSTEM_ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── LOCAL_STORAGE.md
├── SYNC_ARCHITECTURE.md
└── SECURITY.md
```

Product specifications:

```text
docs/product/
```

AI specifications:

```text
docs/ai/
```

Engineering specifications:

```text
docs/engineering/
```

UX specifications:

```text
docs/ux/
```

Project management documents:

```text
docs/DOCS.md
docs/ROADMAP.md
docs/CHANGELOG.md
docs/IDEAS_BACKLOG.md
```
