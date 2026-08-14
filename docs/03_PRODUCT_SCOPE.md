# Personal Finance — Product Scope

**Document:** `03_PRODUCT_SCOPE.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL + Prisma  
**Local Database:** SQLite  
**Repository:** Open Source

---

# 1. Purpose

This document defines the complete product scope of the Personal Finance application.

It translates the product vision and PRD into a structured product boundary:

- What the application contains
- How features are grouped
- Which capabilities are foundational
- Which capabilities are advanced
- Which capabilities are future-facing
- How modules depend on each other
- What is intentionally excluded
- How the product should evolve

This document is intended to prevent uncontrolled feature growth while ensuring that the architecture is capable of supporting the long-term product vision.

---

# 2. Scope Classification

Every feature belongs to one of four scope levels.

## 2.1 Foundation

Features required to establish a reliable financial system.

Examples:

- Local database
- Accounts
- Transactions
- Categories
- Transfers
- Basic analytics
- Offline functionality

## 2.2 Core Product

Features required for the application to be a complete personal finance product.

Examples:

- Budgets
- Goals
- Recurring transactions
- Lending
- Borrowing
- Reports
- Notifications
- Search
- Backup/export

## 2.3 Advanced Product

Features that differentiate the application from a basic expense tracker.

Examples:

- Forecasting
- Anomaly detection
- Financial health score
- Advanced reports
- Spending trends
- What-if simulation
- Smart transaction suggestions
- Automated reminders

## 2.4 Intelligence / Future

Features that evolve the product into a financial intelligence platform.

Examples:

- AI insights
- AI recommendations
- AI assistant
- Voice transaction entry
- Receipt understanding
- Natural-language financial queries
- Bank integrations
- Automated financial planning
- Local AI models

---

# 3. Complete Product Module Map

```text
Application
│
├── 01. Onboarding
│
├── 02. Dashboard
│
├── 03. Transactions
│   ├── Income
│   ├── Expense
│   ├── Transfer
│   ├── Refund
│   ├── Adjustment
│   ├── Search
│   └── Filters
│
├── 04. Accounts
│   ├── Cash
│   ├── Bank
│   ├── Mobile Wallet
│   ├── Credit Card
│   └── Other
│
├── 05. Categories & Tags
│
├── 06. Budgets
│
├── 07. Recurring Finance
│   ├── Recurring Transactions
│   ├── Bills
│   └── Subscriptions
│
├── 08. Lending
│
├── 09. Borrowing
│
├── 10. Goals
│
├── 11. Analytics
│
├── 12. Reports
│
├── 13. Forecasting
│
├── 14. Notifications
│
├── 15. Files & Receipts
│
├── 16. Backup & Import/Export
│
├── 17. Synchronization
│
├── 18. AI Intelligence
│   ├── Insights
│   ├── Recommendations
│   ├── Warnings
│   └── Assistant
│
├── 19. Settings
│
└── 20. Platform Services
    ├── Authentication
    ├── Security
    ├── Logging
    └── Observability
