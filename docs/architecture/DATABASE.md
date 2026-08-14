# Personal Finance — Database Architecture

**Document:** `DATABASE.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**Server Database:** PostgreSQL  
**ORM:** Prisma  
**Local Database:** SQLite  
**Architecture:** Offline-first, cloud-sync ready

---

# 1. Purpose

This document defines the authoritative data model for the Personal Finance application.

It establishes:

- Core entities
- Relationships
- Ownership rules
- Monetary representation
- Transaction modeling
- Account modeling
- Lending and borrowing
- Repayments
- Budgets
- Goals
- Recurring finance
- Notifications
- Attachments
- Synchronization metadata
- Audit fields
- Soft deletion
- Indexing
- Constraints
- Migration strategy

The database must preserve the most important product requirement:

> **Financial facts must remain accurate, reconstructable, and trustworthy from authoritative source data.**

---

# 2. Database Principles

## 2.1 Source Data vs Derived Data

Authoritative source data includes:

- Accounts
- Transactions
- Categories
- Budgets
- Goals
- Lending records
- Borrowing records
- Repayments
- Recurring rules

Derived data includes:

- Current balance
- Budget utilization
- Savings rate
- Forecast
- Financial health score
- Anomaly score

Derived values must not silently replace source financial facts.

---

## 2.2 User Ownership

Every user-owned record must be traceable to its owner.

Conceptually:

```text
User
  ↓
Financial Resources
  ↓
Transactions / Budgets / Goals / Obligations
```

Future shared-finance functionality may introduce workspace-level ownership, but current personal data must remain explicitly scoped.

---

## 2.3 Historical Integrity

Historical transactions must remain understandable even when:

- categories change
- accounts are archived
- tags are removed
- budgets are replaced
- recurring rules are modified

Do not rewrite historical financial meaning simply because current configuration changes.

---

## 2.4 Monetary Precision

Financial values must never rely on binary floating-point arithmetic as the authoritative representation.

Recommended server representation:

```text
PostgreSQL NUMERIC / DECIMAL
```

with an application-level decimal library where required.

The exact precision/scale should be finalized before production migration.

---

# 3. Entity Relationship Overview

```text
User
│
├── Accounts
│    │
│    └── Transactions
│           ├── Category
│           ├── Tags
│           ├── Attachments
│           └── Recurring Rule
│
├── Budgets
│
├── Goals
│
├── Lending Records
│    └── Repayments
│
├── Borrowing Records
│    └── Repayments
│
├── Notifications
│
├── Files / Attachments
│
└── Sync Metadata
```

---

# 4. Core Entity List

The initial data model includes:

```text
User
UserSettings

Account
AccountType

Category
Tag
Transaction
TransactionTag
TransactionAttachment

Budget
BudgetCategory

RecurringTransaction
Bill
Subscription

Person

LendingRecord
BorrowingRecord
Repayment

FinancialGoal
GoalContribution

Notification
NotificationPreference

File
Attachment

SyncDevice
SyncOperation

AIInsight
AIRecommendation
AIConversation
AIMessage

Forecast
ForecastRun

