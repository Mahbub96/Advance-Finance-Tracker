# Personal Finance — Design System

**Document:** `DESIGN_SYSTEM.md`  
**Version:** 1.0  
**Status:** Approved Baseline  
**Last Updated:** 2026-08-12  
**Product:** Personal Finance  
**Platform:** Android-first, iOS-ready  
**Framework:** React Native + Expo + TypeScript  
**Design Goal:** Premium, calm, consistent, highly usable financial UI

---

# 1. Purpose

This document defines the reusable visual and interaction system for the Personal Finance application.

It establishes the common rules that should be used across:

- Screens
- Components
- Forms
- Navigation
- Cards
- Lists
- Charts
- Notifications
- AI surfaces
- Financial status indicators
- Empty states
- Error states
- Motion
- Accessibility

The design system exists to prevent each screen from inventing its own visual language.

It should make the product feel like one coherent application while still allowing different financial modules to have appropriate layouts.

---

# 2. Design System Principles

## 2.1 Clarity Over Decoration

Every visual element should help the user understand, decide, or act.

Avoid decorative complexity that competes with financial information.

## 2.2 Financial Numbers First

Amounts, balances, remaining budgets, and important projections should remain highly readable.

## 2.3 Calm Financial UX

The visual language should reduce anxiety.

Warnings should be noticeable without making normal financial management feel alarming.

## 2.4 Consistency

The same action should look and behave similarly everywhere.

Examples:

- Primary action
- Save
- Delete
- Filter
- Back
- Add
- Warning
- Success

## 2.5 Progressive Detail

The design should support:

```text
Summary
   ↓
Context
   ↓
Details
   ↓
Advanced Analysis
```

---

# 3. Visual Personality

The visual character should be:

- Modern
- Clean
- Premium
- Calm
- Intelligent
- Trustworthy
- Minimal without being empty
- Information-rich without feeling dense

The interface should feel appropriate for a serious financial product rather than a generic budgeting template.

---

# 4. Design Tokens

All reusable visual values should be represented as design tokens.

Recommended token categories:

```text
color
typography
spacing
radius
border
elevation
iconography
motion
opacity
z-index
layout
```

Tokens should be centralized so global design changes do not require editing individual screens.

---

# 5. Color System

The exact final color values should be finalized during visual composition and accessibility validation.

The system should contain semantic roles rather than allowing arbitrary color usage.

## Semantic Roles

```text
primary
primaryForeground

background
surface
surfaceElevated
surfaceMuted

textPrimary
textSecondary
textTertiary
textDisabled

border
borderSubtle

success
successForeground

warning
warningForeground

danger
dangerForeground

info
infoForeground

income
expense
transfer
```

---

# 6. Color Usage Rules

## Primary

Use for:

- Main action
- Selected navigation
- Important interactive elements
- Primary focus states

## Success

Use for:

- Successful operations
- Positive status
- Completed goals
- Healthy financial states

## Warning

Use for:

- Budget attention
- Upcoming deadlines
- Elevated financial risk

## Danger

Use for:

- Destructive actions
- Serious errors
- High-risk financial states

## Info

Use for:

- Explanatory messages
- Informational states
- Non-urgent guidance

---

# 7. Financial Semantic Colors

The product should distinguish financial direction clearly.

Recommended semantics:

```text
Income    → positive semantic treatment
Expense   → expense semantic treatment
Transfer  → neutral treatment
Lending   → contextual treatment
Borrowing → liability treatment
```

These colors must not be the only mechanism for communicating meaning.

Text and iconography should provide redundancy.

---

# 8. Light and Dark Themes

The design system must support:

```text
Light
Dark
System
```

All components must use semantic tokens instead of hardcoded colors.

Dark mode should not simply invert the light palette.

It must maintain:

- Contrast
- Hierarchy
- Surface separation
- Chart readability
- Status clarity

---

# 9. Typography

Typography should establish a clear financial hierarchy.

Recommended semantic styles:

