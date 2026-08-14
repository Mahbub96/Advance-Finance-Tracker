# Personal Finance — Financial Goals Module

**Document:** `FINANCIAL_GOALS.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-13  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Module:** Financial Goals  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL + Prisma  
**Local Database:** SQLite

---

# 1. Purpose

The Financial Goals module helps users define, fund, monitor, forecast, and achieve financial objectives.

The module should turn:

> "I want to save for a laptop."

into:

```text
Goal
↓
Target Amount
↓
Target Date
↓
Current Progress
↓
Required Contribution
↓
Forecast
↓
Risk
↓
Action
```

The module must answer:

> **What am I trying to achieve, how far am I from it, am I on track, and what do I need to do to reach it?**

This is not merely a progress-bar feature. It is a planning and decision-support capability.

---

# 2. Product Philosophy

Goals should feel:

- measurable
- motivating
- practical
- transparent
- calm
- achievable
- honest about uncertainty

The system must clearly distinguish:

```text
Actual contribution
Forecast
Recommendation
```

A forecast is an estimate.

A recommendation is guidance.

Neither should be presented as guaranteed.

---

# 3. Scope

The module includes:

```text
Goal Creation
Goal Editing
Target Amount
Target Date
Goal Progress
Contributions
Contribution History
Required Savings
Goal Forecasting
Goal Risk
What-If Simulation
Milestones
Goal Notifications
Goal Analytics
AI Insights
AI Recommendations
Offline Support
Cloud Sync
Export
Archive / Pause / Complete
```

Future scope may include:

```text
Shared Goals
Household Goals
Automated Savings
Investment-Linked Goals
Bank-Linked Goals
Goal Groups
AI Financial Coaching
```

---

# 4. Goal Examples

Typical goals may include:

```text
Emergency Fund
Laptop
Phone
Travel
Education
Certification
Medical Reserve
Wedding
New Bike
Home Setup
Investment Capital
```

Users must be able to create custom goals.

---

# 5. Goal Data Model

Conceptual fields:

```text
id
user_id
name
description
target_amount
currency
target_date nullable
priority
status
created_at
updated_at
deleted_at
```

Optional future fields:

```text
icon
color_token
goal_type
preferred_contribution_frequency
minimum_contribution
```

---

# 6. Goal Status

Persistent lifecycle states:

```text
ACTIVE
PAUSED
COMPLETED
CANCELLED
ARCHIVED
```

Runtime analytical states:

```text
AHEAD
ON_TRACK
AT_RISK
BEHIND
UNKNOWN
```

Runtime status should preferably be derived from current data rather than treated as immutable source data.

---

# 7. Goal Creation

## Required

- Name
- Target amount
- Currency

## Optional

- Target date
- Initial contribution
- Priority
- Description
- Icon
- Color
- Contribution frequency

The common creation flow should remain short.

---

# 8. Goal Creation Flow

```text
Goals
  ↓
Create Goal
  ↓
Goal Name
  ↓
Target Amount
  ↓
Target Date (optional)
  ↓
Initial Contribution (optional)
  ↓
Review
  ↓
Create
```

Advanced configuration should remain collapsed by default.

---

# 9. Target Amount

Target amount must:

- be greater than zero
- use a valid currency
- remain independent of historical contributions
- be editable

Changing the target must recalculate:

```text
Remaining
Progress
Required Contribution
Forecast
Risk
```

Historical contributions must not change.

---

# 10. Target Date

Target date represents the desired completion date.

The initial product should treat it as a target rather than a guaranteed deadline.

The UI should clearly distinguish:

```text
Target:
December 2026
```

from:

```text
Completed:
December 2026
```

---

# 11. Goals Without a Target Date

A target date is optional.

Example:

```text
Emergency Fund
Target: ৳100,000
No deadline
```

The user can still see:

- progress
- remaining
- contribution history
- average contribution
- estimated completion where sufficient data exists

The system must not invent a deadline.

---

# 12. Current Goal Amount

Current progress must be based on valid contributions:

```text
Current Amount
=
Sum of Valid Goal Contributions
```

If contributions are linked to financial transactions, duplicate accounting must be prevented.

---

# 13. Goal Progress

```text
Progress %
=
Current Amount / Target Amount × 100
```

The UI should show:

```text
৳62,000 / ৳100,000
62%
```

If overfunding occurs, the UI should show the surplus separately.

---

# 14. Remaining Amount

Normal case:

```text
Remaining
=
Target Amount - Current Amount
```

If the goal is overfunded:

```text
Remaining = 0
Surplus = Current Amount - Target Amount
```

---

# 15. Goal Contribution

A contribution represents progress toward the goal.

Required:

```text
goal_id
amount
currency
contributed_at
```

Optional:

```text
account_id
source_transaction_id
note
```

---

# 16. Contribution and Financial Transactions

The system must distinguish:

## Financial Transaction

An actual movement of money.

## Goal Contribution

A goal-progress record.

A contribution may be linked to a financial transaction.

Example:

```text
Account
  ↓
