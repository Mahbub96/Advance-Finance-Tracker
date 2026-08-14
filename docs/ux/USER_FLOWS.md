# Personal Finance — User Flows

**Document:** `USER_FLOWS.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Navigation:** React Native + Expo Router  
**Primary UX Principle:** Minimize friction for frequent financial actions

---

# 1. Purpose

This document defines the primary user journeys of the Personal Finance application.

It converts the information architecture into practical interaction flows.

The purpose is to ensure that:

- Common tasks are fast.
- Navigation remains predictable.
- Financial operations are safe.
- Optional details remain optional.
- Advanced features do not interfere with everyday workflows.
- Offline behavior is intentional.
- AI behavior is controlled and explainable.
- Future synchronization can coexist with local-first usage.

This document is not a pixel-level UI specification.

Detailed screen composition belongs in `UI_DESIGN.md`.

Reusable visual patterns belong in `DESIGN_SYSTEM.md`.

---

# 2. User Flow Principles

All flows should follow these rules:

1. Start from the user's goal, not the application's data model.
2. Minimize the number of required interactions.
3. Ask only for information necessary to complete the task.
4. Infer safe information when possible.
5. Keep optional information optional.
6. Preserve user input during errors.
7. Never silently perform destructive financial actions.
8. Confirm uncertain automation before committing data.
9. Provide useful feedback after successful actions.
10. Keep the user in context whenever practical.
11. Work offline whenever the operation is local-capable.
12. Never make AI a dependency for core financial operations.

---

# 3. Flow Classification

## P0 — Highest Priority

- Add expense
- Add income
- Add transfer
- View balance
- View transactions

## P1 — Core

- Create budget
- Record lending
- Record borrowing
- Record repayment
- Create goal
- Add recurring transaction
- Search transactions
- View reports
- Export data

## P2 — Advanced

- Forecast
- What-if simulation
- Financial health
- Anomaly detection
- Advanced reports

## P3 — Intelligent

- AI insight
- AI recommendation
- AI assistant
- Voice entry
- Receipt extraction

## P4 — Platform

- Cloud sync
- Multi-device synchronization
- Advanced integrations

---

# 4. Global Transaction Entry Model

The primary transaction flow should follow:

```text
Open Composer
      ↓
Enter Amount
      ↓
Smart Suggestions
      ↓
Confirm / Adjust
      ↓
Save
```

Optional details should remain accessible without becoming mandatory.

---

# 5. Flow F-001 — First Launch / Onboarding

## Goal

Get the user into the application with minimal setup.

## Flow

```text
App Launch
   ↓
Welcome
   ↓
Choose Currency
   ↓
Create First Account
   ↓
Optional Opening Balance
   ↓
Optional Notification Setup
   ↓
Dashboard
```

## Optional Cloud Account

The user may see:

```text
Use Locally
     OR
Create Account / Sign In
```

Local use must remain available.

## Success State

The user arrives at Home and can immediately add a transaction.

## Error State

If data initialization fails:

```text
We couldn't finish setting up your finance data.

[Retry]
[Continue Without Optional Setup]
```

The application must avoid trapping the user in onboarding.

---

# 6. Flow F-002 — Add Expense

## Goal

Record a normal expense in the fewest reasonable interactions.

## Preferred Flow

```text
Tap +
  ↓
Expense
  ↓
Amount
  ↓
Suggested Category
  ↓
Suggested Account
  ↓
Save
```

Example:

```text
৳450
Groceries
bKash

[Save]
```

## Optional Details

User may expand:

```text
Merchant
Note
Tags
Date
Attachment
Location
Recurring
```

## Smart Suggestions

The application may suggest:

- Category
- Account
- Merchant
- Recent amount patterns

## Success

```text
Saved
- Balance updated
- Budget updated
- Dashboard updated
- Analytics marked for recalculation if required
```

## Feedback

A lightweight success animation/haptic may confirm the save.

## Error

```text
Couldn't save this expense.

