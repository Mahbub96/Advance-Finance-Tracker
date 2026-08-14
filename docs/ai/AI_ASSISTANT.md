# Personal Finance — AI Assistant

**Document:** `AI_ASSISTANT.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-14  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Module:** AI Financial Assistant  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**AI Platform:** Provider-agnostic  
**Primary Principle:** Trusted tools, explicit permissions, user-controlled actions

---

# 1. Purpose

The AI Assistant provides a conversational interface over the user's financial data.

The assistant should allow natural-language questions and eventually natural-language financial actions.

Examples:

```text
How much did I spend on food this month?

Am I going over budget?

Who owes me money?

When will I reach my laptop goal?

Why did my expenses increase this month?

What bills are coming up?

How much can I safely save this month?
```

The assistant should make the application feel intelligent without turning the LLM into the financial system itself.

The core principle is:

> **The assistant can reason about trusted financial data, but it must never invent, directly authorize, or silently mutate financial state.**

---

# 2. Assistant Philosophy

The assistant should be:

- useful
- conversational
- concise
- contextual
- transparent
- safe
- respectful
- action-oriented

It should not behave like:

- a generic chatbot
- an autonomous financial operator
- a source of unverifiable financial facts

---

# 3. Assistant Architecture

Preferred architecture:

```text
User
 ↓
Mobile Assistant UI
 ↓
Assistant API
 ↓
Conversation / Intent Layer
 ↓
AI Orchestrator
 ↓
Tool Selection
 ↓
Trusted Application Services
 ↓
Structured Result
 ↓
AI Response Generation
 ↓
Output Validation
 ↓
Mobile UI
```

The model never receives direct database access.

---

# 4. Core Responsibilities

The assistant should support:

```text
Financial Questions
Financial Explanations
Financial Summaries
Budget Questions
Goal Questions
Lending / Borrowing Questions
Recurring Finance Questions
Forecast Questions
Report Questions
AI Recommendations
```

Future:

```text
Voice Assistant
Transaction Drafting
Reminder Drafting
Financial Planning
Controlled Write Actions
```

---

# 5. Assistant Modes

The system may conceptually support:

```text
READ
EXPLAIN
RECOMMEND
DRAFT
ACTION
```

The initial product should strongly prioritize:

```text
READ
EXPLAIN
RECOMMEND
```

`ACTION` requires explicit user confirmation.

---

# 6. Read Mode

Examples:

```text
How much did I spend this month?

What is my current balance?

How much do people owe me?
```

These use trusted read-only tools.

---

# 7. Explain Mode

Examples:

```text
Why did my food spending increase?

Why is my goal at risk?

Why is my budget projected to be exceeded?
```

The assistant uses deterministic analytics/forecast results and explains them naturally.

---

# 8. Recommend Mode

Examples:

```text
What should I focus on this month?

How can I reach my goal faster?

Where should I cut spending?
```

Recommendations must reference actual financial data and clearly communicate uncertainty.

---

# 9. Draft Mode

Future use cases:

```text
Draft a repayment reminder.

Prepare an expense entry from this sentence.

Draft a monthly financial plan.
```

A draft is not an executed action.

---

# 10. Action Mode

Future actions may include:

```text
Create Transaction
Create Budget
Add Goal Contribution
Schedule Reminder
```

The model must not directly perform these actions.

Required flow:

```text
User Request
 ↓
AI Interprets
 ↓
Create Structured Draft
 ↓
Show User
 ↓
User Confirms
 ↓
Application Validation
 ↓
Execute
```

---

# 11. Natural-Language Financial Query

Example:

> "How much did I spend on restaurants this month?"

Flow:

```text
Message
 ↓
Intent Detection
 ↓
Tool Selection
 ↓
getMerchantSpending()
 ↓
Trusted Result
 ↓
AI Explanation
 ↓
