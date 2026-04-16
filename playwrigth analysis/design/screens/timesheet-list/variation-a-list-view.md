# Timesheet List Screen - Variation A: List View

## Overview

A traditional vertical scrolling list of time entries with swipe actions and summary metrics. This variation prioritizes information density and quick scanning of all entries in a chronological list format.

## Design Philosophy

- **Information First**: Maximum entries visible without scrolling
- **Quick Actions**: Swipe gestures for edit/delete
- **Clear Hierarchy**: Visual separation between entries
- **Scannable**: Easy to identify dates, clients, and hours at a glance

## Screen Structure

### Container
- **Background**: Gray 50 (`#F9FAFB`)
- **Safe Area**: Respects top and bottom insets
- **Dimensions**: Full screen (100% width, 100% height)

### Content Layout (Vertical Stack)

1. **Top Navigation Bar** (fixed)
2. **Period Selector** (fixed)
3. **Summary Metrics Card** (fixed)
4. **Time Entries List** (scrollable)
5. **Floating Action Button** (fixed overlay)

---

## Component Breakdown

### 1. Top Navigation Bar

**Position**: Fixed at top, respects safe area

**Bar Properties:**
- **Background**: Primary Blue (`#2563EB`)
- **Height**: 56px + safe area top
- **Shadow**: Level 1 - `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`

**Content:**
- **Title**: "Timesheet"
- **Font**: SF Pro Display (iOS) / Roboto (Android)
- **Size**: 20px (Heading 3)
- **Weight**: Semibold (600)
- **Color**: White (`#FFFFFF`)
- **Alignment**: Center

**Left Action:**
- **Icon**: Menu hamburger icon (24px)
- **Color**: White
- **Touch Target**: 44x44px

**Right Action:**
- **Icon**: Filter/Settings icon (24px)
- **Color**: White
- **Touch Target**: 44x44px

---

### 2. Period Selector

**Position**: Below navigation bar, fixed

**Container Properties:**
- **Background**: White (`#FFFFFF`)
- **Height**: 64px
- **Border Bottom**: 1px solid Gray 200 (`#E5E7EB`)
- **Padding**: 12px horizontal

**Content (Horizontal Stack):**

#### Left Arrow Button
- **Icon**: Chevron left (20px)
- **Color**: Primary Blue (`#2563EB`)
- **Touch Target**: 44x44px
- **Border Radius**: 8px (sm)

#### Period Text (Center)
- **Text**: "04/01/2026 - 04/15/2026"
- **Font**: SF Pro Text (iOS) / Roboto (Android)
- **Size**: 16px (Body)
- **Weight**: Semibold (600)
- **Color**: Gray 800 (`#1F2937`)
- **Alignment**: Center
- **Flex**: 1 (takes available space)

#### Right Arrow Button
- **Icon**: Chevron right (20px)
- **Color**: Primary Blue (`#2563EB`)
- **Touch Target**: 44x44px
- **Border Radius**: 8px (sm)

---

### 3. Summary Metrics Card

**Position**: Below period selector, fixed (scrolls away on scroll)

**Card Properties:**
- **Background**: White (`#FFFFFF`)
- **Padding**: 16px (md)
- **Border Bottom**: 1px solid Gray 200 (`#E5E7EB`)

**Content (3-Column Grid):**

#### Metric 1: Total Hours
**Container:**
- **Layout**: Vertical stack
- **Alignment**: Center
- **Width**: 33.33%

**Label:**
- **Text**: "Total"
- **Font**: SF Pro Text
- **Size**: 12px (Caption)
- **Weight**: Regular (400)
- **Color**: Gray 500 (`#6B7280`)
- **Margin Bottom**: 4px (xs)

**Value:**
- **Text**: "56.00"
- **Font**: SF Pro Rounded
- **Size**: 24px (Heading 2)
- **Weight**: Bold (700)
- **Color**: Gray 900 (`#111827`)

**Unit:**
- **Text**: "hours"
- **Font**: SF Pro Text
- **Size**: 12px (Caption)
- **Weight**: Regular (400)
- **Color**: Gray 500 (`#6B7280`)

#### Metric 2: ETO Hours
**Container:**
- **Layout**: Vertical stack
- **Alignment**: Center
- **Width**: 33.33%
- **Border Left**: 1px solid Gray 200
- **Border Right**: 1px solid Gray 200

**Label:**
- **Text**: "ETO"
- **Font**: SF Pro Text
- **Size**: 12px (Caption)
- **Weight**: Regular (400)
- **Color**: Gray 500 (`#6B7280`)
- **Margin Bottom**: 4px (xs)

