# Personal Finance — Deployment Engineering

**Document:** `DEPLOYMENT.md`  
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
**Primary Deployment Target:** Linux server / cloud VM  
**Mobile Release Target:** Android-first  
**Future Mobile Target:** iOS

---

# 1. Purpose

This document defines the production deployment strategy for the Personal Finance application.

The deployment architecture must provide:

```text
Repeatability
Security
Zero / Low Downtime
Rollback
Observability
Data Protection
Environment Isolation
```

The deployment process must protect the most important assets:

```text
Financial Data
Authentication
User Privacy
Database Integrity
File Attachments
AI Credentials
Sync State
```

The core principle is:

> **Every production deployment must be reproducible, observable, reversible, and safe for financial data.**

---

# 2. Deployment Scope

This document covers:

```text
Development Environment
Staging Environment
Production Environment
Backend Deployment
Database Deployment
Redis Deployment
Object Storage
Worker Deployment
Nginx / Reverse Proxy
TLS
Secrets
CI/CD
Docker
Database Migrations
Backups
Monitoring
Health Checks
Rollback
Disaster Recovery
Android Builds
Future iOS Builds
Release Management
```

---

# 3. Environment Strategy

Minimum environments:

```text
Development
Staging
Production
```

Each environment must have isolated:

```text
Database
Redis
Object Storage
AI Credentials
Email Credentials
Push Configuration
JWT / Auth Secrets
Monitoring
```

Never reuse production infrastructure for development or ordinary testing.

---

# 4. Environment Characteristics

### Development

Purpose:

```text
Local Feature Development
Debugging
Unit / Integration Testing
```

Typical infrastructure:

```text
PostgreSQL
Redis
Local Object Storage / Test Bucket
NestJS
Expo
```

### Staging

Purpose:

```text
Production-like Validation
E2E Tests
Migration Validation
Release Candidate Testing
Performance Testing
```

Staging should resemble production architecture as closely as reasonably possible.

### Production

Purpose:

```text
Real Users
Real Financial Data
Production AI / Email / Push
Production Monitoring
Backups
Disaster Recovery
```

Production must use dedicated credentials and infrastructure.

---

# 5. Repository Deployment Structure

Current repository:

```text
Advance-Finance-Tracker/
├── apps/
│   ├── api/
│   └── mobile/
│
├── packages/
│   ├── api-client/
│   ├── config/
│   ├── eslint-config/
│   ├── types/
│   └── validation/
│
├── infrastructure/
│   ├── docker/
│   ├── monitoring/
│   ├── nginx/
│   └── scripts/
│
├── docs/
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

Deployment-related automation belongs primarily in:

```text
infrastructure/
```

and CI configuration in the repository's CI platform configuration.

---

# 6. Production Architecture

Recommended baseline:

```text
Internet
│
▼
DNS / Domain
│
▼
Nginx / TLS
│
▼
API / Web Layer
│
┌─────────────┼─────────────┐
▼             ▼             ▼
PostgreSQL      Redis       Object Storage
│             │             │
│             ▼             │
│        Background Jobs    │
│             │             │
└─────────────┼─────────────┘
▼
External Services
┌────────────┼────────────┐
▼            ▼            ▼
AI          Email        Push
```

---

# 7. Deployment Components

Production should conceptually separate:

```text
API
Worker
PostgreSQL
Redis
Nginx
Object Storage
Monitoring
Backup
```

The exact infrastructure may combine components on one host initially, but the logical responsibilities must remain separated.

---

# 8. Initial Deployment Topology

A cost-effective first production setup may use:

```text
1 Linux Application Server
1 Managed or Dedicated PostgreSQL
1 Redis Instance
1 Object Storage Bucket
1 Reverse Proxy
```

As usage grows, separate:

```text
API
Workers
Database
Redis
```

into independently scalable resources.

---

# 9. Docker Strategy

Production containers should use pinned, reproducible versions.

Avoid:

```text
latest
```

for critical infrastructure.

Prefer explicit image versions.

---

# 10. API Container

The API container should:

```text
Install Production Dependencies
Build TypeScript
Run Prisma Generation
Start NestJS
Expose Health Endpoint
```

Do not run:

Development Watch Mode

in production.

---

# 11. API Docker Image

Recommended multi-stage flow:

```text
Builder
        ↓
Install Dependencies
        ↓
Build Application
        ↓