```text
display
headline
title
sectionTitle
body
bodyMedium
bodyStrong
label
caption
numericLarge
numericMedium
numericSmall
button
```

Financial numbers may use slightly stronger weight and tracking where appropriate.

---

# 10. Financial Number Typography

Important amounts should use dedicated numeric styles.

Examples:

```text
Total Balance
৳128,450

Budget Remaining
৳8,800

Goal Progress
62%
```

Do not use the same visual weight for a large financial amount and a small supporting label.

---

# 11. Typography Rules

- Use a maximum of a small number of type families.
- Keep hierarchy consistent.
- Avoid excessive font-weight variation.
- Use readable line heights.
- Support dynamic text scaling.
- Never truncate critical financial numbers unnecessarily.

---

# 12. Spacing System

Use a consistent spacing scale.

Example foundation:

```text
4
8
12
16
20
24
32
40
48
64
```

All spacing should use tokens rather than arbitrary values.

The exact scale can be adjusted during visual implementation, but individual screens should not introduce unrelated spacing values without reason.

---

# 13. Layout Grid

The application should use a consistent horizontal content margin.

Recommended mobile content structure:

```text
Screen
│
├── Safe Area
│
├── Horizontal Padding
│   ├── Content
│   └── Content
│
└── Bottom Safe Area
```

Content margins should adapt to screen width where necessary.

---

# 14. Border Radius

Recommended semantic radius tokens:

```text
radiusSmall
radiusMedium
radiusLarge
radiusXL
radiusPill
```

Use:

- Small radius for compact controls
- Medium radius for cards and inputs
- Large radius for prominent containers
- Pill radius for chips/statuses

Avoid excessive variation.

---

# 15. Elevation

Elevation should be subtle.

Use it to distinguish layers such as:

```text
Background
Surface
Elevated Surface
Modal
Popover
```

Do not use heavy shadows as a default visual treatment.

Dark mode should use appropriate surface contrast rather than simply reproducing light-mode shadows.

---

# 16. Borders

Borders should be used selectively.

Appropriate uses:

- Input fields
- Dividers
- Selected controls
- Outlined buttons
- Data boundaries

Avoid outlining every card and list row unless it improves grouping.

---

# 17. Icons

Icons should use a consistent icon family.

Requirements:

- Consistent visual weight
- Clear meaning
- Appropriate touch target
- Accessible labels
- No icon-only critical action without semantic labeling

Examples:

```text
Home
Transactions
Add
Analytics
More
Search
Filter
Edit
Delete
Calendar
Wallet
Goal
Insight
Warning
```

---

# 18. Icon Usage Rules

Icons should support text rather than replace meaningful labels in important contexts.

Avoid ambiguous icons for financial actions.

For destructive actions, icon + label is preferred when space allows.

---

# 19. Touch Targets

Interactive controls should provide comfortable touch targets.

The system should follow platform accessibility guidance and avoid tiny controls.

Important actions such as:

- Save
- Add
- Back
- Delete
- Filter
- Navigation

must remain easy to tap.

---

# 20. Buttons

Button hierarchy:

```text
Primary
Secondary
Tertiary
Destructive
```

## Primary

For the main action.

Examples:

```text
Save
Create Budget
Add Contribution
Record Repayment
```

## Secondary

For supporting actions.

## Tertiary

For low-emphasis actions.

## Destructive

For irreversible or dangerous actions.

---

# 21. Button Rules

A screen should normally have one dominant primary action.

Avoid:

```text
[Save] [Create] [Continue] [Apply]
```

when all four appear equally important.

Use hierarchy deliberately.

---

# 22. Inputs

Inputs should support:

- Clear labels
- Useful placeholders
- Inline validation
- Correct keyboard
- Accessible focus state
- Error state
- Disabled state

---

# 23. Amount Input

Amount inputs are a special component.

Requirements:

- Numeric keyboard
- Clear currency context
- Large readable number
- Minimal visual distraction
- Fast entry
- Support decimal currencies
- Prevent invalid financial representations

Example:

```text
Amount

৳ 450
```

---

# 24. Input States

