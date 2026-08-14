# Personal Finance — Lending & Borrowing Module

**Document:** `LENDING_BORROWING.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Module:** Lending & Borrowing  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL + Prisma  
**Local Database:** SQLite

---

# 1. Purpose

The Lending & Borrowing module manages money that is owed:

- **to the user** by other people
- **by the user** to other people

This is a first-class financial domain, not a simple note-taking feature.

The module must make it difficult to forget:

- who owes whom
- how much remains
- when repayment was expected
- how much has already been repaid
- whether an obligation is overdue
- what reminders have been configured

The primary product principle is:

> **Never lose track of money simply because repayment was easy to forget.**

---

# 2. Scope

The module includes:

```text
People
Lending
Borrowing
Repayments
Expected Repayment Dates
Partial Repayment
Full Repayment
Overdue Tracking
Reminder Scheduling
Local Notifications
Email Reminders
History
Search
Filtering
Analytics
Sync
Export
```

Future integrations may include:

- Messaging
- WhatsApp
- SMS
- Calendar
- Contact suggestions

These are not required for the initial implementation.

---

# 3. Core Concepts

The module distinguishes four concepts:

## Lending

Money the user has given to another person and expects to receive back.

## Borrowing

Money the user has received from another person and expects to repay.

## Repayment

A payment reducing an outstanding lending or borrowing balance.

## Reminder

A notification about an upcoming or overdue obligation.

---

# 4. Domain Model

```text
Person
   │
   ├── Lending Records
   │       └── Repayments
   │
   └── Borrowing Records
           └── Repayments
```

A person can be involved in both directions.

Example:

```text
Rahim

You lent him:
৳10,000

You borrowed from him:
৳3,000
```

These must remain separate obligations.

---

# 5. Person

## Purpose

Represents a real person involved in lending or borrowing.

## Required

- Name

## Optional

- Email
- Phone
- Note

The module should not require importing the device contact list.

---

# 6. Person Ownership

Every person record belongs to the current user.

A user must not be able to access another user's people through manipulated IDs.

---

# 7. Person Deduplication

The system should help avoid duplicate people.

Example:

```text
Rahim
rahim
Md Rahim
```

The application may suggest potential duplicates.

It should not automatically merge records without user confirmation.

---

# 8. Lending Record

A lending record represents money owed to the user.

## Required

- Person
- Original amount
- Currency
- Lending date

## Optional

- Expected repayment date
- Note
- Reminder schedule
- Attachment

---

# 9. Borrowing Record

A borrowing record represents money owed by the user.

## Required

- Person
- Original amount
- Currency
- Borrowing date

## Optional

- Expected repayment date
- Note
- Reminder schedule
- Attachment

---

# 10. Lending Status

Possible lifecycle status:

```text
ACTIVE
PARTIALLY_REPAID
FULLY_REPAID
OVERDUE
CANCELLED
ARCHIVED
```

`OVERDUE` can be treated as a derived status rather than a manually stored state when appropriate.

---

# 11. Borrowing Status

Same lifecycle:

```text
ACTIVE
PARTIALLY_REPAID
FULLY_REPAID
OVERDUE
CANCELLED
ARCHIVED
```

---

# 12. Outstanding Balance

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

Outstanding amount must remain deterministic.

---

# 13. Repayment

Repayments are independent financial events.

A repayment contains:

```text
id
user_id
lending_record_id OR borrowing_record_id
account_id
amount
currency
repaid_at
note
created_at
updated_at
deleted_at
```

Exactly one obligation reference must be populated.

---

# 14. Repayment Rules

A repayment must:

- belong to the authenticated user
- reference an active or valid obligation
- use a valid account
- use a compatible currency
- have a positive amount

Unless overpayment is explicitly supported:

```text
Repayment <= Outstanding
```

---

# 15. Partial Repayment

Partial repayment is a core feature.

Example:

```text
Original:
৳10,000

Repayment:
৳4,000

Outstanding:
৳6,000
```

The user should immediately see the updated balance.

---

# 16. Multiple Repayments

An obligation may have any number of valid partial repayments.

Example:

```text
Original:
৳10,000

Repayment #1:
৳2,000

Repayment #2:
৳3,000

