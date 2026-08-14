# Personal Finance — Budgeting Module

**Document:** `BUDGETING.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Module:** Budgeting  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL + Prisma  
**Local Database:** SQLite

---

# 1. Purpose

The Budgeting module helps users plan, monitor, and control spending.

The module must answer:

> **"Am I still on track with my spending?"**

It should not merely report that a budget was exceeded after the fact.

It should provide:

- Planned spending
- Actual spending
- Remaining amount
- Utilization
- Spending pace
- Projected spending
- Risk level
- Alerts
- Historical comparison
- Actionable guidance

The budgeting experience must remain simple for ordinary users while supporting advanced planning for power users.

---

# 2. Product Philosophy

Budgeting should be:

- Proactive
- Explainable
- Flexible
- Low-friction
- Calm
- Data-driven

The primary objective is not to punish overspending.

The objective is to help users understand whether current behavior is compatible with their financial plan.

---

# 3. Budget Concepts

The module distinguishes:

```text
Budget
Actual Spending
Remaining Budget
Utilization
Spending Pace
Projected Spending
Budget Risk
```

These are related but should not be treated as the same metric.

---

# 4. Budget Types

The system should support:

## 4.1 Overall Budget

Represents the user's planned total spending for a period.

Example:

```text
August
Budget: ৳40,000
```

---

## 4.2 Category Budget

Applies to a specific category.

Example:

```text
Food
Budget: ৳10,000
```

---

## 4.3 Multi-Category Budget

A single budget may cover multiple categories when supported.

Example:

```text
Lifestyle
├── Restaurant
├── Entertainment
└── Shopping

Budget: ৳15,000
```

---

## 4.4 Weekly Budget

Useful for users who manage spending on a short cycle.

---

## 4.5 Monthly Budget

The primary default budget period.

---

## 4.6 Custom Period Budget

Supports arbitrary start and end dates.

Use cases:

- Trips
- Projects
- Temporary spending plans
- Exam/semester periods
- Special events

---

# 5. Budget Data Model

A budget conceptually contains:

```text
id
user_id
name
amount
currency
period_type
start_date
end_date
status
alert_configuration
created_at
updated_at
deleted_at
```

Category associations are represented separately where multiple categories are supported.

The authoritative source is the configured budget amount and date/category scope.

---

# 6. Budget Lifecycle

Possible states:

```text
DRAFT
ACTIVE
COMPLETED
ARCHIVED
```

A budget may also have calculated runtime statuses such as:

```text
ON_TRACK
ATTENTION
AT_RISK
EXCEEDED
```

Calculated status should not necessarily be persisted as authoritative financial data.

---

# 7. Budget Creation Flow

```text
Budgets
   ↓
Create Budget
   ↓
Choose Type
   ↓
Choose Category / Scope
   ↓
Set Amount
   ↓
Set Period
   ↓
Configure Alerts
   ↓
Review
   ↓
Save
```

The creation flow should avoid unnecessary fields.

---

# 8. Required Budget Fields

Minimum information:

- Name or category scope
- Amount
- Currency
- Start date
- End date / period
- Spending scope

Everything else should be optional.

---

# 9. Budget Currency

A budget should have an explicit currency.

For the initial single-currency experience, the user base currency may be the default.

Future multi-currency support must define conversion rules explicitly.

---

# 10. Budget Period Rules

For a monthly budget:

```text
Start:
First calendar day of month

End:
Last calendar day of month
```

The user's configured timezone determines calendar boundaries.

---

# 11. Month-End Handling

Monthly budgets must correctly handle:

- 28-day February
- 29-day February
- 30-day months
- 31-day months

Recurring budget generation must never create invalid dates.

---

# 12. Budget Scope

A budget may target:

```text
All Expenses
```

or:

```text
Specific Category
```

or:

```text
Specific Categories
```

The inclusion rules must be explicit.

---

# 13. Spending Qualification

Only transactions that meet the budget's rules count toward spending.

Typical inclusion:

```text
Transaction type = EXPENSE
Transaction date within budget period
Transaction category matches budget scope
Transaction is valid / posted
```

Typical exclusions:

- Income
- Transfers
- Deleted transactions
- Voided transactions

Refund behavior must be explicitly handled.

---

# 14. Refund Handling

A refund associated with a previous expense should normally reduce effective spending for the relevant budget.

Example:

```text
Expense:  ৳2,000
Refund:   ৳500