AuditLog
```

Not every conceptual type needs to become a separate database table. Some may be enums or implementation-level abstractions.

---

# 5. User

## Purpose

Represents a cloud-enabled application user.

## Suggested Fields

```text
id
email
display_name
avatar_url
locale
timezone
base_currency
created_at
updated_at
deleted_at
```

## Rules

- `id` must be globally unique.
- Email uniqueness applies to active accounts.
- Timezone must be explicit for scheduled financial events.
- Base currency must be valid.
- `deleted_at` supports controlled account deletion workflows.

---

# 6. User Settings

Settings should be separated from identity where practical.

## Suggested Fields

```text
id
user_id
theme
default_account_id
default_category_id
notifications_enabled
ai_enabled
analytics_enabled
created_at
updated_at
```

Not all settings must be persisted in one table if implementation requirements differ.

---

# 7. Account

## Purpose

Represents a place where money is held, tracked, or managed.

## Examples

- Cash
- Bank
- Savings
- bKash
- Nagad
- Credit Card
- Other

## Suggested Fields

```text
id
user_id
name
type
currency
opening_balance
opening_balance_date
is_archived
display_order
institution_name
account_identifier_masked
created_at
updated_at
deleted_at
```

## Rules

- Account belongs to exactly one owner.
- Historical transactions may remain associated with archived accounts.
- Deleting an account with financial history should normally result in archival or controlled deletion, not destructive removal.
- `account_identifier_masked` must never store sensitive credentials.

---

# 8. Account Types

Possible enum:

```text
CASH
BANK
SAVINGS
MOBILE_WALLET
CREDIT_CARD
OTHER
```

Future types may include:

```text
INVESTMENT
LOAN
DIGITAL_ASSET
```

These should not be enabled until corresponding financial semantics are defined.

---

# 9. Category

## Purpose

Classifies transaction activity.

## Suggested Fields

```text
id
user_id nullable
parent_id nullable
name
type
icon
color_token
display_order
is_system
is_archived
created_at
updated_at
deleted_at
```

## Category Type

At minimum:

```text
EXPENSE
INCOME
```

Transfer should generally not require normal income/expense categories.

---

# 10. Category Hierarchy

Categories may form a tree:

```text
Food
├── Groceries
├── Restaurant
├── Coffee
└── Delivery
```

Rules:

- No cyclic parent relationship.
- Parent and child should have compatible category types.
- Archived categories may remain referenced by historical transactions.

---

# 11. Tag

## Purpose

Provides flexible contextual classification.

## Suggested Fields

```text
id
user_id
name
color_token
created_at
updated_at
deleted_at
```

Examples:

```text
Work
Personal
Travel
Emergency
Family
Reimbursable
```

---

# 12. Transaction

## Purpose

Represents a financial event.

## Transaction Types

```text
EXPENSE
INCOME
TRANSFER
REFUND
ADJUSTMENT
```

## Suggested Fields

```text
id
user_id
type
account_id
category_id nullable
merchant_name nullable
amount
currency
transaction_date
note nullable
source
status
created_at
updated_at
deleted_at
```

Potential future fields:

```text
location
payment_method
external_reference
```

---

# 13. Transaction Amount Rules

The authoritative `amount` should represent a positive monetary magnitude.

Direction is represented through `type`.

Examples:

```text
EXPENSE
amount = 450

INCOME
amount = 50000
```

This avoids ambiguous negative values at the domain level.

Derived balance logic determines the direction of the financial effect.

---

# 14. Transaction Source

Useful source values:

```text
MANUAL
QUICK_ENTRY
VOICE
OCR
IMPORT
SYNC
RECURRING
SYSTEM
```

This supports analytics, debugging, and user trust.

---

# 15. Transaction Status

Possible values:

```text
POSTED
PENDING
VOIDED
```

The initial product may only need `POSTED`, with additional states introduced when external integrations require them.

---

# 16. Transfer Modeling

A transfer represents movement between two user-owned accounts.

A robust model should maintain:

```text
Transfer
├── Source Account
├── Destination Account
└── Amount
```

Implementation options include:

### Option A — Transfer Group

Two linked transaction records with a shared transfer identifier.

### Option B — Dedicated Transfer Entity

A dedicated transfer entity references two accounts.

The preferred initial approach is a **linked transaction representation with a stable transfer group identifier**, because it keeps account activity and transaction history naturally connected.

---

# 17. Transfer Rules

For transfer amount `X`:

```text
Source Account
    - X

Destination Account
    + X
```

And:

```text
Income += 0
Expense += 0
```

A transfer must never alter savings calculations as if it were income or expense.

---

# 18. Refund Modeling

A refund should reference the original expense where possible.

Suggested fields:

```text
refund_transaction_id
original_transaction_id
```

A refund should remain distinguishable from unrelated income.

---

# 19. Adjustment Modeling

Adjustments exist for controlled reconciliation.

They should be used sparingly.

Examples:

- Correcting opening balance
- Reconciliation difference
- Controlled administrative adjustment

Adjustments should carry a reason/note.

---

# 20. Transaction Tags

Many-to-many relationship:

```text
Transaction
    ↕
TransactionTag
    ↕
