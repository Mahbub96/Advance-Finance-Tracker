# Personal Finance — Synchronization Architecture

**Document:** `SYNC_ARCHITECTURE.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Mobile:** React Native + Expo + TypeScript  
**Local Database:** SQLite  
**Backend:** NestJS + TypeScript  
**Server Database:** PostgreSQL + Prisma  
**Cache / Queue:** Redis  
**Synchronization Model:** Offline-first, local-first, eventually synchronized

---

# 1. Purpose

This document defines the synchronization architecture between local device storage and the cloud backend.

The synchronization system must allow users to:

- use the application offline
- create and edit financial records locally
- continue using the application during network failures
- synchronize changes when connectivity returns
- use multiple devices in the future
- recover from failed synchronization
- avoid duplicate financial records
- detect material conflicts
- retain financial correctness

The core principle is:

> **The user's local financial experience must never depend on immediate network availability.**

---

# 2. Synchronization Goals

The synchronization system must provide:

- Offline-first operation
- Durable local mutations
- Reliable upload
- Reliable download
- Idempotency
- Conflict detection
- Conflict resolution
- Retry with backoff
- Multi-device readiness
- Deletion propagation
- Version tracking
- Observability
- Safe recovery

---

# 3. Non-Goals

Synchronization is not responsible for:

- Calculating financial truth independently
- Replacing the local database
- Replacing PostgreSQL
- Running AI calculations
- Replacing transaction validation
- Acting as a generic message broker

The synchronization layer transports and reconciles application state.

---

# 4. Synchronization Model

The preferred model is:

```text
                 ┌───────────────────────┐
                 │       Backend         │
                 │                       │
                 │ PostgreSQL            │
                 │ Sync Service          │
                 └──────────┬────────────┘
                            │
                  HTTPS / API Requests
                            │
             ┌──────────────┴──────────────┐
             │                             │
        Device A                       Device B
             │                             │
       SQLite + Queue                SQLite + Queue
```

Every device maintains a local representation of the user's synchronized data.

The backend maintains the authoritative cloud state.

---

# 5. Source-of-Truth Model

There are two operational truths depending on context.

## Local Operational Truth

For immediate offline interaction:

```text
SQLite
```

## Cloud Synchronization Truth

For synchronized multi-device state:

```text
PostgreSQL
```

A local device must never wait for PostgreSQL to confirm an ordinary offline-capable financial action.

---

# 6. Core Synchronization Flow

For a local mutation:

```text
User Action
   ↓
Validate
   ↓
SQLite Transaction
   ├── Update Business Record
   └── Create Sync Operation
   ↓
Commit
   ↓
Update UI
   ↓
Sync Worker
   ↓
API
```

The business record and corresponding sync operation should be committed atomically when synchronization is enabled.

---

# 7. Sync Operation Lifecycle

A sync operation may use states such as:

```text
PENDING
UPLOADING
ACKNOWLEDGED
FAILED_RETRYABLE
CONFLICT
FAILED_PERMANENT
CANCELLED
```

Example:

```text
PENDING
   ↓
UPLOADING
   ↓
ACKNOWLEDGED
```

Failure:

```text
UPLOADING
   ↓
FAILED_RETRYABLE
   ↓
PENDING
```

Conflict:

```text
UPLOADING
   ↓
CONFLICT
```

---

# 8. Sync Operation Structure

A local sync operation should conceptually contain:

```text
operation_id
device_id
user_id
entity_type
entity_id
operation_type
entity_version
payload
payload_hash
created_at
attempt_count
last_attempt_at
next_attempt_at
status
last_error
```

The exact schema belongs to the database implementation.

---

# 9. Operation Types

Supported mutation types:

```text
CREATE
UPDATE
DELETE
RESTORE
```

Future types may include domain-specific operations where necessary, but generic CRUD synchronization should remain the default.

---

# 10. Why Stable Operation IDs Matter

Every mutation gets a stable `operation_id`.

Example:

```text
Device
   ↓
