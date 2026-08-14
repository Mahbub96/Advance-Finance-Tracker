# Personal Finance — API Architecture

**Document:** `API.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**API Style:** REST  
**API Version:** `v1`  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL + Prisma  
**Authentication:** Token-based, implementation-ready  
**Architecture:** Modular Monolith

---

# 1. Purpose

This document defines the public/backend API contract for the Personal Finance application.

The API must provide a stable, secure, predictable interface for:

- Mobile clients
- Future iOS clients
- Future web clients
- Synchronization
- Financial management
- Analytics
- Reports
- Notifications
- Files
- AI capabilities

The API should expose business capabilities rather than leaking the database implementation.

---

# 2. API Principles

The API must follow these principles:

1. Version all production endpoints.
2. Use resource-oriented naming.
3. Keep controllers thin.
4. Validate every request.
5. Enforce authorization server-side.
6. Use idempotency where retries may create duplicates.
7. Return predictable error structures.
8. Support pagination for unbounded collections.
9. Separate source financial data from derived analytics.
10. Do not expose database internals unnecessarily.
11. Keep financial operations deterministic.
12. Make synchronization safe for unreliable mobile networks.
13. Keep AI behind an internal abstraction.
14. Avoid breaking changes without versioning.

---

# 3. Base URL

Production API:

```text
https://api.example.com/api/v1
```

The actual production hostname is deployment-specific.

Development and staging environments should use separate base URLs.

---

# 4. Versioning

All production routes should be versioned:

```text
/api/v1
```

Examples:

```text
/api/v1/accounts
/api/v1/transactions
/api/v1/budgets
```

Breaking changes should use a new version when compatibility cannot be maintained.

---

# 5. HTTP Methods

Use standard HTTP methods:

```text
GET
POST
PATCH
DELETE
```

Use `PUT` only when full resource replacement is actually appropriate.

---

# 6. Resource Naming

Use plural nouns:

```text
/accounts
/transactions
/budgets
/goals
/lending
/borrowing
```

Avoid action-heavy paths such as:

```text
/addTransaction
/getAllTransactions
/createBudget
```

Business actions may use sub-actions when they cannot be modeled cleanly as resource creation/update.

---

# 7. Authentication Model

Protected endpoints require an authenticated user.

Typical flow:

```text
POST /api/v1/auth/login
        ↓
Access Token
+
Refresh Token
        ↓