Repayment #3:
৳5,000

Outstanding:
৳0
```

The record becomes fully repaid.

---

# 17. Full Repayment

When:

```text
Outstanding = 0
```

the obligation should transition to:

```text
FULLY_REPAID
```

The system should preserve the full repayment history.

---

# 18. Repayment History

The detail screen should show:

```text
Original:
৳10,000

Repayments

12 Aug   ৳4,000
18 Aug   ৳2,000

Outstanding:
৳4,000
```

Each repayment should be individually inspectable.

---

# 19. Repayment Editing

Editing a repayment may change the outstanding balance.

Therefore:

```text
Edit Repayment
   ↓
Recalculate Outstanding
   ↓
Update Status
   ↓
Recalculate Related Analytics
```

The operation must remain transactional.

---

# 20. Repayment Deletion

Deleting a repayment should be treated as a financially significant action.

Preferred:

```text
Delete / Reverse Repayment
   ↓
Confirm
   ↓
Recalculate Outstanding
```

Avoid silently deleting repayment history.

---

# 21. Lending and Borrowing Accounting

Lending and borrowing should not be incorrectly classified as ordinary expense/income.

Example:

```text
You lend:
৳10,000
```

This is a movement of financial value from your account into an outstanding receivable.

Likewise:

```text
You borrow:
৳10,000
```

creates a liability.

The exact ledger representation must be implemented consistently with the transaction domain.

---

# 22. Lending Financial Effect

When money is lent from an account:

```text
Account Balance
       - ৳X

Outstanding Lending
       + ৳X
```

It should not automatically become an ordinary expense.

---

# 23. Borrowing Financial Effect

When money is borrowed:

```text
Account / Available Funds
       + ৳X

Outstanding Borrowing
       + ৳X
```

It should not automatically become ordinary income.

---

# 24. Repayment Financial Effect — Lending

When someone repays the user:

```text
User Account
       + ৳X

Outstanding Lending
       - ৳X
```

---

# 25. Repayment Financial Effect — Borrowing

When the user repays someone:

```text
User Account
       - ৳X

Outstanding Borrowing
       - ৳X
```

These effects must be implemented atomically.

---

# 26. Date Model

The module must distinguish:

```text
lent_at / borrowed_at
expected_repayment_date
repaid_at
created_at
updated_at
```

These dates have different meanings and must not be conflated.

---

# 27. Due Date

Expected repayment date is an estimate or commitment date.

The user should be able to:

- set it
- change it
- remove it
- mark the obligation as resolved

Changing a due date should not rewrite historical repayment events.

---

# 28. Overdue Definition

An obligation is overdue when:

```text
expected_repayment_date < current local date
AND
outstanding > 0
```

The user's configured timezone should determine calendar-day behavior.

---

# 29. Due Soon

The system may classify obligations as:

```text
Due Today
Due Tomorrow
Due Soon
Overdue
```

The exact "due soon" interval should be configurable.

A reasonable default is:

```text
within 3 days
```

---

# 30. Reminder Scheduling

The user should be able to configure reminders such as:

```text
7 days before
3 days before
1 day before
Due date
After due date
```

Custom schedules may be supported later.

---

# 31. Reminder Channels

Initial channels:

```text
Local Notification
Email
```

Future:

```text
SMS
WhatsApp
Calendar
```

Each channel must be controlled independently.

---

# 32. Reminder Defaults

Recommended default:

```text
7 days before
1 day before
Due date
```

Overdue reminders should not continue indefinitely by default.

The user should be able to configure escalation frequency.

---

# 33. Reminder Frequency

A reminder schedule must avoid spam.

Example overdue behavior:

```text
Due date
 ↓
3 days overdue
 ↓
7 days overdue
 ↓
Stop or continue based on setting
```

The user should explicitly control persistent reminder behavior.

---

# 34. Notification Content

A reminder should clearly state:

- Person
- Amount
- Due date
- Current status

Example:

> "Rahim's ৳6,000 repayment is due tomorrow."

For user-facing outgoing reminders, the wording should be polite.

---

# 35. Email Reminder

The user may choose to send or automatically schedule an email.

Example:

```text
Subject:
Friendly reminder about the repayment

