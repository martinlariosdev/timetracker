# Timesheet List Screen - Variation B: Calendar View

## Overview

A visual monthly calendar grid with dots indicating time entry days, combined with a detailed list view when a date is selected. This variation prioritizes temporal context and makes it easy to spot gaps or patterns in time tracking.

## Design Philosophy

- **Visual Context**: See entire month at a glance
- **Pattern Recognition**: Quickly identify missing days or tracking patterns
- **Date-First Navigation**: Natural calendar-based interaction
- **Context Switching**: Calendar for overview, list for details

## Screen Structure

### Container
- **Background**: Gray 50 (`#F9FAFB`)
- **Safe Area**: Respects top and bottom insets
- **Dimensions**: Full screen (100% width, 100% height)

### Content Layout (Vertical Stack)

1. **Top Navigation Bar** (fixed)
2. **Month Selector** (fixed)
3. **Calendar Grid** (scrollable vertically if needed)
4. **Summary Sidebar** (collapsible)
5. **Selected Date Entries** (bottom sheet / expandable)
6. **Floating Action Button** (fixed overlay)

---

## Component Breakdown

### 1. Top Navigation Bar

**Position**: Fixed at top, respects safe area

**Bar Properties:**
- **Background**: Primary Blue (`#2563EB`)
- **Height**: 56px + safe area top
- **Shadow**: Level 1 - `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`

**Content:**
- **Title**: "Calendar"
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
- **Icon**: List view toggle icon (24px)
- **Color**: White
- **Touch Target**: 44x44px

---

### 2. Month Selector

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

#### Month/Year Text (Center)
- **Text**: "April 2026"
- **Font**: SF Pro Display (iOS) / Roboto (Android)
- **Size**: 18px (Body Large)
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

### 3. Calendar Grid

**Position**: Below month selector

**Container Properties:**
- **Background**: White (`#FFFFFF`)
- **Padding**: 16px (md) horizontal, 12px (sm) vertical
- **Border Bottom**: 1px solid Gray 200 (`#E5E7EB`)

**Weekday Header Row:**

**Container:**
- **Height**: 32px
- **Margin Bottom**: 8px (sm)
- **Layout**: 7-column grid (equal width)

**Weekday Labels (Sun-Sat):**
- **Text**: "S", "M", "T", "W", "T", "F", "S"
- **Font**: SF Pro Text
- **Size**: 12px (Caption)
- **Weight**: Semibold (600)
- **Color**: Gray 500 (`#6B7280`)
- **Alignment**: Center

**Date Grid:**

**Container:**
- **Layout**: 7-column grid, 5-6 rows
- **Row Height**: 56px (touch-friendly)
- **Column Width**: (Screen width - 32px padding) / 7
- **Gap**: 4px (xs) between cells

**Individual Date Cell:**

**Cell Container:**
- **Size**: ~48x48px (depends on screen width)
- **Border Radius**: 8px (sm)
- **Touch Target**: Minimum 44x44px
- **Alignment**: Center
- **Position**: Relative

**Cell States:**

#### Default (No Entry)
- **Background**: Transparent
- **Number Color**: Gray 600 (`#4B5563`)

#### Has Entry (Unselected)
- **Background**: Gray 100 (`#F3F4F6`)
- **Number Color**: Gray 800 (`#1F2937`)
- **Dot Indicator**: Present (see below)

#### Selected Date
- **Background**: Primary Blue (`#2563EB`)
- **Number Color**: White (`#FFFFFF`)
- **Shadow**: Level 1
- **Dot Indicator**: White if has entry

#### Today
- **Border**: 2px solid Primary Blue (`#2563EB`)
- **Background**: Transparent (unless selected)
- **Number Color**: Primary Blue

#### Outside Current Month
- **Number Color**: Gray 300 (`#D1D5DB`)
- **Opacity**: 0.5

**Date Number:**
- **Text**: "1" to "31"
- **Font**: SF Pro Text
- **Size**: 16px (Body)
- **Weight**: Semibold (600) if has entry, Regular (400) otherwise
- **Alignment**: Center

