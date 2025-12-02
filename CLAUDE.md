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

## Git Workflow

> ⛔ **ABSOLUTE RULE: NEVER COMMIT OR PUSH DIRECTLY TO MASTER OR MAIN** ⛔
>
> This is non-negotiable. Violations break CI/CD and require manual cleanup.

### Required Process for ALL Changes

1. **Create a feature branch** from master:
   ```bash
   git checkout master
   git pull
   git checkout -b feature/your-change-description
   ```

2. **Make changes and commit** to the feature branch:
   ```bash
   git add .
   git commit -m "Description of change"
   ```

3. **Push the feature branch** to origin:
   ```bash
   git push -u origin feature/your-change-description
   ```

4. **Create a Pull Request** for Scott to review

5. **Wait for approval** — Scott will merge after CI passes

### Branch Naming
- `feature/` — New features or enhancements
- `fix/` — Bug fixes
- `chore/` — Maintenance, refactoring, docs

This applies to ALL changes, no matter how small—even single-line fixes.

## When Uncertain

Ask Scott. He is precise in his requirements—do not assume or estimate. If a requirement is ambiguous, clarify before implementing.