Protected API
```

The exact token format may be JWT or another standards-based mechanism.

---

# 8. Authorization

Authentication answers:

> Who is the user?

Authorization answers:

> Can this user access this resource?

Every protected resource query must be scoped to the authenticated user.

Example:

```text
GET /transactions/:id
```

must verify:

```text
transaction.user_id == authenticated_user.id
```

Never trust a resource ID supplied by the client as proof of ownership.

---

# 9. Authentication Endpoints

## POST `/auth/register`

Creates a cloud account.

### Request

```json
{
  "email": "user@example.com",
  "password": "********",
  "displayName": "Mahbub"
}
```

### Response

```json
{
  "data": {
    "user": {},
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

## POST `/auth/login`

Authenticates a user.

---

## POST `/auth/refresh`

Issues a new access token.

---

## POST `/auth/logout`

Invalidates the current refresh/session context.

---

## POST `/auth/forgot-password`

Starts password recovery.

---

## POST `/auth/reset-password`

Completes password recovery.

---

## GET `/auth/me`

Returns the authenticated user's profile.

---

# 10. User Endpoints

## GET `/users/me`

Returns current user information.

## PATCH `/users/me`

Updates supported profile fields.

## DELETE `/users/me`

Starts controlled account deletion.

Account deletion must follow the retention and deletion policy defined by the product.

---

# 11. Account Endpoints

## GET `/accounts`

Returns the user's accounts.

Supports:

- pagination where needed
- archived filtering
- ordering

## POST `/accounts`

Creates an account.

Example:

```json
{
  "name": "bKash",
  "type": "MOBILE_WALLET",
  "currency": "BDT",
  "openingBalance": "5000.00"
}
```

## GET `/accounts/:id`

Returns account details.

## PATCH `/accounts/:id`

Updates account fields.

## DELETE `/accounts/:id`

Should normally archive rather than destructively delete historical financial data.

A separate archive/restore operation may be preferable.

## POST `/accounts/:id/archive`

Archives an account.

## POST `/accounts/:id/restore`

Restores an archived account.

---

# 12. Category Endpoints

## GET `/categories`

Returns available categories.

Optional filters:

```text
type
parentId
active
```

## POST `/categories`

Creates a custom category.

## PATCH `/categories/:id`

Updates a category.

## POST `/categories/:id/archive`

Archives a category.

## POST `/categories/:id/restore`

Restores an archived category where supported.

---

# 13. Tag Endpoints

## GET `/tags`

Lists user tags.

## POST `/tags`

Creates a tag.

## PATCH `/tags/:id`

Updates a tag.

## DELETE `/tags/:id`

Deletes or archives a tag depending on usage.

---

# 14. Transaction Endpoints

Transactions are a critical API domain.

## GET `/transactions`

Returns transactions.

Supported query parameters should include:

```text
page
limit
cursor
from
to
type
accountId
categoryId
tagId
minAmount
maxAmount
search
sort
order
```

Example:

```text
GET /api/v1/transactions?from=2026-08-01&to=2026-08-12&type=EXPENSE
```

---

## POST `/transactions`

Creates a transaction.

Example:

```json
{
  "type": "EXPENSE",
  "amount": "450.00",
  "currency": "BDT",
  "accountId": "uuid",
  "categoryId": "uuid",
  "transactionDate": "2026-08-12T16:30:00Z",
  "merchantName": "ABC Super Shop"
}
```

The request may optionally include:

- note
- tags
- attachment IDs
- external reference
- source

---

# 15. Transaction Creation Idempotency

Clients should send:

```http
Idempotency-Key: <stable-key>
```

for operations that may be retried.

The backend must ensure that repeating the same idempotent request does not create duplicate financial records.

This is especially important for:

- mobile network retries
- synchronization
- background processing

---

# 16. Transaction Response

A transaction response should return normalized data:

```json
{
  "data": {
    "id": "uuid",
    "type": "EXPENSE",
    "amount": "450.00",
    "currency": "BDT",
    "accountId": "uuid",
    "categoryId": "uuid",
    "transactionDate": "2026-08-12T16:30:00Z",
    "createdAt": "2026-08-12T16:30:05Z",
    "updatedAt": "2026-08-12T16:30:05Z"
  }
}
```

---

# 17. Transaction Detail

## GET `/transactions/:id`

Returns a single transaction.

The server must authorize access.

---

# 18. Transaction Update

## PATCH `/transactions/:id`

Updates allowed fields.

For synchronized resources, the request should include a concurrency token/version where required.

Example:

```json
{
  "expectedVersion": 4,
  "categoryId": "uuid"
}
```

If the server version has changed:

```text
409 Conflict
```

should be returned rather than silently overwriting another update.

---

# 19. Transaction Delete

## DELETE `/transactions/:id`

Deletion should follow the financial data retention policy.

For synchronized data, soft deletion/tombstone behavior is generally preferred.

---

# 20. Transaction Restore

## POST `/transactions/:id/restore`

Restores a deleted record where allowed.

This must respect version and conflict rules.

---

# 21. Transfer Endpoint

Transfers are financially special.

Preferred:

```text
POST /transfers
```

Example:

```json
{
  "sourceAccountId": "uuid",
  "destinationAccountId": "uuid",
  "amount": "10000.00",
  "currency": "BDT",
  "date": "2026-08-12T17:00:00Z"
}
```

The server should create the corresponding atomic financial effects.

---

# 22. Transfer Rules

The operation must atomically:

```text
Decrease source
Increase destination
```

and must not create:

```text
Income
Expense
```

effects.

---

# 23. Budget Endpoints

## GET `/budgets`

Lists budgets.

## POST `/budgets`

Creates a budget.

## GET `/budgets/:id`

Returns budget details.

## PATCH `/budgets/:id`

Updates budget configuration.

## POST `/budgets/:id/archive`

Archives a budget.

---

# 24. Budget Analytics

## GET `/budgets/:id/summary`

Returns:

```json
{
  "data": {
    "budget": "10000.00",
    "spent": "7800.00",
    "remaining": "2200.00",
    "utilization": 78,
    "projected": "9800.00"
  }
}
```

Derived values should be calculated by trusted application logic.

---

# 25. Goal Endpoints

## GET `/goals`

Lists goals.

## POST `/goals`

Creates a goal.

## GET `/goals/:id`

Returns goal detail.

## PATCH `/goals/:id`

Updates goal metadata.

## POST `/goals/:id/archive`

Archives a goal.

---

# 26. Goal Contribution Endpoints

## GET `/goals/:id/contributions`

Lists contributions.

## POST `/goals/:id/contributions`

Adds a contribution.

Example:

```json
{
  "amount": "5000.00",
  "currency": "BDT",
  "contributedAt": "2026-08-12T18:00:00Z"
}
```

If a contribution references a real transaction, the backend must protect against double counting.

---

# 27. Goal Forecast Endpoint

## GET `/goals/:id/forecast`

Returns:

```text
currentAmount
remainingAmount
requiredPeriodicContribution
projectedCompletionDate
riskStatus
```

Forecast results should identify that they are estimates.

---

# 28. Lending Endpoints

## GET `/lending`

Lists money owed to the user.

## POST `/lending`

Creates a lending record.

## GET `/lending/:id`

Returns lending detail.

## PATCH `/lending/:id`

Updates an active lending record where allowed.

## POST `/lending/:id/archive`

Archives a lending record.

---

# 29. Borrowing Endpoints

## GET `/borrowing`

Lists money the user owes.

## POST `/borrowing`

Creates a borrowing record.

## GET `/borrowing/:id`

Returns borrowing detail.

## PATCH `/borrowing/:id`

Updates borrowing metadata.

## POST `/borrowing/:id/archive`

Archives a borrowing record.

---

# 30. Repayment Endpoints

A repayment should be created in the context of the related obligation.

## POST `/lending/:id/repayments`

Creates repayment for lending.

## POST `/borrowing/:id/repayments`

Creates repayment for borrowing.

Example:

```json
{
  "accountId": "uuid",
  "amount": "4000.00",
  "currency": "BDT",
  "repaidAt": "2026-08-12T19:00:00Z"
}
```

---

# 31. Repayment Validation

The backend must validate:

- ownership
- obligation status
- currency compatibility
- positive amount
- outstanding amount

If overpayment is not supported:

```text
repayment <= outstanding
```

must be enforced.

---

# 32. Recurring Transaction Endpoints

## GET `/recurring-transactions`

Lists recurring rules.

## POST `/recurring-transactions`

Creates a rule.

## GET `/recurring-transactions/:id`

Returns the rule.

## PATCH `/recurring-transactions/:id`

Updates the rule.

## POST `/recurring-transactions/:id/pause`

Pauses the rule.

## POST `/recurring-transactions/:id/resume`

Resumes the rule.

## DELETE `/recurring-transactions/:id`

Deactivates/deletes according to policy.

---

# 33. Bill Endpoints

## GET `/bills`

Lists bills.

## POST `/bills`

Creates a bill.

## GET `/bills/:id`

Returns bill details.

## PATCH `/bills/:id`

Updates bill configuration.

## POST `/bills/:id/archive`

Archives a bill.

---

# 34. Subscription Endpoints

## GET `/subscriptions`

Lists subscriptions.

## POST `/subscriptions`

Creates a subscription.

## GET `/subscriptions/:id`

Returns details.

## PATCH `/subscriptions/:id`

Updates details.

## POST `/subscriptions/:id/archive`

Archives a subscription.

---

# 35. Person Endpoints

People are shared by lending and borrowing contexts.

## GET `/people`

Lists people.

## POST `/people`

Creates a person.

## PATCH `/people/:id`

Updates person details.

## DELETE `/people/:id`

Deletes/archives according to usage rules.

---

# 36. Analytics API

Analytics endpoints should expose derived financial metrics.

## GET `/analytics/overview`

Returns:

- income
- expense
- savings
- savings rate
- cash flow
- top categories

---

# 37. Spending Analytics

## GET `/analytics/spending`

Query parameters:

```text
from
to
accountId
categoryId
groupBy
```

Possible grouping:

```text
day
week
month
category
merchant
```

---

# 38. Income Analytics

## GET `/analytics/income`

Returns:

- total income
- income source distribution
- income trends
- period comparisons

---

# 39. Cash-Flow Analytics

## GET `/analytics/cash-flow`

Returns:

- income
- expenses
- net cash flow
- historical series
- optional projections

---

# 40. Trend Analytics

## GET `/analytics/trends`

Returns trend information for selected financial metrics.

Example:

```text
spending
income
savings
category
```

---

# 41. Financial Health

## GET `/analytics/financial-health`

Returns:

```json
{
  "data": {
    "score": 84,
    "status": "GOOD",
    "factors": []
  }
}
```

The score must be produced deterministically from defined rules.

---

# 42. Anomaly Detection

## GET `/analytics/anomalies`

Returns potentially unusual activity.

Each result should contain:

```text
transactionId
reason
severity
supportingMetric
```

The endpoint must not claim fraud unless a separately justified fraud system exists.

---

# 43. Forecasting API

## GET `/forecasting/expenses`

Optional query:

```text
period
categoryId
accountId
```

## GET `/forecasting/cash-flow`

Returns projected cash flow.

## GET `/forecasting/budgets/:budgetId`

Returns projected budget exhaustion.

## GET `/forecasting/goals/:goalId`

Returns projected goal completion.

---

# 44. Forecast Response

Example:

```json
{
  "data": {
    "actual": "21700.00",
    "forecast": "32500.00",
    "currency": "BDT",
    "modelVersion": "v1",
    "generatedAt": "2026-08-12T20:00:00Z"
  }
}
```

Predictions must never be represented as guaranteed outcomes.

---

# 45. What-If Simulation API

## POST `/analytics/simulations`

Example:

```json
{
  "type": "MONTHLY_SAVING",
  "monthlyAdditionalSaving": "5000.00",
  "targetGoalId": "uuid"
}
```

Response:

```json
{
  "data": {
    "currentCompletionDate": "2026-12-01",
    "scenarioCompletionDate": "2026-10-01",
    "differenceMonths": 2
  }
}
```

Simulation must not mutate source financial data.

---

# 46. Reports API

## GET `/reports`

Lists available report types.

## GET `/reports/monthly`

Query:

```text
year
month
```

## GET `/reports/cash-flow`

Supports date range.

## GET `/reports/budget`

Supports budget/report period.

---

# 47. Report Generation

If a report is expensive:

```text
POST /reports/jobs
```

may create an asynchronous generation job.

The response:

```json
{
  "data": {
    "jobId": "uuid",
    "status": "PENDING"
  }
}
```

Then:

```text
GET /reports/jobs/:jobId
```

returns progress/status.

---

# 48. Import API

## POST `/imports`

Uploads/imports structured financial data.

For large imports, asynchronous processing is preferred.

Flow:

```text
Upload
 ↓
Parse
 ↓
Validate
 ↓
Preview
 ↓
Confirm
 ↓
Commit
```

---

# 49. Import Preview

## POST `/imports/preview`

Returns:

- valid records
- invalid records
- duplicates
- warnings

No financial data is committed by preview.

---

# 50. Import Commit

## POST `/imports/:id/commit`

Requires explicit confirmation.

The operation should be idempotent.

---

# 51. Export API

For small exports:

```text
GET /exports/transactions
```

For large exports:

```text
POST /exports
```

The response may create an asynchronous export job.

---

# 52. File API

## POST `/files`

Creates or uploads a file.

For object-storage architectures, the API may return a signed upload URL instead.

Example:

```text
POST /files/presign
```

returns:

```json
{
  "data": {
    "fileId": "uuid",
    "uploadUrl": "..."
  }
}
```

---

# 53. File Association

## POST `/files/:id/attachments`

Associates a file with an entity.

The server must verify that:

- file belongs to the user
- target entity belongs to the user
- entity type is supported

---

# 54. Notification API

## GET `/notifications`

Lists user notifications.

Supports:

```text
status
type
page
limit
```

## POST `/notifications/:id/read`

Marks a notification as read.

## POST `/notifications/:id/dismiss`

Dismisses it where supported.

---

# 55. Notification Preferences

## GET `/notification-preferences`

Returns notification settings.

## PATCH `/notification-preferences`

Updates settings.

---

# 56. Email Reminder API

Email reminders may be configured through:

```text
POST /reminders
```

or through domain-specific resources such as:

```text
POST /lending/:id/reminders
POST /borrowing/:id/reminders
```

The preferred design is domain-specific when the reminder belongs clearly to a financial obligation.

---

# 57. Synchronization API

Synchronization is a dedicated API capability.

Recommended endpoints:

```text
POST /sync/session
POST /sync/upload
GET  /sync/changes
POST /sync/ack
POST /sync/resolve
```

The final protocol should remain internally versioned.

---

# 58. Sync Session

## POST `/sync/session`

Returns:

```json
{
  "data": {
    "deviceId": "uuid",
    "serverRevision": 100245,
    "protocolVersion": 1
  }
}
```

The device may register or refresh its synchronization state.

---

# 59. Sync Upload

## POST `/sync/upload`

Accepts a bounded batch of operations.

Example:

```json
{
  "operations": [
    {
      "operationId": "uuid",
      "entityType": "TRANSACTION",
      "entityId": "uuid",
      "operationType": "CREATE",
      "baseVersion": 0,
      "payload": {}
    }
  ]
}
```

Response should return per-operation outcomes.

---

# 60. Sync Upload Result

Each operation may return:

```text
ACKNOWLEDGED
CONFLICT
RETRY
FAILED
```

Example:

```json
{
  "results": [
    {
      "operationId": "uuid",
      "status": "ACKNOWLEDGED",
      "serverVersion": 1
    }
  ]
}
```

---

# 61. Sync Changes

## GET `/sync/changes`

Query:

```text
cursor
limit
```

Response:

```json
{
  "data": {
    "changes": [],
    "nextCursor": "100255",
    "hasMore": true
  }
}
```

The server must provide stable change ordering.

---

# 62. Sync Conflict Resolution

## POST `/sync/resolve`

Used when user-assisted conflict resolution is required.

Request may include:

```json
{
  "conflictId": "uuid",
  "resolution": "KEEP_LOCAL"
}
```

Accepted resolutions must be validated against the current server state.

---

# 63. Sync Full Resync

## POST `/sync/reset`

or an equivalent dedicated endpoint may initiate a full-resync process.

A full reset must be protected carefully because it can replace local state.

---

# 64. AI API Boundary

AI endpoints should be isolated.

Examples:

```text
POST /ai/insights
POST /ai/recommendations
POST /ai/query
POST /ai/chat
```

The AI layer should not expose raw provider endpoints to mobile clients.

---

# 65. AI Insight Request

## POST `/ai/insights`

The server should normally derive the required financial context itself.

Avoid requests such as:

```json
{
  "allTransactions": [...]
}
```

from the mobile app unless there is a justified feature requirement.

Prefer:

```json
{
  "scope": "MONTHLY",
  "period": "2026-08"
}
```

The backend prepares the structured context.

---

# 66. AI Recommendation Request

## POST `/ai/recommendations`

Possible request:

```json
{
  "scope": "BUDGET_RISK",
  "budgetId": "uuid"
}
```

The backend computes trusted financial metrics before invoking AI.

---

# 67. AI Query

## POST `/ai/query`

Example:

```json
{
  "query": "How much did I spend on food this month?"
}
```

Pipeline:

```text
User Query
   ↓
Intent / Tool Selection
   ↓
Financial Query
   ↓
Deterministic Result
   ↓
AI Explanation
```

The LLM should not be allowed to directly invent the underlying number.

---

# 68. AI Chat

## POST `/ai/chat`

Supports conversational interactions.

The server should control:

- available tools
- financial context
- conversation history
- provider selection
- response validation

---

# 69. AI Tool Boundary

The assistant may have tools such as:

```text
getMonthlySpending()
getCategorySpending()
getBudgetStatus()
getGoalProgress()
getOutstandingLending()
getOutstandingBorrowing()
getUpcomingBills()
getForecast()
```

Tool results should come from trusted application services.

---

# 70. AI Security

AI endpoints must enforce:

- authentication
- authorization
- rate limiting
- input validation
- prompt/context minimization
- provider isolation

Users must never be able to ask the API to retrieve another user's financial context.

---

# 71. API Error Model

All errors should use a predictable structure.

Example:

```json
{
  "success": false,
  "error": {
    "code": "TRANSACTION_NOT_FOUND",
    "message": "Transaction not found."
  },
  "requestId": "req_123"
}
```

Optional fields:

```text
details
fieldErrors
retryable
```

---

# 72. Error Codes

Codes should be stable machine-readable identifiers.

Examples:

```text
AUTH_REQUIRED
AUTH_INVALID
FORBIDDEN
RESOURCE_NOT_FOUND

VALIDATION_FAILED
INVALID_AMOUNT
INVALID_CURRENCY
INVALID_STATE

CONFLICT
IDEMPOTENCY_REPLAY
RATE_LIMITED

SYNC_CONFLICT
SYNC_CURSOR_EXPIRED
SYNC_PROTOCOL_UNSUPPORTED

AI_UNAVAILABLE
AI_RATE_LIMITED
```

Do not make clients depend on human-readable message text.

---

# 73. Validation Error

Example:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "fieldErrors": {
      "amount": ["Amount must be greater than zero."]
    }
  }
}
```

---

# 74. HTTP Status Codes

Recommended usage:

```text
200 OK
201 Created
202 Accepted
204 No Content

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests

500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

The final application may standardize more strictly.

---

# 75. Pagination

Collection endpoints should support pagination.

Preferred for large mutable datasets:

```text
cursor
limit
```

Example:

```text
GET /transactions?cursor=abc&limit=50
```

Response:

```json
{
  "data": [],
  "meta": {
    "nextCursor": "xyz",
    "hasMore": true
  }
}
```

---

# 76. Sorting

Supported sorting should be explicit.

Example:

```text
sort=transactionDate
order=desc
```

Do not allow arbitrary database column names to be passed directly to query construction.

Use a whitelist.

---

# 77. Filtering

Filters should be explicitly supported per endpoint.

Example:

```text
GET /transactions?
type=EXPENSE&
categoryId=uuid&
from=2026-08-01&
to=2026-08-31
```

Unrecognized filters should not silently change behavior.

---

# 78. Field Selection

Field selection may be introduced later for bandwidth optimization.

If implemented:

```text
fields=id,amount,date
```

must use a whitelist.

The feature should not expose unrestricted database field access.

---

# 79. Response Envelope

The preferred response style is:

```json
{
  "data": {}
}
```

or:

```json
{
  "data": [],
  "meta": {}
}
```

Errors use:

```json
{
  "success": false,
  "error": {}
}
```

Do not mix multiple response conventions arbitrarily.

