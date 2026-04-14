# Navigation Structure

This document describes the Expo Router navigation setup for the TimeTrack mobile app.

## Route Structure

```
app/
├── _layout.tsx                 # Root layout with auth check
├── (auth)/                     # Authentication route group
│   ├── _layout.tsx            # Auth group layout (headerless stack)
│   └── login.tsx              # Login screen
└── (tabs)/                     # Main app route group
    ├── _layout.tsx            # Tab navigator configuration
    ├── index.tsx              # Timesheet list (home screen)
    ├── add-entry.tsx          # Add/edit time entry
    ├── eto.tsx                # ETO balance & transactions
    └── settings.tsx           # Settings & profile
```

## Navigation Flow

### Authentication
- Root layout (`app/_layout.tsx`) checks authentication status on mount
- Unauthenticated users are redirected to `/(auth)/login`
- Authenticated users are redirected to `/(tabs)` (main app)
- Shows loading spinner while checking auth state

### Tab Navigation
Once authenticated, users can navigate between four main screens:

1. **Timesheets** (`index`) - View and manage timesheets
2. **Add Entry** (`add-entry`) - Create new time entries
3. **ETO** (`eto`) - View ETO balance and transaction history
4. **Settings** (`settings`) - Profile, preferences, and logout

## TypeScript Types

Navigation types are defined in `types/navigation.ts`:

```typescript
export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
};

export type AuthStackParamList = {
  login: undefined;
};

export type TabsParamList = {
  index: undefined;
  'add-entry': undefined;
  eto: undefined;
  settings: undefined;
};
```

## Features

### Route Groups
- `(auth)` - Parentheses create a group without adding to the URL path
- `(tabs)` - Isolates tab navigation from other routes

### Tab Bar Configuration
- Icons: Using `@expo/vector-icons` (Ionicons)
- Active tint: `#007AFF` (iOS blue)
- Inactive tint: `#8E8E93` (iOS gray)
- Headers shown by default

### Authentication Logic
The root layout uses a custom `useAuth` hook (placeholder):
- Returns `isAuthenticated: boolean | null`
- `null` indicates loading state
- Monitors route segments to enforce auth boundaries
- Prevents authenticated users from accessing auth routes
- Prevents unauthenticated users from accessing protected routes

## TODO

### Task 29: Implement Authentication
- Replace placeholder `useAuth` hook with real auth context
- Integrate with backend login API
- Store auth token in AsyncStorage
- Add token refresh logic
- Implement logout functionality

### Future Enhancements
- Deep linking support
- Push notification routing
- Add modal routes for overlays
- Add stack navigation within tabs if needed
- Implement navigation guards/middleware

## Testing Navigation

To test the navigation:

```bash
# Start development server
pnpm dev

# On iOS simulator
pnpm ios

# On Android emulator
pnpm android
```

Test scenarios:
1. App opens to login screen (unauthenticated)
2. After login, navigates to timesheet list
3. Can switch between all four tabs
4. Tab bar icons change color on selection
5. Headers display correct titles
6. Back navigation works as expected

## Resources

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Expo Router File-based Routing](https://docs.expo.dev/router/create-pages/)
- [Expo Router Authentication](https://docs.expo.dev/router/reference/authentication/)
- [TypeScript with Expo Router](https://docs.expo.dev/router/reference/typescript/)
