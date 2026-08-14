# Personal Finance — Notifications Module

**Document:** `NOTIFICATIONS.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-14  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Module:** Notifications  
**Mobile:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL + Prisma  
**Local Database:** SQLite  
**Queue:** Redis-backed background jobs

---

# 1. Purpose

The Notifications module delivers timely, useful, privacy-conscious reminders and financial alerts.

The module must help users notice important financial events without becoming noisy.

The core question is:

> **What does the user need to know now, and what action can they take from it?**

Notifications must therefore be:

- relevant
- actionable
- timely
- deduplicated
- user-controlled
- privacy-conscious
- recoverable
- synchronized where necessary

---

# 2. Notification Philosophy

A notification is valuable only when its expected benefit exceeds its interruption cost.

The product should prefer:

```text
Important
+
Timely
+
Actionable
```

over:

```text
Frequent
+
Generic
+
Repetitive
```

The system must not turn normal financial tracking into notification spam.

---

# 3. Notification Channels

The initial system supports:

```text
Local Device Notifications
Push Notifications
Email
```

Future channels may include:

```text
SMS
WhatsApp
Calendar
Webhook / Automation
```

Each channel must be independently controllable.

---

# 4. Notification Categories

The primary categories are:

```text
BUDGET
GOAL
LENDING
BORROWING
BILL
RECURRING
AI
SYSTEM
SYNC
SECURITY
```

The first release should prioritize the financial categories users actually need.

---

# 5. Notification Event Model

A notification should be produced from a meaningful event.

Conceptually:

```text
Business Event
      ↓
Notification Policy
      ↓
Eligibility Check
      ↓
Deduplication
      ↓
Channel Selection
      ↓
Delivery
      ↓
Delivery Result
```

The financial business event must remain independent of notification delivery.

---

# 6. Notification vs Business State

A notification is not the source of truth.

Example:

```text
Repayment Due
      ↓
Reminder Notification
```

If the notification fails:

```text
Repayment remains due.
```

A notification failure must never change the financial state.

---

# 7. Notification Priority

Suggested levels:

```text
LOW
NORMAL
HIGH
CRITICAL
```

Examples:

### LOW

Goal milestone.

### NORMAL

Contribution reminder.

### HIGH

Budget projected to exceed limit.

### CRITICAL

Security event requiring immediate user attention.

Most financial notifications should be `NORMAL` or `HIGH`.

---

# 8. Notification Lifecycle

A persisted notification may use:

```text
SCHEDULED
QUEUED
SENDING
SENT
DELIVERED
READ
DISMISSED
FAILED
CANCELLED
EXPIRED
```

Not every delivery channel supports every state.

The model should retain only states that provide actual value.

---

# 9. Notification Record

Conceptual fields:

```text
id
user_id
type
category
title
body
priority
scheduled_at
sent_at nullable
read_at nullable
dismissed_at nullable
status
entity_type nullable
entity_id nullable
deduplication_key nullable
channel
created_at
updated_at
```

The database model is defined in `DATABASE.md`.

---

# 10. Deep-Link Association

A notification should identify the entity it belongs to when possible:

```text
entity_type
entity_id
```

Examples:

```text
Budget
Goal
Lending Record
Borrowing Record
Bill
AI Insight
```

This allows direct navigation to the relevant context.

---

# 11. Notification Deep Links

Examples:

```text
Budget warning
→ /budgets/:id

Goal reminder
→ /goals/:id

Repayment reminder
→ /lending/:id
or
→ /borrowing/:id

Bill reminder
→ /recurring/bills/:id

