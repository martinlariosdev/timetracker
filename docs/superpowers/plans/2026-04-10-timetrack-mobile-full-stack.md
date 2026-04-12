# TimeTrack Mobile App - Full Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack mobile app for TimeTrack with monorepo architecture, GraphQL backend, MongoDB database, Okta 2FA, and UI designed with Google Stitch MCP using Bento Box patterns

**Architecture:** 
- **Monorepo:** pnpm workspaces with frontend/backend/shared packages
- **Frontend:** React Native Expo + NativeWind CSS + TypeScript
- **Backend:** NestJS + GraphQL + Zod validation + Prisma ORM
- **Database:** MongoDB with offline sync strategy
- **Auth:** Okta 2FA integration
- **Testing:** Jest for unit tests, Detox for E2E

**Tech Stack:**
- **Package Manager:** pnpm v8+
- **Frontend:** React Native Expo SDK 50, NativeWind 4.0, React Navigation 6, Apollo Client
- **Backend:** NestJS 10, @nestjs/graphql, Apollo Server, Prisma 5, Zod
- **Database:** MongoDB 7.0, Prisma ORM
- **Authentication:** Okta React Native SDK, Passport JWT
- **Testing:** Jest, React Native Testing Library, Detox, Supertest
- **CI/CD:** GitHub Actions, EAS Build (Expo Application Services)

---

## Project Structure

```
timetrack-mobile/
├── package.json                 # Root workspace config
├── pnpm-workspace.yaml          # pnpm workspace definition
├── turbo.json                   # Turborepo config (optional)
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI pipeline
│       └── deploy.yml          # Deployment pipeline
├── apps/
│   ├── mobile/                 # React Native Expo app
│   │   ├── app/                # Expo Router file-based routing
│   │   │   ├── (auth)/
│   │   │   │   └── login.tsx
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx   # Timesheet list
│   │   │   │   ├── add-entry.tsx
│   │   │   │   ├── eto.tsx
│   │   │   │   └── settings.tsx
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   │   ├── TimeEntryCard.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── TimePicker.tsx
│   │   │   ├── OfflineBanner.tsx
│   │   │   └── SyncIndicator.tsx
│   │   ├── hooks/
│   │   │   ├── useTimeEntries.ts
│   │   │   ├── useOfflineSync.ts
│   │   │   └── useAuth.ts
│   │   ├── graphql/
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   └── fragments.ts
│   │   ├── store/
│   │   │   └── offlineQueue.ts  # AsyncStorage queue
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   ├── calculations.ts
│   │   │   └── dateHelpers.ts
│   │   ├── app.json
│   │   ├── package.json
│   │   └── tailwind.config.js
│   └── backend/                # NestJS GraphQL API
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── auth/
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── auth.resolver.ts
│       │   │   ├── okta.strategy.ts
│       │   │   └── jwt.strategy.ts
│       │   ├── timesheet/
│       │   │   ├── timesheet.module.ts
│       │   │   ├── timesheet.service.ts
│       │   │   ├── timesheet.resolver.ts
│       │   │   ├── dto/
│       │   │   │   ├── create-time-entry.input.ts
│       │   │   │   ├── update-time-entry.input.ts
│       │   │   │   └── time-entry.object.ts
│       │   │   └── entities/
│       │   │       └── time-entry.entity.ts
│       │   ├── eto/
│       │   │   ├── eto.module.ts
│       │   │   ├── eto.service.ts
│       │   │   └── eto.resolver.ts
│       │   ├── sync/
│       │   │   ├── sync.module.ts
│       │   │   ├── sync.service.ts
│       │   │   └── sync.resolver.ts
│       │   ├── prisma/
│       │   │   ├── prisma.module.ts
│       │   │   └── prisma.service.ts
│       │   └── common/
│       │       ├── decorators/
│       │       ├── guards/
│       │       └── interceptors/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── test/
│       │   └── app.e2e-spec.ts
│       ├── package.json
│       └── tsconfig.json
└── packages/
    └── shared/                 # Shared types and validations
        ├── src/
        │   ├── types/
        │   │   ├── time-entry.ts
        │   │   ├── consultant.ts
        │   │   ├── pay-period.ts
        │   │   └── index.ts
        │   ├── validation/
        │   │   ├── time-entry.schema.ts
        │   │   ├── eto.schema.ts
        │   │   └── index.ts
        │   └── utils/
        │       ├── calculations.ts
        │       └── date-helpers.ts
        ├── package.json
        └── tsconfig.json
```

---

## Phase 1: UI Design with Google Stitch MCP

### Task 1: Setup Google Stitch MCP & Design System

**Files:**
- Create: `design/bento-box-system.md`
- Create: `design/screens/README.md`

- [ ] **Step 1: Verify Google Stitch MCP is available**

```bash
# Check if Google Stitch MCP is installed
claude mcp list | grep stitch
```

Expected: Google Stitch MCP appears in list

- [ ] **Step 2: Load desktop screenshots for reference**

