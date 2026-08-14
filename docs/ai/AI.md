# Personal Finance — AI Architecture

**Document:** `AI.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-14  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Module:** AI Platform  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Primary Database:** PostgreSQL + Prisma  
**Local Database:** SQLite  
**AI Integration:** Provider-agnostic abstraction  
**Primary Principle:** Deterministic financial truth + AI explanation and assistance

---

# 1. Purpose

The AI platform provides the intelligence layer for the Personal Finance application.

AI is intended to help users:

- understand financial patterns
- receive meaningful insights
- understand forecasts
- discover risks
- ask natural-language financial questions
- receive recommendations
- interact with financial data conversationally
- reduce the effort required to understand their finances

The core principle is:

> **AI should make financial information easier to understand and act on, but it must never become the source of financial truth.**

---

# 2. AI Philosophy

The AI experience should feel:

- useful
- contextual
- concise
- explainable
- trustworthy
- optional
- privacy-conscious

AI should not be inserted into every part of the application simply because it is available.

Use AI when it materially improves the user experience.

---

# 3. AI Responsibility Boundary

The architecture must distinguish:

## Deterministic System

Responsible for:

```text
Amounts
Balances
Transactions
Budget calculations
Goal calculations
Cash flow
Forecast inputs
Risk metrics
Report totals
```

## AI Layer

Responsible for:

```text
Explanation
Natural-language interpretation
Recommendations
Conversational interaction
Summarization
Prioritization
Contextual guidance
```

This boundary is mandatory.

---

# 4. AI Architecture

Preferred architecture:

```text
                        User
                         ↓
                  AI Application Layer
                         ↓
                  AI Orchestrator
                         ↓
              Trusted Domain / Analytics Tools
                         ↓
               Structured Financial Context
                         ↓
                    AI Provider
                         ↓
                 Structured Response
                         ↓
                    Validation
                         ↓
                        User
```

---

# 5. AI Provider Abstraction

The system must not tightly couple the application to a single model provider.

Use:

```text
AIService
   ↓
AIProvider Interface
   ├── NVIDIA NIM
   ├── OpenAI-compatible Provider
   ├── Local Model
   └── Future Provider
```

The user's current provider may be used initially, but provider switching must not require redesigning the domain modules.

---

# 6. Provider Interface

Conceptually:

```text
generate()
generateStructured()
stream()
embed()        optional future
moderate()     optional future
```

The application should depend on the abstraction rather than provider-specific SDK objects.

---

# 7. Model Selection

The system should support model selection based on task.

Examples:

```text
Small / Fast Model
→ quick classification
→ short summaries

General Model
→ insights
→ recommendations

Advanced Model
→ complex reasoning
→ assistant queries
```

The initial implementation should prefer a small number of clearly justified models.

---

# 8. Provider Configuration

Provider configuration should include:

```text
provider
model
endpoint
apiKey / secret reference
timeout
maxTokens
temperature or equivalent
```

Secrets must never be stored in the mobile application.

---

# 9. Backend-Only AI Credentials

The preferred architecture is:

```text
Mobile
  ↓
NestJS API
  ↓
AI Provider
```

The mobile application must not contain privileged AI provider credentials.

---

# 10. AI Use Cases

Initial AI capabilities:

```text
AI Insights
AI Recommendations
AI Forecast Explanation
AI Financial Assistant
AI Monthly Summary
AI Natural-Language Queries
```

Optional later:

```text
Receipt Understanding
Smart Categorization
Voice Financial Assistant
Personalized Coaching
```

---

# 11. AI Insights

AI insights explain meaningful patterns detected by deterministic analytics.

Example:

```text
Analytics:
Food spending +22%

AI:
"Food spending increased by 22% this month,
mainly because restaurant spending was higher."
```

The analytics engine identifies the fact.

AI explains it.

---

# 12. AI Recommendations

Recommendations may suggest:

```text
Reduce a category
Review a recurring expense
Increase a goal contribution
Adjust a budget
Review overdue obligations
```

Recommendations are suggestions, not commands.

---

# 13. AI Forecast Explanation

Forecasting remains deterministic/model-driven.

AI may explain:

```text
Forecast:
৳32,500

Likely range:
৳30,800–৳34,700

AI:
"Your spending is trending slightly higher than
last month, so your expected monthly expense is
likely to finish above July."
```

AI must not replace the forecast engine.

---

# 14. AI Assistant

The assistant allows users to ask:

```text
How much did I spend on food this month?

