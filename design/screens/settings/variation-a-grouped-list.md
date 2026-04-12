# Variation A: Grouped List (Classic Settings)

## Overview

A traditional, iOS/Android-style settings screen with grouped sections. Clean, scannable, and familiar to users. Profile information at the top, followed by categorized settings groups, and destructive actions at the bottom.

## Design Specification

### Screen Layout
```
┌─────────────────────────────────────┐
│          Settings                   │ ← Top Bar
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │   👤                        │   │
│  │   Martin Larios            ⚙️  │ ← Profile Card
│  │   martin@example.com        │   │ ← (Tap to edit)
│  │   Software Engineer         │   │
│  └─────────────────────────────┘   │
│                                     │
│  PREFERENCES                        │ ← Section Header
│  ┌─────────────────────────────┐   │
│  │ 🔔 Notifications       [ON] │   │
│  ├─────────────────────────────┤   │
│  │ ⏰ Work Hours            →  │   │ ← Settings Items
│  ├─────────────────────────────┤   │
│  │ 🕐 Time Format           →  │   │
│  │    12-hour                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  APPEARANCE                         │ ← Section Header
│  ┌─────────────────────────────┐   │
│  │ 🌙 Dark Mode          [OFF] │   │
│  ├─────────────────────────────┤   │
│  │ 🌐 Language              →  │   │
│  │    English                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ETO REMINDERS                      │ ← Section Header
│  ┌─────────────────────────────┐   │
│  │ 💰 Balance Alerts     [ON]  │   │
│  ├─────────────────────────────┤   │
│  │ 📧 Time Off Reminders       │   │
│  │    1 day before       [✓]   │   │
│  │    3 days before      [ ]   │   │
│  │    Every 3 days       [ ]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ACCOUNT                            │ ← Section Header
│  ┌─────────────────────────────┐   │
│  │ 🔒 Change Password       →  │   │
│  ├─────────────────────────────┤   │
│  │ 📱 Connected Devices     →  │   │
│  └─────────────────────────────┘   │
│                                     │
│  SUPPORT                            │ ← Section Header
│  ┌─────────────────────────────┐   │
│  │ ❓ Help Center           →  │   │
│  ├─────────────────────────────┤   │
│  │ 📧 Contact Support       →  │   │
│  ├─────────────────────────────┤   │
│  │ ⭐ Rate App              →  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       🚪 Logout             │   │ ← Primary Action
│  └─────────────────────────────┘   │
│                                     │
│  Version 1.0.0 (Build 42)           │ ← App Info
│                                     │
│  ┌─────────────────────────────┐   │
│  │   🗑️ Delete Account         │   │ ← Destructive Action
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
- Background: White
- Border-radius: 16px (lg)
- Padding: 20px
- Shadow: Level 2
- Margin: 16px horizontal, 16px top
- Tap: Opens profile editing screen

**Profile Avatar:**
- Size: 64x64px
- Border-radius: Full (circular)
- Background: Primary Blue gradient
- Icon: User icon (White, 32px) OR user photo
- Position: Top-left

**Profile Info:**
- Name: H3 (20px), Semibold, Gray 800
- Email: Body Small (14px), Gray 600
- Role: Body Small (14px), Gray 500
- Position: Right of avatar, vertically centered
- Settings icon: Gray 400, 20px, top-right corner

### Section Headers
- Text: All caps (Caption size 12px), Bold, Gray 500
- Letter-spacing: 0.5px
- Padding: 24px horizontal (16px), 20px top, 8px bottom
- Background: Transparent

### Settings Groups
- Background: White
- Border-radius: 12px (md)
- Shadow: Level 1
- Margin: 0 16px 16px
- Border: 1px solid Gray 200

### Settings Items
- Height: Minimum 56px (touch-friendly)
- Padding: 16px horizontal, 12px vertical
- Divider: 1px solid Gray 200 (bottom, except last item)
- Active state: Gray 50 background

**Item Structure:**
- Icon: 20px, left-aligned, Primary Blue or Gray 600
- Label: Body (16px), Gray 800, margin-left 12px
- Value/Status: Body Small (14px), Gray 500, right-aligned
- Chevron/Toggle: Right-aligned
  - Chevron: Gray 400, 16px (for navigation items)
  - Toggle: iOS-style switch, Primary Blue when ON

**Toggle Switch:**
- Width: 51px, Height: 31px
- Border-radius: Full
- Background: Gray 300 (OFF), Primary Blue (ON)
- Handle: White circle, 27px diameter
- Animation: 250ms ease-in-out

**Checkbox (for multi-select like ETO reminders):**
- Size: 24x24px
- Border: 2px solid Gray 300
- Border-radius: 6px
- Checked: Primary Blue background, White checkmark
- Unchecked: White background

### Action Buttons

**Logout Button:**
- Height: 48px
- Border-radius: 12px (md)
- Background: Primary Blue
- Text: Body (16px), Semibold, White
- Icon: Door icon, White, 20px
- Margin: 24px horizontal, 16px vertical
- Active state: Primary Dark background
- Shadow: Level 1

**Delete Account Button:**
- Height: 48px
- Border-radius: 12px (md)
- Background: Transparent
- Border: 2px solid Error color (#EF4444)
- Text: Body (16px), Semibold, Error color
- Icon: Trash icon, Error color, 20px
- Margin: 0 horizontal, 16px bottom
- Active state: Error background (10% opacity)
- Tap: Shows confirmation alert

### App Version
- Text: Caption (12px), Gray 400
- Center-aligned
- Padding: 8px vertical
- Margin: 16px top

---

## Interaction Patterns

### Profile Card
- **Tap**: Opens profile editing screen with:
  - Photo upload
  - Name (editable)
  - Email (read-only or editable)
  - Role/Title (editable)
  - Save/Cancel buttons

### Toggle Settings (Notifications, Dark Mode, Balance Alerts)
- **Tap toggle**: Immediately changes setting
- **Visual feedback**: Toggle animates to new position
- **Persistence**: Auto-saves to backend
- **Toast notification**: "Setting updated" (brief)

### Navigation Settings (Work Hours, Time Format, Language, etc.)
- **Tap row**: Opens sub-screen with detailed options
- **Shows current value**: Secondary text below label
- **Chevron indicates**: More options available

### Work Hours Sub-screen
```
┌─────────────────────────────────────┐
│ ← Back      Work Hours              │
├─────────────────────────────────────┤
│                                     │
│  Default Work Hours                 │
│  ┌─────────────────────────────┐   │
│  │ Hours per Day               │   │
│  │ [  8.00  ]                  │   │ ← Number input
│  └─────────────────────────────┘   │
│                                     │
│  Weekly Schedule                    │
│  ┌─────────────────────────────┐   │
│  │ Monday          [ 8.00 ] hrs│   │
│  │ Tuesday         [ 8.00 ] hrs│   │
│  │ Wednesday       [ 8.00 ] hrs│   │
│  │ Thursday        [ 8.00 ] hrs│   │
│  │ Friday          [ 8.00 ] hrs│   │
│  │ Saturday        [ 0.00 ] hrs│   │
│  │ Sunday          [ 0.00 ] hrs│   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         Save Changes        │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Time Format Sub-screen
```
┌─────────────────────────────────────┐
│ ← Back      Time Format             │
├─────────────────────────────────────┤
│                                     │
│  Select Time Format                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⦿ 12-hour (3:30 PM)         │   │ ← Radio selected
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ○ 24-hour (15:30)           │   │ ← Radio unselected
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Language Sub-screen
```
┌─────────────────────────────────────┐
│ ← Back      Language                │
├─────────────────────────────────────┤
│                                     │
│  Select Language                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⦿ English                   │   │
│  ├─────────────────────────────┤   │
│  │ ○ Español                   │   │
│  ├─────────────────────────────┤   │
│  │ ○ Français                  │   │
│  ├─────────────────────────────┤   │
│  │ ○ Deutsch                   │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### ETO Reminders Checkboxes
- **Tap checkbox**: Toggles individual reminder option
- **Multiple selection**: Can enable multiple reminder frequencies
- **Auto-save**: Changes persist immediately
- **Visual feedback**: Checkbox animates check/uncheck