Your information is still here.
[Try Again]
```

---

# 7. Flow F-003 — Add Expense From Recent Transaction

## Goal

Repeat a common transaction quickly.

```text
Transactions / Home
   ↓
Recent Transaction
   ↓
More / Duplicate
   ↓
Review Amount
   ↓
Save
```

A duplicated transaction must receive a new ID and timestamp.

---

# 8. Flow F-004 — Quick Transaction

## Goal

Create a one-tap or near-one-tap transaction for repeated behavior.

Example:

```text
Quick Actions
     ↓
Morning Coffee
     ↓
Review / Save
```

Potential result:

```text
Coffee
৳120
Food
Cash
```

The user can edit before saving.

---

# 9. Flow F-005 — Add Income

## Goal

Record income quickly.

```text
Tap +
   ↓
Income
   ↓
Amount
   ↓
Income Source / Category
   ↓
Account
   ↓
Save
```

Optional:

- Note
- Tags
- Date
- Recurrence
- Attachment

---

# 10. Flow F-006 — Transfer Money

## Goal

Move money between the user's own accounts.

```text
Tap +
   ↓
Transfer
   ↓
From Account
   ↓
To Account
   ↓
Amount
   ↓
Save
```

## Validation

The system must prevent:

- Same source and destination
- Invalid amount
- Invalid account
- Unsupported negative balance behavior

## Result

```text
Source Balance - Amount
Destination Balance + Amount
```

Income and expense totals remain unchanged.

---

# 11. Flow F-007 — Edit Transaction

```text
Transaction List
   ↓
Transaction Detail
   ↓
Edit
   ↓
Modify Fields
   ↓
Save
   ↓
Recalculate Dependencies
```

Affected features may include:

- Account balance
- Budget
- Reports
- Analytics
- Forecast
- Goal-related calculations when applicable

The UI should clearly indicate when a historical edit changes related calculations.

---

# 12. Flow F-008 — Delete / Reverse Transaction

## Goal

Safely remove or reverse a transaction.

```text
Transaction Detail
   ↓
More
   ↓
Delete / Reverse
   ↓
Confirmation
   ↓
Apply
   ↓
Update Derived Data
```

## Rule

Destructive financial operations require deliberate confirmation.

For certain transaction types, reversal may be safer than physical deletion.

---

# 13. Flow F-009 — Search Transactions

```text
Open Search
   ↓
Enter Query
   ↓
Results
   ↓
Optional Filters
   ↓
Transaction Detail
```

Search may match:

- Merchant
- Note
- Amount
- Category
- Account
- Tag
- Person

---

# 14. Flow F-010 — Filter Transactions

```text
Transactions
   ↓
Filter
   ↓
Select Conditions
   ↓
Apply
   ↓
Filtered Results
```

Example:

```text
Date: This Month
Category: Food
Account: bKash
Amount: > ৳500
```

Filters should remain active when the user opens and closes individual transactions unless the user intentionally resets them.

---

# 15. Flow F-011 — Create Budget

## Goal

Create a budget with minimal setup.

```text
More
   ↓
Budgets
   ↓
Create Budget
   ↓
Choose Scope
   ↓
Amount
   ↓
Period
   ↓
Alert Preferences
   ↓
Save
```

## Scope Options

- Overall
- Category
- Multiple categories where supported

## Success

Budget immediately appears in Budget Overview and relevant dashboard surfaces.

---

# 16. Flow F-012 — Review Budget

```text
Home / More
   ↓
Budget
   ↓
Budget Detail
```

Display:

- Planned
- Spent
- Remaining
- Utilization
- Spending pace
- Forecast

Primary question:

> "Am I still on track?"

---

# 17. Flow F-013 — Budget Alert

## Scenario

User reaches a configured threshold or projected overrun.

```text
Financial Analytics
   ↓
