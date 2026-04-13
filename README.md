# TimeTrack Monorepo

Full-stack time tracking application with React Native mobile app and NestJS GraphQL backend.

## 📋 Overview

TimeTrack is a comprehensive time tracking system built for consultants to manage timesheets, track Earned Time Off (ETO), and submit timesheets for approval. The system features offline-first mobile apps with automatic sync, biometric authentication, and push notifications for deadline reminders.

## 🏗️ Architecture

```
timetrack/
├── apps/
│   ├── backend/          # NestJS GraphQL API + MongoDB
│   └── mobile/           # React Native (Expo) mobile app
├── packages/
│   └── shared/           # Shared types, validation schemas
├── docs/                 # Documentation and analysis
└── design/               # UI/UX designs and specifications
```

### Tech Stack

**Backend:**
- NestJS 11 - Progressive Node.js framework
- GraphQL (Apollo Server 5) - Type-safe API layer
- MongoDB + Prisma ORM - Database and migrations
- Okta OIDC + JWT - Authentication and authorization
- Expo Server SDK - Push notifications
- Jest 29.7 - Testing framework

**Mobile:**
- React Native (Expo SDK 54) - Cross-platform mobile
- React 19.1 - UI framework (Expo-customized)
- Expo Router 6 - File-based navigation
- Apollo Client 4 - GraphQL client with caching
- NativeWind 4 - Tailwind CSS for React Native
- AsyncStorage - Offline data persistence
- Biometric authentication - Face ID / Fingerprint

**Shared:**
- TypeScript 5.9.2 - Type safety across monorepo
- Zod - Runtime validation schemas
- date-fns - Date manipulation

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 20.0.0 (LTS)
- **pnpm**: >= 8.0.0 (package manager)
- **Docker** (recommended) OR **MongoDB**: Local instance or MongoDB Atlas
- **Okta Account**: For authentication (optional for development - see mock auth)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd timetrack

# Install dependencies
pnpm install

# Generate Prisma client
cd apps/backend
npx prisma generate
cd ../..
```

### Environment Setup

#### Backend (.env)

Create `apps/backend/.env`:

```bash
# Database
DATABASE_URL="mongodb://localhost:27017/timetrack"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# Okta Configuration (optional - use mock auth for development)
OKTA_ISSUER="https://number8.okta.com"
OKTA_CLIENT_ID="your-okta-client-id"
OKTA_CLIENT_SECRET="your-okta-client-secret"

# Push Notifications (optional)
EXPO_ACCESS_TOKEN="your-expo-access-token"

# Development
ENABLE_MOCK_AUTH="true"  # Bypass Okta for local development

# Server
PORT=3000
NODE_ENV="development"
```

#### Mobile (.env)

Create `apps/mobile/.env`:

```bash
# Backend API
EXPO_PUBLIC_API_URL="http://localhost:3000/graphql"

# Okta Configuration (optional - use mock auth)
EXPO_PUBLIC_OKTA_ISSUER="https://number8.okta.com/oauth2/default"
EXPO_PUBLIC_OKTA_CLIENT_ID="your-okta-client-id"
EXPO_PUBLIC_OKTA_REDIRECT_URI="exp://localhost:8081"
```

### Quick Start with Docker

```bash
# Start backend + MongoDB
pnpm docker:up:dev

# Backend available at http://localhost:3000/graphql
# Database automatically migrated and seeded
```

### Manual Database Setup (Without Docker)

```bash
cd apps/backend
npx prisma db push           # Create database schema
npx prisma db seed           # Load mock data
```

This creates:
- 5 mock consultants
- Current and past pay periods
- Sample time entries and ETO transactions
- Various timesheet submission states

### Running the Apps

#### Backend API

**Option 1: Docker (Recommended)**

```bash
# Start with Docker (includes MongoDB)
pnpm docker:up:dev

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down
```

Backend runs on http://localhost:3000  
MongoDB runs on localhost:27017

**Docker automatically:**
- Starts MongoDB with authentication
- Runs database migrations
- Seeds mock data
- Enables hot reload for development

**Option 2: Local Development**

```bash
# From root
pnpm backend start:dev

# Or from apps/backend
pnpm start:dev
```

Requires MongoDB running locally.

GraphQL Playground: http://localhost:3000/graphql

#### Mobile App

```bash
# From root
pnpm mobile dev

