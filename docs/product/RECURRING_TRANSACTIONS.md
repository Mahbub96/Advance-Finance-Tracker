# Personal Finance — Recurring Transactions Module

**Document:** `RECURRING_TRANSACTIONS.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-14  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Module:** Recurring Transactions  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL + Prisma  
**Local Database:** SQLite  
**Queue:** Redis-backed background jobs

---

# 1. Purpose

The Recurring Transactions module manages financial events that repeat according to a schedule.

Examples:

```text
Salary
Rent
Internet Bill
Electricity
Subscriptions
Insurance
Loan Payment
Monthly Allowance
Regular Savings
```

The system must make recurring finances predictable without automatically creating incorrect financial records.

The core principle is:

> **A recurring rule describes what is expected to happen; an actual transaction represents what actually happened.**

---

# 2. Product Philosophy

Recurring finance should be:

- predictable
- understandable
- controllable
- low-maintenance
- safe
- transparent

The system must clearly distinguish:

```text
Recurring Rule
Scheduled Occurrence
Actual Transaction
Reminder
```

They are different concepts.

---

# 3. Scope

The module includes:

```text
Recurring Income
Recurring Expenses
Bills
Subscriptions
Recurring Transfers
Occurrence Scheduling
Upcoming Items
Automatic Creation
Suggested Creation
Reminder Scheduling
Pause / Resume
Edit
Archive
History
Duplicate Prevention
Offline Support
Cloud Sync
Analytics
Notifications
AI Assistance
```

Future scope may include:

```text
Bank-linked recurring detection
Automatic merchant detection
Price-change detection
Subscription cancellation assistance
Recurring payment automation
Smart cash-flow planning
```

---

# 4. Core Domain Model

Conceptually:

```text
Recurring Rule
       ↓
Occurrence
       ↓
Actual Transaction
```

For example:

```text
Internet Bill Rule
       ↓
August Occurrence
       ↓
৳1,000 Expense Transaction
```

A rule does not itself represent money already spent.

---

# 5. Recurring Rule Types

Initial types:

```text
INCOME
EXPENSE
TRANSFER
```

The product may additionally classify rules as:

```text
BILL
SUBSCRIPTION
OTHER_RECURRING
```

These classifications help UX and analytics but should not duplicate financial semantics.

---

# 6. Recurring Rule Data Model

Conceptual fields:

```text
id
user_id
type
name
amount
currency
account_id
destination_account_id nullable
category_id nullable
frequency
interval_value
start_date
end_date nullable
next_occurrence
auto_create
reminder_enabled
status
notes nullable
created_at
updated_at
deleted_at
```

Additional metadata may include:

```text
merchant_name
external_reference
```

---

# 7. Rule Status

Persistent lifecycle:

```text
ACTIVE
PAUSED
COMPLETED
ARCHIVED
CANCELLED
```

Runtime occurrence states are separate.

---

# 8. Occurrence Model

A recurring rule generates scheduled occurrences.

Conceptual occurrence fields:

```text
id
rule_id
scheduled_date
scheduled_at nullable
status
generated_transaction_id nullable
created_at
updated_at
```

Possible states:

```text
UPCOMING
DUE
GENERATED
SKIPPED
MISSED
CANCELLED
```

---

# 9. Actual Transaction Link

When an occurrence becomes an actual transaction:

```text
Occurrence
    ↓
generated_transaction_id
    ↓
Transaction
```

This relationship is essential for:

- duplicate prevention
- reporting
- editing
- reconciliation

---

# 10. Recurring Rule Creation

Flow:

```text
Recurring
   ↓
Add Rule
   ↓
Choose Type
   ↓
Name
   ↓
Amount
   ↓
Account
   ↓
Category if applicable
   ↓
Frequency
   ↓
Start Date
   ↓
Optional End Date
   ↓
Automation Mode
   ↓
Reminder
   ↓
