# Personal Finance — System Architecture

**Document:** `SYSTEM_ARCHITECTURE.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Primary Database:** PostgreSQL + Prisma  
**Local Database:** SQLite  
**Cache / Jobs:** Redis  
**Repository:** Monorepo  
**Architecture Style:** Offline-first mobile + modular backend monolith

---

# 1. Purpose

This document defines the production architecture of the Personal Finance application.

The architecture must support:

- Extremely fast transaction entry
- Offline-first financial tracking
- Strong financial data integrity
- Advanced analytics
- Forecasting
- Notifications
- Email reminders
- Future cloud synchronization
- Multi-device support
- AI-powered insights
- Future ML workloads
- Open-source development
- Production deployment
- Long-term scalability without premature complexity

The architecture should start simple enough to maintain but strong enough to evolve.

---

# 2. Architectural Goals

The system must optimize for:

1. Financial correctness
2. Data durability
3. Offline capability
4. Low latency
5. Maintainability
6. Security
7. Privacy
8. Testability
9. Observability
10. Incremental scalability

---

# 3. Architecture Principles

## 3.1 Local First

The mobile application should write core financial data locally first.

The network should not sit in the critical path of routine transaction entry.

---

## 3.2 Server as Cloud Source of Truth

When cloud synchronization is enabled, the backend becomes the authoritative synchronized server state.

The mobile application remains the immediate local operational store.

---

## 3.3 Financial Calculations Are Deterministic

Core financial calculations must be performed by trusted application logic.

Do not use an LLM as the source of:

- balances
- totals
- savings
- budget calculations
- repayment balances
- forecasts

---

## 3.4 Modular Monolith First

The backend should begin as a NestJS modular monolith.

Do not start with microservices.

Modules should have clear boundaries so individual domains can later be extracted if justified.

---

## 3.5 Domain-Oriented Design

Financial domains should be organized around business capabilities rather than technical layers alone.

Examples:

```text
transactions
budgets
goals
lending
borrowing
analytics
notifications
ai
```

---

## 3.6 Infrastructure Should Be Replaceable

External services such as:

- AI providers
- email providers
- object storage

must be accessed through internal abstractions.

The core application must not become tightly coupled to one provider.

---

# 4. High-Level Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                     Mobile Application                    │
│                                                          │
│ React Native + Expo + TypeScript                         │
│                                                          │
│ UI → State → Domain → Repository → SQLite                │
│                         │                                │
│                         └──── Sync Client                │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTPS
                           ▼
┌──────────────────────────────────────────────────────────┐
│                    NestJS Backend                         │
│                                                          │
│ Auth                                                     │
│ Users                                                    │
│ Accounts                                                 │
│ Transactions                                             │
│ Categories / Tags                                        │
│ Budgets                                                  │
│ Recurring                                                │
│ Lending / Borrowing                                      │
│ Goals                                                    │
│ Analytics                                                │
│ Reports                                                  │
│ Forecasting                                              │
│ Notifications                                            │
│ Files                                                    │
│ Sync                                                     │
│ AI                                                       │
│ Health                                                   │
└───────────────┬───────────────────────────┬──────────────┘
                │                           │
                ▼                           ▼
       ┌─────────────────┐        ┌─────────────────┐
       │   PostgreSQL    │        │      Redis      │
       │   + Prisma      │        │ Cache / Jobs    │
       └─────────────────┘        └─────────────────┘
                │
                │
                ▼
       ┌─────────────────────────────┐
       │ External / Supporting       │
       │ Services                    │
       │                             │
       │ Email Provider              │
       │ Object Storage              │
       │ AI Provider(s)              │
       └─────────────────────────────┘
```

---

# 5. Repository Architecture

The repository uses a monorepo structure.

```text
personal-finance/
│
├── apps/
│   ├── mobile/
│   └── api/
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── api-client/
│   ├── config/
│   └── eslint-config/
│
├── docs/
│
├── infrastructure/
│
├── .github/
│
├── package.json
├── pnpm-workspace.yaml
├── docker-compose.yml
├── .env.example
├── README.md
└── LICENSE
```