Savings Transaction
  ↓
Goal Contribution
```

The same money must not be counted twice.

---

# 17. Contribution Strategies

Supported concepts:

## Manual Contribution

The user records progress directly.

## Transaction-Linked Contribution

A real financial transaction is linked to the goal contribution.

## Future Automated Contribution

A recurring financial operation may later fund the goal automatically.

Automatic funding is future scope unless explicitly enabled.

---

# 18. Contribution Editing

Editing a contribution must recalculate:

```text
Current Amount
Remaining
Progress
Required Contribution
Forecast
Goal Risk
Analytics
```

The operation should be deterministic and transactional.

---

# 19. Contribution Deletion

Deleting a contribution must be deliberate.

If it references a source transaction:

```text
Delete Contribution
```

must not automatically delete the financial transaction unless the user explicitly chooses a supported linked operation.

---

# 20. Contribution History

The goal detail view should show:

```text
12 Aug   ৳5,000
01 Aug   ৳7,000
15 Jul   ৳4,000
```

Each contribution should be inspectable.

Historical contribution records must remain traceable.

---

# 21. Goal Completion

A goal becomes completed when:

```text
Current Amount >= Target Amount
```

The system should:

- mark it completed
- preserve contributions
- record completion date
- cancel future goal reminders
- show completion clearly

---

# 22. Overfunded Goals

If:

```text
Current Amount > Target Amount
```

example:

```text
Target:
৳100,000

Current:
৳105,000
```

display:

```text
Goal Completed

Surplus:
৳5,000
```

The financial value must not be silently discarded.

---

# 23. Goal Reopening

A completed goal may become active again if the target is deliberately increased.

Example:

```text
Completed:
৳100,000 / ৳100,000

Target changed:
৳120,000

New state:
ACTIVE
```

The transition must be explicit and auditable where appropriate.

---

# 24. Goal Forecasting

The forecasting engine answers:

> **At the current contribution behavior, when will this goal likely be reached?**

Potential inputs:

- current amount
- target amount
- target date
- contribution history
- contribution frequency
- recent contribution rate
- contribution variability

---

# 25. Required Contribution

For a target date:

```text
Remaining Amount
÷
Remaining Contribution Periods
=
Required Periodic Contribution
```

Example:

```text
Remaining:
৳40,000

Months:
4

Required:
৳10,000/month
```

The period unit should match the configured contribution frequency.

---

# 26. Contribution Frequency

Potential frequencies:

```text
Weekly
Biweekly
Monthly
Quarterly
Custom
```

Monthly should be the default for the initial product.

---

# 27. Historical Contribution Rate

A historical rate may be calculated from recent valid contributions.

Example:

```text
Recent Contributions:
৳7,000
৳6,500
৳7,500

Average:
৳7,000/month
```

The model must use a configurable history window.

---

# 28. Contribution Consistency

Average contribution alone can be misleading.

The system should consider whether contributions are:

```text
Regular
Irregular
Declining
Increasing
```

Example:

```text
Average:
৳8,000