Net spending:
৳1,500
```

The budgeting implementation must avoid counting the refund as unrelated income for spending analytics where the product treats it as a correction to an expense.

---

# 15. Transfer Handling

Transfers must never count as spending.

Example:

```text
Bank → Cash
৳10,000
```

Budget impact:

```text
৳0
```

---

# 16. Adjustment Handling

Adjustments should count toward a budget only when the business rule explicitly classifies them as budget-impacting financial activity.

Default behavior should be conservative and documented.

---

# 17. Core Budget Calculations

## Spent

```text
Spent
=
Sum of qualifying expense activity
-
Applicable refunds
```

## Remaining

```text
Remaining
=
Budget Amount - Spent
```

## Utilization

```text
Utilization
=
Spent / Budget Amount × 100
```

---

# 18. Budget Status

A calculated budget status may use:

```text
ON_TRACK
ATTENTION
AT_RISK
EXCEEDED
```

Status thresholds should consider both:

- utilization
- time elapsed

A budget at 80% utilization on day 25 may be healthy.

The same 80% utilization on day 10 may indicate risk.

---

# 19. Time-Aware Budget Analysis

The module should compare spending progress with time progress.

Example:

```text
Month Progress:
50%

Budget Used:
72%
```

This suggests higher-than-planned spending velocity.

---

# 20. Spending Pace

A basic daily pace can be calculated:

```text
Daily Spending Pace
=
Spent / Elapsed Budget Days
```

Projected monthly spending:

```text
Projected Spending
≈
Daily Spending Pace × Total Budget Days
```

The product may use more advanced forecasting later.

---

# 21. Remaining Daily Allowance

A useful metric:

```text
Remaining Daily Allowance
=
Remaining Budget / Remaining Days
```

Example:

```text
Remaining:
৳8,000

Remaining days:
10

Suggested average daily limit:
৳800
```

This is a planning metric, not a mandatory spending limit.

---

# 22. Budget Forecasting

Budget forecasting estimates whether current behavior is likely to exceed the configured budget.

Inputs may include:

- Current spending
- Time elapsed
- Historical behavior
- Weekday/weekend patterns
- Recurring expenses
- Upcoming commitments

---

# 23. Forecast Methods

The system may use:

### Level 1

Simple pace-based projection.

### Level 2

Historical weighted average.

### Level 3

Regression / time-series model.

The simplest sufficiently reliable model should be preferred.

---

# 24. Budget Risk Calculation

A risk engine may classify:

```text
LOW
MODERATE
HIGH
CRITICAL
```

Potential inputs:

```text
Utilization
Time Progress
Spending Velocity
Forecasted Overrun
Historical Variance
Upcoming Commitments
```

---

# 25. Budget Risk Example

```text
Budget:
৳10,000

Spent:
৳7,800

Time:
75% elapsed

Forecast:
৳11,200
```

Possible state:

```text
AT_RISK
```

Explanation:

> "You've used 78% of the budget with 25% of the period remaining."

---

# 26. Alert Thresholds

Default configurable thresholds may include:

```text
50%
75%
80%
90%
100%
Projected Overrun
```

The exact defaults should be user-friendly and not generate excessive notifications.

---

# 27. Budget Notification Levels

## Informational

```text
You've used 55% of your food budget.
```

## Attention

```text
You're spending faster than usual.
```

## Warning

```text
Your current pace may exceed this month's budget.
```

## Critical

```text
Your budget is projected to be exceeded.
```

Messages should remain calm and actionable.

---

# 28. Notification Preferences

Users should be able to:

- enable/disable alerts
- choose thresholds
- choose notification channel
- mute a specific budget
- snooze alerts
- customize frequency

---

# 29. Alert Deduplication

The same condition must not produce repeated notifications unnecessarily.

Example:

```text
80% reached
```

should not generate a new notification every time the app recalculates the budget.

A threshold should trigger according to a defined event policy.

---

# 30. Threshold Crossing Model

Notifications should generally be triggered when crossing a threshold.

Example:

```text
79.8%
 ↓
Transaction
 ↓
80.2%
 ↓
Trigger 80% alert
```

Subsequent calculations at:

```text
80.4%
80.7%
81.0%
```

do not repeatedly trigger the same threshold.

---

# 31. Threshold Reset

A threshold may reset when a new budget period begins.

For recurring monthly budgets:

```text
July threshold state
        ↓
August starts
        ↓
Threshold tracking resets
```

---

# 32. Overspending

If:

```text
Spent > Budget
```

then:

```text
Remaining < 0
Utilization > 100%
Status = EXCEEDED
```

The UI should clearly show the amount exceeded.

Example:

```text
Budget:
৳10,000

Spent:
৳11,200