Threshold Detected
   ↓
Notification
   ↓
Budget Detail
```

Example:

> "You've used 82% of your food budget."

The notification should open directly to the relevant budget.

---

# 18. Flow F-014 — Add Recurring Transaction

```text
More
   ↓
Recurring
   ↓
Add
   ↓
Choose Income / Expense
   ↓
Amount
   ↓
Account
   ↓
Category
   ↓
Frequency
   ↓
Start Date
   ↓
Optional End Date
   ↓
Save
```

---

# 19. Flow F-015 — Upcoming Bill

```text
Home
   ↓
Upcoming
   ↓
Bill
   ↓
Bill Detail
```

Possible actions:

- Mark paid where supported
- Edit
- Snooze reminder
- View history

If the bill creates a real financial transaction, the actual transaction should remain the financial source of truth.

---

# 20. Flow F-016 — Subscription

```text
More
   ↓
Recurring
   ↓
Subscriptions
   ↓
Subscription Detail
```

The user can:

- Review cost
- View history
- Change recurrence
- Edit account
- Archive subscription

---

# 21. Flow F-017 — Create Lending Record

## Goal

Record money lent to another person.

```text
More
   ↓
Lending
   ↓
Add
   ↓
Person
   ↓
Amount
   ↓
Expected Repayment Date
   ↓
Optional Note / Reminder
   ↓
Save
```

## Success

Show:

```text
Person
Outstanding Amount
Due Date
Status
```

---

# 22. Flow F-018 — Create Borrowing Record

```text
More
   ↓
Borrowing
   ↓
Add
   ↓
Creditor
   ↓
Amount
   ↓
Expected Repayment Date
   ↓
Optional Note / Reminder
   ↓
Save
```

---

# 23. Flow F-019 — Record Partial Repayment

## Goal

Record only part of an outstanding amount.

```text
Lending / Borrowing Detail
   ↓
Record Repayment
   ↓
Amount
   ↓
Account
   ↓
Save
```

Example:

```text
Original:  ৳10,000
Repaid:     ৳4,000
Remaining:  ৳6,000
```

The new outstanding balance must update immediately.

---

# 24. Flow F-020 — Record Full Repayment

Same flow as partial repayment.

After saving:

```text
Outstanding:
৳0

Status:
Fully Repaid
```

The completion state should be obvious.

---

# 25. Flow F-021 — Repayment Reminder

```text
Scheduled Reminder
   ↓
Notification
   ↓
Lending / Borrowing Detail
```

Actions may include:

- View record
- Remind later
- Mark resolved where appropriate

---

# 26. Flow F-022 — Email Repayment Reminder

## User Setup

```text
Lending / Borrowing Detail
   ↓
Reminder
   ↓
Email
   ↓
Choose Timing
   ↓
Review Message
   ↓
Enable
```

## Scheduled Behavior

```text
Scheduled Date
   ↓
Reminder Job
   ↓
Email Provider
   ↓
Delivery Result
```

The user should be able to edit the template.

---

# 27. Flow F-023 — Create Financial Goal

```text
More
   ↓
Goals
   ↓
Create Goal
   ↓
Goal Name
   ↓
Target Amount
   ↓
Target Date
   ↓
Optional Initial Contribution
   ↓
Save
```

---

# 28. Flow F-024 — Goal Contribution

```text
Goal Detail
   ↓
Add Contribution
   ↓
Amount
   ↓
Date
   ↓
Optional Account / Note
   ↓
Save
```

The system should clearly distinguish between a goal contribution and a real account transaction.

If a contribution is linked to an actual savings transaction, duplication must be prevented.

---

# 29. Flow F-025 — Goal Progress

```text
Goal Detail
   ↓
Progress
   ↓
Current Amount
   ↓
Remaining
   ↓
Required Contribution
   ↓
Projected Completion
```

The user can inspect how current behavior affects the goal.

---

# 30. Flow F-026 — Review Analytics

```text
Analytics
   ↓
