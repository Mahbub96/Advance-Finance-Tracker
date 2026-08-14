# Personal Finance — Information Architecture

**Document:** `INFORMATION_ARCHITECTURE.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Navigation:** Expo Router  
**Primary UX Principle:** High-frequency actions must have the lowest friction

---

# 1. Purpose

This document defines the information architecture of the Personal Finance application.

It establishes:

- Primary navigation
- Bottom navigation
- Screen hierarchy
- Feature grouping
- Navigation relationships
- Screen ownership
- Primary and secondary actions
- Deep-linking strategy
- Modal and bottom-sheet usage
- Search and filtering entry points
- Progressive disclosure
- Navigation rules

This document translates the UX research into a concrete product structure.

It does not define detailed visual styling. Visual composition belongs in `UI_DESIGN.md`.

It does not define individual task workflows in detail. Those belong in `USER_FLOWS.md`.

---

# 2. IA Principles

The information architecture must follow these principles:

1. High-frequency actions must be immediately accessible.
2. The user should not need to understand the internal data model.
3. Related financial concepts should be grouped together.
4. Advanced features should be discoverable without overwhelming the default experience.
5. Creation flows should be shorter than management flows.
6. Navigation should remain predictable.
7. A user should always understand where they are.
8. Destructive actions must not be hidden behind ambiguous navigation.
9. Search should provide a global escape hatch for known information.
10. Every major screen should have a clear primary action.

---

# 3. Primary Navigation Model

The preferred primary navigation is a five-destination mobile structure:

```text
┌─────────────────────────────────────────┐
│                                         │
│               SCREEN                    │
│                                         │
├─────────────────────────────────────────┤
│ Home │ Transactions │  +  │ Analytics │ More │
└─────────────────────────────────────────┘
```

## Primary Destinations

1. Home
2. Transactions
3. Add
4. Analytics
5. More

The central `+` is an action entry point rather than a normal content destination.

---

# 4. Why Five Destinations

Five destinations provide a balance between discoverability and navigation simplicity.

The structure separates:

- Current financial state → Home
- Financial records → Transactions
- Creation → Add
- Understanding → Analytics
- Configuration and advanced modules → More

This avoids placing every feature into the bottom navigation.

---

# 5. Home

## Route

```text
/
```

## Purpose

Home is the user's financial overview and primary daily starting point.

## Responsibilities

- Current financial summary
- Monthly financial summary
- Budget status
- Upcoming obligations
- Recent transactions
- Important insights
- Quick actions

## Primary Action

```text
Add Transaction
```

---

# 6. Home Screen Hierarchy

```text
Home
│
├── Financial Summary
│   ├── Total Balance
│   ├── Income
│   ├── Expense
│   ├── Savings
│   └── Net Cash Flow
│
├── Quick Actions
│   ├── Expense
│   ├── Income
│   ├── Transfer
│   ├── Lend
│   ├── Borrow
│   └── Repayment
│
├── Budget Snapshot
│
├── Upcoming
│   ├── Bills
│   ├── Recurring Transactions
│   └── Repayments
│
├── Recent Transactions
│
└── Intelligence
    ├── Insights
    ├── Warnings
    └── Recommendations