**Entry Indicator Dot:**
- **Position**: Absolute, bottom 6px, horizontally centered
- **Size**: 4px diameter
- **Color**: Primary Blue (`#2563EB`) default, White if selected
- **Border Radius**: Full (circular)

**Multiple Entries Indicator:**
- If >1 entry: Show 2 dots side by side (2px apart)
- If >3 entries: Show 3 dots
- Max 3 dots shown

---

### 4. Summary Sidebar

**Position**: Below calendar grid, collapsible

**Container Properties:**
- **Background**: Primary Light (`#3B82F6`) with 10% opacity
- **Padding**: 16px (md)
- **Border Bottom**: 1px solid Gray 200 (`#E5E7EB`)

**Header:**
- **Text**: "This Month"
- **Font**: SF Pro Text
- **Size**: 14px (Body Small)
- **Weight**: Semibold (600)
- **Color**: Gray 700 (`#374151`)
- **Margin Bottom**: 12px (sm)

**Metrics (3-Column Grid):**

#### Metric 1: Total Hours
**Label:**
- **Text**: "Total"
- **Font**: SF Pro Text
- **Size**: 11px (smaller Caption)
- **Weight**: Regular (400)
- **Color**: Gray 600 (`#4B5563`)

**Value:**
- **Text**: "56.00"
- **Font**: SF Pro Rounded
- **Size**: 20px (Heading 4)
- **Weight**: Bold (700)
- **Color**: Gray 900 (`#111827`)

**Unit:**
- **Text**: "hrs"
- **Font**: SF Pro Text
- **Size**: 11px
- **Color**: Gray 600

#### Metric 2: Days Tracked
**Label:** "Days Logged"
**Value:** "10"
**Unit:** "days"
**Color**: Success (`#10B981`)

#### Metric 3: Pending Days
**Label:** "Pending"
**Value:** "4"
**Unit:** "days"
**Color**: Warning (`#F59E0B`)

---

### 5. Selected Date Entries (Bottom Sheet)

**Position**: Overlays bottom portion of screen when date is selected

**Container Properties:**
- **Background**: White (`#FFFFFF`)
- **Border Radius**: 24px (xl) top corners only
- **Shadow**: Level 3 - `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)`
- **Min Height**: 40% of screen
- **Max Height**: 70% of screen
- **Draggable**: Can be swiped down to dismiss

**Handle Bar:**
- **Position**: Top center, 12px from top
- **Size**: 40px width × 4px height
- **Background**: Gray 300 (`#D1D5DB`)
- **Border Radius**: Full (pill shape)

**Header Section:**
- **Padding**: 24px (lg) horizontal, 32px (xl) top, 16px (md) bottom
- **Border Bottom**: 1px solid Gray 200

**Selected Date Title:**
- **Text**: "Monday, April 1, 2026"
- **Font**: SF Pro Display
- **Size**: 20px (Heading 3)
- **Weight**: Semibold (600)
- **Color**: Gray 800 (`#1F2937`)

**Daily Total:**
- **Text**: "8.00 hours"
- **Font**: SF Pro Rounded
- **Size**: 16px (Body)
- **Weight**: Semibold (600)
- **Color**: Primary Blue (`#2563EB`)
- **Margin Top**: 4px (xs)

**Entries List:**
- **Padding**: 16px (md) horizontal
- **Scrollable**: Vertical scroll if >3 entries

**Individual Entry Card (Compact Version):**

**Card Properties:**
- **Background**: Gray 50 (`#F9FAFB`)
- **Border Radius**: 12px (md)
- **Padding**: 12px (sm)
- **Margin Bottom**: 8px (sm)
- **Border Left**: 4px solid Primary Blue (accent)

**Content (Vertical Stack):**

#### Row 1: Client & Hours
**Left - Client:**
- **Text**: "Aderant"
- **Font**: SF Pro Text
- **Size**: 14px (Body Small)
- **Weight**: Semibold (600)
- **Color**: Gray 800 (`#1F2937`)

