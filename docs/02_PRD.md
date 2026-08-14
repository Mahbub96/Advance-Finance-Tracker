# Personal Finance — Product Requirements Document

**Document:** `02_PRD.md`
**Version:** 1.0
**Status:** Approved Baseline
**Last Updated:** 2026-08-12
**Product:** Personal Finance
**Platform:** Android-first, iOS-ready
**Repository:** Open Source
**Mobile:** React Native + Expo + TypeScript
**Backend:** NestJS + TypeScript
**Database:** PostgreSQL + Prisma
**Local Database:** SQLite

---

# 1. Purpose

This Product Requirements Document defines the functional and non-functional requirements for the Personal Finance application.

The product is designed as a **complete personal financial management and intelligence platform**, rather than a simple expense tracker.

The primary objective is to make financial tracking:

- Fast
- Accurate
- Low-friction
- Private
- Offline-capable
- Insightful
- Predictive
- Actionable

The application should progressively evolve from a financial tracker into a personal financial intelligence assistant.

---

# 2. Product Objective

The application must allow users to:

1. Record income and expenses with minimal effort.
2. Manage multiple financial accounts and wallets.
3. Track transfers between accounts.
4. Organize transactions using categories and tags.
5. Create and monitor budgets.
6. Receive proactive budget warnings.
7. Manage recurring expenses and income.
8. Track money lent to other people.
9. Track money borrowed from other people.
10. Track repayments and outstanding balances.
11. Receive repayment reminders.
12. Create financial goals.
13. Monitor savings progress.
14. Analyze historical financial behavior.
15. View meaningful financial reports.
16. Forecast future spending and cash flow.
17. Detect unusual spending behavior.
18. Receive personalized recommendations.
19. Receive AI-generated explanations and insights.
20. Eventually interact with finances through a conversational AI assistant.
21. Use core functionality without internet connectivity.
22. Maintain control over their financial data.

---

# 3. Target Users

## 3.1 Primary User

Individuals who want to actively manage their personal finances.

Typical users may want to:

- Track daily expenses
- Control monthly spending
- Understand financial habits
- Save toward goals
- Manage money owed by others
- Manage money they owe
- Monitor recurring expenses
- Improve savings behavior

---

## 3.2 Secondary Users

Future versions may support:

- Couples
- Families
- Shared households
- Small groups
- Multi-device users

These capabilities are future scope and must not compromise the initial personal-finance architecture.

---

# 4. Core Product Modules

The application consists of the following major modules:

```text
Authentication
User Profile
Accounts & Wallets
Transactions
Categories
Tags
Budgets
Recurring Transactions
Bills & Subscriptions
Lending
Borrowing
Repayments
Financial Goals
Analytics
Reports
Forecasting
Notifications
Search
Files / Receipts
Import / Export
Backup
Synchronization
AI Insights
AI Recommendations
AI Assistant
Settings
```

---

# 5. Transaction Management

Transaction management is the core financial domain.

The system must support:

```text
Income
Expense
Transfer
Refund
Adjustment
```

Additional financial operations such as lending and borrowing should have appropriate domain behavior rather than being treated as generic expenses.

---

## 5.1 Expense

An expense represents money leaving an account for consumption or payment.

Minimum information:

- Amount
- Account
- Category
- Date/time

Optional information:

- Merchant
- Note
- Tags
- Attachment
- Location
- Payment method
- Recurrence
- Metadata

---

## 5.2 Income

An income represents money received by the user.

Examples:

- Salary
- Freelancing
- Bonus
- Business income
- Gift
- Refund
- Other income

---

## 5.3 Transfer

A transfer moves money between accounts owned by the user.

Example:

```text
Bank Account
      ↓ ৳10,000
Cash Wallet
```

Transfers must not affect total income or total expenses.

---

## 5.4 Refund

The system should support refunds and correctly associate them with previous expenses where possible.

---

## 5.5 Transaction Editing

Users must be able to edit transactions.

Changes must immediately update relevant:

