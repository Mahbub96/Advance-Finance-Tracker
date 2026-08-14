# Personal Finance — Security Architecture

**Document:** `SECURITY.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL + Prisma  
**Local Database:** SQLite  
**Architecture:** Offline-first, cloud-sync ready  
**Security Classification:** Financial / Sensitive Data

---

# 1. Purpose

This document defines the security and privacy architecture for the Personal Finance application.

The application handles highly sensitive financial information, including:

- Transactions
- Account balances
- Income
- Expenses
- Lending
- Borrowing
- Repayments
- Financial goals
- Reports
- Financial behavior
- AI-generated financial context

Security must therefore be treated as a foundational product requirement.

The core principle is:

> **The system must protect the user's financial data even when the network, client, third-party provider, or individual application component fails.**

---

# 2. Security Objectives

The application must protect:

## Confidentiality

Only authorized users and approved system components can access sensitive information.

## Integrity

Financial records must not be modified incorrectly or silently.

## Availability

Core financial data must remain usable even when:

- internet connectivity fails
- AI providers fail
- email providers fail
- background workers fail

## Privacy

Only the minimum necessary personal and financial information should be collected, stored, processed, and shared.

## Accountability

Security-sensitive actions should be traceable where appropriate.

---

# 3. Security Principles

1. Never trust the mobile client.
2. Authenticate all cloud access.
3. Authorize every protected resource.
4. Validate input at every trust boundary.
5. Use HTTPS in production.
6. Keep secrets out of source control.
7. Minimize sensitive data transmission.
8. Do not use AI as a financial authority.
9. Do not log sensitive financial payloads unnecessarily.
10. Protect backups as strongly as primary data.
11. Prefer secure defaults.
12. Fail safely.
13. Preserve financial integrity during failures.
14. Keep security controls testable.
15. Treat third-party providers as untrusted external boundaries.

---

# 4. Threat Model

Primary threat categories include:

```text
Unauthorized Account Access
Credential Theft
Session Theft
Device Theft
Malicious / Modified Mobile Client
API Abuse
Broken Authorization
Data Leakage
Database Compromise
Backup Leakage
File Upload Abuse
AI Data Leakage
Prompt Injection
Replay Attacks
Sync Manipulation
Insider / Operational Abuse
Supply Chain Risk
```

The threat model should evolve as new functionality such as banking integrations or shared finances is introduced.

---

# 5. Trust Boundaries

The system has several important trust boundaries:

```text
User
 ↓
Mobile Application
 ↓
Internet
 ↓
API
 ↓
Application Services
 ↓
Database
```

Additional boundaries:

```text
Backend
 ↓
AI Provider

Backend
 ↓
Email Provider

Backend
 ↓
Object Storage
```

Every boundary must validate and authorize incoming data.

---

# 6. Mobile Client Is Untrusted

The mobile application must be treated as untrusted from a backend security perspective.

A malicious user may:

- modify the application
- intercept client-side state
- alter requests
- call undocumented endpoints
- bypass UI restrictions

Therefore:

> **Client-side validation is for UX. Server-side validation is for security.**

---

# 7. Authentication

Cloud functionality requires secure authentication.

Supported baseline:

- Email/password authentication
- Access token
- Refresh token
- Logout
- Password recovery

Future support may include:

- OAuth
- Passkeys
- Social login
- Enterprise identity providers where justified

---

# 8. Password Security

If the application stores passwords directly, passwords must be hashed using a modern password hashing algorithm such as:

```text
Argon2id
```

Do not use:

- MD5
- SHA-1
- plain SHA-256
- reversible encryption

Passwords must never be logged or returned through APIs.

---

# 9. Password Requirements

The product should enforce reasonable password requirements without creating unnecessary usability problems.

Consider:

- minimum length
- compromised-password checks where practical
- rate limiting
- secure reset flow

Avoid overly restrictive composition rules that encourage predictable passwords.

---

# 10. Session Security

Access tokens should be short-lived.

Refresh tokens should:

- be securely stored
- be revocable
- be rotated where practical
- have explicit expiration
- be associated with session/device context

A compromised access token should have limited lifetime.

---

# 11. Refresh Token Rotation

Preferred strategy:

```text
Refresh Token A
      ↓
