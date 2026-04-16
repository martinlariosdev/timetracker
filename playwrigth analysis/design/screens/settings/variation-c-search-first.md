# Variation C: Search-First (Power User)

## Overview

A search-first settings interface designed for power users who know what they want to change. Features a prominent search bar at the top, followed by frequently used settings, then categorized sections that can be filtered. Optimized for efficiency and quick access to any setting.

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
│  │                         →   │   │   (Compact)
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🔍  Search settings...     │   │ ← Search Bar
│  └─────────────────────────────┘   │   (Prominent)
│                                     │
│  FREQUENTLY USED                    │ ← Section
│  ┌─────────────────────────────┐   │
│  │ 🔔 Notifications       [ON] │   │
│  │ 🌙 Dark Mode          [OFF] │   │ ← Quick Access
│  │ ⏰ Work Hours       8hrs  → │   │   (3-4 items)
│  │ 💰 ETO Alerts         [ON] │   │
│  └─────────────────────────────┘   │
│                                     │
│  ALL SETTINGS                       │ ← Section
│  ┌─────────────────────────────┐   │
│  │ ⚙️ Preferences           5  →│   │ ← Category
│  ├─────────────────────────────┤   │   (Badge: count)
│  │ 🎨 Appearance            2  →│   │
│  ├─────────────────────────────┤   │
│  │ 💰 ETO Reminders         4  →│   │
│  ├─────────────────────────────┤   │
│  │ 🔒 Account & Security    3  →│   │
│  ├─────────────────────────────┤   │
│  │ ❓ Help & Support        4  →│   │
│  └─────────────────────────────┘   │
│                                     │
│  ACCOUNT ACTIONS                    │ ← Section
│  ┌─────────────────────────────┐   │
│  │       🚪 Logout             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Version 1.0.0 (Build 42)           │ ← App Info
│                                     │
│  ┌─────────────────────────────┐   │
│  │   🗑️ Delete Account         │   │
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

### Profile Card (Compact)
- Background: White
- Border-radius: 12px (md)
- Padding: 16px
- Shadow: Level 1
- Margin: 16px horizontal, 16px top
- Height: 72px
- Tap: Opens profile editing

**Profile Content:**
- Avatar: 40x40px, circular, left-aligned
- Name: Body (16px), Semibold, Gray 800
- Email: Caption (12px), Gray 500
- Position: Right of avatar, vertically centered
- Chevron: Gray 400, 16px, right-aligned

### Search Bar
- Height: 48px
- Background: Gray 100
- Border: 1px solid Gray 200
- Border-radius: 12px (md)
- Padding: 12px horizontal
- Margin: 16px
- Shadow: None (inset feel)

**Search Content:**
- Icon: Magnifying glass, Gray 400, 20px, left-aligned
- Placeholder: "Search settings..." (Body, Gray 400)
- Text input: Body (16px), Gray 800
- Clear button: Gray 400, 16px "X", right-aligned (appears when typing)

**Search States:**
- Focused: Border becomes Primary Blue (2px)
- Active: Background White, shadow Level 1
- Typing: Clear button appears

### Frequently Used Section
- Section header: All caps (Caption 12px), Bold, Gray 500
- Padding: 16px horizontal, 20px top, 8px bottom

**Frequently Used Card:**
- Background: White
- Border-radius: 12px (md)
- Shadow: Level 1
- Margin: 0 16px 16px
- Contains: 3-4 most used settings
- Determined by: User interaction frequency (auto-updates)

**Quick Access Items:**
- Height: 56px minimum
- Padding: 16px horizontal, 12px vertical
- Divider: 1px solid Gray 200 (between items)
- Icon: 20px, left-aligned, Primary Blue or Gray 600
- Label: Body (16px), Gray 800
- Value/Toggle: Right-aligned
- Active state: Gray 50 background

### All Settings Section
- Section header: All caps (Caption 12px), Bold, Gray 500
- Padding: 16px horizontal, 20px top, 8px bottom

**Category Card:**
- Background: White
- Border-radius: 12px (md)
- Shadow: Level 1
- Margin: 0 16px 16px