Am I likely to exceed my budget?

Who owes me money?

How much do I need to save for my laptop goal?

What changed compared with last month?
```

The assistant should answer using trusted application tools.

---

# 15. Tool-Calling Architecture

The assistant may use controlled tools such as:

```text
getAccountBalance()
getMonthlySummary()
getCategorySpending()
getBudgetStatus()
getGoalProgress()
getGoalForecast()
getOutstandingLending()
getOutstandingBorrowing()
getUpcomingBills()
getRecurringCommitments()
getSpendingTrend()
getFinancialHealth()
```

Each tool must execute through application services.

The model must never receive unrestricted database access.

---

# 16. Tool Authorization

Every AI tool request must run within:

```text
Authenticated User Context
```

The tool service must validate:

```text
user ownership
resource ownership
parameters
permissions
```

The model cannot override authorization.

---

# 17. Read-Only First

The initial assistant should primarily expose read-only tools.

Examples:

```text
Read spending
Read budgets
Read goals
Read obligations
Read forecasts
```

Write actions should be introduced separately.

---

# 18. Future Write Tools

Potential future write capabilities:

```text
createTransaction()
createBudget()
addGoalContribution()
scheduleReminder()
```

If implemented, they must follow:

```text
AI Suggestion
 ↓
User Confirmation
 ↓
Application Validation
 ↓
Write Operation
```

Never:

```text
AI
 ↓
Direct Financial Mutation
```

without explicit user approval.

---

# 19. AI Request Pipeline

Every AI request should conceptually pass through:

```text
Authenticate
 ↓
Authorize
 ↓
Detect Intent
 ↓
Select Tools / Context
 ↓
Fetch Trusted Data
 ↓
Minimize Context
 ↓
Call Model
 ↓
Validate Output
 ↓
Render
```

---

# 20. Natural-Language Query Pipeline

Example:

```text
User:
How much did I spend on restaurants this month?
```

Flow:

```text
Question
 ↓
Intent Detection
 ↓
getCategory / Merchant Spending Tool
 ↓
Trusted Result:
৳5,840
 ↓
AI Explanation
 ↓
Answer:
"You spent ৳5,840 on restaurants this month."
```

The model should not manually derive the amount.

---

# 21. Structured Context

AI should receive structured context rather than arbitrary raw database dumps.

Example:

```json
{
  "period": "2026-08",
  "currency": "BDT",
  "income": "55000.00",
  "expense": "31200.00",
  "savings": "23800.00",
  "savingsRate": 43.27,
  "budgetStatus": {
    "food": {
      "spent": "8450.00",
      "budget": "10000.00",
      "projected": "10200.00"
    }
  }
}
```

Only the required fields should be included.

---

# 22. Context Minimization

Do not send:

```text
All Transactions
All Notes
All Attachments
All People
```

unless the user's task explicitly requires them.

Prefer:

```text
Aggregated Metrics
Relevant Transactions
Relevant Period
Relevant Entities
```

---

# 23. Sensitive Data Minimization

Before AI processing, minimize:

- email addresses
- phone numbers
- full account identifiers
- unnecessary notes
- unrelated transaction data

An AI request should contain only the minimum necessary information.

---

# 24. AI Privacy Modes

Future user settings may include:

```text
AI Disabled
Local AI Only
Cloud AI Allowed
Share Aggregated Data
Share Detailed Data
```

The exact options should be refined based on implementation capability.

---

# 25. AI Data Retention

The product should explicitly define whether it stores:

```text
User Queries
AI Responses
Prompts
Tool Results
Conversation History
Provider Metadata
```

The default should favor minimizing retention of sensitive financial conversations.

---

# 26. AI Conversation Storage

If conversation history is enabled:

```text
Conversation
 ↓
Messages
```

should be user-owned and deletable.

Sensitive financial conversations must follow the application's data deletion policy.

---

# 27. AI Cache

Safe AI results may be cached using a context identity.

Example:

```text
context_hash
+
task_type
+
model_version
```

This prevents repeated calls for identical unchanged analytical context.

---

# 28. AI Cache Invalidation

Invalidate AI results when relevant source data changes.

Examples:

```text
Transaction Created
 ↓
Monthly Insight Cache Invalid
```

or:

```text
Budget Changed
 ↓