Refresh
      ↓
Refresh Token B
      ↓
Invalidate A
```

Reuse detection should be considered for higher-security deployments.

---

# 12. Mobile Token Storage

Do not store access or refresh tokens in plain AsyncStorage or ordinary SQLite.

Use platform-secure credential storage available through the mobile framework.

The implementation should use secure OS-protected storage appropriate for Android and future iOS support.

---

# 13. App Lock

Future privacy feature:

```text
Open App
   ↓
Biometric / PIN
   ↓
Unlock Financial UI
```

App lock protects local access.

It does not replace server authentication.

---

# 14. Device Security

The application should assume the device can be:

- lost
- stolen
- rooted
- modified
- shared

The threat model should therefore consider:

- local database exposure
- screenshots
- notification previews
- backups
- secure storage
- device compromise

---

# 15. Local Database Protection

The local SQLite database contains sensitive financial information.

The implementation should evaluate encrypted local storage.

Potential strategy:

```text
SQLite
   +
Database Encryption
   +
Secure Key Storage
```

The encryption mechanism must be compatible with:

- Expo / React Native constraints
- Android
- future iOS
- backup behavior
- performance

---

# 16. Encryption at Rest

Where supported, sensitive cloud data should use encryption at rest.

This includes:

- PostgreSQL storage
- object storage
- backups
- logs where sensitive data may exist

Cloud-provider-managed encryption is a baseline; stronger key management may be introduced later.

---

# 17. Encryption in Transit

All production network communication must use:

```text
HTTPS / TLS
```

Plain HTTP must not be used for production financial APIs.

Certificates should be managed through secure deployment infrastructure.

---

# 18. API Authorization

Every protected resource must be authorized using authenticated user ownership.

Example:

```text
GET /transactions/:id
```

must verify:

```text
transaction belongs to current user
```

Never rely on obscure or unpredictable IDs alone as authorization.

---

# 19. Object-Level Authorization

The API must protect against IDOR/BOLA-style vulnerabilities.

Bad:

```text
GET /transactions/{arbitrary-id}
```

with no ownership check.

Correct:

```text
Authenticated user
   ↓
Resource lookup scoped to user
```

---

# 20. Mass Assignment Protection

Clients must not be able to update protected fields by sending arbitrary JSON.

Never blindly pass request bodies into ORM update calls.

Whitelist mutable fields.

Protected fields may include:

- user ID
- ownership
- created_at
- financial audit metadata
- synchronization version
- system flags

---

# 21. Input Validation

All external input must be validated.

Validate:

- types
- ranges
- formats
- ownership
- state transitions
- dates
- currency
- file metadata
- synchronization payloads

NestJS validation should be combined with domain-level validation.

---

# 22. Financial Integrity

Security includes financial correctness.

The system must prevent unauthorized or invalid:

- amount changes
- account changes
- transaction type changes
- repayments
- transfers
- goal mutations

Critical mutations should use transactional database operations.

---

# 23. Transfer Security

A transfer operation must be authorized for both:

```text
Source Account
Destination Account
```

Both must belong to the user.

The operation must be atomic.

---

# 24. Repayment Security

A repayment must verify:

- repayment owner
- lending/borrowing ownership
- account ownership
- outstanding balance
- currency
- valid status

A user must never be able to repay an obligation belonging to another user by manipulating IDs.

---

# 25. Sync Security

Synchronization is a high-risk boundary.

The backend must validate:

```text
User
Device
Operation
Entity Ownership
Version
Payload
```

The client cannot be trusted to declare that it owns a record.

---

# 26. Sync Replay Protection

Each synchronization mutation should use a stable operation identifier.

The server must reject or safely replay duplicate operations.

This protects against:

- retries
- duplicate submissions
- replay attacks
- unstable mobile networks

---

# 27. Sync Tampering

The server must not blindly accept:

```text
entityVersion
userId
deviceId
ownerId
```

from the client.

These values must be validated against server state.

---

# 28. Rate Limiting

Rate limits should protect:

## Authentication

Strict limits to reduce credential attacks.

## AI

Cost and abuse control.

## File Upload

Prevent resource exhaustion.

## Sync

Prevent runaway clients.

## General API

Protect infrastructure from abuse.

---

# 29. Account Enumeration

Authentication-related APIs should avoid revealing whether a specific email is registered where that information is not required.

For password-reset initiation, responses should avoid unnecessarily exposing account existence.

---

# 30. Brute-Force Protection

Implement protections such as:

- rate limiting
- temporary lockout where appropriate
- IP/device-aware throttling
- password reset protections
- anomaly monitoring

Avoid permanent automatic lockouts that can create denial-of-service problems.

---

# 31. Password Reset Security

Password reset links/tokens must:

- be short-lived
- be single-use
- be random and cryptographically secure
- not expose the existing password
- invalidate old reset tokens after use

---

# 32. Session Revocation

Users should eventually be able to view/revoke active sessions/devices.

Example:

```text
Devices