Exceeded by:
৳1,200
```

---

# 33. Budget Overrun UX

The system should answer:

- How much over?
- Why?
- Which categories caused it?
- Is the trend temporary?
- What can the user do?

Avoid merely showing:

> Budget exceeded.

---

# 34. Budget Detail Screen

Recommended composition:

```text
Food Budget

৳7,800 / ৳10,000

78%
████████░░

Remaining
৳2,200

Daily Allowance
৳314

Projected
৳9,800

Status
On Track

Top Spending
Restaurant
Groceries
Coffee

[View Transactions]
[Edit Budget]
```

---

# 35. Budget Overview Screen

The overview should emphasize:

```text
Total Planned
Total Spent
Total Remaining
Budgets At Risk
```

Then show individual budgets.

---

# 36. Budget Card

Recommended structure:

```text
Food

৳7,800 / ৳10,000

████████░░ 78%

৳2,200 remaining

Projected:
৳9,800
```

Risk information may appear as a subtle label.

---

# 37. Budget Creation UX

Default creation should be short.

For a category budget:

```text
Category
Food

Amount
৳10,000

Period
Monthly

Alerts
Default

[Create Budget]
```

Advanced settings may remain collapsed.

---

# 38. Budget Editing

Users should be able to modify:

- Budget amount
- Categories
- Period where safe
- Alert thresholds
- Name

Historical reporting must preserve the semantics necessary to explain past periods.

---

# 39. Budget History

Users should be able to compare previous periods.

Example:

```text
Food

August
Budget ৳10,000
Spent ৳9,800

July
Budget ৳10,000
Spent ৳8,900

June
Budget ৳9,000
Spent ৳8,200
```

---

# 40. Historical Budget Changes

If the user changes a budget from:

```text
৳10,000 → ৳12,000
```

the application must determine whether the change applies to:

- current period only
- future periods
- a recurring template

It should not silently rewrite historical budget context.

---

# 41. Recurring Budgets

The product may support recurring budget templates.

Example:

```text
Food
৳10,000
Every Month
```

A new budget period can be generated automatically.

---

# 42. Budget Template

A recurring budget template should remain separate from the actual completed budget period when historical accuracy matters.

Conceptually:

```text
Budget Template
     ↓
August Budget
September Budget
October Budget
```

---

# 43. Budget Carryover

Future capability.

Some users may want unused budget to carry forward.

Example:

```text
July:
Budget ৳10,000
Spent ৳8,000
Unused ৳2,000

August Base:
৳10,000

With Carryover:
৳12,000
```

Carryover must be explicitly enabled.

---

# 44. Budget Rollover Rules

If supported, the system must document:

- max carryover
- negative carryover
- expiration
- category-specific behavior

Do not implement ambiguous rollover behavior.

---

# 45. Shared Budget Future Scope

Future shared-finance functionality may introduce:

```text
Household Budget
     ↓
Members
     ↓
Shared Transactions
```

The current personal budgeting architecture should not require shared budgeting now.

---

# 46. Budget vs Goal

Budget and goal concepts must remain distinct.

## Budget

Controls planned spending.

## Goal

Tracks desired accumulation or financial outcome.

Example:

```text
Budget:
Food ≤ ৳10,000

Goal:
Save ৳100,000 for Laptop
```

---

# 47. Budget vs Savings Rate

Budget compliance does not automatically mean good savings.

Example:

```text
Within Budget
+
Low Savings
```

may still require attention.

Analytics should keep these concepts separate.

---

# 48. Budget vs Financial Health

Budget performance may be one component of Financial Health.

It must not be the only factor.

Potential health dimensions:

```text
Savings
Cash Flow
Budget
Debt
Goals
Recurring Commitments
```

---

# 49. Budget Search and Filter

Budget list should support:

- active
- archived
- category
- status
- period

Advanced users may filter:

```text
At Risk
Exceeded
On Track
```

---

# 50. Budget Analytics

Each budget may provide:

- current period
- previous period
- historical average
- utilization trend
- forecast
- top contributing transactions
- category distribution where applicable

---

# 51. Budget Drill-Down

A budget should allow:

```text
Budget
  ↓
Top Spending Category
  ↓
Transaction List
  ↓
Transaction Detail
```

This creates an explainable chain from summary to source data.

---

# 52. Budget Recommendations

The deterministic engine may identify opportunities such as:

```text
Food budget risk
```

Then AI may convert that into a readable recommendation:

> "Restaurant spending is the main reason your food budget is trending above plan."

---

# 53. AI Budget Insight Pipeline

```text
Transactions
   ↓
Budget Calculation
   ↓