Budget Insight Invalid
```

---

# 29. AI Insight Eligibility

The deterministic system should decide whether an insight is meaningful.

Potential rules:

```text
Material Change
+
Sufficient Data
+
Not Recently Reported
+
Actionable / Useful
```

AI should not generate an insight for every tiny metric movement.

---

# 30. AI Recommendation Eligibility

A recommendation candidate may be created when:

```text
Risk detected
or
Opportunity detected
or
Meaningful change detected
```

Example:

```text
Goal forecast moved behind target
```

This becomes:

```text
Recommendation Candidate
```

then AI provides the user-facing explanation.

---

# 31. AI Output Schema

Structured AI responses should use a schema.

Example:

```json
{
  "type": "budget_risk",
  "title": "Food budget risk",
  "summary": "...",
  "reason": "...",
  "severity": "MEDIUM",
  "recommendedActions": ["Review restaurant spending"]
}
```

The exact schema belongs in the detailed AI module documents.

---

# 32. Output Validation

Validate:

```text
Schema
Type
Required Fields
Enum Values
Length
Safety Constraints
Referenced Metrics
```

Invalid responses must not be shown as trusted product output.

---

# 33. Numerical Consistency

If AI output contains financial numbers, compare them against source values where practical.

Example:

```text
Trusted:
৳8,450

AI:
৳8,450
```

If AI returns:

```text
৳8,950
```

when trusted data says:

```text
৳8,450
```

the output must be rejected, corrected, or regenerated.

---

# 34. AI Prompt Structure

Prompts should separate:

```text
System / Trusted Instructions
Application Context
Tool Results
User Content
```

User-generated content must never become system-level instructions.

---

# 35. Prompt Injection

Potential injection sources include:

```text
Transaction Notes
Merchant Names
Imported Descriptions
Receipt OCR
User Messages
External Data
```

All such content must be treated as untrusted text.

---

# 36. Tool Injection Protection

A model may produce a tool call with:

```text
user_id = another user
```

The tool layer must reject it.

The model must never control authorization context.

---

# 37. AI and Attachments

The AI system may eventually interpret receipts or documents.

Preferred pipeline:

```text
File
 ↓
OCR / Document Processor
 ↓
Structured Data
 ↓
AI
```

Raw binary files should not be sent to a model unless the selected feature explicitly requires vision input.

---

# 38. AI and Voice

Future voice assistant:

```text
Voice
 ↓
Speech Recognition
 ↓
Intent / Financial Query
 ↓
Trusted Tool
 ↓
AI Explanation
 ↓
Speech Synthesis
```

Speech recognition and speech synthesis should remain replaceable providers.

---

# 39. AI and Transaction Creation

For commands such as:

> "Add 450 taka expense for groceries."

the system should ideally:

```text
Parse Command
 ↓
Create Draft
 ↓
Show User Confirmation
 ↓
Save Transaction
```

For trusted one-tap voice workflows, explicit user opt-in is required.

---

# 40. AI Risk Controls

AI may provide:

```text
Risk explanation
```

but it must not autonomously:

```text
Move money
Change balances
Delete transactions
Send messages
Modify budgets
Cancel subscriptions
```

without explicit user-controlled workflows.

---

# 41. AI Failure Handling

If the model fails:

```text
AI Error
 ↓
Fallback
```

Potential fallback:

```text
Deterministic Insight
```

Example:

> "Your Food budget is currently 84% used."

The app remains useful without AI.

---

# 42. Provider Failure

If the AI provider is unavailable:

```text
Transaction Features → Available
Budgeting → Available
Reports → Available
Analytics → Available
Forecasting → Available
AI → Temporarily unavailable
```

AI must never become a single point of failure for core financial functionality.

---

# 43. Provider Timeouts

AI requests must have explicit timeouts.

If a request exceeds the configured threshold:

```text
Cancel / retry according to policy
```

Do not leave requests hanging indefinitely.

---

# 44. AI Rate Limiting

AI should have:

```text
Per-user rate limits
Request quotas
Cost controls
Provider limits
```

The exact quotas can differ by environment and deployment strategy.

---

# 45. AI Cost Control

Use:

- model routing
- caching
- context minimization
- token budgets
- batching where appropriate
- background generation for non-urgent insights

Do not call expensive models for trivial deterministic values.

---

# 46. AI Model Routing

Example:

```text
Simple Summary
→ Small Model

Insight Explanation
→ General Model

