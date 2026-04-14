# TimeTrack Backend API

NestJS GraphQL API for the TimeTrack mobile time tracking application.

## Tech Stack

- **Framework**: NestJS
- **API**: GraphQL with Apollo Server
- **Database**: MongoDB with Prisma ORM
- **Authentication**: Okta OIDC + JWT (Passport)
- **Validation**: Zod schemas
- **Testing**: Jest
- **Language**: TypeScript

## Features

- ✅ Okta SSO authentication with JWT tokens
- ✅ Mock authentication for development (no Okta required)
- ✅ GraphQL API with type-safe resolvers
- ✅ MongoDB database with Prisma ORM
- ✅ JWT guards and decorators for authorization
- ✅ Zod validation for all entities
- ✅ Timesheet management (create, update, submit, approve)
- ✅ ETO tracking (accruals, usage, balance management)
- ✅ Offline sync with conflict resolution
- ✅ Push notifications via Expo Server SDK
- ✅ Automated reminder cron jobs (5th and 20th of each month)
- ✅ Comprehensive test coverage (209 passing tests)
- ✅ Database seed file with mock data

## Prerequisites

- Node.js >= 20.0.0 (LTS)
- pnpm >= 8.0.0
- MongoDB instance (local or cloud)
- Okta developer account (optional - see Mock Authentication)

## Environment Variables

Create a `.env` file in the `apps/backend` directory:

```bash
# Database
DATABASE_URL="mongodb://localhost:27017/timetrack"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Okta Configuration
OKTA_ISSUER="https://number8.okta.com"
OKTA_CLIENT_ID="your-okta-client-id"
OKTA_CLIENT_SECRET="your-okta-client-secret"

# Server
PORT=3000

# Development
ENABLE_MOCK_AUTH="true"  # Bypass Okta authentication for local development

# Push Notifications (optional)
EXPO_ACCESS_TOKEN="your-expo-access-token"
```

**⚠️ Important**: `JWT_SECRET` is required - the app will fail to start without it.

## Installation

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Generate Prisma client
cd apps/backend
npx prisma generate
```

## Database Setup

```bash
# Push schema to MongoDB (development)
npx prisma db push

# Generate Prisma client after schema changes
npx prisma generate

# Seed database with mock data (development)
npx prisma db seed
```

### Seed Data

The seed command creates:
- 5 mock consultants with various ETO balances
- Current and past pay periods
- Sample time entries (complete and incomplete weeks)
- Sample ETO transactions (accruals and usage)
- Timesheet submissions in various states (draft, submitted, approved, rejected)
- Sync logs

**Mock Consultant Emails:**
- john.doe@example.com
- jane.smith@example.com
- mike.wilson@example.com
- emily.davis@example.com
- chris.anderson@example.com

Use these emails with the `mockLogin` mutation (see Mock Authentication below).

## Running the App

### Option 1: Docker (Recommended)

**Quick Start:**
```bash
# From monorepo root
pnpm docker:up:dev
```

This will:
- Start MongoDB container
- Start backend in development mode with hot reload
- Automatically run migrations and seed database
- Expose backend on http://localhost:3000

**Docker Commands:**
```bash
# Start all services (MongoDB + backend dev)
pnpm docker:up:dev

# Stop all services
pnpm docker:down

# View backend logs
pnpm docker:logs

# View MongoDB logs
pnpm docker:logs:db

# Rebuild backend container (after dependency changes)
pnpm docker:rebuild