Create Expense
   ↓
operation_id = abc-123
```

If the device retries the same request three times:

```text
abc-123
abc-123
abc-123
```

the server must recognize them as the same operation.

This prevents duplicate financial mutations.

---

# 11. Entity IDs

Entities must use stable IDs generated before synchronization.

Preferred:

```text
UUID
```

This allows:

- offline creation
- direct references
- multi-device synchronization
- deterministic reconciliation

---

# 12. Versioning

Synchronizable entities should have a version or equivalent concurrency mechanism.

Example:

```text
entity_version = 7
```

A device editing version 7 attempts to update version 8.

The server can identify that the local copy is stale.

---

# 13. Optimistic Concurrency

Preferred server behavior:

```text
Client:
Update Transaction
Expected Version: 7

Server:
Current Version: 8

Result:
CONFLICT
```

The server must not blindly overwrite version 8 with stale version 7 data.

---

# 14. Server Revision

The backend may maintain a server-side revision sequence or change cursor.

Example:

```text
server_revision = 100245
```

Each accepted change advances the revision.

Clients can then request:

```text
Give me changes after revision 100240
```

This is more efficient than downloading the complete dataset repeatedly.

---

# 15. Change Feed

The server should maintain a synchronized change stream or equivalent queryable change history.

Conceptually:

```text
Change Feed
├── revision
├── entity_type
├── entity_id
├── operation
├── entity_version
├── changed_at
└── user_scope
```

The implementation may use a dedicated change-log table initially.

---

# 16. Initial Sync

When a new device is connected:

```text
Authenticate
   ↓
Register Device
   ↓
Fetch Initial Dataset
   ↓
Build Local Database
   ↓
Record Sync Cursor
   ↓
Ready
```

The initial dataset should be transferred in pages/chunks rather than as an unbounded response.

---

# 17. Incremental Sync

After initial sync:

```text
Last Cursor
   ↓
Request Changes Since Cursor
   ↓
Receive Changes
   ↓
Apply Locally
   ↓
Advance Cursor
```

Example:

```text
Client Cursor: 100240

Server:
Changes 100241 → 100255

Client applies
↓
New Cursor: 100255
```

---

# 18. Bidirectional Sync

A complete sync cycle may contain both directions:

```text
Device → Server
Server → Device
```

Preferred sequence:

```text
1. Upload pending local changes
2. Resolve upload conflicts
3. Download server changes
4. Apply local updates
5. Update sync cursor
6. Mark local operations complete
```

The exact ordering may be adjusted for conflict and consistency requirements.

---

# 19. Upload Pipeline

```text
Local Queue
   ↓
Select Batch
   ↓
Validate
   ↓
Send to API
   ↓
Server Process
   ↓
Receive Per-Operation Result
   ↓
Mark:
  ACK / CONFLICT / RETRY / FAILED
```

A batch should be bounded to avoid excessive memory use or long requests.

---

# 20. Download Pipeline

```text
Request Changes
   ↓
Receive Page
   ↓
Validate
   ↓
Apply in Local Transaction
   ↓
Update Cursor
   ↓
Request Next Page
```

The local database should not advance the cursor before the corresponding page has been safely committed.

---

# 21. Atomic Cursor Advancement

This is critical.

The following should be atomic:

```text
Apply Change Page
+
Persist New Cursor
```

Otherwise a crash could produce:

```text
Cursor says:
100250