Save
```

The initial form should remain compact.

---

# 11. Required Fields

Minimum:

- Name
- Type
- Amount
- Currency
- Schedule
- Start date
- Account when required

Optional:

- Category
- Merchant
- End date
- Note
- Reminder
- Auto-create

---

# 12. Automation Modes

The product should clearly distinguish:

## Reminder Only

The application reminds the user that a transaction is expected.

## Suggest Transaction

The application prepares a transaction for review.

## Automatic Create

The system creates the actual transaction automatically according to the configured rule.

The safest default is:

```text
Reminder Only
```

or:

```text
Suggest Transaction
```

depending on user preferences.

---

# 13. Why Automatic Creation Requires Care

An automatic recurring transaction can become incorrect if:

- amount changed
- payment was skipped
- payment happened early
- payment happened late
- account had insufficient funds
- subscription was cancelled
- bill amount changed

Therefore, auto-create should be opt-in and clearly explained.

---

# 14. Recurrence Frequencies

Initial support:

```text
DAILY
WEEKLY
BIWEEKLY
MONTHLY
QUARTERLY
YEARLY
CUSTOM
```

The implementation should keep recurrence calculation logic isolated from UI.

---

# 15. Interval Value

For custom recurrence:

```text
interval_value
frequency_unit
```

Example:

```text
Every 2 weeks
Every 3 months
Every 10 days
```

The system must validate reasonable intervals.

---

# 16. Weekly Recurrence

A weekly rule should specify the intended day.

Example:

```text
Every Friday
```

The schedule should remain stable across month boundaries.

---

# 17. Biweekly Recurrence

Example:

```text
Every 2 weeks
Starting:
Friday, 14 Aug
```

The next occurrence is calculated from the recurrence anchor rather than simply choosing every second calendar week independently.

---

# 18. Monthly Recurrence

Monthly recurrence requires careful handling of dates such as:

```text
29
30
31
```

If a rule is configured for:

```text
31st of every month
```

February has no 31st.

The product must define a deterministic behavior.

Recommended policy:

> Use the last valid calendar day of the target month.

---

# 19. End-of-Month Rule

Example:

```text
31 January
→
28 February
→
31 March
```

The recurrence should remain anchored to the user's intended end-of-month behavior rather than drift permanently to the 28th.

---

# 20. Leap Year

For yearly recurrence:

```text
29 February
```

the application must define behavior in non-leap years.

Recommended:

```text
Use 28 February
```

unless the user explicitly configures another policy.

---

# 21. Start Date

The start date determines the first possible occurrence.

A rule created after its original start date must not silently generate a large number of historical transactions.

The application should ask whether the user wants:

```text
Start from next occurrence
```

or:

```text
Include missed historical occurrences
```

when relevant.

---

# 22. Missed Occurrences

Suppose:

```text
Monthly Salary
Start:
January

User adds rule in August
```

The system should not automatically create January–July transactions without explicit user consent.

Default:

```text
Start tracking from next applicable occurrence.
```

---

# 23. Future Occurrences

Upcoming occurrences should be visible in:

```text
Home
Recurring
Upcoming
Calendar-like views where supported
```

Example:

```text
Internet
৳1,000
Tomorrow

Salary
+৳50,000
6 days
```

---

# 24. Occurrence Generation

The system must calculate the next occurrence deterministically.

Conceptual process:

```text
Recurring Rule
   ↓
Last Known Occurrence
   ↓
Recurrence Calculator
   ↓
Next Date
```

The same input must produce the same result.

---

# 25. Occurrence Generation and Timezones

Date-based recurrence should use the user's configured timezone for calendar semantics.

Server jobs may operate in UTC but must calculate the intended local occurrence correctly.

---

# 26. Automatic Transaction Creation

If enabled:

```text
Occurrence Due
   ↓
Eligibility Check
   ↓
Create Transaction
   ↓
Link to Occurrence
   ↓
Mark Occurrence Generated
```

The operation must be idempotent.

---

# 27. Idempotency

A worker retry must never create duplicate transactions.

The occurrence should have a stable identity:

```text
rule_id
+
occurrence_date
```

or a unique occurrence identifier.

The transaction creation should also use an idempotency key.

---

# 28. Duplicate Detection

The module must prevent duplicate transactions from:

- repeated workers
- sync retry
- app restart
- manual creation
- automatic generation

A user manually entering the same payment should not be silently deleted.

The application may warn:

> "This looks like a recurring payment already scheduled."

---

# 29. Manual Match to Occurrence

The user should be able to associate a manually created transaction with an occurrence.

Example:

```text
Actual transaction
৳1,050

