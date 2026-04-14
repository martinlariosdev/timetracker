# TimeTrack Mobile

React Native mobile application for TimeTrack time tracking system built with Expo.

## 📱 Overview

Cross-platform mobile app (iOS/Android) for consultants to track time, manage ETO (Earned Time Off), and submit timesheets for approval. Features offline-first architecture with automatic sync, biometric authentication, and push notifications.

## 🚀 Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo SDK 54** - Development platform and tools
- **React 19.1.0** - UI framework (Expo-customized build)
- **TypeScript 5.9.2** - Type safety
- **Expo Router 6** - File-based navigation
- **Apollo Client 4** - GraphQL client with caching
- **NativeWind 4** - Tailwind CSS for React Native
- **AsyncStorage** - Local data persistence
- **Expo Auth Session** - OAuth 2.0 / OIDC authentication
- **Expo Local Authentication** - Biometric (Face ID / Fingerprint)
- **Expo Notifications** - Push notification handling

## ✨ Features

### Authentication
- ✅ **Okta SSO** - Single sign-on with OIDC flow
- ✅ **Biometric Unlock** - Face ID / Fingerprint for quick access
- ✅ **Mock Auth Support** - Development without Okta credentials
- ✅ **JWT Tokens** - Secure session management
- ✅ **Auto Token Refresh** - Seamless token renewal

### Time Tracking
- ✅ **Time Entry Management** - Add, edit, duplicate entries
- ✅ **Week Strip View** - Quick navigation between days
- ✅ **Duplicate Yesterday** - Copy previous day's entries
- ✅ **Client Selection** - Track client and project details
- ✅ **Time Validation** - Prevent overlapping time blocks
- ✅ **Hours Calculation** - Automatic total hours with color coding

### ETO Management
- ✅ **Balance Display** - Current ETO balance
- ✅ **Transaction History** - Accruals, usage, adjustments
- ✅ **Balance Tracking** - Real-time ETO calculations

### Offline Support
- ✅ **Offline Queue** - AsyncStorage-based operation queue
- ✅ **Auto Sync** - Automatic sync when connection restored
- ✅ **Conflict Resolution** - Server-side conflict handling
- ✅ **Retry Logic** - Failed operations automatically retried

### Notifications
- ✅ **Push Notifications** - Deadline reminders and alerts
- ✅ **Permission Handling** - iOS/Android permission flow
- ✅ **Token Registration** - Automatic Expo push token registration
- ✅ **Foreground/Background** - Notifications in all app states

### UI/UX
- ✅ **Bento Box Design** - Modern card-based interface
- ✅ **NativeWind Styling** - Tailwind CSS utilities
- ✅ **Reanimated Animations** - Smooth transitions
- ✅ **Dark Mode Ready** - Theme support structure

## 📁 Project Structure

```
apps/mobile/
├── app/                          # Expo Router pages (file-based routing)
│   ├── (tabs)/                   # Tab navigation
│   │   ├── add-entry.tsx         # Time entry form
│   │   ├── eto.tsx               # ETO tracking
│   │   ├── index.tsx             # Timesheet list
│   │   └── settings.tsx          # User settings
│   ├── _layout.tsx               # Root layout + navigation
│   ├── login.tsx                 # Login screen
│   └── +not-found.tsx            # 404 screen
├── components/                   # Reusable components
│   ├── add-entry/                # Add entry screen components
│   │   ├── ClientCard.tsx
│   │   ├── DateSelectorCard.tsx
│   │   ├── DuplicateYesterdayButton.tsx
│   │   ├── ExpandToggle.tsx
│   │   ├── TimeEntryPairRow.tsx
│   │   ├── TotalHoursDisplay.tsx
│   │   └── WeekStripCard.tsx
│   └── ...                       # Other shared components
├── constants/                    # Constants and config
│   └── add-entry.ts              # Add entry constants
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Authentication state
│   ├── useNotifications.ts       # Notification handling
│   ├── useOfflineQueue.ts        # Offline queue management
│   └── useTimePicker.ts          # Time picker logic
├── lib/                          # Core libraries
│   ├── auth/                     # Authentication module
│   │   ├── okta-config.ts
│   │   ├── okta-service.ts
│   │   ├── biometric-service.ts
│   │   └── README.md             # Auth documentation
│   ├── notifications/            # Notification service
│   │   └── NotificationService.ts
│   ├── apollo-client.ts          # GraphQL client setup
│   ├── offline-queue.ts          # Offline queue implementation
│   └── storage.ts                # AsyncStorage wrapper
├── types/                        # TypeScript type definitions
│   └── add-entry.ts              # Add entry types
├── utils/                        # Utility functions
│   └── add-entry.ts              # Add entry utilities
├── assets/                       # Images, fonts, etc.
├── app.json                      # Expo configuration
├── tailwind.config.js            # Tailwind CSS config
└── package.json
```

