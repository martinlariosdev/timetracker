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
- ✅ GraphQL API with type-safe resolvers
- ✅ MongoDB database with Prisma ORM
- ✅ JWT guards and decorators for authorization
- ✅ Zod validation for all entities
- ✅ Comprehensive test coverage
- 🚧 Timesheet management (in progress)
- 🚧 ETO tracking (in progress)
- 🚧 Offline sync (planned)

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MongoDB instance (local or cloud)
- Okta developer account

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
```

## Running the App

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

The GraphQL playground will be available at: http://localhost:3000/graphql

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
│   ├── auth/               # Authentication module
│   │   ├── decorators/     # @CurrentUser(), @Public()
│   │   ├── guards/         # JwtAuthGuard
│   │   ├── strategies/     # JWT strategy
│   │   ├── auth.service.ts # Auth logic
│   │   └── auth.module.ts
│   ├── prisma/             # Prisma service
│   ├── generated/          # Generated Prisma client
│   ├── app.module.ts       # Root module
│   └── main.ts             # Entry point
├── prisma/
│   └── schema.prisma       # Database schema
├── test/                   # E2E tests
└── .env                    # Environment variables
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
User accounts from Okta with ETO balance and work settings.

### PayPeriod
Bi-weekly pay periods (e.g., 04/01-04/15).

### TimeEntry
Daily time entries with in/out times and project info.

### ETOTransaction
Earned Time Off accruals and usage.

### TimesheetSubmission
Timesheet approval workflow.

### SyncLog
Offline sync tracking for mobile app.

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
**Fix**: Add JWT_SECRET to your .env file

### Prisma client out of sync
**Error**: `PrismaClient is unable to be run in the browser`
**Fix**: Run `npx prisma generate`

### MongoDB connection failed
**Error**: `Error connecting to MongoDB`
**Fix**: Check DATABASE_URL and ensure MongoDB is running

## Architecture Decisions

- **externalId**: Used as the primary identifier for consultants (maps to Okta user ID)
- **JWT Payload**: Contains externalId in `sub` claim for secure user lookup
- **Global Guard**: JwtAuthGuard can be set as global (use @Public() for exceptions)
- **GraphQL Context**: Request object passed through GraphQL context for auth

## Scripts

```bash
# Generate NestJS resources
pnpm run nest -- generate resource features/my-feature

# Format code
pnpm run format

# Lint code
pnpm run lint

# Build for production
pnpm run build
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
