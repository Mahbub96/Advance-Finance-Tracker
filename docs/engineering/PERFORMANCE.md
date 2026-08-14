# Personal Finance — Performance Engineering

**Document:** `PERFORMANCE.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-14  
**Product:** Personal Finance  
**Repository:** Advance-Finance-Tracker  
**Architecture:** pnpm Monorepo  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL + Prisma  
**Local Database:** SQLite  
**Cache / Queue:** Redis  
**Package Manager:** pnpm  

---

# 1. Purpose

This document defines the performance strategy for the personal finance application.

It specifies:

```text
Priorities
Budgets
Latency classes
Mobile performance
SQLite performance
API performance
PostgreSQL performance
Caching
Background jobs
Synchronization
Forecasting
AI latency
Large-dataset strategy
Load testing
Monitoring
Acceptance criteria
```

Testing *how* to measure belongs in `TESTING.md`.

How to ship belongs in `DEPLOYMENT.md`.

---

# 2. Performance Principles

```text
Correctness before speed
Frequent paths before rare paths
Local-first before cloud
Deterministic finance before AI
Measure before optimizing
Do not cache financial truth
Indexes must match real queries
```

A fast incorrect balance is a defect, not a win.

---

# 3. Performance Priorities

From `SYSTEM_ARCHITECTURE.md`:

```text
1. Transaction entry
2. Navigation
3. Local list rendering
4. Search
5. Dashboard
6. Analytics
7. AI
```

API-side order from `API.md`:

```text
1. Transaction creation
2. Transaction list
3. Account balance
4. Dashboard
5. Budget summary
6. Analytics
7. Reports
8. AI
9. Large exports
```

The most frequent operations must remain the fastest.

---

# 4. What Performance Is Not

Performance work must not:

```text
Weaken financial correctness
Hide rounding errors
Skip validation
Drop sync operations
Use JS number as money
Block core flows on an LLM
Treat Redis as the ledger
Load entire history into the UI
```

---

# 5. Measurement Philosophy

Budgets in this document are **targets**, not marketing claims.

Exact numbers must be validated on:

```text
Real devices
Production-like datasets
Controlled clocks
Repeatable fixtures
```

Until measured, treat numbers as design budgets.

See `TESTING.md` for performance, load, and stress test layers.

---

# 6. Latency Classes

```text
Instant     < 100 ms perceived
Interactive < 300 ms
Acceptable  < 1 s
Slow        1–3 s with feedback
Async       > 3 s must not block the request or UI
```

Map features to classes:

```text
Save transaction          Instant / Interactive
Tab navigation            Instant
Account balance read      Instant
Transaction list page     Interactive
Local search              Interactive
Home totals               Interactive
Standard local report     Acceptable
Cloud report              Acceptable or Async
Forecast refresh          Async
AI insight                Async
PDF / export              Async
Full sync catch-up        Async with progress
```

---

# 7. Device Classes

Design and test against:

```text
Low-end Android
Mid-range Android
High-end Android
```

Low-end is the budget that matters.

Future iOS has a separate device matrix. Do not assume desktop-class RAM.

---

# 8. Dataset Classes

```text
Small     < 500 transactions
Typical   500–3,000
Large     10,000+
Heavy     multi-year, many accounts, receipts
```

Local architecture must remain usable at **10,000+ transactions** and be capable of growing beyond that.

---

# 9. Performance Scope by Phase

Phase 3 (current) is local-first:

```text
SQLite
Mobile UI
Derived balances
Health API only
```

Phase 6 adds:

```text
Auth latency
Sync throughput
PostgreSQL
Redis jobs
Object storage
```

Do not pretend cloud budgets are in force before cloud exists. Write the budgets now so later work does not invent them under pressure.

---

# 10. Mobile Performance Scope

Mobile performance covers:

```text
Cold start
Warm start
Navigation
Transaction entry
Lists
Search
Dashboard
Memory
Battery
SQLite
Rendering
```

The network must not sit on the critical path of routine transaction entry.

---

# 11. Cold Start

Cold start should reach a usable first screen quickly.

```text
Launch
  ↓
Restore SQLite connection
  ↓
Read settings / onboarding flag
  ↓