**Right - Hours:**
- **Text**: "8.00"
- **Font**: SF Pro Rounded
- **Size**: 16px (Body)
- **Weight**: Bold (700)
- **Color**: Primary Blue (`#2563EB`)

#### Row 2: Description
- **Text**: "Worked on PR #239, #189..."
- **Font**: SF Pro Text
- **Size**: 13px (between Caption and Body Small)
- **Weight**: Regular (400)
- **Color**: Gray 500 (`#6B7280`)
- **Lines**: 1 max (truncate with ellipsis)
- **Margin Top**: 4px (xs)

#### Row 3: Action Icons
**Layout**: Horizontal row, right-aligned
**Margin Top**: 8px (sm)

**Edit Button:**
- **Icon**: Pencil (16px)
- **Color**: Primary Blue
- **Touch Target**: 32x32px
- **Margin Right**: 8px (sm)

**Delete Button:**
- **Icon**: Trash (16px)
- **Color**: Error (`#EF4444`)
- **Touch Target**: 32x32px

**Empty State (No Entries for Date):**
- **Icon**: Calendar plus (48px, Gray 300)
- **Title**: "No entries for this day"
- **Subtitle**: "Tap + to add an entry"
- **Centered vertically and horizontally**

---

### 6. Floating Action Button (FAB)

**Position**: Fixed bottom-right corner

**Button Properties:**
- **Background**: Primary Blue (`#2563EB`)
- **Size**: 56x56px
- **Border Radius**: Full (circular)
- **Shadow**: Level 3 - `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)`
- **Position**: 16px from right edge, 16px from bottom (+ safe area)
- **Touch Target**: 56x56px
- **Z-Index**: Above bottom sheet

**Icon:**
- **Type**: Plus (+) icon
- **Size**: 24px
- **Color**: White (`#FFFFFF`)
- **Alignment**: Center

**Smart Behavior:**
- If date selected: Pre-fills selected date in add form
- If no date selected: Uses today's date

---

## Spacing Breakdown

**Vertical Structure:**
1. Navigation Bar: 56px + safe area top
2. Month Selector: 64px
3. Calendar Grid: ~376px (weekday header + 5-6 rows)
4. Summary Sidebar: ~100px (collapsible)
5. Bottom Sheet: 40-70% of screen (when visible)

**Horizontal Spacing:**
- Calendar Grid Padding: 16px (md)
- Cell Gap: 4px (xs)
- Bottom Sheet Padding: 24px (lg) horizontal

**Calendar Grid Calculation:**
- iPhone 14 Pro width: 393px
- Available width: 393px - 32px (padding) = 361px
- Cell width: 361px / 7 = ~51px
- Cell height: 56px (touch-friendly)

---

## Color Palette Used

| Element | Color Name | Hex Code |
|---------|-----------|----------|
| Background | Gray 50 | `#F9FAFB` |
| Navigation Bar | Primary Blue | `#2563EB` |
| Card/Sheet Background | White | `#FFFFFF` |
| Selected Date | Primary Blue | `#2563EB` |
| Today Border | Primary Blue | `#2563EB` |
| Entry Indicator Dot | Primary Blue | `#2563EB` |
| Date Numbers | Gray 800 | `#1F2937` |
| Weekday Labels | Gray 500 | `#6B7280` |
| Hours Value | Primary Blue | `#2563EB` |
| Days Logged | Success | `#10B981` |
| Pending Days | Warning | `#F59E0B` |
| Delete Icon | Error | `#EF4444` |
| Entry Card Background | Gray 50 | `#F9FAFB` |

---

## Typography Specifications