All inputs should support:

```text
Default
Focused
Filled
Error
Disabled
Read-only
```

Error messages should be concise and actionable.

---

# 25. Selectors

Selectors are appropriate for:

- Category
- Account
- Currency
- Frequency
- Date range
- Tags

For small option sets, use compact selection surfaces.

For large sets, use searchable bottom sheets.

---

# 26. Bottom Sheets

Bottom sheets are a major interaction primitive.

Use them for:

- Quick actions
- Category selection
- Account selection
- Filters
- Short forms
- Contextual actions

Avoid using bottom sheets for long workflows that require extensive scrolling.

---

# 27. Bottom Sheet Structure

Recommended:

```text
Sheet Handle

Title
Optional Supporting Text

Content

Primary Action
Optional Secondary Action
```

The sheet should:

- Respect safe areas
- Resize around the keyboard
- Support accessible dismissal
- Preserve input
- Avoid excessive nesting

---

# 28. Cards

Cards should represent meaningful groups.

Good candidates:

- Budget
- Goal
- Insight
- Financial summary
- Upcoming item

Avoid turning every content block into a card.

---

# 29. Card Hierarchy

A typical card may contain:

```text
Title
Supporting Context
Primary Value
Secondary Metrics
Action
```

Example:

```text
Food Budget

৳7,800 / ৳10,000

78%
৳2,200 remaining

[View Budget]
```

---

# 30. Lists

Lists should prioritize scanning.

Recommended row hierarchy:

```text
Icon / Avatar
Title
Supporting Information
Status / Amount
```

Transactions should emphasize amount and recognizable context.

---

# 31. Transaction Row

Standard transaction row:

```text
[Icon] Merchant
       Category • Note

                    -৳450
```

Income:

```text
                    +৳50,000
```

The exact color semantics are controlled by the semantic color system.

---

# 32. Date Group Headers

Transactions may be grouped:

```text
Today
Yesterday
Monday, 10 August
```

Headers should provide context without competing with transactions.

---

# 33. Chips

Chips are appropriate for:

- Tags
- Filters
- Categories
- Status
- Active query conditions

Do not overuse chips.

---

# 34. Status Components

Standard statuses include:

```text
Success
Attention
Warning
Critical
Pending
Overdue
Synced
Syncing
Offline
```

Each state should have:

- Semantic color
- Icon where appropriate
- Text
- Optional supporting explanation

---

# 35. Progress Indicators

Use progress indicators for:

- Budget
- Goal
- Import
- Export
- Upload
- Sync

For financial progress:

```text
Actual
Target
Remaining
```

should be understandable without relying solely on the progress bar.

---

# 36. Budget Progress

Example:

```text
Food

৳7,800 / ৳10,000

████████░░ 78%

৳2,200 remaining
```

Projected values should use a secondary visual layer.

---

# 37. Goal Progress

Example:

```text
Laptop

৳62,000 / ৳100,000

██████░░░░ 62%

৳38,000 remaining
```

Milestone states can use subtle positive animation.

---

# 38. Charts

Charts should prioritize readability over visual complexity.

Required principles:

- Clear scale
- Meaningful labels
- Touch inspection
- Accessible summaries
- Appropriate empty state
- No misleading visual proportions

---

# 39. Chart Types

Potential standard chart components:

```text
Line Chart
Bar Chart
Stacked Bar
Donut / Ring
Area Chart
Progress Chart
```

Use only the chart type that best communicates the question.

---

# 40. Line Charts

Best for:

- Spending over time
- Income over time
- Cash flow
- Balance trend

Provide:

- Period selector
- Tooltip
- Exact value
- Accessible textual summary

---

# 41. Bar Charts

Best for:

- Category comparison
- Monthly comparison
- Income vs expense
- Top merchants

---

# 42. Donut / Ring Charts

Best for:

- Category distribution
- Budget distribution

Avoid using them for too many categories.

If there are many categories, use a list or bar chart.

---

# 43. Chart Empty State

When insufficient data exists:

