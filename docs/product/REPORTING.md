# Personal Finance — Reporting Module

**Document:** `REPORTING.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-14  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Module:** Reporting  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL + Prisma  
**Local Database:** SQLite

---

# 1. Purpose

The Reporting module converts financial records into structured, understandable summaries that help users review their finances and make decisions.

Reports must answer practical questions such as:

- How did I do this month?
- How much did I earn?
- How much did I spend?
- Where did my money go?
- How much did I save?
- Did I stay within budget?
- Who owes me money?
- Whom do I owe?
- How are my goals progressing?
- What changed compared with previous periods?

The module must prioritize **accuracy, explainability, and drill-down to source data**.

A report is not merely a chart.

It is:

```text
Source Financial Data
        ↓
Validated Calculations
        ↓
Structured Report
        ↓
Visual Summary
        ↓
Optional Explanation
        ↓
Action
```

---

# 2. Reporting Philosophy

Reports should be:

- accurate
- explainable
- comparable
- actionable
- readable
- filterable
- exportable
- performant
- privacy-conscious

The report layer must never invent financial facts.

---

# 3. Reporting vs Analytics

## Analytics

Analytics is interactive exploration:

```text
Why did spending increase?
What category changed?
What is my spending trend?
What may happen next?
```

## Reporting

Reporting is structured review:

```text
How did August perform?
What were my total expenses?
How did my budget perform?
What was my monthly cash flow?
```

A report may contain analytics-derived values, but its UX intent remains structured review.

---

# 4. Report Inventory

The initial reporting system includes:

```text
Monthly Financial Summary
Income Report
Expense Report
Category Spending Report
Cash-Flow Report
Budget Performance Report
Lending Report
Borrowing Report
Goal Report
Recurring Expense Report
Account Report
Transaction Activity Report
```

Future reports may include:

```text
Net Worth Report
Investment Report
Tax Summary
Shared Household Report
Subscription Optimization Report
```

---

# 5. Report Periods

Reports should support:

```text
Today
Yesterday
This Week
Last Week
This Month
Last Month
This Year
Last Year
Custom Range
```

Additional comparisons may include:

```text
Previous Period
Previous Month
Previous Year
Custom Comparison
```

---

# 6. Date Handling

Reports must distinguish between:

```text
Transaction Date
Created At
Updated At
```

Financial reporting must use the transaction's financial date unless a specific report says otherwise.

Calendar boundaries use the user's configured timezone.

---

# 7. Timezone Rules

A monthly report must be calculated using the user's intended local calendar.

Example:

```text
Bangladesh timezone:
August 1 00:00
→
August 31 23:59:59
```

Server UTC storage must not cause transactions to appear in the wrong reporting period.

---

# 8. Report Currency

For single-currency mode, reports use the user's base currency.

Future multi-currency reports must distinguish:

```text
Original Amount
Original Currency
Converted Amount
Report Currency
Exchange Rate
```

Original financial values must remain preserved.

---

# 9. Standard Report Structure

Every major report should follow:

```text
Header
↓
Period
↓
Headline Metrics
↓
Main Visualization
↓
Breakdown
↓
Comparison
↓
Insights / Explanation
↓
Source Drill-Down
↓
Export
```

Not every report requires every section.

---

# 10. Report Header

A report header should show:

- Report name
- Period
- Optional comparison
- Filter state
- Export/share action

Example:

```text
August 2026
Monthly Summary

[Compared with July]
```

---

# 11. Headline Metrics

Use a small number of high-value metrics.

Example:

```text
Income       Expense       Saved
৳55,000      ৳31,200      ৳23,800
```

Avoid placing ten equally weighted KPI cards at the top.

---

# 12. Monthly Financial Summary

This is the primary report.

It should contain:

```text
Income
Expenses
Net Cash Flow
Savings
Savings Rate
Budget Performance
Top Spending Categories
Major Changes
```

---

# 13. Monthly Summary Example

```text
August Summary

Income
৳55,000

Expenses
৳31,200

Saved
৳23,800

Savings Rate
43.3%

Budget
৳40,000 planned
৳31,200 spent