Production Image
        ↓
Copy Required Runtime Files
        ↓
Start
```

The production image should contain only what is needed to run the API.

---

# 12. Container User

Production containers should avoid running as root where practical.

Use a non-root application user.

---

# 13. Container Filesystem

The API container should be as immutable as practical.

Persistent data belongs in:

```text
PostgreSQL
Redis
Object Storage
```

not inside the API container filesystem.

---

# 14. API Health Endpoints

Expose at least:

```text
/health
/health/liveness
/health/readiness
Liveness
```

Checks whether the process is alive.

Readiness

Checks whether required dependencies are available for serving traffic.

---

# 15. Health Check Behavior

Readiness may verify:

```text
Database Connectivity
Redis Connectivity where required
Required Configuration
```

Do not expose:

```text
Secrets
Credentials
Internal Connection Strings
```

through health responses.

---

# 16. Graceful Shutdown

The API must gracefully handle:

```text
SIGTERM
SIGINT
```

Shutdown should:

```text
Stop accepting new work
Finish safe in-flight operations
Close DB connections
Close Redis connections
Close queues
Exit
```

This is critical for rolling deployments.

---

# 17. Worker Deployment

Background workers may process:

```text
Notifications
Emails
AI Insights
AI Tasks
Forecasts
Reports
OCR
File Cleanup
Sync Jobs
```

Workers should be independently restartable.

---

# 18. Worker Configuration

Workers should use the same application version as the API where domain contracts require it.

Do not deploy:

```text
API v2
Worker v1
```

when their job payloads are incompatible.

Use versioned job contracts when independent deployment is unavoidable.

---

# 19. Worker Idempotency

Every production worker must define:

```text
Job Identity
Retry Policy
Idempotency
Failure State
```

Financial mutations must never rely on "the job only runs once."

---

# 20. Background Job Retry

Use bounded retries with backoff.

Example:

```text
Attempt 1
        ↓
Failure
        ↓
Backoff
        ↓
Attempt 2
        ↓
Failure
        ↓
Backoff
        ↓
Attempt 3
        ↓
Dead / Manual Review
```

Permanent failures should not retry indefinitely.

---

# 21. PostgreSQL Deployment

PostgreSQL is the authoritative cloud financial database.

Production requirements:

```text
Persistent Storage
Encrypted Storage
Backup
Point-in-Time Recovery where available
Restricted Network Access
Connection Pooling
Monitoring
```

---

# 22. PostgreSQL Availability

Preferred production strategy:

Managed PostgreSQL

when available.

If self-hosted:

```text
Automated Backup
Replication where justified
Disk monitoring
Recovery testing
```

must be implemented.

---

# 23. PostgreSQL Network Security

Database access should be restricted to:

```text
API
Workers
Migration Job
Approved Administrative Access
```

Do not expose PostgreSQL directly to the public internet.

---

# 24. PostgreSQL Credentials

Use separate credentials for:

```text
Application
Migration / Administrative
Monitoring where needed
```

Application credentials should have only required privileges.

---

# 25. Database Migrations

Prisma migrations must be used for schema changes.

Production flow:

```text
Build Version
        ↓
Validate Migration
        ↓
Backup if required
        ↓
Apply Migration
        ↓
Run Smoke Checks
        ↓
Start / Continue Traffic
```

---

# 26. Migration Compatibility

Migrations should prefer expand-and-contract patterns for risky changes.

Example:

```text
Add New Column
        ↓
Deploy Code Supporting Both
        ↓
Backfill
        ↓
Switch Reads/Writes
        ↓
