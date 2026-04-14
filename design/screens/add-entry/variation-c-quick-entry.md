# Variation C: Quick Entry (Smart Defaults + Expandable)

## Overview

A streamlined, intelligent form that prioritizes speed with smart defaults and progressive disclosure. The form starts minimal with only essential fields, then expands to show advanced options when needed. Perfect for users who frequently enter similar time entries.

## Design Specification

### Default View (Collapsed)

```
┌─────────────────────────────────────┐
│ ✕                           Quick Add│ ← Modal-style header
├─────────────────────────────────────┤
│                                     │
│       ┌─────────────────┐          │
│       │  April 13, 2026  │          │ ← Large Date Selector
│       │    Saturday      │          │
│       └─────────────────┘          │
│                                     │
│  ┌──────┬──────┬──────┬──────┐    │
│  │  12  │  13  │  14  │  15  │    │ ← Week Strip
│  │ Thu  │ Fri  │ Sat  │ Sun  │    │
│  └──────┴──────┴──────┴──────┘    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔖 Advent                   │   │ ← Last Used Client
│  └─────────────────────────────┘   │
│                                     │
│  ┌──────────────┬──────────────┐   │
│  │ 08:00        │ 17:00        │   │ ← Quick Time Entry
│  │ In Time      │ Out Time     │   │
│  └──────────────┴──────────────┘   │
│                                     │
│  ╔═══════════════════════════════╗ │
│  ║    8.0 hours                  ║ │ ← Calculated Total
│  ╚═══════════════════════════════╝ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   📋 Duplicate Yesterday    │   │ ← Smart Action
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       Quick Save            │   │ ← Primary Action
│  └─────────────────────────────┘   │
│                                     │
│  More Details ▼                     │ ← Expandable Trigger
│                                     │
└─────────────────────────────────────┘
```

### Expanded View (Full Form)

```
┌─────────────────────────────────────┐
│ ✕                       Add Entry   │
├─────────────────────────────────────┤
│                                     │
│       ┌─────────────────┐          │
│       │  April 13, 2026  │          │
│       │    Saturday      │          │
│       └─────────────────┘          │
│                                     │
│  ┌──────┬──────┬──────┬──────┐    │
│  │  12  │  13  │  14  │  15  │    │
│  │ Thu  │ Fri  │ Sat  │ Sun  │    │
│  └──────┴──────┴──────┴──────┘    │
│                                     │
│  Client                             │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Advent               ✓   │   │ ← Editable Client
│  └─────────────────────────────┘   │
│                                     │
│  Description *                      │
│  ┌─────────────────────────────┐   │
│  │ Worked on PR #239, #189... │   │ ← Full Description
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Project/Task #                     │
│  ┌─────────────────────────────┐   │
│  │ PR #239                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Time Entry 1                       │
│  ┌──────────────┬──────────────┐   │
│  │ 08:00        │ 12:00        │   │
│  │ In Time      │ Out Time     │   │
│  └──────────────┴──────────────┘   │
│                                     │
│  Time Entry 2                       │
│  ┌──────────────┬──────────────┐   │
│  │ 13:00        │ 17:00        │   │
│  │ In Time      │ Out Time     │   │
│  └──────────────┴──────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  + Add Another Time         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ╔═══════════════════════════════╗ │
│  ║    8.0 hours                  ║ │
│  ╚═══════════════════════════════╝ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       Save Entry            │   │
│  └─────────────────────────────┘   │
│                                     │
│  Less Details ▲                     │
│                                     │
└─────────────────────────────────────┘
```

---

## Components Breakdown

### Modal Header
**Specifications:**
- Height: 56px
- Background: White
- Border-bottom: 1px solid Gray 200
- Shadow: Level 1
- Left: "✕" close button (Gray 600, 44x44pt touch target)
- Right: "Quick Add" or "Add Entry" title (H4, Semibold, Gray 800)
- Transition: Title changes based on collapsed/expanded state

---

## Collapsed View Components