But recent contribution:
৳4,000
```

The system should not blindly assume future contributions remain at ৳8,000.

---

# 29. Goal Forecast States

Possible forecast results:

```text
LIKELY_BEFORE_TARGET
LIKELY_ON_TARGET
LIKELY_AFTER_TARGET
INSUFFICIENT_DATA
NO_FORECAST
```

These should be derived from validated assumptions.

---

# 30. Forecast Confidence

Confidence may depend on:

- historical data length
- contribution frequency
- contribution consistency
- time horizon
- data completeness

Suggested qualitative levels:

```text
Limited
Moderate
Strong
```

---

# 31. Goal Risk

Risk should be deterministic.

Inputs may include:

```text
Required Contribution
Observed Contribution
Contribution Trend
Remaining Time
Remaining Amount
Contribution Consistency
```

Possible runtime statuses:

```text
AHEAD
ON_TRACK
AT_RISK
BEHIND
UNKNOWN
```

---

# 32. Goal Risk Example

```text
Target:
৳100,000

Current:
৳60,000

Remaining:
৳40,000

Target:
December 2026

Required:
৳10,000/month

Observed:
৳6,000/month
```

Result:

```text
AT_RISK
```

---

# 33. Goal Ahead

A goal may be considered ahead when:

```text
Observed Contribution Rate
>
Required Contribution Rate
```

Example:

> "You're currently saving faster than required."

---

# 34. Goal Behind

A goal is behind when the observed contribution pattern is insufficient to reach the target date.

Example:

> "At your current pace, you may finish about two months later than your target."

The wording should remain non-judgmental.

---

# 35. Goal Without History

If no contribution history exists:

```text
Current:
৳0

Contribution History:
None
```

The application may calculate:

```text
Required Contribution
```

from the target date but should not claim a historical pace.

---

# 36. Goal Without Target Date

Without a target date, the system may estimate completion if enough contribution history exists.

Example:

```text
Average Contribution:
৳7,000/month

Remaining:
৳35,000

Estimated:
~5 months
```

The word "estimated" is important.

---

# 37. Goal With Past Target Date

If:

```text
target_date < current_date
AND
current_amount < target_amount
```

then:

```text
BEHIND
```

unless the goal is paused or the user changes the target.

---

# 38. Goal Pause

A paused goal should:

- preserve progress
- preserve history
- stop active contribution reminders
- suspend normal risk warnings
- remain available for resumption

The forecast should indicate that the plan is paused.

---

# 39. Goal Cancel

Cancelling a goal means the user no longer intends to pursue it.

The system should:

- stop future reminders
- exclude it from active goal summaries
- preserve historical records
- keep the cancellation state

---

# 40. Goal Archive

Archived goals:

- disappear from active lists
- remain searchable where appropriate
- do not create normal reminders
- preserve history

---

# 41. Goal Milestones

Optional milestones:

```text
25%
50%
75%
100%
```

Milestone notifications must be configurable.

The system should not generate noise for every small progress change.

---

# 42. Goal Notifications

Potential notifications:

```text
Contribution Reminder
Milestone Reached
Target Approaching
Goal At Risk
Goal Completed
```

Users can enable/disable each class.

---

# 43. Contribution Reminder

If a target date exists, the application may suggest:

> "To reach this goal by December, you may need about ৳6,500 per month."

Available actions:

```text
Use Suggestion
Adjust
Remind Me Later
Dismiss
```

A suggestion must not automatically create a financial transaction.

---

# 44. Notification Deduplication

A notification should represent a state transition or meaningful event.

Example:

```text
50% reached
```

should trigger once.

Repeated analytics refreshes must not produce repeated notifications.

---

# 45. Goal Detail UX

Recommended composition:

```text
Laptop

৳62,000
of
৳100,000

62%

৳38,000 remaining

Target:
December 2026

Required:
৳6,333/month

Current Pace:
৳7,000/month

Status:
Ahead

Contribution History

[Add Contribution]
[What If?]
```

---

# 46. Goal List UX

Each card should emphasize:

```text
Name
Progress
Current / Target
Target Date
Risk
```

Example:

```text
Laptop
৳62,000 / ৳100,000
62%
December
Ahead
```

---

# 47. Goal Dashboard Summary

Home may show:

```text
Goals

Laptop
62%

Emergency Fund
80%

1 goal needs attention
```

Home should not show every active goal.

Only high-value or relevant states should surface there.

---

# 48. What-If Planning

Users should be able to explore hypothetical changes without modifying real data.

Examples:

```text
What if I save ৳2,000 more each month?

What if I skip one month?