Body:
Assalamu Alaikum,
Hope you're doing well.

Just a quick reminder that the ৳6,000
amount was expected to be returned by
25 August.

Please let me know when you expect to
be able to send it.

Thanks.
```

The exact message should be editable.

---

# 36. Email Privacy

The application must never send a reminder without user authorization.

The user must understand:

- recipient
- amount
- date
- message
- scheduled time

before enabling automatic sending.

---

# 37. Recipient Validation

The email system must validate:

- valid email address
- user ownership
- reminder authorization

The application must not automatically send to arbitrary third-party addresses gathered from unrelated data.

---

# 38. Reminder Editing

A user should be able to change:

- reminder dates
- channels
- template
- recipient
- enabled/disabled state

without editing the underlying lending/borrowing amount.

---

# 39. Reminder Cancellation

When fully repaid:

```text
Outstanding = 0
      ↓
Cancel Pending Reminders
```

Already-sent reminders remain historical notification records.

Future reminders should not continue.

---

# 40. Overdue Reminder Cancellation

If the user manually marks the obligation as resolved/cancelled according to supported business rules:

```text
Stop Future Reminders
```

No future reminder should be generated for a resolved obligation.

---

# 41. Lending Dashboard Summary

The module should provide:

```text
Money Owed to Me
৳18,000

Active People
3

Due Soon
2

Overdue
1
```

---

# 42. Borrowing Dashboard Summary

```text
Money I Owe
৳12,500

Active Obligations
2

Due Soon
1

Overdue
0
```

---

# 43. Combined Financial Summary

Home/analytics may show:

```text
Receivables
৳18,000

Liabilities
৳12,500

Net Position
+৳5,500
```

The meaning should be clearly explained.

This should not be confused with total net worth unless the overall financial system defines it that way.

---

# 44. Lending List UX

The preferred list is person-centered.

Example:

```text
Money Lent

Rahim
৳6,000 outstanding
Due in 3 days

Karim
৳2,500 outstanding
Overdue

Nadia
Fully Repaid
```

The amount and status should be immediately scannable.

---

# 45. Borrowing List UX

```text
Money Borrowed

Arif
৳8,000 outstanding
Due in 5 days

Sadia
৳4,500 outstanding
Due today
```

The visual system must make it obvious that this is money the user owes.

---

# 46. Lending Detail UX

Recommended:

```text
Rahim

Outstanding
৳6,000

Original
৳10,000

Repaid
৳4,000

Expected Repayment
25 August

Status
Partially Repaid

Repayment History
...

[Record Repayment]
[Reminder]
[Edit]
```

---

# 47. Borrowing Detail UX

Same structure with liability semantics:

```text
Arif

Outstanding
৳8,000

Original
৳10,000

Repaid
৳2,000

Expected Repayment
17 August
```

---

# 48. Add Lending Flow

```text
Lending
 ↓
Add
 ↓
Select / Create Person
 ↓
Amount
 ↓
Expected Date
 ↓
Reminder
 ↓
Review
 ↓
Save
```

The common flow should be short.

---

# 49. Add Borrowing Flow

```text
Borrowing
 ↓
Add
 ↓
Select / Create Person
 ↓
Amount
 ↓
Expected Date
 ↓
Reminder
 ↓
Review
 ↓
Save
```

---

# 50. Record Repayment Flow

Preferred:

```text
Obligation Detail
 ↓
Record Repayment
 ↓
Amount
 ↓
Account
 ↓
Save
```

Because the user entered through the obligation, the application should not ask them to select the person again.

---

# 51. Repayment Amount Input

Display:

```text
Outstanding:
৳6,000