Top Categories
Food       ৳8,450
Transport  ৳5,200
Bills      ৳4,100
```

---

# 14. Income Report

The Income Report answers:

> Where did my money come from?

It should include:

- total income
- income sources
- monthly trend
- source distribution
- comparison with previous period

Potential categories:

```text
Salary
Freelancing
Bonus
Business
Gift
Refund where applicable
Other
```

Refunds must not automatically be treated as normal income if the domain model treats them as expense corrections.

---

# 15. Income Report Visualization

Useful chart types:

- bar chart
- line chart
- source distribution

Example:

```text
Income Trend

Jun  ███████
Jul  █████████
Aug  ██████████
```

Exact chart implementation belongs to the UI design system.

---

# 16. Expense Report

The Expense Report answers:

> Where did my money go?

It should include:

- total expense
- category distribution
- merchant concentration where useful
- monthly/weekly trend
- top expenses
- comparison

---

# 17. Expense Report Example

```text
August Expenses

Total
৳31,200

Categories

Food        ৳8,450
Transport   ৳5,200
Bills       ৳4,100
Shopping    ৳3,800
Other       ৳9,650
```

---

# 18. Category Spending Report

This report focuses on category behavior.

For each category:

```text
Category
Current Period
Previous Period
Change
Percentage
Budget
Status
```

Example:

```text
Food
August:  ৳8,450
July:    ৳6,900
Change: +22.5%
Budget:  ৳10,000
Status:  At Risk
```

---

# 19. Category Trend

The report may show:

```text
Food
Jun  ৳6,200
Jul  ৳6,900
Aug  ৳8,450
```

This gives context rather than judging a single month's value.

---

# 20. Cash-Flow Report

The Cash-Flow Report should show:

```text
Income
-
Expenses
=
Net Cash Flow
```

It may also show:

- opening period balance
- closing period balance
- transfer activity separately
- recurring commitments
- expected future cash where applicable

Transfers must not be counted as income or expense.

---

# 21. Cash-Flow Example

```text
August

Opening Balance
৳104,650

Income
+৳55,000

Expenses
-৳31,200

Net Cash Flow
+৳23,800

Closing Balance
৳128,450
```

The exact balance logic must reconcile with the account ledger.

---

# 22. Budget Performance Report

The report should compare:

```text
Budget
Actual
Remaining
Utilization
Projected
Status
```

Example:

```text
Food
Budget       ৳10,000
Actual       ৳8,450
Remaining    ৳1,550
Utilization  84.5%
Projected    ৳10,200
Status       At Risk
```

---

# 23. Budget History Report

Users should be able to compare previous periods.

Example:

```text
Month     Budget    Actual
June      9,000     8,200
July      10,000    8,900
August    10,000    8,450
```

---

# 24. Lending Report

The Lending Report should show:

```text
Total Lent
Total Repaid
Outstanding
Overdue
Number of Active Obligations
```

Example:

```text
Money Owed to Me

Original Lent:
৳30,000

Repaid:
৳12,000

Outstanding:
৳18,000

Overdue:
৳6,000
```

---

# 25. Borrowing Report

The Borrowing Report should show:

```text
Total Borrowed
Total Repaid
Outstanding
Overdue
Active Obligations
```

It must clearly communicate that these are liabilities.

---

# 26. Combined Obligation Summary

A combined report may show:

```text
Receivables
৳18,000

Liabilities
৳12,500

Net Difference
+৳5,500
```

This must not be presented as a full net-worth calculation.

---

# 27. Lending / Borrowing People Breakdown

The report can show:

```text
Person      Type        Outstanding   Status
Rahim       Lending     ৳6,000        Due Soon
Karim       Lending     ৳2,500        Overdue
Arif        Borrowing   ৳8,000        Active
```

The user should be able to drill into each obligation.

---

# 28. Goal Report

The Goal Report should show:

- active goals
- completed goals
- target amount
- current progress
- remaining
- target date
- forecast
- risk

Example:

```text
Laptop
৳62,000 / ৳100,000
62%
Target: December
Status: Ahead
```

---

# 29. Goal Contribution Report

The report may summarize:

```text
Total Contributions
Average Contribution
Contribution Frequency
Contribution Trend
Goals Completed
Goals At Risk
```

---

# 30. Recurring Expense Report

This report answers:

> How much of my money is already committed to recurring expenses?

Include:

- recurring monthly total
- recurring annual total
- bills
- subscriptions
- recurring income
- upcoming commitments

---

# 31. Recurring Expense Example

```text
Recurring Monthly Commitments