Current Android Phone
Last active: now

Other Device
Last active: 2 days ago

[Revoke]
```

---

# 33. Sensitive Notification Content

Notifications can expose financial information on a locked screen.

Therefore users should be able to control notification detail.

Potential options:

```text
Show Full Details
Hide Amounts
Hide All Financial Details
```

Default behavior should consider privacy.

---

# 34. Clipboard Security

The application should avoid copying sensitive financial information to the clipboard unnecessarily.

For copy actions, give the user a clear indication.

Where practical, sensitive copied values may be cleared after a reasonable period.

---

# 35. Screenshot / Screen Capture

The product may consider protecting highly sensitive screens from screenshots on supported platforms.

This must balance:

- privacy
- platform behavior
- user convenience

It should not be enabled blindly across the entire application.

---

# 36. File Upload Security

Uploaded files must be treated as untrusted.

Validate:

- file size
- file type
- MIME type
- extension
- filename
- storage key
- checksum where appropriate

Do not execute uploaded content.

---

# 37. File Name Sanitization

User-provided filenames must never directly become filesystem paths.

Use server-generated storage keys.

Example:

```text
storage/users/{userId}/files/{uuid}
```

Do not trust:

```text
../../../../file
```

style paths.

---

# 38. Malware / Dangerous File Handling

If arbitrary files are supported, the product should eventually evaluate malware scanning.

At minimum, limit allowed file types to those required by the application.

For an initial receipt system, restricting to appropriate image/PDF formats may reduce attack surface.

---

# 39. Object Storage Security

Private files should use:

- private buckets
- signed URLs
- expiration
- ownership checks

Do not expose permanent public URLs for financial receipts.

---

# 40. Database Security

PostgreSQL access must:

- use strong credentials
- restrict network access
- use TLS where applicable
- avoid public exposure
- use least-privilege database roles

The API should be the normal application path to the database.

---

# 41. Prisma Security

Do not construct raw SQL using unsanitized user input.

Where raw SQL is unavoidable:

- parameterize it
- validate inputs
- review security implications

ORM usage does not eliminate authorization requirements.

---

# 42. Database Least Privilege

The application database user should receive only permissions necessary for application operation.

Migration privileges may be separated from runtime privileges in hardened deployments.

---

# 43. Database Backups

Backups contain highly sensitive financial information.

Protect with:

- encryption
- access control
- retention policy
- restricted network access
- monitoring
- restore testing

Backups should never be publicly accessible.

---

# 44. Backup Encryption

Prefer encrypted backup storage.

Encryption keys must be managed separately from backup data where practical.

---

# 45. Backup Restore Security

Restore operations should:

- validate backup source
- validate integrity
- authenticate operator/user
- prevent malicious SQL execution where custom backup formats are involved
- avoid overwriting unrelated data

User-generated application backups should be treated as untrusted input.

---

# 46. Data Import Security

Imported CSV/JSON data must be treated as untrusted.

Validate:

- structure
- record limits
- field sizes
- dates
- amounts
- references

Do not allow imported data to execute code.

---

# 47. CSV Injection

Exported CSV files may contain strings beginning with spreadsheet formula characters.

Examples:

```text
=
+
-
@
```

Where user-controlled values are exported, consider safe escaping to reduce spreadsheet formula injection risk.

---

# 48. API Secrets

Secrets must never appear in:

- source code
- Git history
- mobile bundles
- logs
- public configuration
- screenshots
- issue templates

Examples:

- JWT secrets
- AI API keys
- email API keys
- object-storage credentials
- database passwords

---

# 49. Mobile API Keys

A secret provider API key must never be embedded in the mobile application if it grants privileged backend access.

For example:

```text
Mobile
  ✗ direct privileged NVIDIA/provider secret