### Large Date Selector
**Specifications:**
- Height: 96px
- Padding: 20px
- Background: Gradient from Primary Blue (#2563EB) to Primary Light (#3B82F6)
- Border-radius: 16px (lg)
- Shadow: Level 2
- Margin: 16px horizontal, 16px top
- Date: Heading 2 (24px), White, Bold
- Day of week: Body (16px), White, 70% opacity
- Tap: Opens native date picker modal
- Animation: Subtle scale on tap (0.98)

**Behavior:**
- Defaults to today's date
- Tapping opens full-screen native date picker
- Selected date highlighted with primary color
- Smooth transition when date changes

### Week Strip
**Specifications:**
- Container: Flex row with 8px gap
- Margin: 16px horizontal, 12px top
- Each day card:
  - Width: 25% minus 6px
  - Height: 64px
  - Padding: 8px
  - Border-radius: 12px (md)
  - Border: 1px solid Gray 200
  - Background: White
  - Day number: Heading 4 (18px), Gray 800, Semibold
  - Day name: Caption (12px), Gray 500
  - Selected state: Primary Blue background, White text, no border
  - Shadow: Level 1 when selected

**Behavior:**
- Shows current week (today ±3 days)
- Scrollable horizontally if needed
- Tapping a day updates the main date selector
- Today has subtle Primary Light background if not selected
- Smooth animation on selection (150ms)

### Last Used Client Card
**Specifications:**
- Height: 56px
- Padding: 16px
- Border-radius: 12px (md)
- Background: Gray 50
- Border: 1px solid Gray 200
- Margin: 16px horizontal, 12px top
- Icon: Bookmark (🔖), Primary Blue, 20px, left side
- Text: Client name (Body Large, Gray 800, Semibold)
- Subtext: "Last used today" (Caption, Gray 500, below name)
- Tap: Opens client selector (same as expanded mode)

**Behavior:**
- Auto-populates with most recently used client
- If first-time user, shows "+ Select Client" prompt
- Subtle pulse animation on first appearance
- Checkmark icon on right if confirmed

### Quick Time Entry
**Specifications:**
- Container: Card with rounded-lg (16px), padding 16px
- Background: White
- Border: 1px solid Gray 300
- Shadow: Level 1
- Margin: 16px horizontal, 12px top
- Flex row with 12px gap
- Each time field:
  - Width: 50% minus 6px
  - Height: 72px
  - Time value: Heading 3 (20px), Primary Blue, Bold
  - Label: "In Time" / "Out Time" (Caption, Gray 500, below value)
  - Tap: Opens time picker modal

**Smart Defaults:**
- In Time: Defaults to 08:00 or last entry's in time
- Out Time: Defaults to 17:00 or last entry's out time
- Automatically calculates common work hours
- If "Duplicate Yesterday" used, copies exact times

**States:**
- Default: Gray 300 border
- Focus: 2px Primary Blue border on entire container
- Invalid: 2px Error border, shake animation

### Calculated Total Banner
**Specifications:**
- Height: 64px
- Padding: 16px
- Background: Gray 50
- Border: 2px solid Primary Blue
- Border-radius: 12px (md)
- Margin: 16px horizontal, 16px top
- Text: Hours value (Heading 2, 24px, Primary Blue, Bold, Center-aligned)
- Subtext: "hours" (Body Small, Gray 600, Center-aligned)
- Animation: Number animates on change (spring effect)
- Icon: Clock, Primary Blue, 20px, left of value

**Behavior:**
- Real-time calculation as times change
- Smooth number transition animation
- Color changes based on validation:
  - Valid: Primary Blue
  - Warning (<4 hours): Warning Orange
  - Error (invalid times): Error Red

### Duplicate Yesterday Button
**Specifications:**
- Height: 48px
- Width: Full width minus 32px margin
- Background: Secondary Cyan (#0EA5E9)
- Border-radius: 12px (md)
- Text: "📋 Duplicate Yesterday" (Body, White, Semibold)
- Icon: Clipboard, White, 20px, left side
- Shadow: Level 1
- Margin: 12px top

**Behavior:**
- Tapping copies previous day's:
  - Client
  - Description
  - Project/Task #
  - All time entries
- Only date remains as selected date
- Shows toast: "Copied from April 12"
- Disabled if no previous entries exist (Gray 300 background, Gray 500 text)
- Smooth pulse animation on tap

### Quick Save Button
**Specifications:**
- Height: 56px
- Width: Full width minus 32px margin
- Background: Success (#10B981)
- Border-radius: 12px (md)
- Text: "Quick Save" (Button font, White, Bold)
- Icon: Checkmark, White, 24px, left side
- Shadow: Level 2
- Margin: 16px top

**States:**
- Default: Success Green
- Press: Darker green (#059669)
- Disabled: Gray 300 background (when missing required fields)
- Loading: Spinner replaces icon, text "Saving..."

**Behavior:**
- In collapsed mode: Saves with minimal required fields
  - Date (from selector)
  - Client (last used)
  - Description (auto-generated: "Work on [date]" if empty)
  - Times (from quick entry)
- Validation: Shows inline errors if times invalid
- Success: Toast notification, closes modal, returns to list
- Error: Toast with error message, form remains open

### More Details Trigger
**Specifications:**
- Height: 44px
- Text: "More Details" (Body, Primary Blue, Semibold, Center-aligned)
- Icon: Chevron down (▼), Primary Blue, 16px, right side
- Background: Transparent
- Tap area: Full width
- Margin: 8px top, 16px bottom

**Behavior:**
- Tapping expands form to full mode
- Smooth animation: grows from collapsed to expanded (400ms ease-out)
- Chevron rotates 180° on expansion
- Text changes to "Less Details ▲" in expanded mode
- State preserved: all entered data remains

---

## Expanded View Components

### Client Field (Expanded)
**Specifications:**
- Label: "Client" (Body Small, Gray 700, margin-bottom 8px)
- Height: 56px
- Padding: 16px, with 40px left for icon
- Border: 1px solid Gray 300
- Border-radius: 12px (md)
- Background: White
- Icon: Search (🔍), Gray 400, 20px, left side
- Text: Body (16px), Gray 800
- Checkmark: Primary Blue, 20px, right side (when selected)
- Margin: 16px horizontal, 12px top

**Behavior:**
- Same autocomplete as Variation B
- Pre-filled with last used client from collapsed view
- Tapping opens autocomplete dropdown
- Can change client in expanded mode

### Description Field (Expanded)
**Specifications:**
- Label: "Description *" (Body Small, Gray 700, margin-bottom 8px)
- Min-height: 96px
- Max-height: 160px
- Padding: 12px
- Border: 1px solid Gray 300
- Border-radius: 12px (md)
- Background: White
- Placeholder: "What did you work on?" (Gray 400)
- Character counter: "(0/500)" below field (Caption, Gray 500)

**Smart Defaults:**
- If duplicated: Shows previous entry's description
- If quick save: Auto-generates "Work on [date]"
- User can edit freely in expanded mode

### Project/Task Field (Expanded)
**Specifications:**
- Label: "Project/Task #" (Body Small, Gray 700, margin-bottom 8px)
- Height: 48px
- Padding: 12px
- Border: 1px solid Gray 300
- Border-radius: 12px (md)
- Background: White
- Placeholder: "e.g., PR #239" (Gray 400)
- Optional field (no asterisk)

### Time Entries (Expanded)
**Specifications:**
- Shows all time entry pairs
- Same styling as Variation B
- Default: Shows Entry 1 (from quick entry)
- If user taps "Add Another Time" in collapsed mode, shows in expanded
- Full functionality: add, remove, validate multiple entries

### Add Another Time (Expanded)
- Same as Variation B
- Dashed border button
- Adds new time entry pair

### Save Entry Button (Expanded)
**Specifications:**
- Same as Quick Save button
- Text changes to "Save Entry" (not "Quick Save")
- Still Success Green color
- Validates all expanded fields before saving

---

## Smart Features & Intelligence

### Auto-Fill Logic

**Client:**
1. Last used client from previous entries
2. Most frequent client this week
3. If no history, prompt to select

**Times:**
1. Last entry's times if today
2. Common work hours (08:00-17:00) if no recent entries
3. Smart rounding to nearest 15 minutes

**Description:**
- If duplicated: Exact copy from previous entry
- If quick save: "Work on [client name] - [date]"
- Template suggestions based on client history

### Duplicate Yesterday

**Logic:**
1. Fetches most recent entry (yesterday preferred, or last entry)
2. Copies all fields except date
3. Shows confirmation toast with source date
4. User can still edit before saving
5. Button disabled if no previous entries exist

**States:**
- Available: Secondary Cyan background, full opacity
- Unavailable: Gray 300 background, Gray 500 text, no shadow
- Hover/Press: Darker cyan (#0284C7)

### Validation Intelligence

**Real-Time:**
- Out time must be after In time
- Times cannot overlap
- Total hours warning if <2 or >12
- Client required (auto-filled or selected)
- Description required for full save (optional for quick save)

**Smart Warnings:**
- "This seems like a short day (2 hours). Is this correct?"
- "You've entered 12+ hours. Double-check times."
- "Times overlap with Entry 1. Adjust Entry 2."

---

## Interaction Patterns

### Expansion Animation
**Collapsed → Expanded:**
- Duration: 400ms
- Easing: ease-out
- Height grows from 480px to ~800px
- New fields fade in sequentially (50ms stagger)
- Chevron rotates 180°
- Title changes from "Quick Add" to "Add Entry"

**Expanded → Collapsed:**
- Duration: 300ms
- Easing: ease-in
- Height shrinks
- Extra fields fade out simultaneously
- Data preserved in state
- Chevron rotates back

### Keyboard Handling
- Tapping any field opens appropriate input:
  - Date: Native date picker modal
  - Times: Native time picker modal
  - Client: Autocomplete dropdown
  - Text fields: Keyboard with suggestions
- Keyboard toolbar: Previous/Next/Done buttons
- Dismissing keyboard: Tap outside or Done

### Touch Feedback
- All buttons: Scale to 0.96 on press (150ms)
- Time fields: Subtle highlight on tap
- Client card: Gray 100 background on press
- Week strip days: Scale to 0.94 on tap

### Loading & Success States
**Saving:**
- Button shows spinner
- Form fields disabled (Gray 100 background)
- Duration: Usually <1 second

**Success:**
- Success toast: "Time entry saved!"
- Confetti animation (optional, 500ms)
- Modal closes automatically (300ms delay)
- User returns to list with new entry highlighted

**Error:**
- Error toast: "Failed to save. Try again."
- Form remains open with data intact
- Retry button in toast

---

## Progressive Disclosure Strategy

### Why Collapsed First?
- Reduces friction for common entries
- Shows only essential fields
- Leverages smart defaults
- Faster completion for experienced users

### When to Expand?
- User taps "More Details"
- Validation error requires description
- User needs multiple time entries
- User wants to change client
- Editing existing entry (opens expanded)

### What's Hidden?
- Full description field (uses auto-generated in quick mode)
- Project/Task number (optional field)
- Multiple time entries (shows only one pair)
- Client selection (uses last used)

---

## Advantages

1. **Fastest**: Minimal fields for common entries
2. **Intelligent**: Smart defaults reduce typing
3. **Flexible**: Expands when needed without losing data
4. **Modern**: Progressive disclosure pattern
5. **Visual**: Large date selector and total hours prominent
6. **Duplicate**: One-tap duplication saves time

## Disadvantages

1. **Learning Curve**: Users must discover expansion
2. **Hidden Fields**: Not all options visible initially
3. **Assumptions**: Smart defaults might be wrong
4. **Complexity**: Two modes to maintain in code
5. **Trust**: Users must trust auto-generated descriptions

---

## Design System Compliance

- **Colors**: Full Bento Box palette with gradients
- **Typography**: Proper hierarchy (Caption to Heading 2)
- **Spacing**: Consistent 16px, 12px, 8px rhythm
- **Touch Targets**: All interactive elements ≥44pt/48dp
- **Shadows**: Level 1 (cards), Level 2 (buttons, date selector)
- **Border Radius**: 12px inputs/buttons, 16px cards
- **Animations**: Timing follows guidelines (150-400ms)
- **Accessibility**: Maintains contrast ratios, semantic labels
- **Cards**: White backgrounds with proper shadows
- **Progressive Disclosure**: Shows complexity only when needed

---

## Accessibility Considerations

### Screen Reader Support
- "Quick Add mode, collapsed. Tap More Details to expand form."
- Date selector announces: "Date selector, currently April 13, 2026"
- Week strip announces: "Week selector, Saturday April 13 selected"
- Time fields announce: "In time, 8 AM. Out time, 5 PM. Total 8 hours."
- Expansion announces: "Form expanded, additional fields available"

### Dynamic Type Support
- All text scales with system font size settings
- Layout adjusts to prevent overlap at 200% zoom
- Minimum touch targets maintained

### Color Contrast
- All text meets WCAG AA standards
- Error states use both color and icons
- Week strip selection uses background + border (not just color)

---

## Responsive Considerations

### Small Screens (iPhone SE, 375px)
- Week strip shows 4 days max
- Horizontal scroll for additional days
- Date selector height: 80px (reduced)
- Time fields remain side-by-side

### Large Screens (iPhone 14 Pro Max, 430px)
- Week strip shows 5 days
- Date selector height: 96px (standard)
- More comfortable spacing

### Tablet (iPad mini, 768px)
- Form max-width: 500px, centered
- Week strip shows 7 days (full week)
- Larger date selector (120px height)
- Side-by-side layout possible in expanded mode

---

## Implementation Notes

**Key Components Needed:**
- Expandable container with smooth animation
- Native date picker wrapper
- Native time picker wrapper
- Week strip with horizontal scroll
- Autocomplete dropdown
- Smart defaults calculation logic
- Duplicate entry function
- Real-time total hours calculation
- Form state management (collapsed/expanded)
- Local storage for draft auto-save

**Estimated Complexity:** High (animation + smart logic + dual modes)

**Best For:** Frequent users, repetitive entries, speed-focused workflows

**Technical Challenges:**
- Smooth expansion animation on mobile
- Maintaining state between collapsed/expanded
- Smart default logic
- Performance with real-time calculations

---

## Edit Mode Behavior

When editing an existing entry (tapping edit from list):
- Opens in expanded mode (not collapsed)
- All fields pre-filled with existing data
- "Quick Save" button text changes to "Update Entry"
- "Duplicate Yesterday" button hidden
- Additional action: "Duplicate This Entry" button (creates new entry with same data, different date)

---

**Version**: 1.0  
**Created**: 2026-04-12  
**Task**: Task 3 - Add/Edit Time Entry Screen Design