Tag
```

Suggested fields:

```text
transaction_id
tag_id
created_at
```

Unique constraint:

```text
(transaction_id, tag_id)
```

---

# 21. Persons

## Purpose

Represents people involved in lending and borrowing.

## Suggested Fields

```text
id
user_id
name
email nullable
phone nullable
note nullable
created_at
updated_at
deleted_at
```

Privacy rule:

Store only information necessary for the feature.

---

# 22. Lending Record

Represents money owed to the user.

## Suggested Fields

```text
id
user_id
person_id
amount
currency
lent_at
expected_repayment_date nullable
note nullable
status
created_at
updated_at
deleted_at
```

Possible status:

```text
ACTIVE
PARTIALLY_REPAID
FULLY_REPAID
OVERDUE
CANCELLED
```

---

# 23. Borrowing Record

Represents money owed by the user.

## Suggested Fields

```text
id
user_id
person_id
amount
currency
borrowed_at
expected_repayment_date nullable
note nullable
status
created_at
updated_at
deleted_at
```

---

# 24. Repayment

Repayments should be modeled as independent events.

## Suggested Fields

```text
id
user_id
lending_record_id nullable
borrowing_record_id nullable
account_id
amount
currency
repaid_at
note nullable
created_at
updated_at
deleted_at
```

## Constraint

Exactly one of:

```text
lending_record_id
borrowing_record_id
```

must be populated.

---

# 25. Repayment Balance

For lending:

```text
Outstanding
=
Original Lent Amount
-
Valid Repayments
```

For borrowing:

```text
Outstanding
=
Original Borrowed Amount
-
Valid Repayments
```

The balance must be derived deterministically.

---

# 26. Repayment Constraints

Unless overpayment is deliberately supported:

```text
repayment_amount <= outstanding_amount
```

Repayments should not be allowed to silently create negative obligations.

---

# 27. Budget

## Purpose

Represents a planned spending limit.

## Suggested Fields

```text
id
user_id
name
amount
currency
period_type
start_date
end_date
category_id nullable
status
alert_configuration
created_at
updated_at
deleted_at
```

Possible period types:

```text
WEEK
MONTH
CUSTOM
```

---

# 28. Budget Categories

A budget may optionally target multiple categories.

Possible implementation:

```text
Budget
   ↕
BudgetCategory
   ↕
Category
```

This supports more flexible budgeting without forcing one budget per category.

---

# 29. Budget Calculation

At minimum:

```text
Spent
=
Sum of qualifying expense transactions
```

Then:

```text
Remaining
=
Budget Amount - Spent
```

Utilization:

```text
Utilization %
=
Spent / Budget Amount × 100
```

The exact inclusion/exclusion rules must be defined explicitly in the budgeting module.

---

# 30. Recurring Transaction

## Purpose

Defines a rule for future financial events.

## Suggested Fields

```text
id
user_id
type
account_id
category_id nullable
amount
currency
frequency
interval_value
start_date
end_date nullable
next_occurrence
description
auto_create
is_active
created_at
updated_at
deleted_at
```

---

# 31. Recurrence Rules

Potential frequencies:

```text
DAILY
WEEKLY
MONTHLY
YEARLY
CUSTOM
```

The implementation must define behavior for:

- month-end dates
- leap years
- daylight-saving changes in supported time zones
- missed occurrences
- paused rules

---

# 32. Bill

A bill represents a recurring financial obligation.

Suggested fields:

```text
id
user_id
name
amount
currency
account_id nullable
frequency
next_due_date
category_id nullable
status
created_at
updated_at
deleted_at
```

A bill may create a transaction through a recurring rule but should not itself be treated as a transaction.

---

# 33. Subscription

A subscription is a recurring service commitment.

Suggested fields:

```text
id
user_id
name
amount
currency
account_id nullable
category_id nullable
billing_frequency
next_billing_date
status
created_at
updated_at
deleted_at
```

Future analytics may compare recurring subscription costs over time.

---

# 34. Financial Goal

## Purpose

Represents a savings target.

## Suggested Fields

```text
id
user_id
name
target_amount
currency
target_date nullable
status
created_at
updated_at
deleted_at
```

Possible status:

```text
ACTIVE
COMPLETED
PAUSED
ARCHIVED
```

---

# 35. Goal Contribution

A goal contribution is a record of progress toward a goal.

## Suggested Fields

```text
id
goal_id
amount
currency
contributed_at
source_transaction_id nullable
note nullable
created_at
updated_at
deleted_at
```

If linked to a real transaction, duplication must be prevented.

---

# 36. Goal Calculation

Basic progress:

```text
Current Amount
=
Sum of valid goal contributions
```

Progress percentage:

```text
Current Amount / Target Amount × 100
```

Required contribution depends on:

- current amount
- target amount
- target date
- contribution schedule

---

# 37. Notification

## Purpose

Stores user-visible notification state where persistence is required.

## Suggested Fields

```text
id
user_id
type
title
body
priority
scheduled_at
sent_at nullable
read_at nullable
status
entity_type nullable
entity_id nullable
created_at
updated_at
```

Possible priorities:

```text
LOW
NORMAL
HIGH
CRITICAL
```

---

# 38. Notification Preferences

Preferences should be configurable per category.

Potential categories:

```text
BUDGET
BILL
GOAL
REPAYMENT
RECURRING
AI
SYSTEM
```

Suggested fields:

```text
user_id
notification_type
enabled
channel
schedule_config
```

---

# 39. File

A file represents an uploaded asset.

## Suggested Fields

```text
id
user_id
storage_key
original_name
mime_type
size_bytes
checksum
created_at
deleted_at
```

Files should not contain business semantics by themselves.

---

# 40. Attachment

Attachment associates a file with a business entity.

Possible fields:

```text
id
file_id
entity_type
entity_id
created_at
```

Example:

```text
Transaction
   ↓
