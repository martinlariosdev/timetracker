# Variation B: Transaction-First List View

## Overview

A desktop-like approach optimized for mobile that prioritizes the transaction list, similar to a bank statement. The balance is visible but secondary, with focus on reviewing and understanding each ETO transaction in detail.

## Design Specification

### Screen Layout
```
┌─────────────────────────────────────┐
│ ← Back           ETO            🔍  │ ← Top Bar
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │  Balance: 33.92 hrs    💰   │   │ ← Sticky Balance Bar
│  │  +3.84 this period          │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Filters                       ⋮   │ ← Filter Bar
│  🗓️ All Time  •  📊 All Types      │
├─────────────────────────────────────┤
│                                     │
│  March 2026                         │ ← Month Section
│  ┌─────────────────────────────┐   │
│  │ 31  Post ETO Accrual        │   │
│  │     03/16 - 03/31           │   │
│  │     +3.84 hrs        33.92→ │   │ ← Transaction Row
│  ├─────────────────────────────┤   │
│  │ 16  Post ETO Accrual        │   │
│  │     03/01 - 03/15           │   │
│  │     +3.20 hrs        30.08→ │   │
│  └─────────────────────────────┘   │
│                                     │
│  February 2026                      │
│  ┌─────────────────────────────┐   │
│  │ 27  Post ETO Accrual        │   │
│  │     02/16 - 02/28           │   │
│  │     +3.20 hrs        26.88→ │   │
│  ├─────────────────────────────┤   │
│  │ 16  Post ETO Accrual        │   │
│  │     02/01 - 02/15           │   │
│  │     +3.20 hrs        23.68→ │   │
│  └─────────────────────────────┘   │
│                                     │
│  January 2026                       │
│  ┌─────────────────────────────┐   │
│  │ 30  Post ETO Accrual        │   │
│  │     01/16 - 01/31           │   │
│  │     +3.52 hrs        20.48→ │   │
│  ├─────────────────────────────┤   │
│  │ 16  Post ETO Accrual        │   │
│  │     01/01 - 01/15           │   │
│  │     +3.52 hrs        16.96→ │   │
│  └─────────────────────────────┘   │
│                                     │
│  December 2025                      │
│  ┌─────────────────────────────┐   │
│  │ 31  Post ETO Accrual        │   │
│  │     12/16 - 12/31           │   │
│  │     +4.80 hrs        13.44→ │   │
│  ├─────────────────────────────┤   │
│  │ 05  ETO - Vacation          │   │
│  │     Used for vacation       │   │
│  │     -8.00 hrs         8.64→ │   │ ← Negative (Used)
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## Components

### Top Bar
- Height: 56px
- Background: White
- Left: Back arrow (Gray 600)
- Center: "ETO" (H3, Semibold, Gray 800)
- Right: Search icon (Gray 600)
- Shadow: Level 1
- Position: Fixed top

### Sticky Balance Bar
- Height: 72px
- Background: Primary Blue gradient (left) to Secondary Cyan (right)
- Padding: 16px
- Position: Sticky (stays visible while scrolling)
- Shadow: Level 2

**Balance Content:**
- Main text: "Balance:" Body (16px), White 80% opacity
- Balance value: "33.92 hrs" H2 (24px), Bold, White
- Secondary text: "+3.84 this period" Body Small (14px), White 80%
- Icon: Money bag emoji or icon (24px), right-aligned
- Layout: Flex row, space-between

### Filter Bar
- Height: 56px
- Background: White
- Padding: 12px horizontal
- Border-bottom: 1px solid Gray 200

**Filter Chips:**
- Date filter: "🗓️ All Time" (tappable)
- Type filter: "📊 All Types" (tappable)
- Separator: " • " (Gray 400)
- More options: "⋮" (right-aligned)
- Font: Body Small (14px), Semibold, Gray 700

**Active Filters:**
- Background: Primary Blue 10%
- Text: Primary Blue
- Border: 1px solid Primary Blue

### Month Section Headers
- Text: "Month Year" (e.g., "March 2026")
- Font: Body (16px), Bold, Gray 800
- Background: Gray 50
- Padding: 12px 16px
- Margin-top: 8px (first item), 24px (subsequent)
- Sticky: Sticks below balance bar while scrolling that month's transactions

### Transaction Rows
- Container: White background
- Height: Auto (min 80px)
- Padding: 16px
- Border-bottom: 1px solid Gray 200
- Active state: Gray 50 background
- Swipe actions: Swipe left for quick actions (if editable)

**Row Layout:**
```
┌─────────────────────────────────────┐
│ [Day]  [Description]       [Amount] │
│        [Period/Reason]     [Balance]│
└─────────────────────────────────────┘
```

**Day Badge:**
- Size: 40x40px
- Background: Gray 100
- Border-radius: 8px (sm)
- Text: Day number (H4, Bold, Gray 800)
- Position: Left

**Description:**
- Primary text: Transaction description (Body, Semibold, Gray 800)
- Secondary text: Period or reason (Caption, Gray 600)
- Max lines: 2 with ellipsis
- Margin-left: 12px from day badge

**Amount:**
- Font: Body Large (18px), Bold
- Color:
  - Positive (accrued): Success (#10B981)
  - Negative (used): Error (#EF4444)
  - Neutral (adjusted): Warning (#F59E0B)
- Position: Right-aligned
- Format: "+/-X.XX hrs"

**Running Balance:**
- Font: Caption (12px), Gray 500
- Position: Below amount, right-aligned
- Format: "XX.XX →"
- Arrow indicates this is the balance after transaction

### Empty State
(When no transactions match filters)
```
┌─────────────────────────────────────┐
│                                     │
│           📊                        │
│                                     │
│     No Transactions Found           │
│                                     │
│  Try adjusting your filters or      │
│  date range to see more results.    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Clear Filters          │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Interaction Patterns