```text
Not enough data yet

Continue tracking your finances to see
meaningful spending trends.
```

Do not display misleading zero-value charts.

---

# 44. Chart Loading State

Charts should have structural skeletons or compact loading placeholders.

They should not cause the entire analytics page to become unusable.

---

# 45. Chart Accessibility

Every chart should have a text summary.

Example:

```text
Food represents 32% of total spending.
Transport represents 18%.
```

This benefits:

- Screen readers
- Users with visual limitations
- Users who prefer textual information

---

# 46. Modal Dialogs

Use dialogs primarily for:

- Destructive confirmation
- Important warnings
- Small focused choices

Do not use dialogs for long forms.

---

# 47. Empty States

Standard structure:

```text
Icon / Illustration

Title

One or two lines explaining
the purpose of the feature.

[Primary Action]
```

Empty states should guide the next useful action.

---

# 48. Error States

Standard structure:

```text
Icon

What happened

Short explanation

[Retry]
```

The error should never expose implementation details.

---

# 49. Offline State

Use a lightweight status indicator:

```text
Offline
Changes are saved locally.
```

The state should not dominate the screen.

---

# 50. Sync State

Standard visual language:

```text
✓ Synced
↻ Syncing
• Pending
! Sync issue
```

Use the same semantics everywhere.

---

# 51. AI Components

AI-specific UI components include:

```text
AI Insight Card
AI Recommendation Card
AI Warning
AI Assistant Message
AI Processing State
AI Error State
```

These should share a consistent AI identity without visually overpowering core financial data.

---

# 52. AI Insight Card

Recommended structure:

```text
[AI Indicator]

Insight Title

Short Explanation

Supporting Metric

[View Details]
```

The AI indicator should be subtle.

Avoid making AI branding more prominent than the financial insight itself.

---

# 53. AI Recommendation

Recommended structure:

```text
Recommendation

Action

Why

Expected Impact

[View]
```

Recommendations must feel optional rather than commanding.

---

# 54. AI Warning

Use stronger emphasis for important risks but maintain calm presentation.

Example:

```text
Budget Risk

At your current pace, your food budget
may be exceeded this month.

[View Budget]
```

---

# 55. AI Assistant

The assistant should use a familiar conversational layout.

Requirements:

- Clear input
- Suggested questions
- Readable answers
- Financial values emphasized
- Supporting data accessible
- Loading state
- Error state
- Feedback action where appropriate

---

# 56. AI vs System Data

Use visual distinctions when needed:

```text
Actual
Forecast
AI Insight
```

Example:

```text
Actual Expense
৳31,200

Forecast
৳32,500

AI Insight
"You're likely to remain within budget."
```

---

# 57. Notifications

Notification styles should align with semantic importance.

Categories:

```text
Information
Reminder
Attention
Warning
Critical
```

The user should not receive visually identical treatment for a routine reminder and a serious issue.

---

# 58. Toasts / Snackbars

Use lightweight transient feedback for:

- Save success
- Copy success
- Undo
- Small reversible action

Avoid using transient feedback for critical information that the user may miss.

---

# 59. Tooltips

Tooltips should explain unfamiliar concepts, not compensate for poor interface labeling.

Possible usage:

- Financial Health Score
- Forecast confidence
- Advanced analytics terms

Avoid onboarding every basic icon through tooltips.

---

# 60. Motion System

Motion should use a small set of consistent patterns:

```text
Enter
Exit
Expand
Collapse
Feedback
Progress
```

Animations should be short and purposeful.

---

# 61. Reduced Motion

When the operating system requests reduced motion:

- Reduce transitions
- Remove unnecessary decorative animations
- Preserve functional feedback
- Avoid rapid movement

---

# 62. Haptic System

Haptic usage should be semantic.

Examples:

```text
Light:
selection

Medium:
successful save

Stronger:
major completion / milestone
```

Avoid haptics for every interaction.

---

# 63. Navigation Components

Standard navigation components should include:

- Bottom navigation
- Screen header
- Back button
- Search button
- Filter button
- Add action
- Section header

