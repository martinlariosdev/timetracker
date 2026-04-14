# Variation B: Single Scroll Form

## Overview

A traditional single-page form where all fields are visible at once in a scrollable view. This approach is efficient for users who want to see the entire form at a glance and complete entries quickly without navigating between steps.

## Design Specification

### Layout
```
┌─────────────────────────────────────┐
│ ← Back          Add Entry       ︙  │ ← Top Bar
├─────────────────────────────────────┤
│                                     │
│  ╔═══════════════════════════════╗ │
│  ║   Total Hours: 0.00           ║ │ ← Sticky Total
│  ╚═══════════════════════════════╝ │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ DATE INFORMATION                ││ ← Section 1
│ │                                 ││
│ │ Date *                          ││
│ │ ┌─────────────────────────────┐││
│ │ │  📅  April 13, 2026         │││ ← Date Picker
│ │ └─────────────────────────────┘││
│ │                                 ││
│ │ Quick Select:                   ││
│ │ [Today] [Yesterday] [Tomorrow]  ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ CLIENT & PROJECT                ││ ← Section 2
│ │                                 ││
│ │ Client *                        ││
│ │ ┌─────────────────────────────┐││
│ │ │ 🔍 Search or select...      │││ ← Autocomplete
│ │ └─────────────────────────────┘││
│ │                                 ││
│ │ Description *                   ││
│ │ ┌─────────────────────────────┐││
│ │ │ Worked on PR #239, #189,    │││ ← Text Area
│ │ │ Review PR #1...             │││
│ │ │                             │││
│ │ └─────────────────────────────┘││
│ │ (150/500 characters)            ││
│ │                                 ││
│ │ Project/Task # (Optional)       ││
│ │ ┌─────────────────────────────┐││
│ │ │ PR #239                     │││ ← Text Input
│ │ └─────────────────────────────┘││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ TIME ENTRY                      ││ ← Section 3
│ │                                 ││
│ │ Entry 1 *                       ││
│ │ ┌──────────────┬──────────────┐││
│ │ │ In Time      │ Out Time     │││
│ │ │ 08:00        │ 12:00        │││
│ │ └──────────────┴──────────────┘││
│ │                                 ││
│ │ Entry 2 (Optional)              ││
│ │ ┌──────────────┬──────────────┐││
│ │ │ In Time      │ Out Time     │││
│ │ │ 13:00        │ 17:00        │││
│ │ └──────────────┴──────────────┘││
│ │                                 ││
│ │ ┌──────────────────────────┐   ││
│ │ │  + Add Another Time      │   ││ ← Add Button
│ │ └──────────────────────────┘   ││
│ └─────────────────────────────────┘│
│                                     │
│                                     │
│  [      Extra padding for scroll  ] │
│                                     │
└─────────────────────────────────────┘
│  ┌─────────────────────────────┐  │ ← Sticky Footer
│  │      Save Time Entry        │  │
│  └─────────────────────────────┘  │
│  Cancel                            │
└─────────────────────────────────────┘
```

---

## Components Breakdown

### Top Bar
**Specifications:**
- Height: 56px
- Background: White
- Shadow: Level 1
- Left: "← Back" button (Gray 600, 44x44pt touch target)
- Center: "Add Entry" title (H3, Semibold, Gray 800)
- Right: "︙" menu icon (Gray 600, 44x44pt touch target)
  - Menu options: "Duplicate Entry", "Clear Form"

---