Repayment:
৳ ______
```

Validation should show immediately if the amount exceeds the outstanding amount.

---

# 52. Overpayment Handling

Initial product behavior:

```text
Repayment > Outstanding
→ Block
```

Future support could include explicit overpayment handling if the product has a valid financial model for it.

Do not silently create negative outstanding balances.

---

# 53. Cancellation

A lending/borrowing record may be cancelled if it was entered incorrectly or the obligation is explicitly voided.

Cancellation should:

- preserve an audit/history indication where appropriate
- stop future reminders
- exclude the cancelled record from active balances

---

# 54. Archived vs Fully Repaid

These states are different.

## Fully Repaid

The financial obligation reached zero.

## Archived

The record is intentionally hidden from normal active lists.

A fully repaid record should normally remain historically accessible.

---

# 55. Search

Search should support:

- person
- amount
- note
- date
- status

Example:

```text
Search:
Rahim
```

returns all relevant lending and borrowing records.

---

# 56. Filtering

Supported filters:

```text
Lending / Borrowing
Status
Due Date
Person
Amount
```

Possible status filters:

```text
Active
Due Soon
Overdue
Partially Repaid
Fully Repaid
```

---

# 57. Sorting

Useful sorting options:

```text
Due Date
Outstanding Amount
Person
Created Date
Updated Date
```

Default sorting should prioritize actionable obligations.

For example:

```text
Overdue
Due Today
Due Soon
Later
```

---

# 58. Reminder Priority

Reminder priority can be calculated using:

```text
Overdue
   ↓
Due Today
   ↓
Due Soon
   ↓
Future
```

Outstanding amount may be used as a secondary factor.

The system should avoid implying that a larger amount means a person is morally more important.

---

# 59. Analytics

The module should provide:

## Lending

- Total lent
- Total repaid
- Total outstanding
- Number of active people
- Overdue amount
- Repayment rate

## Borrowing

- Total borrowed
- Total repaid
- Total outstanding
- Number of active obligations
- Overdue amount
- Repayment progress

---

# 60. Repayment Rate

Example:

```text
Repayment Rate
=
Total Repaid / Original Amount × 100
```

This may be useful for summary analytics.

It must distinguish between:

- individual obligation
- aggregate lending
- aggregate borrowing

---

# 61. Overdue Analytics

Example:

```text
Overdue Lending
৳8,500

People:
2

Oldest:
14 days overdue
```

The system should support drill-down to source obligations.

---

# 62. Lending vs Borrowing Analytics

Do not merge them into a single ambiguous metric.

Use:

```text
Receivables
+
Liabilities
```

with clear labels.

---

# 63. Financial Health Integration

Outstanding borrowing may contribute to financial health.

Outstanding lending may indicate:

- receivable exposure
- liquidity risk

The weighting should be defined in the financial health specification.

---

# 64. Forecast Integration

Expected repayments may be used in cash-flow projections.

Example:

```text
Expected incoming repayment:
৳5,000 on 25 August
```

The forecast should clearly distinguish:

```text
Expected
vs
Confirmed
```

A promised repayment is not guaranteed cash.

---

# 65. Cash-Flow Risk

The forecasting engine should not treat overdue or uncertain lending repayments as guaranteed income.

Possible modeling:

```text
Confirmed Cash
+
High-confidence Expected Cash
+
Uncertain Expected Cash
```

The exact confidence model belongs in forecasting documentation.

---

# 66. AI Insight Integration

AI may explain patterns such as:

> "You currently have ৳18,000 outstanding across three people."

or:

> "Two repayments are overdue."

The underlying figures must come from deterministic calculations.

---

# 67. AI Recommendation Integration

Potential recommendations:

- send a polite reminder
- review overdue obligations
- adjust cash-flow assumptions
- follow up with a specific person

AI should suggest, not automatically contact someone.

---

# 68. AI Reminder Drafting

Future functionality may allow:

```text
AI
 ↓
Draft polite reminder
 ↓
User Review
 ↓
Edit
 ↓
Send
```

The AI must never send the message automatically without explicit authorization.

---

# 69. Notification Events

Potential events:

```text
RepaymentDueSoon
RepaymentDueToday
RepaymentOverdue
RepaymentCompleted
PartialRepaymentRecorded
```

These events can trigger notification workflows.

---

# 70. Notification Deduplication

A single reminder event should not produce multiple identical notifications because of:

- worker retries
- app restarts
- sync duplication

Use stable event/reminder identifiers.

---

# 71. Email Job Architecture

Email should be asynchronous.

```text
Reminder Event
   ↓
Notification Service
   ↓
Email Job
   ↓
Redis Queue
   ↓
Email Worker
   ↓