```

The exact visual order should be validated through UI composition work.

---

# 7. Transactions

## Route

```text
/transactions
```

## Purpose

Provide the complete transaction history and transaction management interface.

## Responsibilities

- Transaction list
- Search
- Filters
- Sorting
- Transaction details
- Editing
- Deletion/reversal
- Grouping by date
- Quick duplication

---

# 8. Transaction Hierarchy

```text
Transactions
│
├── All
├── Income
├── Expense
├── Transfer
├── Refund
└── Adjustments
```

The primary transaction list should default to a useful combined view rather than forcing the user to select a type.

---

# 9. Transaction Details

## Route

```text
/transactions/:transactionId
```

## Responsibilities

- Full transaction information
- Account
- Category
- Amount
- Date/time
- Merchant
- Tags
- Notes
- Attachments
- Related records
- Edit
- Duplicate
- Delete/reverse

---

# 10. Add Action

The central `+` action opens a creation surface.

The preferred design is a compact bottom sheet or action composer.

## Actions

```text
Add
├── Expense
├── Income
├── Transfer
├── Lend
├── Borrow
└── Repayment
```

The most frequently used actions should appear first.

Recommended default order:

```text
Expense
Income
Transfer
──────────
Lend
Borrow
Repayment
```

---

# 11. Add Expense

## Route

Conceptually:

```text
/transactions/new?type=expense
```

It should normally be rendered as a composer/bottom sheet rather than requiring a complete navigation stack.

## Primary fields

- Amount
- Category
- Account

## Optional fields

- Merchant
- Note
- Tags
- Date/time
- Attachment
- Location
- Recurrence

---

# 12. Add Income

## Route

```text
/transactions/new?type=income
```

Primary fields:

- Amount
- Category/source
- Account

Optional:

- Note
- Tags
- Date/time
- Attachment
- Recurrence

---

# 13. Add Transfer

## Route

```text
/transactions/new?type=transfer
```

Primary fields:

- From account
- To account
- Amount

Optional:

- Note
- Date/time

---

# 14. Add Lending

## Route

```text
/lending/new
```

Primary fields:

- Person
- Amount
- Expected repayment date

Optional:

- Note
- Reminder schedule
- Attachment

---

# 15. Add Borrowing

## Route

```text
/borrowing/new
```

Primary fields:

- Person/creditor
- Amount
- Expected repayment date

Optional:

- Note
- Reminder schedule
- Attachment

---

# 16. Record Repayment

Repayment should generally be launched from the related lending/borrowing record.

Example:

```text
Lending Detail
      ↓