Show Home or Onboarding
```

Do not:

```text
Run full analytics on launch
Call AI on launch
Download the full cloud ledger on launch
Parse every receipt on launch
```

Heavy work after first paint.

---

# 12. Warm Start

Returning to the app should restore:

```text
Last route where safe
Open database
Current account context
```

Avoid re-running onboarding or rebuilding the entire in-memory ledger.

---

# 13. Navigation Performance

Tab switches and stack pushes must feel instant.

```text
Home
Add
Transactions
Analytics
More
```

Do not refetch or recompute the world on every tab focus.

Keep screens independently loadable. Shared finance state should already be in the local store.

---

# 14. Transaction Entry Performance

This is the highest-priority interactive path.

```text
Open Add
  ↓
Choose type / account / category
  ↓
Enter amount
  ↓
Save
  ↓
SQLite write
  ↓
Immediate local confirmation
```

Save must not wait for:

```text
Network
AI categorization
Insight refresh
Push
Email
Report rebuild
```

Optional suggestions may appear asynchronously and never block persist.

---

# 15. Form Performance

```text
Minimal required fields
Stable keyboard
No layout thrash on amount input
No full-list re-render per keystroke
```

Category and account pickers should use indexed local queries, not filter the entire ledger in JS on every tap.

---

# 16. Home / Dashboard Performance

Home shows derived totals, not a second ledger.

```text
Read accounts
Read recent transactions (page)
Derive totals in domain code
Render
```

Do not scan all historical rows in JS to paint Home.

If a summary table or cached aggregate is introduced, it must stay consistent with the transaction ledger. The ledger remains source of truth.

---

# 17. Account Balance Reads

Balance reads must be cheap.

Preferred:

```text
Derived from ledger with indexed queries
or
Maintained summary updated in the same local transaction
```

Never display a balance computed with floating-point JS `number`.

---

# 18. Transaction List Performance

The list must not load the entire history.

Use:

```text
Pagination
Cursor / keyset where practical
SQLite indexes
Virtualized lists
Stable row keys
```

A large dataset must remain scrollable on low-end Android.

---

# 19. List Virtualization

Transaction and analytics screens should use:

```text
Virtualized lists
Memoized rows where appropriate
Stable keys
Incremental loading
Deferred heavy calculations
```

The database must never force the UI to render unnecessary rows.

---

# 20. Search Performance

Search should prefer indexed local queries.

```text
User types
  ↓
Debounce
  ↓
SQLite query
  ↓