Attachment
   ↓
Receipt File
```

Polymorphic attachments require careful integrity handling because database foreign keys cannot naturally enforce arbitrary entity types.

A typed attachment design may be preferable for critical records.

---

# 41. Sync Device

Represents a client device participating in synchronization.

Suggested fields:

```text
id
user_id
device_identifier
platform
app_version
last_seen_at
last_sync_at
created_at
revoked_at
```

Device identifiers must not unnecessarily expose sensitive hardware identifiers.

---

# 42. Sync Operation

Represents a local or server synchronization mutation.

Suggested fields:

```text
id
device_id
entity_type
entity_id
operation_type
operation_version
payload_hash
created_at
processed_at
status
retry_count
last_error
```

---

# 43. Sync Operation Types

Possible:

```text
CREATE
UPDATE
DELETE
RESTORE
```

The exact operation model may evolve during `SYNC_ARCHITECTURE.md`.

---

# 44. AI Insight

Stores generated analytical insight where persistence is useful.

Suggested fields:

```text
id
user_id
type
title
summary
context_hash
severity
generated_at
expires_at nullable
status
created_at
updated_at
```

AI insight records should not become financial truth.

---

# 45. AI Recommendation

Suggested fields:

```text
id
user_id
insight_id nullable
title
summary
reason
status
generated_at
expires_at nullable
created_at
updated_at
```

Possible status:

```text
NEW
VIEWED
DISMISSED
ACCEPTED
EXPIRED
```

Acceptance means the user accepted the recommendation, not that an action was automatically executed.

---

# 46. AI Conversation

## Suggested Fields

```text
id
user_id
title nullable
created_at
updated_at
archived_at nullable
```

---

# 47. AI Message

Suggested fields:

```text
id
conversation_id
role
content
provider
model
created_at
```

Sensitive raw prompts/responses should be retained only when product requirements and privacy policy justify it.

Prefer storing minimized metadata where possible.

---

# 48. Forecast

A forecast represents a calculated prediction.

Suggested fields:

```text
id
user_id
type
period_start
period_end
prediction_value
currency
confidence_score nullable
model_version
input_snapshot_hash
created_at
expires_at nullable
```

Forecast records must clearly distinguish prediction from actual financial values.

---

# 49. Forecast Run

If forecast computation is asynchronous, a separate run model may be useful.

Suggested fields:

```text
id
user_id
type
model_version
status
started_at
completed_at nullable
error nullable
created_at
```

---

# 50. Audit Log

Audit records are recommended for security-sensitive and administrative operations.

Suggested fields:

```text
id
user_id nullable
actor_type
actor_id nullable
action
entity_type
entity_id
metadata
created_at
```

Do not use audit logs as a replacement for the financial ledger.

---

# 51. Audit Scope

Potential audited actions:

- Account changes
- Sensitive financial adjustments
- Data deletion
- Data restoration
- Authentication events
- Sync conflict resolution
- AI configuration changes

The level of auditing should reflect privacy and regulatory requirements.

---

# 52. Common Fields

Most mutable entities should use:

```text
id
created_at
updated_at
deleted_at nullable
```

Where distributed synchronization is required, additional versioning fields may be used:

```text
version
updated_by_device
```

---

# 53. UUID / Identifier Strategy

Use stable globally unique identifiers.

Recommended:

```text
UUID / UUID-compatible identifier
```

Reasons:

- Offline creation
- Multi-device synchronization
- Low collision risk
- Distributed operation

A client should be able to generate IDs before contacting the server.

---

# 54. Soft Deletion

Soft deletion may be used for synchronized user-owned records.

Example:

```text
deleted_at = timestamp
```

Rules:

- Deleted records should not appear in normal queries.
- Synchronization must propagate deletion state.
- Permanent deletion should happen only after explicit retention rules.
- Historical financial integrity must be preserved.

---

# 55. Archive vs Delete

The application should distinguish:

## Archive

The record remains part of historical data but is no longer active.

## Delete

The record is intentionally removed or marked deleted.

Examples:

```text
Account → Archive
Category → Archive
Subscription → Archive
```

Permanent deletion should be much more restricted.

---

# 56. Referential Integrity

Use foreign keys for relationships that must remain valid.

Examples:

```text
Transaction → Account
Transaction → Category
Repayment → Account
Repayment → Lending / Borrowing
GoalContribution → Goal
Budget → User
```

Do not rely solely on application code for core referential integrity.

---

# 57. Delete Behavior

Foreign-key delete behavior must be deliberate.

Examples:

```text
User deletion
→ controlled cascade / anonymization