Answer
```

Example answer:

> "You spent ৳5,840 on restaurants this month."

The numerical value comes from the trusted tool.

---

# 12. Tool Architecture

Tool definitions should be explicit and versioned.

Potential tools:

```text
getAccountBalances
getAccountSummary
getTransactionList
getTransaction
getMonthlySummary
getIncomeSummary
getExpenseSummary
getCategorySpending
getMerchantSpending
getBudgetStatus
getBudgetForecast
getGoalProgress
getGoalForecast
getLendingSummary
getBorrowingSummary
getUpcomingBills
getRecurringCommitments
getCashFlow
getSpendingTrend
getFinancialHealth
getAnomalies
runFinancialSimulation
```

---

# 13. Tool Design Principle

Every tool should:

- have a narrow purpose
- accept validated parameters
- execute within authenticated user context
- return structured data
- avoid exposing raw database internals

Avoid giant tools such as:

```text
queryEverything()
```

---

# 14. Tool Authorization

Every tool execution must enforce:

```text
Authenticated User
+
Resource Ownership
+
Parameter Validation
+
Business Permissions
```

The model cannot choose:

```text
user_id
```

as a security boundary.

The system injects the authenticated user's identity server-side.

---

# 15. Tool Result Structure

A tool may return:

```json
{
  "success": true,
  "data": {
    "value": "5840.00",
    "currency": "BDT",
    "period": "2026-08"
  }
}
```

Errors should be structured:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_DATA"
  }
}
```

---

# 16. Tool Error Handling

If a tool fails:

```text
Tool Failure
 ↓
Assistant receives structured error
 ↓
Assistant explains limitation
```

The assistant should not invent a result.

Example:

> "I couldn't calculate that because there isn't enough historical data yet."

---

# 17. Intent Detection

Potential intent types:

```text
BALANCE_QUERY
TRANSACTION_QUERY
SPENDING_QUERY
INCOME_QUERY
BUDGET_QUERY
GOAL_QUERY
LENDING_QUERY
BORROWING_QUERY
RECURRING_QUERY
REPORT_QUERY
FORECAST_QUERY
ANOMALY_QUERY
FINANCIAL_HEALTH_QUERY
RECOMMENDATION_QUERY
SIMULATION_QUERY
ACTION_REQUEST
OTHER
```

---

# 18. Intent Confidence

The assistant may internally classify intent confidence:

```text
HIGH
MEDIUM
LOW
```

Low-confidence intents should trigger clarification rather than unsafe assumptions.

---

# 19. Clarification

Example:

User:

> "How much did I spend on food?"

The assistant should ask:

> "Do you mean this month, last month, or another period?"

unless the current context clearly provides a period.

Do not guess important financial scope.

---

# 20. Context Awareness

The assistant may use:

```text
Current Date
Current Period
Current Screen
Selected Entity
Recent Conversation
User Preferences
```

Example:

The user is viewing:

```text
Laptop Goal
```

and asks:

> "How much more do I need?"

The assistant can interpret the target as the visible goal without asking for the goal ID again.

---

# 21. Context Boundaries

Screen context must not override explicit user instructions.

Example:

```text
Current Screen:
Laptop Goal

User:
How much did I spend on food?
```

The assistant should answer the food question, not the goal question.

---

# 22. Conversation Context

Conversation state may contain:

```text
Recent User Messages
Assistant Responses
Resolved Intent
Referenced Entities
```

The system should avoid sending the complete conversation indefinitely.

---

# 23. Context Window Management

For long conversations:

```text
Recent Messages
+
Conversation Summary
+
Current User Request
+
Relevant Financial Context
```

should replace unlimited raw history.

---

# 24. Conversation Summary

A conversation summary may contain:

```text
Current topic
Referenced goal
Referenced budget
User preference relevant to the conversation
Pending action
```

Only necessary information should be persisted.

---

# 25. Assistant Memory

Future memory should primarily contain stable user preferences.

Examples:

```text
Preferred currency
Preferred summary style
Preferred reminder style
Preferred answer length
```

Avoid storing raw financial history as generic AI memory.

Financial facts should always come from trusted financial tools.

---

# 26. Financial Facts and Memory

Bad:

```text
AI Memory:
User has ৳80,000 in bKash.
```

Better:

```text
AI Tool:
getAccountBalance(bKash)
```

The assistant should retrieve current financial truth instead of relying on stale memory.

---

# 27. Natural-Language Date Parsing

The assistant should understand:

```text
this month
last month
yesterday
this week
next week
in August
last 3 months
```

The application should normalize these into explicit date ranges before executing financial tools.