Paged results
```

Do not:

```text
Load all transactions into memory
Filter in JS over the full table
Require a server for historical search
```

SQLite FTS may be added when measured need exists. Do not introduce a separate search service for local transactions.

---

# 21. Filter Performance

Filters (account, category, type, date range) must run locally and offline.

Combine filters in SQL, not by intersecting huge in-memory arrays.

---

# 22. SQLite Performance

SQLite is the local operational store.

Priorities:

```text
Immediate transaction persistence
Fast list scrolling
Fast search
Fast balance reads
Fast dashboard
```

Expensive work runs asynchronously when practical.

---

# 23. Local Indexing

Indexes must support common queries. Likely:

```text
transactions(transaction_date)
transactions(account_id, transaction_date)
transactions(category_id, transaction_date)
transactions(type, transaction_date)
lending_records(status, expected_repayment_date)
borrowing_records(status, expected_repayment_date)
notifications(status, scheduled_at)
sync_operations(status, created_at)
```

Validate with realistic on-device datasets. Exact indexes belong in `LOCAL_STORAGE.md` / schema.

---

# 24. Local Query Shape

Prefer:

```text
SELECT needed columns
WHERE indexed predicates
ORDER BY transaction_date DESC
LIMIT page_size
```

Avoid:

```text
SELECT *
Unbounded scans
OFFSET deep into large tables
JOIN explosions in the UI layer
```

---

# 25. Pagination

Transaction lists support pagination.

Conceptual:

```text
SELECT ...
FROM transactions
WHERE ...
ORDER BY transaction_date DESC, id DESC
LIMIT N
```

For very large datasets, cursor / keyset pagination beats large `OFFSET`.

Choose after measurement.

---

# 26. Cursor vs Offset

```text
Offset  Simple, degrades on deep pages
Cursor  Stable, better for large ledgers
```

API collections should prefer cursor + limit when cloud lists exist.

```text
GET /transactions?cursor=abc&limit=50
```

---

# 27. Derived Balances

Balances are derived in domain code from the ledger.

Cost of a balance read must stay in the Instant / Interactive class for a single account.

If summaries are materialized:

```text
Update summary in the same SQLite transaction as the ledger write
```

A stale summary that disagrees with the ledger is a P0 correctness bug.

---

# 28. Money Calculation Cost

Monetary math uses decimal-safe types (`packages/types`, TEXT scale 2).

Decimal libraries are slower than `number`. That cost is accepted.

Do not "optimize" money by switching to IEEE floats.

Batch formatting for lists. Do not re-parse decimal strings on every scroll frame.

---

# 29. Rendering Performance

```text
Virtualize long lists
Avoid anonymous inline work in hot rows
Keep row components cheap
Defer charts until the screen is focused
```

Charts and analytics may lag Home. Entry and lists must not.

---

# 30. Memory Usage

The app must remain stable on low-end Android with a Large dataset.

Do not hold:

```text
All transactions in RAM
Decoded full-resolution receipts
Unbounded AI transcripts
Unbounded sync payloads
```

Page, stream, and release.

---

# 31. Image / Receipt Memory

```text
Downscale before display
Do not decode originals for thumbnails
Cap concurrent decodes
Store files on disk, not in SQLite blobs, unless measured better
```

See `MEDIA_FILES.md` for storage rules. Performance must not weaken privacy of financial files.

---

# 32. Battery

Routine use should not drain the battery through:

```text
Tight polling
Wake locks
Constant GPS
Unbounded background sync
Repeated AI calls
```

Sync and jobs should batch and back off.

---

# 33. Network Usage

Phase 3: core flows use no network.

Later, mobile network policy:

```text
Prefer Wi-Fi for large sync / backup / media
Compress payloads
Send diffs, not full tables
Respect metered connections
```

Do not optimize bandwidth by dropping financial operations.

---

# 34. Offline Performance

Offline is the default happy path.

```text
Record transaction
  ↓
Local persist
  ↓
UI updates
  ↓
(optional later) enqueue sync
```

Restarting the app offline must restore queued work without a network round trip.

---

---

# 35. API Performance Scope

Until Phase 6 the public API is:

```text
GET /health
```

Health must stay cheap. Later finance routes inherit the budgets below.

---

# 36. Health Endpoint Performance

```text
GET /health       liveness, no dependency fan-out
GET /health/live  process alive
GET /health/ready PostgreSQL / Redis when those exist
```

Readiness may check infrastructure.

External AI or email failure must not make the core API unready.

Health handlers should not run migrations, reports, or sync.

---

# 37. Authentication Latency

When cloud auth exists:

```text
Interactive for login
Instant for validated access-token requests
Refresh off the hot path of each mutation if possible
```

Auth must not add multi-second work to transaction create.

---

# 38. Transaction Create Latency

Preferred cloud path:

```text
Validate
  ↓
Persist financial state
  ↓
Respond
  ↓
Async:
    analytics refresh
    AI candidate generation
    notifications
```

Synchronous work is only what domain consistency requires.

---

# 39. Collection Endpoint Latency

List endpoints must paginate.

```text
Interactive for a page of 50
Never return unbounded ledgers
```

Dashboard aggregates should hit indexes or summaries, not full table scans per request.

---

# 40. Payload Size

```text
Omit unused fields
Do not embed receipts in list payloads
Do not send AI narratives on every list
Compress where the platform already supports it
```

Large exports are a separate job, not a list endpoint.

---

# 41. API Pagination

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

# 42. N+1 Prevention

Prisma / repository code must not issue one query per row for lists.

```text
Bad   N account lookups in a loop
Good  JOIN or batched IN query
```

List screens and report jobs are the usual N+1 sites. Add a query log in development for these paths.

---

# 43. PostgreSQL Performance

PostgreSQL is the cloud source of truth (Phase 6).

Needs:

```text
Strong consistency
Indexes for real query patterns
Predictable aggregation
Concurrent writes without lost updates
```

Financial writes use transactions. Do not trade isolation for speed on ledger mutations.

---

# 44. Prisma Query Discipline

```text
Select only needed fields
Avoid unbounded findMany
Use transactions for multi-row financial writes
Use raw SQL only when justified and tested
```

Complex report SQL is allowed when Prisma cannot express an efficient plan. Keep it in the repository layer.

---

# 45. Indexing Strategy

High-value cloud indexes should cover:

```text
Transaction(user_id, transaction_date)
Transaction(user_id, account_id, transaction_date)
Transaction(user_id, category_id, transaction_date)
Transaction(user_id, type, transaction_date)
Budget(user_id, status)
Goal(user_id, status)
LendingRecord(user_id, status, expected_repayment_date)
BorrowingRecord(user_id, status, expected_repayment_date)
Notification(user_id, status, scheduled_at)
SyncOperation(device_id, status, created_at)
```

Validate with `EXPLAIN` on production-like data. Final schema lives in `DATABASE.md`.

---

# 46. Indexing Rule

Do not index a column because it exists.

Every extra index has:

```text
Storage cost
Write cost
Maintenance cost
```

Indexes must correspond to real queries.

---

# 47. Aggregation Queries

Reports and dashboards should aggregate in the database, not in the API process over full result sets.

```text
SQL / Prisma aggregate
  ↓