```

Preferred:

```text
Mobile
  ↓
Backend
  ↓
AI Provider
```

---

# 50. AI Security

AI introduces additional security risks.

Potential threats:

- prompt injection
- sensitive-data leakage
- hallucinated financial facts
- tool abuse
- malicious external content
- provider logging

The AI layer must therefore be isolated.

---

# 51. AI Data Minimization

Before sending financial context to an external model:

```text
Raw Data
 ↓
Need Assessment
 ↓
Aggregation
 ↓
Remove Unnecessary PII
 ↓
Structured Context
 ↓
AI
```

Send only what is required for the task.

---

# 52. AI Provider Isolation

The backend should use an abstraction:

```text
AIService
   ↓
Provider Adapter
```

The provider adapter should know provider-specific credentials and protocols.

Domain modules should not.

---

# 53. Prompt Injection Protection

User-controlled text may contain malicious instructions.

Examples:

- transaction notes
- merchant names
- imported descriptions
- receipt text

These must be treated as untrusted content.

The AI system should clearly separate:

```text
System / Trusted Instructions
Application Data
User Content
Tool Results
```

User content must never be treated as system instructions.

---

# 54. AI Tool Security

When the AI assistant can call application tools:

```text
AI
 ↓
Tool Request
 ↓
Authorization
 ↓
Validation
 ↓
Tool Execution
 ↓
Result
```

The model itself must not receive unrestricted database access.

---

# 55. Read vs Write AI Tools

The first AI assistant should strongly prefer read-only tools:

```text
getMonthlySpending()
getBudgetStatus()
getGoalProgress()
getOutstandingLending()
```

Write actions should not be directly executable by the model.

If future write tools are introduced, they must require explicit user confirmation.

---

# 56. AI Output Validation

AI outputs must be schema-validated.

Do not trust arbitrary free-form model output for programmatic actions.

Use structured outputs when supported.

---

# 57. AI Hallucination Protection

The system should ground financial responses in actual application data.

For factual questions:

```text
User Question
 ↓
Trusted Financial Query
 ↓
Numeric Result
 ↓
AI Explanation
```

The model should not generate the primary financial number itself.

---

# 58. AI Provider Failure

If the AI provider is unavailable:

```text
AI Failure
 ↓
