# Variation A: Balance-Focused with Visual Chart

## Overview

A balance-first approach that emphasizes the current ETO balance with a visual chart showing accrual history, making it easy to see trends at a glance. The transaction list is secondary, accessed by scrolling down.

## Design Specification

### Screen Layout
```
┌─────────────────────────────────────┐
│ ← Back        ETO Balance      ⚙️   │ ← Top Bar
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │        33.92 hrs            │   │ ← Balance Card
│  │     Current Balance         │   │   (Large, Prominent)
│  │                             │   │
│  │    🟢 +3.84 this period     │   │ ← Recent Change
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Balance History         │   │ ← Chart Card
│  │   ╭─────────────────╮       │   │
│  │   │     ╱╲    ╱╲    │       │   │
│  │   │   ╱    ╲╱    ╲  │       │   │ ← Line Chart
│  │   │ ╱            ╲ │       │   │   (Last 6 months)
│  │   ╰─────────────────╯       │   │
│  │   Dec Jan Feb Mar Apr May   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Quick Actions                      │
│  ┌──────────────┬──────────────┐   │
│  │  💰 Use ETO  │ 📊 Details   │   │ ← Action Buttons
│  └──────────────┴──────────────┘   │
│                                     │
│  Recent Transactions                │ ← Section Header
│  ┌─────────────────────────────┐   │
│  │ Mar 31, 2026                │   │
│  │ Post ETO Accrual            │   │ ← Transaction Card
│  │ +3.84 hrs                   │   │
│  │ Balance: 33.92 hrs         →│   │
│  ├─────────────────────────────┤   │
│  │ Mar 16, 2026                │   │
│  │ Post ETO Accrual            │   │
│  │ +3.20 hrs                   │   │
│  │ Balance: 30.08 hrs         →│   │
│  ├─────────────────────────────┤   │
│  │ Feb 27, 2026                │   │
│  │ Post ETO Accrual            │   │
│  │ +3.20 hrs                   │   │
│  │ Balance: 26.88 hrs         →│   │
│  └─────────────────────────────┘   │
│                                     │
│  View All Transactions →            │ ← Link to Full List
│                                     │
└─────────────────────────────────────┘
```

## Components

### Top Bar
- Height: 56px
- Background: White
- Left: Back arrow (Gray 600)
- Center: "ETO Balance" (H3, Semibold, Gray 800)
- Right: Settings icon (Gray 600)
- Shadow: Level 1

### Balance Card
- Background: Gradient (Primary Blue to Secondary Cyan)
- Border-radius: 20px (xl)
- Padding: 32px vertical, 24px horizontal
- Shadow: Level 3
- Margin: 16px

**Balance Display:**
- Value: 64px font size, Bold, White
- Label: "Current Balance" (Body, White, 80% opacity)
- Centered alignment

**Recent Change Indicator:**
- Font: Body Small (14px), White
- Icon: Green circle (success) for positive, Red for negative
- Shows change from last period
- Margin-top: 12px

### Chart Card
- Background: White
- Border-radius: 16px (lg)
- Padding: 20px
- Shadow: Level 1
- Margin: 16px horizontal, 0 top

**Chart Title:**
- Text: "Balance History" (H4, Semibold, Gray 800)
- Margin-bottom: 16px

**Line Chart:**
- Type: Simple line graph
- Data points: Last 6 months
- Line color: Primary Blue
- Gradient fill: Primary Blue 20% opacity
- Height: 140px
- X-axis labels: Month abbreviations (Body Small, Gray 500)
- Touch: Show tooltip on tap with exact balance

### Quick Actions
- Container: Flex row, equal width
- Gap: 12px between buttons
- Margin: 16px horizontal, 24px top

**Action Buttons:**
- Height: 56px
- Border-radius: 12px (md)
- Border: 2px solid Gray 200
- Background: White
- Icon: 24px, Primary Blue
- Text: Body (16px), Semibold, Gray 800
- Active state: Primary Blue background, White text/icon
- Shadow: Level 1

### Recent Transactions Section

**Section Header:**
- Text: "Recent Transactions" (H4, Semibold, Gray 800)
- Padding: 16px horizontal, 24px top, 12px bottom

**Transaction Cards:**
- Background: White
- Border-radius: 12px (md)
- Padding: 16px
- Border: 1px solid Gray 200
- Margin: 0 16px 12px
- Shadow: Level 1
- Active state: Gray 50 background
- Tap: Opens transaction detail modal

