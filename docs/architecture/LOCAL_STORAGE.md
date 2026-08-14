# Personal Finance — Local Storage Architecture

**Document:** `LOCAL_STORAGE.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Mobile:** React Native + Expo + TypeScript  
**Local Database:** SQLite  
**Architecture:** Offline-first  
**Server Database:** PostgreSQL

---

# 1. Purpose

This document defines how financial data is persisted and managed locally on the user's device.

The local storage layer is one of the most important parts of the product because the application must remain useful when:

- the device is offline
- network latency is high
- the backend is unavailable
- the user is traveling
- the user wants local-first privacy

The primary principle is:

> **A normal financial transaction should not need the internet to be recorded successfully.**

---

# 2. Local Storage Goals

The local storage architecture must provide:

- Immediate writes
- Durable persistence
- Offline operation
- Fast transaction queries
- Fast search
- Reliable migrations
- Sync readiness
- Data integrity
- Large-dataset performance
- Safe backup and restore
- Controlled access to sensitive data

---

# 3. Storage Stack

The mobile storage stack should conceptually be:

```text
React Native / Expo
       ↓
Feature / Use Case Layer
       ↓
Repository Interfaces
       ↓
SQLite Data Source
       ↓
SQLite Database File
```

When cloud synchronization is enabled:

```text
Repository
   ├── Local Data Source
   └── Sync Layer
          ↓
       API Client
```

UI components must never directly execute SQL.

---

# 4. Local-First Rule

For core financial operations:

```text
User Action
   ↓
Validate
   ↓
Write to SQLite
   ↓
Confirm Durable Local State
   ↓
Update UI
```

Only after local persistence succeeds should the UI report successful completion.

Network synchronization occurs independently.

---

# 5. Core Local Responsibilities

The mobile local storage layer owns:

- Transactions
- Accounts
- Categories
- Tags
- Budgets
- Goals
- Lending
- Borrowing
- Repayments
- Recurring rules
- Bills
- Subscriptions
- Notification state
- Local preferences
- Sync queue
- Drafts
- Local metadata

---

# 6. Server-Only Responsibilities

Some data does not need to be locally authoritative.

Examples may include:

- Server authentication sessions
- Server-side job state
- Provider-specific AI metadata
- Server monitoring data

However, any information required for normal offline usage must have an appropriate local representation.

---

# 7. Local Database Schema

The local schema should represent the same financial domain semantics as the PostgreSQL model.

Core tables should include approximately:

```text
users
user_settings

accounts

categories
tags
transaction_tags
transactions

budgets
budget_categories

recurring_transactions
bills
subscriptions

persons
lending_records
borrowing_records
repayments

financial_goals
goal_contributions

notifications

files
attachments

sync_devices
sync_operations

drafts

local_metadata
```

The exact SQLite schema should be maintained separately from the PostgreSQL schema while preserving compatible domain semantics.

---

# 8. Local IDs

IDs should be generated locally before network synchronization.

Preferred approach:

```text
UUID
```

This allows:

- offline creation
- deterministic references
- sync without temporary server IDs
- lower collision risk

The mobile client must not depend on the server assigning an ID before local persistence.

---

# 9. Local Monetary Representation

The local database must not use unsafe floating-point values for authoritative monetary amounts.

Recommended options:

### Option A

Store decimal text representation.

### Option B

Store integer minor units where currency rules support it.

### Option C

Use SQLite numeric representation with an application decimal abstraction.

The implementation team must choose one strategy and use it consistently.

---

# 10. Money Formatting vs Storage

Storage and presentation must remain separate.

Example:

```text
Stored:
450.00

Displayed:
৳450
```

Formatting must happen at the presentation layer.

---

# 11. Local Transactions

SQLite transactions should be used when multiple local records must change atomically.

Examples:

## Transfer

```text
Create Source Effect
+
Create Destination Effect
+
Create Transfer Link
```

## Repayment

```text
Create Repayment
+
Update Required Local State
```

## Import

```text
Validate Batch
+
Commit Records
```

If any atomic operation fails, the transaction must roll back.

---

# 12. Transaction Entry Local Flow

The preferred path is:

```text
User
 ↓
Amount Input
 ↓
Local Validation
 ↓
Repository.create()
 ↓
SQLite Transaction
 ↓
Commit
 ↓
Local State Update
 ↓
UI Success
```

No remote API call should be required for this flow.

---

# 13. Local Validation

Validation should happen before writing.

Examples:

- Amount > 0
- Valid account
- Valid category when required
- Valid date
- Valid currency
- Valid transfer source/destination
- Valid repayment amount

Validation should be fast and deterministic.

---

# 14. Client-Side vs Server-Side Validation

The mobile app validates for usability.

The backend validates for security and authoritative correctness.

Therefore:

```text
Mobile Validation
      ≠