Remove Old Column Later
```

Avoid destructive schema changes that require all clients to update simultaneously.

---

# 27. Destructive Migrations

Extra review is required for:

```text
DROP COLUMN
DROP TABLE
Data Type Change
Data Transformation
Data Deletion
Constraint Tightening
```

Before production:

```text
Backup
Test
Measure
Review
Rollback Plan
must exist.
```

---

# 28. Migration Rollback

Not every migration can be safely reversed.

Therefore define:

```text
+
Data Recovery Plan
```

for every high-risk migration.

Do not assume:

git revert

automatically restores database state.

---

# 29. Seed Data

Production seed operations should be explicitly controlled.

Only create:

```text
Required System Categories
Required System Configuration
```

Do not run development seed data in production.

---

# 30. Redis Deployment

Redis may be used for:

```text
Queue
Caching
Rate Limiting
Temporary State
Distributed Coordination
```

Redis must never become the authoritative source for financial transactions.

---

# 31. Redis Persistence

Choose Redis persistence based on workload.

For queues:

```text
Durability strategy
+
Retry mechanism
+
Recovery strategy
```

must be defined.

If Redis is lost, critical financial truth must remain recoverable from PostgreSQL and sync state.

---

# 32. Object Storage

Files and receipts should use object storage.

Examples:

```text
S3-compatible Storage
Managed Cloud Object Storage
Self-hosted Object Storage
```

The application should use a storage abstraction.

---

# 33. Object Storage Security

Production buckets should be:

```text
Private
Encrypted
Access Controlled
Versioned where useful
```

Do not expose receipt files through public bucket URLs.

---

# 34. Signed File Access

Use short-lived signed URLs for authorized downloads.

The server must verify:

```text
Authenticated User
+
File Ownership
before generating access.
```

---

# 35. Object Storage Lifecycle

Use lifecycle rules for:

```text
Temporary Uploads
Processing Files
Orphan Objects
Deleted Files
Generated Reports
```

Do not purge active user files accidentally.

---

# 36. Nginx Deployment

Nginx may provide:

```text
Reverse Proxy
HTTP Security Headers
Rate Limits where needed
Compression
Static / Health routing
```

---

# 37. Nginx Routing

Example:

```text
api.example.com
        ↓
Nginx
        ↓
NestJS API
```

Avoid exposing internal API ports directly to the internet.

---

# 38. TLS

Production must use HTTPS.

Requirements:

```text
Valid Certificate
Automatic Renewal
HTTP → HTTPS Redirect
Secure TLS Configuration
```

Certificates may use:

```text
Let's Encrypt
Managed Certificate Provider
```

---

# 39. TLS Secrets

Private keys must:

Never be committed

Never be stored in source code

Never appear in logs

---

# 40. Security Headers

```text
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Content-Security-Policy where applicable
```

Exact policy should reflect API/client architecture.

---

# 41. DNS

Production services should use stable DNS records.

Example:

```text
api.example.com
files.example.com
```

The mobile app should reference the stable API domain rather than an IP address.

---

# 42. Deployment Strategy

Preferred backend deployment:

```text
Build
        ↓
Artifact / Image
        ↓
Stage
        ↓
Migration
        ↓
Health Check
        ↓
Traffic
        ↓
Smoke Test
```

The deployment should avoid manual server-side source changes.

---

# 43. Immutable Deployment

Prefer deploying:

Versioned Docker Image

or:

Versioned Build Artifact

rather than:

git pull

followed by ad-hoc production modifications.

---

# 44. Image Tagging

Use immutable tags such as:

```text
v1.4.0
sha-abc1234
2026-08-14-abc1234
```

Avoid:

```text
latest
```

as the only production identifier.

---

# 45. CI/CD Pipeline

Recommended:

```text
Push
        ↓
Lint
        ↓
Typecheck
        ↓
Unit Tests
        ↓
Integration Tests
        ↓
Security Scan
        ↓
Build
        ↓
Container Image
        ↓
Push Registry
        ↓
Deploy Staging
        ↓
E2E / Smoke
        ↓
Production Approval
        ↓
Deploy Production
```

---

# 46. Pull Request CI

Every PR should run:

```text
Lint
Typecheck
Unit
Relevant Integration
Build
```

High-risk changes should trigger:

```text
Migration Checks
Security Tests
Sync Tests
AI Regression
```

---

# 47. Main Branch CI

Main should remain:

```text
Buildable
Tested
Deployable
```

Do not merge known broken production builds.

---

# 48. Production Approval

Production deployment should require a controlled release process.

Depending on team size:

```text
Manual Approval
or
Protected Environment
```

---

# 49. Deployment Version

Every backend deployment should expose a non-sensitive version identifier.

Example:

```text
{
"version": "1.4.0",
"commit": "abc1234"
}
```

This helps correlate behavior with deployments.

---

# 50. Mobile Environment Configuration

Android builds must use environment-specific API configuration.

Example:

```text
Development
→ api-dev.example.com
Staging
→ api-staging.example.com
Production
→ api.example.com
```

Do not hardcode development URLs in production builds.

---

# 51. Expo Environment Strategy

Use separate Expo build profiles for:

```text
development
preview / staging
production
```

The exact profile names should align with the repository's Expo configuration.

---

# 52. Android Build Strategy

Android is the initial release platform.

Preferred production process:

```text
Version
        ↓