The exact repository structure is defined in `docs/DOCS.md`.

---

# 6. Mobile Architecture

The mobile application should be organized into clear layers.

```text
UI
 ↓
Application State
 ↓
Domain / Use Cases
 ↓
Repositories
 ↓
SQLite
```

When synchronization is enabled:

```text
Repositories
 ├── Local Data Source
 └── Remote Data Source
            ↓
        Sync Layer
```

The UI should not directly access SQLite or HTTP clients.

---

# 7. Mobile Application Responsibilities

The mobile app owns:

- UI
- Navigation
- Local persistence
- Offline operation
- Local validation
- Local financial queries
- Local deterministic calculations where appropriate
- User interaction
- Local notification scheduling
- Sync queue
- Secure local credential storage

The backend owns synchronized/cloud operations and server-side capabilities.

---

# 8. Mobile Feature Architecture

Feature-oriented organization is preferred.

Example:

```text
apps/mobile/features/
│
├── transactions/
│   ├── components/
│   ├── hooks/
│   ├── screens/
│   ├── services/
│   ├── repository/
│   ├── types/
│   └── utils/
│
├── budgets/
├── goals/
├── lending/
├── borrowing/
├── accounts/
├── analytics/
├── reports/
├── notifications/
└── ai/
```

Shared UI components belong in a shared component layer rather than inside individual features.

---

# 9. Mobile State Management

Application state should be divided by responsibility.

## Local Domain State

Examples:

- Current account
- Transaction lists
- Budgets
- Goals
- Lending records

## UI State

Examples:

- Modal open
- Selected filter
- Form state
- Search input
- Loading state

## Server / Sync State

Examples:

- Pending sync
- Sync error
- Last synced timestamp

Do not store everything in one global state object.

---

# 10. Repository Pattern

The mobile app should use repository interfaces.

Example conceptual interface:

```text
TransactionRepository
├── create()
├── update()
├── delete()
├── getById()
├── list()
└── search()
```

The implementation may use:

```text
LocalTransactionRepository
RemoteTransactionRepository
SyncAwareTransactionRepository
```

This isolates storage concerns from feature logic.

---

# 11. Local SQLite Architecture

SQLite is the primary local persistence mechanism.

The database should contain the minimum complete representation needed for:

- Offline operation
- Financial history
- Local analytics
- Sync
- Backup

The application must not depend on in-memory state for financial durability.

---

# 12. Local Database Principles

1. Use stable identifiers.
2. Use migrations.
3. Keep writes transactional where required.
4. Avoid destructive schema changes without migrations.
5. Preserve historical data.
6. Support indexes for high-frequency queries.
7. Keep derived values distinguishable from source values.

---

# 13. Financial Data Model Boundary

Core source entities include:

```text
User
Account
Transaction
Category
Tag
Budget
RecurringTransaction
Bill
Subscription
LendingRecord
BorrowingRecord
Repayment
Goal
Attachment
Notification
SyncOperation
```

Derived data includes:

```text
Balance
Budget Utilization
Savings Rate
Forecast
Financial Health Score
Anomaly Score
```

The exact schema is defined in `DATABASE.md`.

---

# 14. Financial Ledger Principle

Transaction records form the financial ledger.

Derived values must be reconstructable from source data.

For example:

```text
Account Balance
=
Opening Balance
+
Income
-
Expenses
+
Transfers In
-
Transfers Out
+
Adjustments
```

The exact accounting rules will be defined in `DATABASE.md` and the relevant domain module documentation.

---

# 15. Money Representation

Financial amounts must not rely on unsafe floating-point arithmetic.

Recommended approaches include:

- integer minor units
- database decimal type
- decimal arithmetic libraries

The chosen strategy must be consistent across:

- mobile
- backend
- database
- import/export
- calculations

---

# 16. Transaction Consistency

A transaction mutation may affect:

```text
Transaction
    ↓
Account Balance
    ↓
Budget
    ↓
Analytics
    ↓
Goals where applicable
    ↓
Forecast Inputs
    ↓
AI Context
```

The system should distinguish authoritative writes from derived recalculation.

---

# 17. Backend Architecture

The backend uses:

```text
NestJS
TypeScript
Modular Monolith
```

High-level request flow:

```text
HTTP Request
   ↓
Controller
   ↓
Validation
   ↓
Application Service
   ↓
Domain Logic
   ↓
Repository
   ↓
PostgreSQL
```

Controllers should remain thin.

---

# 18. Backend Module Structure

Initial module boundaries:

```text
apps/api/src/
│
├── auth/
├── users/
├── accounts/
├── transactions/
├── categories/
├── tags/
├── budgets/
├── recurring/
├── bills/
├── subscriptions/
├── lending/
├── borrowing/
├── goals/
├── analytics/
├── reports/
├── forecasting/
├── notifications/
├── files/
├── imports/
├── exports/
├── synchronization/
├── ai/
├── health/
└── common/
```

A module should own its domain-specific business logic.

---

# 19. NestJS Module Boundary

A typical domain module:

```text
transactions/
├── transactions.module.ts
├── transactions.controller.ts
├── transactions.service.ts
├── transactions.repository.ts
├── transactions.dto.ts
├── transactions.mapper.ts
├── transactions.types.ts
└── __tests__/
```

Not every module must contain every file.

The structure should reflect actual complexity.

---

# 20. Backend Responsibilities

The backend owns:

- Authentication
- Authorization
- Cloud persistence
- Sync
- Server-side validation
- Shared financial data
- Scheduled jobs
- Email orchestration
- Server-side analytics where appropriate
- AI orchestration
- File metadata and storage integration
- Audit-sensitive operations
- API access control

---

# 21. API Architecture

The API should be versioned:

```text
/api/v1
```

Resource examples:

```text
/api/v1/accounts
/api/v1/transactions
/api/v1/budgets
/api/v1/goals
/api/v1/lending
/api/v1/borrowing
/api/v1/reports
/api/v1/analytics
/api/v1/ai
```

The full API contract belongs in `API.md`.

---

# 22. Authentication Architecture

For cloud mode:

```text
Mobile
   ↓
Authentication Endpoint
   ↓
Access Token
   +
Refresh Token
```

Access tokens should be short-lived.

Refresh tokens should be stored securely on the mobile device.

The exact authentication provider may be selected later, but the application must isolate authentication from domain modules.

---

# 23. Authorization Architecture

Authorization should be enforced server-side.

The system must not rely on mobile UI restrictions as security controls.

For the current personal-user model, authorization should ensure that:

```text
Authenticated User
        ↓
Owns / has access to
        ↓
Requested Resource
```

Future shared-finance functionality can introduce roles and permissions without rewriting current resource ownership concepts.

---

# 24. PostgreSQL Architecture

PostgreSQL is the primary server-side financial datastore.

Requirements:

- Strong transactions
- Foreign keys
- Constraints
- Indexes
- Migration management
- Backup
- Point-in-time recovery where supported by deployment
- Monitoring

---

# 25. Prisma Architecture

Prisma should be used as the primary database access layer.

Principles:

- Migrations are version-controlled.
- Schema changes are reviewed.
- Financial mutations use transactions where necessary.
- Queries are scoped to authorized users.
- N+1 query patterns are avoided.
- Expensive analytics queries are isolated and optimized.

---

# 26. Redis Architecture

Redis is supporting infrastructure.

Potential uses:

- Job queues
- Scheduled jobs
- Caching
- Rate limiting
- Temporary state
- Idempotency keys
- Distributed locks where justified

Redis must not be the authoritative source of financial records.

---

# 27. Background Job Architecture

Long-running or scheduled tasks should be processed asynchronously.

Examples:

```text
Email Reminders
Report Generation
AI Insight Generation
Forecast Recalculation
File Processing
Sync Cleanup
Notification Scheduling
```