Scheduled occurrence
৳1,000

[Match]
```

This allows real-world variation without forcing automatic creation.

---

# 30. Amount Changes

Recurring rules may have changing amounts.

Examples:

```text
Electricity
January:
৳1,200

February:
৳1,650
```

The rule may support:

```text
Fixed Amount
```

or:

```text
Variable Amount
```

For variable amounts, the system should normally suggest rather than auto-create unless the user explicitly configures automatic behavior.

---

# 31. Fixed vs Variable

## Fixed

```text
Amount = constant
```

Examples:

- rent
- subscription
- salary where stable

## Variable

```text
Expected category/merchant
Amount may change
```

Examples:

- electricity
- water
- groceries

Variable recurring finance should favor reminders or suggestions.

---

# 32. Recurring Income

Examples:

```text
Salary
Freelance Retainer
Allowance
Regular Support
```

The same recurring architecture applies.

Actual receipt should remain distinguishable from expected income.

---

# 33. Recurring Expense

Examples:

```text
Rent
Internet
Insurance
Subscription
School Fee
Loan Payment
```

The occurrence should be treated as expected until actual financial activity is recorded.

---

# 34. Recurring Transfer

Future-capable flow:

```text
Source Account
→
Destination Account
→
Amount
→
Schedule
```

A recurring transfer must remain separate from income and expense.

---

# 35. Bill

A bill is a recurring obligation with a due date.

Examples:

```text
Internet
Electricity
Credit Card
Rent
```

A bill may have:

- expected amount
- actual amount
- due date
- reminder
- linked transaction

---

# 36. Subscription

A subscription is a recurring service commitment.

Examples:

```text
Streaming
Cloud Storage
Software
Gym
```

The system should track:

- amount
- frequency
- next billing
- account
- category

---

# 37. Bill vs Subscription

They may share the recurring engine but differ conceptually.

## Bill

Primarily an obligation/due-date concept.

## Subscription

Primarily a recurring service commitment.

The product can present them separately while sharing internal scheduling logic.

---

# 38. Upcoming Screen

The Recurring module should provide:

```text
Upcoming

Today
Internet         ৳1,000

Tomorrow
Electricity      Expected

In 5 days
Salary          +৳50,000
```

The list should prioritize items needing attention.

---

# 39. Recurring Detail

Recommended:

```text
Internet

৳1,000
Monthly

Next:
15 September

Account:
bKash

Category:
Utilities

Automation:
Reminder

Recent History:
...

[Edit]
[Pause]
[Generate]
```

---

# 40. Pause Rule

A paused rule:

- generates no new occurrences
- sends no ordinary reminders
- preserves historical occurrences
- can be resumed later

Pause must not delete historical transactions.

---

# 41. Resume Rule

On resume:

```text
Resume
 ↓
Calculate next applicable occurrence
```

The system should not automatically generate missed transactions without user confirmation.

---

# 42. Rule Completion

A rule may complete when:

```text
end_date reached
```

or when the user explicitly marks it complete.

Completed rules remain historically accessible.

---

# 43. Archive Rule

Archived rules:

- disappear from active recurring lists
- preserve history
- generate no future events
- remain searchable where appropriate

---

# 44. Cancel Subscription

For subscriptions, cancellation should stop future occurrences.

Historical subscription payments must remain.

The interface should distinguish:

```text
Cancelled
```

from:

```text
Archived
```

when that distinction is meaningful.

---

# 45. Reminder Integration

Recurring rules may generate:

```text
Upcoming Reminder
Due Reminder
Missed Reminder
```

The notification rules are defined in `NOTIFICATIONS.md`.

---

# 46. Recurring Reminder Defaults

A reasonable default for bills may be:

```text
3 days before
1 day before
Due date
```

Users may customize this.

For stable recurring income, reminders should generally be optional.

---

# 47. AI Integration

AI can provide useful recurring-finance insights such as:

> "Your recurring commitments now account for about 38% of your typical monthly expenses."

or:

> "This subscription has increased in cost compared with previous months."

The underlying financial calculations must remain deterministic.

---

# 48. AI Recurring Recommendations

Potential recommendations:

- review unused subscriptions
- identify recurring commitment growth
- compare recurring expenses with income
- identify unusually frequent charges

AI must not automatically cancel or modify recurring payments.

---

# 49. Recurring Expense Risk

The system may calculate:

```text
Recurring Monthly Commitments
/
Average Monthly Income
```

This can provide a commitment ratio.

Example:

```text
Recurring Commitments:
৳18,000