What if I change the target date?

What if the target increases?
```

---

# 49. What-If Flow

```text
Goal Detail
   ↓
What If?
   ↓
Adjust Variable
   ↓
Calculate Scenario
   ↓
Compare With Current Plan
```

---

# 50. Scenario Variables

Initial:

- contribution amount
- contribution frequency
- target amount
- target date

Future:

- income change
- expense reduction
- recurring commitment changes
- additional one-time contribution

---

# 51. What-If Output

Example:

```text
Current Plan
Completion:
December 2026

Scenario
+৳2,000/month

Projected Completion:
October 2026

Improvement:
2 months earlier
```

Actual financial data must not be changed.

---

# 52. Goal and Budget Relationship

Goals and budgets are complementary.

Example:

```text
Goal:
Save ৳10,000/month

Budget:
Expenses ≤ ৳35,000
```

Analytics may identify that overspending is affecting goal capacity.

The system should explain the relationship without automatically altering either plan.

---

# 53. Goal and Cash Flow

Goal planning can use cash-flow metrics.

Example:

```text
Average income:
৳55,000

Average expenses:
৳47,000

Estimated free cash flow:
৳8,000
```

If the goal requires:

```text
৳15,000/month
```

the system may flag this as a planning risk.

---

# 54. Goal and Recurring Finance

Recurring commitments should be considered when forecasting available savings capacity.

Possible model:

```text
Expected Income
-
Expected Expenses
-
Recurring Commitments
=
Potential Saving Capacity
```

The output is an estimate, not a guarantee.

---

# 55. Goal and Lending / Borrowing

Outstanding obligations may affect goal planning.

Example:

```text
Goal:
৳100,000

Outstanding Borrowing:
৳20,000
```

The goal engine should remain deterministic.

AI may explain the relationship.

---

# 56. Goal Recommendations

Deterministic recommendation candidates:

```text
Increase contribution
Move target date
Reduce target
Add one-time contribution
Pause plan
```

AI can provide natural-language explanation.

---

# 57. AI Goal Insight

Example:

> "You're currently saving about ৳7,000 per month. At this pace, you're likely to reach the goal before your December target."

Underlying data must come from application calculations.

---

# 58. AI Goal Risk Recommendation

Example:

> "Your current contribution pace may leave you about ৳8,000 short by December. Increasing monthly savings by around ৳2,000 could close the gap."

The application should clearly label such output as a recommendation.

---

# 59. AI Goal Guardrails

AI must not:

- change the target amount automatically
- change target date automatically
- create contributions
- create transfers
- edit transaction history
- pause or cancel goals automatically

AI recommends; the user decides.

---

# 60. Goal Data Quality

Forecasting should account for:

- missing history
- irregular contributions
- deleted contributions
- future-dated contributions
- duplicate synced contributions
- stale data
- paused state

A forecast should degrade gracefully when data is insufficient.

---

# 61. Forecast Staleness

Forecasts should be recalculated after material changes:

- contribution created
- contribution edited
- contribution deleted
- target changed
- target date changed
- relevant planning assumptions change

Cached forecasts should contain:

```text
model_version
input_snapshot_hash
generated_at
```

---

# 62. Offline Goal Support

The following should work offline:

- create goal
- edit goal
- add contribution
- view progress
- view history
- calculate basic required contribution
- calculate basic local forecast where sufficient data exists
- view goal status

---

# 63. Goal Sync

Goals synchronize as versioned resources.

Contributions synchronize as independent operations.

This ensures:

```text
Goal Update
≠
Contribution Event
```

and prevents duplicate contributions from corrupting progress.

---

# 64. Contribution Idempotency

Every synchronized contribution should have a stable operation ID.

Repeated sync attempts must not duplicate it.

---

# 65. Goal Conflict

Example:

```text
Device A:
Target = ৳100,000

