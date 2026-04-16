# Variation C: Hybrid Card View with Quick Actions

## Overview

A balanced hybrid approach combining prominent balance display with a card-based transaction view. Emphasizes quick actions while maintaining transaction visibility. Uses progressive disclosure for detailed views.

## Design Specification

### Screen Layout
```
┌─────────────────────────────────────┐
│ ←                ETO            ⋮   │ ← Top Bar
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💰 ETO Balance             │   │
│  │                             │   │ ← Balance Card
│  │      33.92 hrs              │   │   (Prominent)
│  │                             │   │
│  │  +3.84 accrued this period  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌───────────────────┬─────────┐   │
│  │   💸 Use ETO      │  📊     │   │ ← Quick Actions
│  └───────────────────┴─────────┘   │   (Side by side)
│                                     │
│  Recent Activity          View All→│ ← Section Header
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Mar 31                   │   │
│  │                             │   │
│  │ Post ETO Accrual            │   │ ← Transaction Card
│  │ Period: 03/16 - 03/31       │   │
│  │                             │   │
│  │ +3.84 hrs      → 33.92 hrs  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Mar 16                   │   │
│  │                             │   │
│  │ Post ETO Accrual            │   │
│  │ Period: 03/01 - 03/15       │   │
│  │                             │   │
│  │ +3.20 hrs      → 30.08 hrs  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Feb 27                   │   │
│  │                             │   │
│  │ Post ETO Accrual            │   │
│  │ Period: 02/16 - 02/28       │   │
│  │                             │   │
│  │ +3.20 hrs      → 26.88 hrs  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Dec 5, 2025              │   │
│  │                             │   │
│  │ ETO - Vacation              │   │
│  │ Used for vacation day       │   │
│  │                             │   │
│  │ -8.00 hrs      → 8.64 hrs   │   │ ← Negative (Red)
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
- Right: More menu "⋮" (Gray 600)
- Shadow: Level 1

### Balance Card
- Background: White
- Border-radius: 20px (xl)
- Padding: 28px
- Shadow: Level 2
- Border: 2px solid Primary Blue
- Margin: 16px

**Icon & Title:**
- Icon: 💰 Money bag (32px)
- Title: "ETO Balance" (Body, Gray 600)
- Layout: Flex row with 8px gap

**Balance Display:**
- Value: 56px font size, Bold, Primary Blue
- Centered, margin 16px top and bottom

**Recent Change:**
- Text: "+X.XX accrued this period" (Body Small, Gray 600)
- Icon: Green up arrow for positive, red down arrow for negative
- Centered below balance

**Tap Behavior:**
- Opens expanded balance detail with:
  - Circular progress indicator (% of max ETO cap if applicable)
  - Total accrued (lifetime)
  - Total used (lifetime)
  - Monthly average
  - Projected next accrual date/amount

### Quick Actions
- Container: Flex row
- Gap: 12px between buttons
- Margin: 16px horizontal, 0 top

**Use ETO Button (Primary):**
- Width: 70% of container
- Height: 64px
- Background: Primary Blue
- Border-radius: 16px (lg)
- Shadow: Level 2
- Icon: 💸 Money with wings (24px), White
- Text: "Use ETO" (Body, Bold, White)
- Layout: Icon on left, text centered

**Stats Button (Secondary):**
- Width: 28% of container
- Height: 64px
- Background: White
- Border: 2px solid Gray 200
- Border-radius: 16px (lg)
- Icon: 📊 Chart (24px), Primary Blue
- Text: None (icon only)
- Tap: Opens stats/summary view

### Section Header
- Container: Flex row, space-between
- Padding: 24px 16px 12px
- Left: "Recent Activity" (H4, Bold, Gray 800)
- Right: "View All →" (Body Small, Primary Blue, Semibold)

### Transaction Cards
- Background: White
- Border-radius: 16px (lg)
- Padding: 20px
- Shadow: Level 1
- Border: 1px solid Gray 200
- Margin: 0 16px 16px
- Active state: Scale 0.98, Shadow Level 2

**Card Header:**
- Icon: 📅 Calendar (20px), Primary Blue
- Date: Body (16px), Semibold, Gray 800
- Layout: Flex row with 8px gap
- Margin-bottom: 12px

**Transaction Type:**
- Text: Transaction description (Body, Semibold, Gray 800)
- Max lines: 1 with ellipsis
- Margin-bottom: 4px

**Period/Reason:**
- Text: "Period: MM/DD - MM/DD" or description (Caption, Gray 600)
- Max lines: 1 with ellipsis
- Margin-bottom: 16px

**Amount & Balance Row:**
- Layout: Flex row, space-between
- Border-top: 1px solid Gray 200
- Padding-top: 16px

**Amount (Left):**
- Text: "+/- X.XX hrs" (Body Large, Bold)
- Color: 
  - Positive: Success (#10B981)
  - Negative: Error (#EF4444)
  - Neutral: Gray 800

**Running Balance (Right):**
- Text: "→ XX.XX hrs" (Body, Gray 600)
- Arrow indicates "resulting balance"

**Tap Behavior:**
- Opens transaction detail bottom sheet

---

## Interaction Patterns

### Balance Card Tap
Opens balance detail modal:
```
┌─────────────────────────────────────┐
│              × Close                │
├─────────────────────────────────────┤
│                                     │
│  ETO Balance Details                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    ╭──────────╮             │   │
│  │   │  33.92   │   Current   │   │ ← Circular Progress
│  │    ╰──────────╯             │   │   (if max cap exists)
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Lifetime Summary                   │
│  ┌─────────────────────────────┐   │
│  │ Total Accrued    128.48 hrs │   │
│  │ Total Used        94.56 hrs │   │
│  │ Current Balance   33.92 hrs │   │
│  └─────────────────────────────┘   │
│                                     │
│  Accrual Rate                       │
│  ┌─────────────────────────────┐   │
│  │ Average per Month  3.45 hrs │   │
│  │ Last Accrual Date  Mar 31   │   │
│  │ Next Accrual Est.  Apr 15   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    View Full History        │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Use ETO Button
Opens use ETO modal:
```
┌─────────────────────────────────────┐
│              × Close                │
├─────────────────────────────────────┤
│                                     │
│  Use ETO Hours                      │
│                                     │
│  Available: 33.92 hrs               │
│  ┌─────────────────────────────┐   │
│  │ ═══════════════════════     │   │ ← Progress Bar
│  └─────────────────────────────┘   │
│                                     │
│  Select Date *                      │
│  ┌─────────────────────────────┐   │
│  │ 📅 04/12/2026               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Hours to Use *                     │
│  ┌─────────────────────────────┐   │
│  │          8.00               │   │ ← Large Number Input
│  └─────────────────────────────┘   │
│                                     │
│  Quick Select:                      │
│  ┌──────┬──────┬──────┬──────┐    │
│  │  4   │  8   │  16  │ All  │    │ ← Chips
│  └──────┴──────┴──────┴──────┘    │
│  hours  hours  hours                │
│                                     │
│  Reason (Optional)                  │
│  ┌─────────────────────────────┐   │
│  │ Vacation                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  After this: 25.92 hrs remaining    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Apply ETO               │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Stats Button
Opens summary/stats view:
```
┌─────────────────────────────────────┐
│              × Close                │
├─────────────────────────────────────┤
│                                     │
│  ETO Statistics                     │
│                                     │
│  This Year (2026)                   │
│  ┌─────────────────────────────┐   │
│  │ Accrued         19.76 hrs   │   │
│  │ Used             0.00 hrs   │   │
│  │ Net Gain        19.76 hrs   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Last Year (2025)                   │
│  ┌─────────────────────────────┐   │
│  │ Accrued         48.64 hrs   │   │
│  │ Used            16.00 hrs   │   │
│  │ Net Gain        32.64 hrs   │   │
│  └─────────────────────────────┘   │
│                                     │
│  All Time                           │
│  ┌─────────────────────────────┐   │
│  │ Total Accrued  128.48 hrs   │   │
│  │ Total Used      94.56 hrs   │   │
│  │ Net Balance     33.92 hrs   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    Export Report            │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### View All Link
- Navigates to full transaction list screen
- Similar to Variation B but keeps card layout
- Adds search and filter options