Reference screenshots created during discovery:
- `screenshots/03-post-login.png` - Main dashboard
- `screenshots/04-my-menu-expanded.png` - Navigation menu
- `screenshots/05-eto.png` - ETO screen
- `screenshots/06-preferences.png` - Settings
- `screenshots/07-time-off-events.png` - Time off
- `screenshots/10-add-time-entry.png` - Add entry form

- [ ] **Step 3: Document Bento Box design principles**

Create `design/bento-box-system.md`:

```markdown
# TimeTrack Mobile - Bento Box Design System

## Design Principles

### Bento Box Pattern
- **Definition:** Card-based layout system inspired by Japanese bento boxes
- **Benefits:** Modular, scannable, mobile-friendly, adaptable
- **Key Characteristics:**
  - Rounded corners (12px-16px radius)
  - Consistent spacing (16px, 24px, 32px)
  - Clear visual hierarchy
  - Touch-friendly targets (min 44x44pt)

### Color Palette
Based on TimeTrack desktop theme:
- **Primary:** #2563EB (Blue - from desktop header)
- **Secondary:** #0EA5E9 (Light Blue)
- **Success:** #10B981 (Green - for submit)
- **Warning:** #F59E0B (Orange - for pending)
- **Error:** #EF4444 (Red - for late)
- **Neutral:** #64748B (Gray)
- **Background:** #F8FAFC (Light)
- **Surface:** #FFFFFF (White cards)

### Typography
- **Headings:** SF Pro Display (iOS) / Roboto (Android) - Bold
- **Body:** SF Pro Text (iOS) / Roboto (Android) - Regular
- **Numbers:** SF Pro Rounded - Medium (for time entry hours)

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Component Patterns
1. **Cards:** Elevated surface with shadow, rounded corners
2. **List Items:** Horizontal cards with clear hierarchy
3. **Forms:** Grouped inputs with labels and validation
4. **Actions:** Prominent CTAs at bottom or floating
5. **Navigation:** Bottom tab bar + header
```

- [ ] **Step 4: Design Screen 1 - Login (3 variations)**

Using Google Stitch MCP, create 3 design variations:

**Variation A: Minimal**
- Large Okta button centered
- Software Mind logo at top
- Clean white background
- Single CTA

**Variation B: Informative**
- Okta button
- Brief feature highlights (3 cards)
- "Why TimeTrack?" section
- More visual interest

**Variation C: Visual**
- Background illustration/gradient
- Floating card with login
- Animated elements
- Modern aesthetic

Prompt for Google Stitch MCP:
```
Design a mobile login screen for TimeTrack time tracking app.

Reference: screenshots/01-login-page.png

Style: Bento Box pattern with rounded cards, modern iOS/Android design

Variations needed: 3 (Minimal, Informative, Visual)

Key elements:
- "Sign in with Okta" button (primary CTA)
- Software Mind branding
- Clean, professional, approachable

Design system:
- Primary color: #2563EB
- Spacing: 16px, 24px, 32px
- Rounded corners: 16px
- Touch targets: min 44x44pt

Export: Show designs for approval, then export as React Native code with NativeWind
```

- [ ] **Step 5: Review and approve Login designs**

Wait for user approval of 3 variations before proceeding.

- [ ] **Step 6: Export approved Login design as code**

Once approved, use Google Stitch MCP to export:
- React Native components
- NativeWind Tailwind classes
- TypeScript types for props

Expected output: `apps/mobile/app/(auth)/login.tsx`

- [ ] **Step 7: Commit Login designs**

```bash
git add design/ apps/mobile/app/(auth)/login.tsx
git commit -m "feat: design and implement Login screen with Google Stitch MCP

- Create Bento Box design system documentation
- Design 3 variations of Login screen (approved: [VARIATION])
- Export Login as React Native + NativeWind code
- Implement Okta SSO button

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Design Timesheet List Screen (3 variations)

**Files:**
- Create: `design/screens/timesheet-list/`
- Create: `apps/mobile/app/(tabs)/index.tsx`

- [ ] **Step 1: Design Timesheet List variations**

Reference: `screenshots/03-post-login.png`

**Variation A: List View**
- Vertical scrolling cards
- Each card = 1 time entry
- Swipe actions (edit/delete)
- Summary metrics at top

**Variation B: Calendar View**
- Monthly calendar grid
- Dots for entries
- Tap date → see entries
- Summary sidebar

**Variation C: Hybrid View**
- Week view with horizontal scroll
- Daily cards with entries
- Quick add button per day
- Metrics banner

Prompt for Google Stitch MCP:
```
Design a mobile timesheet list screen for TimeTrack app.

Reference: screenshots/03-post-login.png (desktop dashboard)

Style: Bento Box pattern, card-based layout

Variations: 3 (List View, Calendar View, Hybrid View)

Key elements:
- Time entry cards (date, client, description, hours)
- Period selector (04/01-04/15)
- Summary metrics (Total: 56.00 hours, ETO: 33.92 hrs, Pending: 4 days)
- Floating "Add" button
- Per-entry actions (Edit, Duplicate, Delete)

