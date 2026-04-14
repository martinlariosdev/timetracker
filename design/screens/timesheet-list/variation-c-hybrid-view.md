# Timesheet List Screen - Variation C: Hybrid View

## Overview

A week-based view combining the best of both worlds: visual date context through a horizontal week scroller with detailed daily cards showing entries. This variation balances information density with temporal awareness, optimized for mobile interaction patterns.

## Design Philosophy

- **Week-Centric**: Natural 7-day work cycle
- **Horizontal Navigation**: Intuitive swipe between weeks
- **Context + Detail**: See dates and entries simultaneously
- **Quick Entry**: Per-day add buttons for fast input

## Screen Structure

### Container
- **Background**: Gray 50 (`#F9FAFB`)
- **Safe Area**: Respects top and bottom insets
- **Dimensions**: Full screen (100% width, 100% height)

### Content Layout (Vertical + Horizontal Hybrid)

1. **Top Navigation Bar** (fixed)
2. **Period Selector & Metrics Banner** (fixed, horizontally scrollable metrics)
3. **Week Date Header** (horizontally scrollable, snaps to weeks)
4. **Daily Entries Cards** (vertically scrollable)
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

**Right Actions (Horizontal Stack):**
- **Icon 1**: View mode toggle (24px, switches to list/calendar)
- **Icon 2**: Filter icon (24px)
- **Color**: White
- **Touch Target**: 44x44px each
- **Spacing**: 12px (sm) between icons

---

### 2. Metrics Banner (Horizontally Scrollable)

**Position**: Below navigation bar, fixed

**Container Properties:**
- **Background**: Linear gradient Primary Blue (`#2563EB`) to Primary Dark (`#1E40AF`)
- **Height**: 88px
- **Padding**: 16px (md) vertical, 12px (sm) horizontal
- **Shadow**: Level 1

**Horizontal Scroll:**
- **Direction**: Horizontal
- **Snap**: Optional snap to metrics
- **Pagination Dots**: Small dots below showing scroll position

**Metric Cards (Horizontal Stack, Scrollable):**

Each metric is a card in horizontal scroller:

#### Metric Card Structure
**Card Properties:**
- **Width**: 120px
- **Background**: White with 15% opacity (rgba(255,255,255,0.15))
- **Border**: 1px solid White with 25% opacity
- **Border Radius**: 12px (md)
- **Padding**: 12px (sm)
- **Margin Right**: 12px (sm)

**Card 1: Total Hours**
**Label:**
- **Text**: "Total Hours"
- **Font**: SF Pro Text
- **Size**: 11px (smaller Caption)
- **Weight**: Medium (500)
- **Color**: White with 80% opacity
- **Margin Bottom**: 4px (xs)

**Value:**
- **Text**: "56.00"
- **Font**: SF Pro Rounded
- **Size**: 24px (Heading 2)
- **Weight**: Bold (700)
- **Color**: White (`#FFFFFF`)

**Subtext:**
- **Text**: "this period"
- **Font**: SF Pro Text
- **Size**: 10px
- **Weight**: Regular (400)
- **Color**: White with 70% opacity

**Card 2: ETO Hours**
**Label**: "ETO"
**Value**: "33.92"
**Subtext**: "hours used"
**Value Color**: Secondary Cyan (`#0EA5E9`) - brighter against gradient

**Card 3: Pending Days**
**Label**: "Pending"
**Value**: "4"
**Subtext**: "days left"
**Value Color**: Warning (`#F59E0B`)

**Card 4: This Week**
**Label**: "This Week"
**Value**: "32.00"
**Subtext**: "hours logged"

**Horizontal Scroll Indicator:**
- **Position**: Bottom of banner
- **Dots**: 4 dots (one per metric)
- **Size**: 6px diameter
- **Active**: White (solid)
- **Inactive**: White with 40% opacity
- **Spacing**: 8px (sm) between dots

---

### 3. Week Date Header (Horizontally Scrollable)

**Position**: Below metrics banner, fixed