### Transaction Card Tap
Opens detail modal (read-only):
```
┌─────────────────────────────────────┐
│                                   × │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │       +3.84 hrs             │   │ ← Large Amount
│  └─────────────────────────────┘   │   (Color-coded bg)
│                                     │
│  Date                               │
│  March 31, 2026                     │
│                                     │
│  Period                             │
│  03/16/2026 - 03/31/2026            │
│                                     │
│  Type                               │
│  Post ETO Accrual                   │
│                                     │
│  Description                        │
│  Post ETO Accrual for Martin        │
│  Larios on period 03/16/2026 -      │
│  03/31/2026 for 96.00 hours.        │
│                                     │
│  Running Balance                    │
│  33.92 hrs                          │
│                                     │
│  Created By                         │
│  TimeTrack System                   │
│                                     │
└─────────────────────────────────────┘
```

### More Menu (Top Right)
Opens action sheet:
- 🔍 Search Transactions
- 📊 View Statistics
- 📤 Export Report
- ⚙️ ETO Settings
- ❓ ETO Policy Info

### Pull to Refresh
- Swipe down to refresh balance and recent transactions

---

## Transaction Detail Modal Components

**Modal Container:**
- Background: White
- Border-radius: 24px (xl) top corners
- Max height: 70% of screen
- Slides up from bottom
- Backdrop: Black 40% opacity
- Shadow: Level 4
- Padding: 24px