### Change Password
- **Tap**: Opens password change screen with:
  - Current password (secure input)
  - New password (secure input)
  - Confirm new password (secure input)
  - Password requirements shown
  - Save button (enabled when valid)

### Connected Devices
- **Tap**: Shows list of devices with this account logged in
  - Device name (e.g., "iPhone 14 Pro")
  - Last active date
  - Current device indicator
  - Logout option for other devices

### Help Center
- **Tap**: Opens in-app browser to help documentation
- Or: Opens native help screen with FAQs

### Contact Support
- **Tap**: Opens email composer pre-filled with:
  - To: support@timetrack.com
  - Subject: "Support Request"
  - Body: Device info, app version auto-included

### Rate App
- **Tap**: Opens platform-specific rating dialog
- iOS: StoreKit rating prompt
- Android: Google Play in-app review

### Logout
- **Tap**: Shows confirmation alert:
  - Title: "Logout"
  - Message: "Are you sure you want to logout?"
  - Actions: "Cancel" (default), "Logout" (destructive)
- **Confirm**: Clears auth token, returns to login screen

### Delete Account
- **Tap**: Shows strong confirmation:
  - Title: "Delete Account"
  - Message: "This will permanently delete your account and all data. This action cannot be undone."
  - Text input: "Type DELETE to confirm"
  - Actions: "Cancel", "Delete Account" (destructive, enabled when text matches)