# Or from apps/mobile
pnpm dev

# Run on specific platform
pnpm mobile ios      # iOS simulator
pnpm mobile android  # Android emulator
```

### Mock Authentication (No Okta Required)

For development without Okta credentials:

1. Set `ENABLE_MOCK_AUTH=true` in backend `.env`
2. Use the `mockLogin` mutation in GraphQL:

```graphql
mutation {
  mockLogin(email: "john.doe@example.com") {
    token
    user {
      id
      name
      email
    }
  }
}
```

3. Copy the JWT token and use in mobile app or GraphQL headers

See [Backend README](apps/backend/README.md#mock-authentication) for details.

## 📦 Monorepo Structure

### Workspace Packages

| Package | Description | Tech |
|---------|-------------|------|
| `@timetrack/backend` | GraphQL API server | NestJS, Prisma, MongoDB |
| `@timetrack/mobile` | Mobile application | React Native, Expo |
| `@timetrack/shared` | Shared code and types | TypeScript, Zod |

### Package Scripts

#### Root Level

```bash
pnpm dev          # Start all packages in dev mode
pnpm build        # Build all packages
pnpm test         # Run all tests
pnpm type-check   # Type check all packages
pnpm lint         # Lint all packages
```

#### Backend Shortcuts

```bash
pnpm backend start:dev    # Start backend dev server
pnpm backend test         # Run backend tests
pnpm backend build        # Build backend
```

#### Mobile Shortcuts

```bash
pnpm mobile dev           # Start Expo dev server
pnpm mobile ios           # Run on iOS
pnpm mobile android       # Run on Android
pnpm mobile type-check    # Type check mobile app
```

## 🧪 Testing

### Backend Tests

```bash
cd apps/backend
pnpm test              # Run all tests (209 tests)
pnpm test:watch        # Watch mode
pnpm test:cov          # With coverage
```

**Test coverage:**
- Auth module (login, JWT, guards)
- Timesheet service and resolvers
- ETO service and resolvers
- Sync service and resolvers
- Notifications service
- Reminders service

### Mobile Tests

```bash
cd apps/mobile
pnpm test              # Run tests (coming soon)
```

### Shared Package Tests

```bash
cd packages/shared
pnpm test              # Run validation tests
```

## 🏛️ Key Features

### Backend

- ✅ **GraphQL API** - Type-safe API with Apollo Server
- ✅ **Okta Authentication** - OIDC with JWT tokens
- ✅ **Mock Authentication** - Development bypass for Okta
- ✅ **Authorization Guards** - JWT validation and @CurrentUser decorator
- ✅ **Database ORM** - Prisma with MongoDB
- ✅ **Push Notifications** - Expo push notification integration
- ✅ **Automated Reminders** - Cron jobs for timesheet deadlines (5th and 20th)
- ✅ **Offline Sync** - Conflict resolution for mobile sync
- ✅ **Validation** - Zod schemas for all inputs
- ✅ **Comprehensive Tests** - 209 passing tests

### Mobile

- ✅ **Okta SSO** - Single sign-on with OIDC
- ✅ **Biometric Auth** - Face ID / Fingerprint unlock
- ✅ **Offline Queue** - AsyncStorage-based offline operations
- ✅ **Push Notifications** - Permission handling and token registration
- ✅ **Apollo GraphQL Client** - Optimistic updates and caching
- ✅ **Expo Router** - File-based navigation
- ✅ **NativeWind** - Tailwind CSS styling
- ✅ **Bento Box Design** - Modern card-based UI system
- ✅ **Time Entry Management** - Add, edit, duplicate entries
- ✅ **ETO Tracking** - View balance and transactions
- ✅ **Timesheet Submission** - Submit for approval

## 📚 Documentation

- [Backend Documentation](apps/backend/README.md)
- [Mobile Documentation](apps/mobile/README.md)
- [Auth Module](apps/mobile/lib/auth/README.md)
- [Offline Queue](apps/mobile/lib/README.md)
- [Dependency Analysis](docs/DEPENDENCY_COMPATIBILITY_ANALYSIS_CORRECTED.md)
- [Design System](design/bento-box-system.md)

## 🔧 Development Workflow

### Creating a New Feature

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Backend changes**
   ```bash
   cd apps/backend
   # Add module/service/resolver
   nest g module features/my-feature
   nest g service features/my-feature
   nest g resolver features/my-feature
   # Add tests
   # Update schema if needed
   npx prisma generate
   ```

3. **Mobile changes**
   ```bash
   cd apps/mobile
   # Add screen/component/hook
   # Update GraphQL queries
   # Add to navigation
   ```

4. **Test changes**
   ```bash
   pnpm test          # Run all tests
   pnpm type-check    # Type check
   pnpm lint          # Lint code
   ```

5. **Commit with pattern**
   ```bash
   git commit -m "[module-name] description"
   # Example: [auth-service] Add biometric authentication
   ```

### Updating Dependencies

Dependencies are standardized across the monorepo:

- **TypeScript**: 5.9.2
- **Jest**: 29.7.0
- **Node.js**: >= 20.0.0
- **React**: 19.1.0 (Expo SDK 54)
- **React Native**: 0.81.5 (Expo custom build)

**Expo dependencies**: Always use `expo install` for Expo packages:

```bash
cd apps/mobile
expo install <package-name>
```

See [Dependency Analysis](docs/DEPENDENCY_COMPATIBILITY_ANALYSIS_CORRECTED.md) for details.

### Database Changes

1. **Update Prisma schema**
   ```bash
   cd apps/backend
   # Edit prisma/schema.prisma
   npx prisma generate     # Regenerate client
   npx prisma db push      # Push to database (dev)
   ```

2. **Update seed file** (if needed)
   ```bash
   # Edit prisma/seed.ts
   npx prisma db seed
   ```

## 🐛 Troubleshooting

### Backend Issues

**MongoDB connection failed**
```bash
# Check MongoDB is running
mongod --version
# Verify DATABASE_URL in .env
```

**Prisma client out of sync**
```bash
cd apps/backend
npx prisma generate
```

**JWT_SECRET not set**
```bash
# Add to apps/backend/.env
JWT_SECRET="your-secret-key"
```

### Mobile Issues

**Metro bundler cache issues**
```bash
cd apps/mobile
pnpm run dev --clear     # Clear cache
```

**iOS build fails**
```bash
cd ios && pod install && cd ..
```

**Android build fails**
```bash
cd android && ./gradlew clean && cd ..
```

**Okta configuration errors**
- Use mock auth: Set `ENABLE_MOCK_AUTH=true` in backend
- Check redirect URI matches Okta app config

## 🔒 Security

### Production Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Disable `ENABLE_MOCK_AUTH`
- [ ] Configure proper Okta credentials
- [ ] Use MongoDB with authentication
- [ ] Enable HTTPS/TLS
- [ ] Set up proper CORS policies
- [ ] Review and rotate API keys
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging

## 📊 Project Status

**Version**: 1.0.0  
**Status**: Active Development

**Completed:**
- ✅ Backend GraphQL API
- ✅ Mobile app core features
- ✅ Authentication (Okta + JWT + Biometric)
- ✅ Offline sync system
- ✅ Push notifications
- ✅ Automated reminders
- ✅ Timesheet management
- ✅ ETO tracking

**In Progress:**
- 🚧 E2E testing
- 🚧 Deployment pipelines
- 🚧 Performance optimization

**Planned:**
- 📋 Admin dashboard
- 📋 Reporting and analytics
- 📋 Team lead approval workflow

## 🤝 Contributing

1. Create feature branch from `main`
2. Follow commit message pattern: `[module-name] description`
3. Ensure all tests pass: `pnpm test`
4. Type check: `pnpm type-check`
5. Lint code: `pnpm lint`
6. Create pull request

**Commit prefixes:**
- `[auth-service]` - Authentication changes
- `[timesheet-service]` - Timesheet features
- `[mobile-ui]` - Mobile UI changes
- `[notifications]` - Notification system
- `[offline-sync]` - Sync functionality
- `[refactor]` - Code refactoring
- `[tests]` - Test additions/updates
- `[docs]` - Documentation updates

## 📄 License

Proprietary - TimeTrack Mobile App

## 👥 Team

Internal project for consultant time tracking.

---

**Need help?** Check the [Backend README](apps/backend/README.md) or [Mobile README](apps/mobile/README.md) for detailed documentation.