- balances
- budgets
- reports
- analytics
- forecasts
- goal calculations

---

## 5.6 Transaction Deletion

Deletion must protect financial integrity.

Depending on the transaction type, the application may use:

- soft deletion
- reversal
- audit information

rather than permanently destroying financial history.

---

# 6. Frictionless Transaction Entry

This is a **critical product requirement**.

The transaction-entry experience must be optimized for speed.

The default experience should prioritize:

```text
Amount
↓
Smart Category
↓
Account
↓
Save
```

The system should intelligently infer or remember optional information.

---

## 6.1 Smart Defaults

The application should learn from user behavior.

Examples:

```text
Coffee
→ Food
→ Cash
→ Recent amount pattern
```

When appropriate, the application may automatically suggest:

- category
- account
- merchant
- payment method
- tags

---

## 6.2 Quick Transactions

Users should be able to create reusable shortcuts.

Example:

```text
☕ Morning Coffee
৳120
Food
Cash
```

A quick transaction should require minimal interaction.

---

## 6.3 Recent Transactions

Users should be able to duplicate recent transactions.

---

## 6.4 Repeated Transactions

The system should identify frequently repeated transactions and make them easier to enter.

---

## 6.5 Voice Input

Future requirement.

Users should be able to say:

> "আজকে বিকাশে ৪৫০ টাকা বাজার করেছি।"

The system should extract:

```text
Amount: 450
Category: Groceries
Account: bKash
Date: Today
Type: Expense
```

The user must be able to review the extracted information before saving.

---

## 6.6 Receipt Processing

Future requirement.

The system should support receipt/image processing:

```text
Receipt
 ↓
OCR
 ↓
Data Extraction
 ↓
Category Suggestion
 ↓
User Review
 ↓
Transaction
```

The application must never silently create incorrect transactions from OCR results.

---

# 7. Accounts & Wallets

Users must be able to manage multiple financial accounts.

Examples:

- Cash
- Bank account
- bKash
- Nagad
- Credit card
- Savings account
- Other wallet

Each account should support:

- Name
- Type
- Currency
- Opening balance
- Current balance
- Status
- Optional institution information

---

# 8. Categories

The application must support customizable categories.

Example expense categories:

```text
Food
Transport
Housing
Shopping
Health
Entertainment
Education
Bills
Subscriptions
Travel
Personal
Other
```

Users should be able to:

- Create categories
- Edit categories
- Delete categories where safe
- Reorder categories
- Assign icons
- Assign colors
- Create subcategories

---

# 9. Tags

Tags should provide flexible classification beyond categories.

Examples:

```text
Work
Personal
Trip
Emergency
Family
Reimbursable
```

Transactions may have multiple tags.

---

# 10. Budgets

Users must be able to define budgets.

Budget types may include:

- Monthly
- Weekly
- Custom period
- Category-based
- Overall spending budget

---

## 10.1 Budget Monitoring

The system must show:

```text
Budget
Actual Spending
Remaining
Utilization %
Projected Spending
```

Example:

```text
Food Budget
৳10,000

Spent
৳7,800

Remaining
৳2,200

Utilization
78%
```

---

## 10.2 Budget Alerts

Users should receive configurable warnings.

Possible thresholds:

```text
50%
75%
80%
90%
100%
Projected Overrun
```

---

## 10.3 Budget Forecasting

The application should estimate whether the user is likely to exceed the budget based on current spending velocity.

---

# 11. Recurring Transactions

Users must be able to configure recurring financial events.

Examples:

- Salary
- Rent
- Internet
- Electricity
- Mobile bill
- Subscription
- Loan payment

Recurrence options may include:

- Daily
- Weekly
- Monthly
- Yearly
- Custom interval

---

# 12. Bills & Subscriptions

The application should provide dedicated visibility into recurring financial commitments.

Users should be able to see:

- Upcoming bills
- Recurring amounts
- Next payment date
- Monthly recurring commitment
- Annual recurring commitment
- Subscription changes