Local data only has:
100245
```

leading to lost changes.

---

# 22. Sync Queue Durability

The queue must survive:

- application restart
- device restart
- process termination
- temporary database lock
- network failure

Pending changes must remain durable until acknowledged or deliberately resolved.

---

# 23. Retry Strategy

Retryable failures should use exponential backoff.

Example concept:

```text
Attempt 1 → 5s
Attempt 2 → 15s
Attempt 3 → 1m
Attempt 4 → 5m
Attempt 5 → 15m
```

Exact values should be configurable.

Retry intervals should include jitter to prevent synchronized retries.

---

# 24. Retryable Failures

Potential retryable failures:

- network unavailable
- timeout
- temporary server error
- rate limiting
- temporary provider failure
- database connectivity issue

---

# 25. Permanent Failures

Potential permanent failures:

- malformed payload
- unauthorized operation
- invalid entity reference
- unsupported schema version
- invalid financial state

Permanent failures should not loop indefinitely.

---

# 26. Authentication Failure During Sync

If authentication expires:

```text
Sync
 ↓
401 / Session Expired
 ↓
Refresh Session
 ↓
Retry
```

If refresh fails:

```text
Stop Cloud Sync
Keep Local Data Available
Notify User
```

The user's local financial data must remain accessible.

---

# 27. Offline Detection

The application should distinguish:

```text
No Network
```

from:

```text
Network Available
but Server Unreachable
```

The sync system should react appropriately.

---

# 28. Connectivity Recovery

When connectivity returns:

```text
Connectivity Restored
   ↓
Start Sync
   ↓
Upload Pending
   ↓
Download Changes
   ↓
Update Status
```

The system should avoid launching many duplicate sync processes.

---

# 29. Sync Lock

Only one synchronization process should coordinate the same account/device at a time.

Possible states:

```text
IDLE
SYNCING
WAITING
```

A second sync trigger while one is active should normally be coalesced rather than run in parallel.

---

# 30. Sync Triggers

Synchronization may start from:

- App launch
- App resume
- Connectivity restored
- User pull-to-refresh
- Periodic background task
- Successful local mutation when online
- Manual sync action

Triggers should be deduplicated.

---

# 31. Manual Sync

The user may be able to trigger:

```text
Settings
 ↓
Sync
 ↓
Sync Now
```

The system should provide clear status.

Example:

```text
Syncing...
3 changes pending
```

---

# 32. Sync Status UX

Recommended states:

```text
✓ Up to date
↻ Syncing
• Changes pending
! Sync issue
```

For user-facing error:

> "Some changes couldn't be synchronized. Your local data is safe."

---

# 33. Conflict Types

Conflicts can occur when:

1. Same record changed on two devices.
2. Same field changed differently.
3. One device deletes while another edits.
4. Related records change inconsistently.
5. Version history diverges.

---

# 34. Conflict Resolution Strategy

Preferred order:

```text
Non-overlapping changes
        ↓
Automatic merge

Safe domain-specific merge
        ↓
Automatic resolution

Material financial conflict
        ↓
User review
```

Never use blind last-write-wins for financially significant records without explicit evaluation.

---

# 35. Why Last-Write-Wins Is Not Enough

Example:

Device A:

```text
Expense = ৳500
```

Device B:

```text
Expense = ৳5,000
```

A timestamp-based winner may silently destroy the user's intended correction.

Financial records require stronger conflict semantics.

---

# 36. Field-Level Conflict

For some records, field-level merging may be safe.

Example:

Device A changes:

```text
note
```

Device B changes:

```text
category
```

These can potentially be merged.

However, changes to:

- amount
- account
- transaction type
- repayment amount

require greater caution.

---

# 37. Financial Conflict Rules

High-risk fields include:

```text
amount
currency
account
transaction type
lending relation
borrowing relation
repayment amount
transaction date
```

Conflicts involving these fields should generally require deterministic domain handling or explicit user review.

---

# 38. Delete vs Update Conflict

Example:

```text
Device A:
Delete Transaction

Device B:
Edit Transaction
```

The system should not silently choose based only on timestamp.

Possible resolution:

```text
Conflict
 ↓
Preserve both states internally
 ↓