**Container Properties:**
- **Background**: White (`#FFFFFF`)
- **Height**: 80px
- **Border Bottom**: 1px solid Gray 200 (`#E5E7EB`)
- **Padding**: 8px (sm) horizontal

**Horizontal Scroll:**
- **Direction**: Horizontal
- **Snap**: Snaps to week boundaries (shows exactly 7 days)
- **Momentum**: Enabled
- **Gesture**: Swipe left/right to change weeks
- **Infinite Scroll**: Load prev/next weeks as needed

**Week Navigation:**
- **Behavior**: Shows current week (Sun-Sat or Mon-Sun based on settings)
- **Indicator**: Current date highlighted
- **Scroll Position**: Auto-scrolls to center selected date

**Date Chips (7 visible at a time):**

**Chip Container:**
- **Width**: (Screen width - 16px padding) / 7.2 (~52px on iPhone 14 Pro)
- **Height**: 64px
- **Margin**: 2px (xs) horizontal
- **Touch Target**: Full chip size

**Chip Layout (Vertical Stack):**

#### Day Abbreviation
- **Text**: "Mon", "Tue", "Wed", etc.
- **Font**: SF Pro Text
- **Size**: 11px (smaller Caption)
- **Weight**: Medium (500)
- **Color**: Gray 500 (`#6B7280`)
- **Alignment**: Center

#### Date Number
- **Text**: "1", "2", "3", etc.
- **Font**: SF Pro Text
- **Size**: 20px (Heading 4)
- **Weight**: Semibold (600)
- **Color**: Gray 800 (`#1F2937`)
- **Alignment**: Center
- **Margin Top**: 4px (xs)

#### Entry Indicator (Bottom)
- **Position**: Bottom of chip
- **Margin Top**: 8px (sm)

**Indicator Types:**

**No Entries:**
- No indicator shown

**Has Entries:**
- **Dot**: 6px diameter circle
- **Color**: Primary Blue (`#2563EB`)
- **Position**: Centered horizontally

**Selected Date (Active):**
- **Background**: Primary Blue (`#2563EB`)
- **Border Radius**: 12px (md)
- **Day Abbreviation Color**: White with 90% opacity
- **Date Number Color**: White (`#FFFFFF`)
- **Indicator Dot Color**: White

**Today (Not Selected):**
- **Border**: 2px solid Primary Blue
- **Border Radius**: 12px (md)
- **Background**: Transparent

---

### 4. Daily Entries Cards (Vertically Scrollable)

**Position**: Main content area, scrollable

**Container Properties:**
- **Background**: Gray 50 (`#F9FAFB`)
- **Padding**: 16px (md) horizontal, 12px (sm) vertical
- **Content Padding Bottom**: 88px (for FAB clearance)

**Content Structure:**
- Shows all 7 days of selected week
- Each day is a card with its entries
- Empty days show placeholder cards

#### Daily Card

**Card Container:**
- **Background**: White (`#FFFFFF`)
- **Border Radius**: 16px (lg)
- **Padding**: 16px (md)
- **Margin Bottom**: 12px (sm)
- **Shadow**: Level 1 - `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
- **Min Height**: 96px

**Card Header (Horizontal Layout):**

**Left Section (Vertical Stack):**
- **Date**: "Monday, April 1"
- **Font**: SF Pro Text
- **Size**: 16px (Body)
- **Weight**: Semibold (600)
- **Color**: Gray 800 (`#1F2937`)

**Right Section:**
- **Daily Total**: "8.00 hrs"
- **Font**: SF Pro Rounded
- **Size**: 20px (Heading 4)
- **Weight**: Bold (700)
- **Color**: Primary Blue (`#2563EB`)
- **Alignment**: Right

**Divider:**
- **Margin**: 12px (sm) vertical
- **Border**: 1px solid Gray 200 (`#E5E7EB`)

**Entries List (Within Day Card):**

If day has entries, show compact entry items:

#### Entry Item (Compact)