**Category Items:**
- Height: 56px
- Padding: 16px horizontal, 12px vertical
- Divider: 1px solid Gray 200 (between items)
- Icon: 20px, left-aligned, Primary Blue
- Label: Body (16px), Semibold, Gray 800
- Badge: Body Small (14px), Gray 500, pill shape, shows item count
- Chevron: Gray 400, 16px, right-aligned
- Active state: Gray 50 background
- Tap: Opens category sub-screen

**Badge Styling:**
- Background: Gray 100
- Border-radius: 12px (pill)
- Padding: 4px horizontal, 2px vertical
- Min-width: 24px
- Text: Caption (12px), Semibold, Gray 600
- Position: Right of label, margin-right 8px

### Account Actions Section
- Same styling as previous sections
- Logout button: Same as Variation A
- Delete button: Same as Variation A

---

## Search Functionality

### Search Behavior

**As User Types:**
1. Filters all settings in real-time
2. Shows matching results in categorized list
3. Highlights matched text
4. Hides non-matching categories

**Search Results View:**
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │  🔍  dark                ×   │   │ ← Search active
│  └─────────────────────────────┘   │
│                                     │
│  RESULTS (2)                        │ ← Result count
│  ┌─────────────────────────────┐   │
│  │ 🌙 Dark Mode          [OFF] │   │ ← Direct match
│  │    Appearance               │   │   (Shows category)
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎨 Dark theme colors     →  │   │ ← Related match
│  │    Appearance               │   │
│  └─────────────────────────────┘   │
│                                     │
│  No more results                    │
│                                     │
└─────────────────────────────────────┘
```

**Search Features:**
- **Fuzzy matching**: "notif" matches "Notifications"
- **Multi-word search**: "work hours" matches "Work Hours" setting
- **Category search**: "appearance" shows all appearance settings
- **Instant results**: Updates as user types (debounced 200ms)
- **Result highlighting**: Matched text in bold or highlighted background
- **Empty state**: Shows "No results found" with search suggestions

**Search Suggestions (when empty):**
- "Try searching for 'notifications', 'dark mode', or 'password'"
- Recent searches (if implemented): "work hours", "language"

### Empty Search State
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │  🔍  xyz123             ×    │   │
│  └─────────────────────────────┘   │
│                                     │
│           🔍                        │
│                                     │
│     No results found                │
│                                     │
│  Try searching for:                 │
│  • notifications                    │
│  • dark mode                        │
│  • work hours                       │
│  • password                         │
│                                     │
└─────────────────────────────────────┘
```

---

## Category Sub-Screens

When tapping a category (e.g., "Preferences"), shows all settings in that category:

```
┌─────────────────────────────────────┐
│ ← Back      Preferences             │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🔍  Search preferences...  │   │ ← Category-specific search
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔔 Notifications       [ON] │   │
│  ├─────────────────────────────┤   │
│  │ ⏰ Work Hours       8hrs  → │   │
│  ├─────────────────────────────┤   │
│  │ 🕐 Time Format    12-hour → │   │
│  ├─────────────────────────────┤   │
│  │ 🌐 Language       English → │   │
│  ├─────────────────────────────┤   │
│  │ 📅 Week Start Day  Monday → │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Category Sub-Screen Features:**
- Search bar scoped to category
- All settings in category visible
- Same interaction patterns as main screen
- Breadcrumb navigation (← Back)

---

## Interaction Patterns

### Search Bar
- **Tap**: Focus search, show keyboard
- **Type**: Real-time filtering of all settings
- **Clear (X)**: Clears search, returns to default view
- **Cancel/Done**: Dismisses keyboard, keeps search term
- **Tap result**: Opens that setting or toggles it (if toggle)

### Profile Card
- **Tap**: Opens profile editing screen
- Same as Variation A & B

### Frequently Used Settings
- **Auto-populated**: Based on user interaction frequency
- **Updates weekly**: Recalculates most-used settings
- **Manual override**: User can pin/unpin settings (optional)
- **Toggles**: Work immediately
- **Navigation items**: Open sub-screens

**Pinning (Optional Enhancement):**
- Long-press any setting in a category
- Shows "Pin to Frequently Used" option
- Adds to frequently used section
- Shows pin icon on pinned items

### Category Items
- **Tap**: Opens category sub-screen with all settings
- **Badge**: Shows count of settings in category
- **Icon**: Visual indicator of category type

### Logout & Delete Account
- Same behavior as Variation A & B

### Pull to Refresh
- **Swipe down**: Refreshes settings from server
- Updates all values and frequently used list

---

## Frequently Used Algorithm

The "Frequently Used" section auto-populates based on:

1. **Interaction count**: Number of times setting was changed (weight: 3x)
2. **Recent access**: Settings accessed in last 7 days (weight: 2x)
3. **Time spent**: Duration spent on setting screens (weight: 1x)
4. **Manual pins**: User-pinned settings (weight: 5x)

**Algorithm:**
```
score = (interaction_count * 3) + 
        (recent_access * 2) + 
        (time_spent * 1) + 
        (is_pinned * 5)