**Transaction Card Content:**
- Date: Body (16px), Semibold, Gray 800
- Description: Body Small (14px), Gray 600
- Hours: Body Large (18px), Semibold
  - Positive: Success color (#10B981)
  - Negative: Error color (#EF4444)
- Running Balance: Caption (12px), Gray 500
- Chevron: Gray 400, right-aligned

**View All Link:**
- Text: "View All Transactions →" (Body, Primary Blue, Semibold)
- Padding: 16px
- Center-aligned
- Tap: Opens full transaction list screen

---

## Interaction Patterns

### Balance Card
- **Tap**: Opens balance detail modal showing:
  - Total accrued (all time)
  - Total used
  - Total converted
  - Current balance
  - Projected accrual (based on hours worked)

### Chart
- **Tap data point**: Shows tooltip with exact balance and date
- **Pinch zoom**: Allows zooming into specific time range
- **Swipe**: Pan through longer time periods

### Use ETO Button
- **Tap**: Opens modal to apply ETO to a time entry
  - Date selector
  - Hours to use (max: current balance)
  - Reason/description
  - Confirmation

### Details Button
- **Tap**: Opens full transaction list with filters:
  - Date range
  - Transaction type (accrued, used, converted)
  - Search

### Transaction Cards
- **Tap**: Opens detail modal showing:
  - Full description
  - Period worked
  - Calculation details
  - Created by/date
  - Edit/Delete actions (if applicable)

### Pull to Refresh
- Swipe down on list to refresh ETO data

---

## Transaction Detail Modal

```
┌─────────────────────────────────────┐
│              × Close                │
├─────────────────────────────────────┤
│                                     │
│  Transaction Details                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Date                        │   │
│  │ March 31, 2026              │   │
│  ├─────────────────────────────┤   │
│  │ Period                      │   │
│  │ 03/16/2026 - 03/31/2026     │   │
│  ├─────────────────────────────┤   │
│  │ Type                        │   │
│  │ ETO Accrual                 │   │
│  ├─────────────────────────────┤   │
│  │ Hours                       │   │
│  │ +3.84 hrs                   │   │
│  ├─────────────────────────────┤   │
│  │ Description                 │   │
│  │ Post ETO Accrual for       │   │
│  │ Martin Larios on period     │   │
│  │ 03/16/2026 - 03/31/2026     │   │
│  │ for 96.00 hours.            │   │
│  ├─────────────────────────────┤   │
│  │ Running Balance             │   │
│  │ 33.92 hrs                   │   │
│  ├─────────────────────────────┤   │
│  │ Created By                  │   │
│  │ TimeTrack System            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │          Close              │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Modal Styling:**
- Background: White
- Border-radius: 24px (xl) top corners only
- Max height: 80% of screen
- Slides up from bottom
- Backdrop: Black 40% opacity
- Shadow: Level 4

---

## Use ETO Modal

```
┌─────────────────────────────────────┐
│              × Close                │
├─────────────────────────────────────┤
│                                     │
│  Use ETO                            │
│                                     │
│  Available Balance                  │
│  ┌─────────────────────────────┐   │
│  │      33.92 hrs              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Date *                             │
│  ┌─────────────────────────────┐   │
│  │  04/12/2026           📅    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Hours to Use *                     │
│  ┌─────────────────────────────┐   │
│  │  8.00                       │   │
│  └─────────────────────────────┘   │
│  (Max: 33.92 hrs)                   │
│                                     │
│  Reason                             │
│  ┌─────────────────────────────┐   │
│  │  Vacation                   │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Quick Options:                     │
│  ┌────────┬────────┬────────┐      │
│  │  1 Day │ 1 Week │ Custom │      │
│  └────────┴────────┴────────┘      │
│  (8 hrs) (40 hrs)                   │
│                                     │
│  Remaining Balance: 25.92 hrs       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Apply ETO              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │          Cancel             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Advantages

1. **Visual Clarity**: Large balance display immediately shows most important information
2. **Trend Awareness**: Chart helps users understand their ETO accumulation pattern
3. **Quick Actions**: Common tasks (use ETO, view details) are one tap away
4. **Progressive Disclosure**: Shows recent transactions, full list available on demand
5. **Beautiful**: Gradient balance card creates visual interest and hierarchy
6. **Minimal Scrolling**: Most important info above the fold

## Disadvantages

1. **Chart Complexity**: Requires charting library, adds implementation time
2. **Less Transaction Focus**: Transaction list is secondary, requires scroll/tap
3. **Chart May Be Unused**: If users don't care about trends, chart wastes space
4. **Limited Recent View**: Only shows 3-5 recent transactions

---

## Design System Compliance

- **Colors**: Bento Box primary blues, grays, semantic colors
- **Typography**: SF Pro Display/Text (iOS), Roboto (Android)
- **Spacing**: 16px (md) padding, 12px gaps
- **Touch Targets**: All interactive elements minimum 44x44pt / 48x48dp
- **Shadows**: Level 1 (cards), Level 3 (balance card), Level 4 (modals)
- **Border Radius**: 12px (md) buttons/cards, 20px (xl) balance card, 24px (xl) modals
- **Accessibility**: WCAG AA contrast ratios, clear labels

---

## Implementation Notes

**Key Components Needed:**
- Chart library (e.g., react-native-chart-kit, Victory Native)
- Pull-to-refresh component
- Bottom sheet modal component
- Date picker component
- Form validation for Use ETO

**Estimated Complexity:** High (chart integration)

**Best For:** Users who want to understand their ETO trends and have visual feedback on their balance growth.

---

**Version**: 1.0  
**Created**: 2026-04-12  
**Task**: Task 4 - ETO Screen Design
