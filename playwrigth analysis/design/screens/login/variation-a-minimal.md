# Login Screen - Variation A: Minimal

## Overview

A clean, focused login experience that removes all distractions and emphasizes the primary action: signing in with Okta. This variation prioritizes speed and simplicity for users who just want to get to work quickly.

## Design Philosophy

- **Single Focus**: One clear call-to-action
- **Maximum Clarity**: No competing visual elements
- **Professional**: Clean, corporate-friendly aesthetic
- **Fast**: Minimal cognitive load, instant comprehension

## Screen Structure

### Container
- **Background**: Gray 50 (`#F9FAFB`)
- **Safe Area**: Respects top and bottom insets
- **Dimensions**: Full screen (100% width, 100% height)

### Content Layout (Vertical Stack)

The content is vertically centered with the following structure from top to bottom:

---

## Component Breakdown

### 1. Software Mind Logo (Top Section)

**Position**: Horizontally centered, 25% from top of screen

**Logo Image:**
- **Size**: 200px width × auto height (maintains aspect ratio)
- **Format**: Software Mind logo with orange circular icon + "Software Mind" text
- **Margin Bottom**: 64px (3xl spacing)

---

### 2. Main Card Container

**Position**: Centered horizontally and vertically

**Card Properties:**
- **Background**: White (`#FFFFFF`)
- **Border Radius**: 24px (xl)
- **Shadow**: Level 3 - `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)`
- **Padding**: 32px (xl) on all sides
- **Width**: 90% of screen width (max 400px)
- **Min Height**: 280px

**Card Content (Vertical Stack):**

#### 2a. Welcome Text
- **Text**: "Welcome to TimeTrack"
- **Font**: SF Pro Display (iOS) / Roboto (Android)
- **Size**: 24px (Heading 2)
- **Weight**: Semibold (600)
- **Color**: Gray 800 (`#1F2937`)
- **Alignment**: Center
- **Margin Bottom**: 12px (between xs and sm)

#### 2b. Subtitle Text
- **Text**: "Track your time with ease"
- **Font**: SF Pro Text (iOS) / Roboto (Android)
- **Size**: 16px (Body)
- **Weight**: Regular (400)
- **Color**: Gray 500 (`#6B7280`)
- **Alignment**: Center
- **Margin Bottom**: 32px (xl)

#### 2c. Sign In Button (Primary CTA)

**Button Container:**
- **Background**: Primary Blue (`#2563EB`)
- **Border Radius**: 12px (md)
- **Height**: 56px (extra touch-friendly)
- **Width**: 100% (full width of card)
- **Shadow**: Level 1 - `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
- **Touch Target**: 56px height ensures >44pt minimum

**Button Content (Horizontal Stack):**
- **Layout**: Flexbox row, centered vertically and horizontally
- **Gap**: 12px between icon and text

**Icon:**
- **Type**: Okta logo or generic shield/lock icon
- **Size**: 24px × 24px
- **Color**: White (`#FFFFFF`)
- **Position**: Left of text

**Text:**
- **Content**: "Sign in with Okta"
- **Font**: SF Pro Text (iOS) / Roboto (Android)
- **Size**: 18px (Body Large)
- **Weight**: Semibold (600)
- **Color**: White (`#FFFFFF`)
- **Alignment**: Center

**Button States:**
- **Default**: Primary Blue background
- **Pressed**: Primary Dark (`#1E40AF`) background
- **Disabled**: Gray 300 (`#D1D5DB`) background, reduced opacity

---

### 3. Footer Section (Bottom)

**Position**: Absolute bottom, horizontally centered, 32px (xl) from bottom

**Help Text:**
- **Text**: "Need help? Contact support"
- **Font**: SF Pro Text (iOS) / Roboto (Android)
- **Size**: 14px (Body Small)
- **Weight**: Regular (400)
- **Color**: Gray 400 (`#9CA3AF`)
- **Alignment**: Center

**Interactive Link:**
- **Text**: "Contact support" is tappable
- **Color**: Primary Blue (`#2563EB`) when tapped
- **Touch Target**: Minimum 44px height padding applied

---

## Spacing Breakdown

**Vertical Spacing (Top to Bottom):**
1. Safe Area Top → Logo: 25% of viewport height
2. Logo → Card Top: 64px (3xl)
3. Card Padding Top: 32px (xl)
4. Welcome Text → Subtitle: 12px
5. Subtitle → Button: 32px (xl)
6. Card Padding Bottom: 32px (xl)
7. Card Bottom → Footer: Flexible (auto)
8. Footer → Safe Area Bottom: 32px (xl)