```

---

# 4. Onboarding

## Purpose

Introduce the application without creating unnecessary setup friction.

## Scope

- Welcome
- Local-only mode
- Optional account creation
- Base currency
- Initial account setup
- Initial categories
- Notification preferences
- Privacy information

## Requirements

The user must be able to reach the main application quickly.

Onboarding must not require:

- Long forms
- Mandatory cloud registration
- Unnecessary personal information

---

# 5. Dashboard

## Purpose

Provide a concise overview of the user's current financial situation.

## Scope

### Financial Summary

- Current balance
- Income
- Expenses
- Net cash flow
- Savings

### Budget Summary

- Overall budget
- Category budgets
- Remaining amount
- Budget risk

### Upcoming

- Bills
- Recurring transactions
- Repayments
- Goal milestones

### Intelligence

- Important insights
- Warnings
- Recommendations
- Financial health

The dashboard must be configurable and should not become a dumping ground for every feature.

---

# 6. Transactions

Transactions are the central financial domain.

## Included

- Expense
- Income
- Transfer
- Refund
- Adjustment
- Transaction editing
- Transaction deletion/reversal
- Notes
- Tags
- Attachments
- Merchant
- Date/time
- Account
- Category

## Advanced

- Quick transactions
- Smart defaults
- Recent transaction reuse
- Intelligent category suggestions
- Merchant recognition
- Voice entry
- Receipt extraction

---

# 7. Accounts

## Included

- Cash
- Bank accounts
- Mobile wallets
- Credit cards
- Savings accounts
- Custom accounts

## Account capabilities

- Create
- Edit
- Archive
- Reorder
- View balance
- View transactions
- Transfer money
- Account-specific analytics

---

# 8. Categories & Tags

## Categories

Support:

- Parent categories
- Subcategories
- Custom categories
- Icons
- Colors
- Ordering

## Tags

Support:

- Custom tags
- Multiple tags per transaction
- Tag-based filtering
- Tag-based analytics

Categories represent financial classification.

Tags represent flexible context.

---

# 9. Budget Management

## Included

- Overall budgets
- Category budgets
- Monthly budgets
- Weekly budgets
- Custom-period budgets
- Budget progress
- Remaining budget
- Budget utilization

## Advanced

- Spending velocity
- Forecasted budget exhaustion
- Projected overrun
- Adaptive warnings
- Historical budget comparison

---

# 10. Recurring Finance

This module manages predictable financial events.

## Included

- Recurring income
- Recurring expenses
- Bills
- Subscriptions
- Scheduled transactions

## Advanced

- Upcoming payment timeline
- Monthly recurring commitment
- Annual recurring commitment
- Subscription trend detection
- Increasing subscription detection

---

# 11. Lending

## Included

- Person
- Amount
- Date
- Expected repayment date
- Notes
- Status
- Partial repayment
- Full repayment
- Outstanding balance

## Advanced

- Reminder schedules
- Email reminders
- Lending history
- Person-level financial summary
- Overdue tracking

---

# 12. Borrowing

## Included

- Creditor
- Amount
- Date
- Expected repayment date
- Notes
- Status
- Partial repayment
- Full repayment
- Outstanding balance

## Advanced

- Repayment schedule
- Reminder notifications
- Overdue detection
- Liability summary

---

# 13. Repayment System

Repayments are first-class financial events.

The system must support:

```text
Original Amount
      ↓
Repayment 1
      ↓
Repayment 2
      ↓
Remaining Balance
      ↓
Fully Repaid
```

The system must never create incorrect balances due to partial repayments.

---

# 14. Financial Goals

## Included

- Create goal
- Edit goal
- Archive goal
- Target amount
- Target date
- Current amount
- Contribution tracking
- Progress

## Advanced

- Required monthly contribution
- Forecasted completion
- Goal risk
- Contribution recommendations
- What-if simulation

---

# 15. Analytics

Analytics are divided into multiple levels.

## Level 1 — Basic

- Total income
- Total expenses
- Net cash flow
- Savings
- Savings rate
- Account balances

## Level 2 — Trends

- Monthly trends
- Category trends
- Merchant trends
- Spending velocity
- Income trends

## Level 3 — Advanced

- Spending anomalies
- Category behavior
- Budget risk
- Recurring spending
- Cash-flow forecasting
- Financial health

---

# 16. Reports

Reports should provide decision-support rather than merely displaying data.

## Included

- Monthly summary
- Income report
- Expense report
- Category report
- Cash-flow report
- Budget report
- Goal report
- Lending report
- Borrowing report
- Recurring expense report

## Export

Where applicable:

- PDF
- CSV
- JSON

---

# 17. Forecasting

Forecasting is a separate domain from AI.

## Scope

- Monthly expense prediction
- Category spending prediction
- Budget exhaustion prediction
- Cash-flow projection
- Goal completion prediction
- Savings projection

## Candidate methods

```text
Moving Average
Weighted Average
Linear Regression
Time-Series Models
Seasonality Detection
Category-Specific Models
```

The simplest model that produces sufficiently reliable results should be preferred.

---

# 18. Anomaly Detection

The system should detect unusual financial activity.

Examples:

```text
Normal spending:
৳100–৳500