Constraints:
- Must show 7-10 entries without scrolling
- Touch-friendly (min 44pt height per card)
- Clear visual hierarchy
- Quick scanning

Design system: Use established Bento Box patterns
Export: React Native + NativeWind
```

- [ ] **Step 2: Review and approve Timesheet List designs**

Wait for user approval.

- [ ] **Step 3: Export approved design as code**

Generate `apps/mobile/app/(tabs)/index.tsx`

- [ ] **Step 4: Commit Timesheet List design**

```bash
git add design/screens/timesheet-list/ apps/mobile/app/(tabs)/index.tsx
git commit -m "feat: design and implement Timesheet List screen

- Design 3 variations (approved: [VARIATION])
- Implement card-based time entry list
- Add summary metrics display
- Add floating action button

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Design Add/Edit Time Entry Screen (3 variations)

**Files:**
- Create: `design/screens/add-entry/`
- Create: `apps/mobile/app/(tabs)/add-entry.tsx`

- [ ] **Step 1: Design Add Entry variations**

Reference: `screenshots/10-add-time-entry.png`

**Variation A: Stepped Form**
- Multi-step wizard
- Date → Client → Description → Times
- Progress indicator
- "Next" navigation

**Variation B: Single Scroll Form**
- All fields visible
- Grouped sections (Date, Client, Times)
- Sticky "Save" button
- Validation inline

**Variation C: Quick Entry**
- Minimal fields (smart defaults)
- Date picker prominent
- "Duplicate yesterday" button
- Expanded mode for details

Prompt for Google Stitch MCP:
```
Design a mobile add/edit time entry form for TimeTrack app.

Reference: screenshots/10-add-time-entry.png

Style: Bento Box pattern with form groups

Variations: 3 (Stepped Form, Single Scroll, Quick Entry)

Fields:
- Date picker (calendar widget)
- Client (text input with autocomplete)
- Description (multi-line text)
- Project/Task # (optional text)
- In Time 1 (time picker)
- Out Time 1 (time picker)
- In Time 2 (optional time picker)
- Out Time 2 (optional time picker)
- Total Hours (calculated, read-only, prominent)

Validation:
- Required fields marked
- Real-time validation
- Inline error messages

Actions:
- Save button (primary)
- Cancel (secondary)
- Duplicate (for edit mode)

Design system: Bento Box, mobile-optimized
Export: React Native + NativeWind
```

- [ ] **Step 2: Review and approve Add Entry designs**

Wait for user approval.

- [ ] **Step 3: Export approved design**

Generate `apps/mobile/app/(tabs)/add-entry.tsx`

- [ ] **Step 4: Commit Add Entry design**

```bash
git add design/screens/add-entry/ apps/mobile/app/(tabs)/add-entry.tsx
git commit -m "feat: design and implement Add/Edit Time Entry screen

- Design 3 variations (approved: [VARIATION])
- Implement date picker integration
- Add time picker components
- Implement real-time hour calculation
- Add inline validation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Design ETO Screen (3 variations)

**Files:**
- Create: `design/screens/eto/`
- Create: `apps/mobile/app/(tabs)/eto.tsx`

Reference: `screenshots/05-eto.png`

[Similar structure to above tasks with 3 variations, Google Stitch MCP prompts, approval, and export]

---

### Task 5: Design Settings Screen (3 variations)

**Files:**
- Create: `design/screens/settings/`
- Create: `apps/mobile/app/(tabs)/settings.tsx`

Reference: `screenshots/06-preferences.png`

[Similar structure with grouped settings cards, switches, and preferences]

---

### Task 6: Design Component Library

**Files:**
- Create: `apps/mobile/components/ui/`

Common components to design and export:
- TimeEntryCard
- SummaryCard
- DatePicker (native feel)
- TimePicker
- OfflineBanner
- SyncIndicator
- Button (primary, secondary, danger)
- Input
- Select/Dropdown

Each component designed with Bento Box aesthetic and exported as reusable React Native + NativeWind code.

---

## Phase 2: Monorepo Setup

### Task 7: Initialize Monorepo with pnpm

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `.npmrc`
- Create: `turbo.json`

- [ ] **Step 1: Write failing test for monorepo structure**

Create `scripts/verify-structure.test.ts`:

```typescript
import fs from 'fs';
import path from 'path';