### Balance Bar
- **Tap**: Opens balance detail sheet showing:
  - Current balance (large)
  - Total accrued (all time)
  - Total used (all time)
  - Total converted (if applicable)
  - Average monthly accrual
- **Long press**: Quick action to use ETO

### Search (Top Right)
- **Tap**: Opens search bar overlay
- Search fields: Description text
- Real-time filtering as user types
- Clear button to reset search

### Filter Chips
- **Tap Date Filter**: Opens date range picker
  - All Time (default)
  - This Year
  - Last 6 Months
  - Last 3 Months
  - Custom Range
- **Tap Type Filter**: Opens type selector
  - All Types (default)
  - Accrued Only
  - Used Only
  - Adjusted Only

### More Options (⋮)
- **Tap**: Opens action sheet with:
  - 💰 Use ETO
  - 📊 View Summary
  - 📤 Export Report (PDF/CSV)
  - ⚙️ Settings

### Transaction Row
- **Tap**: Opens transaction detail modal (read-only)
- **Swipe Left**: Shows action buttons (if applicable):
  - Edit (only for "used" entries)
  - Delete (only for "used" entries, with confirmation)

### Pull to Refresh
- Swipe down from top to refresh transaction list

### Infinite Scroll
- Load more transactions automatically as user scrolls to bottom
- Loading indicator at bottom while fetching
- Loads 20 transactions at a time

---

## Transaction Detail Modal

```
┌─────────────────────────────────────┐
│                                   × │
├─────────────────────────────────────┤
│  Transaction Details                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        +3.84 hrs            │   │ ← Large Amount
│  │                             │   │   (Color-coded)
│  └─────────────────────────────┘   │
│                                     │
│  Date                               │
│  March 31, 2026                     │
│                                     │
│  Period                             │
│  03/16/2026 - 03/31/2026            │
│                                     │
│  Type                               │
│  🎁 ETO Accrual                     │
│                                     │
│  Description                        │
│  Post ETO Accrual for Martin Larios │
│  on period 03/16/2026 - 03/31/2026  │
│  for 96.00 hours.                   │
│                                     │
│  Running Balance                    │
│  33.92 hrs                          │
│                                     │
│  Created By                         │
│  TimeTrack System                   │
│  March 31, 2026 at 11:59 PM         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         Close               │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Modal Styling:**
- Background: White
- Border-radius: 24px (xl) top corners
- Max height: 85% of screen
- Slides up from bottom
- Backdrop: Black 40% opacity
- Shadow: Level 4
- Scrollable if content exceeds height

**Amount Display:**
- Large card at top
- Background: Color-coded (success/error) 10% opacity
- Border: 2px solid color-coded
- Font: 48px, Bold
- Padding: 24px
- Centered

**Field Layout:**
- Label: Caption (12px), Gray 500, uppercase, bold
- Value: Body (16px), Gray 800
- Spacing: 20px between fields
- Padding: 20px horizontal

---

## Filter Action Sheet

```
┌─────────────────────────────────────┐
│  Filter Transactions              × │
├─────────────────────────────────────┤
│                                     │
│  Date Range                         │
│  ○ All Time                         │
│  ● This Year                        │
│  ○ Last 6 Months                    │
│  ○ Last 3 Months                    │
│  ○ Custom Range                     │
│                                     │
│  Transaction Type                   │
│  ☑ Accrued                          │
│  ☑ Used                             │
│  ☑ Adjusted                         │
│                                     │
│  ┌──────────────┬──────────────┐   │
│  │ Clear All    │  Apply       │   │
│  └──────────────┴──────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Advantages

1. **Transaction Focus**: Ideal for users who want to review every ETO transaction in detail
2. **Familiar Pattern**: Bank statement style is universally understood
3. **Efficient Scrolling**: Month sections and sticky headers make navigation easy
4. **Search & Filter**: Powerful tools to find specific transactions
5. **Running Balance**: Shows balance progression over time
6. **Scannable**: Easy to scan through history quickly
7. **Desktop Parity**: Most similar to desktop version for users switching platforms

## Disadvantages

1. **Balance Secondary**: Current balance less prominent, requires scroll
2. **List Heavy**: Can feel overwhelming with many transactions
3. **Less Visual**: No chart or visual representation of trends
4. **Requires Scrolling**: Need to scroll to see older transactions
5. **Data Dense**: More information on screen = higher cognitive load

---

## Design System Compliance

- **Colors**: Bento Box primary blues, grays, semantic colors
- **Typography**: SF Pro Display/Text (iOS), Roboto (Android)
- **Spacing**: 16px (md) padding, 12px gaps, 8px tight spacing
- **Touch Targets**: All interactive elements minimum 44x44pt / 48x48dp
- **Shadows**: Level 1 (balance bar), Level 2 (sticky elements), Level 4 (modals)
- **Border Radius**: 8px (sm) badges, 24px (xl) modals
- **Accessibility**: WCAG AA contrast ratios, screen reader labels

---

## Implementation Notes

**Key Components Needed:**
- Sticky header component
- Section list with headers
- Swipe-to-action component
- Search overlay
- Filter action sheet
- Bottom sheet modal
- Pull-to-refresh
- Infinite scroll pagination

**Estimated Complexity:** Medium (standard list patterns, no charting)

**Best For:** Users who need detailed transaction history, want to review/audit ETO entries, or prefer desktop-like data views.

---

**Version**: 1.0  
**Created**: 2026-04-12  
**Task**: Task 4 - ETO Screen Design