# Clean up (removes volumes - deletes database data)
pnpm docker:clean
```

**Environment Variables:**
Create `.env` file in project root:
```bash
JWT_SECRET="your-secret-key"
ENABLE_MOCK_AUTH="true"
# Optional: OKTA_*, EXPO_ACCESS_TOKEN
```

### Option 2: Local Development

**Requirements:**
- MongoDB running locally
- Node.js 20+

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

The GraphQL playground will be available at: http://localhost:3000/graphql

## Mock Authentication

For development without Okta credentials, enable mock authentication:

### Setup

1. Add to `.env`:
   ```bash
   ENABLE_MOCK_AUTH="true"
   ```

2. Seed the database to create test users:
   ```bash
   npx prisma db seed
   ```

### Usage

Use the `mockLogin` mutation in GraphQL Playground:

```graphql
mutation {
  mockLogin(input: { email: "john.doe@example.com" }) {
    accessToken
    expiresIn
    user {
      id
      externalId
      name
      email
      etoBalance
    }
  }
}
```

**Available Test Emails:**
- john.doe@example.com (80 ETO hours)
- jane.smith@example.com (120 ETO hours)
- mike.wilson@example.com (40.5 ETO hours)
- emily.davis@example.com (96 ETO hours)
- chris.anderson@example.com (64 ETO hours)

### Using the Token

Copy the `accessToken` from the response and add it to subsequent requests:

**HTTP Headers:**
```json
{
  "Authorization": "Bearer <access-token-here>"
}
```

**In GraphQL Playground:**
1. Click "HTTP HEADERS" at bottom
2. Add:
   ```json
   {
     "authorization": "Bearer <access-token-here>"
   }
   ```

### Security Warning

⚠️ **DEVELOPMENT ONLY** - Mock authentication completely bypasses Okta validation.

**Never enable in production:**
- Set `ENABLE_MOCK_AUTH="false"` or remove it entirely
- Mock login will return 401 Unauthorized when disabled

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Test coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## Project Structure

```
apps/backend/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── decorators/          # @CurrentUser(), @Public()
│   │   ├── guards/              # JwtAuthGuard
│   │   ├── strategies/          # JWT strategy
│   │   ├── dto/                 # Login, Mock Login DTOs
│   │   ├── auth.service.ts      # Auth logic + mock auth
│   │   ├── auth.resolver.ts     # Login, mockLogin mutations
│   │   └── auth.module.ts
│   ├── timesheet/               # Timesheet management
│   │   ├── timesheet.service.ts # CRUD operations
│   │   ├── timesheet.resolver.ts
│   │   └── submission.service.ts # Approval workflow
│   ├── eto/                     # ETO tracking
│   │   ├── eto.service.ts
│   │   └── eto.resolver.ts
│   ├── sync/                    # Offline sync
│   │   ├── sync.service.ts      # Conflict resolution
│   │   └── sync.resolver.ts
│   ├── notifications/           # Push notifications
│   │   ├── notifications.service.ts # Expo SDK integration
│   │   ├── notifications.resolver.ts # Register token, test
│   │   └── dto/                 # Notification DTOs
│   ├── reminders/               # Automated reminders
│   │   ├── reminders.service.ts # Cron jobs (5th, 20th)
│   │   └── reminders.module.ts
│   ├── prisma/                  # Prisma service
│   ├── generated/               # Generated Prisma client
│   ├── app.module.ts            # Root module
│   └── main.ts                  # Entry point
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Mock data seeding
├── test/                        # E2E tests
└── .env                         # Environment variables
```

## GraphQL API

### Accessing the API

1. **Health Check** (Public):
   ```graphql
   query {
     health
   }
   ```

2. **Protected Endpoints**:
   - Require JWT token in Authorization header
   - Format: `Authorization: Bearer <token>`

### Authentication Flow

1. User authenticates via Okta (mobile app)
2. Backend validates Okta profile → creates/finds consultant
3. Backend generates JWT token with consultant's externalId
4. Client includes JWT in all subsequent requests
5. JwtAuthGuard validates token and attaches user to context
6. Resolvers access user via @CurrentUser() decorator

### Using Guards and Decorators

```typescript
import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from './auth/guards';
import { CurrentUser } from './auth/decorators';
import { Consultant } from '@prisma/client';

@Resolver()
@UseGuards(JwtAuthGuard) // Protect all resolver methods
export class MyResolver {
  @Query(() => String)
  async getProfile(@CurrentUser() user: Consultant) {
    return `Hello, ${user.name}`;
  }