User Review
```

The exact user experience will be defined later.

---

# 39. Delete Propagation

A deleted record needs a synchronization tombstone or equivalent metadata.

Example:

```text
entity_id
deleted_at
version
```

Without a tombstone, another device may incorrectly recreate the deleted record.

---

# 40. Tombstone Lifecycle

A tombstone must be retained long enough for all active clients to observe the deletion.

Only after safe retention conditions are met may permanent cleanup occur.

The final retention strategy should be defined based on multi-device behavior.

---

# 41. Soft Delete and Sync

For synchronized records:

```text
DELETE
```

may initially mean:

```text
deleted_at = timestamp
```

The record remains synchronizable even though normal application queries hide it.

---

# 42. Restore

If a deleted record is restored:

```text
deleted_at = null
version++
```

The operation must synchronize like any other mutation.

---

# 43. Conflict on Restore

Restore conflicts should be treated as material if the record changed significantly while deleted.

Avoid blindly reviving stale data.

---

# 44. Relationship Integrity During Sync

Example:

```text
Transaction → Account
```

The client should not apply a transaction that references an unknown account without a controlled resolution path.

Possible approach:

```text
Receive Transaction
   ↓
Missing Account
   ↓
Queue Pending Dependency
   ↓
Fetch / Apply Account
   ↓
Apply Transaction
```

---

# 45. Dependency Ordering

When changes have dependencies, apply them in an appropriate order.

Example:

```text
Create Account
   ↓
Create Transaction
```

not:

```text
Create Transaction
   ↓
Create Account
```

The sync engine may topologically order changes where possible.

---

# 46. Batch Ordering

Within a device mutation sequence:

```text
Create
 ↓
Update
 ↓
Delete
```

ordering may matter.

The sync engine should preserve causality when needed.

---

# 47. Server Conflict Response

A useful conflict response should include:

```text
operation_id
entity_id
conflict_type
server_version
server_snapshot
client_snapshot
```

Sensitive data should be included only as required.

---

# 48. Client Conflict UI

The conflict UI should be human-readable.

Avoid:

> "OptimisticConcurrencyException"

Prefer:

> "This transaction was changed on another device."

Then show:

```text
Your version
Other device version
```

with a safe resolution action.

---

# 49. User Resolution

Possible actions:

```text
Keep Mine
Use Other Version
Review Changes
Cancel
```

For critical financial conflicts, the user may need to explicitly confirm the final result.

---

# 50. Sync Recovery

If sync becomes inconsistent:

```text
Detect Error
   ↓
Stop Unsafe Sync
   ↓
Preserve Local Data
   ↓
Preserve Server Data
   ↓
Offer Recovery / Reconciliation
```

Do not auto-delete local data to "fix" synchronization.

---

# 51. Full Resync

The system should support a controlled full resync.

Use cases:

- local sync metadata corruption
- unsupported schema migration
- irrecoverable cursor error
- user-requested repair

Flow:

```text
Validate Account
   ↓
Download Authoritative Dataset
   ↓
Rebuild Local Database
   ↓
Verify
   ↓
Set New Cursor
```

A full resync should preserve unsynced local changes through a safe export/staging process before replacement.

---

# 52. Local Unsynced Data During Full Resync

Before rebuilding local state:

```text
Pending Local Changes
   ↓
Freeze
   ↓
Backup / Stage
   ↓
Sync or Reconcile
   ↓
Rebuild
```

No unsynced financial data should be silently discarded.

---

# 53. Multi-Device Model

A user may eventually have:

```text
Android Phone
iPhone
Web
Tablet
```

Each device has:

```text
device_id
last_sync_cursor
local database
sync queue
```

The server coordinates the synchronized state.

---

# 54. Device Registration

When cloud mode is enabled:

```text
Login
 ↓
Register Device
 ↓
Receive device_id
 ↓
Initial Sync
```

A device may later be revoked.

---

# 55. Device Revocation

If a device is revoked:

```text
Device
 ↓
