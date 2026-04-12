# Variation B: Card-Based (Bento Box Style)

## Overview

A modern, card-based settings interface that fully embraces the Bento Box design system. Each major settings category lives in its own prominent card with visual icons and clear hierarchy. More visual, more playful, with progressive disclosure to prevent overwhelm.

## Design Specification

### Screen Layout
```
┌─────────────────────────────────────┐
│          Settings                   │ ← Top Bar
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  👤  Martin Larios          │   │
│  │     martin@example.com      │   │ ← Profile Card
│  │     Software Engineer       │   │   (Gradient bg)
│  │                         →   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌──────────────┬──────────────┐   │
│  │     🔔       │      🌙      │   │
│  │              │              │   │ ← Quick Toggle Cards
│  │Notifications │  Dark Mode   │   │   (2 columns)
│  │   [  ON  ]   │   [ OFF  ]   │   │
│  └──────────────┴──────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ⚙️  Preferences            │   │
│  │                             │   │
│  │  Work Hours    8hrs/day  →  │   │ ← Category Card
│  │  Time Format   12-hour   →  │   │   (Multiple items)
│  │  Language      English   →  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💰  ETO Reminders          │   │
│  │                             │   │
│  │  Balance Alerts     [ON]    │   │ ← Category Card
│  │  Time Off Reminders         │   │
│  │  • 1 day before       [✓]   │   │
│  │  • 3 days before      [ ]   │   │
│  │  • Every 3 days       [ ]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌──────────────┬──────────────┐   │
│  │     🔒       │      📱      │   │
│  │              │              │   │ ← Action Cards
│  │   Change     │  Connected   │   │   (2 columns)
│  │   Password   │   Devices    │   │
│  │      →       │      →       │   │
│  └──────────────┴──────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ❓  Help & Support         │   │
│  │                             │   │
│  │  Help Center            →   │   │ ← Category Card
│  │  Contact Support        →   │   │
│  │  Rate App               →   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       🚪 Logout             │   │ ← Logout Card
│  └─────────────────────────────┘   │
│                                     │
│  Version 1.0.0 (Build 42)           │ ← App Info
│                                     │
│  ┌─────────────────────────────┐   │
│  │   🗑️ Delete Account         │   │ ← Destructive Card
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## Components

### Top Bar
- Height: 56px
- Background: White
- Title: "Settings" (H3, Semibold, Gray 800)
- Center-aligned
- Shadow: Level 1

### Profile Card
- Background: Gradient (Primary Blue to Secondary Cyan)
- Border-radius: 20px (xl)
- Padding: 24px
- Shadow: Level 2
- Margin: 16px
- Tap: Opens profile editing

**Profile Content:**
- Avatar: 56x56px, circular, White border (2px), top-left
- Name: H3 (20px), Semibold, White
- Email: Body Small (14px), White 85% opacity
- Role: Caption (12px), White 75% opacity
- Chevron: White, 20px, right-aligned

### Quick Toggle Cards (2-column grid)
- Background: White
- Border-radius: 16px (lg)
- Padding: 20px
- Shadow: Level 1
- Margin: 0 8px (left card), 8px (gap between), 8px (right card)
- Height: 120px (equal height)

**Toggle Card Content:**
- Icon: 32px, centered at top, Primary Blue
- Label: Body (16px), Semibold, Gray 800, centered below icon
- Toggle: iOS-style switch, centered at bottom
- Margin: 8px between icon, label, toggle

### Category Cards (single column)
- Background: White
- Border-radius: 16px (lg)
- Padding: 20px
- Shadow: Level 2
- Margin: 16px horizontal, 8px vertical
- Tap (on items): Opens sub-screen or expands

**Category Header:**
- Icon: 24px, Primary Blue, left-aligned
- Title: H4 (18px), Semibold, Gray 800
- Margin-bottom: 16px

**Category Items:**
- Height: 44px minimum
- Padding: 8px vertical
- Border-top: 1px solid Gray 100 (except first)

**Item Structure:**
- Label: Body (16px), Gray 700, left-aligned
- Value: Body Small (14px), Gray 500, right-aligned OR toggle/checkbox
- Chevron: Gray 400, 16px (for navigation items)
- Bullet point: Gray 400, 6px circle (for sub-items like ETO reminder options)

### Action Cards (2-column grid)
- Background: White
- Border-radius: 16px (lg)
- Padding: 20px
- Shadow: Level 1
- Margin: 0 8px (left card), 8px (gap between), 8px (right card)
- Height: 100px (equal height)
- Tap: Navigates to sub-screen

**Action Card Content:**
- Icon: 32px, centered at top, Primary Blue
- Label: Body (16px), Semibold, Gray 800, centered
- Sublabel: Caption (12px), Gray 500, centered (optional)
- Chevron: Gray 400, 16px, centered at bottom
- Active state: Gray 50 background

### Logout Card
- Background: Primary Blue
- Border-radius: 12px (md)
- Padding: 16px vertical
- Shadow: Level 1
- Margin: 16px horizontal, 24px top
- Tap: Shows confirmation alert

**Logout Content:**
- Icon: Door icon, White, 20px, left of text
- Text: Body (16px), Semibold, White, centered
- Active state: Primary Dark background

### Delete Account Card
- Background: Transparent
- Border: 2px solid Error color (#EF4444)
- Border-radius: 12px (md)
- Padding: 16px vertical
- Margin: 16px
- Tap: Shows strong confirmation

**Delete Content:**
- Icon: Trash icon, Error color, 20px, left of text
- Text: Body (16px), Semibold, Error color, centered
- Active state: Error background (10% opacity)

### App Version
- Text: Caption (12px), Gray 400
- Center-aligned
- Padding: 8px vertical
- Margin: 16px top

---

## Interaction Patterns

### Profile Card
- **Tap anywhere**: Opens profile editing screen
- **Smooth transition**: Card expands to full screen
- **Edit fields**: Name, email, role, photo
- **Save button**: Top-right, "Done"

### Quick Toggle Cards
- **Tap card background**: Toggles the setting (entire card is tappable)
- **Tap toggle directly**: Also toggles the setting
- **Visual feedback**: Card pulses briefly on toggle
- **Auto-save**: Changes persist immediately
- **Animation**: Toggle switch animates 250ms

### Notifications Toggle
- **Toggles on**: Prompts for notification permissions (if not granted)
- **iOS**: Shows system permission dialog
- **Android**: Shows system permission dialog
- **Toggles off**: Disables in-app notifications

### Dark Mode Toggle
- **Toggles on**: Immediately switches to dark theme
- **Toggles off**: Immediately switches to light theme
- **Smooth transition**: Colors animate over 300ms
- **Persists**: Setting saved to user preferences

### Category Cards
- **Tap item with chevron**: Opens sub-screen for that setting
- **Tap toggle/checkbox**: Changes setting immediately
- **Tap card header**: Opens expanded view with all category settings (if collapsed)

### Preferences Category Items
- **Work Hours**: Opens work hours configuration screen
- **Time Format**: Opens time format selection (12h/24h)
- **Language**: Opens language selection

### ETO Reminders Category
- **Balance Alerts toggle**: Enables/disables ETO balance notifications
- **Checkbox items**: Multi-select reminder frequencies
- **Changes save immediately**: No confirmation needed

### Action Cards
- **Tap Change Password**: Opens password change screen
- **Tap Connected Devices**: Shows list of logged-in devices
- **Visual feedback**: Card scales down slightly (0.98) on press
- **Animation**: 150ms ease-in-out

### Help & Support Category
- **Help Center**: Opens in-app browser or native help
- **Contact Support**: Opens email composer
- **Rate App**: Opens platform rating dialog

### Logout Card
- **Tap**: Shows confirmation alert
- **Alert**: "Are you sure you want to logout?"
- **Confirm**: Clears session, returns to login

### Delete Account Card
- **Tap**: Shows strong confirmation modal
- **Modal**: Requires typing "DELETE" to confirm
- **Confirm**: Permanently deletes account and data

### Pull to Refresh
- **Swipe down**: Refreshes settings from server
- **Shows spinner**: While loading
- **Updates values**: If any settings changed on other devices

---

## Expanded View Example (Optional Enhancement)

When tapping "Preferences" card header, it could expand in-place:

```
┌─────────────────────────────────────┐
│  ⚙️  Preferences                    │
│                                     │
│  Work Hours                         │
│  ┌─────────────────────────────┐   │
│  │ Default: 8 hrs/day          │   │
│  │ Monday-Friday: 8 hrs        │   │
│  │ Weekend: 0 hrs              │   │
│  │                         →   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Time Format                        │
│  ┌─────────────────────────────┐   │
│  │ ⦿ 12-hour (3:30 PM)         │   │
│  │ ○ 24-hour (15:30)           │   │
│  └─────────────────────────────┘   │
│                                     │
│  Language                           │
│  ┌─────────────────────────────┐   │
│  │ ⦿ English                   │   │
│  │ ○ Español                   │   │
│  │ ○ Français                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Save Changes           │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Advantages