Record Repayment
```

This reduces ambiguity and automatically links the repayment to the correct obligation.

---

# 17. Analytics

## Route

```text
/analytics
```

## Purpose

Provide insight into financial behavior.

## Primary sections

```text
Analytics
│
├── Overview
├── Spending
├── Income
├── Cash Flow
├── Budgets
├── Goals
├── Lending
├── Borrowing
├── Trends
├── Forecasts
├── Financial Health
└── What-If
```

The default analytics screen should start with a meaningful summary, not a wall of charts.

---

# 18. Analytics Overview

## Route

```text
/analytics
```

Responsibilities:

- Key metrics
- Main trends
- Important comparisons
- Top categories
- Current financial health
- High-priority insights

---

# 19. Spending Analytics

## Route

```text
/analytics/spending
```

Includes:

- Spending by category
- Spending by merchant
- Daily spending
- Monthly spending
- Category trends
- Spending velocity
- Historical comparison

---

# 20. Income Analytics

## Route

```text
/analytics/income
```

Includes:

- Total income
- Income sources
- Income trends
- Period comparison
- Income consistency

---

# 21. Cash-Flow Analytics

## Route

```text
/analytics/cash-flow
```

Includes:

- Income
- Expenses
- Net cash flow
- Historical trend
- Projected cash flow

---

# 22. Forecasts

## Route

```text
/analytics/forecasting
```

Includes:

- Monthly expense forecast
- Category forecast
- Budget exhaustion estimate
- Cash-flow projection
- Goal completion projection

Forecast values must be clearly distinguishable from actual values.

---

# 23. Financial Health

## Route

```text
/analytics/health
```

Includes:

- Overall score
- Positive contributors
- Negative contributors
- Historical score
- Recommended actions

The score should be explainable.

---

# 24. What-If Simulation

## Route

```text
/analytics/simulator
```

The simulator must not modify actual financial records.

It works with temporary scenario inputs and calculated outputs.

---

# 25. More

## Route

```text
/more
```

The More section contains lower-frequency and management-oriented functionality.

Recommended structure:

```text
More
│
├── Accounts
├── Budgets
├── Goals
├── Lending
├── Borrowing
├── Bills & Subscriptions
├── Recurring Transactions
├── Reports
├── Files & Receipts
├── Import / Export
├── Backup / Restore
├── Sync
├── Notifications
├── AI
├── Settings
└── About
```

---

# 26. Why More Exists

The application contains many advanced modules.

Putting them all into primary navigation would create excessive cognitive load.

`More` acts as the management layer for lower-frequency functionality.

Frequently used items may later be promoted based on real usage data.

---

# 27. Accounts

## Route

```text
/accounts
```

## Hierarchy

```text
Accounts
├── All Accounts
├── Cash
├── Bank
├── Mobile Wallet
├── Savings
├── Credit Card
└── Other
```

---

# 28. Account Details

## Route

```text
/accounts/:accountId
```

Includes:

- Current balance
- Account information
- Recent transactions
- Transaction search/filter
- Account analytics
- Transfer action
- Edit
- Archive

---

# 29. Budgets

## Route

```text
/budgets
```

## Hierarchy

```text
Budgets
├── Overview
├── Active Budgets
├── Completed Periods
└── Budget History
```

---

# 30. Budget Detail

## Route

```text
/budgets/:budgetId
```

Includes:

- Budget amount
- Spent
- Remaining
- Utilization
- Daily spending pace
- Forecast
- Related transactions
- Edit budget

---

# 31. Goals

## Route

```text
/goals
```

## Hierarchy

```text
Goals
├── Active
├── Completed
└── Archived
```

---

# 32. Goal Detail

## Route

```text
/goals/:goalId
```

Includes:

- Target
- Current progress
- Target date
- Required contribution
- Contribution history
- Forecast
- What-if scenarios
- Add contribution

---

# 33. Lending

## Route

```text
/lending
```

## Hierarchy

```text
Lending
├── Active
├── Overdue
├── Partially Repaid
└── Completed
```

The default presentation should emphasize people and outstanding balances.

---

# 34. Lending Detail

## Route

```text
/lending/:lendingId
```

Includes:

- Person
- Original amount
- Repaid
- Outstanding
- Expected repayment date
- Reminder status
- Repayment history
- Add repayment
- Edit
- Archive/complete

---

# 35. Borrowing

## Route

```text
/borrowing
```

## Hierarchy

```text
Borrowing
├── Active
├── Due Soon
├── Overdue
└── Completed
```

---

# 36. Borrowing Detail

## Route

```text
/borrowing/:borrowingId
```

Includes:

- Creditor
- Original amount
- Repaid
- Outstanding
- Expected repayment date
- Reminder status
- Repayment history
- Add repayment
- Edit
- Complete

---

# 37. Bills & Subscriptions

## Route

```text
/recurring
```

The recurring finance area groups predictable financial commitments.

```text
Recurring
├── Upcoming
├── Bills
├── Subscriptions
├── Recurring Income
├── Recurring Expenses
└── Rules
```

---

# 38. Bill Detail

## Route

```text
/recurring/bills/:billId
```

Includes:

- Bill name
- Amount
- Due date
- Frequency
- Account
- Reminder
- History

---

# 39. Subscription Detail

## Route

```text
/recurring/subscriptions/:subscriptionId
```

Includes:

- Subscription name
- Amount
- Billing frequency
- Next billing date
- Account
- Historical charges

---

# 40. Reports

## Route

```text
/reports
```

Reports should be grouped by purpose.

```text
Reports
├── Monthly Summary
├── Income
├── Expense
├── Categories
├── Cash Flow
├── Budgets
├── Goals
├── Lending
├── Borrowing
└── Recurring Spending
```

Report generation should not require navigating through multiple unrelated settings.

---

# 41. Files & Receipts

## Route

```text
/files
```

The module provides:

- Receipt library
- Attached files
- Search
- Filter
- Preview
- Association with financial records

The transaction detail screen should remain the primary context for opening attachments.

---

# 42. Import & Export

## Route

```text
/data
```

Structure:

```text
Data
├── Import
├── Export
├── Backup
└── Restore
```

Destructive restore operations should require explicit confirmation.

---

# 43. Synchronization

## Route

```text
/settings/sync
```

Includes:

- Sync status
- Last successful sync
- Pending changes
- Failed changes
- Conflict resolution
- Device management

Synchronization should remain low prominence during normal use.

---

# 44. Notifications

## Route

```text
/settings/notifications
```

The screen should group notifications by purpose:

```text
Budget
Bills
Goals
Repayments
Recurring
AI
System
```

---

# 45. AI

## Route

```text
/ai
```

Potential structure:

```text
AI
├── Insights
├── Recommendations
├── Ask
├── Financial Assistant
└── AI Settings
```

AI should be accessible without making it the primary application navigation.

---

# 46. AI Insight Detail

## Route

```text
/ai/insights/:insightId
```

Includes:

- Insight
- Supporting metrics
- Explanation
- Suggested action
- Relevant financial records
- Dismiss
- Feedback

---

# 47. AI Assistant

## Route

```text
/ai/assistant
```

The assistant should support natural-language questions.

Important architecture rule:

The assistant should query the application's trusted data and calculation layers rather than attempting to infer financial facts from model memory.

---

# 48. Settings

## Route

```text
/settings
```

Recommended structure:

```text
Settings
│
├── General
├── Appearance
├── Finance
├── Notifications
├── Privacy
├── Security
├── AI
├── Data
├── Sync
├── Language
└── About
```

---

# 49. Global Search

Search should be accessible from major information-heavy areas.

Potential entry points:

- Transactions
- More
- Dashboard
- Dedicated global search button

## Route

```text
/search
```

Search domains:

```text
Transactions
Accounts
Categories
People
Goals
Bills
Subscriptions
Notes
Tags
```

---

# 50. Filtering Architecture

Filters should appear contextually.

For example:

```text
Transactions
    ↓