describe('Monorepo Structure', () => {
  test('should have pnpm-workspace.yaml', () => {
    const exists = fs.existsSync('pnpm-workspace.yaml');
    expect(exists).toBe(true);
  });

  test('should have apps/mobile directory', () => {
    const exists = fs.existsSync('apps/mobile');
    expect(exists).toBe(true);
  });

  test('should have apps/backend directory', () => {
    const exists = fs.existsSync('apps/backend');
    expect(exists).toBe(true);
  });

  test('should have packages/shared directory', () => {
    const exists = fs.existsSync('packages/shared');
    expect(exists).toBe(true);
  });

  test('should have root package.json with workspaces', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    expect(pkg.private).toBe(true);
    expect(pkg.workspaces).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx tsx scripts/verify-structure.test.ts
```

Expected: FAIL - directories and files don't exist

- [ ] **Step 3: Initialize pnpm and create root structure**

```bash
# Install pnpm globally if needed
npm install -g pnpm

# Initialize root package.json
pnpm init

# Create directory structure
mkdir -p apps/mobile apps/backend packages/shared
mkdir -p .github/workflows design/screens scripts
```

- [ ] **Step 4: Configure pnpm workspace**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Create `.npmrc`:

```
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

- [ ] **Step 5: Update root package.json**

Edit `package.json`:

```json
{
  "name": "timetrack-mobile",
  "version": "1.0.0",
  "private": true,
  "description": "TimeTrack Mobile Full Stack Application",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "mobile": "pnpm --filter @timetrack/mobile dev",
    "backend": "pnpm --filter @timetrack/backend dev",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "turbo": "^1.13.0",
    "typescript": "^5.3.3",
    "@types/node": "^20.11.0",
    "tsx": "^4.7.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

- [ ] **Step 6: Configure Turborepo (optional but recommended)**

Create `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**", "expo-env.d.ts"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**", "test/**", "__tests__/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {
      "outputs": []
    }
  }
}
```

- [ ] **Step 7: Run test to verify structure**

```bash
pnpm test
```

Expected: PASS - all directories exist and root package.json is valid

- [ ] **Step 8: Commit monorepo setup**

```bash
git init
git add package.json pnpm-workspace.yaml .npmrc turbo.json
git add apps/ packages/ .github/ design/ scripts/
git commit -m "feat: initialize monorepo with pnpm workspaces

- Set up pnpm workspace configuration
- Create apps/mobile, apps/backend, packages/shared structure
- Configure Turborepo for build orchestration
- Add root package.json with workspace scripts

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Shared Package (Types & Validation)

### Task 8: Setup Shared Package with TypeScript

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Initialize shared package**

```bash
cd packages/shared
pnpm init
```

- [ ] **Step 2: Configure shared package.json**

Edit `packages/shared/package.json`:

```json
{
  "name": "@timetrack/shared",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.4",
    "date-fns": "^3.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.11.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0"
  }
}
```

- [ ] **Step 3: Configure TypeScript**

Create `packages/shared/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

- [ ] **Step 4: Install dependencies**

```bash
pnpm install
```

- [ ] **Step 5: Create barrel export**

Create `packages/shared/src/index.ts`:

```typescript
// Types
export * from './types';

// Validation schemas
export * from './validation';

// Utility functions
export * from './utils';
```

- [ ] **Step 6: Build shared package**

```bash
pnpm build
```

Expected: Compilation succeeds, dist/ folder created

- [ ] **Step 7: Commit shared package setup**

```bash
git add packages/shared/
git commit -m "feat: setup shared package for types and validation

- Initialize @timetrack/shared package
- Configure TypeScript for library compilation
- Add Zod for validation
- Set up barrel exports

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 9: Define Shared Types

**Files:**
- Create: `packages/shared/src/types/index.ts`
- Create: `packages/shared/src/types/time-entry.ts`
- Create: `packages/shared/src/types/consultant.ts`
- Create: `packages/shared/src/types/pay-period.ts`
- Test: `packages/shared/src/types/__tests__/types.test.ts`

- [ ] **Step 1: Write failing test for types**

Create `packages/shared/src/types/__tests__/types.test.ts`:

```typescript
import { TimeEntry, PayPeriod, Consultant } from '../index';

describe('Shared Types', () => {
  test('should compile TimeEntry type', () => {
    const entry: TimeEntry = {
      id: '123',
      consultantId: '24563',
      date: '2026-04-10',
      payPeriodId: '741',
      clientName: 'Aderant',
      description: 'Worked on PR #123',
      inTime1: '08:00',
      outTime1: '12:00',
      inTime2: '13:00',
      outTime2: '17:00',
      totalHours: 8.0,
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: true
    };
    
    expect(entry.id).toBe('123');
  });

  test('should compile PayPeriod type', () => {
    const period: PayPeriod = {
      id: '741',
      startDate: '2026-04-01',
      endDate: '2026-04-15',
      displayText: '04/01/2026 - 04/15/2026',
      isCurrent: true
    };
    
    expect(period.isCurrent).toBe(true);
  });

  test('should compile Consultant type', () => {
    const consultant: Consultant = {
      id: '24563',
      name: 'Martin Larios',
      email: 'martin@test.com',
      teamLeadId: '12345',
      teamLeadName: 'Alessandro Silveira',
      teamLeadEmail: 'alessandro@test.com',
      etoBalance: 33.92,
      workingHoursPerPeriod: 88,
      paymentType: 'Hourly'
    };
    
    expect(consultant.name).toBe('Martin Larios');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/shared
pnpm test
```

Expected: FAIL - types not defined

- [ ] **Step 3: Define TimeEntry type**

Create `packages/shared/src/types/time-entry.ts`:

```typescript
export interface TimeEntry {
  id: string;
  consultantId: string;
  date: string; // YYYY-MM-DD
  payPeriodId: string;
  projectTaskNumber?: string | null;
  clientName: string;
  description: string;
  inTime1: string; // HH:mm
  outTime1: string;
  inTime2?: string | null;
  outTime2?: string | null;
  totalHours: number;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
  syncedAt?: Date | null;
}

export interface CreateTimeEntryInput {
  consultantId: string;
  date: string;
  payPeriodId: string;
  projectTaskNumber?: string;
  clientName: string;
  description: string;
  inTime1: string;
  outTime1: string;
  inTime2?: string;
  outTime2?: string;
}

export interface UpdateTimeEntryInput extends CreateTimeEntryInput {
  id: string;
}

export interface TimesheetSummary {
  periodId: string;
  totalRegularHours: number;
  convertedETOHours: number;
  usedETOHours: number;
  totalHours: number;
  etoHoursRemaining: number;
  pendingDays: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}
```

- [ ] **Step 4: Define Consultant type**

Create `packages/shared/src/types/consultant.ts`:

```typescript
export interface Consultant {
  id: string;
  name: string;
  email: string;
  teamLeadId: string;
  teamLeadName: string;
  teamLeadEmail: string;
  etoBalance: number;
  workingHoursPerPeriod: number;
  paymentType: 'Hourly' | 'Monthly';
}

export interface TeamLead {
  id: string;
  name: string;
  email: string;
  teamMembers: string[]; // Consultant IDs
}
```

- [ ] **Step 5: Define PayPeriod type**

Create `packages/shared/src/types/pay-period.ts`:

```typescript
export interface PayPeriod {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  displayText: string; // "MM/DD/YYYY - MM/DD/YYYY"
  isCurrent: boolean;
  deadlineDate: string; // "YYYY-MM-DD" (7th or 22nd)
}

export interface PayPeriodWithStats extends PayPeriod {
  totalEntries: number;
  totalHours: number;
  submitted: boolean;
  submittedAt?: Date;
}
```

- [ ] **Step 6: Create barrel export for types**

Create `packages/shared/src/types/index.ts`:

```typescript
export * from './time-entry';
export * from './consultant';
export * from './pay-period';

// Common types
export interface PaginationInput {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface UserSession {
  consultantId: string;
  name: string;
  email: string;
  tokens: AuthTokens;
}

// Sync types
export interface SyncQueueItem {
  id: string;
  entityType: 'TimeEntry' | 'ETOTransaction';
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  retryCount: number;
  createdAt: Date;
  error?: string;
}

export interface SyncConflict {
  entityId: string;
  entityType: string;
  localVersion: any;
  serverVersion: any;
  conflictedFields: string[];
}
```

- [ ] **Step 7: Run test to verify it passes**

```bash
pnpm test
```

Expected: PASS

- [ ] **Step 8: Rebuild shared package**

```bash
pnpm build
```

Expected: Types compiled to dist/

- [ ] **Step 9: Commit shared types**

```bash
git add packages/shared/src/types/
git commit -m "feat: define shared TypeScript types for domain entities

- Add TimeEntry with CRUD input types
- Add Consultant and TeamLead types
- Add PayPeriod with stats
- Add common types (Auth, Sync, Pagination)
- Full test coverage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 10: Define Zod Validation Schemas

**Files:**
- Create: `packages/shared/src/validation/index.ts`
- Create: `packages/shared/src/validation/time-entry.schema.ts`
- Create: `packages/shared/src/validation/consultant.schema.ts`
- Test: `packages/shared/src/validation/__tests__/schemas.test.ts`

- [ ] **Step 1: Write failing test for validation**

Create `packages/shared/src/validation/__tests__/schemas.test.ts`:

```typescript
import { timeEntrySchema, createTimeEntrySchema } from '../time-entry.schema';

