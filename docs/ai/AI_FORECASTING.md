# Personal Finance — AI Forecasting

**Document:** `AI_FORECASTING.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-14  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Module:** AI Forecasting  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Forecast Engine:** Deterministic / Statistical / ML  
**AI Layer:** Provider-agnostic  
**Primary Principle:** Forecast first, explain second

---

# 1. Purpose

The AI Forecasting module defines how the application combines quantitative forecasting with AI-powered explanation and recommendations.

The module must answer:

```text
What is likely to happen?
How confident are we?
Why does the system expect that?
What can the user do?
```

The architecture must clearly separate:

```text
Forecast Calculation
vs
AI Explanation
```

The core principle is:

> **The model produces the number; AI explains the number.**

AI must never invent or independently replace a financial forecast.

---

# 2. Product Philosophy

Forecasts should be:

- transparent
- evidence-based
- confidence-aware
- conservative where data is weak
- useful for decisions
- clearly labeled as predictions

The user should never confuse:

```text
Actual
Scheduled
Forecast
Scenario
```

---

# 3. Forecasting Domains

The system may forecast:

```text
Expenses
Income
Cash Flow
Budget Utilization
Budget Overrun
Goal Completion
Savings Capacity
Recurring Commitments
Projected Account Balance
```

Each forecast type must define its own:

```text
Inputs
Model
Evaluation
Confidence
Interpretation
```

---

# 4. Forecast Architecture

Preferred architecture:

```text
Source Data
   ↓
Data Quality Validation
   ↓
Feature Preparation
   ↓
Forecast Model
   ↓
Forecast Result
   ↓
Confidence / Prediction Range
   ↓
Deterministic Interpretation
   ↓
AI Explanation
   ↓
AI Recommendation
```

---

# 5. Forecast Engine vs AI

## Forecast Engine

Responsible for:

```text
Historical aggregation
Feature construction
Prediction
Prediction intervals
Model selection
Validation
Backtesting
```

## AI Layer

Responsible for:

```text
Explanation
Natural-language summary
Scenario explanation
Recommendation
User questions
```

---

# 6. Forecast Result Contract

A forecast result should conceptually contain:

```text
id
user_id
forecast_type
period_start
period_end
predicted_value
currency
lower_bound nullable
upper_bound nullable
confidence_score nullable
confidence_level
model_type
model_version
input_snapshot_hash
generated_at
expires_at nullable
```

---

# 7. Forecast Types

Initial forecast types:

```text
MONTHLY_EXPENSE
MONTHLY_INCOME
CASH_FLOW
BUDGET_ENDING_SPEND
GOAL_COMPLETION
ACCOUNT_BALANCE
RECURRING_COMMITMENT
```

---

# 8. Data Sufficiency

Before generating a forecast:

```text
Check Observation Count
+
Check Missing Data
+
Check Consistency
+
Check History Length
```

If the data is insufficient:

```text
INSUFFICIENT_DATA
```

must be returned.

The system must not fabricate a forecast from almost no evidence.

---

# 9. Forecast Confidence

Forecast confidence may use:

```text
Model Reliability
+
Data Quantity
+
Data Consistency
+
Recent Stability
+
Forecast Horizon
```

Suggested labels:

```text
LIMITED
MODERATE
STRONG
```

These are product-facing confidence labels, not necessarily formal statistical confidence intervals.

---

# 10. Prediction Interval

Where the selected model supports it, return:

```text
Point Forecast
Lower Bound
Upper Bound
```

Example:

```text
Projected August Expense:
৳32,500