Core Application Continues
```

Do not fail:

- transaction creation
- account viewing
- budgets
- goals
- deterministic analytics

because AI is unavailable.

---

# 59. AI Data Retention

The product should explicitly determine:

- whether prompts are stored
- whether responses are stored
- retention period
- whether users can delete AI history
- whether provider-side storage is enabled

Default should favor data minimization.

---

# 60. Third-Party Provider Risk

Third-party providers include:

- AI
- Email
- Object storage
- Analytics
- Authentication

Each integration should be reviewed for:

- data exposure
- credential scope
- retention
- regional storage
- availability
- failure behavior

---

# 61. Analytics Privacy

Product analytics should avoid capturing sensitive financial values unless explicitly required.

Prefer:

```text
"transaction_created"
```

over:

```text
"transaction_created_amount_450_merchant_coffee"
```

Telemetry should not unnecessarily reproduce user financial data.

---

# 62. Crash Reporting

Crash/error reporting must be configured to avoid including:

- full transaction objects
- account balances
- tokens
- AI prompts containing financial data
- attached file contents

Sensitive values should be redacted.

---

# 63. Logging Rules

Never log:

```text
Passwords
Access tokens
Refresh tokens
API keys
Full payment/account identifiers
Unnecessary financial amounts
Raw AI prompts containing sensitive data
Full sync payloads
Private file contents
```

Use:

```text
requestId
userId hash/reference where appropriate
operation
error code
timing
```

rather than sensitive payloads.

---

# 64. Audit Logging

Audit logs should cover high-value security actions such as:

- login
- password reset
- device registration
- device revocation
- sensitive data deletion
- backup restore
- security setting changes
- AI privacy setting changes

Audit logs must themselves be protected.

---

# 65. Audit Log Integrity

Audit records should be difficult to alter unnoticed.

At minimum:

- restricted database access
- append-oriented behavior
- monitoring

Higher-security deployments may add integrity hashing or centralized immutable logging.

---

# 66. Data Deletion

Deletion must consider:

```text
Active Database
Local Database
Cloud Storage
Backups
AI Records
Logs
Analytics
```

Deletion policies should specify:

- immediate deletion
- delayed purge
- anonymization
- backup retention

Do not claim complete deletion if backups still contain data without explaining the retention model.

---

# 67. User Data Export

Users should be able to export their financial data.

Exports should:

- include clear scope
- be generated securely
- have controlled access
- expire when stored remotely
- not be publicly accessible

---

# 68. Security of Local Exports

Exported files may contain complete financial history.

The application should warn users:

> "This file contains your financial information. Store it securely."

Where supported, local exports should use secure storage/share mechanisms.

---

# 69. Session Timeout

The product should define reasonable session behavior.

Consider:

- access token expiration
- refresh token expiration
- inactivity policy
- app lock
- device revocation

These controls serve different purposes and should not be conflated.

---

# 70. Account Recovery

Account recovery must balance:

```text
Security
+
Usability
```

Recovery should not expose private financial information as a way to prove identity.

---

# 71. Authorization for Sensitive Actions

Additional verification may eventually be required for:

- account deletion
- bulk data deletion
- security setting changes
- device revocation
- API key generation if ever supported

---

# 72. CSRF Consideration

Native mobile API clients are generally not exposed to browser-style CSRF in the same way as cookie-authenticated web applications.

If a web client is introduced using cookies, CSRF protections must be implemented for state-changing endpoints.

Do not assume mobile-only security controls remain sufficient for a future browser application.

---

# 73. CORS

For APIs consumed by future web clients:

- allow only trusted origins
- avoid wildcard credentials
- restrict methods and headers where practical

Mobile applications do not rely on CORS.

---

# 74. Security Headers

For HTTP services, use appropriate security headers such as:

- HSTS
- content type protection
- frame protections where applicable
- referrer policy
- secure cookie flags if cookies are ever used

Headers should be appropriate to the API/client architecture.

---

# 75. Infrastructure Security

Production infrastructure should use:

- private database networking
- restricted firewall rules
- non-root containers where practical
- minimal OS packages
- patch management
- secret management
- separate environments

---

# 76. Container Security

Containers should:

- use minimal base images
- run as non-root where practical
- pin dependencies responsibly
- avoid embedding secrets
- be scanned for vulnerabilities
- avoid unnecessary Linux capabilities

---

# 77. Dependency Security

The project should monitor:

- npm/pnpm dependencies
- native mobile dependencies
- Docker images
- backend libraries
- AI SDKs

Use automated vulnerability scanning where practical.

Critical vulnerabilities should trigger assessment before release.

---

# 78. Supply Chain Security

Protect the development pipeline through:

- dependency lockfiles
- trusted registries
- CI permissions minimization
- protected branches
- review requirements
- secret scanning
- dependency update controls

---

# 79. CI/CD Security

CI should:

- use least-privilege credentials
- avoid long-lived secrets where possible
- isolate production deployment credentials
- mask secrets
- prevent untrusted pull requests from accessing production secrets

---

# 80. Environment Separation

At minimum:

```text
Development
Test
Staging
Production
```

Each environment must have independent:

- database
- secrets
- credentials
- AI provider keys
- email configuration

Production data must never be casually copied into development.

---

# 81. Production Data in Development

Do not use live financial data for local development unless:

- explicitly authorized
- securely sanitized
- strictly controlled

Prefer synthetic data.

---

# 82. Security Testing

Security testing should include:

## Application

- authentication
- authorization
- session handling
- validation

## API

- IDOR/BOLA
- injection
- rate limiting
- replay
- mass assignment

## Mobile

- secure storage
- local data exposure
- deep links
- logs
- backups

## Sync

- replay
- conflict manipulation
- ownership
- stale writes

## AI

- prompt injection
- data leakage
- tool abuse
- output validation

---

# 83. Security Testing Tools

The project may use:

- dependency scanners
- secret scanners
- SAST
- DAST
- container scanning
- API security testing
- penetration testing

Tool selection should be practical for the project's size.

---

# 84. Security Release Gate

A release must not proceed if there is an unresolved high-severity security issue without explicit documented risk acceptance.

Production releases should verify:

- dependencies
- secrets
- migrations
- authentication
- authorization
- critical financial paths
- backup health

---

# 85. Incident Response

The project should maintain a documented incident process.

Minimum stages:

```text
Detect
 ↓