Average Income:
৳55,000

Commitment Ratio:
32.7%
```

The metric should be presented as contextual information, not a universal financial rule.

---

# 50. Cash-Flow Forecast Integration

Recurring schedules can provide important forecast inputs.

Example:

```text
Expected Salary:
+৳50,000

Expected Rent:
-৳15,000

Expected Internet:
-৳1,000
```

The forecasting engine should distinguish:

```text
Scheduled
vs
Actual
```

---

# 51. Budget Integration

Recurring expenses can be included in budget planning.

Example:

```text
Food Budget:
৳10,000

Recurring Meal Subscription:
৳2,000
```

The system may show that part of the budget is already structurally committed.

---

# 52. Goal Integration

Recurring income/expense data can inform goal feasibility.

Example:

```text
Monthly recurring commitments:
৳20,000

Goal requires:
৳10,000/month
```

The system can calculate estimated savings capacity.

---

# 53. Report Integration

Recurring reports should show:

```text
Monthly recurring commitment
Annualized recurring commitment
Upcoming recurring items
Historical recurring actuals
```

---

# 54. Actual vs Scheduled

This distinction must remain visible.

Example:

```text
Scheduled:
৳1,000

Actual:
৳1,150
```

The report should not overwrite the schedule merely because the actual transaction changed.

---

# 55. History Matching

The recurring detail screen should allow:

```text
Rule
 ↓
Occurrences
 ↓
Actual Transactions
```

Example:

```text
Internet Rule

August
Expected ৳1,000
Actual   ৳1,050

July
Expected ৳1,000
Actual   ৳1,000
```

---

# 56. Variable Amount Handling

When an actual transaction differs from the recurring amount:

```text
Expected:
৳1,000

Actual:
৳1,050
```

The application may:

- show the variance
- update a suggested amount
- keep the rule unchanged

The default should not silently rewrite the rule.

---

# 57. Rule Learning

The system may learn:

```text
Expected:
৳1,000