Overview
   ↓
Select Metric / Section
   ↓
Detailed Analysis
   ↓
Supporting Transactions
```

Example:

```text
Food Spending
৳8,450

+18% vs 3-month average

[View Transactions]
```

---

# 31. Flow F-027 — Compare Periods

```text
Analytics
   ↓
Comparison
   ↓
Select Period A
   ↓
Select Period B
   ↓
Compare
```

Possible comparison:

```text
August vs July
```

Outputs:

- Income change
- Expense change
- Savings change
- Category changes
- Notable differences

---

# 32. Flow F-028 — Review Forecast

```text
Analytics
   ↓
Forecasting
   ↓
Select Forecast
   ↓
Review
```

Example:

```text
Projected August Expense
৳32,500

Current
৳21,700

Projected
৳32,500

Confidence / Data Quality
Based on 6 months of history
```

Actual and forecast values must be visually distinguishable.

---

# 33. Flow F-029 — Review Financial Health

```text
Analytics
   ↓
Financial Health
   ↓
Score
   ↓
Contributors
   ↓
Recommendations
```

The score should not appear as an unexplained number.

---

# 34. Flow F-030 — What-If Simulation

```text
Analytics
   ↓
What-If
   ↓
Choose Scenario
   ↓
Adjust Variables
   ↓
Calculate
   ↓
Review Impact
```

Example:

```text
Save +৳5,000/month

Current Goal:
December 2026

Scenario:
October 2026
```

The simulator must never alter actual financial records.

---

# 35. Flow F-031 — Detect Unusual Spending

```text
Transaction / Analytics Engine
   ↓
Pattern Analysis
   ↓
Anomaly Detected
   ↓
User Notification / Analytics Surface
   ↓
Review Transaction
```

The wording should be:

> "This transaction is unusual compared with your normal spending."

Not:

> "This transaction is fraudulent."

---

# 36. Flow F-032 — AI Financial Insight

## Prerequisite

Reliable analytics and structured financial context.

## Flow

```text
Financial Data
   ↓
Deterministic Analytics
   ↓
Insight Candidate
   ↓
AI Context Preparation
   ↓
AI Provider
   ↓
Validation
   ↓
AI Insight
   ↓
User
```

The application should not ask the AI to calculate basic totals that the system can calculate deterministically.

---

# 37. Flow F-033 — AI Recommendation

```text
Financial Metrics
   ↓
Risk / Opportunity Detection
   ↓
Recommendation Context
   ↓
AI
   ↓
Recommendation
   ↓
User Review
```

Example:

> "Reducing restaurant spending by approximately ৳1,500 this month could help keep you within your food budget."

---

# 38. Flow F-034 — AI Warning

```text
Analytics / Forecasting
   ↓
Risk Detected
   ↓
Rule Validation
   ↓
AI Explanation
   ↓
Notification / Insight
   ↓
User
```

AI should explain a calculated risk rather than inventing the risk.

---

# 39. Flow F-035 — Ask a Financial Question

```text
AI Assistant
   ↓
User Question
   ↓
Intent Detection
   ↓
Application Data Query
   ↓
Deterministic Calculation
   ↓
Structured Result
   ↓
AI Explanation
   ↓
Response
```

Example:

```text
User:
How much did I spend on food this month?

System:
৳8,450

AI:
You spent ৳8,450 on food this month,
which is 18% higher than your three-month average.
```

---

# 40. Flow F-036 — AI Multi-Turn Question

```text
User:
How much did I spend on food?

Assistant:
৳8,450.

User:
Is that higher than usual?

Assistant:
Yes, approximately 18% higher than your recent average.
```

Conversation context must not become the source of financial truth.

Each factual answer should be grounded in current application data.

---

# 41. Flow F-037 — Voice Transaction Entry

```text
Tap Voice
   ↓