Future versions may detect unused or increasing subscriptions.

---

# 13. Lending Management

The application must support money lent to other people.

A lending record should contain:

- Person
- Amount
- Date
- Expected repayment date
- Notes
- Status
- Repayment history

---

## 13.1 Partial Repayment

Example:

```text
Lent: ৳10,000
Repaid: ৳4,000
Outstanding: ৳6,000
```

Multiple repayments must be supported.

---

## 13.2 Lending Status

Possible statuses:

```text
Active
Partially Repaid
Fully Repaid
Overdue
Cancelled
```

---

# 14. Borrowing Management

Users must be able to track money borrowed from others.

The system should maintain:

- Creditor
- Amount
- Borrowing date
- Expected repayment date
- Repayment history
- Outstanding liability
- Notes
- Status

---

# 15. Repayment Reminders

Users should be able to configure reminders.

Example schedule:

```text
7 days before
3 days before
1 day before
Due date
After due date
```

The user should control which reminders are enabled.

---

## 15.1 Email Reminders

The application may send configurable email reminders.

Example:

> "You have a repayment scheduled for 25 August. Please review the outstanding amount."

For lending reminders, the user should be able to generate or send polite messages.

The system should avoid aggressive or embarrassing language.

---

# 16. Financial Goals

Users must be able to create financial goals.

Examples:

```text
Emergency Fund
Laptop
Travel
Education
Investment
New Phone
```

Each goal should support:

- Name
- Target amount
- Current amount
- Target date
- Contribution history
- Progress
- Required periodic contribution
- Forecasted completion

---

# 17. Goal Forecasting

The application should calculate:

- Required monthly contribution
- Expected completion date
- Current trajectory
- Shortfall
- Surplus

Example:

```text
Target:
৳100,000

Current:
৳60,000

Remaining:
৳40,000

Target:
December 2026

Required monthly saving:
৳10,000
```

---

# 18. Analytics

Analytics should transform raw financial data into understandable metrics.

Core analytics include:

### Spending

- Total spending
- Average spending
- Daily spending
- Category distribution
- Merchant distribution
- Spending frequency

### Income

- Total income
- Income sources
- Income trends
- Average monthly income

### Cash Flow

- Income
- Expenses
- Net cash flow
- Cash flow trend

### Savings

- Savings amount
- Savings rate
- Savings trend

---

# 19. Advanced Analytics

The system should support:

- Month-over-month comparison
- Year-over-year comparison
- Category trends
- Spending velocity
- Recurring spending
- Spending anomalies
- Weekday vs weekend spending
- Merchant trends
- Account utilization
- Budget performance
- Goal performance

---

# 20. Financial Reports

Reports should provide meaningful summaries rather than merely displaying raw charts.

Required report types:

- Monthly financial summary
- Income report
- Expense report
- Category report
- Cash-flow report
- Budget report
- Lending report
- Borrowing report
- Goal report
- Recurring expense report

---

# 21. Charts & Visualization

The application should provide appropriate visualizations.

Potential visualizations:

- Spending by category
- Income vs expense
- Cash-flow trend
- Budget utilization
- Goal progress
- Monthly comparison
- Spending forecast
- Account balance trend

Charts must prioritize readability.

Visualization should not be used merely for decoration.

---

# 22. Search

Users must be able to search financial data.

Search should support:

- Merchant
- Category
- Amount
- Note
- Tag
- Account
- Date
- Person
- Transaction type

Search should remain performant with large datasets.

---

# 23. Filtering

Users should be able to filter by:

- Date range
- Account
- Category
- Transaction type
- Amount range
- Tags
- Person
- Status

Filters should be combinable.

---

# 24. AI Financial Insights

AI should analyze structured financial metrics.

Potential insights:

- Spending increases
- Category anomalies
- Budget risks
- Cash-flow risks
- Savings opportunities
- Recurring expense growth
- Goal progress problems

Example:

> "Your transportation spending is 31% higher than your three-month average."

---