Conceptual flow:

```text
API
 ↓
Create Job
 ↓
Redis Queue
 ↓
Worker
 ↓
Process
 ↓
Persist Result
 ↓
Notify / Update
```

The exact queue technology may be selected during implementation, with BullMQ being a strong NestJS-compatible candidate.

---

# 28. Scheduled Job Rules

Every scheduled financial job should consider:

- Time zone
- Idempotency
- Retry
- Failure handling
- Duplicate prevention
- Observability

Example:

A repayment reminder must not be sent twice because a worker restarted.

---

# 29. Notification Architecture

Notifications may originate from:

- Mobile-local scheduling
- Backend scheduled jobs
- AI insights
- Budget thresholds
- Goal milestones

Architecture:

```text
Business Event
   ↓
Notification Service
   ↓
Channel Selection
   ├── Local Push
   └── Email
```

Future channels may be added through adapters.

---

# 30. Email Architecture

Email should use an internal abstraction:

```text
EmailService
   ↓
Provider Adapter
```

This allows switching providers without changing product modules.

Email jobs should be asynchronous.

---

# 31. File Architecture

Files should not be stored directly inside PostgreSQL as large binary payloads unless there is a deliberate reason.

Recommended approach:

```text
Mobile
  ↓
Upload
  ↓
Object Storage
  ↓
File Metadata in PostgreSQL
```

Metadata may include:

- owner
- entity
- filename
- MIME type
- size
- storage key
- checksum
- timestamps

The exact storage provider may be selected later.

---

# 32. Analytics Architecture

Analytics should be separated from transactional CRUD.

```text
Transaction Data
      ↓
Aggregation Layer
      ↓
Metrics
      ↓
Trend Detection
      ↓
Forecasting
      ↓
AI Context
```

Analytics should not modify source financial records.

---

# 33. Analytics Execution Strategy

Small, frequently requested calculations may run directly against optimized local/database queries.

Expensive computations may use:

- materialized aggregates
- cached metrics
- background jobs
- precomputed summaries

The chosen strategy should be based on actual performance measurements.

---

# 34. Forecasting Architecture

Forecasting should be implemented as an independent application capability.

```text
Historical Financial Data
       ↓
Feature Preparation
       ↓
Forecast Model
       ↓
Prediction
       ↓
Validation / Confidence
       ↓
Forecast Result
```

The forecasting engine must be independent of the AI provider.

---

# 35. ML Service Strategy

A dedicated Python service should only be introduced when a real ML workload justifies it.

Potential architecture:

```text
NestJS
   ↓
ML Service API
   ↓
Python
   ↓
Model
```

Possible future workloads:

- advanced time-series forecasting
- anomaly detection
- personalized classification
- OCR pipelines
- specialized financial models

Do not deploy a Python service merely because the product contains AI features.

---

# 36. AI Architecture

The AI system should use an internal provider abstraction.

```text
AIService
    ↓
AIProvider Interface
    ├── NVIDIA NIM
    ├── OpenAI-compatible Provider
    ├── Local Model
    └── Future Provider
```

The application should not call provider SDKs directly from controllers or feature modules.

---

# 37. AI Context Pipeline

Preferred flow:

```text
Raw Financial Data
       ↓
Deterministic Analytics
       ↓
Aggregation / Minimization
       ↓
Structured Context
       ↓
AI Provider
       ↓
Structured AI Response
       ↓
Validation
       ↓
User
```

This reduces:

- privacy risk
- token usage
- hallucination risk
- latency
- cost

---

# 38. AI Output Validation

AI output must never be trusted blindly.

Responses should be validated for:

- schema
- required fields
- supported actions
- numerical consistency where applicable
- unsupported claims

If validation fails:

```text
AI Response
    ↓
Invalid
    ↓
Discard / Retry / Fallback
```

---

# 39. AI Action Boundary

AI may suggest:

- spending changes
- budget adjustments
- goal changes
- reminders

AI must not silently:

- delete financial records
- move money
- alter balances
- send sensitive messages
- change financial plans

without an explicit user-approved workflow.

---

# 40. Synchronization Architecture

The application is offline-first.

When cloud mode is enabled:

```text
Local Database
      ↓
Change Tracking
      ↓
Sync Queue
      ↓
API
      ↓
Server
      ↓
Conflict Detection
      ↓
Resolution
      ↓
Local State Update
```

---

# 41. Sync Operation Model

Each locally synchronized mutation should be trackable.

Conceptual fields:

```text
operationId
entityType
entityId
operationType
payloadVersion
createdAt
status
retryCount
lastError
```

The exact schema belongs in `DATABASE.md`.

---

# 42. Conflict Strategy

Conflict resolution should prefer deterministic rules.

Possible order:

1. Non-overlapping changes → merge.
2. Safe domain-specific merge → apply.
3. Same-field conflicting changes → user review where appropriate.
4. Never silently discard financial changes when the impact is material.

The conflict model should be designed carefully in `SYNC_ARCHITECTURE.md`.

---

# 43. Sync Idempotency

Every sync operation should be safely retryable.

A repeated request must not:

- create duplicate transactions
- duplicate repayments
- duplicate notifications
- duplicate files
- duplicate account changes

Idempotency keys or stable operation identifiers should be used where appropriate.

---

# 44. Offline-to-Online Behavior

When connectivity returns:

```text
Connectivity Detected
       ↓
Authenticate
       ↓
Upload Pending Changes
       ↓
Fetch Server Changes
       ↓
Resolve Conflicts
       ↓
Update Local State
       ↓
Mark Sync Complete
```

Sync should happen in the background where possible.

---

# 45. Data Consistency Boundary

The system should distinguish:

## Strongly Consistent Operations

Examples:

- Account balance mutation
- Transaction creation
- Repayment creation

## Eventually Consistent Features

Examples:

- AI insights
- Analytics cache
- Forecasts
- Email delivery
- Search indexing if later introduced

The user must still see authoritative financial changes immediately in local mode.

---

# 46. Caching Strategy

Cache only data where stale values are acceptable.

Safe candidates may include:

- AI insights
- Non-critical analytics
- Static metadata
- Category suggestions

Do not cache authoritative financial balances without an explicit consistency strategy.

---

# 47. Search Architecture

Initially, local transaction search can use SQLite indexes and optimized queries.

Future large-scale server search may introduce:

- PostgreSQL full-text search
- specialized indexing
- external search infrastructure if justified

Do not introduce a dedicated search engine prematurely.

---

# 48. Security Architecture

Security layers:

```text
Mobile
 ↓
Secure Credential Storage
 ↓
HTTPS
 ↓
API Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Database Constraints
 ↓
Audit / Observability
```

Security must exist at every boundary.

---

# 49. Secrets Management

Secrets include:

- JWT secrets
- Database credentials
- Redis credentials
- Email provider keys
- AI provider keys
- Storage credentials

Secrets must:

- never be committed
- be environment-driven
- be rotated
- be separated between environments

---

# 50. Environment Strategy

At minimum:

```text
development
test
staging
production
```

Configuration should be validated at application startup.

Missing required production configuration should fail fast.

---

# 51. Logging Architecture

Logs should be:

- Structured
- Searchable
- Environment-aware
- Privacy-conscious

Never log unnecessary:

- transaction contents
- account balances
- passwords
- tokens
- API keys
- AI prompts containing sensitive financial details

---

# 52. Error Handling Architecture

Backend errors should be standardized.

Conceptual response:

```json
{
  "success": false,
  "error": {
    "code": "TRANSACTION_SAVE_FAILED",
    "message": "Unable to save transaction."
  },
  "requestId": "..."
}
```

Internal technical details should remain in logs.

---

# 53. Validation Architecture

Validate at multiple boundaries.

## Mobile

For fast user feedback.

## API

For security and correctness.

## Database

For integrity constraints.

Client-side validation must never replace server validation.

---

# 54. Transactional Integrity