Actual historical average:
৳1,120
```

and suggest:

> "Your electricity bill has averaged around ৳1,120 over the last six months. Update the expected amount?"

This should require user confirmation.

---

# 58. Recurring Amount History

For variable recurring expenses, store actual transactions independently.

Do not overwrite the historical actual amount with a new rule value.

---

# 59. Occurrence Completion

An occurrence may be marked:

```text
GENERATED
```

when an automatic transaction is created.

For manual matching:

```text
MATCHED
```

may be useful.

The exact occurrence status set should remain minimal.

---

# 60. Missed Occurrence

A missed occurrence occurs when:

```text
scheduled_date < today
```

and no actual transaction is linked.

Possible states:

```text
MISSED
```

The user may:

```text
Create Now
Skip
Reschedule
```

---

# 61. Reschedule Occurrence

Rescheduling one occurrence should not necessarily change the entire recurring rule.

Example:

```text
August occurrence:
15 Aug → 18 Aug
```

Future occurrences should continue following the original rule unless the user edits the rule itself.

---

# 62. Skip Occurrence

If an expected payment did not happen:

```text
Skip
```

must mark only that occurrence as skipped.

The recurring rule continues.

---

# 63. Manual Transaction Matching

When a user records a transaction manually, the application may suggest matching it to a pending occurrence based on:

```text
Account
Category
Merchant
Date proximity
Amount similarity
```

The system should ask the user to confirm uncertain matches.

---

# 64. Recurring Transaction Suggestions

A smart detection system may notice:

```text
Same merchant
Similar amount
Similar date
Repeated monthly
```

and suggest:

> "This looks like a recurring transaction. Create a rule?"

This should be opt-in.

---

# 65. Recurring Detection

The initial version may use deterministic heuristics.

Future versions may use ML to identify patterns.

AI/ML should suggest rules rather than create them silently.

---

# 66. Offline Recurring Support

The app should support offline:

- viewing recurring rules
- calculating next occurrence
- viewing upcoming items
- creating/editing rules
- recording manual transactions
- matching transactions

Automatic cloud-side processing may occur later when connectivity returns.

---

# 67. Local Occurrence Scheduling

Predictable local reminders may be scheduled from local rules.

When the rule changes:

```text
Cancel old schedules
↓
Create new schedules
```

The local scheduler must avoid duplicate reminders.

---

# 68. Cloud Occurrence Scheduling

Server-side scheduling is needed when:

- push notification is required
- email is required
- multiple devices must coordinate
- cloud-generated reports depend on occurrences

---

# 69. Multi-Device Behavior

A recurring rule should have one logical schedule.

Devices should synchronize:

```text
Rule
Occurrence State
User Preferences
```

They must not independently generate duplicate financial transactions.

---

# 70. Automatic Transaction Creation Across Devices

This is especially sensitive.

If auto-create is enabled:

```text
Server / designated executor
```

should be the authoritative generator when cloud sync is active.

Devices should not each auto-create the same occurrence independently.

---

# 71. Offline Auto-Create

If cloud sync is unavailable, a device may need to create a local transaction for an auto-create rule.

In that case:

```text
Occurrence ID
+
Idempotency Key
```

must ensure the server later recognizes the locally generated transaction and does not create another copy.

---

# 72. Recurring Rule Sync

Rules use versioned entity synchronization.

Occurrences should also be synchronizable if the client needs to know:

```text
generated
skipped
matched
```

The actual financial transaction remains the authoritative financial event.

---

# 73. Conflict Rules

## Rule Configuration Conflict

Use standard version conflict handling.

## Independent Occurrence

Usually merge safely.

## Same Occurrence Auto-Create

Must be idempotent.

## Amount Conflict

Require deterministic resolution.

---

# 74. Recurring API

Relevant endpoints:

```text
GET    /api/v1/recurring-transactions
POST   /api/v1/recurring-transactions
GET    /api/v1/recurring-transactions/:id
PATCH  /api/v1/recurring-transactions/:id
POST   /api/v1/recurring-transactions/:id/pause
POST   /api/v1/recurring-transactions/:id/resume
POST   /api/v1/recurring-transactions/:id/archive
GET    /api/v1/recurring-transactions/:id/occurrences
POST   /api/v1/recurring-transactions/:id/occurrences/:occurrenceId/generate
POST   /api/v1/recurring-transactions/:id/occurrences/:occurrenceId/skip
```

Exact API contracts are defined in `API.md`.

---

# 75. Bill API

Relevant endpoints:

```text
GET    /api/v1/bills
POST   /api/v1/bills
GET    /api/v1/bills/:id
PATCH  /api/v1/bills/:id
POST   /api/v1/bills/:id/archive
```

---

# 76. Subscription API

Relevant endpoints:

```text
GET    /api/v1/subscriptions
POST   /api/v1/subscriptions
GET    /api/v1/subscriptions/:id
PATCH  /api/v1/subscriptions/:id
POST   /api/v1/subscriptions/:id/cancel
POST   /api/v1/subscriptions/:id/archive
```

---

# 77. Database Dependencies

Primary entities:

```text
RecurringTransaction
Bill
Subscription
Transaction
Account
Category
Notification
SyncOperation
```

Occurrence modeling may use a dedicated table where required.

---

# 78. Data Integrity

Recurring rules must not become financial truth.

The source hierarchy is:

```text
Rule
↓
Occurrence
↓
Actual Transaction
```

Reports use actual transactions for actual financial totals.

Forecasts may also use scheduled occurrences as expected future data.

---

# 79. Security

All recurring operations must verify:

- user ownership
- account ownership
- category ownership
- linked occurrence ownership
- linked transaction ownership
- notification ownership

No client-controlled ID may bypass authorization.

---

# 80. Notification Privacy

Recurring notifications may reveal:

- merchant
- amount
- subscription
- bill
- account

The notification privacy settings defined in `NOTIFICATIONS.md` must apply.

---

# 81. Recurring Expense Report

Report metrics may include:

```text
Monthly recurring expense
Annual recurring expense
Recurring percentage of income
Upcoming commitments
Subscription count
Bill count
```

The system should distinguish:

```text
expected recurring
vs
actual recurring spending
```

---

# 82. Subscription Analytics

Potential analytics:

- monthly subscription total
- annualized subscription total
- subscription growth
- unused subscription candidates
- recurring category distribution

Automatic cancellation is not part of the initial product.

---

# 83. Subscription Price Change

If historical transactions exist:

```text
Previous:
৳1,000