Expected Range:
৳30,800 – ৳34,700
```

The UI must avoid presenting the point estimate as guaranteed.

---

# 11. Forecast Horizon

Forecasts may be generated for:

```text
Next 7 Days
Next 30 Days
Next 3 Months
Next 6 Months
Next 12 Months
```

The supported horizons depend on forecast type and available data.

Longer horizons should generally communicate more uncertainty.

---

# 12. Model Selection

Use a tiered strategy.

## Tier 1 — Deterministic

Use when the future is largely schedule-driven.

Examples:

```text
Known recurring rent
Known recurring subscription
```

## Tier 2 — Statistical Baseline

Examples:

```text
Moving Average
Weighted Average
Exponential Smoothing
```

## Tier 3 — Regression

Use when useful features exist.

## Tier 4 — Time-Series / ML

Use when:

```text
Sufficient data
+
Meaningful accuracy improvement
```

Do not introduce complex ML just for complexity.

---

# 13. Baseline Forecast

Every forecast type should have a transparent baseline.

Examples:

```text
Current pace
Moving average
Known scheduled commitments
```

Advanced models must beat the baseline on historical validation before becoming the default.

---

# 14. Expense Forecast

A basic expense forecast may use:

```text
Current spending
+
Expected remaining daily rate
```

Example:

```text
Spent:
৳21,700

Elapsed:
20 days

Month:
31 days

Basic Projection:
~৳33,635
```

This is easy to explain and useful as a baseline.

---

# 15. Income Forecast

Income forecasting may consider:

```text
Historical income
Recurring income
Income frequency
Trend
Known future income
```

Known salary or recurring income can receive higher confidence than irregular freelance income.

---

# 16. Cash-Flow Forecast

Conceptually:

```text
Projected Cash Flow
=
Expected Income
-
Expected Expenses
+
Expected Other Positive Effects
-
Expected Other Negative Effects
```

Scheduled events must remain distinguishable from confirmed transactions.

---

# 17. Account Balance Forecast

For an account:

```text
Projected Balance
=
Current Balance
+
Expected Inflows
-
Expected Outflows
```

Future transfers should not be counted as external income or expense.

---

# 18. Budget Forecast

The budgeting module may request:

```text
Projected End-of-Period Spending
```

Example:

```text
Budget:
৳10,000

Spent:
৳8,400

Projected:
৳10,700

Forecast Status:
LIKELY_OVER_BUDGET
```

---

# 19. Goal Forecast

Goal forecasting may calculate:

```text
Estimated Completion Date
```

from:

```text
Current Progress
+
Contribution Rate
+
Target
```

See `FINANCIAL_GOALS.md` for domain rules.

---

# 20. Recurring Commitment Forecast

Known recurring events can provide a high-confidence scheduled baseline.

Example:

```text
Rent:
৳15,000

Internet:
৳1,000

Subscription:
৳1,500
```

The system can calculate:

```text
Expected Monthly Commitments:
৳17,500
```

This is scheduled data, not a probabilistic forecast.

---

# 21. Forecast Data Quality

Data quality states:

```text
STRONG
GOOD
LIMITED
INSUFFICIENT
```

Potential indicators:

```text
History length
Observation count
Missing periods
Variance
Recent changes
```

---

# 22. Sparse Data

Example:

```text
History:
5 days
```

The system may provide:

```text
Current-period summary
Simple pace estimate
```

but should not generate an advanced long-term model with high confidence.

---

# 23. Missing Data

Never interpret:

```text
No recorded transactions
```

as:

```text
Zero spending
```

unless the data model explicitly establishes that the period was tracked and had zero activity.

This distinction is critical.

---

# 24. Outlier Handling

Outliers should not be silently removed from the user's financial data.

The forecasting model may use robust methods such as:

```text
Median
MAD
Winsorization where justified
Robust regression
```

while preserving the source transaction unchanged.

---

# 25. One-Time Events

Large one-time events may distort forecasts.

Examples:

```text
Medical expense
Travel
Laptop purchase
Emergency payment
```

The model may classify them as:

```text
Recurring
One-Time
Unknown
```

where classification confidence is sufficient.

---

# 26. Recurring vs One-Time

Forecasting should distinguish:

```text
Known recurring expense
+
Observed variable spending
+
One-time historical event
```

This improves future estimates.

---

# 27. Seasonality

With enough history, the model may account for:

```text
Weekly Seasonality
Monthly Seasonality
Annual Seasonality
```

Seasonality must not be inferred from insufficient observations.

---

# 28. Known Future Events

Known future events may be added to forecast context:

```text
Upcoming Bill
Recurring Salary
Goal Contribution
Scheduled Transfer
Expected Repayment
```

They must be labeled:

```text
Scheduled
```

not:

```text
Confirmed Actual
```

---

# 29. Expected Lending Repayments

A future lending repayment may influence cash-flow scenarios.

However:

```text
Expected repayment
≠
Guaranteed cash
```

Overdue or historically unreliable repayments should receive lower confidence.

---

# 30. Expected Borrowing Repayments

Borrowing obligations represent expected outflows.

A forecast may include:

```text
Expected repayment
```

but should preserve uncertainty when the repayment date or amount is not certain.

---

# 31. Forecast Scenario

The forecasting system should support scenarios:

```text
BASELINE
OPTIMISTIC
CONSERVATIVE
CUSTOM
```

The initial implementation may expose only:

```text
Baseline
What-If
```

to keep UX simple.

---

# 32. What-If Forecasting

Example:

```text
Current projected expense:
৳34,000