Complex Assistant Query
→ Advanced Model
```

The router may consider:

```text
Task Complexity
Latency Requirement
Cost
Provider Availability
```

---

# 47. AI Background Jobs

Potential asynchronous AI work:

```text
Daily Insights
Monthly Summary
Budget Risk Analysis
Goal Risk Analysis
Recurring Expense Analysis
```

Flow:

```text
Financial Event
 ↓
Insight Candidate
 ↓
Queue
 ↓
AI Worker
 ↓
Persist Insight
 ↓
Notify if eligible
```

---

# 48. AI Monthly Review

The application may produce a monthly review containing:

```text
What happened
Top changes
Budget state
Goal progress
Potential risks
Recommendations
```

This should be generated from deterministic monthly metrics.

---

# 49. AI Explainability

Every important AI statement should ideally allow:

```text
Why?
```

Example:

> "Your food spending increased."

Tap:

```text
Why?
```

Then show:

```text
August:
৳8,450

July:
৳6,900

Increase:
22.5%
```

---

# 50. AI Insight Sources

Insights should be linked to source concepts:

```text
Transaction Trend
Budget
Goal
Recurring Rule
Lending
Borrowing
Report
```

This enables drill-down.

---

# 51. AI Insight Lifecycle

Possible:

```text
GENERATED
NEW
VIEWED
DISMISSED
SAVED
EXPIRED
```

Recommendations may additionally use:

```text
ACCEPTED
```

Acceptance means the user accepted the suggestion, not that an action was executed automatically.

---

# 52. AI Recommendation Lifecycle

```text
Candidate
 ↓
Generated
 ↓
Presented
 ↓
Viewed
 ↓
Accepted / Dismissed
```

The system may later track whether accepted recommendations were actually executed.

---

# 53. AI Feedback

Users may eventually provide:

```text
Helpful
Not Helpful
Wrong
Irrelevant
```

Feedback should be stored carefully and should not expose raw sensitive financial context to analytics systems.

---

# 54. AI Evaluation

The system should evaluate:

```text
Correctness
Relevance
Usefulness
Hallucination Rate
Numerical Consistency
User Feedback
Latency
Cost
```

AI quality should be measured, not assumed.

---

# 55. AI Evaluation Dataset

Create deterministic test fixtures containing:

```text
Synthetic Users
Synthetic Transactions
Budgets
Goals
Obligations
Recurring Finance
```

Avoid using real user financial data as the default AI evaluation dataset.

---

# 56. AI Regression Testing

When changing:

```text
Prompt
Model
Provider
Tool Definitions
Context Schema
```

run a regression suite.

Check:

```text
Numerical Accuracy
Tool Selection
Safety
Response Schema
No Hallucinated Facts
```

---

# 57. Prompt Versioning

Important prompts should have versions:

```text
monthly-summary-v1
budget-risk-v2
assistant-system-v1
```

The generated AI record may retain:

```text
prompt_version
model
provider
```

for debugging and reproducibility.

---

# 58. Tool Versioning

Tool interfaces should be versioned when their semantics change.

Example:

```text
getBudgetStatus v1
```

A model should not silently receive a different tool contract with incompatible meaning.

---

# 59. AI Model Versioning

Persist:

```text
provider
model
model_version where available
generated_at
```

for persisted AI outputs.

---

# 60. AI Auditability

For sensitive operations, retain appropriate metadata:

```text
request_id
user_id reference
task_type
provider
model
prompt_version
tool_usage
result status
```

Do not store raw sensitive content unnecessarily.

---

# 61. AI Security

The AI layer must enforce:

- authentication
- authorization
- rate limits
- context minimization
- prompt injection controls
- tool authorization
- output validation
- provider isolation

---

# 62. AI Privacy

Users should be able to understand:

```text
What data is sent to AI?
Why is it sent?
Which provider receives it?
Is it stored?
Can AI be disabled?
```

These choices should not be hidden.

---

# 63. Cloud AI vs Local AI

The architecture should permit:

```text
Cloud AI
Local AI
Hybrid
```

Example:

```text
Simple insight
→ local model

Complex assistant query
→ cloud model
```

This is future-ready even if the initial implementation uses cloud AI.

---

# 64. Local AI

If a local model is available, it may process:

- simple summaries
- categorization
- short explanations
- basic query interpretation

Device resource limitations must be considered.

---

# 65. Hybrid AI Strategy

A future router may decide:

```text
Can local model handle it?
    ↓ yes