Internet       ৳1,000
Subscription   ৳1,500
Rent           ৳15,000
Insurance      ৳2,000

Total:
৳19,500/month
```

---

# 32. Account Report

The Account Report may show:

- account balances
- account activity
- money in/out
- account trend
- transfer volume

This is useful for users with multiple accounts and wallets.

---

# 33. Transaction Activity Report

A detailed report should support:

- all transactions
- selected transaction types
- categories
- accounts
- tags
- date ranges
- amount ranges

This report should function as a formal, filterable ledger view.

---

# 34. Report Filters

Reports should support context-appropriate filters:

```text
Date Range
Account
Category
Transaction Type
Tags
Person
Amount Range
Status
```

Not every report needs every filter.

---

# 35. Filter Persistence

During the current report session, filters should remain active when the user drills into details and returns.

Example:

```text
August Expense Report
Category = Food
 ↓
Transaction Detail
 ↓
Back
 ↓
Return to:
August + Food
```

---

# 36. Report Comparison

Users should be able to compare:

```text
Current vs Previous Period
```

Examples:

```text
August vs July
2026 vs 2025
This Week vs Last Week
```

---

# 37. Comparison Metrics

Useful comparisons include:

- income change
- expense change
- savings change
- category change
- budget performance change
- recurring commitment change

---

# 38. Percentage Change

Where a previous value exists:

```text
Change %
=
(Current - Previous) / Previous × 100
```

If the previous value is zero, the UI must use an appropriate state such as:

```text
No previous baseline
```

rather than dividing by zero.

---

# 39. Report Drill-Down

Every important summary should support inspection of its source data.

Example:

```text
Food:
৳8,450
 ↓
View Transactions
 ↓
Filtered Transaction List
```

This supports report explainability.

---

# 40. Report Explainability

A user should be able to answer:

> "Why does the report say this?"

For example:

```text
Expense:
৳31,200

Breakdown:
Food        ৳8,450
Transport   ৳5,200
Bills       ৳4,100
...
```

The report must not provide unexplained calculated values.

---

# 41. Report Reconciliation

Reports should reconcile against source data.

For example:

```text
Monthly Expense Report
=
Sum of qualifying transaction activity
```

Any cached/precomputed values must remain reconstructable.

---

# 42. Report Accuracy

Accuracy has priority over speed.

For financial reports:

```text
Correctness
>
Fancy visualization
```

An attractive incorrect report is unacceptable.

---

# 43. Report Data Freshness

The report should indicate freshness where required.

For example:

```text
Updated just now
```

or:

```text
Last calculated:
2 minutes ago
```

This is especially useful for expensive analytics.

---

# 44. Offline Reporting

Core reports should work offline when the required data exists locally.

Examples:

- monthly summary
- expense report
- income report
- budget report
- goal report
- lending report
- borrowing report

Cloud-only features should be clearly indicated.

---

# 45. Offline Report Flow

```text
SQLite
 ↓
Local Report Query
 ↓
Calculation
 ↓
Render
```

No network request should be required for ordinary local reporting.

---

# 46. Server Reporting

The backend should provide reporting for:

- cloud users
- cross-device data
- server-side report generation
- large datasets
- shareable exports

The calculations must follow the same documented business rules as mobile calculations.

---

# 47. Shared Calculation Rules

To avoid discrepancies between mobile and backend:

```text
Shared Business Rules
+
Deterministic Fixtures
+
Contract Tests
```

should define expected results.

---

# 48. Report Generation Performance

Simple reports should return synchronously.

Potentially expensive reports may become asynchronous.

Example:

```text
POST /reports/jobs
        ↓
Job ID
        ↓
Background Worker
        ↓
Report Generated
        ↓