Risk Detection
   ↓
Structured Context
   ↓
AI Explanation
   ↓
Insight
```

The AI should not calculate the underlying budget metrics.

---

# 54. AI Budget Recommendations

Potential recommendations:

- reduce discretionary category spending
- adjust unrealistic budget
- shift spending across categories
- change savings contribution
- review recurring commitments

Recommendations should distinguish:

```text
Behavior Recommendation
vs
Budget Configuration Recommendation
```

---

# 55. Budget AI Guardrails

AI must not:

- automatically change budget values
- delete categories
- create financial commitments
- move money
- alter transactions

without explicit user-controlled actions.

---

# 56. Budget Notifications Through AI

AI-generated notifications should only be used when they provide additional value over deterministic alerts.

Do not use AI simply to rephrase every threshold event.

---

# 57. Budget Data Quality

Forecasts and recommendations should consider data quality.

Examples:

```text
Only 5 days of data
```

should produce weaker confidence than:

```text
6 months of consistent history
```

The UI may communicate:

> "Limited data available."

---

# 58. Budget Edge Cases

The system must handle:

- Zero-value budget
- Very small budget
- Very large budget
- Refund
- Deleted transaction
- Deleted category
- Archived account
- Transaction edited after budget period
- Transaction entered late for an earlier date
- Timezone change
- Currency mismatch
- Budget period overlap
- Empty budget
- Future-dated transaction
- Backdated transaction

---

# 59. Zero Budget

A zero budget can create division-by-zero for utilization.

Behavior must be explicit.

Possible:

```text
Budget = 0
Spent = 0
Utilization = N/A
```

If:

```text
Budget = 0
Spent > 0
```

status should indicate that spending occurred without an allocated budget.

---

# 60. Overlapping Budgets

Overlapping budgets are allowed only when their scopes are clearly understood.

Example:

```text
Overall Budget
+
Food Budget
```

Both may legitimately count the same food expense for different analytical purposes.

The system must avoid implying that these are additive constraints unless the user explicitly configured them that way.

---

# 61. Multiple Category Budgets

Example:

```text
Food       ৳10,000
Transport  ৳5,000
```

A food transaction should contribute only to the matching budget(s).

If multiple budgets intentionally overlap, the UI should make this understandable.

---

# 62. Budget Period Timezone

Budget boundaries must use the user's configured timezone.

Example:

```text
11:30 PM local
```

must not accidentally become the next day because of server UTC conversion.

---

# 63. Offline Budget Calculation

Core budgeting must work offline when required source transactions exist locally.

```text
SQLite
 ↓
Budget Query
 ↓
Local Calculation
 ↓
UI
```

---

# 64. Cloud Budget Calculation

The backend should also provide authoritative server-side calculations for synchronized/cloud reporting.

Both local and server calculations must follow the same business rules.

---

# 65. Calculation Consistency

To prevent differences between mobile and backend:

```text
Shared Business Specification
+
Test Cases
+
Known Fixtures
```

should define expected budget outcomes.

Where practical, reusable calculation logic may be shared between clients, but server validation remains authoritative.

---

# 66. Budget Caching

Budget summaries may be cached for performance.

Any cached result must have:

- period
- calculation version
- input/data freshness indicator

The source transactions remain authoritative.

---

# 67. Budget Recalculation Triggers

Budget calculations may need refresh when:

- transaction created
- transaction updated
- transaction deleted
- transaction restored
- refund created
- budget changed
- category association changes
- period changes

---

# 68. Background Budget Processing

Expensive historical recalculation should run asynchronously if needed.

Normal transaction entry must not wait for a full analytics rebuild.

---

# 69. Budget Events

Potential internal events:

```text
BudgetCreated
BudgetUpdated
BudgetArchived

BudgetThresholdReached
BudgetProjectedOverrun
BudgetExceeded
```

These may trigger:

- notifications
- analytics updates
- insight candidates

---

# 70. Budget Event Deduplication

Events must be designed to avoid repeated notifications or duplicate background work.

A threshold event should have a stable identity for the budget period and threshold.

---

# 71. Budget API Integration

Relevant endpoints:

```text
GET    /api/v1/budgets
POST   /api/v1/budgets
GET    /api/v1/budgets/:id
PATCH  /api/v1/budgets/:id
POST   /api/v1/budgets/:id/archive
POST   /api/v1/budgets/:id/restore
GET    /api/v1/budgets/:id/summary
```

Exact API contracts are defined in `architecture/API.md`.

---

# 72. Budget Database Integration

Relevant database entities:

```text
Budget
BudgetCategory
Transaction
Category
Notification
```

Derived metrics should remain reproducible from source records.

---

# 73. Budget Local Storage Integration

Relevant local tables:

```text
budgets
budget_categories
transactions
categories
notifications
sync_operations
```

Budget calculations must continue to work offline.

---

# 74. Budget Sync Behavior

Budget changes should synchronize as ordinary versioned entity changes.

Examples:

```text
Budget created offline
 ↓