Operations that modify multiple related records should use database transactions.

Examples:

```text
Create Repayment
 ↓
Repayment Record
 ↓
Outstanding Balance State
```

Where derived states are persisted, the operation must remain atomic.

---

# 55. API Idempotency

Idempotency should be considered for:

- Create transaction
- Create repayment
- Import
- Sync
- Notification-triggering requests
- File uploads

This is particularly important when mobile retries requests after unreliable connectivity.

---

# 56. Rate Limiting

Rate limiting should protect:

- Authentication
- AI requests
- File upload
- Expensive reports
- Search endpoints
- Public endpoints

Limits should be adjusted based on actual usage.

---

# 57. AI Rate and Cost Control

AI requests may require:

- Per-user rate limits
- Daily/monthly quotas
- Request deduplication
- Response caching
- Model selection
- Fallback models

The application should avoid generating AI insights repeatedly for unchanged financial data.

---

# 58. Background AI Processing

Expensive AI processing should not block the main request.

For example:

```text
Financial Event
   ↓
Queue
   ↓
AI Worker
   ↓
Insight
   ↓
Persist
   ↓
Notify
```

Immediate conversational queries may remain synchronous if latency is acceptable.

---

# 59. Observability

Production observability should cover:

## Application

- startup
- crashes
- API latency
- error rate

## Database

- connection health
- slow queries
- migration status

## Jobs

- queue depth
- failure rate
- retry count

## Sync

- success rate
- conflict rate
- failed operations

## AI

- latency
- errors
- token usage where available
- provider availability

---

# 60. Health Checks

The API should expose health endpoints.

Example:

```text
GET /health
GET /health/ready
GET /health/live
```

Readiness may verify:

- PostgreSQL
- Redis
- required infrastructure

External AI/email health should not necessarily make the core API unavailable.

---

# 61. Performance Architecture

Performance priorities:

1. Transaction entry
2. Navigation
3. Local list rendering
4. Search
5. Dashboard
6. Analytics
7. AI

The most frequent operations should remain the fastest.

---

# 62. Large Dataset Strategy

The application should remain usable with:

- thousands of transactions
- large category histories
- long reporting periods

Use:

- database indexes
- pagination
- virtualization
- incremental loading
- optimized aggregation
- background processing

---

# 63. Database Indexing Strategy

Likely high-value indexes include:

- user ownership
- transaction date
- account ID
- category ID
- merchant
- transaction type
- sync status
- recurring due date
- lending/borrowing status
- notification schedule

The final index design belongs in `DATABASE.md`.

---

# 64. Backup Architecture

## Local

The mobile application should support exportable/restorable backups.

## Cloud

Future cloud backup may use object storage.

Backups should include:

- version
- metadata
- integrity information
- compressed structured data where appropriate

---

# 65. Disaster Recovery

Production cloud deployment should have:

- Automated database backups
- Backup retention
- Restore testing
- Recovery procedures
- Infrastructure documentation

A backup that has never been tested should not be considered reliable.

---

# 66. Deployment Architecture

Initial production deployment may use:

```text
Internet
   ↓
Reverse Proxy / Load Balancer
   ↓
NestJS API
   ├── PostgreSQL
   └── Redis
```

Supporting services:

```text
Object Storage
Email Provider
AI Provider
Monitoring
```

Docker should be the baseline packaging mechanism.

---

# 67. Containerization

Production services should be containerizable:

```text
api
worker
postgres
redis
```

PostgreSQL and Redis may be managed externally in production.

The codebase must not assume local Docker-only networking.

---

# 68. CI/CD Architecture

CI should validate:

- Install
- Lint
- Type check
- Unit tests
- Integration tests
- Build
- Migration checks

CD should support:

- Staging
- Production

Mobile builds should use Expo/EAS processes.

---

# 69. Release Strategy

## Mobile

```text
Development
 ↓
Internal Testing
 ↓
Beta
 ↓
Production
```

## Backend

```text
Development
 ↓
CI
 ↓
Staging
 ↓
Production
```

