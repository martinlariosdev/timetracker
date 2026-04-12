# Bento Box Design System

## Overview

The Bento Box design system is a modern, card-based design pattern inspired by Japanese bento boxes - where distinct elements are organized into clean, contained compartments. This creates visual hierarchy, improves scannability, and provides a cohesive mobile experience.

## Design Principles

### 1. Containment
- Each component or feature lives in its own "box" (card)
- Clear boundaries between sections using cards, borders, or spacing
- Shadows and elevation create depth and hierarchy

### 2. Organization
- Logical grouping of related information
- Consistent spacing between and within containers
- Grid-based layouts for predictable structure

### 3. Clarity
- Single purpose per card/container
- Clear visual hierarchy through size, color, and typography
- Generous white space prevents cognitive overload

### 4. Touch-Friendly
- Minimum touch targets of 44x44pt (iOS) / 48x48dp (Android)
- Adequate spacing between interactive elements
- Clear affordances for tappable elements

## Color Palette

### Primary Colors
- **Primary Blue**: `#2563EB` - Main actions, headers, primary buttons
- **Primary Dark**: `#1E40AF` - Pressed states, active navigation
- **Primary Light**: `#3B82F6` - Hover states, backgrounds

### Secondary Colors
- **Secondary Cyan**: `#0EA5E9` - Secondary actions, accents
- **Secondary Dark**: `#0284C7` - Secondary pressed states
- **Secondary Light**: `#06B6D4` - Secondary highlights

### Semantic Colors
- **Success**: `#10B981` - Confirmations, positive states
- **Warning**: `#F59E0B` - Alerts, cautions
- **Error**: `#EF4444` - Errors, destructive actions
- **Info**: `#3B82F6` - Informational messages

### Neutral Colors
- **Gray 50**: `#F9FAFB` - Background
- **Gray 100**: `#F3F4F6` - Subtle backgrounds
- **Gray 200**: `#E5E7EB` - Borders, dividers
- **Gray 300**: `#D1D5DB` - Disabled states
- **Gray 400**: `#9CA3AF` - Placeholder text
- **Gray 500**: `#6B7280` - Secondary text
- **Gray 600**: `#4B5563` - Body text
- **Gray 700**: `#374151` - Headings
- **Gray 800**: `#1F2937` - High emphasis text
- **Gray 900**: `#111827` - Maximum contrast

### Special Colors
- **White**: `#FFFFFF` - Card backgrounds, light theme base
- **Black**: `#000000` - Maximum contrast (use sparingly)

## Typography

### Font Families
- **Display & UI**: SF Pro Display, SF Pro Text (iOS native)
- **Android**: Roboto
- **Numbers**: SF Pro Rounded - for time entries and numerical data
- **Fallback**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)

### Type Scale
- **Heading 1**: 32px / 2rem - Bold - Page titles
- **Heading 2**: 24px / 1.5rem - Semibold - Section headers
- **Heading 3**: 20px / 1.25rem - Semibold - Card titles
- **Heading 4**: 18px / 1.125rem - Semibold - Subsection titles
- **Body Large**: 18px / 1.125rem - Regular - Emphasized body text
- **Body**: 16px / 1rem - Regular - Default body text
- **Body Small**: 14px / 0.875rem - Regular - Secondary information
- **Caption**: 12px / 0.75rem - Regular - Labels, metadata
- **Button**: 16px / 1rem - Semibold - Button labels

### Line Height
- **Tight**: 1.25 - Headings
- **Normal**: 1.5 - Body text
- **Relaxed**: 1.75 - Long-form content

## Spacing Scale

Consistent spacing creates rhythm and visual harmony. Use multiples of 4px for all spacing.

- **xs**: 4px - Tight internal spacing
- **sm**: 8px - Compact spacing, internal padding
- **md**: 16px - Default spacing, card padding
- **lg**: 24px - Section spacing
- **xl**: 32px - Major section breaks
- **2xl**: 48px - Page-level spacing
- **3xl**: 64px - Extra large gaps (rare)

## Border Radius

Rounded corners soften the interface and align with modern design trends.

- **sm**: 8px - Small elements, tags, badges
- **md**: 12px - Buttons, inputs, small cards
- **lg**: 16px - Cards, modals, major containers
- **xl**: 24px - Large featured cards
- **full**: 9999px - Circular elements, pills

## Shadows & Elevation

Create depth and hierarchy through layered shadows.