Device B:
Target = ৳120,000
```

Both edits are based on the same version.

The server should return a conflict rather than blindly overwrite.

---

# 66. Contribution Concurrency

Independent contributions from different devices should normally both be preserved.

Example:

```text
Device A → ৳3,000
Device B → ৳5,000
```

Expected total:

```text
৳8,000
```

assuming both operations are valid and unique.

---

# 67. Goal Notification Sync

When cloud synchronization is active, logical reminders should be deduplicated across devices.

The user should not receive the same goal reminder once per device.

---

# 68. Local Notifications

Predictable goal reminders may be scheduled locally:

- periodic contribution reminder
- milestone reminder

Cloud-enabled multi-device setups require centralized reminder coordination to prevent duplicates.

---

# 69. Goal API

Relevant endpoints:

```text
GET    /api/v1/goals
POST   /api/v1/goals
GET    /api/v1/goals/:id
PATCH  /api/v1/goals/:id
POST   /api/v1/goals/:id/archive
POST   /api/v1/goals/:id/restore

GET    /api/v1/goals/:id/contributions
POST   /api/v1/goals/:id/contributions
PATCH  /api/v1/goals/:id/contributions/:contributionId
DELETE /api/v1/goals/:id/contributions/:contributionId

GET    /api/v1/goals/:id/forecast
POST   /api/v1/analytics/simulations
```

Exact endpoint behavior is defined by `API.md`.

---

# 70. Goal Database Integration

Primary entities:

```text
FinancialGoal
GoalContribution
Transaction
Account
Notification
SyncOperation
```

The exact schema is defined in `DATABASE.md`.

---

# 71. Goal Security

Every operation must validate:

- user ownership
- goal ownership
- contribution ownership
- linked transaction ownership
- sync authorization

Client-provided IDs must never be treated as proof of ownership.

---

# 72. Goal Privacy

Goal names may reveal sensitive information:

```text
Medical Reserve
Wedding
Emergency Fund
```

Therefore:

- protect local data
- protect notifications
- avoid unnecessary analytics logging
- protect cloud APIs
- minimize AI transmission

---

# 73. Goal Export

Export should include:

```text
Goal Name
Target Amount
Currency
Target Date
Status
Current Amount
Progress
Contributions
Completion Date
```

Derived forecast information should be clearly labeled as derived.

---

# 74. Goal Import

Imported goals should be validated for:

- target amount
- currency
- dates
- duplicate IDs
- contribution references

Import must not silently overwrite active goals.

---

# 75. Goal Search and Filters

Support:

```text
Status
Risk
Target Date
Priority
Completion
```

Sorting options:

```text
Target Date
Progress
Remaining
Priority
Recently Updated
```

---

# 76. Goal Analytics

Aggregate analytics may include:

- active goals
- completed goals
- average progress
- total remaining
- goals at risk
- goals ahead
- contribution trend
- completion rate

Aggregate figures should be deterministic.

---

# 77. Goal Financial Health Integration

Goal progress may contribute to a financial health assessment.

Potential factors:

```text
Goal Progress
Goal Consistency
Goal Risk
Goal Completion
```

The health score must remain explainable.

---

# 78. Goal Event Model

Potential internal events:

```text
GoalCreated
GoalUpdated
GoalPaused
GoalResumed
GoalCompleted
GoalCancelled

GoalMilestoneReached
GoalAtRisk
GoalTargetApproaching

ContributionCreated
ContributionUpdated
ContributionDeleted
```

These events may trigger:

- notifications
- analytics refresh
- AI insight candidates

---

# 79. Event Deduplication

Events must be designed so worker retries do not produce repeated milestones or notifications.

A goal milestone should have a stable event identity.

---

# 80. Goal Calculation Reconciliation

The system should be able to reconstruct:

```text
Current Amount
Progress
Remaining
```

from source contributions.

If a cached summary exists, it must be reconcilable against source records.

---

# 81. Goal Edge Cases

The system must handle:

- zero target amount
- target date in the past
- no target date
- target already reached
- target increased after completion
- contribution greater than remaining
- contribution edited
- contribution deleted
- currency mismatch
- paused goal
- archived goal
- cancelled goal
- offline contribution
- duplicate sync contribution
- device conflict
- timezone changes
- leap-year target dates
- large targets
- irregular contribution frequency

---

# 82. Zero Target

Target amount must be greater than zero.

```text
target_amount > 0
```

---

# 83. Past Target Date

If the date has passed and the goal is incomplete:

```text
BEHIND
```

unless the goal is paused or the user changes the plan.

---

# 84. Target Already Reached at Creation

If:

```text
initial contribution >= target amount
```

the goal may be created directly as:

```text
COMPLETED
```

while preserving the initial contribution.

---

# 85. Contribution Larger Than Remaining

Allowing overfunding may be preferable to blocking a legitimate contribution.

Example:

```text
Remaining:
৳2,000

