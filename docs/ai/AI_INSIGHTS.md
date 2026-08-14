# Personal Finance — AI Insights

**Document:** `AI_INSIGHTS.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-14  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Module:** AI Insights  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**AI Platform:** Provider-agnostic  
**Analytics Source:** Deterministic Analytics Engine

---

# 1. Purpose

The AI Insights module converts meaningful financial patterns into concise, understandable, actionable insights.

The module should help the user notice things such as:

```text
Spending increased
Budget is at risk
Goal is falling behind
Recurring commitments increased
Unusual transaction detected
Savings rate changed
Borrowing burden increased
Lending repayment is overdue
```

The core principle is:

> **The analytics engine detects the fact; AI explains why it matters and what the user may consider doing.**

---

# 2. Insight Philosophy

Insights must be:

- meaningful
- explainable
- personalized
- concise
- timely
- actionable
- non-judgmental
- confidence-aware

The system must not generate insights merely because it can.

A user should receive a small number of high-value observations rather than a continuous stream of trivial AI commentary.

---

# 3. Source of Truth

Insight generation always begins from trusted financial data:

```text
Transactions
Accounts
Budgets
Goals
Lending
Borrowing
Recurring Finance
Analytics
Forecasting
```

AI-generated text is never the source of the financial fact.

---

# 4. Insight Architecture

Preferred flow:

```text
Financial Data
      ↓
Deterministic Analytics
      ↓
Insight Candidate Detection
      ↓
Eligibility Filtering
      ↓
Structured Context
      ↓
AI Explanation
      ↓
Output Validation
      ↓
Persist Insight
      ↓
Optional Notification
```

---

# 5. Insight Candidate vs AI Insight

These are separate concepts.

## Insight Candidate

A deterministic system-detected pattern.

Example:

```text
Food spending increased 22%.
```

## AI Insight

A user-facing explanation:

> "Food spending increased 22% this month, mainly because restaurant spending rose."

This separation is fundamental.

---

# 6. Insight Types

Initial insight types:

```text
SPENDING_INCREASE
SPENDING_DECREASE
CATEGORY_SPIKE
BUDGET_RISK
BUDGET_EXCEEDED
GOAL_AT_RISK
GOAL_AHEAD
GOAL_COMPLETED
SAVINGS_CHANGE
CASH_FLOW_CHANGE
RECURRING_COST_INCREASE
UNUSUAL_TRANSACTION
LENDING_OVERDUE
BORROWING_OVERDUE
BORROWING_BURDEN
SUBSCRIPTION_GROWTH
MONTHLY_REVIEW
```

Future types may include:

```text
INCOME_CHANGE
LIQUIDITY_RISK
MERCHANT_CONCENTRATION
SEASONAL_PATTERN
REPEATED_BEHAVIOR
```

---

# 7. Insight Severity

Suggested severity:

```text
INFO
LOW
MEDIUM
HIGH
CRITICAL
```

Most financial insights should be:

```text
INFO
LOW
MEDIUM
```

High and critical should be reserved for genuinely important situations.

---

# 8. Severity Principles

Severity should consider:

```text
Financial Impact
+
Confidence
+
Urgency
+
User-Relevance
```

A large but uncertain anomaly should not automatically become `CRITICAL`.

---

# 9. Insight Eligibility

An insight candidate should pass:

```text
Materiality
+
Sufficient Data
+
Confidence
+
Novelty
+
User Preference
+
No Recent Duplicate
```

Only then should AI generation be considered.

---

# 10. Materiality

Materiality should consider both:

```text
Absolute Impact
```

and:

```text
Relative Change
```

Example:

```text
৳100 → ৳300
```

is +200%, but the absolute change is only:

```text
৳200
```

while:

```text
৳10,000 → ৳11,500
```

is +15% but has:

```text
৳1,500
```

of impact.

Insight ranking must account for both.

---

# 11. Insight Confidence

Each candidate should have an analytical confidence level:

```text
STRONG
GOOD
LIMITED
INSUFFICIENT
```

Example:

```text
Only 2 weeks of history
→ LIMITED

