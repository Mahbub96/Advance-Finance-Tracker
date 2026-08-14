# Personal Finance — UX Research

**Document:** `UX_RESEARCH.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**UX Priority:** Frictionless financial data entry  
**Repository:** Open Source

---

# 1. Purpose

This document defines the UX research direction for the Personal Finance application.

The product is intended to be an advanced financial management and intelligence application, but its everyday interactions must remain extremely simple.

The primary UX challenge is:

> **How do we provide a large and powerful financial system without making everyday financial tracking feel like administrative work?**

The UX strategy therefore focuses on:

- Fast transaction entry
- Low cognitive load
- One-handed mobile usage
- Intelligent defaults
- Progressive disclosure
- Clear financial understanding
- Discoverable advanced functionality
- Trustworthy analytics
- Calm notifications
- Explainable AI
- Consistent interaction patterns

This document defines the research principles and evaluation criteria.

Detailed screen specifications belong in `UI_DESIGN.md`.

Detailed navigation structure belongs in `INFORMATION_ARCHITECTURE.md`.

Detailed workflows belong in `USER_FLOWS.md`.

---

# 2. UX North Star

The application's primary UX goal is:

> **A user should be able to record normal financial activity with almost no friction, while advanced financial intelligence remains available whenever they need it.**

This produces two distinct UX layers.

## Everyday Layer

Fast:

- Add expense
- Add income
- Transfer money
- Check today's spending
- See remaining budget

## Advanced Layer

Deep:

- Reports
- Forecasting
- Goal planning
- Lending/borrowing
- Financial health
- AI insights
- What-if simulations

The advanced layer must not make the everyday layer complicated.

---

# 3. Core UX Problem

Financial tracking requires repeated interaction.

A user may need to record several transactions every day.

A poor workflow can look like:

```text
Open App
   ↓
Find Transactions
   ↓
Tap Add
   ↓
Choose Type
   ↓
Enter Amount
   ↓
Choose Account
   ↓
Choose Category
   ↓
Enter Merchant
   ↓
Add Note
   ↓
Save
```

Repeated dozens or hundreds of times, this creates significant friction.

The desired experience is closer to:

```text
Open / Quick Action
   ↓
Enter Amount
   ↓
Smart Suggestions
   ↓
Save
```

Optional details should be available without becoming mandatory.

---

# 4. UX Principles

## 4.1 Every Tap Must Earn Its Place

Every interaction should answer:

> Is this interaction necessary?

If an action can be inferred safely, it should not require manual input.

---

## 4.2 Optimize for Frequency

The most frequently used functions should receive the simplest interactions.

Priority:

```text
High Frequency
→ Lowest Friction

Medium Frequency
→ Simple Workflow

Low Frequency
→ Advanced / Discoverable Workflow
```

---

## 4.3 Input Before Decoration

Transaction entry should optimize for speed before visual richness.

The user must never have to navigate through decorative UI before recording money.

---

## 4.4 Smart, Not Intrusive

The system should help users without making assumptions difficult to correct.

Examples:

- Suggest account
- Suggest category
- Suggest merchant
- Suggest recent amount

Suggestions should be editable.

---

## 4.5 Progressive Disclosure

Advanced information should appear progressively.

Example:

```text
Basic View
    ↓
More Details
    ↓
Advanced Analytics
```

The default screen should remain approachable.

---

## 4.6 One Primary Action

Each major screen should have one clearly dominant action.

Examples:

Dashboard:

> Add Transaction

Budget:

> Create Budget

Goal:

> Add Contribution

Lending:

> Record Repayment

---

## 4.7 User Control

Automation should always remain reversible.

Users should be able to:

- Edit suggestions
- Undo changes where practical
- Disable AI
- Disable notifications
- Change defaults
- Export data
- Delete data

---

# 5. User Mental Model

The product should follow the user's mental model of money.

The most understandable conceptual structure is:

```text
Money
├── Where it is
│   └── Accounts
│
├── Where it came from
│   └── Income
│
├── Where it went
│   └── Expenses
│
├── Where it moved
│   └── Transfers
│
├── Who owes whom
│   ├── Lending
│   └── Borrowing
│
├── What I plan
│   ├── Budgets
│   └── Goals
│
└── What I should understand
    ├── Analytics
    ├── Forecasting
    └── AI Insights