Speak
   ↓
Speech-to-Text
   ↓
Structured Extraction
   ↓
Suggested Transaction
   ↓
User Review
   ↓
Save
```

Example:

```text
"আজকে বিকাশে ৪৫০ টাকা বাজার করেছি"
```

Result:

```text
Expense
৳450
Groceries
bKash
Today
```

User confirmation is required before committing uncertain extraction.

---

# 42. Flow F-038 — Receipt Capture

```text
Add Transaction
   ↓
Receipt
   ↓
Camera / File
   ↓
OCR
   ↓
Extracted Data
   ↓
Review
   ↓
Correct
   ↓
Save
```

If OCR confidence is low, the system should highlight uncertain fields.

---

# 43. Flow F-039 — Automatic Category Suggestion

```text
Transaction Input
   ↓
Merchant / Text / History
   ↓
Category Suggestion
   ↓
User Accepts or Changes
   ↓
Save
```

Correction should be easy and low-friction.

---

# 44. Flow F-040 — Duplicate Transaction Detection

```text
New Transaction
   ↓
Duplicate Heuristics
   ↓
Potential Duplicate Detected
   ↓
User Warning
   ├── Keep
   └── Cancel
```

The system should never silently discard a legitimate transaction.

---

# 45. Flow F-041 — Search and Open Historical Data

```text
Search
   ↓
Query
   ↓
Result
   ↓
Transaction / Account / Person / Goal
   ↓
Detail
```

The navigation should preserve the user's search state when they return where practical.

---

# 46. Flow F-042 — Export Financial Data

```text
More
   ↓
Data
   ↓
Export
   ↓
Choose Format
   ↓
Choose Scope
   ↓
Generate
   ↓
Preview / Share / Save
```

Formats:

- CSV
- JSON
- PDF report

The export must clearly communicate what data is included.

---

# 47. Flow F-043 — Import Financial Data

```text
Data
   ↓
Import
   ↓
Select File
   ↓
Parse
   ↓
Validate
   ↓
Preview
   ↓
Resolve Issues
   ↓
Confirm
   ↓
Import
   ↓
Summary
```

No destructive import should occur without confirmation.

---

# 48. Flow F-044 — Local Backup

```text
Settings
   ↓
Data
   ↓
Backup
   ↓
Choose Destination
   ↓
Create Backup
   ↓
Success
```

The backup should contain a version identifier and integrity metadata.

---

# 49. Flow F-045 — Restore Backup

```text
Settings
   ↓
Data
   ↓
Restore
   ↓
Select Backup
   ↓
Validate
   ↓
Preview
   ↓
Confirm
   ↓
Restore
   ↓
Rebuild / Reindex
   ↓
Success
```

The system should protect the user from restoring incompatible or corrupt data.

---

# 50. Flow F-046 — Offline Transaction

## Scenario

User has no internet connection.

```text
User Adds Transaction
   ↓
Local Validation
   ↓
SQLite Write
   ↓
Success
```

No network request is required.

If cloud sync is enabled:

```text
Local Write
   ↓
Sync Queue
   ↓
Wait for Connectivity
```

---

# 51. Flow F-047 — Offline Edit

```text
Offline
   ↓
Edit Transaction
   ↓
Local Save
   ↓
Sync Queue Updated
```

The user should see the updated local state immediately.

---

# 52. Flow F-048 — Synchronize Offline Changes

```text
Connectivity Restored
   ↓
Sync Engine
   ↓
Pending Changes
   ↓
Upload / Compare
   ↓
Server Response
   ↓
Apply Changes
   ↓
Mark Synced
```

Sync should be retryable.

---

# 53. Flow F-049 — Sync Conflict

## Example

Same record changed on two devices.

```text
Device A
   ↓
Change

Device B
   ↓
Change

Cloud Sync
   ↓
Conflict Detected
   ↓
Conflict Resolver
   ↓