## 🛠️ Development

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (for physical device testing)

### Installation

```bash
# From monorepo root
pnpm install

# Or from this directory
cd apps/mobile
pnpm install
```

### Environment Variables

Create `.env` file in `apps/mobile`:

```bash
# Backend API
EXPO_PUBLIC_API_URL="http://localhost:3000/graphql"

# Okta Configuration (optional - use mock auth for development)
EXPO_PUBLIC_OKTA_ISSUER="https://number8.okta.com/oauth2/default"
EXPO_PUBLIC_OKTA_CLIENT_ID="your-okta-client-id"
EXPO_PUBLIC_OKTA_REDIRECT_URI="exp://localhost:8081"
```

**Development Without Okta:**
1. Enable mock auth in backend: `ENABLE_MOCK_AUTH=true`
2. Use backend's `mockLogin` mutation to get JWT token
3. Store token manually in app (see Mock Authentication section below)

### Running the App

```bash
# Start Expo dev server
pnpm dev

# Or run on specific platform
pnpm ios         # iOS simulator
pnpm android     # Android emulator
pnpm web         # Web browser

# Start with cache cleared
pnpm start --clear
```

### Type Checking

```bash
pnpm run type-check
```

## 🔐 Authentication

### Okta SSO Flow

1. User taps "Login with Okta"
2. App opens browser for Okta authentication
3. User authenticates with Okta credentials
4. Browser redirects back to app with authorization code
5. App exchanges code for Okta tokens (ID token, access token, refresh token)
6. App sends ID token to backend `/login` mutation
7. Backend validates Okta token and returns JWT
8. App stores JWT and Okta tokens in AsyncStorage
9. Subsequent requests include JWT in Authorization header

### Biometric Authentication

After first Okta login, users can enable biometric unlock:

1. Go to Settings
2. Enable "Biometric Unlock"
3. Confirm with Face ID / Fingerprint
4. On next app launch, biometric prompt appears
5. Successful biometric → restore session from stored tokens
6. Failed biometric → fallback to Okta login

**Note:** Biometric only works if valid session tokens exist. If JWT expired and refresh fails, user must re-authenticate with Okta.

### Mock Authentication (Development)

For development without Okta:

1. **Backend Setup:**
   ```bash
   # In apps/backend/.env
   ENABLE_MOCK_AUTH="true"
   
   # Seed database
   npx prisma db seed
   ```

2. **Get JWT Token:**
   ```graphql
   # In GraphQL Playground (http://localhost:3000/graphql)
   mutation {
     mockLogin(input: { email: "john.doe@example.com" }) {
       accessToken
       user {
         name
         email
       }
     }
   }
   ```

3. **Use in Mobile App:**
   ```typescript
   import { Storage } from './lib/storage';
   
   // Store mock auth data
   await Storage.setItem('auth_tokens', {
     jwtToken: '<access-token-from-mutation>',
     jwtExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
     user: {
       id: '1',
       externalId: 'mock-user-1',
       name: 'John Doe',
       email: 'john.doe@example.com',
       etoBalance: 80,
     },
   });
   ```

4. **Restart app** - Should be authenticated

**Available Test Users:**
- john.doe@example.com
- jane.smith@example.com
- mike.wilson@example.com
- emily.davis@example.com
- chris.anderson@example.com

## 📡 GraphQL API Integration

### Apollo Client Setup

The app uses Apollo Client for GraphQL operations:

- **Cache**: InMemoryCache with type policies
- **Auth Link**: Automatically adds JWT to all requests
- **Error Link**: Handles 401 errors and token refresh
- **Optimistic Updates**: Immediate UI feedback

### Example Query

```typescript
import { useQuery } from '@apollo/client';
import { GET_TIMESHEETS } from './graphql/queries';

function TimesheetList() {
  const { data, loading, error } = useQuery(GET_TIMESHEETS, {
    variables: { payPeriodId: 'current' },
  });
  
  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return (
    <View>
      {data.timesheets.map(timesheet => (
        <TimesheetCard key={timesheet.id} data={timesheet} />
      ))}
    </View>
  );
}
```