1. **Visual Appeal**: Cards create visual interest and modern aesthetic
2. **Bento Box Alignment**: Fully embraces the design system
3. **Progressive Disclosure**: Categories can collapse/expand to reduce overwhelm
4. **Quick Actions**: Most common toggles (Notifications, Dark Mode) are immediately accessible
5. **Touch-Friendly**: Large card targets are easy to tap
6. **Scannable**: Clear grouping with visual icons
7. **Less Overwhelming**: Grouped into digestible chunks
8. **Flexible**: Cards can be reordered or personalized
9. **Delightful**: More playful and engaging than traditional list

## Disadvantages

1. **More Scrolling**: Cards take more vertical space than list items
2. **Less Dense**: Fewer settings visible at once
3. **Inconsistent with Platform**: Doesn't match native iOS/Android settings patterns
4. **More Complex**: Cards with mixed content types (toggles, navigation, checkboxes)
5. **Implementation Complexity**: More custom components vs platform defaults

---

## Design System Compliance

- **Colors**: Bento Box primary blues, grays, semantic colors
- **Typography**: SF Pro Display/Text (iOS), Roboto (Android)
- **Spacing**: 16px (md) padding, 8px gaps between cards
- **Touch Targets**: All interactive elements minimum 44x44pt / 48x48dp
- **Shadows**: Level 1 (small cards), Level 2 (category cards)
- **Border Radius**: 16px (lg) cards, 20px (xl) profile card
- **Accessibility**: WCAG AA contrast ratios, clear labels, semantic elements
- **Card Pattern**: Fully embraces Bento Box containment principle

---

## Implementation Notes

**Key Components Needed:**
- Card component with variants (toggle, navigation, category)
- Switch/Toggle component
- Checkbox component
- Grid layout (2-column for small cards)
- Expandable/collapsible card component (optional)
- Alert/confirmation dialog
- Sub-screen navigation

**Estimated Complexity:** Medium-High (custom card system)

**Best For:** Users who prefer modern, visual interfaces with clear categorization and less cognitive load.

---

**Version**: 1.0  
**Created**: 2026-04-12  
**Task**: Task 5 - Settings Screen Design