Security Boundary
```

A malicious or corrupted client must not be able to bypass server-side validation in cloud mode.

---

# 15. Repository Architecture

Repositories should isolate persistence details.

Example:

```text
TransactionRepository
├── create()
├── update()
├── delete()
├── restore()
├── getById()
├── list()
├── search()
└── count()
```

Feature code should depend on repository interfaces rather than SQL implementation details.

---

# 16. Repository Responsibilities

A repository may handle:

- SQL queries
- Mapping database rows to domain models
- Mapping domain models to database records
- Transaction boundaries where appropriate
- Local indexes
- Pagination
- Query filtering

Business rules that span multiple domains should live above the repository layer.

---

# 17. Domain Service Layer

For complex operations:

```text
UI
 ↓
Use Case / Domain Service
 ↓
Repositories
 ↓
SQLite
```

Example:

```text
RecordRepaymentUseCase
    ↓
RepaymentRepository
AccountRepository
NotificationService
```

The UI should not orchestrate these operations directly.

---

# 18. Local State Management

Local persistence and UI state should remain separate.

Example:

```text
SQLite
  ↓
Repository
  ↓
Query / Hook
  ↓
UI State
```

The app should not treat a global state container as the permanent financial datastore.

---

# 19. Reactive Data Updates

Where practical, changes to local financial data should update relevant screens immediately.

Example:

```text
Add Expense
   ↓
SQLite Commit
   ↓
Transaction List Updates
   ↓
Dashboard Balance Updates
   ↓
Budget View Updates
```

The implementation can use event-driven invalidation, query observers, or controlled state updates.

---

# 20. Local Derived Values

Some derived values can be calculated locally for fast UX.

Examples:

- Account balance
- Budget utilization
- Monthly expense
- Savings rate

However, the implementation should clearly distinguish:

```text
Source Data
vs
Derived Cache
```

Derived caches must be rebuildable.

---

# 21. Derived Data Rebuild

The application should be able to reconstruct critical derived state from source records.

For example:

```text
Transactions
    ↓
Recalculate Account Balances
    ↓
Recalculate Budgets
    ↓
Recalculate Goals
```

This provides a recovery path when cached derived values become inconsistent.

---

# 22. Local Indexing

Indexes should support common queries.

Likely indexes include:

```text
transactions(user_id, transaction_date)
transactions(account_id, transaction_date)
transactions(category_id, transaction_date)
transactions(type, transaction_date)

lending_records(status, expected_repayment_date)
borrowing_records(status, expected_repayment_date)

notifications(status, scheduled_at)

sync_operations(status, created_at)
```

The exact local indexes should be validated using realistic device datasets.

---

# 23. Transaction List Performance

The transaction list must not load the entire transaction history at once.

Use:

- Pagination
- Cursor-based loading where practical
- SQLite indexes
- Virtualized React Native lists

For mobile rendering, a large dataset should remain smooth.

---

# 24. Search Performance

Search should prefer indexed local queries.

For more advanced text search, the implementation may consider SQLite FTS support when justified.

Do not introduce a separate search service for local transactions unless real scale requires it.

---

# 25. Pagination Strategy

The transaction list should support pagination.

Conceptual query:

```text
SELECT ...
FROM transactions
WHERE ...
ORDER BY transaction_date DESC
LIMIT N
OFFSET ...
```

For very large datasets, cursor/keyset pagination may perform better than large offsets.

The actual strategy should be chosen after performance testing.

---

# 26. Local Drafts

Short forms may use draft storage.

Potential draft fields:

```text
id
type
payload
created_at
updated_at
```

Drafts are not financial transactions.

A draft becomes authoritative only after explicit submission.

---

# 27. Interrupted Transaction Entry

If the application is interrupted during entry:

```text
App Closed
    ↓
Draft Exists
    ↓
Reopen
    ↓