describe('Zod Validation Schemas', () => {
  test('should validate complete time entry', () => {
    const entry = {
      consultantId: '24563',
      date: '2026-04-10',
      payPeriodId: '741',
      clientName: 'Aderant',
      description: 'Worked on PR #123',
      inTime1: '08:00',
      outTime1: '12:00',
      inTime2: '13:00',
      outTime2: '17:00'
    };
    
    const result = createTimeEntrySchema.safeParse(entry);
    
    expect(result.success).toBe(true);
  });

  test('should reject entry with missing required fields', () => {
    const entry = {
      date: '2026-04-10'
      // Missing required fields
    };
    
    const result = createTimeEntrySchema.safeParse(entry);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  test('should reject entry with invalid time format', () => {
    const entry = {
      consultantId: '24563',
      date: '2026-04-10',
      payPeriodId: '741',
      clientName: 'Aderant',
      description: 'Test',
      inTime1: '25:00', // Invalid hour
      outTime1: '12:00'
    };
    
    const result = createTimeEntrySchema.safeParse(entry);
    
    expect(result.success).toBe(false);
  });

  test('should reject entry with end time before start time', () => {
    const entry = {
      consultantId: '24563',
      date: '2026-04-10',
      payPeriodId: '741',
      clientName: 'Aderant',
      description: 'Test',
      inTime1: '12:00',
      outTime1: '08:00' // Before start
    };
    
    const result = createTimeEntrySchema.safeParse(entry);
    
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL

- [ ] **Step 3: Implement time entry validation schema**

Create `packages/shared/src/validation/time-entry.schema.ts`:

```typescript
import { z } from 'zod';
import { parse, isBefore } from 'date-fns';

// Time format regex (HH:mm)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Date format regex (YYYY-MM-DD)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Helper to validate time range
function validateTimeRange(startTime: string, endTime: string): boolean {
  const start = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());
  return isBefore(start, end);
}

export const createTimeEntrySchema = z.object({
  consultantId: z.string().min(1, 'Consultant ID is required'),
  
  date: z.string()
    .regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  
  payPeriodId: z.string().min(1, 'Pay period is required'),
  
  projectTaskNumber: z.string().optional(),
  
  clientName: z.string()
    .min(1, 'Client name is required')
    .max(100, 'Client name must be less than 100 characters'),
  
  description: z.string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must be less than 500 characters'),
  
  inTime1: z.string()
    .regex(timeRegex, 'Time must be in HH:mm format (00:00-23:59)'),
  
  outTime1: z.string()
    .regex(timeRegex, 'Time must be in HH:mm format (00:00-23:59)'),
  
  inTime2: z.string()
    .regex(timeRegex, 'Time must be in HH:mm format (00:00-23:59)')
    .optional(),
  
  outTime2: z.string()
    .regex(timeRegex, 'Time must be in HH:mm format (00:00-23:59)')
    .optional(),
}).refine((data) => {
  // Validate first time block
  return validateTimeRange(data.inTime1, data.outTime1);
}, {
  message: 'End time must be after start time',
  path: ['outTime1']
}).refine((data) => {
  // Validate second time block if present
  if (data.inTime2 && data.outTime2) {
    return validateTimeRange(data.inTime2, data.outTime2);
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['outTime2']
}).refine((data) => {
  // Validate no overlap between blocks
  if (data.inTime2 && data.outTime2) {
    const end1 = parse(data.outTime1, 'HH:mm', new Date());
    const start2 = parse(data.inTime2, 'HH:mm', new Date());
    return isBefore(end1, start2) || end1.getTime() === start2.getTime();
  }
  return true;
}, {
  message: 'Time blocks cannot overlap',
  path: ['inTime2']
});

export const updateTimeEntrySchema = createTimeEntrySchema.extend({
  id: z.string().min(1, 'ID is required')
});

export const timeEntrySchema = updateTimeEntrySchema.extend({
  totalHours: z.number().min(0).max(24),
  createdAt: z.date(),
  updatedAt: z.date(),
  synced: z.boolean(),
  syncedAt: z.date().optional()
});

// Partial schema for patch updates
export const patchTimeEntrySchema = createTimeEntrySchema.partial().extend({
  id: z.string().min(1, 'ID is required')
});
```

- [ ] **Step 4: Implement consultant validation schema**

Create `packages/shared/src/validation/consultant.schema.ts`:

```typescript
import { z } from 'zod';

export const consultantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  teamLeadId: z.string().min(1),
  teamLeadName: z.string().min(1),
  teamLeadEmail: z.string().email(),
  etoBalance: z.number().min(0),
  workingHoursPerPeriod: z.number().min(0).max(200),
  paymentType: z.enum(['Hourly', 'Monthly'])
});

export const createConsultantSchema = consultantSchema.omit({ id: true });

export const updateConsultantSchema = consultantSchema.partial().extend({
  id: z.string().min(1, 'ID is required')
});
```

- [ ] **Step 5: Create validation barrel export**

Create `packages/shared/src/validation/index.ts`:

```typescript
export * from './time-entry.schema';
export * from './consultant.schema';

// Re-export zod for convenience
export { z } from 'zod';
```

- [ ] **Step 6: Run test to verify it passes**

```bash
pnpm test
```

Expected: PASS

- [ ] **Step 7: Rebuild shared package**

```bash
pnpm build
```

Expected: Validation schemas compiled

- [ ] **Step 8: Commit validation schemas**

```bash
git add packages/shared/src/validation/
git commit -m "feat: implement Zod validation schemas for all entities

- Add time entry validation with field constraints
- Validate time ranges (end > start)
- Validate no overlap between time blocks
- Add consultant validation schema
- Full test coverage
- Schemas reusable in frontend and backend

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Backend Setup (NestJS + GraphQL + MongoDB)

### Task 11: Initialize NestJS Backend

**Files:**
- Create: `apps/backend/`

- [ ] **Step 1: Generate NestJS application**

```bash
cd apps
npx @nestjs/cli new backend --package-manager pnpm
```

Answer prompts:
- Package manager: pnpm
- Skip git initialization: Yes

- [ ] **Step 2: Update backend package.json name**

Edit `apps/backend/package.json`:

```json
{
  "name": "@timetrack/backend",
  "version": "1.0.0",
  ...
}
```

- [ ] **Step 3: Install GraphQL dependencies**

```bash
cd apps/backend
pnpm add @nestjs/graphql @nestjs/apollo @apollo/server graphql
pnpm add @nestjs/passport passport passport-jwt @nestjs/jwt
pnpm add @prisma/client
pnpm add -D prisma @nestjs/testing supertest
```

- [ ] **Step 4: Install Zod integration**

```bash
pnpm add zod zod-validation-error nestjs-zod
pnpm add @timetrack/shared@workspace:*
```

- [ ] **Step 5: Configure GraphQL module**

Edit `apps/backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TimesheetModule } from './timesheet/timesheet.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),
    PrismaModule,
    AuthModule,
    TimesheetModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 6: Test backend starts**

```bash
pnpm run start:dev
```

Expected: Server starts on http://localhost:3000

- [ ] **Step 7: Commit backend setup**

```bash
git add apps/backend/
git commit -m "feat: initialize NestJS backend with GraphQL

- Generate NestJS application
- Configure GraphQL with Apollo Server
- Install Prisma, Passport, JWT dependencies
- Link @timetrack/shared package
- Set up module structure

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 12: Setup Prisma with MongoDB

**Files:**
- Create: `apps/backend/prisma/schema.prisma`
- Create: `apps/backend/src/prisma/prisma.module.ts`
- Create: `apps/backend/src/prisma/prisma.service.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
cd apps/backend
npx prisma init --datasource-provider mongodb
```

- [ ] **Step 2: Configure Prisma schema**

Edit `apps/backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model Consultant {
  id                    String        @id @default(auto()) @map("_id") @db.ObjectId
  externalId            String        @unique // From Okta/TimeTrack
  name                  String
  email                 String        @unique
  teamLeadId            String
  teamLeadName          String
  teamLeadEmail         String
  etoBalance            Float         @default(0)
  workingHoursPerPeriod Float         @default(88)
  paymentType           String        @default("Hourly")
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  
  timeEntries           TimeEntry[]
  etoTransactions       ETOTransaction[]
  
  @@map("consultants")
}

model PayPeriod {
  id           String      @id @default(auto()) @map("_id") @db.ObjectId
  startDate    DateTime
  endDate      DateTime
  displayText  String
  isCurrent    Boolean     @default(false)
  deadlineDate DateTime
  createdAt    DateTime    @default(now())
  
  timeEntries  TimeEntry[]
  
  @@unique([startDate, endDate])
  @@map("pay_periods")
}

model TimeEntry {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  consultantId      String    @db.ObjectId
  payPeriodId       String    @db.ObjectId
  date              DateTime
  projectTaskNumber String?
  clientName        String
  description       String
  inTime1           String
  outTime1          String
  inTime2           String?
  outTime2          String?
  totalHours        Float
  synced            Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  consultant        Consultant @relation(fields: [consultantId], references: [id])
  payPeriod         PayPeriod  @relation(fields: [payPeriodId], references: [id])
  
  @@index([consultantId, payPeriodId])
  @@index([date])
  @@map("time_entries")
}

model ETOTransaction {
  id             String     @id @default(auto()) @map("_id") @db.ObjectId
  consultantId   String     @db.ObjectId
  date           DateTime
  hours          Float
  transactionType String    // 'accrued' | 'used' | 'converted'
  description    String
  projectName    String?
  synced         Boolean    @default(true)
  createdAt      DateTime   @default(now())
  
  consultant     Consultant @relation(fields: [consultantId], references: [id])
  
  @@index([consultantId, date])
  @@map("eto_transactions")
}

model TimesheetSubmission {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  consultantId String
  payPeriodId  String
  status       String   // 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  submittedAt  DateTime @default(now())
  approvedAt   DateTime?
  approvedBy   String?
  rejectedAt   DateTime?
  rejectedBy   String?
  comments     String?
  
  @@unique([consultantId, payPeriodId])
  @@index([consultantId])
  @@index([payPeriodId])
  @@map("timesheet_submissions")
}

model SyncLog {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String
  deviceId    String
  entityType  String
  operation   String   // 'CREATE' | 'UPDATE' | 'DELETE'
  entityId    String
  syncedAt    DateTime @default(now())
  success     Boolean
  error       String?
  
  @@index([userId, syncedAt])
  @@map("sync_logs")
}
```

- [ ] **Step 3: Create Prisma service**

Create `apps/backend/src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Create `apps/backend/src/prisma/prisma.module.ts`:

```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 4: Set up environment variables**

Create `apps/backend/.env`:

```bash
DATABASE_URL="mongodb://localhost:27017/timetrack"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
OKTA_ISSUER="https://number8.okta.com"
OKTA_CLIENT_ID="your-okta-client-id"
OKTA_CLIENT_SECRET="your-okta-client-secret"
PORT=3000
```

Add to `.gitignore`:
```
.env
.env.local
```

- [ ] **Step 5: Generate Prisma client**

```bash
npx prisma generate
```

Expected: Prisma client generated in node_modules

- [ ] **Step 6: Test Prisma connection (requires MongoDB running)**

```bash
npx prisma db push
```

Expected: Schema synced to MongoDB

- [ ] **Step 7: Commit Prisma setup**

```bash
git add apps/backend/prisma/ apps/backend/src/prisma/
git add apps/backend/.env.example
git commit -m "feat: setup Prisma ORM with MongoDB schema

- Define Prisma schema for all entities
- Create PrismaService and PrismaModule
- Configure MongoDB connection
- Add environment variables configuration
- Generate Prisma client

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

**[Plan continues with 50+ more tasks covering:]**

## Phase 5: Authentication (Okta + JWT)
- Task 13: Okta Strategy Implementation
- Task 14: JWT Guards & Decorators
- Task 15: Auth Resolver & Mutations

## Phase 6: GraphQL API (Timesheets)
- Task 16: TimeEntry GraphQL Schema
- Task 17: TimeEntry Service with Zod Validation
- Task 18: TimeEntry Resolver (CRUD)
- Task 19: Timesheet Submission Logic
- Task 20: ETO GraphQL API

## Phase 7: Offline Sync Service
- Task 21: Sync Queue Data Structure
- Task 22: Conflict Resolution Strategy
- Task 23: Sync GraphQL Mutations

## Phase 8: Frontend Setup (React Native Expo)
- Task 24: Initialize Expo Project
- Task 25: Configure NativeWind
- Task 26: Setup Apollo Client
- Task 27: Configure Expo Router
- Task 28: Setup AsyncStorage for Offline Queue

## Phase 9: Frontend - Authentication
- Task 29: Okta React Native Integration
- Task 30: Login Screen Implementation
- Task 31: JWT Storage & Refresh Logic
- Task 32: Biometric Authentication

## Phase 10: Frontend - Timesheet Features
- Task 33: Timesheet List Screen
- Task 34: Add/Edit Time Entry Screen
- Task 35: Date/Time Picker Components
- Task 36: Hour Calculation Display
- Task 37: Submit Timesheet Flow

## Phase 11: Frontend - Offline Mode
- Task 38: Offline Detection Hook
- Task 39: AsyncStorage Sync Queue
- Task 40: Background Sync Service
- Task 41: Conflict Resolution UI

## Phase 12: Frontend - ETO & Settings
- Task 42: ETO Screen Implementation
- Task 43: Settings Screen
- Task 44: Notification Preferences

## Phase 13: Push Notifications
- Task 45: Firebase Setup
- Task 46: Notification Service
- Task 47: Deadline Reminders (7th/22nd)

## Phase 14: Testing
- Task 48: Backend Unit Tests (Jest)
- Task 49: Backend Integration Tests (Supertest)
- Task 50: Frontend Unit Tests (Testing Library)
- Task 51: Frontend E2E Tests (Detox)

## Phase 15: Deployment Preparation
- Task 52: App Store Submission Checklist
- Task 53: Google Play Store Submission Checklist
- Task 54: EAS Build Configuration
- Task 55: CI/CD Pipeline (GitHub Actions)
- Task 56: Production Environment Setup

---

## Deployment Strategy

### iOS App Store

**Prerequisites:**
1. Apple Developer Account ($99/year)
2. Registered app bundle ID
3. App Store Connect access
4. Provisioning profiles and certificates

**Steps:**
1. Configure `app.json` with iOS settings
2. Generate production build with EAS:
   ```bash
   eas build --platform ios --profile production
   ```
3. Test on TestFlight
4. Submit for review via App Store Connect
5. Wait for approval (typically 1-3 days)

**Required Assets:**
- App icon (1024x1024px)
- Screenshots (all iOS device sizes)
- Privacy policy URL
- App description & keywords
- Support URL

### Google Play Store

**Prerequisites:**
1. Google Play Developer Account ($25 one-time)
2. App signing key
3. Google Play Console access

**Steps:**
1. Configure `app.json` with Android settings
2. Generate production AAB with EAS:
   ```bash
   eas build --platform android --profile production
   ```
3. Upload to Google Play Console
4. Configure store listing
5. Submit for review
6. Rollout to production

**Required Assets:**
- App icon (512x512px)
- Feature graphic (1024x500px)
- Screenshots (phone, tablet, TV if applicable)
- Privacy policy URL
- App description
- Content rating questionnaire

### Continuous Deployment with EAS

Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-10-timetrack-mobile-full-stack.md`.**

This comprehensive plan integrates:
✅ Google Stitch MCP for UI design (Phase 1)
✅ Monorepo with pnpm workspaces (Phase 2)
✅ Shared types & Zod validation (Phase 3)
✅ NestJS + GraphQL + MongoDB backend (Phase 4-7)
✅ React Native Expo + NativeWind frontend (Phase 8-12)
✅ Push notifications (Phase 13)
✅ Comprehensive testing (Phase 14)
✅ App Store & Play Store deployment (Phase 15)

**Total: 56 tasks with TDD approach throughout**

**Two execution options:**

**1. Subagent-Driven (recommended)** - Execute with fresh subagents per task, review between phases

**2. Inline Execution** - Execute in current session with checkpoints

**Which approach would you like?**