---

# 80. Dates and Time

API date/time values should use ISO 8601.

Example:

```text
2026-08-12T18:30:00Z
```

Calendar-only fields such as a due date may use:

```text
2026-08-25
```

The distinction must remain explicit.

---

# 81. Currency and Amounts in API

Monetary amounts should be serialized as strings when decimal precision must be preserved.

Example:

```json
{
  "amount": "1250.50",
  "currency": "BDT"
}
```

Do not rely on JSON floating-point numbers for authoritative financial values.

---

# 82. API Idempotency

Endpoints that create financial effects should support idempotency.

Recommended:

```http
Idempotency-Key: <uuid>
```

The server should retain sufficient metadata to safely replay the response for the same request.

---

# 83. Idempotency Scope

Idempotency must be scoped appropriately to:

- authenticated user
- endpoint/resource
- key

A key from one user must never affect another user.

---

# 84. Request IDs

Every request should receive a request ID.

The server may accept:

```http
X-Request-ID: <id>
```

or generate one.

The request ID should appear in error responses and logs.

Do not expose internal infrastructure details through request IDs.

---

# 85. API Security

All production traffic must use HTTPS.

Other requirements:

- strict authentication
- server-side authorization
- validation
- rate limiting
- secure headers
- secret management
- safe logging

---