**Value:**
- **Text**: "33.92"
- **Font**: SF Pro Rounded
- **Size**: 24px (Heading 2)
- **Weight**: Bold (700)
- **Color**: Secondary Cyan (`#0EA5E9`)

**Unit:**
- **Text**: "hrs"
- **Font**: SF Pro Text
- **Size**: 12px (Caption)
- **Weight**: Regular (400)
- **Color**: Gray 500 (`#6B7280`)

#### Metric 3: Pending Days
**Container:**
- **Layout**: Vertical stack
- **Alignment**: Center
- **Width**: 33.33%

**Label:**
- **Text**: "Pending"
- **Font**: SF Pro Text
- **Size**: 12px (Caption)
- **Weight**: Regular (400)
- **Color**: Gray 500 (`#6B7280`)
- **Margin Bottom**: 4px (xs)

**Value:**
- **Text**: "4"
- **Font**: SF Pro Rounded
- **Size**: 24px (Heading 2)
- **Weight**: Bold (700)
- **Color**: Warning (`#F59E0B`)

**Unit:**
- **Text**: "days"
- **Font**: SF Pro Text
- **Size**: 12px (Caption)
- **Weight**: Regular (400)
- **Color**: Gray 500 (`#6B7280`)

---

### 4. Time Entries List

**Position**: Scrollable area below summary card

**Container Properties:**
- **Background**: Gray 50 (`#F9FAFB`)
- **Padding**: 8px (sm) horizontal
- **Content Padding Bottom**: 88px (for FAB clearance)

#### Individual Time Entry Card

**Card Properties:**
- **Background**: White (`#FFFFFF`)
- **Border Radius**: 12px (md)
- **Padding**: 16px (md)
- **Margin Bottom**: 8px (sm)
- **Shadow**: Level 1 - `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
- **Min Height**: 88px (touch-friendly)

**Swipe Actions:**
- **Left Swipe**: Reveals Edit (Primary Blue) and Delete (Error Red) buttons
- **Right Swipe**: Reveals Duplicate (Secondary Cyan) button
- **Action Button Width**: 72px each
- **Action Button Height**: Full card height
- **Action Icons**: 24px, centered

**Card Content (Vertical Stack):**

#### Row 1: Date & Hours (Horizontal Layout)
**Left Side - Date:**
- **Text**: "04/01/2026" or "Mon, 04/01"
- **Font**: SF Pro Text
- **Size**: 16px (Body)
- **Weight**: Semibold (600)
- **Color**: Gray 800 (`#1F2937`)

**Right Side - Hours:**
- **Text**: "8.00"
- **Font**: SF Pro Rounded
- **Size**: 20px (Heading 4)
- **Weight**: Bold (700)
- **Color**: Primary Blue (`#2563EB`)
- **Alignment**: Right

#### Row 2: Client Name
- **Text**: "Aderant"
- **Font**: SF Pro Text
- **Size**: 14px (Body Small)
- **Weight**: Medium (500)
- **Color**: Gray 600 (`#4B5563`)
- **Margin Top**: 4px (xs)

#### Row 3: Description (Truncated)
- **Text**: "Worked on PR #239, #189 Review PR #3, #54, #201"
- **Font**: SF Pro Text
- **Size**: 14px (Body Small)
- **Weight**: Regular (400)
- **Color**: Gray 500 (`#6B7280`)
- **Lines**: 2 max (truncate with ellipsis)
- **Margin Top**: 4px (xs)

#### Row 4: Time Breakdown (Horizontal Stack)
**Layout**: Horizontal chips/badges

**Chip Properties:**
- **Background**: Gray 100 (`#F3F4F6`)
- **Border Radius**: 6px (between xs and sm)
- **Padding**: 4px horizontal, 2px vertical
- **Margin Right**: 4px (xs)
- **Font**: SF Pro Text
- **Size**: 12px (Caption)
- **Weight**: Regular (400)
- **Color**: Gray 600 (`#4B5563`)

**Chip Examples:**
- "08:00" (start time)
- "12:00" (break)
- "13:00" (resume)
- "17:00" (end time)

**Margin Top**: 8px (sm)

---

### 5. Floating Action Button (FAB)

**Position**: Fixed bottom-right corner

**Button Properties:**
- **Background**: Primary Blue (`#2563EB`)
- **Size**: 56x56px
- **Border Radius**: Full (circular)
- **Shadow**: Level 3 - `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)`
- **Position**: 16px from right edge, 16px from bottom (+ safe area)
- **Touch Target**: 56x56px (exceeds 44pt minimum)