AI insight
→ /ai/insights/:id
```

The user should not simply be taken to Home when a more specific destination exists.

---

# 12. Notification Preference Model

Users should be able to configure notifications by category.

Example:

```text
Budget Alerts       ON
Goal Reminders      ON
Repayment Reminders ON
Bill Reminders      ON
AI Insights         OFF
System              ON
```

The settings should use plain language.

---

# 13. Channel Preferences

A user may choose:

```text
Local
Push
Email
```

per notification category where supported.

Example:

```text
Repayment:
Local ✓
Email  ✓
Push   ✓
```

The product must prevent contradictory configurations from producing unexpected behavior.

---

# 14. Quiet Hours

Users should be able to configure quiet hours.

Example:

```text
Quiet Hours
11:00 PM → 7:00 AM
```

During quiet hours:

- non-critical notifications may be delayed
- critical/security notifications may bypass quiet hours if the user has enabled that behavior

The default should prioritize user privacy and sleep.

---

# 15. Quiet Hours and Email

Email is different from local notification delivery.

A quiet-hours configuration may delay sending scheduled email reminders where appropriate, but should not unexpectedly shift critical deadlines.

The final policy must be explicit.

---

# 16. Notification Frequency

The product should provide reasonable defaults.

For recurring reminders:

```text
At most one reminder
per configured event / threshold
```

Persistent overdue reminders should use a defined escalation schedule.

Avoid daily reminders indefinitely unless the user explicitly enables them.

---

# 17. Budget Notifications

Budget events include:

```text
Threshold Reached
Projected Overrun
Budget Exceeded
```

Potential thresholds:

```text
50%
75%
80%
90%
100%
```

The user may customize these.

---

# 18. Budget Threshold Notification

Example:

> "You've used 80% of your Food budget. ৳2,000 remains."

The notification should include the actionable amount.

Deep link:

```text
Budget Detail
```

---

# 19. Budget Projected Overrun Notification

Example:

> "At your current spending pace, your Food budget may be exceeded this month."

This is an analytical warning.

The application must make it clear that the overrun is projected, not guaranteed.

---

# 20. Budget Exceeded Notification

Example:

> "Your Food budget is ৳1,200 over its limit."

The notification may include:

```text
[View Budget]
```

where platform actions are appropriate.

---

# 21. Budget Alert Deduplication

A threshold notification should be generated only when crossing the threshold.

Example:

```text
79.8%
→
80.2%
```

triggers the 80% event.

Later calculations at:

```text
80.5%
81%
82%
```

do not generate the same notification again.

---

# 22. Budget Threshold Reset

Threshold event state should reset for a new budget period.

Example:

```text
August
80% reached
```

does not suppress:

```text
September
80% reached
```

---

# 23. Goal Notifications

Potential goal events:

```text
Contribution Reminder
Milestone Reached
Target Approaching
At Risk
Completed
```

---

# 24. Goal Contribution Reminder

Example:

> "You planned to save ৳6,500 this month for your Laptop goal."

The notification should provide context:

```text
Goal:
Laptop

Target:
৳100,000

Current:
৳62,000
```

Only expose the amount if the user has allowed financial detail in notifications.

---

# 25. Goal Milestone Notification

Example:

> "You've reached 75% of your Laptop goal."

Milestone notifications should be celebratory but subtle.

---

# 26. Goal At-Risk Notification

Example:

> "Your Laptop goal may fall behind its December target at your current saving pace."

This should distinguish:

```text
Projection
vs
Actual
```

---

# 27. Goal Completion Notification

Example:

> "You reached your Laptop goal: ৳100,000."

A short haptic or animation can complement the in-app experience.

---

# 28. Goal Notification Deduplication

The same milestone should generate only one notification per goal lifecycle unless the user deliberately resets the goal.

---

# 29. Lending Notifications

Potential events:

```text
Due Soon
Due Today
Overdue
Repayment Recorded
```

---

# 30. Lending Due-Soon Reminder

Example:

> "Rahim is expected to repay ৳6,000 in 3 days."

Deep link:

```text
Lending Detail
```

---

# 31. Lending Due Today

Example:

> "Rahim's ৳6,000 repayment is due today."

The user may:

```text
View
Snooze
```

---

# 32. Lending Overdue Reminder

Example:

> "Rahim's ৳6,000 repayment is now overdue."

The system should avoid accusatory language.

---

# 33. Borrowing Notifications

Same event types:

```text
Due Soon
Due Today
Overdue
Repayment Recorded
```

Example:

> "Your ৳8,000 repayment to Arif is due in 2 days."

---

# 34. Reminder Privacy

Notification detail settings should allow users to hide sensitive financial information.

Potential modes:

```text
Full Details
Hide Amounts
Generic Notifications
```

Example generic mode:

> "You have an upcoming repayment."

instead of:

> "Your ৳8,000 repayment to Arif is due tomorrow."

---

# 35. Email Repayment Reminders

Email reminders are user-authorized outbound communication.

Configuration should include:

```text
Recipient
Timing
Channel
Template
Enabled/Disabled
```

The user must explicitly enable automatic sending.

---

# 36. Email Reminder Workflow

```text
Repayment Event
    ↓