# 25. AI Recommendations

The application should provide actionable recommendations.

Examples:

> "Reducing restaurant spending by approximately ৳1,500 this month would keep you within your current food budget."

> "Your current savings rate may make your December goal difficult to reach. Increasing monthly savings by ৳2,000 could put you back on track."

Recommendations must be based on actual financial metrics.

---

# 26. AI Warning System

The AI system may detect and explain:

- Overspending
- Unusual transactions
- Budget risk
- Cash-flow risk
- Goal delays
- Increasing recurring expenses

Warnings must be explainable and non-alarmist.

---

# 27. AI Conversational Assistant

Future capability.

Users should eventually be able to ask:

```text
How much did I spend this month?

Why did my expenses increase?

How much do people owe me?

Can I afford to save ৳10,000 this month?

What are my biggest expenses?

How much can I spend this week?

When will I reach my laptop goal?
```

The assistant should query trusted application data and calculations.

It must not invent financial information.

---

# 28. Forecasting Engine

Forecasting should be separate from LLM functionality.

The forecasting engine may use:

- Moving average
- Weighted average
- Linear regression
- Time-series analysis
- Seasonal analysis
- Category-specific models

The system should select a forecasting method according to available historical data.

Predictions should include uncertainty where appropriate.

---

# 29. Financial Health Score

The application may calculate a financial health score.

Potential factors:

```text
Savings
Budget adherence
Cash-flow stability
Debt / borrowing
Lending exposure
Recurring commitments
Goal progress
Spending volatility
```

The score must be explainable.

---

# 30. What-If Simulator

Users should be able to simulate financial scenarios.

Examples:

```text
Save ৳5,000 more every month
Increase expenses by 10%
Reduce food spending by ৳2,000
Increase income by ৳5,000
```

The system should calculate the projected impact on:

- Savings
- Goals
- Budget
- Cash flow
- Completion dates

---

# 31. Notifications

The notification system should support:

- Budget alerts
- Repayment reminders
- Upcoming bills
- Recurring transactions
- Goal reminders
- AI warnings
- Forecast warnings
- Backup reminders
- Sync status

Users must have granular notification controls.

---

# 32. Data Import

The application should support importing financial data where practical.

Potential formats:

- CSV
- JSON
- Application backup
- Future bank statement formats

Import should provide a review stage before committing data.

---

# 33. Data Export

Users should be able to export their financial information.

Potential formats:

- CSV
- JSON
- PDF reports

Export should be user-controlled.

---

# 34. Backup & Restore

The system should support local backup and future cloud backup.

Backup should include relevant:

- Transactions
- Accounts
- Categories
- Budgets
- Goals
- Lending records
- Borrowing records
- Settings

Restore must validate data integrity before replacing existing data.

---

# 35. Offline-First Requirements

Core functionality must work offline.

Offline operations include:

- Create transaction
- Edit transaction
- Delete transaction
- View balances
- View history
- View budgets
- View goals
- View analytics based on local data

When online:

```text
Local Changes
     ↓
Sync Queue
     ↓
Backend
     ↓
Conflict Resolution
     ↓
Local State Updated
```

---

# 36. Cloud Synchronization

Cloud synchronization is future scope but must be architecturally supported.

Requirements:

- Secure authentication
- Device identification
- Sync state
- Conflict detection
- Conflict resolution
- Incremental synchronization
- Retry mechanism
- Offline queue

---

# 37. Authentication

Cloud functionality should support:

- Account registration
- Login
- Logout
- Password recovery
- Session management
- Refresh tokens
- Optional OAuth providers in future

Authentication is not required for purely local usage if local-only mode is supported.

---

# 38. Multi-Currency

Future capability.

The application should support:

- Currency per account
- Base currency
- Exchange rates
- Currency conversion
- Historical exchange rates where necessary

Financial calculations must preserve original transaction currency.

---

# 39. Localization

The application should be designed for internationalization.

Potential future support:

- English
- Bangla
- Additional languages