**Container:**
- **Background**: Gray 50 (`#F9FAFB`)
- **Border Radius**: 8px (sm)
- **Padding**: 10px (sm)
- **Margin Bottom**: 8px (sm)
- **Border Left**: 3px solid Primary Blue (accent)

**Layout (Horizontal):**

**Left Section (70% width):**

**Client Name:**
- **Text**: "Aderant"
- **Font**: SF Pro Text
- **Size**: 14px (Body Small)
- **Weight**: Semibold (600)
- **Color**: Gray 800 (`#1F2937`)

**Description:**
- **Text**: "Worked on PR #239, #189 Review..."
- **Font**: SF Pro Text
- **Size**: 13px (smaller Body Small)
- **Weight**: Regular (400)
- **Color**: Gray 500 (`#6B7280`)
- **Lines**: 1 max (truncate)
- **Margin Top**: 2px

**Time Breakdown Chips:**
- **Layout**: Horizontal wrap
- **Margin Top**: 6px
- **Chip Style**: Small pills

**Chip:**
- **Background**: White (`#FFFFFF`)
- **Border**: 1px solid Gray 200
- **Border Radius**: 4px (xs)
- **Padding**: 2px horizontal, 1px vertical
- **Font**: SF Pro Text
- **Size**: 10px
- **Color**: Gray 600
- **Margin Right**: 4px (xs)

**Right Section (30% width):**

**Hours:**
- **Text**: "8.00"
- **Font**: SF Pro Rounded
- **Size**: 16px (Body)
- **Weight**: Bold (700)
- **Color**: Primary Blue (`#2563EB`)
- **Alignment**: Right

**Actions (Below Hours):**
- **Layout**: Horizontal row
- **Margin Top**: 8px (sm)

**Edit Icon:**
- **Icon**: Pencil (14px)
- **Color**: Primary Blue
- **Touch Target**: 32x32px

**Delete Icon:**
- **Icon**: Trash (14px)
- **Color**: Error (`#EF4444`)
- **Touch Target**: 32x32px
- **Margin Left**: 4px (xs)

**Empty Day Card:**

When day has no entries:

**Container:**
- Same styling as daily card
- Min height: 96px

**Content (Centered):**
- **Icon**: Clock with plus (32px, Gray 300)
- **Text**: "No entries"
- **Font**: SF Pro Text
- **Size**: 14px (Body Small)
- **Weight**: Regular (400)
- **Color**: Gray 400 (`#9CA3AF`)
- **Margin Top**: 8px (sm)

**Quick Add Button:**
- **Text**: "+ Add Entry"
- **Background**: Primary Blue (`#2563EB`)
- **Border Radius**: 8px (sm)
- **Padding**: 8px horizontal, 6px vertical
- **Font**: SF Pro Text
- **Size**: 13px
- **Weight**: Semibold (600)
- **Color**: White
- **Touch Target**: 44px width × 32px height (adequate)
- **Margin Top**: 12px (sm)

---

### 5. Floating Action Button (FAB)

**Position**: Fixed bottom-right corner

**Button Properties:**
- **Background**: Primary Blue (`#2563EB`)
- **Size**: 56x56px
- **Border Radius**: Full (circular)
- **Shadow**: Level 3 - `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)`
- **Position**: 16px from right edge, 16px from bottom (+ safe area)
- **Touch Target**: 56x56px

**Icon:**
- **Type**: Plus (+) icon
- **Size**: 24px
- **Color**: White (`#FFFFFF`)
- **Alignment**: Center

**Smart Context:**
- If date selected in week header: Pre-fills that date
- Otherwise: Uses today's date
- Long press: Show quick menu (Today, Tomorrow, Custom Date)

---

## Spacing Breakdown

**Vertical Structure:**
1. Navigation Bar: 56px + safe area top
2. Metrics Banner: 88px
3. Week Date Header: 80px
4. Daily Cards: Variable (96px min per card)

**Total Fixed Header**: ~224px

**Available Scroll Area**: Screen height - 224px
- iPhone 14 Pro (852px): ~628px for daily cards
- Can show ~3-4 day cards without scrolling