Sync Request
 ↓
Rejected
 ↓
Local Data Remains Available
 ↓
User Prompt
```

Revocation should not automatically delete local financial data unless the user explicitly chooses a remote wipe feature in the future.

---

# 56. Remote Wipe

Future capability.

A remote wipe would require:

- explicit user action
- strong authentication
- device identification
- secure deletion workflow

This should not be part of the initial implementation.

---

# 57. Server Change Ordering

The backend should provide a stable ordering for changes.

A monotonically increasing revision is a strong initial option:

```text
1001
1002
1003
...
```

Clients use it as a synchronization cursor.

---

# 58. Change Retention

The server must retain enough change history for active clients to synchronize.

If a client is too far behind:

```text
Cursor expired
```

the server may require a full resync.

---

# 59. Cursor Expiration

Example:

```text
Client cursor:
500

Server retained history:
900 → current
```

The server responds:

```text
FULL_RESYNC_REQUIRED
```

The client must then follow the controlled full-resync flow.

---

# 60. Data Compression

Large sync payloads may be compressed over HTTP where supported.

Compression is particularly useful for:

- initial synchronization
- large change batches
- backup transfer

The implementation should measure whether complexity is justified.

---

# 61. Pagination

Both upload and download should be bounded.

Example:

```text
Page 1
Page 2
Page 3
...
```

The client must not assume that all changes fit into memory.

---

# 62. Sync Payload Versioning

Synchronization payloads should have a version.

Example:

```text
schemaVersion: 2
```

This allows future compatibility.

Unsupported payload versions must produce controlled failures rather than silent misinterpretation.

---

# 63. API Compatibility

The sync protocol should be versioned independently where necessary.

Potential:

```text
/api/v1/sync
```

Breaking synchronization changes should require migration planning.

---

# 64. Sync Security

All synchronization traffic must use secure transport.

The server must verify:

- authenticated user
- device ownership
- entity ownership
- operation authorization
- payload validity

A client must never be able to synchronize another user's records by manipulating IDs.

---

# 65. Sync Privacy

Sync payloads should contain only required data.

Sensitive fields should not be included unless necessary.

Logs must not contain full synchronization payloads.

---

# 66. Sync Rate Limiting

Protect synchronization endpoints from:

- malformed clients
- repeated retries
- abusive devices
- accidental infinite loops

Rate limits should allow normal reconnect/sync behavior.

---

# 67. Sync and Notifications

Notifications should not be duplicated due to sync.

For example:

```text
Repayment Due
```

may be represented as a business event.

Only the designated notification system should create the user-facing reminder.

---

# 68. Sync and AI

AI-generated insights should generally not be synchronized as authoritative financial records.

Possible strategy:

```text
Financial Data
   ↓
Sync
   ↓
Each Device Can Regenerate AI
```

or:

```text
Server Generates Insight
   ↓
Sync Insight
```

The final decision depends on privacy, performance, and whether insights need cross-device consistency.

---

# 69. Sync and Forecasts

Forecasts may be:

- recomputed locally
- computed server-side
- cached server-side

Forecast records should include:

```text
model_version
input_snapshot_hash
generated_at
```

so stale forecasts can be identified.

---

# 70. Sync Telemetry

The system should monitor:

- sync duration
- pending operations
- failed operations
- conflict frequency
- full resync frequency
- average queue size
- retry counts

Do not include sensitive transaction content in telemetry.

---

# 71. User-Facing Sync Diagnostics

Advanced users may need:

```text
Last sync
Pending changes
Failed operations
Device
```

The diagnostic UI should avoid exposing technical implementation details unless the user explicitly opens an advanced diagnostic section.

---

# 72. Sync Error Categories

Useful categories:

```text
NETWORK
AUTHENTICATION
AUTHORIZATION
VALIDATION
CONFLICT
SERVER
SCHEMA
STORAGE
UNKNOWN
```

These categories help both UX and observability.

---

# 73. Retry Backoff

Use exponential backoff with jitter.

Concept:

```text
delay = min(maxDelay, baseDelay * 2^attempt) + jitter
```

The exact constants should be tuned after production observations.

---

# 74. Queue Ordering

Prefer:

```text
Older pending operations
        ↓