```

The information architecture should follow this mental model rather than mirroring the database schema.

---

# 6. Primary UX Personas

## 6.1 Daily Tracker

Needs:

- Very fast entry
- Minimal typing
- Quick actions
- Clear daily spending
- Budget awareness

This is the most important persona.

---

## 6.2 Financial Planner

Needs:

- Budgets
- Goals
- Reports
- Forecasts
- Long-term comparisons

---

## 6.3 Financial Organizer

Needs:

- Lending/borrowing
- Recurring payments
- Bills
- Subscriptions
- Attachments

---

## 6.4 Power User

Needs:

- Advanced filters
- Deep analytics
- Export
- Custom categories
- AI assistant
- What-if simulations

The interface should not force every user into the power-user experience.

---

# 7. Transaction Entry Research

Transaction entry is the primary UX research area.

## 7.1 Amount-First Principle

The amount is usually the most certain and most important transaction attribute.

The default interaction should therefore prioritize amount entry.

Potential sequence:

```text
Amount
 ↓
Category
 ↓
Account
 ↓
Optional Details
 ↓
Save
```

---

## 7.2 Type Selection

Expense, income, and transfer are high-level transaction types.

The UI should make changing type easy but should avoid forcing a separate type screen every time.

Possible approaches:

- Contextual action menu
- Segmented control
- Quick action entry point

The best approach should be validated in usability testing.

---

# 8. Transaction Entry Candidates

Three major patterns should be evaluated.

## Pattern A — Full-Screen Form

```text
Amount
Category
Account
Merchant
Date
Note
Save
```

### Advantages

- Clear
- Familiar
- Easy to understand
- Good for detailed transactions

### Disadvantages

- Potentially slow
- Large visual footprint
- More cognitive load

---

## Pattern B — Bottom Sheet

A bottom sheet can keep the user in context.

Potential sequence:

```text
Tap +
 ↓
Bottom Sheet
 ↓
Amount
 ↓
Suggestions
 ↓
Save
```

### Advantages

- Fast
- Mobile-friendly
- Supports one-handed use
- Preserves underlying context

### Risks

- Complex forms may become cramped
- Keyboard interaction requires careful design

---

## Pattern C — Quick Entry Composer

The application behaves like a compact command composer.

Example:

```text
৳ 450

Groceries      bKash
Today          8:42 PM

[ Save ]
```

Advanced fields remain behind an expansion action.

This approach is highly aligned with the product's frictionless-entry philosophy and should receive strong consideration.

---

# 9. Recommended Transaction UX Direction

The preferred direction is a **fast composer + progressive details** model.

Default:

```text
Amount
 ↓
Smart Category
 ↓
Smart Account
 ↓
Save
```

Optional:

```text
Merchant
Note
Tags
Date
Attachment
Location
Recurring Rule
```

This avoids forcing every user through a long form.

---

# 10. Smart Defaults Research

The application should learn from repeated behavior.

Example historical pattern:

```text
Merchant:
Coffee Shop

Typical:
Category: Food
Account: Cash
Amount: ৳120
```

The application can suggest these values.

However:

- Suggestions must be editable.
- Incorrect suggestions should be easy to correct.
- The user should not lose control.

---

# 11. Recent Transaction Reuse

Repeated transactions are common.

The UI should support:

- Duplicate
- Repeat
- Quick action
- Recent item selection

Example:

```text
Recent