Download
```

Potential expensive cases:

- multi-year analysis
- large datasets
- PDF generation
- complex grouped analytics

---

# 49. Report Caching

Reports may be cached when:

- source data is unchanged
- report configuration is unchanged
- calculation version is unchanged

A cache key may include:

```text
user_id
report_type
period
filters
calculation_version
input_snapshot_hash
```

---

# 50. Report Cache Invalidation

Report caches should invalidate when relevant source data changes.

Example:

```text
New Expense
 ↓
Monthly Expense Report
 ↓
Cached Result Invalid
```

Do not invalidate every report globally when only one category changes unless required.

---

# 51. Report Versioning

Calculation logic may evolve.

Report outputs should be traceable to a calculation version where useful.

Example:

```text
calculationVersion = 2
```

When calculation rules materially change, increment the version where historical traceability matters.

---

# 52. PDF Reports

The product should support PDF export for selected structured reports.

Potential PDF reports:

- Monthly summary
- Expense report
- Income report
- Cash-flow report
- Budget report
- Goal report
- Lending report
- Borrowing report

---

# 53. PDF Design Principles

PDF reports should prioritize:

- readability
- hierarchy
- page structure
- clear dates
- currency
- chart labels
- source period
- generated timestamp

Do not simply screenshot the mobile UI.

---

# 54. PDF Security

Generated financial reports may contain sensitive data.

Cloud-generated files should:

- use private storage
- have controlled access
- expire when appropriate

Local PDF files should be saved/shared through secure platform mechanisms.

---

# 55. CSV Export

CSV is suitable for:

- transaction data
- detailed ledger
- category summaries
- account activity

CSV exports must consider formula-injection risks.

---

# 56. JSON Export

JSON should provide a structured machine-readable representation.

Potential use cases:

- backup
- migration
- developer tooling
- advanced export

The schema must be versioned.

---

# 57. Export Scope

The user should understand what will be exported.

Example:

```text
Export Monthly Expenses
August 2026
Food + Transport
Transactions only
```

Avoid ambiguous export operations without showing scope.

---

# 58. Report Sharing

Potential channels:

- file save
- operating system share sheet
- email
- messaging apps

The application should not silently upload reports to external services.

User confirmation is required for sharing.

---

# 59. Report Privacy

Reports may reveal:

- income
- spending habits
- account balances
- debts
- financial goals

Therefore:

- do not include report values in generic analytics
- protect generated files
- use careful notification text
- avoid public links

---

# 60. AI-Assisted Report Summary

AI may summarize a deterministic report.

Preferred pipeline:

```text
Report Calculations
      ↓
Structured Metrics
      ↓
AI Context
      ↓
AI Summary
      ↓
Validation
      ↓
User
```

Example:

> "Your expenses were 8% lower than last month, mainly because transport and shopping spending decreased."

The underlying numbers must come from the report engine.

---

# 61. AI Report Recommendations

AI may provide:

- spending explanations
- trend explanations
- budget observations
- goal observations
- recurring-commitment observations

The AI should not invent facts not present in the structured report context.

---

# 62. AI Report Guardrails

AI must not:

- alter the report
- change financial records
- change budgets
- create transactions
- make unsupported claims
- present estimates as historical facts

AI is an explanatory layer.

---

# 63. Report Narrative Structure

A report summary can follow:

```text
What happened?
↓
Why did it happen?
↓
What changed?
↓
What deserves attention?
↓
What can I do?
```

This is optional and especially useful for monthly summaries.

---

# 64. Monthly Review Experience

A monthly review should feel like a guided financial check-in.

Possible flow:

```text
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
Goal Progress
   ↓
Major Changes
   ↓
AI Summary
   ↓
Next Actions
```

Users should not need to inspect every raw transaction to understand the month.

---

# 65. Major Changes

Reports may identify material differences such as:

```text
Food +22%
Transport -14%
Savings +8%
```

These changes should be ranked by meaningful impact, not merely percentage.

A 200% change from ৳100 to ৳300 may be less important than a 15% change from ৳10,000 to ৳11,500.

---

# 66. Report Ranking Logic

Important report items may be prioritized using:

```text
Absolute Impact
+
Percentage Change
+
Budget Relevance
+
User Configured Importance
```

The exact ranking model belongs in analytics logic.

---

# 67. Report Empty States

If a selected period contains insufficient data:

```text
No financial activity in this period.