Filter
    ├── Date
    ├── Account
    ├── Category
    ├── Type
    ├── Amount
    └── Tags
```

Avoid placing every filter permanently on screen.

Advanced filters can appear in a bottom sheet.

---

# 51. Modal vs Screen Rules

Use a modal/bottom sheet for:

- Short creation flows
- Quick filters
- Quick actions
- Small selections
- Confirmations
- Contextual actions

Use a full screen for:

- Complex forms
- Analytics
- Reports
- Long lists
- Settings
- Detailed management
- Multi-step tasks

---

# 52. Transaction Creation Rule

Transaction creation should prefer a bottom-sheet/composer pattern unless the flow becomes too complex.

This keeps the user close to the current context.

Example:

```text
Transactions
     ↓
    [+]
     ↓
Quick Composer
     ↓
Save
     ↓
Return to Transactions
```

---

# 53. Deep Linking

The application should support route-level deep linking for meaningful resources.

Examples:

```text
personalfinance://transaction/{id}
personalfinance://account/{id}
personalfinance://budget/{id}
personalfinance://goal/{id}
personalfinance://lending/{id}
personalfinance://borrowing/{id}
personalfinance://report/{id}
personalfinance://ai/insight/{id}
```

Notifications should deep-link to the relevant entity.

---

# 54. Notification Navigation

Examples:

```text
Budget warning
   ↓
Budget Detail

Repayment due
   ↓
Lending/Borrowing Detail

Goal milestone
   ↓
Goal Detail

AI insight
   ↓
Insight Detail
```

A notification should not simply open the application home screen when a more specific destination exists.

---

# 55. Back Navigation

Android back navigation must be predictable.

Rules:

1. Close transient overlays first.
2. Return to the previous screen.
3. Preserve appropriate list/filter state.
4. Avoid unexpectedly resetting navigation.
5. Do not lose unsaved form input.

---

# 56. Unsaved Changes

If a user is editing a form and navigates away, the application should handle unsaved data intentionally.

Possible approaches:

- Preserve draft
- Warn before leaving
- Auto-save draft

For short transaction forms, preserving the draft may be preferable.

---

# 57. Navigation State

Navigation state should preserve relevant context.

Example:

```text
Transactions
Filter: Food
Date: This Month
       ↓
Open Transaction
       ↓
Back
       ↓