### Shadow Levels
- **Level 0**: No shadow - Flat elements
- **Level 1**: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` - Subtle lift, cards at rest
- **Level 2**: `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` - Raised cards, dropdowns
- **Level 3**: `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` - Modals, popovers
- **Level 4**: `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` - Maximum elevation

## Component Patterns

### Cards

The fundamental building block of the Bento Box system.

**Characteristics:**
- Background: White (#FFFFFF)
- Border radius: 16px (lg)
- Padding: 16px (md)
- Shadow: Level 1 or Level 2
- Border: Optional, 1px solid Gray 200

**Usage:**
- Group related content
- Contain forms or data tables
- Feature highlights or calls-to-action

### List Items

For scrollable lists of data or navigation options.

**Characteristics:**
- Min height: 56px (touch-friendly)
- Padding: 12px horizontal, 16px vertical
- Divider: 1px solid Gray 200 (bottom)
- Background: White, with Gray 50 hover state

**Usage:**
- Navigation menus
- Time entry lists
- Settings options

### Forms

Clean, accessible form elements.

**Input Fields:**
- Height: 48px (touch-friendly)
- Padding: 12px horizontal
- Border: 1px solid Gray 300
- Border radius: 12px (md)
- Focus: 2px Primary Blue border
- Label: 14px, Gray 700, above input with 8px spacing

**Buttons:**
- Height: 48px minimum
- Padding: 12px horizontal, 16px vertical
- Border radius: 12px (md)
- Font: 16px Semibold
- Primary: Primary Blue background, White text
- Secondary: Gray 100 background, Gray 800 text
- Outline: Transparent background, Primary Blue border

### Actions

Interactive elements must be obvious and accessible.

**Floating Action Button (FAB):**
- Size: 56x56px
- Border radius: Full (circular)
- Shadow: Level 3
- Background: Primary Blue
- Icon: White, 24px

**Icon Buttons:**
- Size: 44x44px minimum
- Padding: 10px
- Border radius: Full or 8px (sm)
- Active state: Gray 100 background

### Navigation

Clear, consistent navigation patterns.

**Top Navigation Bar:**
- Height: 56px
- Background: Primary Blue
- Text: White
- Shadow: Level 1

**Bottom Tab Bar:**
- Height: 64px (includes safe area)
- Background: White
- Active: Primary Blue
- Inactive: Gray 400
- Icons: 24px

## Mobile-Specific Considerations

### iOS
- Use SF Pro fonts
- Respect safe areas (notch, home indicator)
- Use native iOS shadows and blur effects
- 44pt minimum touch targets

### Android
- Use Roboto fonts
- Material Design elevation
- Ripple effects on touch
- 48dp minimum touch targets

### Cross-Platform
- Use NativeWind (Tailwind for React Native)
- Test on multiple screen sizes (iPhone SE, iPhone 14 Pro Max, small/large Android)
- Support both light and dark modes
- Ensure 4.5:1 contrast ratio for accessibility

## Animation Guidelines

Subtle, purposeful animations enhance the experience without distraction.

**Timing:**
- Fast: 150ms - Hover states, toggles
- Normal: 250ms - Sheet openings, transitions
- Slow: 400ms - Page transitions, large modals

**Easing:**
- ease-in-out: Default for most animations
- ease-out: Entering elements
- ease-in: Exiting elements
- spring: iOS-style bouncy animations

## Accessibility

**Color Contrast:**
- Text must meet WCAG AA standards (4.5:1 for body, 3:1 for large text)
- Don't rely on color alone to convey information

**Touch Targets:**
- Minimum 44x44pt (iOS) or 48x48dp (Android)
- Adequate spacing between interactive elements

**Typography:**
- Support dynamic type / font scaling
- Test with 200% zoom
- Use semantic HTML elements

**Screen Readers:**
- Provide meaningful labels for all interactive elements
- Use proper heading hierarchy
- Announce state changes

## Implementation Notes

### NativeWind (Tailwind CSS for React Native)

Use these utility classes aligned with the design system:

**Colors:**
- `bg-primary` → #2563EB
- `text-gray-600` → #4B5563
- `border-gray-200` → #E5E7EB

**Spacing:**
- `p-4` → 16px padding (md)
- `m-6` → 24px margin (lg)
- `gap-2` → 8px gap (sm)

**Borders:**
- `rounded-lg` → 16px radius
- `rounded-xl` → 24px radius
- `shadow-md` → Level 2 shadow

**Layout:**
- Use Flexbox: `flex`, `flex-row`, `items-center`, `justify-between`
- Safe areas: `safe-area-top`, `safe-area-bottom`

### Example Component Structure

```tsx
<View className="bg-white rounded-lg shadow-md p-4 m-4">
  <Text className="text-xl font-semibold text-gray-800 mb-2">
    Card Title
  </Text>
  <Text className="text-base text-gray-600">
    Card content goes here with proper spacing and typography.
  </Text>
  <TouchableOpacity className="bg-primary rounded-xl mt-4 py-3 px-4">
    <Text className="text-white font-semibold text-center">
      Action Button
    </Text>
  </TouchableOpacity>
</View>
```

## Design Process

1. **Reference** - Review desktop screenshots for functional requirements
2. **Sketch** - Use Google Stitch MCP to design variations
3. **Feedback** - Present options and gather input
4. **Refine** - Iterate based on feedback
5. **Export** - Generate React Native + NativeWind code
6. **Implement** - Build components following the design system
7. **Test** - Verify on multiple devices and screen sizes

## Resources

- Desktop Screenshots: `/screenshots/`
- Design Files: `/design/screens/`
- Mobile Implementation: `/apps/mobile/`
- Component Library: TBD (Will be built in later tasks)

---

**Version**: 1.0  
**Last Updated**: 2026-04-12  
**Maintained By**: Task 1 - Setup Google Stitch MCP & Design System