Detected:
৳8,000
```

Potential signals:

- Amount deviation
- Frequency deviation
- Category deviation
- Merchant deviation
- Time-pattern deviation

An anomaly does not automatically mean fraud.

The system should describe it as unusual activity rather than making unsupported claims.

---

# 19. Financial Health

Financial Health provides a summarized view of the user's financial behavior.

Potential dimensions:

```text
Savings
Budget Discipline
Cash Flow
Recurring Commitments
Debt/Borrowing
Lending Exposure
Goal Progress
Spending Stability
```

The scoring system must remain explainable.

---

# 20. What-If Simulation

The application should allow users to model hypothetical changes.

Examples:

```text
Save ৳5,000 more
Reduce food spending by ৳2,000
Increase income by ৳10,000
Increase expenses by 10%
```

Outputs may include:

- New savings projection
- Goal completion date
- Cash-flow change
- Budget impact

---

# 21. AI Intelligence

AI is a separate intelligence layer.

It must not replace deterministic financial logic.

Architecture:

```text
Financial Data
      ↓
Deterministic Analytics
      ↓
Forecasting / Rules
      ↓
Structured Context
      ↓
AI
      ↓
Explanation / Recommendation
```

---

# 22. AI Insights

Scope:

- Financial summaries
- Spending explanations
- Trend explanations
- Budget explanations
- Goal explanations
- Unusual behavior explanations

Example:

> "Your expenses increased this month mainly because transportation and dining spending were higher than your recent average."

---

# 23. AI Recommendations

Scope:

- Spending recommendations
- Budget recommendations
- Savings recommendations
- Goal recommendations
- Cash-flow recommendations

Recommendations must be:

- Data-driven
- Explainable
- Optional
- Non-judgmental

---

# 24. AI Warning Engine

Potential warnings:

- Budget overrun risk
- Cash-flow risk
- Goal delay
- Unusual spending
- Increasing recurring expenses
- High financial commitments

AI should explain the reason behind a warning.

---

# 25. AI Assistant

Future scope.

Users should be able to interact naturally with financial information.

Examples:

```text
How much did I spend this month?

Where did most of my money go?

How much do people owe me?

Can I save ৳10,000 this month?

Why did my expenses increase?