12 months of consistent history
→ STRONG
```

Insights should not overstate patterns from sparse data.

---

# 12. Insight Novelty

The system should avoid repeatedly presenting the same insight.

An identity may use:

```text
insight_type
entity_id
period
context_hash
```

Example:

```text
BUDGET_RISK
budget-123
2026-08
hash-abc
```

---

# 13. Insight Deduplication

Suppose:

```text
Food spending +22%
```

is detected three times because of:

- app refresh
- background worker
- sync completion

The user should receive one logical insight.

---

# 14. Insight Lifecycle

Possible states:

```text
GENERATED
NEW
VIEWED
SAVED
DISMISSED
EXPIRED
```

The initial implementation may use fewer states if the UI does not require all of them.

---

# 15. Insight Persistence

Persisted insight records should contain:

```text
id
user_id
type
title
summary
severity
context_hash
generated_at
expires_at nullable
status
model
prompt_version
created_at
updated_at
```

The exact database schema belongs to `DATABASE.md`.

---

# 16. Insight Detail

An insight should contain:

```text
Title
Summary
Why It Matters
Supporting Metrics
Recommended Action
```

Not every insight requires all sections.

---

# 17. Example — Spending Increase

Candidate:

```text
Food spending:
+22%
```

AI output:

```text
Title:
Food spending increased

Summary:
You spent 22% more on food this month.

Why it matters:
Food is now one of your largest monthly categories.

Possible action:
Review restaurant spending before the month ends.
```

The underlying numbers must come from trusted analytics.

---

# 18. Example — Budget Risk

Candidate:

```text
Food budget:
84.5% used

Projected:
৳10,200

Budget:
৳10,000
```

AI output:

> "Your food budget is trending slightly above its limit. Restaurant spending is the main contributor."

---

# 19. Example — Goal Risk

Candidate:

```text
Required:
৳10,000/month

Observed:
৳6,000/month
```

AI output:

> "At your current contribution pace, your Laptop goal may fall behind the December target."

---

# 20. Example — Savings Change

Candidate:

```text
Savings Rate
July: 37%
August: 43%
```

AI output:

> "Your savings rate improved by about 6 percentage points this month, mainly because expenses grew more slowly than income."

---

# 21. Example — Unusual Transaction

Candidate:

```text
Transaction:
৳8,500

Historical category median:
৳1,900
```

AI output:

> "This purchase is significantly larger than your usual electronics spending."

The system must never state:

> "This is fraudulent."

unless a separate validated fraud-detection system exists.

---

# 22. Example — Lending Overdue

Candidate:

```text
Person:
Rahim

Outstanding:
৳6,000

Days overdue:
7
```

AI output:

> "Rahim's ৳6,000 repayment is now 7 days overdue."

The system may optionally suggest:

> "You could send a polite reminder."

---

# 23. Example — Borrowing Burden

Candidate:

```text
Outstanding borrowing:
৳25,000

Previous:
৳14,000
```

AI output:

> "Your outstanding borrowing has increased significantly compared with last month."

The insight should remain descriptive rather than judgmental.

---

# 24. Monthly Review Insight

A monthly review may combine multiple deterministic findings:

```text
Income
Expense
Savings
Budget
Goals
Recurring
Obligations
```

AI can summarize:

```text
What changed
What mattered most
What needs attention
```

---

# 25. Monthly Review Eligibility

A monthly review should be generated:

```text
At most once per completed reporting period
```

unless the user explicitly asks to regenerate it.

---

# 26. Insight Ranking

If multiple insights exist, rank by:

```text
Severity
+
Materiality
+
Confidence
+
Actionability
+
Novelty
```

The home screen should show only a small number of top insights.

---

# 27. Insight Home UX

Recommended:

```text
Insights

Food spending is up 22%
Medium

Your Laptop goal may fall behind
Medium

You saved more this month
Low

[View All]
```

---

# 28. Insight Detail UX

Recommended:

```text
Food spending increased

+22%

৳8,450 this month
vs
৳6,900 last month

Main driver:
Restaurant spending

Why it matters:
...