# 86. API Rate Limiting

Rate limits should vary by endpoint class.

Examples:

### Standard APIs

Moderate per-user limits.

### Authentication

Strict limits.

### AI

More restrictive cost-aware limits.

### File Upload

Size and request-rate limits.

### Sync

High enough for normal synchronization but protected against abuse.

---

# 87. API Caching

Cache only endpoints where stale data is acceptable.

Potential examples:

- system categories
- static metadata
- non-critical AI results

Do not blindly cache financial mutation results.

---

# 88. API Observability

Monitor:

- request count
- latency
- status codes
- error rates
- endpoint usage
- database timing
- queue timing
- AI timing

Sensitive financial payloads must not be logged by default.

---

# 89. API Documentation

The API should generate or maintain machine-readable documentation.

Recommended:

```text
OpenAPI / Swagger
```

The implementation should use schema definitions that correspond to actual API DTOs.

API documentation should remain synchronized with implementation.

---

# 90. Contract Testing

Critical endpoints should have contract tests covering:

- request schema
- response schema
- error schema
- authorization
- idempotency
- version compatibility

Sync endpoints require especially strong contract testing.

---

# 91. API Module Ownership

Each NestJS module should own its relevant routes.

Example:

```text
TransactionsModule
 → /transactions

BudgetsModule
 → /budgets

GoalsModule
 → /goals

SyncModule
 → /sync

AiModule
 → /ai
```