Return to filtered transaction list
```

The user should not be forced to reconstruct their previous context.

---

# 58. Feature Discoverability

Advanced functionality should be discoverable through:

- Contextual cards
- Empty states
- Search
- More section
- Analytics entry points
- AI suggestion surfaces

Avoid intrusive onboarding tours for every feature.

---

# 59. Progressive Disclosure by Navigation Level

## Level 1 — Everyday

```text
Home
Transactions
Add
```

## Level 2 — Understanding

```text
Analytics
Budgets
Goals
Reports
```

## Level 3 — Management

```text
Accounts
Lending
Borrowing
Recurring
Data
```

## Level 4 — Intelligence

```text
Forecasting
Financial Health
AI
What-If
```

The user can reach every feature, but not every feature needs to compete for primary navigation space.

---

# 60. Information Ownership

Each feature should have a clear primary destination.

| Domain       | Primary Area     |
| ------------ | ---------------- |
| Transactions | Transactions     |
| Accounts     | More → Accounts  |
| Budgets      | More → Budgets   |
| Goals        | More → Goals     |
| Lending      | More → Lending   |
| Borrowing    | More → Borrowing |
| Recurring    | More → Recurring |
| Reports      | More → Reports   |
| Analytics    | Analytics        |
| AI           | More → AI        |
| Settings     | More → Settings  |

The same feature may be surfaced contextually elsewhere without creating duplicate ownership.

Example:

A budget warning may appear on Home but the authoritative management screen remains Budget Detail.

---

# 61. Contextual Actions

Actions should be surfaced where users need them.

Examples:

```text
Account Detail
→ Transfer

Budget Detail
→ Adjust Budget

Goal Detail
→ Add Contribution

Lending Detail
→ Record Repayment

Transaction Detail
→ Duplicate
```

This reduces navigation effort.

---

# 62. Global Add Philosophy

The global add action should be available from major screens but must not interrupt ongoing workflows.

The central Add action is primarily for:

- Expense
- Income
- Transfer

Less frequent actions remain available from the same composer but with lower visual priority.

---

# 63. Search vs Navigation

Use navigation when the user knows the destination.

Use search when the user knows the information.

Examples:

```text
"Go to my budgets"
→ Navigation

"Find the ৳4,500 transaction from Rahim"
→ Search
```

---

# 64. Reporting vs Analytics

The information architecture distinguishes:

## Analytics

Interactive exploration:

- Trends
- Charts
- Comparisons
- Forecasts
- Health

## Reports

Structured summaries:

- Monthly reports
- Category reports
- Exportable reports

This prevents the two concepts from becoming indistinguishable.

---

# 65. Home vs Analytics

Home answers:

> "What do I need to know right now?"

Analytics answers:

> "What can I learn from my financial data?"

This distinction should remain consistent throughout the product.

---

# 66. More vs Settings

`More` contains product functionality.

`Settings` contains application configuration.

For example:

```text
More
→ Budgets
→ Goals
→ Lending

Settings
→ Notification Preferences
→ Privacy
→ Currency
→ AI Configuration
```

---

# 67. Proposed Expo Router Structure

The application should use route groups to separate navigation concerns.

Conceptual structure:

```text
app/
├── _layout.tsx
│
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── transactions.tsx
│   ├── add.tsx
│   ├── analytics.tsx
│   └── more.tsx
│
├── transactions/
│   ├── [id].tsx
│   └── new.tsx
│
├── accounts/
│   ├── index.tsx
│   └── [id].tsx
│
├── budgets/
│   ├── index.tsx
│   ├── new.tsx
│   └── [id].tsx
│
├── goals/
│   ├── index.tsx
│   ├── new.tsx
│   └── [id].tsx
│
├── lending/
│   ├── index.tsx
│   ├── new.tsx
│   └── [id].tsx
│
├── borrowing/
│   ├── index.tsx
│   ├── new.tsx
│   └── [id].tsx
│
├── recurring/
│   ├── index.tsx
│   ├── bills/
│   └── subscriptions/
│
├── reports/
│   ├── index.tsx
│   └── [id].tsx
│
├── ai/
│   ├── index.tsx
│   ├── insights/
│   └── assistant.tsx
│
├── search.tsx
│
└── settings/
    ├── index.tsx
    ├── appearance.tsx
    ├── notifications.tsx
    ├── privacy.tsx
    ├── security.tsx
    ├── ai.tsx
    ├── data.tsx
    └── sync.tsx