---

# 28. Date Ambiguity

If the user's phrase is ambiguous:

> "How much did I spend recently?"

the assistant should clarify or use a clearly stated default.

Example:

> "I can check the last 30 days. Is that what you mean?"

---

# 29. Currency Handling

If the user asks:

> "How much do I have?"

the assistant should use the relevant account/base currency and identify the currency in the answer.

Example:

> "Your current tracked cash balance is ৳108,500."

---

# 30. Multi-Currency Future

When multi-currency support exists, the assistant must distinguish:

```text
Original Currency
Converted Value
Display Currency
```

It must not combine different currencies without a defined conversion model.

---

# 31. Natural-Language Transaction Draft

Future example:

> "I spent 450 taka on groceries today."

Assistant should create:

```text
Draft:
Type: Expense
Amount: ৳450
Category: Groceries
Date: Today
```

Then:

```text
[Confirm]
```

The transaction is not saved before confirmation.

---

# 32. Ambiguous Transaction Draft

Example:

> "I spent around 500 at the shop."

Unknown:

```text
Exact Amount
Category
Account
```

The assistant should ask for the missing required information rather than inventing it.

---

# 33. Smart Category Suggestion

The assistant may suggest:

```text
Category:
Groceries
Confidence:
High
```

The user can change it before saving.

---

# 34. Smart Account Suggestion

The assistant may use recent behavior:

```text
Likely Account:
bKash
```

but should remain editable.

---

# 35. Action Confirmation

For any future write operation:

```text
Interpret
 ↓
Draft
 ↓
Preview
 ↓
Confirm
 ↓
Validate
 ↓
Execute
```

The user must see the actual financial effect before confirmation.

---

# 36. Confirmation UX

Example:

```text
Create Expense

Amount:
৳450

Category:
Groceries

Account:
bKash

Date:
Today

[Cancel]    [Confirm]
```

The assistant cannot bypass the normal transaction validation layer.

---

# 37. Action Idempotency

Confirmed AI actions must use the same idempotency mechanisms as normal API operations.

The AI interface must not introduce a separate unsafe write path.

---

# 38. Assistant and Transactions

Read:

```text
Search transactions
Summarize transactions
Explain transaction patterns
```

Future write:

```text
Create / Edit transaction
```

through standard transaction services.

---

# 39. Assistant and Budgets

The assistant should answer:

```text
Am I over budget?
How much remains?
Which budget is at risk?
What categories are driving the issue?
```

It should use the budgeting engine rather than calculating budgets itself.

---

# 40. Assistant and Goals

The assistant should answer:

```text
How much have I saved?
How much remains?
Will I reach the goal?
How much do I need per month?
What if I save more?
```

These values come from the goal and forecasting engines.

---

# 41. Assistant and Lending

Examples:

```text
Who owes me money?
How much does Rahim owe?
Which repayments are overdue?
Who owes the most?
```

The lending domain provides the facts.

---

# 42. Assistant and Borrowing

Examples:

```text
How much do I owe?
Who do I need to pay?
What repayments are due this week?
```

Borrowing data remains source-of-truth.

---

# 43. Assistant and Recurring Finance

Examples:

```text
What bills are due this week?
How much are my monthly recurring expenses?
Which subscriptions cost me the most?
```

The recurring module provides actual/scheduled values.

---

# 44. Assistant and Reports

The assistant may summarize reports:

> "August expenses were ৳31,200, which was lower than July."

It should link to the corresponding report.

---

# 45. Assistant and Analytics

The assistant can ask analytics tools:

```text
getSpendingTrend()
getCategorySpending()
getFinancialHealth()
getAnomalies()
```

This prevents raw-database reasoning.

---

# 46. Assistant and Forecasting

Questions:

```text
How much will I likely spend this month?
Am I likely to exceed my budget?
When will I reach my goal?
```

The forecast engine returns the result.

AI explains it.

---

# 47. Assistant and AI Insights

The assistant can explain existing insights:

> "Why did the app say my food spending is a concern?"

Flow:

```text
Existing Insight
 ↓
Supporting Metrics
 ↓
Assistant Explanation
```

The assistant should not contradict the source analytics without evidence.

---

# 48. Assistant and Files