Scenario:
Reduce Food spending by ৳2,000/month

New projected expense:
৳32,000
```

Scenario calculations must not mutate real financial records.

---

# 33. Scenario Variables

Possible variables:

```text
Income Change
Category Spending Change
Recurring Expense Change
Monthly Saving Change
Goal Contribution Change
Target Date
One-Time Expense
```

---

# 34. Scenario Architecture

```text
Real Financial Snapshot
        ↓
Scenario Parameters
        ↓
Forecast Engine
        ↓
Scenario Forecast
        ↓
Comparison
```

---

# 35. Scenario Comparison

The UI should show:

```text
Current Plan
vs
Scenario
```

Example:

```text
Goal Completion

Current:
December

Scenario:
October

Difference:
2 months earlier
```

---

# 36. AI Explanation of Forecasts

AI receives:

```text
Forecast Result
+
Historical Context
+
Confidence
+
Key Drivers
```

and produces an explanation.

Example:

> "Your August spending is projected to finish around ৳32,500, slightly above July. The estimate has moderate confidence because your recent spending has been fairly consistent."

---

# 37. AI Must Not Recalculate

The model should not be asked:

> "Calculate the forecast."

Instead:

```text
Forecast Engine:
৳32,500

AI:
Explain this forecast.
```

This significantly reduces numerical hallucination.

---

# 38. AI Forecast Prompt Contract

AI context should contain:

```text
forecastType
forecastValue
lowerBound
upperBound
confidence
historicalTrend
keyDrivers
period
currency
```

Optional:

```text
comparison
budget
goal
recurringCommitments
```

Only when relevant.

---

# 39. AI Numerical Validation

If AI returns:

```text
৳33,500
```

but forecast engine says:

```text
৳32,500
```

the response should be considered invalid.

Possible action:

```text
Regenerate
Correct
Fallback to deterministic text
```

---

# 40. AI Forecast Summary

Default format:

```text
Forecast
What it means
Why
Confidence
```

Example:

```text
Projected:
৳32,500

What it means:
You may finish slightly above last month.

Why:
Recent daily spending is higher.

Confidence:
Moderate
```

---

# 41. AI Recommendations

AI may suggest:

```text
Review a category
Reduce discretionary spending
Increase goal contribution
Move target date
```

Recommendations should reference the actual forecast and relevant metrics.

---

# 42. Recommendation Guardrails

AI must not:

```text
Move money
Create transactions
Change budgets
Change goals
Cancel subscriptions
Send emails
```

without an explicit user-controlled action.

---

# 43. Forecast Risk

Forecasting may identify:

```text
LIKELY_UNDER_BUDGET
LIKELY_ON_TARGET
LIKELY_OVER_BUDGET
LIKELY_GOAL_DELAY
POTENTIAL_LOW_BALANCE
```

The exact risk semantics must be defined by the consuming domain.

---

# 44. Forecast Drivers

Every forecast should identify key drivers where possible.

Example:

```text
Main Drivers

Food:
+৳1,550

Transport:
+৳600

Recurring:
+৳1,000
```

This makes the forecast actionable.

---

# 45. Driver Ranking

Drivers should be ranked by:

```text
Absolute Impact
+
Contribution to Forecast Change
```

Not just percentage.

---

# 46. Forecast Explanation UX

Recommended:

```text
August Spending Forecast

৳32,500

Expected Range
৳30,800–৳34,700

Confidence
Moderate

Why?
• Recent spending is slightly higher.
• Food spending increased.
• Rent remains stable.