Contribution:
৳3,000

New state:
Completed
Surplus:
৳1,000
```

The exact policy should be consistent across UI and domain logic.

---

# 86. Currency Mismatch

If a contribution uses a different currency than the goal:

```text
Reject by default
```

unless multi-currency conversion is implemented.

Never silently convert.

---

# 87. Goal Accessibility

The UI must communicate using:

- text
- labels
- icons
- progress semantics

Do not depend on color alone for:

```text
Ahead
On Track
At Risk
Behind
Completed
```

---

# 88. Goal UI Quality Bar

The user should instantly understand:

```text
What is the goal?
How much is saved?
How much is left?
When do I want it?
Am I on track?
What do I need to do?
```

The screen should remain simple even though the planning engine is sophisticated.

---

# 89. Acceptance Criteria

The module is complete when:

- Users can create goals.
- Users can set target amounts.
- Target dates are optional.
- Contributions can be added and edited.
- Contribution history is preserved.
- Progress is deterministic.
- Remaining amount is correct.
- Required contribution is calculated.
- Forecasts distinguish actual from predicted values.
- Risk status is explainable.
- What-if simulations do not mutate actual data.
- Completed goals remain historically accessible.
- Goals work offline.
- Sync handles duplicate contributions safely.
- Notifications are configurable and deduplicated.
- AI recommendations are grounded in trusted calculations.
- Currency rules are enforced.
- Security and ownership checks are enforced.
- Critical flows have automated tests.

---

# 90. Testing Matrix

## Unit Tests

Test:

- progress
- remaining
- completion
- required contribution
- forecast
- risk
- overfunding
- target changes
- date changes
- paused state

## Integration Tests

Test:

- contribution creation
- linked transaction behavior
- goal notifications
- sync
- export/import
- reconciliation

## E2E Tests

```text
Create Goal
→ Add Contribution
→ View Progress
→ Change Target
→ Review Forecast
→ Run What-If
→ Complete Goal
→ View History
```

---

# 91. Deterministic Goal Fixtures

Example:

```text
Target:
৳100,000

Contributions:
৳20,000
৳15,000
৳25,000

Current:
৳60,000

Remaining:
৳40,000

Progress:
60%
```

These fixtures should be reusable across mobile/backend calculation tests where practical.

---

# 92. Product Metrics

Non-sensitive product metrics may include:

- goal creation rate
- contribution engagement
- goal completion rate
- reminder interaction
- forecast usage
- what-if usage
- goal retention

Avoid sending detailed financial amounts to generic analytics unless there is a clear product requirement.

---

# 93. Future Enhancements

Potential future capabilities:

```text
Shared Goals
Goal Groups
Household Planning
Automated Transfers
Investment-Linked Goals
Bank-Linked Goals
Advanced Scenario Models
AI Financial Coaching
Emergency Fund Recommendations
Smart Allocation
```

Each must be evaluated against product scope, privacy, security, and UX requirements before implementation.

---

# 94. Goal Quality Bar

The module should feel:

```text
Simple to create
Easy to understand
Easy to maintain
Honest about predictions
Useful for planning
Motivating without being gamified
Powerful without being overwhelming
```

The central user experience should be:

> **Turn a financial intention into a measurable plan, continuously compare the plan with reality, and make the next useful action obvious.**

---

# 95. Relationship With Other Documents

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

The Financial Goals module depends primarily on:

```text
Accounts
Transactions
Budgets
Analytics
Forecasting
Notifications
Sync
```

The next document is:

```text
docs/product/REPORTING.md
```

It should define:

- Monthly summaries
- Income reports
- Expense reports
- Category reports
- Cash-flow reports
- Budget reports
- Lending / borrowing reports
- Goal reports
- Recurring expense reports
- Filters and date ranges
- Charts
- Export
- PDF generation
- Offline reporting
- Performance
- AI-assisted summaries
- Acceptance criteria