Build
        ↓
Sign
        ↓
Validate
        ↓
Release
```

The application should use a controlled Android signing configuration.

---

# 53. Android Signing

Production signing credentials must:

```text
Stay outside source control
Be stored securely
Be backed up securely
Be access-controlled
```

Losing the signing key can make future updates impossible for the same application identity.

---

# 54. Android Versioning

Maintain:

```text
version
versionCode
or Expo equivalents.
```

versionCode must increase for each Android store update.

---

# 55. Android Release Channels

Consider:

```text
Internal
Closed / Beta
Production
for progressive release.
```

The initial project may use:

Internal → Production

and add staged testing as adoption grows.

---

# 56. Android Release Checklist

Before release:

```text
Production API URL
Production OAuth/Auth
Push Notifications
File Upload
Offline Mode
Sync
Database Compatibility
Crash Monitoring
Analytics
Privacy
Permissions
App Icon
Splash
Version
Signing
```

---

# 57. Future iOS Deployment

The architecture should remain iOS-ready even though Android is the current target.

Future workflow:

```text
        ↓
iOS Signing
        ↓
TestFlight
        ↓
App Store
```

Do not introduce Android-only domain architecture that blocks iOS later.

---

# 58. Database Backup Strategy

Production PostgreSQL must have automated backups.

At minimum:

Daily Backup

Prefer:

```text
Point-in-Time Recovery
+
Retention Policy
```

where infrastructure supports it.

---

# 59. Backup Retention

Define retention such as:

```text
Short-Term
Long-Term
```

Example policy:

Daily backups:
30 days

Weekly backups:
3 months

Exact values should be adjusted for infrastructure cost and recovery requirements.

---

# 60. Backup Encryption

Backups must be protected using encrypted storage.

Do not store backups in publicly accessible locations.

---

# 61. Backup Verification

A backup is not considered valid merely because:

Backup job = success

The team must periodically verify:

Can it be restored?
Is the restored schema valid?
Is financial data intact?

---

# 62. Disaster Recovery

Define recovery objectives:

```text
RPO
RTO
```

Initial targets should be established based on actual product needs.

Example:

RPO:
≤ 1 hour

RTO:
≤ 4 hours

These are initial targets and must be validated against actual infrastructure.

---

# 63. Disaster Recovery Drill

Periodically test:

```text
Database Recovery
Object Storage Recovery
Application Redeployment
Secret Restoration
DNS / Routing Recovery
```

Document the measured recovery time.

---

# 64. Rollback Strategy

Application rollback:

```text
Current Version
        ↓
Previous Version
```

should be possible through immutable deployment artifacts.

Database rollback requires separate planning.

---

# 65. Deployment Rollback Trigger

Rollback may be required for:

```text
Critical API Errors
Financial Calculation Regression
Authentication Failure
Sync Corruption
Severe Performance Degradation
Unexpected Data Mutation
```

---

# 66. Rollback Process

Recommended:

```text
Detect
        ↓
Stop / Pause Rollout
        ↓
Assess Database Compatibility
        ↓
Rollback Application if Safe
        ↓
Validate
        ↓
Monitor
```

Do not blindly roll back an application when the new version has already applied incompatible database migrations.

---

# 67. Database Migration Rollback Safety

The preferred approach is:

Backward-Compatible Migration

rather than relying on emergency schema reversal.

For destructive changes:

Restore / Forward Fix

may be safer than attempting a reverse migration.

---

# 68. Blue-Green / Rolling Deployment

As scale increases, consider:

```text
Blue
Green
```

or rolling deployment.

The application should be designed for multiple API instances sharing:

```text
PostgreSQL
Redis
Object Storage
```

---

# 69. Stateless API Requirement

The API should remain as stateless as practical.

Do not store important session/financial state only in:

```text
local server filesystem
in-memory variables
```

Use durable/shared infrastructure.

---

# 70. Horizontal Scaling

Future scaling:

```text
Load Balancer
        ↓