Reminder Schedule
    ↓
Eligibility Check
    ↓
Create Email Job
    ↓
Redis Queue
    ↓
Email Worker
    ↓
Provider
    ↓
Delivery Result
```

The financial record is independent of delivery success.

---

# 37. Email Reminder Templates

Templates should support:

```text
Greeting
Person
Amount
Original Due Date
Current Status
Polite Request
Optional Note
```

Templates should remain editable.

---

# 38. Email Reminder Preview

Before enabling automatic email reminders, the UI should show:

```text
To:
rahim@example.com

Subject:
Friendly repayment reminder

Message:
...
```

This reduces accidental communication.

---

# 39. Email Reminder Deduplication

Each scheduled reminder should have a stable identity.

Retries must not send the same email multiple times.

A successful delivery must mark the reminder event as delivered.

---

# 40. Email Retry

Retry transient failures:

```text
Timeout
5xx
Rate Limit
Temporary Provider Error
```

Do not endlessly retry:

```text
Invalid Email
Rejected Address
Permanent Provider Error
```

---

# 41. Bill Notifications

Potential events:

```text
Due in 7 Days
Due in 3 Days
Due Tomorrow
Due Today
Overdue
```

The default schedule should be conservative.

---

# 42. Bill Notification Example

> "Your Internet bill of ৳1,000 is due tomorrow."

Deep link:

```text
Bill Detail
```

---

# 43. Subscription Notifications

Potential events:

```text
Upcoming Charge
Price Change Detected
Subscription Due
```

Price-change detection may require future external transaction data and should not be enabled until the product can support it reliably.

---

# 44. Recurring Transaction Notifications

Potential events:

```text
Upcoming Recurring Expense
Upcoming Recurring Income
Rule Paused
Rule Failed
```

A recurring rule should not send repetitive notifications merely because it exists.

---

# 45. AI Notifications

AI notifications should be rare.

Potential examples:

```text
Important Budget Risk
Unusual Spending Pattern
Goal Risk
Significant Financial Pattern
```

Do not notify users about every AI insight.

---

# 46. AI Notification Eligibility

An AI insight should generally satisfy:

```text
Meaningful
+
Relevant
+
Actionable
+
Not Recently Repeated
```

before becoming a notification.

---

# 47. AI Notification Guardrails

AI must not be able to bypass notification preferences.

It must not:

- send arbitrary messages
- choose uncontrolled channels
- expose sensitive context unnecessarily
- create high-priority notifications without policy approval

---

# 48. Security Notifications

Security notifications may include:

```text
New Device Login
Password Changed
Password Reset
Device Revoked
Security Setting Changed
```

These deserve stronger notification treatment.

---

# 49. Security Notification Priority

Security events may be:

```text
HIGH
CRITICAL
```

depending on severity.

Quiet hours may be bypassed for important security events if product policy permits.

---

# 50. Sync Notifications

Sync problems should generally remain low-noise.

Preferred in-app:

```text
Some changes couldn't sync.
Your local data is safe.
```

A push notification should only be used for persistent or important sync failures.

---

# 51. Notification Grouping

Related notifications should be grouped where the platform supports it.

Example:

```text
3 Financial Reminders