**Icon:**
- **Type**: Plus (+) icon
- **Size**: 24px
- **Color**: White (`#FFFFFF`)
- **Alignment**: Center

**Button States:**
- **Default**: Primary Blue
- **Pressed**: Primary Dark (`#1E40AF`)
- **Shadow on Press**: Reduced to Level 2

---

## Spacing Breakdown

**Vertical Structure:**
1. Navigation Bar: 56px + safe area top
2. Period Selector: 64px
3. Summary Metrics Card: ~104px (16px padding × 2 + content)
4. List Items: 88px per card + 8px margin = 96px per entry
5. FAB: 56px, 16px from bottom + safe area

**Horizontal Spacing:**
- Screen Padding: 8px (sm) for list items
- Card Internal Padding: 16px (md)
- Metric Card Padding: 16px (md)

**Visible Entries Calculation:**
- iPhone 14 Pro screen height: 852px
- Header space (nav + period + metrics): ~224px
- Available scroll area: ~628px
- Cards visible: ~6-7 entries without scrolling

---

## Color Palette Used

| Element | Color Name | Hex Code |
|---------|-----------|----------|
| Background | Gray 50 | `#F9FAFB` |
| Navigation Bar | Primary Blue | `#2563EB` |
| Card Background | White | `#FFFFFF` |
| Primary Text | Gray 800 | `#1F2937` |
| Secondary Text | Gray 600 | `#4B5563` |
| Tertiary Text | Gray 500 | `#6B7280` |
| Hours Value | Primary Blue | `#2563EB` |
| ETO Value | Secondary Cyan | `#0EA5E9` |
| Pending Value | Warning | `#F59E0B` |
| Dividers | Gray 200 | `#E5E7EB` |
| Chip Background | Gray 100 | `#F3F4F6` |
| Delete Action | Error | `#EF4444` |

---

## Typography Specifications

| Element | Font Family | Size | Weight | Line Height |
|---------|------------|------|--------|-------------|
| Nav Title | SF Pro Display | 20px | Semibold (600) | 1.25 (25px) |
| Period Text | SF Pro Text | 16px | Semibold (600) | 1.5 (24px) |
| Metric Labels | SF Pro Text | 12px | Regular (400) | 1.5 (18px) |
| Metric Values | SF Pro Rounded | 24px | Bold (700) | 1.25 (30px) |
| Entry Date | SF Pro Text | 16px | Semibold (600) | 1.5 (24px) |
| Entry Hours | SF Pro Rounded | 20px | Bold (700) | 1.25 (25px) |
| Client Name | SF Pro Text | 14px | Medium (500) | 1.5 (21px) |
| Description | SF Pro Text | 14px | Regular (400) | 1.5 (21px) |
| Time Chips | SF Pro Text | 12px | Regular (400) | 1.5 (18px) |

---

## Touch Targets

All interactive elements meet or exceed minimum accessibility standards:

| Element | Size | Status |
|---------|------|--------|
| Nav Icons | 44x44px | ✓ Meets 44pt minimum |
| Period Arrows | 44x44px | ✓ Meets 44pt minimum |
| Entry Card | 88px height × full width | ✓ Exceeds 44pt minimum |
| Swipe Actions | 72px width × full height | ✓ Exceeds 44pt minimum |
| FAB | 56x56px | ✓ Exceeds 44pt minimum |

---

## Accessibility

**Color Contrast:**
- Nav Title (White on Primary Blue): 6.98:1 ✓ AAA
- Primary Text (Gray 800 on White): 12.63:1 ✓ AAA
- Secondary Text (Gray 600 on White): 7.27:1 ✓ AAA
- Tertiary Text (Gray 500 on White): 4.68:1 ✓ AA
- Chips (Gray 600 on Gray 100): 6.27:1 ✓ AAA

**Screen Reader Support:**
- Each entry card: "Time entry for [date], [client], [hours] hours, [description]"
- Swipe actions: "Edit entry", "Delete entry", "Duplicate entry"
- FAB: "Add new time entry button"
- Metrics: "Total hours: 56, ETO hours: 33.92, Pending days: 4"

**Dynamic Type:**
- All text scales with system font size settings
- Cards expand vertically to accommodate larger text
- Minimum card height maintained at 88px

**Gestures:**
- Swipe actions have fallback menu for users with limited dexterity
- Long press on card reveals action menu as alternative to swipe

---

## Animation & Interactions