top_4_settings = sort_by_score(all_settings)[:4]
```

**Default Frequently Used** (before data collected):
1. Notifications
2. Dark Mode
3. Work Hours
4. ETO Alerts

---

## Advantages

1. **Efficiency**: Search allows instant access to any setting
2. **Personalization**: Frequently used section adapts to user behavior
3. **Scalability**: Easy to add more settings without overwhelming UI
4. **Power User Friendly**: Fast for users who know what they want
5. **Discovery**: Badge counts help users explore categories
6. **Reduced Scrolling**: Most-used settings at top, search for rest
7. **Smart**: Learns user preferences over time

## Disadvantages

1. **Initial Learning Curve**: Requires understanding search functionality
2. **Less Visual**: More utilitarian than card-based approach
3. **Frequently Used May Be Wrong**: Algorithm might not match user expectations initially
4. **Search Required**: Settings not in "Frequently Used" require search or category navigation
5. **Complexity**: More logic required for search, ranking, and personalization
6. **Empty Frequently Used**: New users have generic defaults until data collected

---

## Design System Compliance

- **Colors**: Bento Box primary blues, grays, semantic colors
- **Typography**: SF Pro Display/Text (iOS), Roboto (Android)
- **Spacing**: 16px (md) padding, consistent gaps
- **Touch Targets**: All interactive elements minimum 44x44pt / 48x48dp
- **Shadows**: Level 1 (cards, search bar when active)
- **Border Radius**: 12px (md) cards and search bar
- **Accessibility**: WCAG AA contrast ratios, clear labels, semantic search

---

## Implementation Notes

**Key Components Needed:**
- Search bar component with debouncing
- Fuzzy search algorithm (e.g., Fuse.js)
- Settings ranking/scoring system
- Badge component
- Local storage for frequently used tracking
- Analytics integration for interaction tracking
- Search result highlighting component

**Estimated Complexity:** High (search, ranking, personalization)

**Best For:** Power users who prefer efficiency and quick access over visual appeal, and users with many settings to manage.

---

## Search Index Structure

To enable fast searching, maintain a search index:

```typescript
interface SettingSearchItem {
  id: string;
  title: string; // "Dark Mode"
  keywords: string[]; // ["dark", "mode", "theme", "appearance"]
  category: string; // "Appearance"
  categoryIcon: string;
  type: 'toggle' | 'navigation' | 'action';
  path: string; // "appearance/dark-mode"
}

const searchIndex: SettingSearchItem[] = [
  {
    id: 'dark-mode',
    title: 'Dark Mode',
    keywords: ['dark', 'mode', 'theme', 'appearance', 'night', 'light'],
    category: 'Appearance',
    categoryIcon: '🎨',
    type: 'toggle',
    path: 'appearance/dark-mode'
  },
  // ... all other settings
];
```

**Search Implementation:**
- Use Fuse.js or similar for fuzzy matching
- Search across title + keywords
- Weight title matches higher than keyword matches
- Return results sorted by relevance score

---

**Version**: 1.0  
**Created**: 2026-04-12  
**Task**: Task 5 - Settings Screen Design