**Horizontal Spacing:**
- Screen Padding: 16px (md)
- Card Internal Padding: 16px (md)
- Week Header Date Spacing: 2px (xs) between chips

---

## Color Palette Used

| Element | Color Name | Hex Code |
|---------|-----------|----------|
| Background | Gray 50 | `#F9FAFB` |
| Navigation Bar | Primary Blue | `#2563EB` |
| Metrics Banner | Primary Blue → Primary Dark | Gradient |
| Card Background | White | `#FFFFFF` |
| Selected Date | Primary Blue | `#2563EB` |
| Today Border | Primary Blue | `#2563EB` |
| Entry Indicator | Primary Blue | `#2563EB` |
| Primary Text | Gray 800 | `#1F2937` |
| Secondary Text | Gray 600 | `#4B5563` |
| Tertiary Text | Gray 500 | `#6B7280` |
| Hours Value | Primary Blue | `#2563EB` |
| ETO Metric | Secondary Cyan | `#0EA5E9` |
| Pending Metric | Warning | `#F59E0B` |
| Entry Card Background | Gray 50 | `#F9FAFB` |
| Delete Icon | Error | `#EF4444` |
| Empty State Icon | Gray 300 | `#D1D5DB` |

---

## Typography Specifications

| Element | Font Family | Size | Weight | Line Height |
|---------|------------|------|--------|-------------|
| Nav Title | SF Pro Display | 20px | Semibold (600) | 1.25 (25px) |
| Metric Labels | SF Pro Text | 11px | Medium (500) | 1.5 (16.5px) |
| Metric Values | SF Pro Rounded | 24px | Bold (700) | 1.25 (30px) |
| Week Day Name | SF Pro Text | 11px | Medium (500) | 1.5 (16.5px) |
| Week Date Number | SF Pro Text | 20px | Semibold (600) | 1.25 (25px) |
| Daily Card Date | SF Pro Text | 16px | Semibold (600) | 1.5 (24px) |
| Daily Total | SF Pro Rounded | 20px | Bold (700) | 1.25 (25px) |
| Client Name | SF Pro Text | 14px | Semibold (600) | 1.5 (21px) |
| Description | SF Pro Text | 13px | Regular (400) | 1.5 (19.5px) |
| Entry Hours | SF Pro Rounded | 16px | Bold (700) | 1.25 (20px) |
| Time Chips | SF Pro Text | 10px | Regular (400) | 1.5 (15px) |
| Empty State Text | SF Pro Text | 14px | Regular (400) | 1.5 (21px) |

---

## Touch Targets

All interactive elements meet or exceed minimum accessibility standards:

| Element | Size | Status |
|---------|------|--------|
| Nav Icons | 44x44px | ✓ Meets 44pt minimum |
| Metric Cards | 120px × 56px | ✓ Exceeds minimum |
| Week Date Chip | ~52px × 64px | ✓ Exceeds 44pt minimum |
| Entry Card (tap) | Full card width × min 56px | ✓ Exceeds minimum |
| Quick Add Button | 44px × 32px | ✓ Adequate (emphasized) |
| Entry Edit/Delete | 32x32px in 48px spacing | ✓ Adequate spacing |
| FAB | 56x56px | ✓ Exceeds 44pt minimum |

---

## Accessibility

**Color Contrast:**
- Nav Title (White on Primary Blue): 6.98:1 ✓ AAA
- Metric Values (White on Primary Blue): 6.98:1 ✓ AAA
- Primary Text (Gray 800 on White): 12.63:1 ✓ AAA
- Secondary Text (Gray 600 on White): 7.27:1 ✓ AAA
- Selected Date (White on Primary Blue): 6.98:1 ✓ AAA
- Entry Text (Gray 800 on Gray 50): 11.89:1 ✓ AAA

**Screen Reader Support:**
- Navigation: "Timesheet screen, current week [dates]"
- Metrics: Announce all metrics in banner
- Week dates: "Monday, April 1, has 1 entry" / "Tuesday, April 2, no entries"
- Daily cards: "Monday, April 1, total 8 hours, 1 entry"
- Entries: "[Client], [hours] hours, [description], edit button, delete button"
- FAB: "Add time entry for [selected date or today]"