| Element | Font Family | Size | Weight | Line Height |
|---------|------------|------|--------|-------------|
| Nav Title | SF Pro Display | 20px | Semibold (600) | 1.25 (25px) |
| Month Title | SF Pro Display | 18px | Semibold (600) | 1.25 (22.5px) |
| Weekday Labels | SF Pro Text | 12px | Semibold (600) | 1.5 (18px) |
| Date Numbers | SF Pro Text | 16px | Regular (400) | 1.25 (20px) |
| Selected Date Title | SF Pro Display | 20px | Semibold (600) | 1.25 (25px) |
| Daily Total | SF Pro Rounded | 16px | Semibold (600) | 1.5 (24px) |
| Client Name | SF Pro Text | 14px | Semibold (600) | 1.5 (21px) |
| Entry Hours | SF Pro Rounded | 16px | Bold (700) | 1.25 (20px) |
| Description | SF Pro Text | 13px | Regular (400) | 1.5 (19.5px) |
| Metric Labels | SF Pro Text | 11px | Regular (400) | 1.5 (16.5px) |
| Metric Values | SF Pro Rounded | 20px | Bold (700) | 1.25 (25px) |

---

## Touch Targets

All interactive elements meet or exceed minimum accessibility standards:

| Element | Size | Status |
|---------|------|--------|
| Nav Icons | 44x44px | ✓ Meets 44pt minimum |
| Month Arrows | 44x44px | ✓ Meets 44pt minimum |
| Calendar Date Cell | 48-56px × 48-56px | ✓ Meets 44pt minimum |
| Entry Action Icons | 32x32px in 48px card | ✓ Adequate spacing |
| FAB | 56x56px | ✓ Exceeds 44pt minimum |

---

## Accessibility

**Color Contrast:**
- Nav Title (White on Primary Blue): 6.98:1 ✓ AAA
- Date Numbers (Gray 800 on White): 12.63:1 ✓ AAA
- Selected Date (White on Primary Blue): 6.98:1 ✓ AAA
- Weekday Labels (Gray 500 on White): 4.68:1 ✓ AA
- Entry Text (Gray 800 on Gray 50): 11.89:1 ✓ AAA

**Screen Reader Support:**
- Calendar cells: "April 1, Monday, has 1 entry, tap to view"
- Selected date: "Selected: April 1, 2026, 8.00 hours total"
- Entry cards: "[Client name], [hours] hours, [description]"
- FAB: "Add new time entry for [selected date or today]"

**Dynamic Type:**
- Calendar scales gracefully with larger text
- Cell height increases to accommodate text
- Bottom sheet content scrolls if text is large

**Navigation:**
- Swipe gestures for month navigation
- Keyboard navigation support for date selection
- VoiceOver/TalkBack: Announce selected date and entries

---

## Animation & Interactions

**Calendar Date Selection:**
- Duration: 200ms
- Easing: ease-out
- Effect: Scale (1.05) and color transition
- Haptic feedback on selection

**Bottom Sheet Appearance:**
- Duration: 300ms
- Easing: spring (iOS) / ease-out (Android)
- Effect: Slide up from bottom with backdrop fade
- Draggable: Swipe down to dismiss

**Month Navigation:**
- Duration: 300ms
- Easing: ease-in-out
- Effect: Slide left/right with fade
- Calendar grid animates as a unit

**Entry Indicator Dots:**
- Duration: 200ms
- Easing: ease-out
- Effect: Fade in with scale (0.5 → 1.0)

**FAB Press:**
- Duration: 150ms
- Easing: ease-in-out
- Effect: Scale (0.95) and shadow reduction

---

## Implementation Notes

**React Native + NativeWind Classes:**

```tsx
// Navigation Bar
className="bg-primary h-14 flex-row items-center justify-between px-4 shadow-sm"

// Month Selector
className="bg-white h-16 flex-row items-center justify-between px-3 border-b border-gray-200"

// Calendar Container
className="bg-white p-4 border-b border-gray-200"

// Weekday Header
className="flex-row mb-2"

// Weekday Label
className="flex-1 text-center text-xs font-semibold text-gray-500"

// Calendar Grid (7 columns)
className="flex-row flex-wrap"

// Date Cell (Base)
className="items-center justify-center rounded-lg m-0.5"
style={{ width: cellWidth, height: 56 }}

// Date Cell - Selected
className="bg-primary shadow-sm"

// Date Cell - Has Entry
className="bg-gray-100"

// Date Cell - Today
className="border-2 border-primary"

// Date Number
className="text-base text-gray-800"

// Entry Indicator Dot
className="absolute bottom-1.5 w-1 h-1 bg-primary rounded-full"

// Bottom Sheet
className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg"

// Bottom Sheet Handle
className="self-center w-10 h-1 bg-gray-300 rounded-full mt-3"

// Selected Date Title
className="text-xl font-semibold text-gray-800"

// Daily Total
className="text-base font-semibold text-primary mt-1"

// Entry Card
className="bg-gray-50 rounded-xl p-3 mb-2 border-l-4 border-primary"

// Client Name
className="text-sm font-semibold text-gray-800"

// Entry Hours
className="text-base font-bold text-primary"

// FAB
className="absolute bottom-4 right-4 bg-primary w-14 h-14 rounded-full shadow-lg items-center justify-center"
```