Offer Continue / Discard
```

The user must never receive a false impression that a transaction was committed when it was only a draft.

---

# 28. Quick Actions and Local Data

Quick transaction suggestions should be generated from local history where practical.

Examples:

- Frequent merchants
- Frequent categories
- Frequently used accounts
- Recent transaction patterns

This improves speed and privacy.

---

# 29. Smart Default Generation

The local layer can provide recent behavioral context such as:

```text
Merchant → Most recent category
Merchant → Most recent account
Category → Most common account
User → Frequent amount ranges
```

The system should favor recent and consistent behavior over outdated history.

---

# 30. Learning From Corrections

If the user repeatedly changes:

```text
Suggested Category
→ User Category
```

the application may update local suggestion behavior.

The learning system should not be required to call an AI provider.

---

# 31. Local Analytics

Common analytics should be possible entirely from local data.

Examples:

- Current month expense
- Category totals
- Savings
- Budget utilization
- Account balances
- Lending outstanding
- Borrowing outstanding

This allows analytics to continue offline.

---

# 32. Local Forecasting

Simple forecasting may also run locally.

Possible models:

- Moving average
- Weighted average
- Basic regression

This makes predictive functionality available without network connectivity when enough historical data exists.

---

# 33. Local AI Considerations

AI may eventually run locally through on-device models where practical.

The architecture should allow:

```text
AI Service
  ├── Remote Provider
  └── Local Provider
```

The mobile app should not assume every AI operation requires the cloud.

---

# 34. Offline Notifications

Notifications that depend only on known local schedules may be scheduled locally.

Examples:

- Upcoming bill
- Repayment reminder
- Goal reminder

Notifications requiring server-side intelligence may require cloud processing.

---

# 35. Offline State

The application may maintain:

```text
online
offline
reconnecting
syncing
sync_error
```

Offline status should not prevent local financial operations.

---

# 36. Sync Queue

When cloud sync is enabled, local mutations should be represented in a sync queue.

Conceptual fields:

```text
operation_id
entity_type
entity_id
operation_type
payload
payload_hash
created_at
status
retry_count
last_error
```

---

# 37. Sync Queue Lifecycle

```text
Local Mutation
    ↓
SQLite Commit
    ↓
Create Sync Operation
    ↓
Pending
    ↓
Connectivity
    ↓
Upload
    ↓
Server Response
    ↓
Synced / Conflict / Retry
```

The financial operation and its sync record should be written atomically when necessary.

---

# 38. Sync Queue Reliability

A device restart must not lose pending sync operations.

Therefore:

```text
Financial Mutation
+
Sync Operation
```

must be durable before the mutation is considered complete when sync is enabled.

---

# 39. Idempotency

Every sync operation should have a stable operation identifier.

If the same operation is retried:

```text
Operation ID
    ↓
Server recognizes duplicate
    ↓
No duplicate financial record
```

---

# 40. Local Sync Metadata

The local database may store:

```text
entity_version
server_version
last_synced_at
sync_status
last_sync_error
```

This metadata should remain separate from domain financial fields.

---

# 41. Conflict Handling

When a conflict cannot be resolved automatically:

```text
Sync Conflict
    ↓
Local State Preserved
    ↓
Server State Preserved
    ↓
User Review
```

The application must not silently delete one side of a material financial change.

---

# 42. Local Backup

The local application should support a complete exportable backup.

The backup should include sufficient information to reconstruct:

- Accounts
- Transactions
- Categories
- Tags
- Budgets
- Goals
- Lending
- Borrowing
- Repayments
- Recurring rules
- Settings

Sensitive credentials and transient runtime state should not be embedded in backups unnecessarily.

---

# 43. Backup Format

A versioned structured format is recommended.

Example conceptual structure:

```json
{
  "formatVersion": 1,
  "createdAt": "...",
  "currency": "BDT",
  "accounts": [],
  "transactions": [],
  "budgets": [],
  "goals": [],
  "lending": [],
  "borrowing": []
}
```

The exact format should be finalized in the import/export implementation.

---

# 44. Backup Integrity

A backup should include integrity metadata such as:

- format version
- checksum
- record counts
- created timestamp

The restore process must validate the backup before applying it.

---

# 45. Restore Strategy

Preferred flow:

```text
Select Backup
   ↓
Validate Format
   ↓
Validate Integrity
   ↓
Preview
   ↓
Confirm
   ↓
Restore into Controlled Transaction
   ↓
Rebuild Derived Data
   ↓
Verify
```

A failed restore must not leave the local database partially replaced.

---

# 46. Local Database Migration

SQLite schema changes must use versioned migrations.

Example:

```text
v1
 ↓
v2
 ↓
v3
 ↓
v4
```

The application should detect the current local schema version and execute migrations sequentially.

---

# 47. Migration Rules

Each migration must be:

- Deterministic
- Repeatable only when safe
- Tested
- Versioned
- Backward-aware where practical

Never edit an already-released migration in a way that changes its historical meaning.

Create a new migration instead.

---

# 48. Migration Failure

If a migration fails:

```text
Migration Error
    ↓
Stop Unsafe Startup
    ↓
Protect Existing Data
    ↓