Category deletion
→ archive or reassign

Account deletion
→ normally prevent if historical transactions exist

Goal deletion
→ preserve historical contribution data where required
```

No blanket cascading delete should be applied to financial entities without explicit review.

---

# 58. Uniqueness Constraints

Examples:

```text
User.email
Unique active account name per user where appropriate
User + Tag name
User + Category name within scope
TransactionTag(transaction_id, tag_id)
Device identifier per user
```

Unique constraints must reflect product semantics, not simply implementation convenience.

---

# 59. Indexing Strategy

High-value indexes should cover common query patterns.

Likely indexes:

```text
Transaction(user_id, transaction_date)
Transaction(user_id, account_id, transaction_date)
Transaction(user_id, category_id, transaction_date)
Transaction(user_id, type, transaction_date)

Budget(user_id, status)
Goal(user_id, status)

LendingRecord(user_id, status, expected_repayment_date)
BorrowingRecord(user_id, status, expected_repayment_date)

Notification(user_id, status, scheduled_at)

SyncOperation(device_id, status, created_at)
```

The final schema should be validated using actual query plans.

---

# 60. Indexing Rule

Do not create indexes simply because a column exists.

Every additional index has:

- storage cost
- write cost
- maintenance cost

Indexes should correspond to real queries.

---

# 61. Transaction Date and Timestamp

The system should distinguish:

```text
transaction_date
created_at
updated_at
```

`transaction_date` is the financial event time.

`created_at` is the record creation time.

This distinction is important for:

- historical imports
- offline entry
- reporting
- synchronization
- analytics

---

# 62. Time Zone Strategy

Persist timestamps in UTC where appropriate.

Interpret scheduled/financial calendar events using the user's configured timezone.

This is especially important for:

- monthly budgets
- recurring transactions
- reminders
- reports
- daily spending
- due dates

---

# 63. Currency Strategy

Each monetary record should preserve its currency.

Recommended fields:

```text
amount
currency
```

Future multi-currency features may also require:

```text
base_amount
base_currency
exchange_rate
exchange_rate_date
```

Do not overwrite original transaction amounts during currency conversion.

---

# 64. Opening Balance

An account may contain:

```text
opening_balance
opening_balance_date
```

The opening balance is part of the account's financial starting state.

Future adjustments should not silently rewrite historical transaction history.

---

# 65. Balance Calculation

Conceptually:

```text
Current Balance
=
Opening Balance
+
Positive Financial Effects
-
Negative Financial Effects
```

The exact effect mapping depends on transaction type.

Transfer handling must prevent double counting.

---

# 66. Budget Calculation Boundary

A budget should not store `spent_amount` as the authoritative financial value unless there is a carefully maintained aggregate model.

Preferred:

```text
Transactions
      ↓
Budget Query / Aggregation
      ↓
Spent
```

For performance, cached/materialized aggregates may be introduced later.

---

# 67. Goal Calculation Boundary

Similarly:

```text
Goal Contributions
      ↓