Contain
 ↓
Assess
 ↓
Remediate
 ↓
Recover
 ↓
Review
```

Security incidents should be documented.

---

# 86. Compromised Credential Response

If a secret is compromised:

```text
Revoke / Rotate
 ↓
Assess Exposure
 ↓
Review Logs
 ↓
Patch Root Cause
 ↓
Redeploy
 ↓
Monitor
```

Rotation procedures should be documented for:

- database credentials
- JWT secrets
- AI provider keys
- email provider keys
- storage credentials

---

# 87. AI Provider Compromise Response

If an AI provider key is exposed:

1. Revoke key.
2. Issue replacement.
3. Review recent usage.
4. Check for unauthorized requests.
5. Assess exposed data.
6. Verify application rate limits.
7. Review provider logs.
8. Consider temporary AI disablement.

Core finance functionality must remain available.

---

# 88. Data Breach Response

If financial data exposure is suspected:

```text
Contain Access
 ↓
Identify Scope
 ↓
Preserve Evidence
 ↓
Rotate Credentials
 ↓
Patch Vulnerability
 ↓
Assess Affected Data
 ↓
Notify According to Applicable Requirements
```

Legal/privacy notification requirements should be reviewed for the deployment jurisdiction.

---

# 89. Security Documentation

Security-sensitive decisions should be recorded in:

```text
DECISION_LOG.md
```

Examples:

- authentication method
- encryption strategy
- cloud backup policy
- AI data handling
- retention policy

---

# 90. Security Configuration

Configuration should be validated at startup.

Examples:

```text
DATABASE_URL
JWT_SECRET
REDIS_URL
EMAIL_PROVIDER_KEY
AI_PROVIDER_KEY
STORAGE_CREDENTIALS
```

Production services should fail fast if required secrets are missing.

---

# 91. Secret Rotation

Production secrets must have a rotation strategy.

Long-lived credentials should be minimized.

Where supported, use:

- short-lived credentials
- workload identity
- secret managers

---

# 92. Privacy by Design

Every new feature should answer:

1. What data does it collect?
2. Why does it need it?
3. Where is it stored?
4. Who can access it?
5. Is it sent to a third party?
6. How long is it retained?
7. Can the user delete it?

If there is no clear answer, the feature is not ready.

---

# 93. Data Minimization

Collect only what provides product value.

Avoid collecting:

- unnecessary contacts
- unnecessary location
- unnecessary identifiers
- unnecessary device metadata

---

# 94. Privacy for Lending / Borrowing

Names, email addresses, phone numbers, and notes about other people can be sensitive.

The product should collect only the fields necessary for reminders and relationship tracking.

Do not automatically import the user's entire contact list merely for convenience.

---

# 95. Privacy for Voice

Voice processing may involve sensitive financial information.

The product must communicate:

- whether audio leaves the device
- which provider processes it
- whether audio is stored
- how long it is retained

Temporary audio should be removed when no longer required.

---

# 96. Privacy for Receipts

Receipts may contain:

- addresses
- phone numbers
- merchant details
- purchase history

OCR processing should minimize external transmission.

Where possible:

```text
Image
 ↓