Avoid a giant central controller.

---

# 92. API Business Logic

Controllers should not contain complex domain logic.

Preferred:

```text
Controller
 ↓
Application Service
 ↓
Domain Logic
 ↓
Repository
```

---

# 93. API and Database Separation

The API contract should not mirror Prisma models blindly.

Example:

Database may contain:

```text
created_at
updated_at
deleted_at
version
```

The API should expose only fields appropriate for the client and use domain-oriented DTOs.

---

# 94. API and Local Storage

The mobile API client should map:

```text
API DTO
 ↓
Domain Model
 ↓
Local Entity
```

Avoid directly writing API responses into SQLite tables without validation/mapping.

---

# 95. API Compatibility

When changing an API:

1. Determine whether change is backward-compatible.
2. Update schema.
3. Update tests.
4. Update mobile client.
5. Maintain compatibility where necessary.
6. Introduce a new API version only when required.

---

# 96. Breaking Changes

Examples:

- removing a field
- changing field type
- changing financial semantics
- changing sync protocol
- changing authentication behavior

Breaking changes require a migration/deprecation strategy.

---

# 97. API Performance

Performance priorities:

1. Transaction creation
2. Transaction list
3. Account balance
4. Dashboard
5. Budget summary
6. Analytics
7. Reports
8. AI
9. Large exports