Coffee — ৳120
Lunch — ৳250
Bus — ৳50
```

The goal is to convert common transactions into near one-tap actions.

---

# 12. Quick Actions

The primary quick action should provide:

```text
Expense
Income
Transfer
Lend
Borrow
Repayment
```

The first three should be immediately accessible because they are foundational transaction types.

---

# 13. One-Handed Design

Important actions should be placed within comfortable thumb reach.

Primary areas:

```text
Lower screen
↓
Primary interaction
```

Secondary controls may be placed higher.

Avoid placing frequently used actions only in the top corners.

---

# 14. Bottom Navigation Research

A five-item navigation model is a strong candidate:

```text
Home
Transactions
+
Analytics
More
```

The central `+` is a candidate for the primary creation action.

However, the final navigation must be validated against:

- Discoverability
- Thumb reach
- Interaction frequency
- Visual balance
- Accessibility

The exact structure will be finalized in `INFORMATION_ARCHITECTURE.md`.

---

# 15. Dashboard UX Research

The dashboard should answer three questions immediately:

### 1. Where am I financially?

Current balance and overall status.

### 2. What needs my attention?

Budget risks, upcoming obligations, unusual spending.

### 3. What can I do now?

Add transaction and other primary actions.

A possible composition:

```text
Good Morning

Total Balance
৳XX,XXX

This Month
Income    Expense    Saved

[ Add Transaction ]

Budget
████████░░  78%

Attention
• Dining budget is close to limit
• ৳5,000 repayment due soon

Insights
• Spending is 12% lower than last month
```

This is a conceptual direction, not the final UI.

---

# 16. Dashboard Density

The dashboard should not display every available metric.

Use information hierarchy:

```text
Critical
   ↓
Important
   ↓
Useful
   ↓
Optional
```

Users should be able to access deeper analytics without making the home screen overwhelming.

---

# 17. Today vs Month

Users may have different mental models.

The dashboard should balance:

- Today's activity
- Current month
- Long-term status

The default view should emphasize current actionable information while providing easy access to historical periods.

---

# 18. Analytics UX

Analytics should answer questions rather than merely show charts.

Bad:

> A chart with no explanation.

Better:

> "Food spending is 24% higher than your three-month average."

Then allow the user to inspect the underlying data.

---

# 19. Chart Rules

Charts must:

- Use clear labels
- Avoid unnecessary decoration
- Support touch interaction
- Provide exact values on demand
- Support accessible alternatives
- Handle sparse datasets gracefully
- Avoid misleading scales

Charts should always have a purpose.

---

# 20. Progressive Analytics

A useful analytics hierarchy is:

```text
Summary
   ↓
Trend
   ↓
Comparison
   ↓
Explanation
   ↓
Action
```

Example:

```text
Food: ৳8,450
     ↓
+18% vs average
     ↓
Restaurant spending increased
     ↓
Budget risk detected
     ↓
Recommendation available
```

---

# 21. Budget UX

Budget screens should show:

- Planned amount
- Spent amount
- Remaining
- Percentage
- Spending velocity
- Forecast

The most important question is not only:

> "How much have I spent?"

but:

> "Am I still on track?"

---

# 22. Budget Warning UX

Warnings should use urgency levels.

## Informational

> "You've used 55% of your food budget."

## Attention

> "You're spending faster than usual."

## Warning

> "Your current pace may exceed the budget."

## Critical

> "Your projected spending is above the budget."

Avoid aggressive error-style presentation for normal financial warnings.

---

# 23. Lending & Borrowing UX

Lending and borrowing should feel like relationship tracking rather than accounting software.

A person-first presentation is preferable:

```text
Rahim
৳6,000 outstanding
Due in 3 days
```

rather than leading with database-style identifiers.

---

# 24. Repayment UX

Recording a repayment should be extremely easy.

Preferred interaction:

```text
Outstanding: ৳6,000

Repayment Amount
[ ৳ ______ ]

[ Record Repayment ]
```

After saving:

```text
Remaining: ৳4,000
```

The user should immediately understand the new state.

---

# 25. Reminder UX

Reminders should be:

- Polite
- Clear
- Timely
- Actionable

The UI should allow:

- Reminder schedule
- Channel selection
- Message customization
- Disable/remind-later

---

# 26. Email UX

Email content should feel human.

A reminder should clearly explain:

- Who owes whom
- Amount
- Expected date
- Optional polite request

The application should avoid language that feels threatening or automated inappropriately.

---

# 27. Goal UX

Goals should emphasize progress and motivation.

Useful elements:

```text
Laptop

৳62,000 / ৳100,000

62%

৳6,333/month needed