• Internet Bill tomorrow
• Rahim repayment in 2 days
• Goal contribution reminder
```

The exact platform behavior can vary.

---

# 52. Notification Coalescing

If multiple low-priority events occur close together, they may be summarized.

Example:

Instead of:

```text
Food budget at 80%
Food budget at 81%
Food budget at 82%
```

send:

> "Your Food budget is nearing its limit."

The system must never coalesce distinct security-critical events.

---

# 53. Notification Expiration

Some notifications become irrelevant after their underlying state changes.

Examples:

```text
Goal At Risk
 ↓
Goal Completed
 ↓
Old risk notification expires
```

```text
Repayment Due
 ↓
Fully Repaid
 ↓
Future reminder cancelled
```

---

# 54. Notification Cancellation

The system must cancel future notifications when the underlying state is resolved.

Examples:

```text
Goal completed
→ Cancel goal reminders

Repayment fully paid
→ Cancel repayment reminders

Budget archived
→ Cancel budget-specific notifications
```

---

# 55. Notification Snooze

Users should be able to snooze appropriate reminders.

Possible values:

```text
Later Today
Tomorrow
In 3 Days
Next Week
Custom
```

Snooze should not alter the underlying financial due date.

---

# 56. Snooze State

A snoozed notification should become a new scheduled delivery event rather than rewriting the underlying business event.

Example:

```text
Repayment Due
↓
Snooze until tomorrow
↓
Business state remains Due
↓
Notification rescheduled
```

---

# 57. Notification Deep-Link Failure

If the target entity has been deleted or is unavailable:

```text
This item is no longer available.

[Open App]
```

The user should not encounter a broken navigation state.

---

# 58. Local Notification Architecture

Local notifications are appropriate when all required information is already stored locally.

Examples:

```text
Upcoming Bill
Goal Contribution Reminder
Known Repayment Reminder
```

Flow:

```text
Business State
 ↓
Local Scheduler
 ↓
OS Notification
```

---

# 59. Push Notification Architecture

Push notifications are appropriate when the server must initiate communication.

Flow:

```text
Business Event
 ↓
Notification Service
 ↓
Push Provider
 ↓
Device
```

The push provider must remain abstracted from domain modules.

---

# 60. Push Token Management

A cloud-enabled device may register:

```text
device_id
push_token
platform
app_version
last_seen_at
```

Tokens can expire/change and must be refreshed safely.

---

# 61. Multiple Devices

A user may have:

```text
Android Phone
iPhone
Tablet
Web
```

Notifications must avoid accidental duplication.

The notification system should distinguish:

```text
Logical Event
vs
Device Delivery
```

---

# 62. Multi-Device Deduplication

Example:

```text
Logical Reminder ID:
REM-123
```

Delivery records may exist for:

```text
Android
iOS
```

The application must define whether one or all devices should receive it.

For high-priority reminders, multiple-device delivery may be appropriate.

For local-only notifications, only the relevant device is involved.

---

# 63. Device Notification Preferences

Users may eventually control:

```text
This Device
All Devices
```

However, global preferences should remain synchronized so that disabling a category does not unexpectedly re-enable it on another device.

---

# 64. Notification Permission Flow

Do not request notification permission immediately on first launch.

Preferred:

```text
User Enables Reminder Feature
        ↓
Explain Benefit
        ↓
System Permission
```

This creates a contextual permission request.

---

# 65. Notification Permission Denied

If permission is denied:

```text
Reminder Created
+
Local Notification Unavailable
```

The app should explain alternatives where available:

```text
Email
In-app reminders
```

Do not block the entire feature.

---

# 66. Notification Preferences Screen

Recommended grouping:

```text
Notifications