Typed DTO
  ↓
Client
```

Never:

```text
Load 10,000 rows
  ↓
Reduce in Node
  ↓
Return one number
```

---

# 48. Report Generation Performance

Simple reports should return synchronously from local data or a cheap query.

Potentially expensive reports become jobs:

```text
POST /reports/jobs
  ↓
Job ID
  ↓
Background worker
  ↓
Report generated
  ↓
Download / view
```

Expensive cases:

```text
Multi-year analysis
Large datasets
PDF generation
Complex grouped analytics
```

---

# 49. Report Caching

Reports may be cached when:

```text
Source data unchanged
Report configuration unchanged
Calculation version unchanged
```

Cache key may include:

```text
user_id
report_type
period
filters
calculation_version
input_snapshot_hash
```

Cached reports must remain explainable and reconcilable with the ledger.

---

# 50. Heavy Reports Are Async

From `REPORTING.md`:

```text
Standard mobile report    Immediate from local data
Standard cloud report     A few seconds or less
Heavy report              Async with progress
```

Do not block HTTP or the UI thread on PDF / multi-year work.

---

# 51. Redis Caching Role

Redis is:

```text
Cache
Job queue
Ephemeral coordination
```

Redis is **not** the financial store.

Safe to cache:

```text
AI insight payloads
Forecast results
Rendered report metadata
Rate-limit counters
Session / refresh bookkeeping if chosen
```

Unsafe to treat as truth:

```text
Balances
Transactions
Budgets
Repayment state
```

---

# 52. Cache Invalidation

Invalidation must be deterministic.

Examples:

```text
Transaction created
  ↓
Monthly insight cache invalid

Budget changed
  ↓
Budget insight invalid

Ledger mutation
  ↓
Matching report cache invalid
```

Prefer delete-on-write over long TTLs for anything derived from money.

---

# 53. What Must Not Be Cached

```text
Authorization decisions as the only check
Other users' financial payloads
Unsigned file URLs beyond their TTL policy
AI numeric claims that skip deterministic recalculation
```

---

# 54. Background Jobs Performance

Jobs exist so request/UI paths stay in Instant / Interactive classes.

Typical jobs:

```text
Notifications
Report generation
Forecast refresh
AI candidate generation
Sync fan-out
Media processing
Email
```

Jobs must be idempotent (`DEC-023`). Retries must not duplicate transfers or notifications.

---

# 55. Job Queue Depth

Monitor:

```text
Queue depth
Processing latency
Failure rate
Retry count
Oldest pending job age
```

A growing queue is a performance incident before it is a user-visible outage.

---

# 56. Idempotent Jobs and Cost

Idempotency keys add a lookup. That cost is required.

Do not skip idempotency to "make jobs faster."

---

# 57. Notification Dispatch

```text
Event
  ↓
Enqueue
  ↓
Worker
  ↓