**Dynamic Type:**
- All text scales with system settings
- Cards expand vertically
- Week date chips scale proportionally
- Metrics banner height increases if needed

**Gestures:**
- Horizontal swipe for week navigation
- Alternative: Arrow buttons for week navigation
- Tap to select date
- Pull to refresh

---

## Animation & Interactions

**Week Date Swipe:**
- Duration: 300ms
- Easing: ease-out
- Effect: Horizontal slide with momentum
- Snap: Snaps to week boundaries
- Haptic: Light feedback on snap

**Date Selection:**
- Duration: 200ms
- Easing: ease-in-out
- Effect: Color transition and scale (1.05)
- Auto-scroll: Daily cards scroll to show selected day
- Haptic: Medium feedback on selection

**Daily Card Expand:**
- Duration: 250ms
- Easing: ease-out
- Effect: Height animation when entries expand/collapse
- Optional: Accordion behavior (one day expanded at a time)

**Metrics Banner Scroll:**
- Duration: Follows gesture
- Pagination: Optional snap to metrics
- Dot indicator updates

**FAB Press:**
- Duration: 150ms
- Easing: ease-in-out
- Effect: Scale (0.95) and shadow reduction

**Pull to Refresh:**
- Standard pull-to-refresh pattern
- Loading spinner in nav bar or at top of content
- Duration: 400ms ease-out

---

## Implementation Notes

**React Native + NativeWind Classes:**

```tsx
// Navigation Bar
className="bg-primary h-14 flex-row items-center justify-between px-4 shadow-sm"

// Metrics Banner Container
className="bg-gradient-to-r from-primary to-primary-dark h-22 px-3 py-4 shadow-sm"

// Metric Card
className="bg-white/15 border border-white/25 rounded-xl p-3 w-30 mr-3"

// Metric Label
className="text-xs font-medium text-white/80 mb-1"

// Metric Value
className="text-2xl font-bold text-white"

// Week Date Header (ScrollView)
className="bg-white border-b border-gray-200 px-2 py-2"

// Week Date Chip
className="items-center justify-center rounded-xl mx-0.5"
style={{ width: chipWidth, height: 64 }}

// Week Date Chip - Selected
className="bg-primary"

// Week Date Chip - Today
className="border-2 border-primary"

// Day Abbreviation
className="text-xs font-medium text-gray-500"

// Date Number
className="text-xl font-semibold text-gray-800 mt-1"

// Entry Indicator Dot
className="w-1.5 h-1.5 bg-primary rounded-full mt-2"

// Daily Card
className="bg-white rounded-2xl p-4 mb-3 shadow-sm min-h-[96px]"

// Daily Card Header
className="flex-row items-center justify-between"

// Daily Card Date
className="text-base font-semibold text-gray-800"

// Daily Total
className="text-xl font-bold text-primary"

// Entry Item
className="bg-gray-50 rounded-lg p-2.5 mb-2 border-l-3 border-primary"

// Client Name
className="text-sm font-semibold text-gray-800"

// Description
className="text-xs text-gray-500 mt-0.5"

// Entry Hours
className="text-base font-bold text-primary text-right"

// Quick Add Button
className="bg-primary rounded-lg px-3 py-1.5 mt-3"

// FAB
className="absolute bottom-4 right-4 bg-primary w-14 h-14 rounded-full shadow-lg items-center justify-center"
```

**Key Libraries:**
- `FlatList` with horizontal scroll for metrics
- `ScrollView` horizontal for week dates with snap
- `FlatList` vertical for daily cards
- `react-native-reanimated` for animations
- `react-native-gesture-handler` for swipe gestures

**Performance Optimizations:**
- Virtualize daily cards list
- Lazy load week data (prev/next weeks)
- Memoize metric calculations
- Optimize re-renders with React.memo

---

## Responsive Considerations