Provider
```

The financial obligation remains independent of email success.

---

# 72. Email Retry

Retry transient provider failures.

Do not retry invalid recipient errors indefinitely.

Example classification:

```text
Timeout → Retry
5xx → Retry
Rate Limit → Retry with backoff
Invalid Email → Permanent Failure
```

---

# 73. Reminder Delivery History

The application may store:

```text
scheduled
sent
failed
cancelled
```

This helps explain why a reminder did or did not occur.

---

# 74. Reminder Failure UX

If an email fails:

```text
Reminder couldn't be sent.

Your repayment record is still active.

[Review Email]
[Try Again]
```

Do not hide the underlying obligation.

---

# 75. Local Notifications

For predictable reminders, local notifications may be scheduled on-device.

This can reduce cloud dependency.

However, cloud-side scheduling may still be necessary for multi-device consistency.

---

# 76. Multi-Device Reminder Rules

When cloud synchronization is active, only one logical reminder event should be generated for each configured schedule.

Device-specific presentation should not cause duplicate notifications.

---

# 77. Sync Model

Lending and borrowing records synchronize like ordinary domain entities.

The sync system must support:

- create
- update
- delete
- restore
- repayment creation

Repayment operations must remain idempotent.

---

# 78. Sync Financial Safety

A duplicated repayment sync must never reduce outstanding balance twice.

Example:

```text
Repayment Operation ID:
abc-123

Retry:
abc-123

Server:
Process only once
```

---

# 79. Sync Conflict Example

Device A:

```text
Expected date = 25 Aug
```

Device B:

```text
Expected date = 30 Aug
```

This is generally a low-risk metadata conflict and may support last-compatible-update or user review.

Amount conflicts are higher risk.

---

# 80. Amount Conflict

Device A:

```text
Original amount = ৳10,000
```

Device B:

```text
Original amount = ৳8,000
```

This should not be blindly merged.

The system should require a deterministic conflict resolution strategy.

---

# 81. Repayment Conflict

If two devices create repayments independently:

```text
Device A:
৳4,000

Device B:
৳3,000
```

These are normally independent events and should both exist, provided total repayment remains within the valid outstanding amount.

---

# 82. Duplicate Repayment Prevention

Repayment uniqueness should consider:

```text
operation_id
```

rather than assuming:

```text
same amount + same date = duplicate
```

because two legitimate repayments may have identical amounts.

---

# 83. Data Export

Lending/borrowing exports should include:

```text
Person
Type
Original Amount
Currency
Start Date
Expected Repayment Date
Status
Total Repaid
Outstanding
Repayment History
```

---

# 84. Privacy

The module can contain information about third parties.

Therefore:

- minimize personal information
- protect exports
- protect notifications
- protect email recipients
- avoid unnecessary contact imports
- avoid exposing people records through analytics logs

---

# 85. Security

Every operation must validate:

```text
User Ownership
Person Ownership
Obligation Ownership
Account Ownership
Repayment Ownership
```

No client-provided ID should bypass authorization.

---

# 86. Data Integrity

The module must support reconciliation:

```text
Original Amount
-
Repayments
=
Outstanding
```

If a cached outstanding value is used for performance, the system must have a method to reconstruct and validate it from source data.

---

# 87. Edge Cases

The module must handle:

- No repayment date
- Past repayment date on creation
- Same-day lending and repayment
- Full repayment
- Multiple partial repayments
- Attempted overpayment
- Deleted repayment
- Edited repayment
- Deleted person
- Archived person
- Archived account used by repayment
- Currency mismatch
- Duplicate sync operation
- Offline repayment
- Reminder scheduled while offline
- Device timezone change
- User changes due date
- Obligation cancelled before due date

---

# 88. No Repayment Date

If no expected repayment date exists:

```text
Status:
Active

Reminder:
None unless manually configured
```

The record remains visible in outstanding balances.

---

# 89. Past Date on Creation

If the user enters:

```text
Expected repayment:
Yesterday
Outstanding:
৳5,000
```

the record should immediately appear as:

```text
Overdue
```

unless the user explicitly chooses another status.

---

# 90. Same-Day Repayment

A lending record can be created and repaid on the same day.

Example:

```text
Lent:
৳5,000

Repaid:
৳5,000