When will I reach my goal?
```

The assistant must retrieve trusted application data rather than relying on model memory.

---

# 26. Voice Input

Future scope.

The system should convert natural language into structured financial data.

Supported languages may eventually include:

- English
- Bangla
- Banglish

Example:

```text
"আজকে ৪৫০ টাকা বাজার করেছি"
```

Potential result:

```text
Type: Expense
Amount: ৳450
Category: Groceries
Date: Today
```

User confirmation remains mandatory before committing uncertain extracted data.

---

# 27. Receipt Intelligence

Future scope.

Capabilities:

- OCR
- Merchant extraction
- Amount extraction
- Date extraction
- Item extraction
- Category suggestion
- Duplicate detection

The system should allow users to correct extracted information.

---

# 28. Notifications

## Included

- Budget alerts
- Goal reminders
- Bill reminders
- Recurring transaction reminders
- Lending reminders
- Borrowing reminders

## Advanced

- Forecast warnings
- AI recommendations
- Unusual spending alerts
- Financial health changes

Users must have notification-level controls.

---

# 29. Email

Email is primarily an external notification channel.

Potential use cases:

- Lending reminders
- Borrowing reminders
- Reports
- Backup notifications
- Account notifications

The system should not send financial emails without user authorization.

---

# 30. Files & Receipts

The application should support attaching files to financial records.

Potential attachments:

- Receipt
- Invoice
- Screenshot
- PDF
- Other supporting document

Files must be:

- Validated
- Size-limited
- Securely stored
- Properly associated with records

---

# 31. Import & Export

## Import

Supported or planned:

- CSV
- JSON
- Application backup
- Bank statement formats in future

Import process:

```text
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
Import
```

No destructive import should occur without user confirmation.

---

# 32. Backup

## Local Backup

The application should support local backup of financial data.

## Cloud Backup

Future scope.

Potential providers may be introduced through an abstraction layer.

---

# 33. Synchronization

Synchronization is future-facing but architecture-critical.

Scope:

- Device registration
- Sync queue
- Incremental synchronization
- Conflict detection
- Conflict resolution
- Retry
- Sync status

The local database remains the primary operational store for offline-first behavior.

---

# 34. Authentication

Authentication is optional for local-only operation.

Cloud functionality may require:

- Registration
- Login
- Logout
- Session management
- Password reset
- Refresh tokens
- OAuth in future

---

# 35. Privacy

Privacy is a product-level requirement.

The system should minimize collection of:

- Personal information
- Financial information
- Location
- Device information

AI providers should receive only the minimum data required for a specific operation.

---

# 36. Security

Security scope includes:

- Secure local storage
- Secure authentication
- Authorization
- API validation
- Rate limiting
- Encryption in transit
- Secret management
- Secure backups
- Audit-sensitive operations

---

# 37. Search

Global search should eventually cover:

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

Search should support partial matches and relevant filters.

---

# 38. Advanced Filtering

Filters should support combinations such as:

```text
Date:
August 1–31

Category:
Food

Account:
bKash

Amount:
> ৳500
```

Results should update quickly.

---

# 39. Settings

## General

- Currency
- Language
- Date format
- Number format
- Theme

## Finance

- Default account
- Default category
- Budget behavior
- Rounding

## Notifications

- Budget alerts
- Repayment alerts
- Goal alerts
- AI alerts

## Privacy

- AI permissions
- Analytics permissions
- Data export
- Data deletion

## Data

- Backup
- Restore
- Import
- Export
- Synchronization

---

# 40. Core UX Scope

The product must prioritize the following interactions:

## Extremely Fast

- Add expense
- Add income
- Add transfer

## Fast

- Add lending
- Add borrowing
- Record repayment

## Easy

- Create budget
- Create goal
- Add recurring transaction

## Discoverable

- Analytics
- Reports
- Forecasting
- AI insights

Advanced features should not interfere with everyday transaction entry.

---

# 41. UX Complexity Rules

The product should follow:

```text
High Frequency
→ Lowest Friction

Medium Frequency
→ Simple Workflow

Low Frequency
→ Discoverable Advanced UI
```

Do not put advanced financial analysis into the primary transaction flow.

---

# 42. Android-First Scope

The first production target is Android.

The application should support:

- Android phones
- Different screen sizes
- Android system back behavior
- Android notifications
- Secure local storage
- Background tasks where supported
- Android share/import flows

---

# 43. iOS Readiness

The codebase should remain compatible with future iOS builds.

Avoid Android-specific implementations unless necessary.

Platform-specific functionality should be isolated.

The architecture should use Expo-supported abstractions where possible.

---

# 44. Open Source Scope

The project should be structured for public contribution.

Repository should contain:

```text
README.md
LICENSE
CONTRIBUTING.md
CODE_OF_CONDUCT.md
SECURITY.md
CHANGELOG.md
docs/
apps/
packages/
```

Sensitive configuration must never be committed.

---

# 45. Technical Product Boundary

The initial system should use a modular monolith backend.

```text
React Native / Expo
        ↓
NestJS API
        ↓
Application Modules
        ↓
