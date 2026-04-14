# TimeTrack Mobile - Screen Designs

This directory contains all screen design documentation and exported designs for the TimeTrack mobile application.

## Design System

All screens follow the **Bento Box Design System** documented in `/design/bento-box-system.md`.

Key principles:
- Card-based layouts with clear containment
- Consistent spacing and typography
- Touch-friendly interactive elements (44x44pt minimum)
- Modern iOS/Android aesthetics

## Screen Index

### Authentication Screens

#### Login Screen
- **Status**: In Design
- **Variations**: 3 (Minimal, Informative, Visual)
- **Reference**: `/screenshots/01-login-page.png`
- **Files**: TBD - awaiting user approval

### Main Application Screens

#### Timesheet List Screen
- **Status**: Not Started
- **Reference**: `/screenshots/03-post-login.png`
- **Task**: Task 2

#### Add/Edit Time Entry Screen
- **Status**: Not Started
- **Reference**: `/screenshots/10-add-time-entry.png`
- **Task**: Task 3

#### ETO (Estimated Time Off) Screen
- **Status**: Not Started
- **Reference**: `/screenshots/05-eto.png`
- **Task**: Task 4

#### Settings/Preferences Screen
- **Status**: Not Started
- **Reference**: `/screenshots/06-preferences.png`
- **Task**: Task 5

## Design Workflow

1. **Reference** - Review desktop screenshot for functionality
2. **Design** - Create 3 variations using Google Stitch MCP
3. **Review** - Present to stakeholders for approval
4. **Export** - Generate React Native + NativeWind code
5. **Document** - Add design notes and rationale

## Tools

- **Google Stitch MCP** - AI-powered UI design tool
- **NativeWind** - Tailwind CSS for React Native
- **React Native** - Cross-platform mobile framework

## File Naming Convention

- Design exports: `{screen-name}-{variation}.tsx`
- Design images: `{screen-name}-{variation}.png`
- Documentation: `{screen-name}-design-notes.md`

---

**Last Updated**: 2026-04-12