## 🔔 Push Notifications

### Setup

1. **Request Permission:**
   ```typescript
   import { useNotifications } from './hooks/useNotifications';
   
   function App() {
     const { requestPermission, hasPermission } = useNotifications();
     
     useEffect(() => {
       requestPermission();
     }, []);
   }
   ```

2. **Token Registration:** Automatic on app startup if permission granted

3. **Handle Notifications:**
   ```typescript
   const { notifications } = useNotifications();
   
   useEffect(() => {
     // Last received notification
     console.log(notifications[0]);
   }, [notifications]);
   ```

### Notification Types

- **Deadline Reminders** - Sent on 5th and 20th of each month
- **Submission Confirmations** - When timesheet submitted
- **Approval Notifications** - When timesheet approved/rejected

## 💾 Offline Support

### Offline Queue

All mutations are queued when offline:

```typescript
import { useOfflineQueue } from './hooks/useOfflineQueue';

function AddEntryScreen() {
  const { enqueue } = useOfflineQueue();
  
  const handleSave = async (entry) => {
    await enqueue({
      type: 'TimeEntry',
      operation: 'CREATE',
      data: entry,
    });
    // UI updates immediately (optimistic)
    // Syncs automatically when online
  };
}
```

### Queue Management

- **FIFO**: Operations processed in order
- **Retry**: Failed operations automatically retried
- **Cleanup**: Items older than 7 days or exceeding max retries removed
- **Conflict Resolution**: Server-side conflict detection and resolution

## 🎨 Styling with NativeWind

The app uses NativeWind 4 (Tailwind CSS for React Native):

```tsx
import { View, Text } from 'react-native';

export function Card({ title, children }) {
  return (
    <View className="bg-white rounded-lg p-4 shadow-md mb-4">
      <Text className="text-lg font-bold text-gray-900 mb-2">
        {title}
      </Text>
      {children}
    </View>
  );
}
```

**Bento Box Design System:**
- Card-based layouts
- Consistent spacing (4, 8, 12, 16, 24px)
- Touch-friendly sizing (min 44x44pt)
- Modern color palette

## 🧪 Testing

### Unit Tests

```bash
pnpm test
```

### E2E Tests (Planned)

```bash
pnpm test:e2e
```

## 🐛 Troubleshooting

### Metro Bundler Issues

```bash
# Clear cache
pnpm start --clear

# Or manually
rm -rf .expo
rm -rf node_modules/.cache
```

### iOS Build Issues

```bash
cd ios
pod install
cd ..
```

### Android Build Issues

```bash
cd android
./gradlew clean
cd ..
```

### GraphQL Network Errors

- Check backend is running: `http://localhost:3000/graphql`
- Verify `EXPO_PUBLIC_API_URL` in `.env`
- Check JWT token is valid (not expired)

### Okta Authentication Fails

- Verify Okta credentials in `.env`
- Check redirect URI matches Okta app configuration
- Use mock auth for development (see Mock Authentication section)

### Push Notifications Not Working

- Check permissions granted: Settings → TimeTrack → Notifications
- Verify token registered: Check `pushToken` in consultant profile
- Test with backend `testNotification` mutation

### Offline Sync Issues

- Check AsyncStorage: `await Storage.getItem('@timetrack:offline_queue')`
- Clear queue: `await OfflineQueue.clear()`
- Verify network connection restored

## 📚 Documentation

- [Authentication Module](lib/auth/README.md) - Okta, JWT, biometric auth
- [Offline Queue](lib/README.md) - Queue management and sync
- [Backend API](../backend/README.md) - GraphQL API documentation

## 🔗 Related Files

- `tailwind.config.js` - Tailwind CSS configuration
- `app.json` - Expo configuration and app metadata
- `metro.config.js` - Metro bundler configuration
- `tsconfig.json` - TypeScript compiler options

## 🚀 Deployment

### Build for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

### Submit to Stores

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

**Prerequisites:**
- Expo account
- EAS CLI installed: `npm install -g eas-cli`
- Apple Developer account (iOS)
- Google Play Developer account (Android)

## 📄 License

Proprietary - TimeTrack Mobile App

## 👥 Contributors

Internal project for consultant time tracking.

---

**Need help?** Check the [Auth README](lib/auth/README.md) or [Backend README](../backend/README.md) for more details.