PostgreSQL
```

Supporting infrastructure may include:

```text
Redis
Background Jobs
Object Storage
Email Provider
AI Provider
```

The project should not begin with microservices.

---

# 46. Backend Module Boundary

The NestJS backend should eventually be organized approximately as:

```text
src/
├── auth/
├── users/
├── accounts/
├── transactions/
├── categories/
├── tags/
├── budgets/
├── recurring/
├── bills/
├── subscriptions/
├── lending/
├── borrowing/
├── goals/
├── analytics/
├── reports/
├── forecasting/
├── notifications/
├── files/
├── imports/
├── exports/
├── synchronization/
├── ai/
├── health/
└── common/
```

Exact boundaries will be finalized in architecture documentation.

---

# 47. Mobile Application Boundary

The mobile application should separate:

```text
UI
↓
Application State
↓
Domain Logic
↓
Local Persistence
↓
Synchronization
↓
Remote API
```

The UI should not directly contain complex financial calculations.

---

# 48. Local Data Scope

SQLite should contain the data necessary for offline functionality.

Potential local entities:

```text
User
Account
Transaction
Category
Tag
Budget
RecurringTransaction
Bill
Subscription
LendingRecord
BorrowingRecord
Repayment
Goal
Notification
AttachmentMetadata
SyncQueue
```

The exact schema is defined separately.

---

# 49. Derived Data

The system should distinguish between:

## Source Data

Examples:

- Transactions
- Accounts
- Goals
- Budgets
- Repayments

## Derived Data

Examples:

- Balance
- Savings rate
- Budget utilization
- Forecast
- Financial health score

Derived values should not become the authoritative source of truth unless there is a deliberate architectural reason.

---

# 50. Release Scope

The product should be released incrementally.

## Release 1 — Financial Foundation

```text
Onboarding
Accounts
Transactions
Categories
Tags
Transfers
Local Database
Offline Mode
Dashboard
Basic Analytics
```

## Release 2 — Financial Management

```text
Budgets
Recurring Transactions
Bills
Subscriptions
Goals
Lending
Borrowing
Repayments
Notifications
Search
Import/Export
Backup
```

## Release 3 — Advanced Intelligence

```text
Advanced Analytics
Reports
Forecasting
Anomaly Detection
Financial Health
What-If Simulation
Smart Suggestions
```

## Release 4 — AI

```text
AI Insights
AI Recommendations
AI Warnings
Natural Language Queries
AI Assistant
```

## Release 5 — Intelligent Automation

```text
Voice Input
Receipt Intelligence
Automatic Categorization
Bank Integrations
Advanced Synchronization
Multi-device Support
```

These release boundaries are strategic and may change based on implementation results.

---

# 51. Feature Dependency Map

The product has a natural dependency graph.

```text
Accounts
   ↓
Transactions
   ↓
Categories / Tags
   ↓
Analytics
   ↓
Budgets / Goals
   ↓
Forecasting
   ↓
Recommendations
   ↓
AI
```

Lending and borrowing depend on the transaction/account foundation.

Recurring finance depends on transaction and notification infrastructure.

Cloud synchronization depends on stable local data modeling.

AI depends on trustworthy analytics and financial calculations.

---

# 52. What Must Be Built Before AI

AI should not be implemented as the first major feature.

Before meaningful AI functionality exists, the product must have:

- Reliable transaction model
- Correct balances
- Stable categories
- Historical data
- Budget calculations
- Goal calculations
- Analytics
- Forecasting foundation
- Structured financial context

Otherwise the AI layer will simply generate explanations over unreliable data.

---

# 53. Out of Scope for Initial Product

The following are intentionally excluded from the initial release:

- Banking transactions directly from banks
- Stock trading
- Cryptocurrency trading
- Loan origination
- Credit scoring
- Professional financial advisory
- Tax filing
- Payment processing
- Money transfer services
- Investment execution
- Insurance management
- Corporate accounting

These may be considered independently in the future.

---

# 54. Out-of-Scope Does Not Mean Architecturally Impossible

The system should remain extensible enough that future modules can be introduced without rewriting the core financial domain.

For example:

```text
Current

Personal Finance
     ↓
Transactions

Future

Personal Finance
     ├── Transactions
     ├── Investments
     ├── Net Worth
     ├── Banking
     └── Tax