Expensive report/AI jobs should be asynchronous where necessary.

---

# 98. API Transaction Performance

Transaction creation should avoid unnecessary synchronous work.

Preferred:

```text
Validate
 ↓
Persist Financial State
 ↓
Respond
 ↓
Async:
   analytics refresh
   AI candidate generation
   notifications
```

The exact synchronous boundary should be based on domain consistency requirements.

---

# 99. API and Background Jobs

The API should enqueue asynchronous work rather than handling long-running tasks inside request threads.

Examples:

```text
POST /reports/jobs
POST /ai/insights/jobs
POST /exports/jobs
```

The final endpoint design can be simplified when work completes quickly enough.

---

# 100. API and Email

Email delivery should be asynchronous.

A financial mutation should succeed even if email delivery temporarily fails.

---

# 101. API and AI

AI failures should not cause core financial endpoint failures unless the requested endpoint is explicitly an AI operation.

For example:

```text
POST /transactions
```

must not fail because the AI provider is unavailable.

---

# 102. API and Files

File uploads must validate:

- authenticated owner
- MIME type
- file size
- file extension
- checksum where applicable
- associated resource ownership

Do not trust client-provided MIME types alone.

---

# 103. API and Imports

Import APIs must use:

```text
Preview
→ Validate
→ Commit
```