Current:
৳1,200
```

the system may detect:

```text
+20%
```

This should be presented as an observation.

---

# 84. AI Subscription Insight

Example:

> "Your recurring subscriptions increased by about ৳800 per month over the last six months."

The underlying amount must come from deterministic analytics.

---

# 85. AI Recurring Recommendations

Potential:

```text
Review rarely used subscriptions
Review growing recurring commitments
Consider adjusting expected bill amounts
```

AI should not cancel subscriptions or change payments automatically.

---

# 86. Recurring Forecast

Future cash flow can include expected recurring events:

```text
Expected Income
+
Expected Expense
+
Expected Transfer
```

The forecast must distinguish scheduled events from confirmed actuals.

---

# 87. Recurring Forecast Uncertainty

Variable bills should receive lower confidence than fixed recurring payments.

Example:

```text
Rent:
High confidence

Electricity:
Moderate confidence
```

This can improve future cash-flow forecasting.

---

# 88. Edge Cases

The system must handle:

- start date in the past
- end date before start date
- monthly 31st
- February
- leap year
- timezone changes
- daylight-saving behavior where applicable
- paused rule
- cancelled rule
- missed occurrence
- skipped occurrence
- manually matched transaction
- actual amount differs
- duplicate auto-create
- offline generation
- sync retry
- account archived
- category archived
- currency mismatch
- rule deletion
- user deletion

---

# 89. Invalid Date Range

A rule must reject:

```text
end_date < start_date
```

This must be validated both client-side and server-side.

---

# 90. Currency Mismatch

A recurring rule must use a valid currency consistent with its account where required.

Cross-currency recurring rules are unsupported initially unless explicit conversion logic exists.

---

# 91. Account Archive

If the linked account is archived:

```text
Existing historical transactions:
Preserved

Future recurring occurrences:
Need user action
```

The application may pause the recurring rule and ask the user to select another account.

---

# 92. Category Archive

If the linked category is archived:

```text
Historical transactions:
Preserved

Future occurrences:
Continue only if category remains valid
```

The user should be prompted to select a replacement category when required.

---

# 93. Rule Edit Scope

Editing a recurring rule should clearly indicate:

```text
Change this occurrence
or
Change future occurrences
```

This is especially important for amount and schedule changes.

---

# 94. Occurrence-Only Edit

A single occurrence may be changed without modifying the recurring rule.

Example:

```text
August bill:
৳1,300

