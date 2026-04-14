# NativeWind Styling Guide

This project uses NativeWind 4.0 for Tailwind CSS styling in React Native, implementing the Bento Box design system.

## Configuration

NativeWind has been configured with the following files:

- `tailwind.config.js` - Tailwind configuration with Bento Box design tokens
- `babel.config.js` - Babel preset for NativeWind
- `metro.config.js` - Metro bundler configuration
- `global.css` - Global Tailwind styles (imported in `app/_layout.tsx`)
- `nativewind-env.d.ts` - TypeScript declarations for NativeWind

## Usage

### Basic Styling

Use the `className` prop instead of `style` prop for Tailwind classes:

```tsx
import { View, Text } from 'react-native';

export function MyComponent() {
  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-h2 text-gray-800 font-semibold">
        Hello World
      </Text>
    </View>
  );
}
```

### Bento Box Components

Use pre-built components from `components/BentoBox.tsx`:

```tsx
import { Card, Button, Heading, BodyText, Input, Badge } from '@/components/BentoBox';

export function Example() {
  return (
    <Card shadow="level-2">
      <Heading level={2}>Card Title</Heading>
      <BodyText>This is a card using the Bento Box design system.</BodyText>
      
      <Input
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
      />
      
      <Button variant="primary">
        Submit
      </Button>
      
      <Badge variant="success">Active</Badge>
    </Card>
  );
}
```

## Design System Reference

### Colors

The following color classes are available from the Bento Box design system:

**Primary Colors:**
- `bg-primary` / `text-primary` - #2563EB (Main actions, primary buttons)
- `bg-primary-dark` / `text-primary-dark` - #1E40AF (Pressed states)
- `bg-primary-light` / `text-primary-light` - #3B82F6 (Hover states)

**Secondary Colors:**
- `bg-secondary` / `text-secondary` - #0EA5E9
- `bg-secondary-dark` / `text-secondary-dark` - #0284C7
- `bg-secondary-light` / `text-secondary-light` - #06B6D4

**Semantic Colors:**
- `bg-success` / `text-success` - #10B981 (Confirmations)
- `bg-warning` / `text-warning` - #F59E0B (Alerts)
- `bg-error` / `text-error` - #EF4444 (Errors)
- `bg-info` / `text-info` - #3B82F6 (Information)

**Neutral Colors:**
- `bg-gray-50` to `bg-gray-900` - Full gray scale
- `text-gray-50` to `text-gray-900` - Text colors

### Spacing

Use the custom spacing scale (4px base):

- `p-xs` / `m-xs` - 4px
- `p-sm` / `m-sm` - 8px
- `p-md` / `m-md` - 16px (default card padding)
- `p-lg` / `m-lg` - 24px
- `p-xl` / `m-xl` - 32px
- `p-2xl` / `m-2xl` - 48px
- `p-3xl` / `m-3xl` - 64px

Also works with padding/margin sides: `px-md`, `py-lg`, `mt-sm`, `mb-xl`, etc.

### Typography

Custom text size classes:

- `text-h1` - 32px, bold (Page titles)
- `text-h2` - 24px, semibold (Section headers)
- `text-h3` - 20px, semibold (Card titles)
- `text-h4` - 18px, semibold (Subsection titles)
- `text-body-large` - 18px (Emphasized body)
- `text-body` - 16px (Default body text)
- `text-body-small` - 14px (Secondary info)
- `text-caption` - 12px (Labels, metadata)
- `text-button` - 16px, semibold (Button text)

Font weights:
- `font-normal` - Regular (400)
- `font-medium` - Medium (500)
- `font-semibold` - Semibold (600)
- `font-bold` - Bold (700)

### Border Radius

- `rounded-sm` - 8px (Small elements, badges)
- `rounded-md` - 12px (Buttons, inputs)
- `rounded-lg` - 16px (Cards, major containers)
- `rounded-xl` - 24px (Large featured cards)
- `rounded-full` - 9999px (Circular elements)

### Shadows

- `shadow-level-1` - Subtle lift, cards at rest
- `shadow-level-2` - Raised cards, dropdowns (default)
- `shadow-level-3` - Modals, popovers, FAB
- `shadow-level-4` - Maximum elevation

### Layout

Standard Flexbox utilities work:

```tsx
<View className="flex-1 flex-row items-center justify-between gap-2">
  {/* content */}
</View>
```

Common patterns:
- `flex-1` - Fill available space
- `flex-row` - Horizontal layout
- `items-center` - Vertical center alignment
- `justify-center` - Horizontal center alignment
- `justify-between` - Space between items
- `gap-2` / `gap-4` - Spacing between flex children

### Interactive States

Use `active:` prefix for pressed states:

```tsx
<TouchableOpacity className="bg-primary active:bg-primary-dark">
  <Text>Press me</Text>
</TouchableOpacity>
```

### Opacity

For semi-transparent backgrounds or overlays:

```tsx
<View className="bg-success/10"> {/* 10% opacity */}
<View className="bg-black/50">   {/* 50% opacity */}
```

## Animations

Animation durations are configured:

- `duration-fast` - 150ms (Hover states, toggles)
- `duration-normal` - 250ms (Sheet openings, transitions)
- `duration-slow` - 400ms (Page transitions, modals)

Use with transition utilities:

```tsx
<View className="transition-all duration-normal">
```

## Hot Reload

NativeWind supports hot reload. Changes to:
- Component className props
- `tailwind.config.js`
- `global.css`

will automatically update in the running app without full reload.

## TypeScript Support

TypeScript autocomplete works for `className` prop on React Native components. The `nativewind-env.d.ts` file provides type definitions.

## Troubleshooting

**Styles not applying:**
1. Ensure `global.css` is imported in `app/_layout.tsx`
2. Clear Metro bundler cache: `pnpm dev` (runs with `--clear` flag)
3. Rebuild the app completely

**TypeScript errors:**
1. Ensure `nativewind-env.d.ts` is included in `tsconfig.json`
2. Restart TypeScript server in your editor

**Hot reload not working:**
1. Save the file again
2. Shake device and "Reload" manually
3. Restart Metro bundler

## Resources

- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Bento Box Design System](/design/bento-box-system.md)
- [Component Library](/components/BentoBox.tsx)