API 1
API 2
API 3
```

All instances use:

```text
Shared PostgreSQL
Shared Redis
Shared Object Storage
```

---

# 71. Worker Scaling

Workers can scale independently.

Example:

```text
API
×3
Notification Workers
×2
AI Workers
×1
Report Workers
×1
```

Scale based on measured queue depth and workload.

---

# 72. Autoscaling

Future autoscaling may use:

```text
CPU
Memory
Request Rate
Queue Depth
```

For AI workers, queue depth may be more useful than CPU alone.

---

# 73. Monitoring

Production should monitor:

```text
API
Database
Redis
Workers
Storage
Nginx
AI
Email
Push
Sync
```

---

# 74. Application Metrics

Track:

```text
Request Count
Latency
Error Rate
Database Time
Queue Time
External Provider Time
```

---

# 75. Business Integrity Metrics

Monitor important operational signals:

```text
Failed Sync Operations
Duplicate Prevention Events
Failed Financial Mutations
Migration Errors
Report Reconciliation Errors
Notification Duplication
File Upload Failures
```

These are not business analytics; they are operational integrity signals.

---

# 76. Alerts

Alert on:

```text
High Error Rate
Database Unavailable
Redis Unavailable
Queue Backlog
Disk Space
Certificate Expiry
Backup Failure
Migration Failure
High API Latency
Sync Failure Spike
```

---

# 77. Health Monitoring

Recommended checks:

```text
API Liveness
API Readiness
Database Connectivity
Redis Connectivity
Worker Health
Storage Availability
```

---

# 78. Log Management

Production logs should be:

```text
Structured
Centralized
Retained
Searchable
Redacted
```

Logs should include:

```text
timestamp
level
service
requestId
operation
errorCode
duration
```

---

# 79. Sensitive Logging Restrictions

Never log:

```text
Password
Access Token
Refresh Token
API Key
Private Key
Full Card Details
Full Account Number
Full Financial Dataset
AI Secrets
Receipt Contents
```

---

# 80. Deployment Security

Deployment credentials must be:

```text
Scoped
Rotated
Encrypted
Audited
```

CI should use repository/environment secrets rather than plaintext credentials.

---

# 81. SSH Access

Production server access should use:

```text
Least Privilege
Restricted Users
Audit
```

Disable password-based SSH where operationally appropriate.

---

# 82. Server Firewall

Allow only required ports.

Typical:

```text
22
80
443
```

Internal services such as:

```text
PostgreSQL
Redis
must remain private.
```

---

# 83. Container Network

Docker services should communicate through private networks.

Do not publish:

```text
5432
6379
```

to the public internet.

---

# 84. Dependency Updates

Regularly update:

```text
Node
pnpm
NestJS
React Native
Expo
Prisma
PostgreSQL
Redis
Docker Images
```

Updates must go through testing before production.

---

# 85. Security Patching

Critical security patches should be prioritized over feature releases.

Workflow:

```text
Identify
        ↓
Assess
        ↓
Patch
        ↓
Test
        ↓
Deploy
        ↓