Their behavior must remain consistent across modules.

---

# 64. Header System

Headers should support variants:

```text
Standard
Large
Search
Detail
Modal
```

Do not change header behavior arbitrarily between screens.

---

# 65. Section Headers

A section header may contain:

```text
Title                    See All
```

Use `See All` only when a deeper list exists.

---

# 66. Dividers

Dividers should be subtle.

Use them primarily when they improve scanability.

Whitespace is generally preferred for grouping.

---

# 67. Form Sections

Complex forms should be divided logically.

Example:

```text
Transaction
───────────
Amount
Category
Account

Details
───────────
Merchant
Note
Tags

Schedule
───────────
Date
Recurring
```

---

# 68. Data Density Modes

The product may eventually support:

```text
Comfortable
Compact
```

However, the default should prioritize readability.

A compact mode should not reduce touch target size below accessible levels.

---

# 69. Search UI

Search must clearly indicate what can be searched.

Example:

```text
Search transactions, accounts,
people, goals...
```

Results should use domain-aware grouping.

---

# 70. Filter UI

Active filters should be visible after application.

Example:

```text
Food   This Month   bKash  ×
```

Users should be able to remove individual filters without reopening the entire filter sheet.

---

# 71. Data Import UI

Import requires high-confidence confirmation.

Recommended steps:

```text
Select File
 ↓
Analyze
 ↓
Preview
 ↓
Warnings / Errors
 ↓
Confirm Import
```

Potential issues should be shown before destructive processing.

---

# 72. Restore UI

Restore is more sensitive than import.

Show:

- Backup date
- Backup version
- Record count
- Data source
- Expected impact

Before confirmation.

---

# 73. Destructive Actions

Destructive actions should use:

- Explicit labels
- Appropriate warning
- Confirmation
- Recovery guidance where possible

Do not use ambiguous labels like:

```text
Proceed
Continue
Done
```

for destructive operations.

Prefer:

```text
Delete Transaction
Delete All Data
Restore Backup
```

---

# 74. Accessibility Tokens

The design system should provide tokens/standards for:

- Minimum touch target
- Focus ring
- High contrast
- Text scaling
- Semantic labels
- Reduced motion
- Status alternatives

Accessibility is a baseline requirement, not an optional enhancement.

---

# 75. Localization

Components must support localized content.

Design must account for:

- Longer translated text
- Bangla typography
- Different number formats
- Currency formats
- Right-to-left future support if needed

Do not hardcode text dimensions that assume English-only strings.

---

# 76. Bangla Support

Bangla should be considered in component sizing and line-height.

The UI must not assume that English text and Bangla text occupy the same width or height.

---

# 77. Currency Support

Components should handle:

```text
৳1,250
$1,250
€1,250
₹1,250
```

without layout breakage.

Large values should remain readable.

---

# 78. Data Formatting Components

Reusable components should eventually include:

```text
MoneyText
PercentageText
DateText
RelativeDate
StatusBadge
ProgressValue
TrendIndicator
```

Formatting logic should not be duplicated across screens.

---

# 79. Trend Indicators

Trend components should communicate:

```text
Up
Down
Stable
Unknown
```

The interpretation should depend on the metric.

For expenses, lower may be positive.

For income, higher may be positive.

The component should not assume that "up = good."

---

# 80. Privacy Components

Privacy-sensitive UI should use clear language.

Examples:

```text
AI data sharing
Cloud sync
Local-only mode
Data export
Delete financial data
```

Do not hide meaningful privacy choices behind technical terms.

---

# 81. Loading and Skeleton Rules

Skeletons should follow the actual content structure.

Avoid showing large generic spinners when content can be progressively rendered.

---

# 82. Performance and Rendering

Components should avoid unnecessary re-rendering.

Financial lists and charts should be designed for large datasets.

Recommended principles:

- Virtualized lists
- Memoized expensive components
- Stable keys
- Lazy loading
- Deferred analytics
- Background AI processing

Visual smoothness is part of UX quality.

---