**Amount Header:**
- Large card showing amount
- Background: Color-coded 10% opacity
- Border: None
- Padding: 24px
- Border-radius: 16px (lg)
- Font: 40px, Bold, color-coded
- Centered
- Margin-bottom: 24px

**Field Groups:**
- Label: Caption (12px), Gray 500, uppercase, bold
- Value: Body (16px), Gray 800
- Spacing: 16px between fields
- Dividers: 1px solid Gray 200 between groups

**Close Gesture:**
- Swipe down to dismiss
- Tap backdrop to dismiss
- X button in top right

---

## Advantages

1. **Balanced Layout**: Balance prominent without dominating screen
2. **Quick Actions**: One-tap access to most common tasks (use ETO, view stats)
3. **Card Aesthetics**: Modern card-based design feels native and polished
4. **Progressive Disclosure**: Details available on demand without cluttering main view
5. **Touch-Friendly**: Large buttons and cards, generous spacing
6. **Scannable**: Recent activity cards easy to scan through
7. **Flexible**: Works well for both quick checks and detailed review
8. **Visual Hierarchy**: Clear importance from balance → actions → transactions

## Disadvantages

1. **Scrolling Required**: Need to scroll to see older transactions
2. **Limited Recent View**: Only shows 4-5 recent cards before "View All"
3. **More Taps**: Some features require opening modals (not one-screen view)
4. **Card Overhead**: Cards take more space than list rows (fewer items visible)
5. **No Charts**: No visual trend representation (unless added to stats modal)

---

## Design System Compliance

- **Colors**: Bento Box primary blues, grays, semantic colors
- **Typography**: SF Pro Display/Text (iOS), Roboto (Android)
- **Spacing**: 16px (md) padding, 12px gaps, 20px card padding
- **Touch Targets**: All interactive elements minimum 44x44pt / 48x48dp
- **Shadows**: Level 1 (transaction cards), Level 2 (balance card, action buttons), Level 4 (modals)
- **Border Radius**: 16px (lg) cards, 20px (xl) balance card, 24px (xl) modals
- **Accessibility**: WCAG AA contrast ratios, semantic labels, gesture alternatives

---

## Implementation Notes

**Key Components Needed:**
- Card component with consistent styling
- Bottom sheet modal component
- Progress bar/circular progress for balance
- Date picker component
- Number input with quick select chips
- Action sheet component
- Pull-to-refresh
- Smooth modal animations

**Estimated Complexity:** Medium-High (multiple modals, smooth animations critical)

**Best For:** Users who want a modern, mobile-first experience with quick access to common actions while maintaining visibility of recent activity.

---

**Version**: 1.0  
**Created**: 2026-04-12  
**Task**: Task 4 - ETO Screen Design