  @Query(() => String)
  @Public() // Mark as public endpoint
  async publicData() {
    return 'This is public';
  }
}
```

## Database Models

### Consultant
User accounts from Okta with ETO balance, work settings, push tokens, and notification preferences.

### PayPeriod
Bi-weekly pay periods (e.g., 04/01-04/15) with deadline dates.

### TimeEntry
Daily time entries with in/out times, project info, and sync status.

### ETOTransaction
Earned Time Off accruals, usage, and adjustments.

### TimesheetSubmission
Timesheet approval workflow (draft → submitted → approved/rejected).

### SyncLog
Offline sync tracking for mobile app operations.

## Push Notifications

The backend integrates with Expo's push notification service to send reminders and alerts to mobile devices.

### Features

- **Token Registration**: Mobile apps register Expo push tokens via `registerPushToken` mutation
- **Individual Notifications**: Send notifications to specific users
- **Bulk Notifications**: Send notifications to multiple users at once
- **Notification Preferences**: Users can customize notification types per consultant

### Setup

1. Get Expo access token from https://expo.dev/accounts/[account]/settings/access-tokens
2. Add to `.env`:
   ```bash
   EXPO_ACCESS_TOKEN="your-expo-access-token"
   ```

### GraphQL API

**Register Push Token:**
```graphql
mutation {
  registerPushToken(input: { token: "ExponentPushToken[...]" }) {
    success
  }
}
```

**Test Notification (development):**
```graphql
mutation {
  testNotification(input: {
    title: "Test Notification"
    body: "This is a test"
  }) {
    success
  }
}
```

### Integration

The `NotificationsService` provides methods for:
- `registerPushToken(userId, token)` - Store user's push token
- `sendPushNotification(userId, title, body, data)` - Send to single user
- `sendBulkNotifications(userIds, title, body, data)` - Send to multiple users

## Automated Reminders

The backend runs automated cron jobs to remind consultants of timesheet deadlines.

### Schedule

- **5th of each month** at 9:00 AM - Reminder for period ending on 15th
- **20th of each month** at 9:00 AM - Reminder for period ending on last day of month

### How It Works

1. Cron job triggers at scheduled time
2. Query database for incomplete timesheets in current pay period
3. Filter consultants who have enabled `deadlineReminders` preference
4. Send push notification to each consultant with push token

### Notification Preferences

Consultants can customize preferences in their profile:
```json
{
  "deadlineReminders": true,
  "submissionConfirmations": true,
  "approvalNotifications": true
}
```

### Manual Testing

```typescript
// In reminders.service.ts
await this.sendTimesheetReminders(); // Manually trigger reminder check
```

## Development

### Adding a New Feature

1. Create feature module: `nest g module features/my-feature`
2. Create service: `nest g service features/my-feature`
3. Create resolver: `nest g resolver features/my-feature`
4. Add tests: `my-feature.service.spec.ts`
5. Import module in `app.module.ts`

### Running Prisma Studio

```bash
npx prisma studio
```

Browse your database at: http://localhost:5555

## Common Issues

### JWT_SECRET not set
**Error**: `JWT_SECRET environment variable is required`  
**Fix**: Add `JWT_SECRET="your-secret-key"` to `.env` file

### Prisma client out of sync
**Error**: `PrismaClient is unable to be run in the browser`  
**Fix**: Run `npx prisma generate`

### MongoDB connection failed
**Error**: `Error connecting to MongoDB`  
**Fix**: Check `DATABASE_URL` in `.env` and ensure MongoDB is running

### Mock login returns 401
**Error**: `Mock authentication is disabled`  
**Fix**: Set `ENABLE_MOCK_AUTH="true"` in `.env` file

### Seed fails
**Error**: Cannot find consultant/pay period  
**Fix**: Run `npx prisma db push` first to create schema, then `npx prisma db seed`

### Push notifications not sending
**Error**: Expo push token invalid  
**Fix**: Check `EXPO_ACCESS_TOKEN` is valid and mobile app registered token correctly

## Architecture Decisions

- **externalId**: Used as the primary identifier for consultants (maps to Okta user ID)
- **JWT Payload**: Contains externalId in `sub` claim for secure user lookup
- **Global Guard**: JwtAuthGuard can be set as global (use @Public() for exceptions)
- **GraphQL Context**: Request object passed through GraphQL context for auth

## Scripts

```bash
# Development
pnpm run start:dev       # Start with hot reload
pnpm run start:debug     # Start with debugger

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database (dev)
npx prisma db seed       # Seed with mock data
npx prisma studio        # Open Prisma Studio GUI

# Testing
pnpm test                # Run all tests (209 tests)
pnpm test:watch          # Watch mode
pnpm test:cov            # With coverage
pnpm test:e2e            # E2E tests

# Code Quality
pnpm run format          # Format with Prettier
pnpm run lint            # Lint with ESLint

# Build
pnpm run build           # Build for production
pnpm run start:prod      # Start production server

# Generate Resources
pnpm run nest -- generate resource features/my-feature
```

## Contributing

1. Create feature branch from `main`
2. Make changes with tests
3. Run `pnpm test` to verify
4. Run `pnpm run lint` to check style
5. Commit with pattern: `[module-name] description`
6. Push and create pull request

## License

Proprietary - TimeTrack Mobile App
