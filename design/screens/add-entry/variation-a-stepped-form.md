# Variation A: Stepped Form (Multi-Step Wizard)

## Overview

A multi-step wizard approach that breaks the time entry process into logical steps, reducing cognitive load and allowing users to focus on one aspect at a time. Ideal for thorough, detailed entries.

## Design Specification

### Step Flow

1. **Step 1: Date Selection**
2. **Step 2: Client Selection**
3. **Step 3: Description & Project**
4. **Step 4: Time Entry**
5. **Step 5: Review & Save**

---

## Step 1: Date Selection

### Layout
```
┌─────────────────────────────────────┐
│ ← Cancel        Add Entry    [1/5]  │ ← Top Bar
├─────────────────────────────────────┤
│                                     │
│  Select Date                        │ ← Title (H2, Bold)
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Calendar Widget         │   │ ← Calendar
│  │   ┌───┬───┬───┬───┬───┬───┐ │   │
│  │   │ S │ M │ T │ W │ T │ F │ │   │
│  │   ├───┼───┼───┼───┼───┼───┤ │   │
│  │   │   │   │   │ 1 │ 2 │ 3 │ │   │
│  │   │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │ │   │
│  │   │11 │12 │(13)│14 │15 │16│ │   │ (13 selected)
│  │   │18 │19 │20 │21 │22 │23 │ │   │
│  │   │25 │26 │27 │28 │29 │30 │ │   │
│  │   └───┴───┴───┴───┴───┴───┘ │   │
│  └─────────────────────────────┘   │
│                                     │
│  Quick Actions:                     │
│  ┌─────────┬─────────┬─────────┐   │
│  │  Today  │Yesterday│ Custom  │   │ ← Chips
│  └─────────┴─────────┴─────────┘   │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │          Next               │   │ ← Primary Button
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Components

**Top Bar:**
- Height: 56px
- Background: White
- Left: "← Cancel" link (Gray 600)
- Center: "Add Entry" (H3, Semibold, Gray 800)
- Right: Progress indicator "[1/5]" (Gray 500, Body Small)
- Shadow: Level 1

**Calendar Widget:**
- Native iOS/Android date picker styled with Bento Box colors
- Selected date: Primary Blue (#2563EB) circle
- Today: Primary Light (#3B82F6) outline
- Other dates: Gray 700
- Month navigation: Chevrons at top
- Padding: 16px
- Background: White card with rounded-lg (16px) corners
- Shadow: Level 1

**Quick Actions:**
- Three chip buttons in a row
- Each chip:
  - Height: 40px
  - Padding: 12px horizontal
  - Border-radius: full (pill shape)
  - Border: 1px solid Gray 300
  - Background: White
  - Active state: Primary Blue background, White text
  - Text: Body Small, Semibold

**Next Button:**
- Height: 48px
- Width: Full width minus 32px margin
- Background: Primary Blue (#2563EB)
- Text: White, Button font (16px Semibold)
- Border-radius: 12px (md)
- Position: Fixed to bottom with 16px margin
- Shadow: Level 2

---

## Step 2: Client Selection

### Layout
```
┌─────────────────────────────────────┐
│ ← Back          Add Entry    [2/5]  │
├─────────────────────────────────────┤
│                                     │
│  Select Client                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Search clients...        │   │ ← Search Input
│  └─────────────────────────────┘   │
│                                     │
│  Recent Clients                     │ ← Section Header
│  ┌─────────────────────────────┐   │
│  │  Advent                     │   │ ← List Item
│  │  Last used: 2 days ago      │   │
│  ├─────────────────────────────┤   │
│  │  TechCorp Inc.              │   │
│  │  Last used: 1 week ago      │   │
│  ├─────────────────────────────┤   │
│  │  Global Solutions          │   │
│  │  Last used: 2 weeks ago     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     + Add New Client        │   │ ← Secondary Button
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │          Next               │   │ ← Primary Button
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Components

**Search Input:**
- Height: 48px
- Padding: 12px horizontal, with 40px left for icon
- Border: 1px solid Gray 300
- Border-radius: 12px (md)
- Background: White
- Placeholder: Gray 400
- Icon: Gray 400, 20px, positioned left
- Focus state: 2px Primary Blue border