Provider
```

Do not send email/push inside the transaction-create request unless a rare consistency rule demands it.

Deduplicate so retries do not spam.

---

# 58. File / Object Storage Latency

Uploads and downloads are Slow / Async relative to ledger writes.

```text
Persist financial record first
Attach file metadata
Upload bytes asynchronously if needed
```

Failed uploads must not delete the transaction (`LOCAL_STORAGE.md`).

Signed URL generation should be cheap. Streaming large objects should not tie up API event-loop workers — use dedicated upload paths.

---

# 59. Sync Performance Strategy

Priority order (`SYNC_ARCHITECTURE.md`):

```text
1. Financial correctness
2. Durable synchronization
3. Reasonable latency
4. Battery efficiency
5. Network efficiency
```

Do not optimize network traffic at the cost of financial correctness.

---

# 60. Sync Throughput

Sync should send:

```text
Changed entities
Tombstones
Versions
```

Not:

```text
The entire SQLite database every time
```

Batch by entity type. Cap batch size. Continue after partial failure.

---

# 61. Sync Batch Size

Choose batch size from measurement, not guesswork.

Constraints:

```text
Fits in memory on low-end devices
Fits typical mobile request size
Leaves the UI responsive
Allows resume after failure
```

A failed batch must not discard unrelated successful items.

---

# 62. Conflict Resolution Cost

Conflict detection is required. It will cost CPU and round trips.

```text
Cheap merge for non-financial metadata when safe
Explicit conflict for concurrent ledger edits
Never silent last-write-wins on money
```

Do not "speed up" sync by last-write-wins on transactions.

---

# 63. Offline Restart Sync

Queued operations must survive:

```text
App kill
OS memory reclaim
Device reboot
```

Drain the queue on connectivity without blocking first paint.

---

# 64. Partial Sync Failure

```text
8 acknowledged
2 remain retryable
No duplicate records
No missing committed records
Correct versions
Correct tombstones
```

The entire batch is not discarded because one row failed.

---

---

# 65. Forecasting Latency

Forecasting is independent of the LLM.

```text
Historical data
  ↓
Feature preparation
  ↓
Model
  ↓
Validation / confidence
  ↓