Estimated completion:
December
```

The system should distinguish current reality from projections.

---

# 28. What-If UX

What-if simulation should feel interactive.

Potential design:

```text
Monthly Saving
৳5,000

[ + ] [ - ]

Goal completion:
Dec 2026
```

Changing an assumption should update the projection immediately where computationally reasonable.

AI may explain the impact after the deterministic simulation is complete.

---

# 29. Notifications UX

Notification volume should remain low.

Use:

```text
Important
Actionable
Timely
```

Avoid:

```text
Frequent
Redundant
Generic
Attention-seeking
```

Users should be able to configure notification categories independently.

---

# 30. AI UX Principles

AI should feel like an assistant, not the operating system of the app.

The user should still understand their finances without AI.

AI should:

- Explain
- Summarize
- Recommend
- Answer
- Surface patterns

AI should not:

- Invent
- Override user decisions
- Modify financial records silently
- Hide underlying numbers
- Pretend predictions are facts

---

# 31. AI Insight Presentation

An AI insight should usually contain:

```text
Insight
Why it matters
Supporting data
Optional action
```

Example:

```text
Dining spending is 31% higher this month.

Why:
Restaurant spending increased by ৳2,400.

Suggestion:
Reducing dining by about ৳800 this week may help
you stay within the monthly budget.
```

---

# 32. AI Confidence

Where meaningful, the UI should communicate uncertainty.

Example:

> "Based on your recent spending pattern..."

rather than:

> "You will definitely spend ৳35,000."

Predictions are estimates.

---

# 33. AI Loading Experience

AI requests may take longer than local calculations.

The UI should communicate:

- Processing
- Source of insight where useful
- Failure state
- Retry

The user should not be blocked from using the rest of the application.

---

# 34. AI Failure State

Example:

> "AI insights are temporarily unavailable. Your financial data and standard analytics are still available."

Never present AI unavailability as application failure.

---

# 35. Empty State Research

Every empty state should answer:

1. What is empty?
2. Why does it matter?
3. What should the user do next?

Example:

```text
No budgets yet

Set a monthly budget to understand
whether your spending is on track.

[ Create Budget ]
```

---

# 36. Loading State Research

Use:

- Skeletons
- Small progress indicators
- Optimistic UI where safe
- Background processing

Avoid blank-screen loading.

---

# 37. Error State Research

Errors should be:

- Human-readable
- Actionable
- Non-technical
- Recoverable where possible

Bad:

> PrismaClientKnownRequestError

Good:

> "We couldn't save this transaction. Please try again."

---

# 38. Undo

Undo should be preferred where appropriate for reversible actions.

Examples:

- Delete transaction
- Remove tag
- Archive account

For financially sensitive operations, confirmation may still be required.

---

# 39. Confirmation Design

Do not ask for confirmation unnecessarily.

Avoid:

```text
Are you sure?
Are you sure again?
Confirm?
```

Use confirmation mainly for:

- Destructive deletion
- Irreversible restore
- Permanent data deletion
- Sensitive account actions

---

# 40. Forms Research

Forms should:

- Show only necessary fields initially
- Use smart defaults
- Use appropriate keyboard types
- Persist draft state where reasonable
- Validate inline
- Preserve entered values after errors

---

# 41. Keyboard UX

Amount fields should use the numeric keyboard.

Text fields should expose the most appropriate keyboard.

The keyboard must not obscure the primary action.

The layout should adapt to keyboard appearance.

---

# 42. Accessibility Research

Required considerations:

- Screen reader labels
- Minimum touch targets
- Color contrast
- Text scaling
- Reduced motion
- Semantic hierarchy
- Clear focus states
- Non-color-only status communication

---

# 43. Motion & Animation

Animation should communicate state rather than decorate the interface.

Good uses:

- Save confirmation
- Sheet transitions
- Progress updates
- Chart transitions
- Goal milestones

Avoid:

- Long transitions
- Excessive bounce
- Unnecessary animation on every tap

---

# 44. Micro-Interaction Philosophy

Micro-interactions should reinforce:

- Success
- Progress
- State changes
- Attention
- Completion

Examples:

```text
Transaction saved
Budget updated
Goal milestone reached
Repayment recorded
```

Animations should remain subtle.

---

# 45. Visual Hierarchy

The application should prioritize:

```text
Primary Value
    ↓