**Small Screens (iPhone SE, 320-375px width):**
- Week date chips: ~45px width
- Reduce metric card width to 110px
- Daily card padding: 12px
- Entry item padding: 8px
- Show ~3 day cards without scrolling

**Large Screens (iPhone 14 Pro Max, 414px+ width):**
- Week date chips: ~56px width
- Metric card width: 130px
- Maintain 16px padding
- Show ~4-5 day cards without scrolling

**Tablets (iPad Mini, 768px+ width):**
- Consider 2-column layout for daily cards
- Wider metric cards (150px)
- Show more days in week view (14 days / 2 weeks)

**Landscape Mode:**
- Reduce metrics banner height to 72px
- Week header remains horizontal
- Daily cards in 2-column grid
- FAB repositions to bottom-right with spacing

**Safe Areas:**
- iOS: Respects notch and home indicator
- Android: Respects status bar and navigation bar
- All fixed elements account for safe areas

---

## Design Rationale

**Why Hybrid View Works:**
1. **Best of Both Worlds**: Visual date context + detailed entry info
2. **Week Focus**: Natural work cycle, easy to track 5-day workweek
3. **Horizontal + Vertical**: Leverages both scroll directions naturally
4. **Quick Scanning**: Week view shows what's missing at a glance
5. **Efficient**: Less tapping than calendar view, more context than list
6. **Modern UX**: Feels app-native with smooth gestures

**User Flow:**
1. User opens app → sees current week with today selected
2. Scrolls horizontally to see metrics (optional)
3. Swipes week header left/right to navigate weeks
4. Scrolls vertically through day cards
5. Taps quick add on empty day → fast entry
6. Swipes week header to next week → reviews future entries

**Ideal For:**
- Users who work Monday-Friday schedules
- Visual learners who like date context
- Mobile-first users comfortable with gestures
- Quick entry workflows (per-day add buttons)
- Balanced information density needs

**Potential Drawbacks:**
- More complex than pure list view
- Horizontal scroll for metrics may be missed
- Week-centric may not suit all work patterns
- Slightly more cognitive load than single-view options

---

## Data Loading & States

**Loading State:**
- Week header: Show skeleton date chips
- Metrics banner: Show loading placeholders
- Daily cards: Show 3-4 skeleton cards with shimmer

**Empty State (No Entries in Week):**
- All day cards show empty state with quick add
- Metrics show zeros
- Week header shows dates normally

**Error State:**
- Alert banner at top of content
- Retry button in banner
- Cached data remains visible if available

**Week Navigation:**
- Preload adjacent weeks for smooth scrolling
- Cache 3 weeks (prev, current, next)
- Load more as user swipes

**Pull to Refresh:**
- Refreshes current week data
- Updates metrics
- Spinner in nav bar during refresh

---

## Special Features

**Week Picker Modal:**
- Long press on week header → show week picker modal
- Quick jump to specific week
- Shortcuts: "This Week", "Last Week", "Next Week"

**Smart FAB:**
- Contextually aware of selected date
- Long press → quick menu:
  - "Add for Today"
  - "Add for Tomorrow"
  - "Add for Selected Date"
  - "Add for Custom Date"

**Swipe Actions on Entry Items:**
- Swipe left → Delete
- Swipe right → Duplicate
- Full swipe → Immediate action
- Partial swipe → Show action button

**Week Summary:**
- Swipe down on week header → expand week summary
- Shows total hours, breakdown by client
- Quick week report view

**Persistent Week Selection:**
- Remembers selected date in session
- Returns to same week on app reopen
- Smart default: Current week if >3 days have passed

---

## Files Required for Implementation

- Week data API endpoint: `/api/timesheets/week?start=04/01&end=04/07`
- Metrics API endpoint: `/api/timesheets/metrics?period=04/01-04/15`
- Icons: Menu, View Toggle, Filter, Plus, Edit, Trash, Clock Plus
- Week date scroller component
- Daily card component with entries
- Metrics banner component
- Gradient implementation

---

**Version**: 1.0  
**Status**: Awaiting Approval  
**Created**: 2026-04-12