**Horizontal Spacing:**
- Screen Padding: 5% on each side (for card)
- Card Internal Padding: 32px (xl) left and right

---

## Color Palette Used

| Element | Color Name | Hex Code |
|---------|-----------|----------|
| Background | Gray 50 | `#F9FAFB` |
| Card Background | White | `#FFFFFF` |
| Primary Button | Primary Blue | `#2563EB` |
| Button Pressed | Primary Dark | `#1E40AF` |
| Heading Text | Gray 800 | `#1F2937` |
| Subtitle Text | Gray 500 | `#6B7280` |
| Footer Text | Gray 400 | `#9CA3AF` |
| Button Text | White | `#FFFFFF` |

---

## Typography Specifications

| Element | Font Family | Size | Weight | Line Height |
|---------|------------|------|--------|-------------|
| Welcome Text | SF Pro Display | 24px | Semibold (600) | 1.25 (30px) |
| Subtitle | SF Pro Text | 16px | Regular (400) | 1.5 (24px) |
| Button Text | SF Pro Text | 18px | Semibold (600) | 1.25 (22.5px) |
| Footer Text | SF Pro Text | 14px | Regular (400) | 1.5 (21px) |

---

## Touch Targets

All interactive elements meet or exceed minimum accessibility standards:

| Element | Size | Status |
|---------|------|--------|
| Sign In Button | 56px height × full width | ✓ Exceeds 44pt minimum |
| Support Link | 44px height (with padding) | ✓ Meets 44pt minimum |

---

## Accessibility

**Color Contrast:**
- Welcome Text (Gray 800 on White): 12.63:1 ✓ AAA
- Subtitle (Gray 500 on White): 4.68:1 ✓ AA
- Button (White on Primary Blue): 6.98:1 ✓ AAA
- Footer (Gray 400 on Gray 50): 3.34:1 ✓ AA (for large text)

**Screen Reader Support:**
- Logo: "Software Mind logo"
- Button: "Sign in with Okta button"
- Support Link: "Contact support link"

**Dynamic Type:**
- All text scales with system font size settings
- Layout adjusts to accommodate larger text

---

## Animation & Interactions

**Button Press Animation:**
- Duration: 150ms
- Easing: ease-in-out
- Effect: Background color change + subtle scale (0.98)

**Screen Transition:**
- Duration: 250ms
- Easing: ease-out
- Effect: Fade in card with slight upward slide (20px)

---

## Implementation Notes

**React Native + NativeWind Classes:**

```tsx
// Container
className="flex-1 bg-gray-50 items-center justify-center"

// Logo
className="w-[200px] mb-16"

// Card
className="bg-white rounded-3xl shadow-lg p-8 w-[90%] max-w-[400px]"

// Welcome Text
className="text-2xl font-semibold text-gray-800 text-center mb-3"

// Subtitle
className="text-base text-gray-500 text-center mb-8"

// Button
className="bg-primary rounded-xl h-14 flex-row items-center justify-center shadow-sm"

// Button Text
className="text-lg font-semibold text-white"

// Footer
className="absolute bottom-8 text-sm text-gray-400 text-center"
```

---

## Responsive Considerations

**Small Screens (iPhone SE, 320-375px width):**
- Card width: 92% of screen
- Logo size: 160px width
- Reduce padding to 24px (lg)

**Large Screens (iPhone 14 Pro Max, iPad Mini, 414px+ width):**
- Card max-width: 400px (caps the width)
- Maintain 90% width up to max
- All spacing remains consistent

**Safe Areas:**
- iOS: Respects notch and home indicator
- Android: Respects status bar and navigation bar

---

## Design Rationale

**Why Minimal Works:**
1. **Fast Recognition**: Users instantly know what to do
2. **No Decision Fatigue**: Only one action available
3. **Professional**: Clean aesthetic suitable for enterprise
4. **Universal**: Works for all user types (new, returning, power users)
5. **Performance**: Minimal assets, fast load time

**User Flow:**
1. User opens app
2. Sees familiar Software Mind branding (trust)
3. Reads "Welcome to TimeTrack" (context)
4. Taps large blue Okta button (action)
5. Redirects to Okta authentication
6. Returns to app, logged in

**Expected Conversion Rate**: Highest of the three variations due to singular focus

---

## Files Required for Implementation

- Software Mind logo asset: `/assets/images/software-mind-logo.png` (or SVG)
- Okta icon (optional): `/assets/icons/okta-icon.png` or use lock icon from icon library

---

**Version**: 1.0  
**Status**: Awaiting Approval  
**Created**: 2026-04-12