Suggested:
Review restaurant spending

[View Transactions]
```

The user should be able to inspect supporting evidence.

---

# 29. Supporting Data

Every important insight should provide:

```text
Current Value
Previous Value
Change
Relevant Period
Relevant Category / Entity
```

This creates explainability.

---

# 30. Drill-Down

Possible navigation:

```text
Insight
 ↓
Budget
 ↓
Transactions
```

or:

```text
Insight
 ↓
Goal
 ↓
Contribution History
```

or:

```text
Insight
 ↓
Lending Record
 ↓
Reminder
```

---

# 31. AI Context Preparation

The AI layer should receive structured insight context.

Example:

```json
{
  "type": "SPENDING_INCREASE",
  "category": "Food",
  "current": "8450.00",
  "previous": "6900.00",
  "changePercent": 22.46,
  "budget": "10000.00",
  "projected": "10200.00",
  "currency": "BDT"
}
```

---

# 32. Context Minimization

Do not send all transactions if the candidate can be explained from:

```text
Current Total
Previous Total
Trend
Budget
Top Contributor
```

Only include transaction-level data when necessary for the explanation.

---

# 33. Prompt Structure

A typical insight prompt should conceptually contain:

```text
Trusted System Instructions
+
Insight Type
+
Structured Metrics
+
Relevant Supporting Context
+
User Preference
```

User-generated financial text remains untrusted content.

---

# 34. AI Instructions

The AI should be instructed to:

```text
Use only supplied facts.
Do not invent numbers.
Do not invent causes.
Be concise.
Use cautious language for predictions.
Avoid judgmental wording.
Suggest actions only when useful.
```

---

# 35. Numerical Validation

If the AI returns a numerical statement:

```text
AI:
Food spending increased 25%.
```

while trusted analytics says:

```text
22.46%
```

the system must reject or correct the output.

---

# 36. Output Schema

A structured insight response may contain:

```json
{
  "title": "...",
  "summary": "...",
  "whyItMatters": "...",
  "recommendedAction": "...",
  "severity": "MEDIUM"
}
```

Optional:

```text
supportingPoints
confidence
```

The final severity should remain under application policy control.

---

# 37. AI Cannot Choose Final Severity Blindly

The AI may suggest:

```text
severity = MEDIUM
```

but the application should apply deterministic policy to the final severity.

For example:

```text
Security event
→ Application-defined HIGH

AI cannot downgrade it.
```

---

# 38. Insight Expiration

Insights may become stale.

Examples:

```text
Budget At Risk
 ↓
Budget period ends
 ↓
Insight expires
```

```text
Goal At Risk
 ↓
Goal completed
 ↓
Old insight expires
```

---

# 39. Insight Refresh

An insight may be regenerated when:

- underlying metrics materially change
- insight expires
- user explicitly requests refresh
- model version changes where required

---

# 40. Insight Notification

Only selected insights should become notifications.

Pipeline:

```text
Insight Generated
 ↓
Notification Eligibility
 ↓
User Preferences
 ↓
Deduplication
 ↓
Notification
```

Most insights should remain in the in-app Insights surface.

---

# 41. Insight Notification Examples

Potential notifications:

```text
Budget projected overrun
Goal significantly at risk
Unusual high-value transaction
Important security event
```

Do not notify for every low-priority observation.

---

# 42. Insight Preferences

The user may configure:

```text
Insights Enabled
Budget Insights
Goal Insights
Spending Insights
AI Insights
Unusual Spending
```

The initial UX should keep preference controls understandable.

---

# 43. Insight Frequency

The system should avoid generating too many insights in a short period.

Possible policy:

```text
Home:
Top 3

Notification:
Only material insights

Full history:
All eligible generated insights
```

Exact limits should be configurable.

---

# 44. Insight Suppression

An insight may be suppressed when:

```text
User recently dismissed same insight type
Same issue already explained
Underlying value is too small
Confidence too low
```

Suppression should not prevent security-critical events.

---

# 45. Dismissal Feedback

When the user dismisses:

```text
Not useful
```

the system may record:

```text
insight_type
dismissed_at
```

This may later improve ranking.

Do not use dismissal to silently modify financial calculations.

---

# 46. Helpful / Not Helpful

Users may rate:

```text
Helpful
Not Helpful
Incorrect
Irrelevant
```

`Incorrect` should be especially important for model evaluation.

---

# 47. Incorrect Insight Flow

If user marks an insight as incorrect:

```text
Insight
 ↓