Try another date range or continue tracking
to build a more useful report.
```

Do not display misleading empty charts.

---

# 68. Report Partial Data

If only partial data exists:

```text
Limited data for this period.

Some comparisons and forecasts may be unavailable.
```

The report should remain honest about completeness.

---

# 69. Report Loading

Use:

- skeletons
- progressive rendering
- background generation for heavy reports

Avoid blocking the entire application for a slow report.

---

# 70. Report Error

Example:

```text
We couldn't generate this report.

Your financial records are safe.

[Retry]
```

Technical calculation errors should be logged internally.

---

# 71. Report API

Relevant endpoints:

```text
GET  /api/v1/reports
GET  /api/v1/reports/monthly
GET  /api/v1/reports/income
GET  /api/v1/reports/expenses
GET  /api/v1/reports/categories
GET  /api/v1/reports/cash-flow
GET  /api/v1/reports/budget
GET  /api/v1/reports/lending
GET  /api/v1/reports/borrowing
GET  /api/v1/reports/goals
GET  /api/v1/reports/recurring
POST /api/v1/reports/jobs
GET  /api/v1/reports/jobs/:id
```

Exact request/response contracts are defined in `API.md`.

---

# 72. Report Database Dependencies

Reports primarily depend on:

```text
Transactions
Accounts
Categories
Budgets
Goals
Lending
Borrowing
Repayments
Recurring Transactions
```

Derived values must remain traceable to source data.

---

# 73. Report Local Storage Dependencies

Offline reports use:

```text
SQLite
↓
Local domain queries
↓
Calculation layer
↓
Report view model
```

No network call should be required for supported offline reports.

---

# 74. Report Sync Behavior

Reports themselves generally do not need to synchronize as primary source data.

Instead:

```text
Source Financial Data
        ↓
Sync
        ↓
Report Recalculation
```

Generated report files may synchronize only if explicitly supported.

---

# 75. Generated Report Storage

If generated reports are stored:

```text
Report Job
 ↓
Generated File
 ↓
Object Storage
 ↓
Private Access
```

Generated reports should have retention/expiration policies.

---

# 76. Report Security

Every report request must verify:

- user ownership
- filter scope
- referenced account/category ownership
- report export permissions

A user must never be able to generate a report containing another user's financial information.

---

# 77. Report Access Logging

Sensitive report generation may be logged operationally.

Avoid logging:

- complete report contents
- full transaction lists
- account balances

Store:

```text
user reference
report type
period
request ID
generation duration
status
```

---

# 78. Report Edge Cases

The system must handle:

- zero-income periods
- zero-expense periods
- no transactions
- only transfers
- refunds
- backdated transactions
- future-dated transactions
- deleted transactions
- archived accounts
- deleted categories
- currency mismatch
- leap years
- timezone changes
- very large datasets
- partial sync state
- missing historical budget configuration

---

# 79. Zero Income

Savings rate:

```text
Savings / Income
```

cannot divide by zero.

The UI should use:

```text
N/A
```

or an appropriate state rather than showing infinity or an invented value.

---

# 80. Zero Expense

A period with zero expense is valid.

Example:

```text
Income:
৳50,000

Expense:
৳0

Savings:
৳50,000

Savings Rate:
100%
```

---

# 81. Transfer-Only Period

If a period contains only account transfers:

```text
Income:
৳0

Expenses:
৳0

Transfers:
৳25,000

Net Operating Cash Flow:
৳0
```

Transfers should remain separately visible.

---

# 82. Refund Handling

Refunds must follow the transaction-domain refund rules.

Reports should avoid counting an expense refund as ordinary income unless the domain explicitly defines it that way.

---

# 83. Backdated Transactions

If a transaction is entered today with a historical financial date:

```text
Created:
14 Aug