Backend migrations must be backward-compatible where mobile versions may overlap during rollout.

---

# 70. Backward Compatibility

Mobile clients may not update immediately.

The backend should support reasonable API compatibility across released mobile versions.

Breaking API changes should require:

- versioning
- migration plan
- deprecation period

---

# 71. Future Web / Desktop Support

The backend should remain client-agnostic.

Future clients may include:

```text
Android
iOS
Web
Desktop
```

All should use the same domain API where appropriate.

---

# 72. Shared Types

The monorepo may share:

```text
packages/types
packages/validation
packages/api-client
```

between mobile and backend where doing so reduces duplication without coupling unrelated implementation details.

---

# 73. Shared Validation

Shared schemas may be used for:

- request validation
- form validation
- API contracts

However, server-side validation remains authoritative.

---

# 74. API Client Layer

The mobile app should use a dedicated API client abstraction.

Example conceptual structure:

```text
api-client/
├── client
├── auth
├── transactions
├── accounts
├── budgets
├── goals
├── reports
├── sync
└── ai
```

Feature components should not manually build raw HTTP requests.

---

# 75. Domain Services

Business rules that span multiple repositories should live in domain/application services.

Example:

```text
RepaymentService
```

may coordinate:

```text
Repayment Repository
Account Repository
Notification Service
Analytics
```

The UI should not coordinate these operations itself.

---

# 76. Event-Oriented Internal Architecture

The backend may use domain/application events for decoupling.

Example:

```text
TransactionCreated
      ↓
Analytics Update
Notification Check
Goal Update
AI Insight Candidate
```

Events should be used carefully.

Do not introduce an event bus for every simple operation.

---

# 77. Domain Events

Potential events:

```text
TransactionCreated
TransactionUpdated
TransactionDeleted
BudgetThresholdReached
GoalMilestoneReached
RepaymentDue
RepaymentOverdue
SyncConflictDetected
```

The event architecture should be finalized after domain requirements are stable.

---

# 78. Transaction vs Notification Boundary

Creating a financial record should not depend on successfully sending a notification.

Example:

```text
Create Repayment
      ↓
Commit Repayment
      ↓
Queue Notification
```

If notification delivery fails, the repayment must remain committed.

---

# 79. Transaction vs AI Boundary

Creating a transaction must not depend on AI.

Example:

```text
Save Transaction
      ↓
Transaction Committed
      ↓
Optional AI Analysis
```

AI processing can happen later.

---

# 80. Transaction vs Analytics Boundary

Core financial writes must remain fast.

Heavy analytics should not unnecessarily block transaction creation.

Preferred:

```text
Save Transaction
     ↓
Commit
     ↓
Fast Local Update
     ↓
Background Recalculation
```

Local summary metrics that are cheap to update may be updated immediately.

---

# 81. Privacy Boundary

Potential sensitive data boundaries:

```text
Mobile Local DB
     ↓
Cloud API
     ↓
AI Provider
```

Data should be minimized at each step.

AI providers should ideally receive:

```text
Aggregated metrics
+
Necessary context
```

rather than complete personal transaction history.

---

# 82. Multi-Tenant Readiness

Although the initial product is personal-use focused, server-side records should be scoped to a user identity.

Future:

```text
User
  ↓
Workspace / Household
  ↓
Members
  ↓
Financial Resources
```

The architecture should not hardcode assumptions that prevent future shared finance.

---

# 83. Scalability Strategy

Scale vertically before introducing unnecessary distributed systems.

Suggested progression:

```text
Stage 1
Single API + PostgreSQL + Redis

Stage 2
Multiple API instances + managed database

Stage 3
Dedicated workers

Stage 4
Extract specific high-load services if justified
```

Microservices should be introduced only when independent scaling, deployment, or ownership provides measurable value.

---

# 84. Potential Future Service Boundaries

If extraction becomes necessary, likely candidates include:

```text
AI Service
Notification Service
Analytics / ML Service
File Service
Synchronization Service
```