Automatic Resolution if Safe
        OR
User Review
```

The user-facing conflict screen should avoid technical terminology.

---

# 54. Flow F-050 — Notification Deep Link

```text
Notification
   ↓
Tap
   ↓
Specific Destination
   ↓
Relevant Record
```

Examples:

```text
Budget Alert
→ Budget Detail

Repayment Reminder
→ Lending / Borrowing Detail

Goal Milestone
→ Goal Detail

AI Insight
→ Insight Detail
```

---

# 55. Flow F-051 — Notification Snooze

```text
Notification
   ↓
Snooze
   ↓
Select Time
   ↓
Reschedule
```

The user should not need to navigate through Settings to snooze one reminder.

---

# 56. Flow F-052 — Settings

```text
More
   ↓
Settings
   ↓
Select Section
```

Sections:

```text
General
Appearance
Finance
Notifications
Privacy
Security
AI
Data
Sync
Language
About
```

Each section should contain only related settings.

---

# 57. Flow F-053 — Change Currency

```text
Settings
   ↓
Finance
   ↓
Currency
   ↓
Choose Currency
   ↓
Review Impact
   ↓
Confirm
```

Changing display/base currency must not corrupt historical source amounts.

---

# 58. Flow F-054 — Disable AI

```text
Settings
   ↓
AI
   ↓
AI Features
   ↓
Disable AI
   ↓
Confirm
```

After disabling:

- Core finance still works.
- Deterministic analytics still work.
- Forecasting can continue if locally supported.
- AI-specific features become unavailable or hidden appropriately.

---

# 59. Flow F-055 — Privacy Review

```text
Settings
   ↓
Privacy
   ↓
Review Data Usage
```

User should understand:

- Local storage
- Cloud sync
- AI providers
- External integrations
- Export and deletion

Language should be understandable to non-technical users.

---

# 60. Flow F-056 — Delete Personal Data

```text
Settings
   ↓
Privacy / Data
   ↓
Delete Data
   ↓
Explain Consequences
   ↓
Optional Export
   ↓
Strong Confirmation
   ↓
Delete
   ↓
Completion
```

This is a destructive operation and must be deliberate.

---

# 61. Flow F-057 — First Insight Discovery

A user may encounter AI or analytical insights on Home.

```text
Home
   ↓
Insight Card
   ↓
Tap
   ↓
Insight Detail
   ↓
Supporting Data
   ↓
Optional Action
```

The user should always be able to inspect why the insight exists.

---

# 62. Flow F-058 — Financial Recommendation Action

```text
Recommendation
   ↓
View Explanation
   ↓
Suggested Action
   ↓
Review
   ↓
User Decides
```

AI should recommend; the user decides.

The system should not automatically modify budgets, delete subscriptions, move money, or change goals solely because of an AI recommendation.

---

# 63. Flow F-059 — User Corrects AI

```text
AI Insight
   ↓
Incorrect / Not Useful
   ↓
Feedback
   ├── Incorrect
   ├── Not Relevant
   └── Dismiss
```

Where useful, the user may correct the underlying categorization or financial data.

AI feedback must not silently modify source financial data.

---

# 64. Flow F-060 — App Upgrade / Migration

When application storage schemas change:

```text
App Update
   ↓
Detect Local Database Version
   ↓
Run Migration
   ↓
Validate
   ↓
Open App
```

If migration fails:

```text
Migration Failed
   ↓
Protect Existing Data
   ↓
Recovery / Restore Path
```

The application must never knowingly destroy financial data during migration.

---

# 65. Flow F-061 — Large Dataset Navigation

When the user has many transactions:

```text
Transactions
   ↓
Virtualized List / Pagination
   ↓
Search / Filter
   ↓
Load Relevant Data
```

The UI should avoid loading the entire financial history into memory unnecessarily.

---

# 66. Flow F-062 — Empty Transaction State

```text
Transactions
   ↓