Action
    ↓
Context
    ↓
Details
```

Do not give every metric equal visual weight.

---

# 46. Information Density

Financial applications naturally contain large amounts of data.

The goal is not to reduce information.

The goal is to organize information intelligently.

Use:

- grouping
- hierarchy
- whitespace
- progressive disclosure
- filtering
- contextual detail

---

# 47. Color Strategy

Color should communicate meaning consistently.

Potential semantic categories:

- Positive / healthy
- Warning
- Critical
- Neutral
- Income
- Expense
- Transfer

The exact palette belongs in `DESIGN_SYSTEM.md`.

Color must never be the only signal.

---

# 48. Typography Strategy

Typography should establish a clear hierarchy between:

- Financial amounts
- Titles
- Labels
- Supporting information
- Warnings
- Explanations

Large numbers should be readable at a glance.

---

# 49. Haptic Feedback

Where supported, haptic feedback may reinforce:

- Successful save
- Selection
- Important state change
- Completion

Haptics should not be overused.

---

# 50. Gesture Research

Potential useful gestures:

- Swipe transaction actions
- Swipe-to-dismiss
- Pull-to-refresh where appropriate
- Long press for secondary actions

Gestures must always have visible alternatives for accessibility and discoverability.

---

# 51. Personalization

Potential personalization:

- Favorite transaction types
- Favorite categories
- Preferred accounts
- Dashboard sections
- Notification settings
- Theme
- Default currency

Personalization should reduce friction rather than create configuration work.

---

# 52. Trust UX

Financial applications require a strong sense of trust.

The UI should communicate:

- Accuracy
- Stability
- Transparency
- Data ownership
- Privacy

Avoid deceptive patterns.

Never hide:

- Fees
- AI limitations
- Data-sharing behavior
- Important financial assumptions

---

# 53. AI Trust

AI-generated content should be visually distinguishable from authoritative financial calculations when appropriate.

A useful principle:

```text
Calculated by system
≠
Generated by AI
```

For example:

```text
Actual spending
৳8,450

AI insight
"Dining is 31% above your recent average."
```

The source of each claim should be clear.

---

# 54. Privacy UX

Privacy settings should be understandable without technical knowledge.

Instead of:

> "Disable inference provider context transmission"

Prefer:

> "Don't send financial data to AI services."

---

# 55. Data Ownership UX

Users should be able to discover:

- Export data
- Backup
- Restore
- Delete data
- Cloud sync status
- AI data controls

These should not be hidden deeply inside the interface.

---

# 56. Offline UX

The application should communicate offline state without overwhelming the user.

Good:

> "Offline — changes will sync when you're back online."

Avoid blocking the user unless a specific operation truly requires connectivity.

---

# 57. Sync UX

Users should be able to understand synchronization status.

Potential states:

```text
Synced
Syncing
Changes pending
Conflict needs attention
Sync failed
```

Sync status should not dominate the UI.

---

# 58. Onboarding UX Research

Onboarding should teach only the essentials.

Suggested progression:

```text
Welcome
 ↓
Currency
 ↓
First Account
 ↓
Dashboard
 ↓