```

This is the intended route architecture, not a requirement to create every screen before its feature exists.

---

# 68. Screen Naming Convention

Route names should represent user-facing concepts.

Prefer:

```text
transactions
accounts
budgets
goals
lending
borrowing
reports
analytics
```

Avoid database-oriented route names.

Bad:

```text
ledgerEntries
financialEntities
accountRecords
```

Good:

```text
transactions
accounts
```

---

# 69. Navigation Performance

Navigation should remain responsive even with large datasets.

Requirements:

- Avoid loading entire transaction history into a screen.
- Use pagination or virtualization where appropriate.
- Defer expensive analytics.
- Avoid blocking navigation with AI calls.
- Preserve screen state during navigation where practical.

---

# 70. Accessibility in Navigation

The navigation system must expose:

- Meaningful accessibility labels
- Current selected destination
- Clear Add action semantics
- Accessible modal dismissal
- Logical focus order

The central Add action must not become inaccessible because it is visually different.

---

# 71. Navigation Error Handling

If a deep link points to missing or deleted data:

```text
Requested item unavailable

The record may have been deleted or is no longer accessible.
```

Provide a path back to a valid application location.

---

# 72. IA Decision Rules

When introducing a new feature, ask:

1. Is it used frequently?
2. Does it need a dedicated destination?
3. Is it part of an existing financial domain?
4. Can it be accessed contextually?
5. Does it belong under More?
6. Does it need a global entry point?
7. Does it require deep linking?
8. Does it require independent search?
9. Does it introduce a new navigation concept?

Do not create a new tab merely because a new feature exists.

---

# 73. IA Anti-Patterns

Avoid:

- More than necessary primary destinations
- Duplicate ownership of the same feature
- Nested navigation without purpose
- Long modal chains
- Hidden primary actions
- Database-oriented navigation
- Feature dumping under More
- Inconsistent back behavior
- Navigation reset after every action
- Screens containing unrelated domains

---

# 74. Navigation Decision Summary

The current recommended structure is:

```text
                    APPLICATION
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
    Everyday         Understanding     Management
       │                 │                 │
       ▼                 ▼                 ▼
     Home            Analytics            More
       │                                     │
Transactions                                ├── Accounts
       │                                     ├── Budgets
       └── Add                               ├── Goals
                                             ├── Lending
                                             ├── Borrowing
                                             ├── Recurring
                                             ├── Reports
                                             ├── AI
                                             └── Settings
```

Primary navigation:

```text
[Home] [Transactions] [+] [Analytics] [More]
```

---

# 75. Information Architecture Quality Bar

The IA is considered successful when:

- A new user can understand the main navigation immediately.
- Common financial actions require minimal navigation.
- Advanced features remain discoverable.
- Related features are grouped logically.
- No feature has ambiguous ownership.
- Back navigation is predictable.
- Notifications open the correct destination.
- Search can locate known information.
- The architecture can support future features without adding excessive primary navigation.
- The structure works naturally with Expo Router.
- Android navigation behavior remains predictable.
- Future iOS navigation remains feasible.

---

# 76. Next Documentation

This document defines **where functionality lives**.

The next UX document should define **how users accomplish important tasks**:

```text
docs/ux/USER_FLOWS.md
```

It should document complete user journeys such as:

```text
Add Expense
Add Income
Transfer Money
Create Budget
Record Lending
Record Borrowing
Record Repayment
Create Goal
Add Recurring Bill
Review Monthly Analytics
Review Forecast
Respond to Budget Warning
Use AI Insight
Ask AI Assistant
Export Data
Restore Backup
Handle Offline Changes
Resolve Sync Conflict
```

The user flows must preserve the central architecture principle:

> **Navigation should get the user to the right place; the interaction inside that place should be as short and clear as possible.**