**List Items:**
- Min height: 64px
- Padding: 16px
- Border-bottom: 1px solid Gray 200
- Background: White
- Active/Hover: Gray 50 background
- Client name: Body Large (18px), Gray 800, Semibold
- Last used: Caption (12px), Gray 500

**Add New Client Button:**
- Height: 48px
- Background: Gray 100
- Text: Gray 800, Button font
- Border-radius: 12px (md)
- Icon: Primary Blue, 20px
- Margin-top: 16px

**Validation:**
- Next button disabled (Gray 300 background) until client selected
- Selected client has Primary Blue checkmark on right

---

## Step 3: Description & Project

### Layout
```
┌─────────────────────────────────────┐
│ ← Back          Add Entry    [3/5]  │
├─────────────────────────────────────┤
│                                     │
│  Work Description                   │
│                                     │
│  Description *                      │ ← Label
│  ┌─────────────────────────────┐   │
│  │ Worked on PR #239, #189...  │   │ ← Text Area
│  │                             │   │
│  │                             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│  (150 characters)                   │ ← Character count
│                                     │
│  Project/Task # (Optional)          │
│  ┌─────────────────────────────┐   │
│  │ PR #239                     │   │ ← Text Input
│  └─────────────────────────────┘   │
│                                     │
│  Quick Templates:                   │
│  ┌─────────┬─────────┬─────────┐   │
│  │Development│Testing│ Meeting │   │ ← Chips
│  └─────────┴─────────┴─────────┘   │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │          Next               │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Components

**Description Text Area:**
- Min height: 120px
- Max height: 200px (scrollable after)
- Padding: 12px
- Border: 1px solid Gray 300
- Border-radius: 12px (md)
- Font: Body (16px)
- Background: White
- Focus: 2px Primary Blue border
- Max characters: 500
- Character counter: Caption (12px), Gray 500, below field

**Project/Task Input:**
- Height: 48px
- Padding: 12px horizontal
- Border: 1px solid Gray 300
- Border-radius: 12px (md)
- Optional indicator: "(Optional)" in Gray 400

**Quick Templates Chips:**
- Pre-filled description templates
- Tapping inserts template text into description field
- Same styling as previous chips

**Validation:**
- Description required (marked with *)
- Next button disabled until description has 3+ characters
- Real-time character count

---

## Step 4: Time Entry

### Layout
```
┌─────────────────────────────────────┐
│ ← Back          Add Entry    [4/5]  │
├─────────────────────────────────────┤
│                                     │
│  Enter Time                         │
│                                     │
│  Time Entry 1 *                     │
│  ┌──────────────┬──────────────┐   │
│  │  In Time     │  Out Time    │   │
│  ├──────────────┼──────────────┤   │
│  │    08:00     │    12:00     │   │ ← Time Pickers
│  └──────────────┴──────────────┘   │
│                                     │
│  Time Entry 2 (Optional)            │
│  ┌──────────────┬──────────────┐   │
│  │  In Time     │  Out Time    │   │
│  ├──────────────┼──────────────┤   │
│  │    13:00     │    17:00     │   │
│  └──────────────┴──────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  + Add Additional Time       │   │ ← Link Button
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    Total Hours: 8.00        │   │ ← Total Display
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │          Next               │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Components

**Time Picker Pairs:**
- Container: Card background (White), rounded-lg, padding 16px
- Each picker:
  - Width: 50% minus 8px gap
  - Height: 80px
  - Native iOS/Android time picker
  - Label above: Body Small (14px), Gray 700
  - Value: Heading 3 (20px), Gray 800, Semibold
  - Format: 24-hour or 12-hour based on device settings
  - Border: 1px solid Gray 300
  - Border-radius: 12px (md)
  - Tapping opens native time picker modal

**Add Additional Time:**
- Text button/link style
- Height: 40px
- Text: Primary Blue, Body (16px), Semibold
- Icon: Plus symbol, Primary Blue
- Margin-top: 16px