The core financial domain should remain cohesive as long as practical.

---

# 85. Security Evolution

Future capabilities may include:

- Device trust
- Passkeys
- Biometric local unlock
- Encryption at rest
- Key management
- Advanced audit logging
- Suspicious login detection

These should be introduced according to actual product requirements.

---

# 86. Testing Architecture

Testing layers:

```text
Unit
 ↓
Integration
 ↓
Contract
 ↓
E2E
 ↓
Production Verification
```

Critical financial domain logic should have the strongest test coverage.

---

# 87. Contract Testing

API contracts should be tested so that mobile and backend changes do not silently break synchronization or financial operations.

Shared schemas can support contract validation.

---

# 88. Data Migration Strategy

Schema changes should use versioned migrations.

Every migration should consider:

- Existing users
- Large datasets
- Backward compatibility
- Rollback strategy where possible
- Mobile schema compatibility

Never make ad-hoc production database changes that cannot be reproduced from source control.

---

# 89. Mobile Database Migration

Local SQLite migrations should be:

- Versioned
- Testable
- Backward-aware
- Safe with interrupted upgrades

The application must protect existing financial data if a migration fails.

---

# 90. Architecture Anti-Patterns

Avoid:

- Microservices from day one
- Direct database access from UI
- Business logic inside React components
- Raw HTTP calls throughout the app
- AI as the source of financial truth
- Redis as the financial database
- Unversioned schema changes
- Synchronous email in financial transactions
- Synchronous AI during transaction creation
- Overloaded NestJS modules
- Giant global state
- Unbounded analytics queries
- Logging sensitive financial data

---

# 91. Architecture Decision Summary

| Area             | Decision                                  |
| ---------------- | ----------------------------------------- |
| Mobile           | React Native + Expo                       |
| Language         | TypeScript                                |
| Navigation       | Expo Router                               |
| Local DB         | SQLite                                    |
| Backend          | NestJS                                    |
| Backend Style    | Modular Monolith                          |
| Backend Language | TypeScript                                |
| API              | REST / Versioned                          |
| Server DB        | PostgreSQL                                |
| ORM              | Prisma                                    |
| Cache            | Redis                                     |
| Jobs             | Redis-backed queue                        |
| Files            | Object storage abstraction                |
| Email            | Provider abstraction                      |
| AI               | Provider abstraction                      |
| ML               | Separate Python service only if justified |
| Sync             | Offline-first                             |
| Repository       | Monorepo                                  |
| Containers       | Docker                                    |
| CI/CD            | GitHub Actions / equivalent               |
| Android          | Primary platform                          |
| iOS              | Architecture-ready                        |

---

# 92. Architecture Quality Bar

The architecture is acceptable when:

- Core financial writes are durable.
- Offline operation works.
- Financial calculations are deterministic.
- Modules have clear boundaries.
- API access is authenticated and authorized.
- Database constraints protect integrity.
- Background work is resilient.
- AI is isolated from core financial truth.
- External providers are replaceable.
- Observability exists.
- Tests cover critical domain behavior.
- The system can scale without immediate microservice decomposition.
- The mobile app remains responsive with large datasets.

---

# 93. Next Architecture Documents

The next architecture documents should be created in this order:

```text
SYSTEM_ARCHITECTURE.md
        ↓
DATABASE.md
        ↓
LOCAL_STORAGE.md
        ↓
SYNC_ARCHITECTURE.md
        ↓
API.md
        ↓
SECURITY.md
```

The next file is:

```text
docs/architecture/DATABASE.md
```

It should define the production data model in detail:

- Entities
- Relationships
- Fields
- Constraints
- Monetary representation
- Transaction model
- Lending/borrowing model
- Goals
- Budgets
- Recurring records
- Notifications
- Attachments
- Sync metadata
- Indexes
- Audit fields
- Soft deletion
- Migration strategy

The database design must preserve the core principle:

> **All important financial facts must remain reconstructable, consistent, and trustworthy from authoritative source data.**