# 83. Component Naming

Reusable UI components should use semantic names.

Examples:

```text
MoneyText
PrimaryButton
TransactionRow
BudgetCard
GoalCard
InsightCard
FilterSheet
AccountSelector
CategorySelector
AmountInput
StatusBadge
EmptyState
ErrorState
```

Avoid names tied to a specific screen when the component is reusable.

---

# 84. Component Variants

Components should support explicit variants rather than arbitrary styling.

Example:

```text
Button
├── primary
├── secondary
├── tertiary
└── destructive
```

Similarly:

```text
StatusBadge
├── success
├── warning
├── danger
├── info
└── neutral
```

---

# 85. Design System Governance

New visual patterns should not be introduced casually.

Before adding a new component:

1. Confirm an existing component cannot satisfy the requirement.
2. Define its semantic purpose.
3. Define states and variants.
4. Consider accessibility.
5. Consider dark mode.
6. Consider localization.
7. Document the component.
8. Add reusable implementation.

---

# 86. Design Token Governance

Screens should consume tokens.

Avoid:

```ts
color: "#123456";
marginTop: 17;
borderRadius: 13;
```

Prefer centralized semantic values.

The implementation layer should provide strongly named tokens.

---

# 87. Design System Testing

The system should be tested across:

- Light theme
- Dark theme
- Small screen
- Large screen
- Dynamic text
- Bangla text
- Long amounts
- Long labels
- Accessibility settings

---

# 88. Design QA Checklist

Before a screen is considered visually ready:

- [ ] Correct typography hierarchy
- [ ] Correct spacing tokens
- [ ] Semantic colors used
- [ ] Touch targets accessible
- [ ] Dark mode checked
- [ ] Loading state checked
- [ ] Empty state checked
- [ ] Error state checked
- [ ] Offline state checked where applicable
- [ ] Long text checked
- [ ] Large values checked
- [ ] Bangla/localization checked
- [ ] Screen reader labels checked
- [ ] Reduced motion checked

---

# 89. Component Priority

The first reusable components to establish should be:

## Foundation

```text
Text
MoneyText
Icon
Divider
Spacer
Screen
SafeArea
```

## Actions

```text
Button
IconButton
FAB / AddAction
Chip
```

## Inputs

```text
AmountInput
TextInput
Select
DatePicker
SearchInput
TagInput
```

## Financial

```text
TransactionRow
AccountRow
BudgetCard
GoalCard
InsightCard
MoneySummary
ProgressIndicator
TrendIndicator
StatusBadge
```

## Navigation

```text
BottomNav
ScreenHeader
SectionHeader
BottomSheet
```

## States

```text
EmptyState
LoadingState
ErrorState
OfflineState
```

---

# 90. Design System Completion Criteria

The design system is considered sufficiently mature for implementation when:

- Core tokens exist.
- Major component variants are defined.
- Financial number treatment is consistent.
- Light and dark themes are supported.
- Accessibility requirements are documented.
- Major state variants are defined.
- Transaction entry components are standardized.
- Navigation components are standardized.
- Charts have consistent patterns.
- AI components have consistent identity.
- Localization constraints are understood.

---

# 91. Design System Relationship

The UX documentation chain is:

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

The design system is the reusable visual and interaction foundation for implementation.

It should influence implementation across:

```text
apps/mobile/
```

and future design artifacts.

---

# 92. Final Design Principle

The design system should allow the product to feel visually sophisticated without making the user think about the design itself.

The intended experience is:

> **Clear when glanced at, fast when used, calm when something goes wrong, and consistent enough to become familiar.**

The next documentation layer should move into technical architecture.

Recommended next file:

```text
docs/architecture/SYSTEM_ARCHITECTURE.md
```

It should define the production architecture connecting:

```text
React Native + Expo
        ↓
Local SQLite
        ↓
Repository / Domain Layer
        ↓
NestJS Modular Monolith
        ↓
PostgreSQL + Prisma
        +
Redis / Background Jobs
        +
AI Provider Abstraction
```