Current Goal Amount
```

The goal target remains source data.

Projected completion is derived.

---

# 68. Lending Calculation Boundary

```text
LendingRecord.amount
-
Repayments
=
Outstanding
```

Do not manually mutate an `outstanding_amount` field without maintaining an explicit reconciliation mechanism.

If an optimization introduces a cached balance, it must remain derivable and testable against source records.

---

# 69. Borrowing Calculation Boundary

```text
BorrowingRecord.amount
-
Repayments
=
Outstanding
```

Same reconciliation rules apply.

---

# 70. Recurring Rule vs Transaction

A recurring rule is not itself a financial transaction.

Conceptual separation:

```text
Recurring Rule
      ↓
Occurrence
      ↓
Transaction
```

This prevents future schedules from appearing as already-spent money.

---

# 71. Bill vs Transaction

A bill represents an expected obligation.

A transaction represents actual financial activity.

The system must not assume that a bill has been paid simply because the due date arrived.

---

# 72. Subscription vs Transaction

A subscription describes a recurring commitment.

Actual subscription charges should remain transactions.

This allows:

- historical tracking
- price changes
- missed payments
- refunds

to be represented correctly.

---

# 73. Notification vs Business Event

A notification is not the business event itself.

For example:

```text
Repayment Due
     ↓
Notification
```

If the notification fails, the repayment state remains unchanged.

---

# 74. AI Data Storage

AI-generated records should reference source context indirectly.

Useful identifiers include:

```text
context_hash
input_snapshot_hash
source_period
```

This helps determine whether an insight is still relevant without storing unnecessary raw financial content.

---

# 75. AI Retention

AI conversations and generated insights may contain sensitive information.

Retention policies should support:

- User deletion
- Optional history retention
- Automatic expiration
- Provider-independent storage

Do not retain raw AI interactions indefinitely by default without a product justification.

---

# 76. Data Classification

Suggested classification:

## Highly Sensitive

- Financial transactions
- Account balances
- Lending/borrowing
- AI financial context
- Authentication credentials

## Sensitive

- Email
- Phone
- Attachments
- Financial goals

## Operational

- App version
- Sync status
- Non-sensitive settings

Logs must respect these classifications.

---

# 77. Local vs Server Schema

The local SQLite model does not have to be identical to PostgreSQL.

However, both should represent compatible domain semantics.

Differences may exist for:

- local-only metadata
- sync state
- indexes
- device state
- temporary drafts

The domain meaning should remain consistent.

---

# 78. Sync Metadata Separation

Synchronization metadata should not pollute core financial semantics.

Prefer:

```text
Financial Entity
+
Sync Metadata
```

rather than making every business field about synchronization.

---

# 79. Draft Data

Short-lived UI drafts should not automatically become committed financial entities.

A draft may contain:

```text
draft_id
entity_type
payload
created_at
updated_at
```

Only explicit user submission should create a committed financial record.

---

# 80. Import Metadata

Imported transactions may need:

```text
source
external_reference
import_batch_id
```

This helps with:

- duplicate detection
- import rollback
- source tracing

---

# 81. Import Batch

An import batch may contain:

```text
id
user_id
source_type
filename
record_count
status
created_at
completed_at
```

This makes large imports traceable.

---

# 82. Reconciliation

Future bank integrations will require reconciliation between external records and internal transactions.

The schema should eventually support:

```text
external_reference
external_account_id
reconciliation_status
```

These should not be introduced prematurely unless the feature requires them.

---

# 83. Data Validation

Validation must exist at multiple layers:

```text
UI
 ↓
Application / API
 ↓
Database Constraints
```

Examples:

- positive amounts
- valid currency
- valid dates
- ownership
- repayment limits
- valid foreign keys

---

# 84. Database Transactions

Use database transactions for operations that must be atomic.

Examples:

## Transfer

```text
Create source effect
+
Create destination effect
```

## Repayment

```text
Create repayment
+
Update required derived state
```

## Import

```text
Validate batch
+
Commit valid records
```

The exact atomic boundaries should be defined by domain services.

---

# 85. Concurrency

The backend must consider concurrent updates from:

- multiple devices
- background synchronization
- retrying requests
- workers

Use:

- database transactions
- optimistic versioning
- unique constraints
- idempotency

where appropriate.

---

# 86. Optimistic Versioning

Entities participating in synchronization may include:

```text
version
```

or an equivalent concurrency token.

A stale update can then be detected instead of silently overwriting newer data.

---

# 87. Database Migration Strategy

All schema changes must be version-controlled.

Typical workflow:

```text
Change Schema
   ↓
Generate Migration
   ↓
Review SQL
   ↓