Budgets
  Spending thresholds      ON
  Projected overrun        ON

Goals
  Contribution reminders  ON
  Milestones               ON
  Goal risk                OFF

Repayments
  Due reminders            ON
  Overdue                  ON

Bills
  Upcoming                 ON
  Overdue                  ON

AI
  Important insights       OFF
```

---

# 67. Global Notification Control

A global setting may disable non-critical notifications:

```text
Pause Notifications
```

Security-critical notifications may remain enabled according to product policy.

---

# 68. Quiet Hours UX

Example:

```text
Quiet Hours

11:00 PM
to
7:00 AM

[✓] Delay non-critical alerts
```

The UI should explain what happens during quiet hours.

---

# 69. Notification Channels on Android

Android supports notification channels.

The app should use logical channels such as:

```text
Budget Alerts
Repayment Reminders
Goal Reminders
Bill Reminders
AI Insights
Security
System
```

Users can control these through Android system settings.

The app should not create excessive channels.

---

# 70. Notification Sounds and Vibration

Users should be able to control notification behavior through platform settings where supported.

The app should avoid custom aggressive sounds.

---

# 71. Notification Content Accessibility

Notification content must be:

- concise
- understandable
- readable
- screen-reader compatible where applicable

Critical context should appear in text rather than color alone.

---

# 72. Notification Data Payloads

Push payloads should contain minimal information.

Prefer:

```json
{
  "type": "BUDGET_ALERT",
  "entityId": "uuid"
}
```

rather than sending full financial content in the push payload.

The app can retrieve or resolve the full detail securely.

This reduces sensitive data exposure through push infrastructure.

---

# 73. Notification Payload Security

Never send:

- authentication tokens
- passwords
- full account histories
- unnecessary financial datasets

through push payloads.

---

# 74. Notification Localization

Notification templates must support:

```text
English
Bangla
```

and future languages.

Templates should use localization keys rather than hardcoded text.

---

# 75. Notification Date Formatting

Notifications should use human-friendly date language:

```text
Tomorrow
In 3 days
Today
```

rather than unnecessarily technical timestamps.

---

# 76. Notification Timezone

Scheduled notifications must use the user's configured timezone.

A reminder set for:

```text
9:00 AM
```

should not unexpectedly move to another time because the backend stores UTC.

---

# 77. Timezone Changes

If the user travels:

```text
Timezone changes
 ↓
Future scheduled reminders
 ↓
Re-evaluate
```

The product should define whether reminders follow:

- original local time
- new local time
- fixed absolute time

For personal reminders, following the user's current configured local time is generally the most intuitive.

---

# 78. Notification Scheduling Architecture

Scheduled notifications may be produced by:

```text
Local Scheduler
```

or:

```text
Backend Scheduler
 ↓
Redis Job
 ↓
Notification Worker
```

The channel determines the appropriate architecture.

---

# 79. Background Job Idempotency

Every scheduled notification job should have a stable identity.

Repeated worker execution must not create duplicate deliveries.

Example:

```text
REMINDER:{entityId}:{eventDate}:{channel}
```

The exact key format can be implementation-specific.

---

# 80. Notification Retry

Delivery failures should use retry policies appropriate to the channel.

## Push

Retry transient provider failures.

## Email

Retry transient provider failures.

## Local

Usually rely on OS scheduling and reschedule only when necessary.

---

# 81. Notification Failure

If delivery fails:

```text
Underlying Business Event
        ↓
Remains Active

Notification
        ↓
FAILED
```

The system must not mark the repayment as paid or the budget as acknowledged.

---

# 82. Notification History

Users may access an in-app notification center.

Possible sections:

```text
All
Unread
Financial
Security
System
```

The notification center should provide a useful history without storing unnecessary duplicates forever.

---

# 83. Notification Retention

Notification history may have a retention policy.

Example:

```text
Read / dismissed notifications:
retain for a defined period
```

Security notifications may require longer retention.

The exact retention rules should be documented with the data retention policy.

---

# 84. Notification Center UX

Recommended:

```text
Notifications