Local OCR
```

or:

```text
Image
 ↓
Secure Processing
 ↓
Extracted Data
 ↓
Discard Temporary Data
```

---

# 97. Privacy for AI Insights

AI insight generation should prefer aggregated context.

Example:

```text
Food spending:
৳8,450

3-month average:
৳6,450

Change:
+31%
```

rather than sending every raw meal transaction unless necessary.

---

# 98. Privacy for Reports

Reports may contain comprehensive financial histories.

When sharing/exporting:

- indicate sensitivity
- use secure local mechanisms
- avoid unintended public sharing
- consider export scope

---

# 99. Security and Offline Mode

Offline-first improves availability but also increases local data exposure.

Security must therefore balance:

```text
Offline Usability
+
Local Data Protection
```

Potential controls:

- app lock
- local encryption
- secure backups
- hidden notification content

---

# 100. Security Anti-Patterns

Never:

- store passwords in plain text
- store privileged provider API keys in the mobile app
- trust client ownership claims
- use floating-point money as authoritative data
- log tokens
- log full financial records
- expose database directly to the internet
- use public storage for receipts
- trust AI-generated financial facts
- use AI as an authorization layer
- assume obscured IDs are authorization
- disable validation for "trusted" internal clients

---

# 101. Security Quality Bar

The product is security-ready when:

- Authentication is secure.
- Authorization is enforced server-side.
- Financial data is protected in transit and at rest where appropriate.
- Local storage has a documented protection strategy.
- Sensitive tokens use secure storage.
- Financial writes are validated and transactional.
- Sync operations are authenticated and idempotent.
- Files are protected.
- AI data is minimized and isolated.
- Secrets are managed securely.
- Logging avoids unnecessary sensitive data.
- Backups are protected and tested.
- Security testing is part of CI/release.
- Incident response procedures exist.

---

# 102. Production Security Checklist

Before production release:

- [ ] HTTPS enforced
- [ ] Secure authentication implemented
- [ ] Refresh tokens protected
- [ ] Authorization tested
- [ ] Object-level access checks tested
- [ ] Rate limiting enabled
- [ ] Input validation enabled
- [ ] Mass assignment prevented
- [ ] SQL injection protections reviewed
- [ ] Sensitive logs reviewed
- [ ] Secrets removed from source control
- [ ] Secret rotation documented
- [ ] Database access restricted
- [ ] Backups encrypted
- [ ] Restore tested
- [ ] File uploads secured
- [ ] AI provider keys protected
- [ ] AI data minimization implemented
- [ ] Sync replay protection implemented
- [ ] Dependency vulnerabilities reviewed
- [ ] Container images scanned
- [ ] Production configuration reviewed
- [ ] Incident response documented

---

# 103. Relationship With Other Documents

Architecture documentation is now:

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

This document is the final baseline architecture document in the initial architecture sequence.

The next documentation phase should move into the individual product modules and define their detailed domain behavior.

Recommended next file:

```text
docs/product/BUDGETING.md
```

It should define:

- Budget types
- Budget periods
- Category budgets
- Calculations
- Spending qualification
- Thresholds
- Alerts
- Forecasted overruns
- Notifications
- Budget history
- Edge cases
- Acceptance criteria
- Future AI integration

The central security rule remains:

> **Protect the user's financial data without making ordinary financial tracking difficult.**