Pending sync
 ↓
Server accepted
 ↓
ACK
```

If the same budget is changed on another device, normal version/conflict rules apply.

---

# 75. Budget Conflict Example

Device A:

```text
Budget = ৳10,000
```

Device B:

```text
Budget = ৳12,000
```

Both edit from version 4.

Server receives A first:

```text
Version 5 = ৳10,000
```

B then attempts version 4 update:

```text
Conflict
```

The client should receive the server version and resolve appropriately.

---

# 76. Budget Security

Every budget operation must verify:

- user ownership
- category ownership
- currency rules
- valid period
- authorized mutation

A user cannot create a budget using another user's category ID.

---

# 77. Budget Import / Export

Budget data should be included in user exports.

Import must validate:

- amount
- period
- category ownership
- currency
- duplicate semantics

Import should not silently overwrite existing budgets.

---

# 78. Budget Accessibility

Budget UI must communicate:

- percentage
- absolute remaining
- risk state
- projected state

through text and semantics, not color alone.

Example:

```text
78% used
৳2,200 remaining
Projected: ৳9,800
```

---

# 79. Budget UX Performance

The budget overview should render quickly.

Preferred:

```text
Local summary
 ↓
Render
 ↓
Optional deeper analytics
```

The screen should not wait for AI or remote analytics.

---

# 80. Budget Quality Metrics

The product may track:

- budget creation rate
- active budget rate
- budget review frequency
- threshold alert engagement
- budget completion
- repeated overspending
- goal/budget interaction

Product analytics must avoid unnecessarily collecting sensitive financial values.

---

# 81. Budget Testing Matrix

## Unit Tests

- spending calculation
- utilization
- remaining
- threshold crossing
- refund handling
- transfer exclusion
- period boundaries
- zero budget
- currency validation

## Integration Tests

- transaction + budget updates
- budget notifications
- budget API
- sync

## E2E

- create budget
- add expense
- observe budget update
- trigger warning
- review budget
- archive budget

---

# 82. Budget Calculation Fixtures

Maintain deterministic fixtures such as:

```text
Budget:
৳10,000

Transactions:
৳1,000
৳2,000
৳500 refund

Expected Spent:
৳2,500

Expected Remaining:
৳7,500
```

These fixtures should be shared across relevant calculation tests.

---

# 83. Budget Acceptance Criteria

The module is complete when:

- Users can create overall/category budgets.
- Budget periods are correct.
- Qualifying expenses are calculated correctly.
- Transfers do not count as spending.
- Refund behavior is defined and tested.
- Remaining balance is accurate.
- Utilization is accurate.
- Forecasts are clearly separated from actual values.
- Alerts trigger only on configured threshold crossings.
- Duplicate alerts are prevented.
- Budget changes preserve historical meaning.
- Offline calculations work.
- Sync works safely.
- AI insights are optional and grounded.
- Accessibility requirements are met.
- Critical behavior is covered by automated tests.

---

# 84. Future Enhancements

Potential future budgeting capabilities:

- Envelope budgeting
- Zero-based budgeting
- Carryover budgets
- Household budgets
- Shared categories
- Flexible budget templates
- Adaptive budget recommendations
- Bank-aware budgets
- Automatic budget generation
- AI budget planning
- Spending limit controls

These are future scope unless explicitly promoted into the product roadmap.

---

# 85. Budgeting Quality Bar

The budgeting module should feel:

```text
Simple to create
Easy to understand
Proactive to use
Reliable under real transactions
Helpful without being judgmental
Powerful without being overwhelming
```

The central user experience should remain:

> **"Tell me how much I planned to spend, how much I have spent, whether I am still on track, and what I should pay attention to."**

---

# 86. Relationship With Other Documents

Product-module documentation sequence:

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

The next document is:

```text
docs/product/LENDING_BORROWING.md
```

It should define the complete lending and borrowing domain, including:

- People
- Money lent
- Money borrowed
- Partial repayment
- Full repayment
- Outstanding balances
- Due dates
- Overdue states
- Reminder schedules
- Email reminders
- Relationship-centric UX
- Financial accounting behavior
- Notifications
- Analytics
- Sync
- Security
- Edge cases