Avoid direct bulk insertion of unvalidated client data.

---

# 104. API and Exports

Exports should only expose records belonging to the authenticated user.

Generated files should have controlled access and expiration where cloud storage is used.

---

# 105. Health Endpoints

Recommended:

```text
GET /health
GET /health/live
GET /health/ready
```

Health endpoints should expose operational status without exposing secrets or internal details.

---

# 106. Graceful Degradation

If supporting infrastructure fails:

## Redis unavailable

Core synchronous finance APIs should continue where possible.

## AI unavailable

Core finance and deterministic analytics continue.

## Email unavailable

Financial records continue.

## Object storage unavailable

Core transaction functionality continues where possible.

The architecture should avoid unnecessary single points of failure.

---

# 107. API Anti-Patterns

Avoid:

- Unversioned production API
- Returning raw Prisma records
- Raw SQL concepts in API contracts
- Client-controlled authorization
- Floating-point money fields
- Non-idempotent financial writes
- Synchronous AI during normal transaction creation
- Synchronous email delivery
- Unbounded list responses
- Arbitrary sorting fields
- Logging full financial payloads
- One controller for the entire application
- Endpoint names based on UI screen names

---

# 108. API Quality Bar

The API is production-ready when:

- Every protected resource is authorized.
- Financial writes are deterministic.
- Money is serialized safely.
- Create operations can be retried safely.
- Collection endpoints are paginated.
- Errors are standardized.
- Sync is versioned and idempotent.
- AI is isolated.
- Files are protected.
- API documentation is generated.
- Critical contracts are tested.
- Observability is implemented.
- Breaking changes have a compatibility strategy.

---

# 109. Initial Endpoint Catalog

```text
/api/v1
│
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /refresh
│   ├── POST /logout
│   ├── POST /forgot-password
│   ├── POST /reset-password
│   └── GET  /me
│
├── /users
│
├── /accounts
│
├── /categories
│
├── /tags
│
├── /transactions
│
├── /transfers
│
├── /budgets
│
├── /goals
│   └── /:id/contributions
│
├── /people
│
├── /lending
│   └── /:id/repayments
│
├── /borrowing
│   └── /:id/repayments
│
├── /recurring-transactions
├── /bills
├── /subscriptions
│
├── /analytics
│
├── /forecasting
│
├── /reports
│
├── /imports
├── /exports
│
├── /files
│
├── /notifications
├── /notification-preferences
│
├── /sync
│
├── /ai
│
└── /health
```

This catalog is the baseline. Exact endpoint names may be refined during implementation as long as the documented API principles remain intact.

---

# 110. Relationship With Other Architecture Documents

The architecture documentation sequence is:

```text
SYSTEM_ARCHITECTURE.md
        ↓
DATABASE.md
        ↓
LOCAL_STORAGE.md
        ↓
SYNC_ARCHITECTURE.md
        ↓
API.md
        ↓
SECURITY.md
```

This document defines **how clients communicate with the backend**.

The next document is:

```text
docs/architecture/SECURITY.md
```

It should define:

- Threat model
- Authentication security
- Authorization
- Device security
- Local data protection
- Token storage
- API security
- Database security
- File security
- AI privacy/security
- Secrets management
- Rate limiting
- Audit logging
- Backup security
- Incident response
- Data deletion
- Production security checklist

The API must remain secure even when the mobile client is modified, compromised, or otherwise untrusted.