Monitor
```

---

# 86. Container Image Scanning

Scan production images for:

```text
Critical CVEs
High CVEs
Unsupported Packages
```

Do not blindly deploy unscanned production images.

---

# 87. SBOM

For mature production environments, generate a Software Bill of Materials.

Track:

```text
Application Dependencies
OS Packages
Container Dependencies
```

This improves vulnerability response.

---

# 88. Deployment Artifact Registry

Store immutable artifacts/images in a controlled registry.

Production should deploy:

Known Artifact

not whatever happens to be on a developer machine.

---

# 89. Environment Drift

Monitor differences between:

```text
Staging
Production
```

Important drift includes:

```text
Node Version
Environment Variables
Database Extensions
Container Image
Redis Version
Nginx Configuration
```

---

# 90. Configuration Validation

The API should fail fast on invalid required configuration.

Example:

```text
Missing DATABASE_URL
Missing JWT Secret
Invalid Storage Configuration
```

Do not start production with silently broken configuration.

---

# 91. Production Configuration Validation

At deployment time, verify:

```text
Database URL
Redis URL
Storage
AI Provider
Email Provider
Push Configuration
Auth Secrets
CORS
Allowed Origins
```

Secrets themselves should not be printed.

---

# 92. CORS

Production CORS should allow only approved origins.

Do not deploy:

-

for credentialed browser contexts.

The exact policy must reflect the current client architecture.

---

# 93. Mobile API Security

Production mobile traffic must use:

```text
HTTPS
Valid Authentication
Token Refresh
Secure Storage
```

Sensitive credentials/tokens should use platform secure storage mechanisms where applicable.

---

# 94. Deployment and AI

AI deployment must verify:

```text
Provider Connectivity
Model Availability
Timeout
Rate Limits
Fallback
Cost Limits
```

AI failure must not block ordinary financial operations.

---

# 95. Deployment and Email

Verify:

```text
SMTP / Email Provider
Domain Verification
SPF
DKIM
DMARC
where applicable.
```

Never test repayment emails against real users during deployment validation.

---

# 96. Deployment and Push

Production push configuration must be isolated from development.

Verify:

```text
Push Credentials
Token Registration
Notification Channel
```

---

# 97. Deployment and Files

Verify:

```text
Object Storage
Bucket Permissions
Signed URLs
Upload Size Limits
Encryption
Lifecycle Rules
```

---

# 98. Deployment and Migrations

The deployment system must ensure:

```text
Correct Application Version
+
Compatible Database Version
```

before accepting production traffic.

---

# 99. Pre-Deployment Checklist

Before production deployment:

```text
Code Review Complete
CI Green
Security Scan Green
Migration Reviewed
Backup Verified
Environment Variables Verified
Image Built
Image Scanned
Rollback Plan Ready
Monitoring Ready
Release Notes Ready
```

---

# 100. Deployment Checklist

Recommended flow:

```text
1. Confirm release version
2. Confirm commit
3. Confirm CI
4. Confirm backup
5. Deploy infrastructure if needed
6. Apply compatible database migration
7. Deploy API
8. Deploy workers
9. Verify readiness
10. Run smoke tests
11. Monitor errors/latency
12. Release mobile build where applicable
```

---

# 101. Post-Deployment Validation

Immediately verify:

```text
Authentication
Account Read
Transaction Read
Transaction Creation Path
Database Connectivity
Redis
File Upload
Notification Pipeline
```

Use dedicated test resources when writes are required.

---

# 102. Deployment Monitoring Window

After a production deployment, monitor:

```text
API Error Rate
Latency
Database Errors
Queue Failures
Sync Failures
Crash Rate
```

for a defined observation window.

---

# 103. Release Notes

Every production release should record:

```text
Version
Date
Commit
Features
Bug Fixes
Breaking Changes
Database Migration
Operational Notes
```

User-visible changes belong in:

```text
docs/CHANGELOG.md
```

Technical deployment decisions belong in:

```text
docs/DECISION_LOG.md
```

---

# 104. Mobile Release Strategy

Android release should preferably follow:

```text
Development
        ↓
Internal Build
        ↓
QA
        ↓
Staging / Preview
        ↓
Production
```

For future iOS:

```text
Development
        ↓
TestFlight
        ↓
Production
```

---

# 105. Mobile Rollback

Unlike backend rollback, mobile rollback is limited after store release.

Therefore:

Backend Changes

must remain backward-compatible with recent mobile versions whenever possible.

Use feature flags or compatibility layers for risky API changes.

---

# 106. API Backward Compatibility

Before backend deployment ask:

Can old mobile clients still function?

Prefer:

```text
Additive API Changes
```

before:

```text
Breaking API Changes
```

---

# 107. API Versioning

Use explicit API versioning where contract stability requires it.

Example:

```text
/api/v1/...
```

Breaking changes should move to a new version or use a controlled migration strategy.

---

# 108. Disaster Recovery Drill

At least periodically test:

```text
Database Restore
Application Redeployment
Object Storage Recovery
Secret Recovery
DNS / TLS
Worker Recovery
```

Record:

```text
Actual RPO
Actual RTO
Issues Found
Corrective Actions
```

---

# 109. Backup Restore Procedure

Conceptual:

```text
Provision Recovery Database
        ↓
Restore Backup / PITR
        ↓
Validate Schema
        ↓
Validate Financial Records
        ↓
Start API Against Recovery DB
        ↓
Run Read-Only Smoke Tests
        ↓
Validate Critical Flows
```

Only switch production traffic after explicit verification.

---

# 110. Data Integrity Validation After Restore

Verify:

```text
User Count
Account Count
Transaction Count
Budget Count
Goal Count
Lending / Borrowing Count
Recurring Rule Count
File Metadata
```

and sample financial reconciliation:

```text
Account Balance
=
Opening Balance
+
Valid Financial Activity
```

---

# 111. Incident Response

For a serious production incident:

```text
Detect
        ↓