Transaction Date:
10 Aug
```

reports for 10 August must reflect the transaction.

This is why `transaction_date` and `created_at` remain distinct.

---

# 84. Future-Dated Transactions

Future-dated transactions should not be treated as historical actuals.

Reports may place them into:

```text
Upcoming
Scheduled
Forecast Input
```

depending on domain rules.

The distinction between:

```text
actual
scheduled
forecast
```

must remain clear.

---

# 85. Report Performance Targets

The exact targets must be validated using production-like datasets.

The product should aim for:

## Standard Mobile Report

Fast enough to feel immediate from local data.

## Standard Cloud Report

A few seconds or less under normal conditions.

## Heavy Report

Asynchronous generation with progress/status rather than a blocked request.

---

# 86. Large Dataset Strategy

Use:

- database indexes
- optimized aggregation queries
- precomputed summaries where justified
- pagination for detail lists
- background jobs for heavy exports

Do not return millions of rows to the mobile client for ordinary reports.

---

# 87. Report Query Isolation

Complex reporting queries should be isolated from ordinary transaction CRUD paths where practical.

A slow multi-year report must not unnecessarily block transaction entry.

---

# 88. Report Calculation Version

Core report algorithms should have a version.

Example:

```text
reportCalculationVersion = 1
```

When calculation rules materially change, increment the version where historical traceability matters.

---

# 89. Report Reproducibility

A generated report should be reproducible from:

```text
Source Data
+
Period
+
Filters
+
Calculation Version
```

This is important for debugging and user trust.

---

# 90. Report Testing

## Unit Tests

Test:

- totals
- comparisons
- percentages
- category aggregation
- budget reconciliation
- cash flow
- report periods

## Integration Tests

Test:

- database queries
- filters
- report endpoints
- exports
- report jobs

## E2E Tests

Test:

```text
Open Monthly Report
→ Change Period
→ Drill Into Category
→ Open Transaction
→ Return
→ Export PDF
```

---

# 91. Report Fixtures

Maintain deterministic fixtures.

Example:

```text
Income:
৳55,000

Expenses:
৳31,200

Expected Savings:
৳23,800

Expected Savings Rate:
43.27%
```

The same fixtures can validate mobile and backend reporting logic.

---

# 92. Accessibility

Reports must provide:

- textual metric summaries
- accessible chart labels
- screen-reader descriptions
- non-color-only statuses
- readable PDF output

Charts are supplemental, not the only representation of the data.

---

# 93. Report UI Quality Bar

A user should understand:

```text
How much came in?
How much went out?
How much remained?
What changed?
Why did it change?
What should I pay attention to?
```

The report should not require financial expertise to interpret.

---

# 94. Acceptance Criteria

The Reporting module is complete when:

- Required report types exist.
- Date ranges work correctly.
- Timezones are handled correctly.
- Filters are accurate.
- Financial totals reconcile with source data.
- Income and expenses are correctly classified.
- Transfers are excluded from operating expense/income.
- Refund behavior is correct.
- Comparisons handle zero baselines safely.
- Reports can drill down to source transactions.
- Offline reports work where local data is sufficient.
- Large reports can be generated asynchronously.
- PDF/CSV/JSON exports work according to scope.
- Report files are protected.
- AI summaries are grounded in deterministic reports.
- Report generation is observable.
- Security and ownership checks are enforced.
- Critical report calculations have automated tests.

---

# 95. Future Enhancements

Potential future capabilities:

```text
Net Worth Reports
Investment Reports
Tax Reports
Household Reports
Financial Health Reports
Subscription Optimization Reports
Custom Report Builder
Scheduled Monthly Reports
Email Report Delivery
AI Monthly Financial Review
Interactive Report Storytelling
```

These should be added only when the supporting domain and privacy model are ready.

---

# 96. Relationship With Other Documents

The product-module sequence is:

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

Reporting depends on:

```text
Transactions
Accounts
Categories
Budgets
Goals
Lending
Borrowing
Repayments
Recurring Finance
Analytics
Forecasting
```

The next document is:

```text
docs/product/NOTIFICATIONS.md
```

It should define:

- Notification types
- Local notifications
- Push notifications
- Email
- Reminder scheduling
- Budget alerts
- Goal alerts
- Lending/borrowing reminders
- Recurring payment reminders
- AI warnings
- Deduplication
- User preferences
- Quiet hours
- Deep links
- Retry behavior
- Multi-device behavior
- Privacy
- Acceptance criteria

The core reporting principle remains:

> **Every important financial number should be explainable, traceable to source data, and presented in a way that helps the user make a better decision.**
