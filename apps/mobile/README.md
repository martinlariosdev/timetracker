# TimeTrack Mobile

React Native mobile application for TimeTrack time tracking system.

## Tech Stack

- React Native with Expo SDK 54
- TypeScript
- Expo Router (file-based routing)

## Development

```bash
# Start the dev server
pnpm mobile dev

# Or from this directory
pnpm dev

# Run on specific platform
pnpm android   # Android
pnpm ios       # iOS
pnpm web       # Web
```

## Project Structure

```
apps/mobile/
├── app/              # Expo Router pages (file-based routing)
│   ├── _layout.tsx   # Root layout
│   └── index.tsx     # Home screen
├── components/       # Reusable React Native components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions and helpers
├── assets/          # Images, fonts, etc.
└── app.json         # Expo configuration
```

## Configuration

- **App Name**: TimeTrack
- **Bundle ID**: com.timetrack.mobile
- **Version**: 1.0.0