```

The project should avoid premature implementation while preserving reasonable extension points.

---

# 55. Product Boundaries

The application owns:

- Financial records
- Financial calculations
- Budgets
- Goals
- Lending/borrowing
- Analytics
- Forecasting
- Recommendations

External providers may handle:

- Email delivery
- AI inference
- Cloud storage
- Authentication providers
- Future banking integrations

External providers must not become the authoritative source of the user's financial state.

---

# 56. Data Ownership Model

The financial ledger is owned by the application.

External services are considered supporting infrastructure.

```text
Application Database
       │
       ├── Analytics
       ├── Reports
       ├── Forecasting
       └── AI Context
```

Not:

```text
AI Provider
       ↓
Financial Truth
```

---

# 57. Feature Priority Model

## P0 — Critical

Without this, the product cannot function correctly.

Examples:

- Transactions
- Accounts
- Local persistence
- Financial calculations

## P1 — Core

Required for a complete finance application.

Examples:

- Budgets
- Goals
- Lending
- Borrowing
- Reports

## P2 — Advanced

Major product differentiation.

Examples:

- Forecasting
- Anomaly detection
- Financial health
- What-if analysis

## P3 — Intelligent

Advanced AI capabilities.

Examples:

- AI insights
- AI recommendations
- AI assistant
- Voice input

## P4 — Expansion

Long-term platform capabilities.

Examples:

- Bank integration
- Shared finances
- Investment tracking
- Multi-device ecosystem

---

# 58. Definition of Done

A module is not considered complete until it satisfies:

```text
Functional
+
Validated
+
Tested
+
Secure
+
Offline-compatible where applicable
+
Responsive
+
Accessible
+
Documented
+
Observable
+
Production-ready
```

For financial modules, reconciliation with source transaction data is mandatory.

---

# 59. Scope Control

New feature proposals must be evaluated against:

1. Does it solve a real user problem?
2. Does it improve financial understanding?
3. Does it reduce user friction?
4. Does it improve financial accuracy?
5. Does it provide meaningful automation?
6. Does it justify its complexity?
7. Does it compromise privacy?
8. Does it introduce unnecessary infrastructure?
9. Can it be tested reliably?
10. Does it fit the product vision?

If the answer is mostly no, the feature should not be added simply because it is technically interesting.

---

# 60. Product Evolution Strategy

The product should evolve as:

```text
Expense Tracker
       ↓
Personal Finance Manager
       ↓
Financial Analytics Platform
       ↓
Financial Intelligence Platform
       ↓
Personal Financial Assistant
```

Each stage should retain the simplicity of the previous stage.

More capability must not automatically mean more complexity for the user.

---

# 61. Final Scope Definition

The product is a **mobile-first, offline-capable, open-source personal financial management and intelligence platform**.

Its scope covers the complete journey:

```text
Capture
   ↓
Organize
   ↓
Manage
   ↓
Plan
   ↓
Analyze
   ↓
Predict
   ↓
Understand
   ↓
Act
```

The product should provide comprehensive financial capabilities without turning everyday finance tracking into administrative work.

The highest-priority product boundary is therefore:

> **Everything necessary to make personal financial management complete, intelligent, and effortless—without adding complexity that does not create real user value.**

---

# 62. Relationship With Other Documentation

This document defines **what is inside and outside the product**.

The documentation chain is:

```text
DOCS.md
   ↓
01_PROJECT_VISION.md
   ↓
02_PRD.md
   ↓
03_PRODUCT_SCOPE.md
   ↓
04_FEATURES.md
   ↓
UX Documentation
   ↓
Architecture Documentation
   ↓
Implementation
```

The next document should convert this product scope into a detailed feature catalog.

Recommended next file:

```text
docs/04_FEATURES.md
```

`04_FEATURES.md` should document every feature individually with:

- Feature purpose
- User-facing behavior
- Functional requirements
- Business rules
- Edge cases
- Dependencies
- Priority
- Acceptance criteria
- Future extension points