**Total Hours Display:**
- Prominent card
- Background: Primary Light (#3B82F6) 10% opacity
- Border: 2px solid Primary Blue
- Border-radius: 12px (md)
- Padding: 20px
- Text: "Total Hours:" Body (16px), Gray 700
- Value: Heading 2 (24px), Primary Blue, Bold
- Auto-calculated in real-time
- Margin: 24px top and bottom

**Validation:**
- At least one complete time entry pair required
- Out time must be after In time
- Overlapping times show warning icon
- Invalid entries show inline error: "Out time must be after In time" (Error color, Caption)

---

## Step 5: Review & Save

### Layout
```
┌─────────────────────────────────────┐
│ ← Back          Add Entry    [5/5]  │
├─────────────────────────────────────┤
│                                     │
│  Review Entry                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Date                       │   │
│  │  April 13, 2026        [Edit]│   │ ← Summary Card
│  ├─────────────────────────────┤   │
│  │  Client                     │   │
│  │  Advent                [Edit]│   │
│  ├─────────────────────────────┤   │
│  │  Description                │   │
│  │  Worked on PR #239...  [Edit]│   │
│  ├─────────────────────────────┤   │
│  │  Project/Task               │   │
│  │  PR #239               [Edit]│   │
│  ├─────────────────────────────┤   │
│  │  Time                       │   │
│  │  08:00 - 12:00         [Edit]│   │
│  │  13:00 - 17:00              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    Total Hours: 8.00        │   │ ← Total (same as Step 4)
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Save Time Entry        │   │ ← Primary Button
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Cancel                 │   │ ← Secondary Button
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Components

**Summary Card:**
- Background: White
- Border-radius: 16px (lg)
- Shadow: Level 2
- Each row:
  - Padding: 16px
  - Border-bottom: 1px solid Gray 200 (except last)
  - Label: Caption (12px), Gray 500, uppercase
  - Value: Body (16px), Gray 800
  - Edit link: Primary Blue, Caption (12px), right-aligned

**Edit Links:**
- Tapping navigates back to specific step
- Preserves all entered data

**Save Button:**
- Height: 48px
- Background: Success (#10B981)
- Text: White, Button font
- Border-radius: 12px (md)
- Icon: Checkmark, White, 20px

**Cancel Button:**
- Height: 48px
- Background: Gray 100
- Text: Gray 800, Button font
- Border-radius: 12px (md)
- Margin-top: 12px

---

## Interaction Patterns

### Navigation
- **Back button**: Returns to previous step, preserves data
- **Next button**: Validates current step, advances to next
- **Cancel**: Shows confirmation dialog, discards entry
- **Edit links**: Jumps to specific step, preserves all data

### Progress Indicator
- Shows current step out of total (e.g., [3/5])
- Updates automatically
- Provides sense of completion

### Auto-Save Draft
- All data saved to local storage after each step
- Restored if user closes app and returns
- Draft cleared after successful save or cancel

### Validation
- Real-time validation on each field
- Cannot proceed to next step with invalid data
- Clear error messages inline with fields

### Success Flow
- After save, show success toast
- Navigate to time entry list
- New entry highlighted at top

---

## Advantages

1. **Focused**: One decision at a time reduces cognitive load
2. **Clear Progress**: Users know exactly where they are in the process
3. **Forgiving**: Easy to go back and edit any step
4. **Mobile-Optimized**: Each screen fits nicely on mobile without scrolling
5. **Guided**: Perfect for new users or infrequent entries

## Disadvantages

1. **More Taps**: Requires 4+ screen transitions minimum
2. **Slower**: Takes longer than single-form approach
3. **Interruption**: Multi-step flow broken if user switches apps
4. **Redundant**: Experienced users may find it tedious

---

## Design System Compliance

- **Colors**: Uses Bento Box primary blues, grays, and semantic colors
- **Typography**: SF Pro Display/Text (iOS), Roboto (Android), proper hierarchy
- **Spacing**: Consistent 16px (md) padding, 8px (sm) gaps
- **Touch Targets**: All interactive elements minimum 44x44pt (iOS) / 48x48dp (Android)
- **Shadows**: Level 1 for top bar, Level 2 for cards
- **Border Radius**: 12px (md) for buttons/inputs, 16px (lg) for cards
- **Accessibility**: High contrast ratios, clear labels, proper heading hierarchy

---

## Implementation Notes

**Key Components Needed:**
- Native date picker wrapper
- Native time picker wrapper
- Multi-step form state management
- Auto-save to local storage
- Form validation hook

**Estimated Complexity:** Medium-High (multi-step state management)

**Best For:** New users, complex entries, guided experience

---

**Version**: 1.0  
**Created**: 2026-04-12  
**Task**: Task 3 - Add/Edit Time Entry Screen Design