### Sticky Total Hours Banner
**Specifications:**
- Position: Sticky to top, below nav bar
- Height: 64px
- Background: Gradient from Primary Blue (#2563EB) to Primary Light (#3B82F6)
- Border-radius: 0 (full width)
- Padding: 16px
- Text: "Total Hours:" (Body Small, White, 60% opacity)
- Value: Heading 1 (32px), White, Bold
- Shadow: Level 2
- Z-index: 10
- Updates in real-time as times change
- Smooth animation on value change (250ms ease-out)

**Behavior:**
- Always visible while scrolling
- Provides instant feedback on total time
- Color changes if validation error exists:
  - Valid: Primary Blue gradient
  - Error: Error (#EF4444) gradient

---

## Section 1: Date Information

### Container
**Specifications:**
- Background: White
- Border-radius: 16px (lg)
- Padding: 16px
- Margin: 16px horizontal, 12px top
- Shadow: Level 1
- Border: 1px solid Gray 200

### Section Header
- Text: "DATE INFORMATION" (Caption, Gray 500, Semibold, Uppercase, Letter-spacing: 0.5px)
- Margin-bottom: 16px

### Date Picker Field
**Specifications:**
- Label: "Date *" (Body Small, Gray 700, margin-bottom 8px)
- Height: 56px
- Padding: 16px
- Border: 1px solid Gray 300
- Border-radius: 12px (md)
- Background: White
- Icon: Calendar (📅), Gray 400, 20px, left side
- Text: Body Large (18px), Gray 800, Semibold
- Format: "April 13, 2026" (Full date format)
- Tap behavior: Opens native date picker modal

**States:**
- Default: Gray 300 border
- Focus: 2px Primary Blue border
- Error: 2px Error border, with error icon and message below
- Disabled: Gray 100 background, Gray 400 text

### Quick Select Chips
**Specifications:**
- Container: Flex row with 8px gap
- Margin-top: 12px
- Each chip:
  - Height: 36px
  - Padding: 8px horizontal (12px)
  - Border-radius: full (pill)
  - Border: 1px solid Gray 300
  - Background: White
  - Text: Body Small, Gray 600
  - Active state: Primary Blue background, White text
  - Tap: Fills date field with corresponding date

---

## Section 2: Client & Project

### Container
- Same card styling as Section 1
- Margin-top: 16px

### Section Header
- Text: "CLIENT & PROJECT"

### Client Autocomplete Field
**Specifications:**
- Label: "Client *" (Body Small, Gray 700, margin-bottom 8px)
- Height: 56px
- Padding: 16px, with 40px left for icon
- Border: 1px solid Gray 300
- Border-radius: 12px (md)
- Background: White
- Icon: Search (🔍), Gray 400, 20px, left side
- Placeholder: "Search or select..." (Gray 400)
- Text: Body (16px), Gray 800

**Behavior:**
- Typing shows dropdown of matching clients
- Dropdown appears below field with Level 3 shadow
- Dropdown items:
  - Height: 56px
  - Padding: 12px
  - Background: White
  - Hover: Gray 50
  - Border-bottom: 1px solid Gray 200
  - Shows client name (Body, Gray 800) and last used date (Caption, Gray 500)
- Maximum 5 suggestions shown
- "Add New Client" option at bottom with + icon

**States:**
- Default: Gray 300 border
- Focus: 2px Primary Blue border, dropdown visible
- Filled: Gray 800 text, checkmark icon on right
- Error: 2px Error border, error message below

### Description Text Area
**Specifications:**
- Label: "Description *" (Body Small, Gray 700, margin-bottom 8px)
- Min-height: 96px
- Max-height: 160px (scrollable)
- Padding: 12px
- Border: 1px solid Gray 300
- Border-radius: 12px (md)
- Background: White
- Font: Body (16px), Gray 800
- Line-height: 1.5
- Placeholder: "What did you work on?" (Gray 400)
- Character counter: Caption (12px), Gray 500, below field
- Format: "(150/500 characters)"

**Behavior:**
- Auto-expands as user types (up to max-height)
- Real-time character counter
- Validation: minimum 3 characters
- Shows warning at 450 characters (Orange text)
- Shows error at 500 characters (Error text, cannot type more)

**States:**
- Default: Gray 300 border
- Focus: 2px Primary Blue border
- Error: 2px Error border, error message below

### Project/Task Number Field
**Specifications:**
- Label: "Project/Task # (Optional)" (Body Small, Gray 700, margin-bottom 8px)
- Height: 48px
- Padding: 12px horizontal
- Border: 1px solid Gray 300
- Border-radius: 12px (md)
- Background: White
- Placeholder: "e.g., PR #239" (Gray 400)
- Text: Body (16px), Gray 800

---

## Section 3: Time Entry

### Container
- Same card styling as previous sections
- Margin-top: 16px
- Margin-bottom: 120px (space for sticky footer)

### Section Header
- Text: "TIME ENTRY"

### Time Entry Pair
**Specifications:**
- Container: Flex row with 12px gap
- Margin-bottom: 16px
- Each time picker:
  - Width: 50% minus 6px
  - Label: "In Time" / "Out Time" (Body Small, Gray 700, margin-bottom 8px)
  - Height: 80px
  - Padding: 12px
  - Border: 1px solid Gray 300
  - Border-radius: 12px (md)
  - Background: White
  - Icon: Clock, Gray 400, 16px
  - Time value: Heading 3 (20px), Gray 800, Semibold
  - Format: "08:00" or "8:00 AM" based on device settings
  - Tap: Opens native time picker modal

**Entry 1 (Required):**
- Label: "Entry 1 *" above the pair
- Cannot be removed

**Entry 2+ (Optional):**
- Label: "Entry 2 (Optional)" above the pair
- Shows remove icon (X) on right side of label
- Tapping X removes this entry pair with confirmation

**Validation:**
- Out time must be after In time
- Entries cannot overlap
- Real-time validation with inline errors
- Error message: Caption (12px), Error color, below invalid field
- Examples:
  - "Out time must be after In time"
  - "This time overlaps with Entry 1"

### Add Another Time Button
**Specifications:**
- Height: 48px
- Width: Full width
- Background: Transparent
- Border: 1px dashed Primary Blue
- Border-radius: 12px (md)
- Text: "+ Add Another Time" (Body, Primary Blue, Semibold)
- Icon: Plus, Primary Blue, 20px, left side
- Margin-top: 16px
- Tap: Adds new time entry pair below
- Maximum: 4 time entry pairs allowed

---

## Sticky Footer

### Container
**Specifications:**
- Position: Fixed to bottom
- Height: 100px (includes safe area padding)
- Background: White
- Shadow: Level 3 (inverted, shadow on top)
- Padding: 16px horizontal, 12px vertical
- Safe area: Respects bottom inset (iOS home indicator)
- Z-index: 20

### Save Button
**Specifications:**
- Height: 48px
- Width: Full width
- Background: Primary Blue (#2563EB)
- Text: "Save Time Entry" (Button font, White)
- Border-radius: 12px (md)
- Shadow: Level 2
- Icon: Checkmark, White, 20px, left side
- Margin-bottom: 8px

**States:**
- Default: Primary Blue
- Hover/Press: Primary Dark (#1E40AF)
- Disabled: Gray 300 background, Gray 500 text (when form invalid)
- Loading: Shows spinner, text changes to "Saving..."

### Cancel Link
**Specifications:**
- Height: 32px
- Text: "Cancel" (Body Small, Gray 600, Center-aligned)
- Tap: Shows confirmation dialog if form has data
- No background or border

---

## Validation & Error Handling

### Real-Time Validation
- All required fields validated on blur (when user leaves field)
- Inline error messages appear directly below invalid field
- Error icon (exclamation in circle) shown in field on right
- Error text: Caption (12px), Error color (#EF4444)

### Required Field Indicators
- Asterisk (*) in label for required fields
- Missing required fields highlighted on save attempt

### Form-Level Validation
- Save button disabled until all required fields valid
- Scroll to first error on save attempt if validation fails
- Toast notification for successful save

### Error Messages
- **Date**: "Please select a date"
- **Client**: "Please select or add a client"
- **Description**: "Description must be at least 3 characters"
- **Time In/Out**: "Out time must be after In time"
- **Overlapping Times**: "This time overlaps with Entry [X]"
- **Generic**: "Please fix the errors above before saving"

---

## Interaction Patterns

### Scrolling Behavior
- Smooth scrolling throughout
- Sticky total banner remains visible
- Sticky footer remains visible
- Content scrolls between banner and footer
- Keyboard appears: form scrolls to show focused field

### Auto-Save Draft
- All field changes saved to local storage every 2 seconds
- Draft restored if user navigates away and returns
- Draft indicator: Small text at top "Draft saved 2 min ago"
- Draft cleared after successful save or user cancels

### Keyboard Handling
- Keyboard type matches field:
  - Date: Date picker modal
  - Client: Text keyboard with autocomplete
  - Description: Text keyboard
  - Project: Alphanumeric keyboard
  - Times: Time picker modal
- Next/Done buttons in keyboard toolbar
- Return key: moves to next field or closes keyboard

### Loading States
- Save button shows spinner while submitting
- Form fields disabled during save
- Success: Toast notification, navigate to list
- Error: Toast notification with retry option

---

## Advantages

1. **Efficient**: All fields visible at once, no navigation needed
2. **Familiar**: Standard form pattern users understand
3. **Overview**: Easy to see what's filled and what's missing
4. **Quick**: Fastest method for experienced users
5. **Flexible**: Can fill fields in any order

## Disadvantages

1. **Overwhelming**: Lots of fields on screen at once
2. **Scrolling Required**: Cannot see entire form on small screens
3. **Less Guided**: No step-by-step flow for new users
4. **Validation Complexity**: All validations visible simultaneously

---

## Design System Compliance

- **Colors**: Full Bento Box palette (Primary Blues, Grays, Semantic colors)
- **Typography**: Proper hierarchy from Caption (12px) to Heading 1 (32px)
- **Spacing**: Consistent 16px sections, 12px fields, 8px internal
- **Touch Targets**: All interactive elements minimum 44x44pt (iOS) / 48x48dp (Android)
- **Shadows**: Level 1 (cards), Level 2 (buttons), Level 3 (footer)
- **Border Radius**: 12px inputs/buttons, 16px cards, full pills
- **Accessibility**: WCAG AA contrast, semantic labels, proper focus order
- **Cards**: White background, rounded-lg, Level 1 shadow, grouped sections

---

## Responsive Considerations

### Small Screens (iPhone SE, 375px)
- Reduce padding to 12px
- Reduce time picker font size to Heading 4 (18px)
- Two-column time pickers remain side-by-side

### Large Screens (iPhone 14 Pro Max, 430px)
- Standard padding (16px)
- Consider wider date picker
- More breathing room between sections

### Tablet (iPad mini, 768px)
- Form max-width: 600px, centered
- Wider time pickers
- More visible without scrolling

---

## Implementation Notes

**Key Components Needed:**
- Sticky header component
- Sticky footer component
- Native date picker wrapper
- Native time picker wrapper
- Autocomplete dropdown component
- Form validation hook
- Auto-save to local storage hook
- Dynamic time entry array management

**Estimated Complexity:** Medium (form validation + sticky elements)

**Best For:** Experienced users, quick entries, desktop-like experience on mobile

---

**Version**: 1.0  
**Created**: 2026-04-12  
**Task**: Task 3 - Add/Edit Time Entry Screen Design