Today

Budget
Food budget is nearing its limit
10:20 AM

Repayment
Rahim repayment due tomorrow
8:00 AM

Yesterday

Goal
You reached 75% of your Laptop goal
```

Unread state should be clear but subtle.

---

# 85. Notification Actions

Actions should be limited to safe, contextually appropriate operations.

Examples:

```text
View Budget
View Goal
View Obligation
Snooze
Mark Read
```

Avoid allowing sensitive destructive operations directly from notifications.

---

# 86. Notification vs AI Action

AI-generated notifications may deep-link to recommendations.

They should not execute financial mutations from a notification tap.

Example:

```text
AI Recommendation
 ↓
View Recommendation
 ↓
User Review
 ↓
Explicit Action
```

---

# 87. Notification Analytics

Product analytics may track:

```text
Notification Delivered
Notification Opened
Notification Dismissed
Notification Snoozed
```

Avoid tracking sensitive message content.

---

# 88. Notification Product Metrics

Useful non-sensitive metrics:

- delivery success rate
- open rate
- reminder completion rate
- snooze rate
- notification opt-out rate
- duplicate rate
- failure rate

High notification volume should be monitored as a possible UX problem.

---

# 89. Notification Fatigue Monitoring

Potential signs:

```text
High dismissal rate
High notification disable rate
Low open rate
Repeated snoozing
```

These signals may justify reducing notification frequency.

---

# 90. Notification Personalization

Future personalization may allow users to choose:

```text
Preferred reminder time
Preferred channels
Reminder frequency
Financial detail visibility
```

Personalization should reduce interruption, not increase complexity.

---

# 91. Notification Security

Every notification event must be authorized by the underlying user's data.

For example:

```text
Lending record belongs to User A
↓
Only User A's reminder may be scheduled
```

No arbitrary client request should be able to create reminders referencing another user's entity.

---

# 92. Email Address Security

Email recipients must be validated and associated with user-controlled data.

The system must not expose another person's email through search or shared endpoints.

---

# 93. Notification API

Relevant endpoints:

```text
GET   /api/v1/notifications
POST  /api/v1/notifications/:id/read
POST  /api/v1/notifications/:id/dismiss
POST  /api/v1/notifications/:id/snooze

GET   /api/v1/notification-preferences
PATCH /api/v1/notification-preferences

POST  /api/v1/reminders
PATCH /api/v1/reminders/:id
DELETE /api/v1/reminders/:id
```

Domain-specific reminder endpoints may be preferred for lending, goals, and bills.

Exact API contracts are defined by `API.md`.

---

# 94. Notification Database Dependencies

Primary entities:

```text
Notification
NotificationPreference
User
Device / Push Token
LendingRecord
BorrowingRecord
Budget
Goal
Bill
RecurringTransaction
AIInsight
```

---

# 95. Local Storage Dependencies

Local notification scheduling may depend on:

```text
notifications
notification_preferences
budgets
goals
lending_records
borrowing_records
bills
recurring_transactions
```

The local database should contain enough information to schedule supported offline reminders.

---

# 96. Sync Behavior

Notification preferences synchronize as user settings.

Financial source records synchronize independently.

The system should avoid syncing every device-specific local notification record as if it were business state.

---

# 97. Local vs Cloud Notification Model

Use local notifications for:

```text
Known local schedules
```

Use cloud/push/email for:

```text
Server-originated events
Cross-device coordination
Provider-based messaging
```

The system may use both for the same logical event only when deduplication is explicitly designed.

---

# 98. Notification Conflict

A notification preference conflict should follow user-setting synchronization rules.

Example:

```text
Device A:
Budget alerts ON