Newer operations
```

while preserving entity causality.

A newer operation must not be uploaded ahead of an older operation if doing so would violate the server's expected state.

---

# 75. Coalescing Safe Updates

Some local updates may be safely coalesced.

Example:

```text
Rename Goal:
A → B
B → C
C → D
```

Instead of synchronizing all intermediate names, the system may send:

```text
A → D
```

only when domain semantics make this safe.

Do not coalesce financial mutations such as independent transactions or repayments.

---

# 76. Duplicate Detection During Sync

Duplicate prevention should happen at multiple layers:

```text
Client operation_id
+
Server idempotency
+
Unique domain constraints
```

This defense-in-depth approach prevents accidental double creation.

---

# 77. Reconciliation

The system should support reconciliation checks.

Examples:

```text
Local Transaction Count
vs
Expected Server State

Local Account Balance
vs
Derived Balance

Local Sync Cursor
vs
Server Revision
```

Reconciliation should identify inconsistency without automatically deleting data.

---

# 78. Financial Reconciliation After Sync

After important sync events, the client may recompute:

- balances
- budgets
- goals
- lending balances
- borrowing balances

from local source data.

This helps repair stale derived caches.

---

# 79. Sync Performance Strategy

Priority order:

1. Financial correctness
2. Durable synchronization
3. Reasonable latency
4. Battery efficiency
5. Network efficiency

Do not optimize network traffic at the cost of financial correctness.

---

# 80. Battery Considerations

Background synchronization must be battery-conscious.

Avoid:

- constant polling
- aggressive wakeups
- redundant sync attempts

Prefer platform-supported background mechanisms and event-triggered synchronization.

---

# 81. Background Sync Limitations

Mobile operating systems may restrict background execution.

Therefore:

> The application must not assume continuous background synchronization.

Data must remain safe even when the app cannot run in the background for long periods.

---

# 82. Sync on App Resume

App resume is a reliable synchronization opportunity.

Suggested behavior:

```text
App Resume
   ↓
Check Connectivity
   ↓
If Needed:
   Start Sync
```

Sync should not significantly delay the initial display of local data.

---

# 83. Sync During App Launch

The application should load local financial data first.

Preferred:

```text
Launch
 ↓
Local DB
 ↓
Render UI
 ↓
Background Sync
```

Not:

```text
Launch
 ↓
Wait for API
 ↓
Render UI
```

---

# 84. Offline-First Startup

Even with no network:

```text
Launch
 ↓
Load Local DB
 ↓
Render Home
```

The user should be able to continue using the core application.

---

# 85. Sync and App Updates

After an application update:

```text
App Update
 ↓
Local DB Migration
 ↓
Sync Protocol Compatibility Check
 ↓
Sync
```

If the new client cannot safely synchronize with the server:

```text
Pause Sync
 ↓
Prompt / Recovery
```

Do not risk data corruption.

---

# 86. Sync and Backend Deployment

Backend migrations should be designed so that older mobile clients remain functional during rollout where practical.

Avoid deploying breaking synchronization changes without version negotiation.

---

# 87. Version Negotiation

The sync client may send:

```text
appVersion
protocolVersion
schemaVersion
```

The server can determine whether the device is compatible.

---

# 88. Sync Protocol Evolution

When the protocol changes:

```text
Protocol v1
 ↓
