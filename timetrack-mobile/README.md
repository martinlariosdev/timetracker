# TimeTrack Mobile - Full Stack Application

Mobile time tracking application with offline-first architecture.

## Project Structure

```
timetrack-mobile/
├── apps/
│   ├── mobile/    # React Native Expo app
│   └── backend/   # NestJS GraphQL API
└── packages/
    └── shared/    # Shared types and validation
```

## Tech Stack

- **Frontend:** React Native Expo + NativeWind CSS
- **Backend:** NestJS + GraphQL + Prisma
- **Database:** MongoDB
- **Auth:** Okta 2FA
- **Package Manager:** pnpm

## Getting Started

See implementation plan: `docs/superpowers/plans/2026-04-10-timetrack-mobile-full-stack.md`

## Development

This project uses git worktrees for isolated development. Implementation work happens in `.worktrees/` directory.