[View Details]
```

---

# 47. Forecast Drill-Down

Users should be able to inspect:

```text
Forecast
 ↓
Drivers
 ↓
Metrics
 ↓
Transactions
```

This is essential for trust.

---

# 48. Forecast Freshness

Display where useful:

```text
Updated 5 minutes ago
```

The forecast result should store:

```text
generated_at
```

---

# 49. Forecast Expiration

Forecasts can become stale.

Possible expiration rules:

```text
After material financial change
or
After defined time interval
```

The next screen visit can trigger recalculation or background refresh.

---

# 50. Forecast Cache

Cache key may contain:

```text
user_id
forecast_type
period
filters
model_version
input_snapshot_hash
```

The same input should not trigger unnecessary model execution.

---

# 51. Forecast Invalidation

Invalidate/recalculate after relevant changes:

```text
Transaction Created
Transaction Edited
Transaction Deleted
Budget Changed
Goal Changed
Recurring Rule Changed
Lending Status Changed
Borrowing Status Changed
```

Heavy recomputation may happen asynchronously.

---

# 52. Forecast Background Jobs

Potential jobs:

```text
generate_expense_forecast
generate_cashflow_forecast
generate_goal_forecast
generate_budget_forecast
```

Jobs should be idempotent.

---

# 53. Forecast Job Identity

A stable identity may include:

```text
user
forecast_type
period
input_snapshot_hash
model_version
```

This prevents duplicate jobs.

---

# 54. Forecast Evaluation

Before adopting a model as default:

```text
Train / Fit
 ↓
Backtest
 ↓
Compare With Baseline
 ↓
Measure Error
 ↓
Review Stability
 ↓
Deploy
```

---

# 55. Model Evaluation Metrics

Possible:

```text
MAE
RMSE
MAPE
sMAPE
Prediction Interval Coverage
```

Metric selection depends on forecast behavior.

For values near zero, avoid relying blindly on MAPE.

---

# 56. Backtesting

Historical simulation:

```text
Use data until period T
Forecast T+1
Compare with actual
Repeat
```

This provides realistic performance estimates.

---

# 57. Baseline Comparison

Every advanced model should be compared against:

```text
Naive Last-Period
Moving Average
Weighted Average
```

If an advanced model does not produce meaningful improvement, prefer the simpler model.

---

# 58. Model Drift

Forecast behavior may change as user financial habits change.

The system should monitor:

```text
Forecast Error
Data Distribution
User Behavior
```

If performance deteriorates:

```text
Re-evaluate Model
or
Fallback to Baseline
```

---

# 59. Model Fallback

If an advanced model fails:

```text
Advanced Model
 ↓ failure
Baseline Model
 ↓
Forecast Result
```

The user should still receive a valid forecast if possible.

---

# 60. AI Fallback

If AI explanation fails:

```text
Forecast Engine
 ↓
Deterministic Explanation
```

Example:

> "Projected spending is ৳32,500 based on your recent spending pace."

The feature remains usable.

---

# 61. Local Forecasting

The mobile application may run:

```text
Pace-based Forecast
Moving Average
Weighted Average
Simple Regression
```

offline.

Advanced models may remain backend-only.

---

# 62. Python Forecasting Service

Introduce a Python service only for meaningful ML complexity.

Potential responsibilities:

```text
Advanced Time-Series Forecasting
Model Training
Backtesting
Anomaly / Specialized ML
```

Architecture:

```text
NestJS
 ↓
Forecasting Service Interface
 ↓
Python ML Service
 ↓