Classify
        ↓
Contain
        ↓
Protect Data
        ↓
Investigate
        ↓
Recover
        ↓
Validate
        ↓
Document
```

---

# 112. Financial Integrity Incident

If incorrect financial calculations are detected:

```text
Stop affected rollout
        ↓
Identify affected records
        ↓
Preserve source data
        ↓
Fix calculation
        ↓
Recompute derived values
        ↓
Validate
        ↓
Deploy
```

Do not delete or rewrite source transactions simply to make totals look correct.

---

# 113. Sync Incident

If synchronization causes corruption risk:

```text
Pause Sync
        ↓
Protect Server State
        ↓
Inspect Operation Queue
        ↓
Identify Affected Versions
        ↓
Fix
        ↓
Resume Controlled Sync
```

A full resync may be preferable to unsafe incremental recovery.

---

# 114. Failed Deployment

If deployment fails before traffic switch:

Keep Existing Version

If deployment partially succeeds:

```text
Inspect State
        ↓
Determine DB Compatibility
        ↓
Rollback / Complete Forward Fix
```

Do not blindly redeploy until the system state is understood.

---

# 115. Emergency Deployment

Emergency releases must still record:

```text
Reason
Commit
Reviewer / Approver
Risk
Validation
Rollback / Recovery
```

Emergency does not mean undocumented.

---

# 116. Deployment Acceptance Criteria

Deployment is production-ready when:

Development, staging, and production are isolated.
Production artifacts are immutable and identifiable.
API containers are reproducible.
Workers are independently manageable.
PostgreSQL is backed up and recoverable.
Redis is private and non-authoritative.
Object storage is private and encrypted.
Nginx/TLS is configured securely.
Database migrations are controlled.

```text
CI/CD is automated.
Secrets are externalized.
Health checks exist.
```

Monitoring and alerting exist.
Rollback procedures exist.
Backup restoration has been tested.
Android production builds are reproducible.
Future iOS deployment does not require architectural redesign.
Deployment remains compatible with recent mobile clients.
Critical production failures have documented recovery procedures.

---

# 117. Production Readiness Checklist

Before declaring the system production-ready:

```text
[ ] CI passes
[ ] Unit tests pass
[ ] Integration tests pass
[ ] E2E tests pass
[ ] Security scan passes
[ ] Production image built
[ ] Image scanned
[ ] Database backup verified
[ ] Migration reviewed
[ ] Staging deployment successful
[ ] Health checks pass
[ ] Monitoring active
[ ] Alerts configured
[ ] TLS valid
[ ] Secrets configured
[ ] Storage configured
[ ] Email configured
[ ] Push configured
[ ] AI configured with fallback
[ ] Sync tested
[ ] Rollback documented
[ ] Recovery drill completed
[ ] Release notes prepared
```

---

# 118. Final Deployment Principle

The deployment system should make production boring.

The ideal deployment experience is:

```text
Same Artifact
+
Known Configuration
+
Automated Checks
+
Controlled Migration
+
Health Validation
+
Observable Rollout
+
Fast Recovery
```

The central principle is:

> **A financial application should never depend on a developer manually "fixing" production after deployment. Every release should be reproducible, observable, and recoverable.**

---

# 119. Relationship With Other Engineering Documents

The engineering documentation sequence is now:

```text
DEVELOPMENT_GUIDELINES.md
        ↓
TESTING.md
        ↓
PERFORMANCE.md
        ↓
DEPLOYMENT.md
```

The engineering documentation set is complete.

The broader documentation set includes:

```text
docs/
├── 01_PROJECT_VISION.md
├── 02_PRD.md
├── 03_PRODUCT_SCOPE.md
├── 04_FEATURES.md
├── CHANGELOG.md
├── DECISION_LOG.md
├── DOCS.md
├── IDEAS_BACKLOG.md
├── MEDIA_FILES.md
├── ROADMAP.md
│
├── architecture/
├── product/
├── ai/
├── engineering/
└── ux/
```

A structural cleanup should move the standalone:

```text
docs/MEDIA_FILES.md
```

to:

```text
docs/product/MEDIA_FILES.md
```

so all product modules remain consistently grouped.

The next documentation task should not be another random module stub. The priority should be to reconcile DOCS.md, verify every documentation file against the actual repository tree, and close any cross-document inconsistencies before implementation proceeds.