Result
```

Users may wait for a forecast. They must not wait for a forecast to save a transaction.

Refresh on a worker or idle path. Show last good forecast plus freshness.

---

# 66. Forecast Cache

Cache key:

```text
input_snapshot_hash
model_version
forecast_period
```

Regenerate when material inputs or model version change.

A more expensive model must not become default unless it beats the baseline on accuracy *and* stays within latency budget (`DEC-019`).

---

# 67. AI Latency

AI is the lowest interactive priority.

```text
Insights
Recommendations
Explanations
Assistant turns
```

Target class: Async. Show skeletons / last cached insight. Never block ledger writes.

Provider timeouts must fail closed to a fallback, not hang the app.

---

# 68. AI Must Not Block Core Finance

Core features must work if:

```text
Provider is down
User is offline
Keys are missing
Latency is high
```

```text
Transaction save  → never waits on AI
Balances          → never from an LLM
Reports           → deterministic engine first
```

---

# 69. AI Cache

Safe results may be cached:

```text
context_hash
+
task_type
+
model_version
```

Avoid repeated calls for an unchanged analytical context.

---

# 70. AI Cache Invalidation

```text
Transaction created → monthly insight invalid
Budget changed      → budget insight invalid
```

Numeric claims in a cached narrative must still match live deterministic calculations when displayed, or the cache is dropped.

---

# 71. Provider Timeouts

```text
Connect timeout
Total request timeout
Retry with jitter
Circuit breaker on repeated failure
```

Retries must not amplify cost or duplicate side effects. AI tools that write require user confirmation (`DEC-013`) and are never implicit retries of money moves.

---

# 72. Large Dataset Strategy

Remain usable with:

```text
Thousands of transactions
Large category histories
Long reporting periods
```

Use:

```text
Indexes
Pagination
Virtualization
Incremental loading
Optimized aggregation
Background processing
```

---

# 73. 10,000+ Transactions

Local architecture target (`LOCAL_STORAGE.md`):

```text
10,000+ transactions remain usable
```

Verify on real devices, not only simulators.

If a screen cannot stay Interactive at this size, it is not done.

---

# 74. Multi-Year Reports

Multi-year analysis is Heavy. Run async. Show progress.

Do not compute a five-year PDF on the UI thread or inside `GET /reports` without a job.

---

# 75. Export Performance

```text
CSV / JSON export of a page   Acceptable
Full backup                   Async
Encrypted archive             Async
```

Exports must not lock the ledger against new entries.

---

# 76. Import Performance

Imports (future bank CSV / statements) stream and batch.

```text
Parse chunk
Validate
Insert in transactions
Checkpoint progress
```

Do not load a 20 MB statement as one string on a low-end phone.

---

# 77. Concurrent Writes

Ledger mutations must remain correct under overlap:

```text
Double tap save
Retry after timeout
Sync vs local edit
Two devices (Phase 6)
```

Transfers are atomic. Speed does not justify two-step unguarded updates.

---

# 78. Transfer Atomicity vs Latency

A transfer is one business operation:

```text
Source - X
Destination + X
Same local/cloud transaction
```

Accept a few extra milliseconds. Do not split into two independent writes for speed.

---

# 79. Worker Scaling

Scale workers by queue depth and latency, not by guessing.

Workers are stateless regarding the ledger. PostgreSQL holds truth.

---

# 80. Horizontal API Scaling

The API must be stateless (`DEPLOYMENT.md`).

Session data, if any, lives in Redis or the database — not in process memory that breaks at replica count 2.

---

# 81. Connection Pooling

```text
Prisma pool sized to Postgres max_connections
Workers and API do not starve each other
Health checks do not leak connections
```

Pool exhaustion looks like "the app is slow." Measure it.

---

# 82. Timeouts

Every I/O boundary has a timeout:

```text
HTTP client
Prisma
Redis
Object storage
AI provider
Email / push
```

No infinite wait. Prefer fail + retry/idempotency over hanging a user.

---

# 83. Backpressure

When overloaded:

```text
Shed AI first
Shed non-critical reports
Keep transaction create and health
```

Return explicit errors. Do not silently drop ledger writes.

---

# 84. Load Testing

Load tests use synthetic data.

Cover:

```text
Transaction create
Transaction list
Balance read
Sync batch (when it exists)
Health
```

Do not use real user financial data.

See `TESTING.md` load-testing layer.

---

# 85. Stress Testing

Stress exceeds expected load to observe:

```text
Graceful degradation
Timeouts
Queue growth
Error rates
Recovery after load drops
```

The goal is not a vanity max RPS number.

---

# 86. Soak Testing

Run a Typical or Large dataset for a long window to catch:

```text
Memory leaks
Queue leaks
Connection leaks
SQLite file growth surprises
```

Especially important on mobile.

---

# 87. Mobile Device Matrix

Performance sign-off includes at least:

```text
One low-end Android
One current mid-range Android
```

Network conditions:

```text
Offline
Slow 3G
Flaky wifi
```

---

# 88. Network Simulation

Test:

```text
Offline entry
Online catch-up
Timeouts
Partial responses
```

Core finance must remain Interactive while offline.

---

# 89. Performance Testing Ownership

```text
Unit / microbench   packages/types money ops
Device tests        list scroll, save latency
API tests           p95 on staging
Load tests          CI or scheduled, not every PR unless gated
```

Critical domain PRs may require extra suites (`TESTING.md`).

---

# 90. CI Performance Gates

Every PR already runs:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Do not add multi-minute load tests to every PR.

Add:

```text
Microbenchmarks for money if they stay fast
Bundle / list-size budgets when they exist
Scheduled staging load jobs
```

A regression that makes save-transaction Slow is a release blocker once measured.

---

# 91. Production Monitoring

When cloud exists, observe:

## Application

```text
Startup
Crashes
API latency
Error rate
```

## Database

```text
Connection health
Slow queries
Migration status
```

## Jobs

```text
Queue depth
Failure rate
Retry count
```

## Sync

```text
Success rate
Conflict rate
Failed operations
```

## AI

```text
Latency
Errors
Token usage where available
Provider availability
```

---

# 92. Application Metrics

Minimum API metrics:

```text
Request rate
p50 / p95 / p99 latency by route
Error rate by route
In-flight requests
```

Minimum mobile metrics (privacy-preserving):

```text
Cold start
Save transaction duration
List frame drops if measurable
Crash-free sessions
```

Do not ship raw financial amounts to analytics vendors.

---

# 93. Database Metrics

```text
Slow query log
Index usage
Locks / waits
Replication lag if any
Disk growth
```

A new slow query on `transactions` is a performance incident.

---

# 94. Sync Metrics

```text
Operations pending
Operations failed
Conflict count
Catch-up duration
Bytes per session
```

---

# 95. AI Metrics

```text
Provider latency
Timeout rate
Cache hit rate
Fallback rate
```

AI outage must not increment transaction-create error rate.

---

# 96. Alerts

Alert on:

```text
p95 transaction create above budget
Error rate spike
Queue depth / oldest job
Postgres connection saturation
Sync failure rate
Disk / backup failures
```

Do not alert on AI latency as if it were ledger availability.

---

# 97. Profiling

Profile before rewriting architecture.

```text
React Native / JS CPU
SQLite EXPLAIN QUERY PLAN
Postgres EXPLAIN ANALYZE
API flamegraphs on staging
```

Guessing is not a strategy (`DEC-019` analogue: simplest optimization that is measured).

---

# 98. Regression Policy

A performance regression is a defect when it:

```text
Moves a P0 path out of its latency class
Makes Large datasets unusable on low-end devices
Turns a synchronous path into an unbounded wait
```

Fix with a test or benchmark where practical (`TESTING.md` flaky/regression policy).

---

# 99. Optimization Rule

```text
Measure
  ↓