Local
    ↓ no
Cloud
```

Privacy-sensitive tasks may prefer local processing.

---

# 66. AI Architecture and Mobile

The mobile app should communicate with:

```text
AI API Layer
```

rather than provider SDKs directly where privileged credentials or secure financial context are involved.

---

# 67. AI API

Initial endpoints may include:

```text
POST /api/v1/ai/insights
POST /api/v1/ai/recommendations
POST /api/v1/ai/query
POST /api/v1/ai/chat
```

Background jobs may use:

```text
POST /api/v1/ai/insights/jobs
GET  /api/v1/ai/jobs/:id
```

---

# 68. AI Request Validation

Validate:

```text
query length
task type
resource IDs
conversation ID
supported scope
```

Do not allow unrestricted arbitrary tool requests through the API.

---

# 69. Conversation Context

AI chat history should be bounded.

Do not send the full conversation indefinitely.

Use:

```text
Recent Messages
+
Structured Relevant Context
+
Conversation Summary
```

where appropriate.

---

# 70. Conversation Summarization

Long conversations may be summarized deterministically or by a controlled model.

The summary should remain user-owned and deletable.

---

# 71. AI Memory

Persistent AI memory should be introduced carefully.

Potential categories:

```text
Preferences
Financial goals
User communication preferences
```

Do not store sensitive financial facts as permanent AI memory unless there is a clear requirement and privacy policy.

---

# 72. AI Personalization

The assistant may eventually remember:

```text
Preferred explanation length
Preferred currency
Preferred report style
```

These are safer than permanently storing raw financial history.

---

# 73. AI Notifications

AI-generated notifications must pass:

```text
Deterministic Event Eligibility
+
User Preferences
+
Deduplication
+
Privacy Rules
```

AI cannot bypass the notification engine.

---

# 74. AI + Analytics Architecture

The dependency direction should be:

```text
Analytics
      ↓
AI Context
      ↓
AI
```

Never:

```text
AI
 ↓
Analytics Truth
```

---

# 75. AI + Forecasting Architecture

The dependency direction should be:

```text
Forecast Model
      ↓
Forecast Result
      ↓
AI Explanation
```

AI does not replace the forecast model.

---

# 76. AI + Reporting Architecture

Preferred:

```text
Report Engine
      ↓
Deterministic Metrics
      ↓
AI Summary
```

This allows report accuracy to remain independent of AI availability.

---

# 77. AI + Budgeting Architecture

```text
Budget Engine
      ↓
Spent / Remaining / Projected
      ↓
Risk
      ↓
AI Explanation / Recommendation
```

---

# 78. AI + Goals Architecture

```text
Goal Engine
      ↓
Progress / Required Contribution / Forecast
      ↓
Risk
      ↓
AI Recommendation
```

---

# 79. AI + Lending/Borrowing

```text
Obligation Engine
      ↓
Outstanding / Due / Overdue
      ↓
AI Explanation / Reminder Draft
```

AI must never send a third-party reminder without explicit user-controlled authorization.

---

# 80. AI + Files

```text
File
 ↓
OCR / Extraction
 ↓
Validated Structured Data
 ↓
AI Classification / Summary
```

The original file remains authoritative.

---

# 81. AI Quality Bar

The AI platform is production-ready when:

- AI provider access is abstracted.
- Core financial calculations never depend on AI.
- AI context is minimized.
- Tool access is authorized.
- Structured outputs are validated.
- Numerical responses are checked.
- Prompt injection is addressed.
- AI keys remain server-side.
- AI failures do not break core finance features.
- Provider switching is possible.
- Models and prompts are versioned.
- AI quality is measured.
- User control and privacy are explicit.
- AI recommendations never silently perform financial actions.

---

# 82. Documentation Relationship

AI documentation should now be organized as:

```text
AI.md
  ↓
AI_INSIGHTS.md
  ↓
AI_FORECASTING.md
  ↓
AI_ASSISTANT.md
```

This document defines the **platform-level AI architecture and guardrails**.

The next AI document should define the insight engine in detail:

```text
docs/ai/AI_INSIGHTS.md
```

It should cover:

- Insight types
- Insight eligibility
- Detection rules
- Context preparation
- AI prompts
- Output schema
- Severity
- Deduplication
- Persistence
- Notifications
- Explainability
- Feedback
- Evaluation
- Acceptance criteria