Device B:
Budget alerts OFF
```

The settings synchronization model must define deterministic resolution.

Security-sensitive preferences may require special handling.

---

# 99. Notification Edge Cases

Must handle:

- permission denied
- notification channel disabled
- device offline
- push token expired
- timezone change
- quiet hours
- financial event resolved before reminder
- duplicate worker execution
- email failure
- invalid recipient
- archived entity
- deleted entity
- user logs out
- account deleted
- device revoked
- app reinstalled

---

# 100. Logout Behavior

When a user logs out:

- stop private push delivery to the device where appropriate
- remove/revoke device session state
- cancel or rebind local private notifications where required
- ensure another user cannot see previous user's sensitive notifications

The exact local-device behavior must be verified for multi-user edge cases.

---

# 101. Account Deletion

When the user deletes their account:

```text
Future Notifications
→ Cancel

Scheduled Emails
→ Cancel

Push Registration
→ Revoke

Notification History
→ Delete according to retention policy
```

---

# 102. App Reinstallation

After reinstall:

```text
Local Notifications
→ Recreated only from valid synchronized/local data

Push Token
→ Re-register

Preferences
→ Restore from cloud when authenticated
```

The app must not assume old device tokens remain valid.

---

# 103. Notification Acceptance Criteria

The module is complete when:

- Users can configure notification preferences.
- Budget alerts work.
- Goal reminders work.
- Lending/borrowing reminders work.
- Bill reminders work.
- Recurring notifications work where required.
- Local notifications work when permission is granted.
- Push notifications are supported for server-originated events where required.
- Email reminders are authorized and asynchronous.
- Notification delivery is idempotent.
- Duplicate reminders are prevented.
- Quiet hours work.
- Deep links work.
- Resolved events cancel future reminders.
- Multiple devices do not create accidental duplicates.
- Sensitive push payloads are minimized.
- Notification permissions are requested contextually.
- Security events receive appropriate treatment.
- Offline behavior is defined.
- Critical paths have automated tests.

---

# 104. Testing Matrix

## Unit Tests

Test:

- preference rules
- threshold crossing
- reminder timing
- quiet hours
- deduplication
- cancellation
- timezone handling

## Integration Tests

Test:

- notification scheduling
- queue jobs
- email provider adapter
- push provider adapter
- database persistence
- reminder cancellation

## E2E Tests

```text
Enable Budget Alert
→ Cross Threshold
→ Receive Notification
→ Open Budget
```

```text
Create Lending
→ Schedule Reminder
→ Receive Reminder
→ Record Repayment
→ Future Reminder Cancelled
```

---

# 105. Notification Quality Bar

The notification system should be:

```text
Useful
Timely
Quiet
Actionable
Private
Reliable
Recoverable
```

The target experience is:

> **The app reminds me about things I am likely to forget, but stays quiet about things I do not need to know.**

---

# 106. Relationship With Other Documents

Product-module sequence:

```text
BUDGETING.md
        ↓
LENDING_BORROWING.md
        ↓
FINANCIAL_GOALS.md
        ↓
REPORTING.md
        ↓
NOTIFICATIONS.md
        ↓
RECURRING_TRANSACTIONS.md
```

Notifications depend on:

```text
Budgets
Goals
Lending
Borrowing
Bills
Recurring Transactions
AI
Security
Sync
```

The next document is:

```text
docs/product/RECURRING_TRANSACTIONS.md
```

It should define:

- Recurring transaction rules
- Recurring income
- Recurring expenses
- Bills
- Subscriptions
- Scheduling
- Upcoming occurrences
- Automatic vs suggested transactions
- Missed occurrences
- Month-end behavior
- Reminder rules
- Duplicate prevention
- Sync
- Offline behavior
- Analytics
- AI integration
- Edge cases
- Acceptance criteria

The central notification principle remains:

> **Notifications should reduce forgetfulness, not become another source of noise.**