Text must not be hardcoded in UI components.

---

# 40. Accessibility

The application should support:

- Screen readers
- Adequate touch targets
- Dynamic font scaling
- Accessible color contrast
- Semantic labels
- Reduced-motion preferences

Accessibility should be considered during UI design rather than added after implementation.

---

# 41. Security Requirements

The application must protect financial data.

Requirements include:

- Secure authentication
- Secure token storage
- Input validation
- Authorization
- Rate limiting
- Secure API communication
- Secret management
- Database access controls
- Audit-sensitive operations
- Secure backup handling

Sensitive credentials must never be stored in source control.

---

# 42. AI Privacy Requirements

Before sending data to an external AI provider:

1. Determine whether the request actually requires AI.
2. Calculate deterministic metrics locally/server-side where possible.
3. Minimize the amount of financial data sent.
4. Remove unnecessary personally identifiable information.
5. Apply provider-specific privacy controls.
6. Handle provider failure gracefully.

The application should prefer:

```text
Raw Transactions
       ↓
Local/Backend Analytics
       ↓
Aggregated Metrics
       ↓
AI
```

over:

```text
Raw Transactions
       ↓
External LLM
```

---

# 43. Performance Requirements

The application should remain responsive with large transaction histories.

Important performance targets:

- Fast application startup
- Fast transaction entry
- Smooth scrolling
- Efficient database queries
- Efficient search
- Efficient chart rendering
- Minimal unnecessary network requests
- Background processing for expensive operations

The UI must never block unnecessarily while analytics or AI processing occurs.

---

# 44. Reliability Requirements

Financial data operations must be reliable.

The system must protect against:

- duplicate transactions
- partial writes
- failed synchronization
- corrupted local data
- inconsistent balances
- failed background jobs
- duplicate notifications

Critical operations should be idempotent where appropriate.

---

# 45. Testing Requirements

The application should use multiple testing layers.

### Unit Tests

For:

- Financial calculations
- Budget calculations
- Forecasting
- Business rules
- Validation

### Integration Tests

For:

- Database operations
- API modules
- Synchronization
- Notifications

### E2E Tests

For critical user journeys:

```text
Create account
Add transaction
Transfer money
Create budget
Record lending
Record repayment
Create goal
View report
Sync data
```

---

# 46. Observability

The production system should provide appropriate:

- Structured logging
- Error tracking
- Performance monitoring
- Background job monitoring
- API metrics
- Sync failure tracking

Sensitive financial information must not be unnecessarily included in logs.

---

# 47. API Requirements

The backend API should follow consistent conventions.

Requirements:

- Versioned API
- RESTful resource design
- Validation
- Authentication
- Authorization
- Pagination
- Filtering
- Sorting
- Standardized errors
- Idempotency where necessary

Example:

```text
/api/v1/transactions
/api/v1/accounts
/api/v1/budgets
/api/v1/goals
/api/v1/lending
/api/v1/borrowing
/api/v1/reports
/api/v1/analytics
/api/v1/ai/insights
```

Exact API contracts will be defined in `architecture/API.md`.

---

# 48. Data Architecture Requirements

The data model must support:

- Historical records
- Auditing where necessary
- Analytics
- Forecasting
- Synchronization
- Multi-account management
- Future multi-currency support
- Future multi-user support

The database design must avoid storing derived financial values as authoritative data when they can be reliably calculated from source transactions.

---

# 49. Error Handling

Errors must be understandable to users.

Avoid exposing technical messages such as:

```text
PrismaClientKnownRequestError
```

Instead:

> "We couldn't save this transaction. Your data has not been lost. Please try again."

Technical details should remain in logs.

---

# 50. Empty States

Every major feature must have meaningful empty states.

Example:

```text
No transactions yet

Add your first transaction to start
understanding your spending.
```

Empty states should explain what the user can do next.

---

# 51. Loading States

Loading states must be designed intentionally.

Avoid blank screens.

Use:

- Skeletons
- Progress indicators
- Optimistic UI where safe
- Background processing indicators