Future capabilities may include:

```text
Find my grocery receipt
Summarize this invoice
What merchant is on this receipt?
```

Access must remain user-scoped.

Raw files should not be provided to the model unless required.

---

# 49. Assistant and Notifications

The assistant may:

```text
Explain a reminder
Show pending reminders
Draft a new reminder
```

Future sending operations require explicit confirmation.

---

# 50. Voice Assistant

Future architecture:

```text
Microphone
 ↓
Speech-to-Text
 ↓
Assistant Intent
 ↓
Trusted Tools
 ↓
Response
 ↓
Text-to-Speech
```

The voice layer should be independent of the financial domain.

---

# 51. Voice Privacy

The application should clearly explain:

```text
Is audio processed locally?
Is audio sent to a provider?
Is audio retained?
```

Raw audio should not be retained unnecessarily.

---

# 52. Streaming Responses

For conversational UX, streaming may be supported:

```text
Assistant Response
↓
Token / chunk stream
↓
Mobile UI
```

Streaming is useful for long explanations but not required for simple tool results.

---

# 53. Tool Calls During Streaming

The orchestration layer may:

```text
Receive user message
 ↓
Tool call
 ↓
Tool result
 ↓
Continue generation
 ↓
Stream final answer
```

Tool execution must remain server-controlled.

---

# 54. Assistant Response Structure

A useful answer may contain:

```text
Answer
+
Short Explanation
+
Relevant Next Action
```

Avoid unnecessary paragraphs.

---

# 55. Numerical Answer Style

For financial numbers:

```text
৳31,200
```

not:

```text
31200
```

The assistant should use the user's preferred currency formatting.

---

# 56. Explainability in Answers

Example:

> "You spent ৳8,450 on food this month, which is ৳1,550 more than July."

The assistant should optionally offer:

```text
[View Food Spending]
```

---

# 57. Supporting Evidence

For important answers, provide evidence:

```text
August:
৳8,450

July:
৳6,900

Change:
+22.5%
```

This increases trust.

---

# 58. Uncertainty Language

Use:

```text
about
approximately
projected
likely
estimated
at the current pace
```

when appropriate.

Do not state:

```text
You will definitely...
```

for predictions.

---

# 59. Assistant Safety Rules

The assistant must never:

- invent financial numbers
- claim access to unavailable data
- bypass authorization
- expose another user's data
- perform silent financial changes
- send messages without permission
- treat AI memory as financial truth
- present forecasts as guarantees

---

# 60. Prompt Injection Defense

Potential injection sources:

```text
User Messages
Transaction Notes
Merchant Names
OCR Text
Imported Descriptions
Files
External Data
```

These must remain untrusted.

The system prompt and security instructions must be separated from user-controlled content.

---

# 61. Tool Injection Defense

Tool calls must be validated independently.

Example malicious request:

```text
getAccountBalance(userId="another-user")
```

The tool layer must ignore user/model-provided ownership identifiers and apply authenticated context.

---

# 62. Write Tool Safety

For any future write tool:

```text
Permission Check
+
Parameter Validation
+
Preview
+
Explicit Confirmation
+
Standard Domain Service
+
Idempotency
```

must all pass.

---

# 63. Destructive Action Safety

Destructive actions should require stronger confirmation.

Examples:

```text
Delete Transaction
Delete Account Data
Delete Goal
Delete Files
```

The assistant should not perform these from a casual conversational instruction without explicit confirmation.

---

# 64. Third-Party Communication Safety

Actions such as:

```text
Send repayment email
Send message
```

must show:

```text
Recipient
Content
Timing
```

before execution.

---

# 65. Assistant Error Handling

If the assistant cannot answer:

> "I can't verify that from your current financial data."

If a tool fails:

> "I couldn't retrieve that information right now."

Do not substitute a guessed answer.

---

# 66. Assistant Fallback

If AI is unavailable but a deterministic answer exists:

```text
Tool Result
 ↓
Template Response
```

Example:

> "You spent ৳8,450 on food this month."

This makes core assistant queries resilient.

---

# 67. Clarification vs Hallucination

When required information is missing:

```text
Ask
```

rather than:

```text
Guess
```

Examples:

```text
Which account?
Which period?
Which goal?
```