Protocol v2
```

The server may temporarily support both versions during migration.

Eventually older clients can be deprecated intentionally.

---

# 89. Sync Testing

Critical scenarios:

## Network

- No network
- Slow network
- Intermittent network
- Timeout
- Server unavailable

## Data

- Create offline
- Edit offline
- Delete offline
- Restore offline
- Multiple changes to same entity

## Devices

- One device
- Two devices
- Three devices
- Device revoked

## Conflicts

- Same record
- Same field
- Delete vs update
- Related entities

## Recovery

- App crash
- Device restart
- Worker restart
- Partial batch failure
- Full resync

---

# 90. Sync Failure Simulation

Testing should intentionally simulate:

```text
Upload timeout
Server 500
401
403
409 Conflict
Payload validation failure
Database failure
Network loss mid-batch
App termination mid-sync
```

The goal is to prove that financial data remains safe.

---

# 91. Sync Security Testing

Verify:

- Users cannot sync another user's entities.
- Device IDs cannot be forged to gain access.
- Deleted records cannot be resurrected improperly.
- Stale writes are rejected safely.
- Replay attacks do not duplicate operations.
- Authorization is enforced per entity.

---

# 92. Sync Observability Dashboard

Production monitoring should be able to answer:

- How many devices are syncing?
- How many operations are pending?
- What is the conflict rate?
- How long does sync take?
- Which errors occur most often?
- How often are full resyncs required?
- Are specific app versions failing?

---

# 93. Sync Quality Metrics

Important metrics:

```text
Sync Success Rate
Conflict Rate
Average Sync Duration
Pending Queue Size
Retry Count
Full Resync Rate
Failed Operation Rate
```

Privacy-sensitive payload content should never be required for these metrics.

---

# 94. Sync Anti-Patterns

Avoid:

- Last-write-wins for all financial data
- Full database download on every sync
- Synchronous network dependency during transaction entry
- Deleting local data to resolve conflicts
- Advancing cursor before local commit
- Unbounded sync payloads
- Non-idempotent retry behavior
- Ignoring delete tombstones
- Running duplicate sync workers
- Assuming background execution is guaranteed
- Logging raw financial synchronization payloads

---

# 95. Recommended Initial Implementation

The first cloud-sync version should implement:

```text
Stable UUIDs
+
Local Sync Queue
+
Operation IDs
+
Server Entity Version
+
Server Change Revision
+
Upload Batches
+
Incremental Download
+
Retry with Backoff
+
Delete Tombstones
+
Basic Conflict Detection
+
Manual / Automatic Sync Trigger
```

Start with deterministic conflict rules.

Do not begin with a highly complex distributed synchronization framework.

---

# 96. Recommended Conflict Scope for First Release

Initial synchronization should prefer conflict strategies appropriate for the entity.

### Low-Risk Configuration

Examples:

- Category label
- Tag color
- Display order

May use simpler merge semantics.

### Financial Records

Examples:

- Transaction amount
- Account
- Transaction type
- Repayment

Require strict version checks and safer conflict handling.

---

# 97. Sync Architecture Quality Bar

The synchronization system is acceptable when:

- Offline financial operations remain fully usable.
- Local mutations are durable.
- Every cloud mutation is idempotent.
- Server state can be incrementally downloaded.
- Cursor advancement is atomic with local application.
- Conflicts are detected rather than silently overwritten.
- Deletions propagate safely.
- Retries cannot duplicate financial records.
- Multiple devices can converge on a consistent state.
- Full resync is available as a recovery mechanism.
- Background execution limitations do not threaten data integrity.
- Synchronization failures never destroy local financial data.

---

# 98. Relationship With Other Architecture Documents

Architecture sequence:

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

This document defines **how local and cloud financial state converge safely**.

The next document is:

```text
docs/architecture/API.md
```

It should define:

- REST conventions
- endpoint catalog
- request/response contracts
- authentication
- authorization
- pagination
- filtering
- errors
- idempotency
- sync endpoints
- file endpoints
- AI endpoints
- API versioning
- rate limiting

The API should expose stable domain operations rather than leaking the underlying database schema.