User Feedback
 ↓
Store Evaluation Metadata
 ↓
Do Not Reuse Untrusted Explanation
```

The system should not necessarily delete the underlying deterministic event.

---

# 48. Insight Safety

AI insights must never:

- claim fraud without evidence
- shame the user
- expose another person's private information
- disclose unnecessary account identifiers
- fabricate future certainty
- perform financial actions automatically

---

# 49. Insight Language

Use wording such as:

```text
may
appears
is trending
is projected
at the current pace
```

when discussing predictions.

Use definite wording only for verified facts:

```text
You spent ৳8,450.
```

---

# 50. Financial Advice Boundary

AI insights are product-generated educational/personalized guidance.

Avoid presenting them as professional financial, legal, tax, or investment advice.

Where advanced financial domains are introduced, additional safety and compliance review is required.

---

# 51. Insight and Forecasting

Forecast insights depend on:

```text
Forecast Engine
 ↓
Forecast Result
 ↓
Insight Candidate
 ↓
AI Explanation
```

Example:

```text
Projected spending:
৳34,000

Budget:
৳30,000
```

AI explains the significance.

---

# 52. Insight and Budgeting

Budget candidates may include:

```text
Threshold crossed
Forecast overrun
Persistent overspending
Improvement
```

The budgeting engine owns the calculations.

---

# 53. Insight and Goals

Goal candidates:

```text
Ahead
At Risk
Behind
Milestone
Completed
Contribution inconsistency
```

The goal engine owns the calculations.

---

# 54. Insight and Lending/Borrowing

Candidates:

```text
Overdue
Increasing liabilities
Large outstanding receivables
Repayment pattern change
```

The lending/borrowing domain owns the facts.

---

# 55. Insight and Recurring Finance

Candidates:

```text
Recurring cost increased
Recurring commitments growing
Unusually expensive recurring item
Upcoming commitment pressure
```

The recurring domain provides source data.

---

# 56. Insight and Reports

Monthly reports can include a small set of prioritized AI insights.

Example:

```text
August Review

3 Things to Notice

1. Food spending increased 22%.
2. Savings rate improved to 43%.
3. One goal is projected to finish late.
```

---

# 57. Insight and Analytics

Analytics generates candidate signals.

Example:

```text
Category:
Food

Current:
৳8,450

Previous:
৳6,900

Signal:
Meaningful Increase
```

AI then produces language.

---

# 58. Insight and Notifications

Notifications should use the same logical insight identity to avoid duplicates.

Example:

```text
insight_id = INS-123
```

Notification:

```text
notification.insight_id = INS-123
```

---

# 59. Insight and Sync

Insights generally should not be treated as primary financial source records.

Two valid approaches:

## Recompute Per Device

Sync source data, then each device generates insights.

## Server-Generated Insight

Server generates and synchronizes the insight.

The initial architecture may prefer server generation for consistent cross-device experience while allowing local deterministic fallback.

---

# 60. Local AI Insight Fallback

When offline, the mobile app may show:

```text
Deterministic Insight
```

Example:

> "You've used 84% of your Food budget."

Full AI wording may be unavailable.

This is acceptable.

---

# 61. Insight Data Freshness

Each insight should know:

```text
source_period
generated_at
source_snapshot_hash
```

This makes stale insight detection easier.

---

# 62. Insight Model Versioning

Persist:

```text
model
prompt_version
calculation_version
```

where useful.

This supports debugging when AI behavior changes.

---

# 63. Insight Cost Control

Avoid generating AI for:

```text
Every transaction
Every percentage change
Every screen open
```

Prefer:

```text
Meaningful candidate
+
Batch generation
+
Caching
```

---

# 64. Background Insight Generation

Recommended for periodic insights:

```text
Daily / Monthly Schedule
 ↓