Model
```

---

# 63. Model Registry

If multiple production models are used, maintain model metadata:

```text
model_name
version
training_data_version
feature_schema_version
created_at
evaluation_metrics
status
```

Possible statuses:

```text
CANDIDATE
ACTIVE
DEPRECATED
RETIRED
```

---

# 64. Feature Versioning

Forecast inputs should be versioned.

Example:

```text
feature_schema = v2
```

This helps reproduce historical predictions.

---

# 65. Forecast Reproducibility

A forecast should be reproducible from:

```text
Input Snapshot
+
Feature Version
+
Model Version
+
Forecast Parameters
```

---

# 66. Forecast Privacy

ML and AI processing should minimize:

- unrelated transaction data
- third-party personal information
- full notes
- unnecessary merchant details

Only relevant features should be processed.

---

# 67. AI Provider Privacy

If the AI provider is external:

```text
Structured Forecast Context
```

should be preferred over:

```text
Raw Transaction History
```

unless the specific task requires raw evidence.

---

# 68. Forecast Security

Every forecast request must verify:

```text
Authenticated User
+
Owned Resources
+
Valid Period
+
Valid Filters
```

Forecast IDs must not bypass authorization.

---

# 69. Forecast API

Relevant endpoints:

```text
GET /api/v1/forecasting/expenses
GET /api/v1/forecasting/income
GET /api/v1/forecasting/cash-flow
GET /api/v1/forecasting/budgets/:budgetId
GET /api/v1/forecasting/goals/:goalId
GET /api/v1/forecasting/accounts/:accountId

POST /api/v1/analytics/simulations
```

AI explanation can be exposed separately:

```text
POST /api/v1/ai/forecast-explanations
```

or handled internally by the AI service.

---

# 70. Forecast Response

Example:

```json
{
  "data": {
    "forecastType": "MONTHLY_EXPENSE",
    "period": "2026-08",
    "predictedValue": "32500.00",
    "currency": "BDT",
    "lowerBound": "30800.00",
    "upperBound": "34700.00",
    "confidenceLevel": "MODERATE",
    "modelType": "WEIGHTED_AVERAGE",
    "modelVersion": "v2"
  }
}
```

---

# 71. Forecast Error Response

If data is insufficient:

```json
{
  "data": {
    "status": "INSUFFICIENT_DATA",
    "reason": "Not enough historical observations."
  }
}
```

This is preferable to returning a low-quality fabricated prediction.

---

# 72. Forecast Acceptance Criteria

The module is complete when:

- Forecast types are clearly defined.
- Deterministic forecast logic exists.
- Advanced models are optional.
- Data sufficiency is validated.
- Confidence is communicated.
- Prediction intervals are supported where appropriate.
- Actual/scheduled/forecast states remain distinct.
- Baseline models exist.
- Advanced models are backtested against baselines.
- Model versions are tracked.
- Forecasts are reproducible.
- Forecasts can fall back safely.
- AI explanations use trusted forecast outputs.
- AI numerical claims are validated.
- AI failures do not break forecasting.
- What-if scenarios do not mutate real data.
- Local/basic forecasting can work offline where supported.
- Security and privacy controls are enforced.
- Critical calculations and model behavior are tested.

---

# 73. Testing Matrix

## Deterministic Tests

- pace forecast
- moving average
- weighted average
- budget projection
- goal completion
- account balance projection

## Model Tests

- backtesting
- MAE/RMSE
- interval coverage
- insufficient data
- outlier handling
- seasonality

## Integration Tests

- transaction → forecast invalidation
- recurring event → forecast input
- budget → forecast
- goal → forecast
- AI explanation

## E2E Tests

```text
Record Expenses
→ Open Forecast
→ View Prediction
→ Inspect Drivers
→ Ask AI Why
→ Run What-If
```

---

# 74. Final Quality Bar

The forecasting system should feel:

```text
Useful
Honest
Understandable
Evidence-Based
Predictive Without Pretending to Know the Future
```

The desired user experience is:

> **"The app gives me its best estimate, shows me how uncertain that estimate is, explains what is driving it, and lets me explore what could change the outcome."**

---

# 75. Relationship With Other AI Documents

AI documentation sequence:

```text
AI.md
   ↓
AI_INSIGHTS.md
   ↓
AI_FORECASTING.md
   ↓
AI_ASSISTANT.md
```

This document defines **forecast-specific numerical and AI explanation behavior**.

The next AI document is:

```text
docs/ai/AI_ASSISTANT.md
```

It should define:

- Conversational architecture
- Natural-language intent detection
- Tool calling
- Read/write permissions
- Conversation state
- Context management
- Financial queries
- Voice integration
- Confirmation flows
- Prompt injection defense
- AI memory
- Safety
- Streaming
- Rate limits
- Error handling
- Evaluation
- Acceptance criteria