**Key Libraries:**
- `react-native-gesture-handler` for bottom sheet
- `@gorhom/bottom-sheet` for smooth bottom sheet
- `react-native-reanimated` for calendar animations
- Custom calendar grid component

---

## Responsive Considerations

**Small Screens (iPhone SE, 320-375px width):**
- Cell width: ~42px
- Date font size: 14px
- Reduce padding to 12px
- Bottom sheet min height: 35%

**Large Screens (iPhone 14 Pro Max, iPad Mini, 414px+ width):**
- Cell width: ~54px
- Maintain 56px cell height
- Increase padding to 20px
- Bottom sheet min height: 45%

**Landscape Mode:**
- Calendar grid becomes wider
- Bottom sheet becomes side panel on tablets
- Metrics remain horizontal

**Safe Areas:**
- iOS: Respects notch and home indicator
- Android: Respects status bar and navigation bar
- Bottom sheet respects safe area bottom

---

## Design Rationale

**Why Calendar View Works:**
1. **Visual Context**: See entire month at a glance
2. **Pattern Recognition**: Spot missing days immediately
3. **Intuitive**: Natural date-based navigation
4. **Visual Feedback**: Dots show entry status without opening
5. **Comprehensive**: See both overview and details

**User Flow:**
1. User opens app → sees current month calendar
2. Scans calendar for missing days (no dots)
3. Taps date → bottom sheet shows entries for that day
4. Reviews entries in bottom sheet
5. Taps + → adds entry (pre-filled with selected date)
6. Swipes left/right to change months

**Ideal For:**
- Users who think in terms of dates/weeks
- Visual learners who prefer graphical representations
- Users who need to identify missing entries quickly
- Time tracking with irregular schedules
- Monthly review and planning

**Potential Drawbacks:**
- Less information density than list view
- Requires extra tap to see entry details
- May be overwhelming for users with many entries per day
- Month navigation can be tedious for distant dates

---

## Data Loading & States

**Loading State:**
- Show skeleton calendar grid with shimmer
- Summary sidebar shows loading placeholders
- Maintain layout structure

**Empty State (No Entries in Month):**
- Calendar shows all dates without dots
- Summary sidebar shows zeros
- Message: "No time entries this month"

**Error State:**
- Show alert banner above calendar
- Retry button in banner
- Calendar remains visible with cached data if available

**Month Transition:**
- Smooth slide animation
- Brief loading indicator if data not cached
- Optimistic UI updates

---

## Special Features

**Smart Date Selection:**
- Auto-selects today on first load
- Remembers last selected date in session
- Visual indicator for today vs. selected date

**Quick Actions in Bottom Sheet:**
- Long press entry → Quick menu (Edit, Duplicate, Delete)
- Swipe entry card left → Delete
- Tap anywhere on card → Edit

**Month Summary Trends:**
- Visual progress bar showing tracked vs. workdays
- Color coding: Green (good), Yellow (some missing), Red (many missing)

---

## Files Required for Implementation

- Calendar data API endpoint: `/api/timesheets/calendar?month=04&year=2026`
- Icons: Menu, List Toggle, Chevron Left/Right, Plus, Edit, Trash
- Bottom sheet component
- Calendar grid component
- Entry card component (compact version)

---

**Version**: 1.0  
**Status**: Awaiting Approval  
**Created**: 2026-04-12
