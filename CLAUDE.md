# Gridiron Web

Gridiron is a web-based NFL franchise management simulation game. This repository contains the React frontend.

## Vision

A deep, authentic NFL front office experience where players act as General Managers—drafting, trading, signing, and building rosters across multiple seasons. Multiplayer leagues allow multiple human GMs competing in the same league.

## Repositories

- **gridiron-engine**: https://github.com/merciless-creations/gridiron-engine — C# simulation engine (NuGet package)
- **gridiron**: https://github.com/merciless-creations/gridiron — C# Backend API, Azure SQL
- **gridiron-web**: https://github.com/merciless-creations/gridiron-web — React frontend (this repo)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Build | Vite |
| Styling | TailwindCSS |
| Auth | Azure AD B2C / MSAL |
| Testing | Vitest (unit), Playwright (E2E) |
| Hosting | Azure Static Web Apps |

## API Integration

The frontend communicates with the Gridiron API. Configure the API URL via environment variable:

```
VITE_API_URL=https://your-api-url.com
```

For local development, the API typically runs at `http://localhost:5000`.

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
# Unit/Component tests
npm run test

# E2E tests (requires mocked API)
npm run test:e2e
```

## Coding Conventions

### React
- Functional components with hooks
- TailwindCSS for styling (no separate CSS files unless necessary)
- Component files colocated with their concerns
- TypeScript for type safety

### Design System
- Dark mode by default (sports broadcast aesthetic)
- See `.claude/skills/gridiron-frontend/SKILL.md` for design guidelines
- Data-dense layouts inspired by ESPN, Yahoo Sports, sportsbooks

## When Uncertain

Ask Scott. He is precise in his requirements—do not assume or estimate. If a requirement is ambiguous, clarify before implementing.