Compute Candidates
 ↓
Filter
 ↓
Queue AI Jobs
 ↓
Generate
 ↓
Persist
```

---

# 65. Insight Job Idempotency

Jobs must use stable identities.

Example:

```text
INSIGHT:{type}:{entity}:{period}:{contextHash}
```

Retries should not create duplicate insights.

---

# 66. Insight Quality Evaluation

Measure:

```text
Correctness
Relevance
Helpfulness
Dismissal Rate
Incorrect Rate
Notification Open Rate
Latency
Cost
```

---

# 67. AI Insight Evaluation Dataset

Use synthetic deterministic financial scenarios:

```text
Normal Month
Budget Overrun
Goal Risk
Savings Improvement
Unusual Transaction
Recurring Growth
Overdue Lending
```

Expected facts should be known beforehand.

---

# 68. Insight Evaluation

For each scenario:

```text
Candidate Detected?
Facts Correct?
AI Summary Accurate?
Numbers Correct?
Recommendation Appropriate?
Severity Appropriate?
No Hallucination?
```

---

# 69. Regression Testing

Whenever changing:

```text
Model
Prompt
Provider
Context Schema
Candidate Rules
```

run the full insight regression suite.

---

# 70. Performance

Insight generation must not block the transaction flow.

Preferred:

```text
Transaction Saved
 ↓
App Continues
 ↓
Insight Candidate Generated Asynchronously
```

---

# 71. Insight Storage

Persist only meaningful insights.

Temporary candidate signals may remain in memory or short-lived queues.

Do not fill the database with every trivial analytical event.

---

# 72. Insight Cleanup

Expired insights should have a retention policy.

Example:

```text
Old low-value insights:
purge after defined period

Important/security insights:
retain longer
```

The exact retention policy must align with overall data retention.

---

# 73. Insight Security

Every insight request must be scoped to the current user.

An insight must never be generated from:

```text
another user's transactions
```

or cross-user aggregate information.

---

# 74. Insight Privacy

AI insights should avoid exposing unnecessary:

- phone numbers
- emails
- full account numbers
- third-party details
- notes

Only relevant context should be surfaced.

---

# 75. Acceptance Criteria

The AI Insights module is complete when:

- Candidate detection is deterministic.
- Insight eligibility is defined.
- Materiality is considered.
- Data sufficiency is considered.
- AI receives structured minimal context.
- AI output is schema-validated.
- Numerical claims are checked where practical.
- Severity is controlled by application rules.
- Duplicate insights are prevented.
- Stale insights expire.
- Users can view supporting data.
- Users can dismiss/rate insights.
- Notifications use selected high-value insights only.
- AI failure does not break analytics.
- Offline fallback exists.
- Model/prompt/calculation versions are traceable.
- Security and privacy rules are enforced.
- Insight quality is automatically tested.

---

# 76. Testing Matrix

## Unit Tests

Test:

- candidate detection
- materiality
- confidence
- ranking
- deduplication
- expiration
- suppression
- severity policy

## Integration Tests

Test:

- analytics → candidate
- candidate → AI
- AI → validation
- insight persistence
- notification creation
- feedback

## E2E Tests

```text
Create Spending Pattern
→ Candidate Detected
→ Insight Generated
→ Open Insight
→ View Supporting Data
→ Dismiss
```

---

# 77. Final Quality Bar

The Insight engine should feel:

```text
Smart
Relevant
Calm
Trustworthy
Explainable
Personal
```

The user should feel:

> **"The app noticed something meaningful about my finances and explained it without pretending to know more than the data supports."**

---

# 78. Relationship With Other AI Documents

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

This document defines the **AI-powered insight generation system**.

The next document is:

```text
docs/ai/AI_FORECASTING.md
```

It should define:

- Forecast-specific AI responsibilities
- Model orchestration
- deterministic forecast inputs
- forecast explanation
- confidence communication
- scenario analysis
- regression / time-series integration
- AI recommendations
- model evaluation
- hallucination controls
- acceptance criteria