Test Migration
   ↓
Apply in Staging
   ↓
Verify
   ↓
Production
```

Never modify production schema manually without a reproducible migration.

---

# 88. Migration Safety

High-risk migrations should consider:

- Existing data volume
- Lock duration
- Backward compatibility
- Rollback strategy
- Mobile client compatibility
- Background worker compatibility

Large data migrations should be staged where necessary.

---

# 89. Seed Data

System categories may be seeded for new users.

Example:

```text
Food
Transport
Housing
Bills
Health
Shopping
Entertainment
Education
Travel
Personal
Other
```

System categories should be distinguishable from user-created categories.

---

# 90. Test Data

Test data should be deterministic and generated independently from production.

Tests should cover:

- empty data
- normal usage
- large data
- edge amounts
- multiple currencies
- partial repayments
- deleted/archived references
- sync conflicts

---

# 91. Database Testing

Database tests should validate:

- Constraints
- Foreign keys
- Unique indexes
- Financial calculations
- Transaction atomicity
- Migrations
- Authorization scoping
- Reconciliation

---

# 92. Backup Requirements

Production PostgreSQL must have:

- Automated backups
- Retention policy
- Encryption
- Restore procedure
- Restore testing

The backup system must be independent enough to recover from application-level failures.

---

# 93. Data Deletion

User-requested deletion must define:

- What is deleted immediately
- What is retained temporarily
- What is anonymized
- What is removed from backups later

The exact retention policy should be documented before cloud launch.

---

# 94. Privacy Requirements

The schema should minimize unnecessary personal information.

Do not collect:

- contacts
- location
- identifiers
- metadata

unless a product feature requires them.

Data collection must have a defined purpose.

---

# 95. Database Anti-Patterns

Avoid:

- Storing balances as unverified truth
- Floating-point monetary values
- Hard deleting historical financial entities casually
- Unscoped user queries
- Missing foreign-key constraints
- Unversioned schema changes
- Giant JSON blobs for core financial records
- Storing AI as financial truth
- Using Redis as primary persistence
- Duplicate authoritative fields without reconciliation

---

# 96. Recommended Initial Prisma Model Groups

The Prisma schema should eventually be organized around logical groups:

```text
Identity
├── User
└── UserSettings

Finance
├── Account
├── Transaction
├── Category
├── Tag
└── TransactionTag

Planning
├── Budget
├── BudgetCategory
├── FinancialGoal
└── GoalContribution

Recurring
├── RecurringTransaction
├── Bill
└── Subscription

Obligations
├── Person
├── LendingRecord
├── BorrowingRecord
└── Repayment

Platform
├── Notification
├── File
├── Attachment
├── SyncDevice
└── SyncOperation

Intelligence
├── Forecast
├── ForecastRun
├── AIInsight
├── AIRecommendation
├── AIConversation
└── AIMessage

Audit
└── AuditLog
```

The actual Prisma schema should remain a single coherent schema with clear relations unless deployment or ownership requirements justify splitting it.

---

# 97. Initial Database Priority

The first schema implementation should prioritize:

```text
User
Account
Category
Tag
Transaction
TransactionTag
Budget
FinancialGoal
LendingRecord
BorrowingRecord
Person
Repayment
RecurringTransaction
Notification
```

Then expand into:

```text
Files
Reports
Forecast
AI
Sync
Audit
```

The schema should not delay initial development with unsupported future abstractions.

---

# 98. Database Quality Bar

The database design is acceptable when:

- Financial source data is authoritative.
- Money is represented safely.
- Ownership is enforced.
- Historical data remains traceable.
- Core relationships use constraints.
- Important operations are transactional.
- Sync metadata is separated from business meaning.
- Derived values remain reproducible.
- Migrations are version-controlled.
- Indexes reflect real queries.
- Backup and restore are viable.
- Privacy boundaries are clear.

---

# 99. Relationship With Other Architecture Documents

The architecture documentation sequence is:

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

This document defines the authoritative **domain data model**.

The next document should define how that model is implemented efficiently and safely inside the mobile application:

```text
docs/architecture/LOCAL_STORAGE.md
```

It should cover:

- SQLite implementation
- Mobile schema
- Repository layer
- Local transactions
- Offline queries
- Drafts
- Local migrations
- Sync queue
- Device-side indexing
- Data retention
- Encryption considerations
- Local backup
- Performance
- Large datasets