Default rule:
৳1,000
```

This is represented as an occurrence-level override.

---

# 95. Future Rule Edit

If the user changes the rule:

```text
৳1,000 → ৳1,200
```

future occurrences use the new value.

Historical occurrences remain unchanged.

---

# 96. Recurrence Rule Versioning

Changes to recurrence configuration should be versioned where needed for synchronization and history.

This makes it possible to explain:

```text
Why was August expected at ৳1,000
but September at ৳1,200?
```

---

# 97. Auditability

Important recurring changes should be traceable:

- amount changed
- schedule changed
- account changed
- auto-create enabled
- rule paused
- rule resumed
- rule cancelled

This improves user trust.

---

# 98. Acceptance Criteria

The module is complete when:

- Users can create recurring income.
- Users can create recurring expenses.
- Users can create recurring transfers where supported.
- Bills and subscriptions are supported.
- Recurrence rules calculate correctly.
- Month-end dates behave deterministically.
- Missed occurrences are handled safely.
- Rules can be paused and resumed.
- Occurrences can be reviewed.
- Actual transactions can be matched to occurrences.
- Automatic creation is idempotent.
- Duplicate transactions cannot be generated by retries.
- Offline behavior is supported.
- Cloud synchronization is safe.
- Notifications integrate correctly.
- Actual vs scheduled values remain distinct.
- Budget, goal, cash-flow, and reporting integrations work.
- AI insights are grounded in deterministic data.
- Security and ownership checks exist.
- Critical recurrence calculations are covered by automated tests.

---

# 99. Testing Matrix

## Unit Tests

Test:

- daily recurrence
- weekly recurrence
- biweekly recurrence
- monthly recurrence
- yearly recurrence
- custom interval
- month-end behavior
- leap-year behavior
- next occurrence calculation
- missed occurrence
- pause/resume
- occurrence status

## Integration Tests

Test:

- automatic transaction generation
- idempotency
- reminder scheduling
- synchronization
- rule changes
- occurrence matching

## E2E Tests

```text
Create Monthly Expense
→ View Upcoming
→ Receive Reminder
→ Generate Transaction
→ Verify History
```

```text
Pause Rule
→ Confirm No New Occurrence
→ Resume
→ Verify Next Occurrence
```

---

# 100. Recurring Calculation Fixtures

Example:

```text
Rule:
Monthly
Day:
31

Expected:
January 31
February 28
March 31
April 30
```

Another:

```text
Start:
14 Aug

Frequency:
Every 2 Weeks

Expected:
28 Aug
11 Sep
25 Sep
```

Fixtures should be deterministic and reusable.

---

# 101. Performance

The recurrence engine should calculate upcoming occurrences efficiently.

Do not generate thousands of unnecessary future records.

Prefer:

```text
Rule
+
On-demand occurrence calculation
```

or a bounded future occurrence window.

---

# 102. Occurrence Generation Horizon

A reasonable initial strategy is to materialize only a limited future window, such as:

```text
Next 30–90 days
```

where persisted occurrences provide real product value.

The exact horizon should be determined by:

- notification requirements
- reporting requirements
- performance
- synchronization needs

---

# 103. Event-Driven Architecture

Potential internal events:

```text
RecurringRuleCreated
RecurringRuleUpdated
RecurringRulePaused
RecurringRuleResumed
RecurringOccurrenceDue
RecurringOccurrenceMissed
RecurringOccurrenceGenerated
RecurringOccurrenceSkipped
```

These may trigger:

- notifications
- analytics
- reports
- AI insight candidates

---

# 104. Event Deduplication

Every occurrence event must have a stable identity.

Worker retries must not:

```text
Create duplicate transaction
Send duplicate reminder
Create duplicate analytics event
```

---

# 105. Recurring Quality Bar

The recurring finance experience should feel:

```text
Predictable
Transparent
Safe
Low-maintenance
Easy to correct
```

The user should always understand:

```text
What repeats?
When?
How much?
Will the app create it automatically?
What actually happened?
```

---

# 106. Future Enhancements

Potential future capabilities:

```text
Automatic recurring detection
Bank statement matching
Subscription price monitoring
Subscription renewal risk
Smart recurring amount estimation
Automatic bill amount prediction
Recurring payment automation
Smart cash-flow scheduling
AI recurring finance assistant
```

These should be introduced only after the deterministic recurrence engine is stable.

---

# 107. Relationship With Other Documents

Product-module sequence:

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

Recurring Transactions integrates with:

```text
Transactions
Accounts
Categories
Budgets
Goals
Reports
Notifications
Forecasting
Sync
AI
```

The next product document should define the media/file subsystem:

```text
docs/product/MEDIA_FILES.md
```

It should cover:

- Receipt/file upload
- File metadata
- Secure storage
- Attachments
- File types
- Validation
- Size limits
- Upload flow
- Download/preview
- Offline files
- Sync
- Image optimization
- OCR integration
- Privacy
- Security
- Retention
- Deletion
- Acceptance criteria

The core recurring-finance principle remains:

> **A recurring rule should remove repetitive work without ever making the user unsure whether money was actually spent, received, or moved.**