The assistant should minimize unnecessary clarification by using clear context.

---

# 68. Conversation Persistence

If enabled:

```text
Conversation
 ├── messages
 ├── summary
 ├── references
 └── metadata
```

All records are user-owned.

---

# 69. Conversation Deletion

Users should be able to:

```text
Delete Conversation
Delete All AI History
```

Deletion must follow the privacy/retention policy.

---

# 70. Conversation Search

Future capability:

```text
Search previous AI conversations
```

Search should not expose financial content through third-party analytics.

---

# 71. Assistant Rate Limiting

Apply:

```text
per-user request limits
token limits
tool-call limits
provider quotas
```

Protect against accidental loops and abuse.

---

# 72. Assistant Cost Controls

The system should:

- route simple questions to smaller models
- cache repeated read-only results where safe
- minimize context
- limit conversation history
- use deterministic tools
- avoid unnecessary model calls

---

# 73. Assistant Model Routing

Example:

```text
Simple query:
"What's my balance?"
→ Small / fast model or direct tool path

Analytical explanation:
"Why did expenses increase?"
→ General model

Complex multi-step planning:
"How can I reach my goal while keeping my budget?"
→ Advanced model
```

---

# 74. Direct Tool Optimization

Some questions do not need an LLM.

Example:

> "What is my account balance?"

The system may use:

```text
Intent
 ↓
Direct Tool
 ↓
Template Response
```

This reduces cost and latency.

---

# 75. AI-First vs Tool-First

Preferred:

```text
Tool-First for Deterministic Questions
AI-Assisted for Explanation / Reasoning
```

This is cheaper, faster, and safer.

---

# 76. Assistant Evaluation

Measure:

```text
Intent Accuracy
Tool Selection Accuracy
Numerical Accuracy
Authorization Correctness
Hallucination Rate
Response Helpfulness
Latency
Cost
User Feedback
```

---

# 77. Assistant Evaluation Dataset

Use synthetic conversations such as:

```text
Balance Query
Budget Query
Goal Query
Lending Query
Forecast Query
Ambiguous Query
Malicious Prompt Injection
Unauthorized Resource Request
Write Action
```

---

# 78. Assistant Regression Tests

When changing:

```text
Model
Prompt
Tool Schema
Provider
Conversation Memory
```

test:

```text
Correct Tool
Correct User Scope
Correct Number
Correct Response
Correct Safety Behavior
```

---

# 79. Assistant Security Tests

Test:

```text
Cross-user resource access
Prompt injection
Tool parameter manipulation
Unauthorized write
Replay
Conversation leakage
File access
```

---

# 80. Assistant Performance

The assistant should optimize for:

```text
Fast deterministic queries
Reasonable AI latency
Streaming for longer responses
Minimal unnecessary tool calls
```

The UI should show clear loading states.

---

# 81. Assistant Loading UX

Example:

```text
You

How much did I spend on food?

Assistant
Checking your August food spending...
```

For multi-step reasoning:

```text
Checking spending
Reviewing budget
Preparing answer
```

Avoid exposing chain-of-thought or hidden reasoning.

---

# 82. Assistant Empty State

Suggested:

```text
Ask me about your finances.

Try:
"How much did I spend this month?"
"Am I over budget?"
"When will I reach my goal?"
```

Examples should be useful, not generic chatbot prompts.

---

# 83. Suggested Queries

Context-aware examples may be generated from the current screen.

On Budget:

```text
Why am I at risk?
What can I change?
```

On Goal:

```text
When will I reach this?
What if I save more?
```

On Lending:

```text
Who is overdue?
```

---

# 84. Assistant Deep Links

The assistant may return action links:

```text
View Budget
View Goal
View Transactions
View Report
View Obligation
```

Deep links must reference user-owned entities.

---

# 85. Assistant UX Quality Bar

The assistant should feel:

```text
Like a smart financial layer inside the app
```

not:

```text
A generic chatbot pasted into a finance app
```

It should understand the product's entities and use them naturally.

---

# 86. Assistant API

Relevant endpoints:

```text
POST /api/v1/ai/query
POST /api/v1/ai/chat
POST /api/v1/ai/assistant/session
GET  /api/v1/ai/assistant/sessions
DELETE /api/v1/ai/assistant/sessions/:id
```