No Data
```

Display:

```text
No transactions yet

Add your first expense or income
to start understanding your finances.

[Add Transaction]
```

The primary action should be obvious.

---

# 67. Flow F-063 — Empty Budget State

```text
Budgets
   ↓
No Budgets
```

Display:

```text
No budgets yet

Create a budget to understand
whether your spending is on track.

[Create Budget]
```

---

# 68. Flow F-064 — Empty Goals State

```text
Goals
   ↓
No Goals
```

Display:

```text
No financial goals yet

Set a target and track your progress.

[Create Goal]
```

---

# 69. Flow F-065 — Empty Lending State

```text
Lending
   ↓
No Lending Records
```

Display:

```text
Nobody currently owes you money

Track money you lend so repayment dates
don't get forgotten.

[Add Lending]
```

---

# 70. Flow F-066 — Empty Borrowing State

```text
Borrowing
   ↓
No Borrowing Records
```

Display:

```text
No outstanding borrowing

Track money you owe so repayment dates
stay visible.

[Add Borrowing]
```

---

# 71. Flow F-067 — Form Validation Error

General pattern:

```text
Input
   ↓
Validation
   ↓
Invalid Field
   ↓
Inline Error
   ↓
User Corrects
   ↓
Submit
```

The application should preserve all valid input.

Do not reset the entire form because of one invalid field.

---

# 72. Flow F-068 — Network Failure

For network-dependent operations:

```text
Action
   ↓
Network Failure
```

Possible response:

```text
You're offline.

Your local changes are safe.
We'll retry when the connection returns.
```

Where the operation is cloud-only, clearly explain why it cannot continue.

---

# 73. Flow F-069 — AI Provider Failure

```text
AI Request
   ↓
Provider Failure
```

Response:

```text
AI insights are temporarily unavailable.

Your financial data and standard analytics are still available.
```

Offer retry where appropriate.

---

# 74. Flow F-070 — Email Delivery Failure

```text
Scheduled Email
   ↓
Provider Error
   ↓
Retry
   ↓
Success
```

After repeated failure:

```text
Reminder couldn't be delivered.

Review email settings or try again.
```

The user should still see the underlying repayment obligation.

---

# 75. Flow F-071 — Permission Request

Permissions should be requested contextually.

Examples:

- Camera → first receipt capture
- Notifications → first reminder setup
- Microphone → first voice-entry attempt
- File access → first import/attachment

Do not request every permission during onboarding.

---

# 76. Flow F-072 — Permission Denied

If a permission is denied:

```text
Feature Request
   ↓
Permission Denied
   ↓
Explain Impact
   ↓
Continue Without Feature
```

The core application must continue working where possible.

---

# 77. Flow F-073 — First Recurring Rule

A recurring rule should explain what will happen:

```text
Every Month
৳25,000
Salary
Bank Account

Next:
1 September
```

The user should clearly understand whether the rule:

- creates an actual transaction automatically
- creates a reminder
- proposes a transaction

The implementation choice must be explicit.

---

# 78. Flow F-074 — Recurring Transaction Review

Before automatic generation becomes active:

```text
Rule Created
   ↓
Next Occurrence
   ↓
Preview
   ↓
Generate / Schedule
```

The exact automation policy should be documented in the recurring finance module.

---

# 79. Flow F-075 — Month-End Review

A useful monthly review flow:

```text
Home
   ↓
Monthly Summary
   ↓
Income
   ↓
Expenses
   ↓
Savings
   ↓
Budget Performance
   ↓
Goals
   ↓
Insights
   ↓
Recommendations
```

The user should be able to understand the month without manually opening dozens of screens.

---

# 80. Flow F-076 — Monthly Report

```text
Reports
   ↓
Monthly Summary
   ↓
Select Month
   ↓
Generate
   ↓
Review
   ↓
Export / Share
```

---

# 81. Flow F-077 — Goal Risk Detection

```text
Goal Data
   ↓