Status:
Fully Repaid
```

Historical records must remain intact.

---

# 91. Person Deletion

A person with active obligations must not be hard-deleted casually.

Preferred:

```text
Archive Person
```

Historical obligations remain accessible.

---

# 92. Currency Mismatch

If a repayment currency differs from the obligation currency:

```text
Block by default
```

unless multi-currency conversion is explicitly implemented.

Do not silently convert.

---

# 93. Account Deletion

An account used for repayment history must remain historically resolvable.

Archive rather than destructive delete.

---

# 94. Lending and Borrowing UI Quality Bar

The experience should feel:

- personal
- simple
- respectful
- actionable
- non-judgmental

The user should instantly understand:

```text
Who
How much
When
What's left
What should I do
```

---

# 95. Recommended Detail Hierarchy

The most important information:

```text
Person
Outstanding Amount
Due Status
Expected Date
```

Secondary:

```text
Original Amount
Repaid
Notes
History
```

Tertiary:

```text
Metadata
Attachments
Technical details
```

---

# 96. Acceptance Criteria

The module is complete when:

- Users can record money lent.
- Users can record money borrowed.
- People can be managed independently.
- Expected repayment dates are supported.
- Partial repayments work.
- Full repayment works.
- Outstanding balances are mathematically correct.
- Overdue states work.
- Reminders can be configured.
- Local notifications work where supported.
- Email reminders are authorized and asynchronous.
- Reminder duplicates are prevented.
- Repayments are idempotent under sync.
- Offline lending/borrowing works.
- Financial analytics are available.
- Forecasts distinguish expected vs actual cash.
- AI insights are grounded in deterministic data.
- Historical records remain intact.
- Security and ownership checks are enforced.
- Critical flows have automated tests.

---

# 97. Testing Matrix

## Unit Tests

- outstanding calculation
- partial repayment
- full repayment
- overdue calculation
- due-soon calculation
- repayment validation
- cancellation
- status transitions

## Integration Tests

- lending creation
- borrowing creation
- repayment transaction
- notification scheduling
- email jobs
- sync

## E2E Tests

```text
Create Lending
→ Set Date
→ Receive Reminder

Create Borrowing
→ Partial Repayment
→ Full Repayment

Overdue
→ Notification
→ Detail
→ Record Repayment
```

---

# 98. Product Metrics

Potential non-sensitive product metrics:

- active obligation count
- repayment completion rate
- reminder engagement
- overdue-state frequency
- reminder success rate
- feature retention

Avoid sending detailed financial amounts into generic analytics systems unless explicitly required.

---

# 99. Future Enhancements

Potential future capabilities:

- WhatsApp message templates
- SMS reminders
- Calendar integration
- Contact-assisted person creation
- Scheduled recurring repayments
- Shared household obligations
- AI-generated reminder drafts
- Repayment probability estimation
- Relationship-aware reminder timing
- Multi-currency obligations
- IOU sharing links

These require additional privacy, security, and UX review.

---

# 100. Future WhatsApp / Messaging Flow

Possible future architecture:

```text
Obligation
   ↓
Reminder
   ↓
Message Draft
   ↓
User Review
   ↓
WhatsApp / SMS
   ↓
Delivery Status
```

The application should not send messages automatically without explicit user authorization and applicable integration permissions.

---

# 101. Relationship With Other Documents

The product-module documentation sequence is:

```text
BUDGETING.md
        ↓
LENDING_BORROWING.md
        ↓
FINANCIAL_GOALS.md
        ↓
REPORTING.md
        ↓
NOTIFICATIONS.md
        ↓
RECURRING_TRANSACTIONS.md
```

This module depends primarily on:

```text
ACCOUNTS
TRANSACTIONS
PEOPLE
NOTIFICATIONS
SYNC
```

The next module document is:

```text
docs/product/FINANCIAL_GOALS.md
```

It should define:

- Goal creation
- Target amount
- Target date
- Contributions
- Progress
- Goal forecasting
- Required savings
- Goal risk
- What-if planning
- Notifications
- Analytics
- AI recommendations
- Edge cases
- Sync
- Security
- Acceptance criteria

The core principle remains:

> **Make sure the user remembers the money they owe and the money others owe them, without turning personal relationships into a complicated accounting system.**