First Transaction
```

Advanced features should be introduced progressively.

---

# 59. Feature Discovery

Advanced features should be discoverable through:

- Contextual suggestions
- Dashboard cards
- Search
- More section
- Empty states
- Tooltips where genuinely useful

Do not display a giant feature catalog on first launch.

---

# 60. UX Anti-Patterns

The product should explicitly avoid:

## 60.1 Long Transaction Forms

Every transaction should not require ten fields.

## 60.2 Dashboard Overload

Do not display every metric at once.

## 60.3 Notification Spam

Do not notify users about every small financial change.

## 60.4 AI Everywhere

Do not attach AI to features that do not need it.

## 60.5 Hidden Financial Logic

Important calculations must be understandable.

## 60.6 Excessive Confirmation

Avoid confirmation fatigue.

## 60.7 Decorative Complexity

Animation and cards must support a purpose.

## 60.8 Unclear Errors

Never expose raw technical errors to users.

## 60.9 Mandatory Cloud

Do not force account creation for a local-first finance tracker.

## 60.10 Unrecoverable Automation

Automated behavior must be reviewable and correctable.

---

# 61. UX Research Metrics

The UX should be validated using measurable signals.

## Transaction Entry

Measure:

- Time to first field
- Time to save
- Number of taps
- Number of keyboard interactions
- Correction rate
- Abandonment rate

## Navigation

Measure:

- Task completion
- Mis-taps
- Backtracking
- Time to destination

## Analytics

Measure:

- Insight comprehension
- Interaction with details
- Report completion

## AI

Measure:

- Insight usefulness
- Recommendation acceptance
- User corrections
- AI failure recovery

---

# 62. Suggested UX Experiments

Before finalizing the UI, compare alternatives for:

### Experiment A — Transaction Composer

- Full-screen form
- Bottom sheet
- Compact composer

### Experiment B — Primary Add Action

- Central bottom-nav action
- Floating action button
- Persistent add button

### Experiment C — Dashboard

- Summary-first
- Activity-first
- Insight-first

### Experiment D — Analytics

- Chart-first
- Metric-first
- Narrative-first

### Experiment E — Lending

- Person-first
- Ledger-first

The winning pattern should be based on usability and product goals, not personal preference alone.

---

# 63. UX Evaluation Criteria

Every candidate interaction should be evaluated on:

| Criterion       | Question                                      |
| --------------- | --------------------------------------------- |
| Speed           | Can the task be completed quickly?            |
| Cognitive Load  | Does the user need to think unnecessarily?    |
| Discoverability | Can users find it without training?           |
| Accuracy        | Does the interaction reduce mistakes?         |
| One-Handed Use  | Is it comfortable on a phone?                 |
| Accessibility   | Can diverse users operate it?                 |
| Consistency     | Does it match other flows?                    |
| Recoverability  | Can mistakes be corrected?                    |
| Scalability     | Can the pattern support future functionality? |
| Trust           | Does the interaction feel reliable?           |

---

# 64. UX Decision Framework

When two designs appear equally good, prefer the one that:

1. Requires fewer interactions.
2. Requires less typing.
3. Makes the primary action clearer.
4. Reduces error potential.
5. Works better one-handed.
6. Is easier to learn.
7. Supports future extensibility.
8. Preserves user control.

---

# 65. Research Findings to Carry Forward

The following principles are considered foundational:

1. Transaction entry is the highest-priority UX interaction.
2. Amount-first input is strongly preferred.
3. Smart defaults should reduce repeated work.
4. Optional details should remain optional.
5. Advanced functionality should use progressive disclosure.
6. Bottom-oriented controls are strongly suited to mobile usage.
7. Dashboard content should be prioritized rather than maximized.
8. Analytics should answer questions, not merely display charts.
9. Budget warnings should be proactive and calm.
10. Lending/borrowing should use a person-centered presentation.
11. AI should explain and recommend rather than control.
12. Core functionality must remain useful without AI.
13. Offline state must not block everyday usage.
14. Privacy controls should be visible and understandable.
15. The product should feel sophisticated underneath but simple on the surface.

---

# 66. UX Quality Bar

A UX flow is not considered complete merely because the screen works.

It should be:

```text
Fast
+
Clear
+
Consistent
+
Accessible
+
Recoverable
+
Trustworthy
+
Scalable
```

For high-frequency interactions, speed and simplicity should receive the highest weight.

---

# 67. Next UX Documents

After this document, the UX documentation should proceed in this order:

```text
UX_RESEARCH.md
      ↓
INFORMATION_ARCHITECTURE.md
      ↓
USER_FLOWS.md
      ↓
UI_DESIGN.md
      ↓
DESIGN_SYSTEM.md
```

The next document is:

```text
docs/ux/INFORMATION_ARCHITECTURE.md
```

It will convert these UX research findings into the application's concrete:

- navigation structure
- tab structure
- screen hierarchy
- feature grouping
- information hierarchy
- screen relationships
- navigation rules
- deep-linking strategy
- primary and secondary actions