---

# 52. AI Failure Handling

AI must never break the core application.

If an AI provider fails:

```text
Core Application
      ↓
Continues Working
```

The user may see:

> "AI insights are temporarily unavailable."

Financial records and deterministic analytics must remain fully functional.

---

# 53. Feature Prioritization

Features should be evaluated using:

```text
User Value
+
Frequency of Use
+
Financial Importance
+
UX Impact
+
Technical Complexity
+
Privacy Risk
```

A feature should not be prioritized merely because it is technically interesting.

---

# 54. Initial Release Philosophy

The initial production release should contain a strong core rather than an unstable collection of every planned capability.

Core functionality should prioritize:

```text
Accounts
Transactions
Categories
Transfers
Budgets
Recurring Transactions
Lending/Borrowing
Goals
Analytics
Reports
Notifications
Offline Storage
Backup/Export
```

Advanced AI and ML functionality can progressively build on this foundation.

---

# 55. Future Expansion

The architecture should remain capable of supporting:

- Bank integrations
- Automatic transaction imports
- SMS transaction parsing
- Receipt OCR
- Voice-first input
- Investment tracking
- Net-worth tracking
- Shared finances
- Family accounts
- Advanced AI assistant
- Local AI
- Automated financial planning
- Cross-device synchronization

These are strategic possibilities and should be introduced based on actual product value.

---

# 56. Acceptance Criteria for the Product

The product baseline is considered successful when:

- Users can reliably record all common transaction types.
- Transaction entry is fast enough for everyday use.
- Account balances remain financially correct.
- Budgets accurately reflect transaction activity.
- Lending and borrowing balances are accurate.
- Repayments update outstanding balances correctly.
- Goals reflect actual contributions.
- Reports reconcile with underlying transaction data.
- Analytics are explainable.
- Forecasting is clearly distinguished from actual values.
- AI insights are grounded in application data.
- AI failures do not affect core functionality.
- Core functionality works offline.
- Data can be exported and restored.
- Security requirements are satisfied.
- Critical workflows have automated tests.
- The application remains responsive with substantial transaction history.

---

# 57. Product Success Metrics

The product should eventually measure:

### Input Efficiency

- Average transaction-entry time
- Number of taps per transaction
- Percentage of transactions entered through quick actions
- Voice/OCR adoption

### Retention

- Daily active users
- Weekly active users
- Monthly active users
- Transaction-entry consistency

### Financial Engagement

- Budget usage
- Goal usage
- Report usage
- Lending/borrowing usage

### Intelligence

- Insight engagement
- Recommendation engagement
- Forecast usage
- AI assistant usage

The most important product metric remains:

> **Consistent financial data entry over time.**

---

# 58. Product Constraints

The project must avoid:

- Over-engineered microservices
- AI dependency for basic features
- Unnecessary cloud dependency
- Excessive UI complexity
- Unnecessary data collection
- Unnecessary third-party services
- Unverified financial predictions
- Silent AI-generated financial actions

---

# 59. Product Direction

The application should evolve through:

```text
Phase 1
Reliable Financial Tracking

        ↓

Phase 2
Financial Management

        ↓

Phase 3
Financial Analytics

        ↓

Phase 4
Financial Forecasting

        ↓

Phase 5
AI Insights & Recommendations

        ↓

Phase 6
Personal Financial Assistant
```

Each phase should be built on the previous layer rather than replacing it.

---

# 60. Final Requirement

The application must satisfy the following product principle:

> **The user should never have to work harder than necessary to maintain accurate financial data, and the application should continuously turn that data into useful understanding and actionable insight.**

The product is therefore not defined by the number of features it contains.

It is defined by the quality of the complete loop:

```text
Easy Input
    ↓
Accurate Data
    ↓
Useful Organization
    ↓
Clear Analytics
    ↓
Reliable Forecasting
    ↓
Actionable Insights
    ↓
Better Financial Decisions
```

That loop is the core product requirement.