Forecast
   ↓
Projected Delay
   ↓
Risk State
   ↓
Notification / Goal Detail
   ↓
Recommendation
```

The user should see:

- Why the goal is at risk.
- What adjustment could help.
- What the projected effect is.

---

# 82. Flow F-078 — Budget Overspending Simulation

```text
Budget Detail
   ↓
Projected Overrun
   ↓
What-If
   ↓
Adjust Spending
   ↓
Review New Projection
```

This creates a bridge between analytics and decision support.

---

# 83. Flow F-079 — Financial Health Improvement

```text
Financial Health
   ↓
Score Breakdown
   ↓
Weak Area
   ↓
Recommendation
   ↓
Relevant Module
```

Example:

```text
Savings Rate
↓
Recommendation
↓
Goal / Budget
```

The recommendation should deep-link to a practical next action when possible.

---

# 84. Flow F-080 — User Changes a Financial Plan

Example:

```text
Goal
   ↓
Target Date
   ↓
Adjust Date
   ↓
Recalculate Required Saving
   ↓
Confirm
```

Changing the plan should update projections without rewriting historical transactions.

---

# 85. Cross-Flow Invariants

The following must remain true across all flows:

## Financial Correctness

Every action must preserve correct account balances and financial classifications.

## No Silent Destructive Changes

Deleting, restoring, or overwriting data must be intentional.

## Local-First Behavior

Core local operations should not wait for the network.

## AI Optionality

AI failure must not break finance workflows.

## Clear Feedback

After a successful action, the user must understand what changed.

## Recoverability

Where reasonable, users should be able to undo or correct mistakes.

---

# 86. Flow Optimization Targets

For high-frequency actions, target:

## Add Expense

Prefer:

```text
≤ 1 navigation transition
≤ 3 required inputs
≤ minimal confirmation
```

## Add Income

Prefer a similarly short path.

## Transfer

Prefer:

```text
From
To
Amount
Save
```

## Record Repayment

Prefer:

```text
Amount
Save
```

once the related obligation is already known.

These are UX goals, not blind numerical constraints. Usability and correctness remain more important than artificially minimizing taps.

---

# 87. Flow Testing

Critical flows should be tested for:

- First-time users
- Returning users
- Offline mode
- Large datasets
- Invalid input
- Interrupted flows
- Permission denial
- Network failure
- Sync conflict
- AI failure

---

# 88. Flow Review Checklist

Before approving a new flow:

- [ ] User goal is clear
- [ ] Primary action is obvious
- [ ] Required fields are minimal
- [ ] Optional fields are optional
- [ ] Navigation is predictable
- [ ] One-handed use is reasonable
- [ ] Loading state exists
- [ ] Error state exists
- [ ] Empty state exists where applicable
- [ ] Offline behavior is defined
- [ ] Destructive actions are protected
- [ ] AI behavior is optional
- [ ] Success feedback exists
- [ ] Accessibility is considered
- [ ] Analytics impact is considered
- [ ] Test cases are identified

---

# 89. Relationship With Other UX Documents

This document sits between information architecture and visual/interface design.

```text
UX_RESEARCH.md
       ↓
INFORMATION_ARCHITECTURE.md
       ↓
USER_FLOWS.md
       ↓
UI_DESIGN.md
       ↓
DESIGN_SYSTEM.md
```

The next document should translate these flows into concrete screen composition and interaction specifications:

```text
docs/ux/UI_DESIGN.md
```

It should define:

- Screen-by-screen composition
- Layout hierarchy
- Component placement
- Interaction states
- Bottom sheets
- Cards
- Forms
- Charts
- Empty/loading/error states
- Responsive behavior
- Micro-interactions
- Visual emphasis

The UI must preserve the core flow rule:

> **Make everyday financial actions feel effortless, while keeping advanced financial capabilities one level deeper and easy to discover.**