Future write actions may use the standard domain APIs after confirmation rather than dedicated AI-specific mutation endpoints.

---

# 87. Assistant Backend Modules

The NestJS backend may contain:

```text
AiModule
├── orchestrator
├── providers
├── tools
├── prompts
├── policies
├── conversations
├── validation
└── evaluation
```

The assistant should call domain application services rather than directly querying Prisma.

---

# 88. Assistant Mobile Structure

The mobile app may contain:

```text
features/assistant
├── components
├── hooks
├── screens
├── services
├── types
└── utils
```

The assistant UI should consume the same shared API client and authentication infrastructure as the rest of the application.

---

# 89. Assistant and Local-First Architecture

For offline mode:

```text
Simple Query
 ↓
Local Tool
 ↓
Template Answer
```

Cloud AI may be unavailable.

The assistant should still answer basic deterministic questions where local data is sufficient.

---

# 90. Offline Assistant Examples

Available offline:

```text
How much did I spend this month?
What's my current balance?
How much remains in my food budget?
How much have I saved toward my laptop goal?
```

Potentially unavailable offline:

```text
Cloud LLM explanation
External AI recommendation
Remote model forecast
```

The UI should communicate the limitation clearly.

---

# 91. Assistant and Sync

The assistant should use the current local state when offline.

After synchronization:

```text
Sync
 ↓
Refresh Tool Results
 ↓
Assistant Uses Updated State
```

Cached conversational answers should be treated as potentially stale.

---

# 92. Assistant Cache

Safe deterministic query results may be cached briefly.

AI conversational responses should generally have shorter retention and stronger invalidation because financial state changes frequently.

---

# 93. Assistant Quality Bar

The AI Assistant is production-ready when:

- deterministic financial questions use trusted tools
- authorization is enforced independently of the model
- ambiguous queries are clarified safely
- numbers come from trusted sources
- write actions require confirmation
- destructive actions require stronger confirmation
- prompt injection is mitigated
- model context is minimized
- memory does not replace financial truth
- AI failures have deterministic fallbacks
- offline basic queries work where possible
- conversation data is user-owned and deletable
- provider/API credentials stay server-side
- model/tool/prompt changes are regression-tested
- latency and cost are monitored

---

# 94. Testing Matrix

## Unit Tests

Test:

- intent classification
- date parsing
- context resolution
- tool selection policy
- confirmation policy
- response validation

## Integration Tests

Test:

- AI → tool
- tool → domain service
- domain result → AI response
- authorization
- conversation persistence
- streaming
- fallback

## Security Tests

Test:

- prompt injection
- unauthorized resource references
- malicious tool arguments
- write confirmation bypass
- conversation leakage
- file access

## E2E Tests

```text
Ask Spending Question
→ Tool Query
→ Correct Number
→ Helpful Answer
```

```text
Ask Transaction Creation
→ Draft
→ Review
→ Confirm
→ Normal Transaction API
→ Transaction Saved
```

---

# 95. Final Principle

The assistant should make the user's relationship with the financial data easier, not create another opaque system the user must trust.

The desired experience is:

> **"I can ask the app about my money naturally, get answers grounded in my real data, understand why the answer is what it is, and remain in control of every financial action."**

---

# 96. Relationship With Other Documents

The initial AI documentation set is now complete:

```text
docs/ai/
├── AI.md
├── AI_INSIGHTS.md
├── AI_FORECASTING.md
└── AI_ASSISTANT.md
```

The AI platform depends on:

```text
Transactions
Accounts
Budgets
Goals
Lending / Borrowing
Recurring Finance
Reports
Analytics
Forecasting
Notifications
Media / OCR
Security
Sync
```

The next documentation phase should move to the engineering layer:

```text
docs/engineering/DEVELOPMENT_GUIDELINES.md
```

It should define:

- Monorepo conventions
- TypeScript standards
- NestJS structure
- React Native / Expo standards
- Module boundaries
- Naming
- Error handling
- API conventions
- Database conventions
- Repository/service boundaries
- State management
- Git workflow
- Code review
- Environment configuration
- Dependency management
- Security practices
- Documentation requirements
- Production coding standards