Recovery Path
```

The application should not continue in an unknown database state.

---

# 49. Large Migration Strategy

For large datasets:

- Avoid long blocking migrations where possible.
- Add new columns first.
- Backfill progressively when necessary.
- Validate data.
- Remove old structures only in later migrations.

This is especially important if the application has already accumulated significant financial history.

---

# 50. Local Encryption

Financial data is sensitive.

The application should evaluate:

- database encryption
- OS-protected storage
- encrypted backup
- secure key storage

Encryption strategy must account for:

- Android
- future iOS
- Expo capabilities
- performance
- key recovery

The exact implementation should be finalized in `SECURITY.md`.

---

# 51. Secure Credentials

Authentication credentials and refresh tokens must not be stored as plain SQLite values.

Use platform-secure storage mechanisms.

SQLite should store financial data, not reusable authentication secrets.

---

# 52. Application Lock

Future capability:

```text
App Launch
   ↓
Biometric / PIN
   ↓
Unlock Financial Data
```

This can be especially useful for a personal finance application.

The locking mechanism should be treated as a privacy feature rather than an authentication replacement.

---

# 53. Local Data Deletion

When deleting local financial data:

```text
User Request
   ↓
Confirm
   ↓
Backup Offer
   ↓
Delete
   ↓
Clear Sync Metadata
   ↓
Clear Secure References
   ↓
Verify
```

Deleting local data must not leave stale sync operations that could unexpectedly recreate removed data.

---

# 54. Cache Policy

Not all local data needs identical retention.

## Long-Lived

- Transactions
- Accounts
- Budgets
- Goals
- Obligations

## Short-Lived

- AI loading state
- Temporary search results
- OCR intermediate data
- UI drafts after explicit discard

The application should avoid storing unnecessary duplicates.

---

# 55. AI Cache

AI results may be cached using a context hash.

Example:

```text
Financial Context Hash
       ↓
AI Insight Cache
```

If financial inputs have not materially changed, regeneration may be avoided.

Cache invalidation must be deterministic.

---

# 56. Forecast Cache

Forecast results may also be cached using:

```text
input_snapshot_hash
model_version
forecast_period
```

A forecast should be regenerated when material source inputs change or the model version changes.

---

# 57. Local Event Strategy

The local application may publish internal events such as:

```text
transaction.created
transaction.updated
transaction.deleted

budget.changed
goal.changed
repayment.recorded

sync.status_changed
```

These can be used to invalidate UI queries and derived caches.

Events should remain internal and lightweight.

---

# 58. Local Service Boundaries

Potential services:

```text
DatabaseService
TransactionService
AnalyticsService
NotificationScheduler
SyncService
BackupService
ImportService
ExportService
AIService
```

Services should not become a second unstructured business layer.

Domain boundaries should remain clear.

---

# 59. Storage Performance Targets

The system should prioritize:

- Immediate transaction persistence
- Fast transaction-list scrolling
- Fast search
- Fast account balance reads
- Fast dashboard rendering

Expensive operations should run asynchronously when practical.

---

# 60. Large Dataset Expectations

The local architecture should be designed to remain usable with at least:

```text
10,000+ transactions
```

and should be architecturally capable of growing beyond that.

Exact performance limits must be verified on real devices.

---

# 61. Rendering Performance

Transaction and analytics screens should use:

- Virtualized lists
- Memoized rows where appropriate
- Stable keys
- Incremental data loading
- Deferred heavy calculations

The database should never force the UI to render unnecessary data.

---

# 62. Background Work

Potential background work:

- Sync
- Forecast recalculation
- AI insight preparation
- Receipt processing
- Reminder scheduling
- Backup
- Import/export processing

Platform background execution limits must be respected.

---

# 63. Background Failure Handling

Every background operation should support:

- retry
- backoff
- cancellation where appropriate
- error persistence
- observability

A failed background operation must not corrupt the financial ledger.

---

# 64. Network Abstraction

The local storage layer should not directly depend on raw network libraries.

Preferred:

```text
Feature
 ↓
Repository
 ↓
Sync / API Client
 ↓
Network
```

This makes offline operation and testing easier.

---

# 65. Testing Local Storage

Tests should cover:

## CRUD

- Create
- Read
- Update
- Delete
- Restore

## Financial

- Transfer
- Refund
- Repayment
- Budget calculation
- Goal progress

## Persistence

- App restart
- Migration
- Interrupted operation
- Backup restore

## Sync

- Queue creation
- Retry
- Idempotency
- Conflict

---

# 66. Local Storage Failure Handling

Possible failures:

- Disk full
- Database corruption
- Migration failure
- Permission/storage error
- Interrupted write

User-facing behavior should remain understandable.

Example:

> "We couldn't save this transaction locally. Please free some storage and try again."

No false success state should be shown.

---

# 67. Disk Space

The application should consider:

- transaction volume
- attachments
- backups
- OCR images
- temporary files

Temporary processing files should be cleaned after completion.

---

# 68. Attachment Storage

Large files should not be stored inside ordinary transaction rows.

Preferred:

```text
Transaction
   ↓