- **Confirm**: Sends delete request, shows progress, redirects to goodbye screen

---

## Advantages

1. **Familiarity**: Users instantly understand this pattern (iOS Settings, Android Settings)
2. **Scannability**: Clear section headers make it easy to find settings
3. **Efficiency**: Toggles allow quick changes without navigation
4. **Organization**: Logical grouping (Preferences, Appearance, Account, Support)
5. **Clear Hierarchy**: Visual separation between groups
6. **Comprehensive**: All settings visible on one scrollable screen
7. **Standard Patterns**: Uses platform-native components (toggles, checkboxes)

## Disadvantages

1. **Long Scroll**: Many settings require scrolling to reach (especially destructive actions)
2. **Visual Monotony**: Can feel boring or utilitarian
3. **Limited Visual Interest**: No graphics or illustrations
4. **Cognitive Load**: Many options presented at once
5. **Less Modern**: Doesn't leverage card-based Bento Box system as much

---

## Design System Compliance

- **Colors**: Bento Box primary blues, grays, semantic colors
- **Typography**: SF Pro Display/Text (iOS), Roboto (Android)
- **Spacing**: 16px (md) padding, consistent gaps
- **Touch Targets**: All interactive elements minimum 44x44pt / 48x48dp
- **Shadows**: Level 1 (settings groups), Level 2 (profile card)
- **Border Radius**: 12px (md) groups, 16px (lg) profile card
- **Accessibility**: WCAG AA contrast ratios, clear labels, semantic elements

---

## Implementation Notes

**Key Components Needed:**
- Switch/Toggle component (platform-native)
- Checkbox component
- Radio button component
- List item component with variants (toggle, navigation, checkbox)
- Alert/confirmation dialog component
- Sub-screen navigation
- Form validation for password change

**Estimated Complexity:** Medium (standard patterns)

**Best For:** Users who prefer traditional, familiar settings interfaces with quick access to all options.

---

**Version**: 1.0  
**Created**: 2026-04-12  
**Task**: Task 5 - Settings Screen Design