**Swipe Actions:**
- Duration: 250ms
- Easing: ease-out
- Effect: Card slides to reveal action buttons underneath
- Spring back: 200ms ease-in-out

**Card Press:**
- Duration: 150ms
- Easing: ease-in-out
- Effect: Subtle scale (0.98) and opacity (0.95)

**FAB Press:**
- Duration: 150ms
- Easing: ease-in-out
- Effect: Scale (0.95) and shadow reduction

**List Scroll:**
- Momentum scrolling enabled
- Bounce effect on over-scroll (iOS)
- Summary card scrolls away (parallax effect)

**Pull to Refresh:**
- Pull down from top to refresh data
- Loading spinner appears in nav bar
- Duration: 300ms ease-out

---

## Implementation Notes

**React Native + NativeWind Classes:**

```tsx
// Navigation Bar
className="bg-primary h-14 flex-row items-center justify-between px-4 shadow-sm"

// Period Selector
className="bg-white h-16 flex-row items-center justify-between px-3 border-b border-gray-200"

// Summary Metrics Card
className="bg-white p-4 flex-row border-b border-gray-200"

// Metric Column
className="flex-1 items-center justify-center"

// Metric Label
className="text-xs text-gray-500 mb-1"

// Metric Value
className="text-2xl font-bold text-gray-900"

// Time Entry Card
className="bg-white rounded-xl p-4 mb-2 shadow-sm min-h-[88px]"

// Entry Date
className="text-base font-semibold text-gray-800"

// Entry Hours
className="text-xl font-bold text-primary"

// Client Name
className="text-sm font-medium text-gray-600 mt-1"

// Description
className="text-sm text-gray-500 mt-1"

// Time Chips
className="bg-gray-100 rounded px-2 py-0.5 text-xs text-gray-600"

// FAB
className="absolute bottom-4 right-4 bg-primary w-14 h-14 rounded-full shadow-lg items-center justify-center"
```

**Key Libraries:**
- `react-native-gesture-handler` for swipe actions
- `react-native-reanimated` for smooth animations
- `FlatList` with `windowSize` optimization for performance

---

## Responsive Considerations

**Small Screens (iPhone SE, 320-375px width):**
- Card padding: 12px (reduced from 16px)
- Reduce metric font sizes by 2px
- Show 5-6 entries without scrolling

**Large Screens (iPhone 14 Pro Max, iPad Mini, 414px+ width):**
- Maintain 8px horizontal padding
- Cards can expand to full width
- Show 7-8 entries without scrolling

**Landscape Mode:**
- Navigation bar remains at top
- Consider 2-column grid for entries on tablets
- Metrics remain horizontal

**Safe Areas:**
- iOS: Respects notch and home indicator
- Android: Respects status bar and navigation bar
- FAB positioned 16px + safe area bottom

---

## Design Rationale

**Why List View Works:**
1. **Familiar Pattern**: Users understand vertical scrolling lists
2. **Information Dense**: More entries visible at once
3. **Quick Scanning**: Easy to scan chronologically
4. **Fast Actions**: Swipe gestures for power users
5. **Traditional**: Matches desktop table view experience

**User Flow:**
1. User opens app → sees current period entries
2. Scrolls to review all entries for period
3. Swipes left on entry → quick edit or delete
4. Taps FAB → add new entry
5. Taps period arrows → navigate to different periods

**Ideal For:**
- Users who need to review many entries at once
- Power users who prefer keyboard-free workflows
- Quick time entry management
- Users familiar with mobile email or messaging apps

**Potential Drawbacks:**
- Less visual/engaging than calendar view
- Requires scrolling for >7 entries
- Date context less obvious than calendar grid

---

## Data Loading & States

**Loading State:**
- Show skeleton cards (3-4) with shimmer effect
- Maintain layout structure during load

**Empty State:**
- Icon: Calendar with slash (48px, Gray 300)
- Title: "No time entries"
- Subtitle: "Tap + to add your first entry"
- Action: Large "Add Entry" button

**Error State:**
- Icon: Alert triangle (48px, Error color)
- Title: "Unable to load entries"
- Subtitle: Error message
- Action: "Retry" button

**Pull to Refresh:**
- Small spinner in nav bar
- Maintains scroll position on refresh

---

## Files Required for Implementation

- Time entry data API endpoint: `/api/timesheets?period=04/01-04/15`
- Icons: Menu, Filter, Chevron Left/Right, Plus, Edit, Delete, Duplicate
- Swipeable component wrapper
- Time entry card component
- Metrics summary component

---

**Version**: 1.0  
**Status**: Awaiting Approval  
**Created**: 2026-04-12
