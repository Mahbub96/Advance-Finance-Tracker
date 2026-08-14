# Personal Finance — Development Guidelines

**Document:** `DEVELOPMENT_GUIDELINES.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-14  
**Product:** Personal Finance  
**Repository:** Advance-Finance-Tracker  
**Architecture:** pnpm Monorepo  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL + Prisma  
**Local Database:** SQLite  
**Package Manager:** pnpm

---

# 1. Purpose

This document defines the engineering standards for building and maintaining the Personal Finance application.

The goal is to keep the codebase:

- production-ready
- maintainable
- predictable
- secure
- testable
- scalable
- understandable

These guidelines apply to:

```text
apps/api
apps/mobile
packages/*
infrastructure/*
```

---

# 2. Core Engineering Principles

The project follows:

```text
Correctness
>
Security
>
Maintainability
>
Testability
>
Performance
>
Convenience
```

Do not optimize for implementation speed at the expense of financial correctness.

---

# 3. Monorepo Structure

The repository is organized as:

```text
Advance-Finance-Tracker/
├── apps/
│   ├── api/
│   └── mobile/
│
├── packages/
│   ├── api-client/
│   ├── config/
│   ├── eslint-config/
│   ├── types/
│   └── validation/
│
├── infrastructure/
│   ├── docker/
│   ├── monitoring/
│   ├── nginx/
│   └── scripts/
│
├── docs/
│
├── package.json
├── pnpm-workspace.yaml
└── docker-compose.yml
```

Do not introduce new top-level application directories without architectural justification.

---

# 4. Workspace Boundaries

## `apps/api`

Owns:

- authentication
- authorization
- business logic
- API controllers
- database access
- background jobs
- integrations
- synchronization
- AI orchestration

## `apps/mobile`

Owns:

- UI
- navigation
- local-first experience
- local database
- device integrations
- local state
- API consumption

## `packages/*`

Own genuinely reusable cross-application code.

Do not move application-specific business logic into shared packages simply to avoid duplication.

---

# 5. Shared Package Rules

Shared packages should be:

```text
Small
Stable
Clearly Owned
Framework-Light
```

Examples:

```text
packages/types
packages/validation
packages/api-client
```

Avoid turning `packages/` into a dumping ground for random utilities.

---

# 6. Dependency Direction

The preferred dependency direction is:

```text
UI
 ↓
Application / Feature Layer
 ↓
Domain Services
 ↓
Repositories / Infrastructure
 ↓
Database / External Providers
```

Do not invert this direction casually.

---

# 7. Backend Layering

NestJS modules should generally separate:

```text
Controller
Application Service
Domain / Business Logic
Repository
Infrastructure
```

Example:

```text
transactions/
├── transaction.controller.ts
├── transaction.service.ts
├── transaction.repository.ts
├── dto/
├── entities/
└── transactions.module.ts
```

The exact structure may vary when the module is small.

---

# 8. Controllers

Controllers should:

- parse HTTP input
- validate DTOs
- authorize through application policies/guards
- call application services
- map responses

Controllers should not contain complex financial calculations.

Avoid:

```text
Controller
→ Prisma
→ complicated calculations
→ AI call
```

---

# 9. Application Services

Application services coordinate use cases.

Examples:

```text
CreateTransactionService
CreateBudgetService
GenerateReportService
SyncService
```

The application service should coordinate domain operations without becoming a giant "God service."

---

# 10. Domain Logic

Financial rules belong in domain/application logic, not controllers.

Examples:

```text
Budget calculation
Outstanding repayment
Goal progress
Transfer validation
Recurring schedule
Balance calculation
```

These rules must be independently testable.

---

# 11. Repository Pattern

Repositories isolate persistence concerns.

Example:

```text
TransactionRepository
AccountRepository
BudgetRepository
GoalRepository
```

Application services should not spread Prisma queries throughout the codebase.

---

# 12. Prisma Access

Preferred:

```text
Application Service
 ↓
Repository
 ↓
Prisma
```

Avoid:

```text
Controller
 ↓
Prisma
```

Direct Prisma access may be acceptable for extremely small internal modules, but consistency should remain the default.

---

# 13. Database Transactions

Use database transactions for operations that must be atomic.

Examples:

```text
Transfer
Repayment
Financial adjustment
Account + source record creation
Critical synchronized mutation
```

If two financial effects must either both happen or neither happen, use a database transaction.

---

# 14. Money Handling

Never use JavaScript floating-point numbers as authoritative financial values.

Preferred:

```text
Database:
NUMERIC / DECIMAL

Application:
Decimal-safe representation
```

API money values should generally be serialized as strings.

Example:

```json
{
  "amount": "1250.50",
  "currency": "BDT"
}
```

---

# 15. Date / Time Handling

Use clear semantics for:

```text
Instant
Date
Local Calendar Date
```

Examples:

```text
createdAt:
2026-08-14T09:30:00Z

transactionDate:
2026-08-14
```

Do not use timestamps for calendar-only fields without a reason.

---

# 16. Timezone

The application must define a user timezone.

Calendar calculations such as:

```text
monthly budgets
daily limits
due dates
recurring rules
reports
```

must use the user's intended timezone.

---

# 17. Validation

Validate at every trust boundary.

## Mobile

Validation improves UX.

## API

Validation protects the system.

## Domain

Validation protects business correctness.

Never assume validation performed by another layer is sufficient.

---

# 18. DTOs

NestJS request DTOs should:

- describe accepted input
- validate fields
- avoid leaking database models
- be explicit about optional fields

Do not use Prisma models directly as API request contracts.

---

# 19. Response DTOs

Responses should expose only client-relevant fields.

Do not blindly serialize database objects.

This protects against accidental exposure of:

```text
internal metadata
ownership fields
security fields
database implementation details
```

---

# 20. Error Handling

Use structured application errors.

Example:

```text
TRANSACTION_NOT_FOUND
INVALID_AMOUNT
ACCOUNT_NOT_OWNED
BUDGET_CONFLICT
SYNC_CONFLICT
INSUFFICIENT_DATA
```

Clients should rely on stable error codes, not message strings.

---

# 21. Error Mapping

Application/domain errors should be mapped consistently to HTTP responses.

Example:

```text
Validation Error → 422
Not Found → 404
Conflict → 409
Unauthorized → 401
Forbidden → 403
Rate Limited → 429
```

The exact global mapping should remain centralized.

---

# 22. Logging

Logs should be structured.

Include useful operational context such as:

```text
requestId
module
operation
duration
status
errorCode
```

Never log secrets.

Never log full financial payloads unnecessarily.

---

# 23. Sensitive Data Logging

Never log:

```text
Passwords
Tokens
API Keys
Full Account Numbers
OTP
CVV
Full AI Prompts containing sensitive data
Receipt contents
Full transaction datasets
```

When debugging financial issues, log identifiers and safe metadata instead.

---

# 24. Request IDs

Every API request should have a request ID.

The request ID should propagate through:

```text
API
 ↓
Service
 ↓
Queue
 ↓
Worker
 ↓
External Provider
```

where practical.

This makes production troubleshooting much easier.

---

# 25. Configuration

Application configuration should be centralized.

Examples:

```text
config/
├── app
├── database
├── auth
├── redis
├── storage
├── email
├── ai
└── observability
```

Do not scatter environment-variable reads throughout business logic.

---

# 26. Environment Variables

Use:

```text
.env.example
```

to document required configuration keys.

Never commit actual secrets.

---

# 27. Environment Separation

At minimum:

```text
development
test
staging
production
```

Each environment should have independent:

```text
database
credentials
AI keys
storage
email
```

---

# 28. Secret Management

Secrets must be provided through:

- environment injection
- secret manager
- deployment platform secrets

Never:

```text
hardcode
commit
embed in mobile
```

---

# 29. Mobile Configuration

Mobile configuration may contain public values such as:

```text
API base URL
environment name
feature flags
public identifiers
```

It must not contain privileged secrets.

---

# 30. API Client

`packages/api-client` should provide a consistent client for:

```text
Authentication
Requests
Headers
Error mapping
Retries where appropriate
```

Business logic should not be embedded in the generic HTTP client.

---

# 31. API Client Architecture

Preferred:

```text
Feature
 ↓
API Client / Domain API
 ↓
HTTP Transport
```

Avoid direct `fetch()` calls scattered throughout feature components.

---

# 32. Mobile Architecture

The mobile app should generally follow:

```text
Screen
 ↓
Feature Hook / View Model
 ↓
Application Service
 ↓
Repository
 ↓
Local DB / API
```

The exact implementation may use React Query, Zustand, or other tools, but responsibilities should remain clear.

---

# 33. React Native Components

Components should generally be:

```text
Small
Focused
Reusable when appropriate
Accessible
Predictable
```

Avoid large components containing:

```text
navigation
API calls
database queries
financial calculations
UI
```

all in one file.

---

# 34. Feature-Based Mobile Structure

Example:

```text
features/
└── transactions/
    ├── components/
    ├── hooks/
    ├── screens/
    ├── services/
    ├── types/
    └── utils/
```

Feature code should stay close to the domain it serves.

---

# 35. Shared UI Components

Reusable components belong in:

```text
components/
```

Examples:

```text
Button
Input
Modal
Card
Sheet
EmptyState
Skeleton
CurrencyInput
```

Do not move domain-specific UI into global components prematurely.

---

# 36. Design System

UI must consume the project design system.

Avoid arbitrary:

```text
colors
spacing
typography
border radius
shadows
```

inside individual screens.

See:

```text
docs/ux/DESIGN_SYSTEM.md
```

---

# 37. Accessibility

All interactive components should consider:

```text
Accessibility labels
Touch target size
Text scaling
Color contrast
Screen reader semantics
Error messaging
```

Accessibility should be part of feature implementation rather than a final cleanup step.

---

# 38. State Management

State should be classified.

## Local UI State

Examples:

```text
Modal open
Selected tab
Input field
```

## Feature State

Examples:

```text
Filter
Draft
Temporary selection
```

## Server State

Examples:

```text
Budgets
Goals
Transactions from API
```

## Local Persistent State

Examples:

```text
SQLite entities
Sync queue
Offline data
```

Do not put everything into one global store.

---

# 39. Server State vs Local State

The application is offline-first.

Therefore:

```text
Local DB
```

is the immediate operational source for mobile UI.

Server synchronization happens through the sync layer.

---

# 40. Repository Responsibilities

Repositories may handle:

```text
Read
Write
Query
Persistence Mapping
Sync-related persistence
```

They should not contain:

```text
UI logic
AI prompting
notification copy
```

---

# 41. Service Responsibilities

Services coordinate application use cases.

Examples:

```text
TransactionService
BudgetService
GoalService
NotificationService
AIService
```

Avoid a universal:

```text
UtilsService
```

containing unrelated business behavior.

---

# 42. Utility Functions

Utilities should be:

```text
Pure where possible
Small
Predictable
Well-tested
```

Examples:

```text
formatCurrency()
calculatePercentage()
dateRange()
```

Do not hide major business rules inside generic utilities.

---

# 43. Naming Conventions

Use clear names.

## Files

```text
kebab-case.ts
```

or the repository's established convention consistently.

## Classes

```text
PascalCase
```

## Functions / Variables

```text
camelCase
```

## Database

Follow the project's Prisma/database naming convention consistently.

---

# 44. Boolean Naming

Prefer:

```text
isActive
hasPermission
canSync
shouldNotify
```

Avoid vague:

```text
activeFlag
check
statusBoolean
```

---

# 45. Avoid Abbreviations

Prefer:

```text
transaction
notification
configuration
repository
```

over unnecessary abbreviations.

Well-established domain abbreviations may be retained where universally understood.

---

# 46. TypeScript Strictness

Enable strict TypeScript settings.

The project should not rely on:

```text
any
```

as a default escape hatch.

Use:

```text
unknown
```

when the type is genuinely unknown and narrow it safely.

---

# 47. `any` Policy

`any` should be exceptional.

If used:

```text
document why
limit scope
prefer a typed alternative
```

Do not spread `any` through a module.

---

# 48. Type Reuse

Shared domain-independent types may live in:

```text
packages/types
```

Avoid duplicating API contracts manually between mobile and backend.

Generated types may be preferred where appropriate.

---

# 49. Validation Reuse

`packages/validation` may contain schemas shared between mobile and backend when doing so provides real value.

Do not force every server-only business rule into shared client validation.

---

# 50. API Contracts

API contracts must be:

```text
Explicit
Versioned
Documented
Tested
```

OpenAPI should reflect the real implementation.

---

# 51. Database Migrations

Database schema changes must use proper migrations.

Never manually change production schema without a corresponding migration strategy.

---

# 52. Migration Safety

Before applying a migration:

```text
Understand Data Impact
+
Test Locally
+
Test Staging
+
Consider Rollback
```

Destructive migrations need extra review.

---

# 53. Seed Data

Seed data should be deterministic.

Use seeds for:

```text
System Categories
Development Data
Test Fixtures
```

Do not use random uncontrolled production-like seed state.

---

# 54. Test Data

Production tests should use controlled fixtures.

Do not use real user data in automated tests.

---

# 55. Financial Determinism

Critical calculations must be deterministic.

Examples:

```text
Balance
Budget Remaining
Goal Progress
Outstanding Lending
Outstanding Borrowing
Savings Rate
Forecast Baseline
```

The same inputs should produce the same expected results.

---

# 56. Financial Formula Placement

Complex financial formulas should have:

```text
Named functions/services
Unit tests
Documentation
```

Avoid hiding formulas inside:

```text
controller
React component
SQL string
```

without a clear boundary.

---

# 57. AI Boundaries

AI must call application services/tools.

Do not allow:

```text
AI
 ↓
Prisma
```

Use:

```text
AI
 ↓
Tool
 ↓
Application Service
 ↓
Repository
```

---

# 58. Background Jobs

Use queues/workers for:

```text
Email
Heavy reports
AI insights
OCR
Forecasting
Cleanup
Notifications
```

Workers must be:

```text
Idempotent
Retryable
Observable
```

---

# 59. Idempotency

Any operation that can safely be retried should have an idempotency strategy.

Critical examples:

```text
Transaction creation
Repayment
Transfer
Recurring transaction generation
File upload
Email sending
AI background jobs
```

---

# 60. Retry Policy

Retries must distinguish:

```text
Transient
Permanent
Conflict
```

Never retry validation errors forever.

---

# 61. Network Calls

External provider calls should have:

```text
Timeout
Retry Policy
Error Classification
Observability
```

Examples:

```text
AI
Email
Object Storage
External OCR
```

---

# 62. Third-Party Integrations

External providers must be isolated behind adapters.

Example:

```text
EmailService
 ↓
EmailProvider
```

not:

```text
Business Module
 ↓
Provider SDK directly
```

This allows provider replacement and easier testing.

---

# 63. Feature Flags

Feature flags may be used for:

```text
Experimental AI
Advanced Forecasting
OCR
New UX
Beta capabilities
```

Flags must have:

```text
Owner
Purpose
Default
Removal Plan
```

Avoid permanent flag accumulation.

---

# 64. Experimental Features

Experimental capabilities should not silently become core product dependencies.

Examples:

```text
AI Assistant
Advanced ML
New forecast model
```

The product must remain useful when an experimental feature is disabled.

---

# 65. Git Branching

Use short-lived branches.

Example:

```text
main
feature/transactions
fix/budget-recalculation
chore/upgrade-expo
```

Avoid long-lived branches that diverge heavily.

---

# 66. Commit Messages

Use meaningful commit messages.

Examples:

```text
feat(transactions): add quick expense entry
fix(sync): prevent duplicate repayment uploads
docs(ai): define assistant tool boundaries
refactor(accounts): isolate balance calculation
```

The scope should reflect the domain module where practical.

---

# 67. Small Commits

Prefer focused commits.

Bad:

```text
feat: update everything
```

Better:

```text
feat(budgets): add threshold detection
test(budgets): cover threshold crossing
docs(budgets): document alert behavior
```

---

# 68. Pull Requests

Pull requests should include:

```text
What changed
Why
Testing
Screenshots where useful
Migration notes
Risk / impact
```

---

# 69. Pull Request Scope

PRs should remain focused.

Avoid combining:

```text
database migration
major UI redesign
AI refactor
deployment changes
```

into one PR unless the architecture genuinely requires it.

---

# 70. Code Review

Reviewers should prioritize:

1. Correctness
2. Security
3. Data integrity
4. Maintainability
5. Performance
6. Style

Style should not dominate review while financial correctness is unresolved.

---

# 71. Definition of Done

A feature is not complete until:

```text
Implementation
+
Validation
+
Tests
+
Error Handling
+
Documentation
+
Observability where needed
```

are addressed.

---

# 72. Documentation

Significant behavior should have documentation.

Update appropriate files when behavior changes:

```text
Architecture
Product
API
UX
AI
Engineering
```

Do not let code silently diverge from documentation.

---

# 73. Decision Log

Architectural decisions should be recorded in:

```text
docs/DECISION_LOG.md
```

Examples:

```text
Why NestJS?
Why SQLite?
Why offline-first?
Why PostgreSQL?
Why provider-agnostic AI?
Why certain sync strategy?
```

---

# 74. Changelog

User-visible changes should be recorded in:

```text
docs/CHANGELOG.md
```

Technical internal changes do not necessarily need user-facing changelog entries.

---

# 75. Roadmap

Future work should be tracked in:

```text
docs/ROADMAP.md
```

Do not use TODO comments as the only record of planned work.

---

# 76. Ideas Backlog

Uncommitted ideas belong in:

```text
docs/IDEAS_BACKLOG.md
```

This keeps speculative features separate from committed scope.

---

# 77. Environment Configuration

Local development should use:

```text
.env.local
```

or the repository's chosen environment strategy.

Only template configuration belongs in source control.

---

# 78. Local Development Services

Typical development stack:

```text
PostgreSQL
Redis
NestJS API
Expo Mobile
```

Docker Compose may provide infrastructure dependencies.

---

# 79. Development Commands

The repository should eventually standardize commands such as:

```text
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Exact scripts should be documented in `README.md`.

---

# 80. Code Formatting

Use a single formatter configuration across the repository.

Recommended principles:

```text
Automated
Consistent
CI-enforced
```

Do not debate formatting manually in code review.

---

# 81. Linting

Linting should detect:

- unused variables
- unsafe patterns
- import issues
- React mistakes
- TypeScript mistakes
- dependency issues where configured

CI should reject lint failures.

---

# 82. Type Checking

TypeScript type checking should run in CI.

No production branch should depend on:

```text
it compiles locally only
```

---

# 83. Dead Code

Remove unused code rather than leaving large commented blocks.

Git already provides history.

---

# 84. Comments

Comments should explain:

```text
Why
```

not:

```text
What obvious syntax does
```

Good:

```text
Use transaction lock here because concurrent repayment
updates must not produce a negative outstanding balance.
```

Bad:

```text
// increment i
i++;
```

---

# 85. TODO Comments

TODOs should include context when they represent real work:

```text
TODO(#123): replace baseline forecast with validated model
```

But important roadmap items should still live in project documentation.

---

# 86. Error Messages

User-facing messages should be:

- clear
- polite
- actionable

Avoid exposing stack traces or infrastructure details.

---

# 87. Internal Errors

Internal errors should contain enough context for debugging:

```text
operation
requestId
errorCode
stack
module
```

Sensitive data must remain redacted.

---

# 88. Security by Default

Every new endpoint should ask:

```text
Who can access this?
What owns the resource?
What input is trusted?
What can be manipulated?
What data is sensitive?
```

---

# 89. API Endpoint Checklist

Before adding an endpoint:

```text
Authentication
Authorization
Validation
Rate Limit
Idempotency if needed
Error Mapping
OpenAPI
Tests
Observability
```

---

# 90. Database Access Checklist

Before adding a repository query:

```text
User scope
Indexes
Pagination
Null behavior
Soft delete behavior
Performance
Transaction requirements
```

---

# 91. Mobile Feature Checklist

Before adding a feature:

```text
Offline behavior
Loading state
Empty state
Error state
Accessibility
Permission handling
Sync behavior
Analytics privacy
Deep link
```

Not every item applies to every feature, but each should be consciously considered.

---

# 92. Offline-First Rule

For finance-critical actions:

```text
User Action
 ↓
Local Commit
 ↓
UI Update
 ↓
Sync
```

Do not unnecessarily require a network round trip before recording normal financial activity.

---

# 93. Sync Rule

Any new synchronizable entity must define:

```text
Stable ID
Version
Operation ID
Create / Update / Delete semantics
Conflict strategy
Tombstone behavior
Recovery path
```

---

# 94. File Feature Rule

Any new file-related feature must define:

```text
Allowed Types
Size Limits
Ownership
Storage
Deletion
Offline Behavior
Sync
Privacy
```

See:

```text
docs/product/MEDIA_FILES.md
```

---

# 95. AI Feature Rule

Any AI feature must define:

```text
Purpose
Trusted Data Source
Context
Provider
Privacy
Fallback
Output Validation
Cost
Evaluation
```

AI must never be added simply as a UI chatbot wrapper.

---

# 96. Forecast Feature Rule

Any new forecast must define:

```text
Inputs
Baseline
Model
Data Sufficiency
Confidence
Evaluation
Fallback
Version
```

---

# 97. Notification Feature Rule

Any notification must define:

```text
Trigger
Audience
Channel
Timing
Deduplication
Cancellation
Privacy
Quiet Hours
```

---

# 98. Performance Rule

Performance optimization should follow:

```text
Measure
 ↓
Identify Bottleneck
 ↓
Optimize
 ↓
Measure Again
```

Do not optimize based only on assumptions.

---

# 99. Security Rule

Security is not a final QA phase.

For every feature consider:

```text
Authentication
Authorization
Input Validation
Data Exposure
Logging
Storage
Third-Party Risk
Deletion
```

---

# 100. Testing Rule

Every production feature should have:

```text
Happy Path
Validation Failure
Authorization Failure
Edge Cases
Offline Behavior where relevant
Sync Behavior where relevant
```

Critical financial calculations require stronger automated coverage.

---

# 101. Production Readiness Rule

A feature is production-ready only when:

```text
Correct
+
Secure
+
Tested
+
Observable
+
Documented
+
Recoverable
```

---

# 102. Dependency Management

Dependencies should be added only when they provide clear value.

Before adding a package:

```text
Can existing tools solve this?
Is it maintained?
Is license compatible?
Is bundle/runtime impact acceptable?
Does it introduce security risk?
```

---

# 103. Package Versioning

Use the repository's lockfile consistently.

Do not manually mix package managers.

The canonical package manager is:

```text
pnpm
```

---

# 104. Native Dependencies

For React Native / Expo dependencies, verify:

```text
Expo compatibility
Android support
Future iOS support
Native build implications
Maintenance status
```

Do not add native packages without considering Expo compatibility.

---

# 105. Mobile Build Stability

Keep Expo SDK and React Native versions aligned with the supported project baseline.

When upgrading:

```text
Read migration notes
Update dependencies
Run tests
Build Android
Validate native behavior
```

---

# 106. API Backward Compatibility

When changing API contracts:

```text
Is change backward compatible?
Do mobile clients depend on old behavior?
Does sync protocol depend on it?
Does OpenAPI need update?
```

Avoid breaking mobile clients unnecessarily.

---

# 107. Database Compatibility

Backend deployments should consider:

```text
old app
new API
new database
```

during rolling updates.

Migrations should be designed to minimize incompatible intermediate states.

---

# 108. Feature Removal

When removing a feature:

```text
Documentation
API
Database
Mobile
Background Jobs
Notifications
Tests
```

must be considered.

Do not remove only the UI and leave orphaned backend behavior.

---

# 109. Observability

Production-critical modules should provide:

```text
Logs
Metrics
Health
Errors
Tracing where justified
```

Prioritize:

```text
transactions
sync
payments/repayments
notifications
AI
files
jobs
```

---

# 110. Health Checks

The API should expose:

```text
/liveness
/readiness
/health
```

Readiness should verify required dependencies without exposing secrets.

---

# 111. Worker Reliability

Every background job should have:

```text
Unique Job Identity
Retry Policy
Failure State
Structured Logs
Dead-Letter / Failure Handling where needed
```

---

# 112. Dead-Letter Handling

Persistent failures should not retry forever.

Examples:

```text
Invalid email
Unsupported file
Malformed AI response
Permanent provider error
```

Failed jobs should be inspectable.

---

# 113. Data Recovery

Any feature that can mutate financial state should have a recovery path.

Examples:

```text
Sync failure
Migration failure
Duplicate prevention
Reconciliation
Full resync
```

---

# 114. Feature Module Boundaries

Current backend domain boundaries are:

```text
accounts
ai
analytics
auth
budgets
categories
files
forecasting
goals
health
lending
notifications
recurring
reports
sync
transactions
users
```

A new module should be introduced only when it represents a meaningful domain boundary.

---

# 115. `health` Module Clarification

`apps/api/src/health/` is for:

```text
Application Liveness
Readiness
Infrastructure Health
```

It must not contain financial-health scoring.

Financial Health belongs in:

```text
analytics
```

---

# 116. Naming Domain Modules

Use names that describe business domains.

Good:

```text
transactions
budgets
goals
recurring
```

Avoid vague modules such as:

```text
misc
helpers
stuff
common-business
```

---

# 117. Common Module

`common/` should contain truly cross-cutting infrastructure.

Examples:

```text
exceptions
guards
decorators
interceptors
logging
pagination
request context
```

Avoid putting domain logic in `common/`.

---

# 118. Database Module

`database/` should own:

```text
Prisma setup
Database service
Connection lifecycle
Transaction helpers
```

It should not own business rules.

---

# 119. Config Module

`config/` should provide centralized typed configuration.

Business modules should request configuration through a consistent interface.

Avoid reading raw `process.env` throughout modules.

---

# 120. Code Ownership

Important domains should have clear ownership in the team.

Potential ownership:

```text
Transactions
Accounts
Sync
AI
Infrastructure
Mobile UX
```

Ownership should be documented outside source code where appropriate.

---

# 121. Review Depth by Risk

Low-risk:

```text
UI spacing
copy
simple refactor
```

High-risk:

```text
Money calculations
Database migration
Auth
Sync
AI tool permissions
File security
```

High-risk changes require deeper review and stronger tests.

---

# 122. Production Change Discipline

For financial or synchronization changes:

```text
Implement
 ↓
Test
 ↓
Review
 ↓
Stage
 ↓
Validate
 ↓
Deploy
 ↓
Monitor
```

Do not hot-patch production without recording the change.

---

# 123. Documentation Synchronization

The codebase and documentation should remain aligned.

When behavior changes materially:

```text
Implementation
+
Relevant MD
```

must be updated in the same change or explicitly tracked.

---

# 124. Code Quality Bar

Production code should be:

```text
Readable
Typed
Testable
Explicit
Modular
Observable
Secure
```

Avoid clever abstractions that save a few lines but make behavior harder to understand.

---

# 125. Final Engineering Principle

The project should optimize for:

> **A codebase that a new engineer can understand, a user can trust, and the team can safely evolve years from now.**

The goal is not maximum abstraction.

The goal is:

```text
Clear Architecture
+
Strong Domain Boundaries
+
Reliable Financial Logic
+
Excellent Developer Experience
```

---

# 126. Relationship With Other Engineering Documents

Engineering documentation sequence:

```text
DEVELOPMENT_GUIDELINES.md
        ↓
TESTING.md
        ↓
PERFORMANCE.md
        ↓
DEPLOYMENT.md
```

This document defines the **day-to-day engineering standards**.

The next engineering document should define the complete testing strategy:

```text
docs/engineering/TESTING.md
```

It should cover:

- Test pyramid
- Unit tests
- Integration tests
- E2E tests
- Contract tests
- Mobile tests
- Database tests
- Sync tests
- AI evaluation tests
- Forecast model tests
- Security tests
- Performance tests
- CI test gates
- Coverage expectations
- Test fixtures
- Mocking strategy
- Acceptance criteria