Identify the actual bottleneck
  ↓
Change the smallest thing
  ↓
Re-measure
  ↓
Keep correctness tests green
```

Forbidden optimizations:

```text
IEEE floats for money
Last-write-wins on ledger conflicts
Removing indexes that writes "feel slow"
Blocking the UI on AI
```

---

# 100. Acceptance Criteria

Performance is acceptable when:

```text
Transaction entry stays Interactive on low-end Android
Lists stay smooth at 10,000+ rows with pagination
Search stays local and indexed
Balances match the ledger and remain cheap
Health stays cheap
AI / reports / forecasts never block saves
Heavy work is async with feedback
Budgets are monitored once cloud exists
```

---

# 101. Mobile Acceptance Criteria

```text
[ ] Cold start reaches a usable screen without analytics/AI
[ ] Save transaction does not require network
[ ] Tab navigation feels Instant
[ ] Transaction list is virtualized and paged
[ ] Search does not load the full table into JS
[ ] Home totals do not scan the entire ledger in UI code
[ ] Memory stable on soak with Large dataset
[ ] Receipts do not decode full-resolution images in lists
```

---

# 102. API Acceptance Criteria

```text
[ ] Health has no heavy dependencies
[ ] Finance mutations persist then enqueue side effects
[ ] Collections are paginated
[ ] No N+1 on list/report paths
[ ] Indexes match real queries
[ ] Redis is not used as a ledger
[ ] Timeouts exist on every I/O boundary
[ ] Overload sheds AI before transaction create
```

---

# 103. Performance Checklist

```text
[ ] P0 paths mapped to latency classes
[ ] SQLite indexes exist for list/search
[ ] Virtualized lists
[ ] Decimal money unchanged
[ ] Async boundary documented for reports/AI/sync
[ ] Cache keys include version + input hash
[ ] Load test plan uses synthetic data
[ ] Dashboards/alerts planned for Phase 6
```

---

# 104. Final Performance Principle

> **The save-transaction path must stay correct and local. Everything else may be slower, cached, or asynchronous — never the other way around.**

```text
Correct Ledger
+
Fast Entry
+
Paged History
+
Measured Budgets
+
Async Intelligence
```

---

# 105. Relationship With Other Engineering Documents

```text
DEVELOPMENT_GUIDELINES.md
        ↓
TESTING.md
        ↓
PERFORMANCE.md
        ↓
DEPLOYMENT.md
```

This document defines **how fast and how large** the system should remain.

`TESTING.md` defines how to prove it.

`DEPLOYMENT.md` defines how production is run, scaled, and observed.

Related specifications:

```text
docs/architecture/SYSTEM_ARCHITECTURE.md
docs/architecture/LOCAL_STORAGE.md
docs/architecture/DATABASE.md
docs/architecture/API.md
docs/architecture/SYNC_ARCHITECTURE.md
docs/product/REPORTING.md
docs/ai/AI.md
docs/ai/AI_FORECASTING.md
docs/MEDIA_FILES.md
```

The next engineering document is:

```text
docs/engineering/DEPLOYMENT.md
```

It should define environments, packaging, migrations, rollback, and production operations. That document already exists as an approved baseline.