Attachment Metadata
   ↓
File Storage
```

The mobile device may use application storage for local offline access.

---

# 69. Attachment Lifecycle

```text
Select / Capture
   ↓
Validate
   ↓
Persist Local File
   ↓
Create Metadata
   ↓
Associate Entity
   ↓
Sync if enabled
```

Failed file uploads must not remove the financial transaction itself.

---

# 70. OCR Intermediate Storage

OCR images may be temporarily stored.

After successful extraction:

```text
Keep Original
OR
Delete Temporary Copy
```

depending on user settings and receipt-storage requirements.

Do not retain unnecessary duplicates.

---

# 71. Local Privacy Boundary

The app should assume that the local device may be accessible to someone other than the owner.

Therefore, the product should consider:

- App lock
- Secure backups
- Protected credentials
- Sensitive notification content

The precise threat model belongs in `SECURITY.md`.

---

# 72. Local Data Export

Export should read from the local source of truth.

Example:

```text
SQLite
 ↓
Export Service
 ↓
CSV / JSON / Report
```

Cloud connectivity should not be required for a local export.

---

# 73. Local Search and Filtering

Search/filter logic should prefer local queries.

A user should be able to search historical transactions while offline.

Filters should not require a server request.

---

# 74. Local Reports

Core reports should work offline when all required data exists locally.

Examples:

- Monthly expenses
- Category spending
- Budget usage
- Goal progress
- Lending/borrowing summaries

---

# 75. Local AI Boundary

Without network access:

```text
Core Financial Features → Available

Local Analytics → Available

Simple Forecasting → Potentially Available

Cloud AI → Unavailable unless local model exists
```

The UI should clearly distinguish local intelligence from unavailable cloud services.

---

# 76. Local Storage Anti-Patterns

Avoid:

- Using AsyncStorage as the main financial database
- Storing complete financial state in global memory only
- Writing raw SQL from UI components
- Storing authentication secrets in SQLite
- Treating cached balances as financial truth
- Blocking transaction saves on network calls
- Loading entire transaction history into memory
- Performing expensive calculations on the UI thread
- Ignoring migration failures
- Storing unnecessary raw AI content

---

# 77. Recommended Mobile Data Flow

For a transaction:

```text
User
 ↓
Transaction Composer
 ↓
Validation
 ↓
Use Case
 ↓
Transaction Repository
 ↓
SQLite Transaction
 ├── transactions
 ├── related metadata
 └── sync_operations (if enabled)
 ↓
Commit
 ↓
Invalidate / Update Queries
 ↓
UI
```

---

# 78. Recommended Read Flow

```text
Screen
 ↓
Query Hook
 ↓
Repository
 ↓
SQLite
 ↓
Domain Mapping
 ↓
View Model
 ↓
UI
```

The screen should not know how the data is stored.

---

# 79. Sync-Aware Repository Flow

When cloud sync is enabled:

```text
Feature
 ↓
Repository
 ↓
Local Database
 ↓
Sync Operation
 ↓
Sync Worker
 ↓
API
```

A successful user action should not wait for the sync worker.

---

# 80. Local Storage Quality Bar

The local storage architecture is acceptable when:

- Transactions can be recorded fully offline.
- Local writes are durable.
- Database migrations are safe.
- Financial amounts are represented accurately.
- Search remains fast.
- Large transaction lists remain smooth.
- Derived values can be rebuilt.
- Sync operations are durable.
- Duplicate sync requests are safe.
- Backups can be created and restored.
- Sensitive credentials are not stored insecurely.
- Local failures never produce false financial success.
- The architecture can evolve without replacing the entire storage layer.

---

# 81. Relationship With Other Documents

Architecture sequence:

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

This document defines **how the application's local financial data is persisted and used on the device**.

The next document is:

```text
docs/architecture/SYNC_ARCHITECTURE.md
```

It should define:

- Device sync model
- Server synchronization
- Change tracking
- Sync queues
- Conflict resolution
- Versioning
- Idempotency
- Offline-to-online transitions
- Multi-device synchronization
- Failure and retry behavior
- Data reconciliation

The core sync principle remains:

> **Local financial data must remain immediately usable; synchronization should make it available across devices without sacrificing correctness or user control.**
