# Gridiron Web

Gridiron is a web-based NFL style franchise management simulation game. This repository contains the React frontend.

## Vision

A deep, authentic NFL front office experience where players act as General Managers—drafting, trading, signing, and building rosters across multiple seasons. Multiplayer leagues allow multiple human GMs competing in the same league.

## Repositories

- **gridiron-engine**: https://github.com/merciless-creations/gridiron-engine — C# simulation engine (NuGet package)
- **gridiron**: https://github.com/merciless-creations/gridiron — C# Backend API, Azure SQL
- **gridiron-web**: https://github.com/merciless-creations/gridiron-web — React frontend (this repo)
- **gridiron-injury**: https://github.com/merciless-creations/gridiron-injury — Stateless injury determination engine (NuGet package)
- **gridiron-progression**: https://github.com/merciless-creations/gridiron-progression — Stateless player progression engine (NuGet package)

## Project
- https://github.com/orgs/merciless-creations/projects/3

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
# Unit/Component tests (uses mock server on port 3002)
npm run test

# E2E tests (uses mock server on port 3001)
npm run test:e2e
```

### Mock Server (REQUIRED - NOT MSW)

> ⚠️ **Use mock-server scenarios, NOT MSW or vi.mock() for API mocking**

Both unit tests and E2E tests use a shared mock server located at `mock-server/`. The mock server provides:
- All API endpoints matching the real backend
- State reset via `POST /_reset` between tests
- Scenario switching via `POST /_scenario` for error testing
- Seed data in `mock-server/data/seed.json`

For local development with mocked data:
```bash
npm run dev:mock  # Runs Vite with mock server
```

### Testing Philosophy

> ⚠️ **The frontend responds to whatever the server sends—never assume server data shape**

1. **Develop against mock-server first** — All new features must work against mock data before wiring to real APIs
2. **Test all response scenarios** — Every API call should have tests for:
   - ✅ Success (200) — Happy path with expected data
   - ✅ Empty (200) — Empty arrays, null values
   - ✅ Not Found (404) — Resource doesn't exist
   - ✅ Unauthorized (401) — Token expired/invalid
   - ✅ Forbidden (403) — No permission
   - ✅ Server Error (500) — Backend failure
3. **Never mock at the hook level** — Use `/_scenario` endpoint to trigger error states:
   ```typescript
   // ❌ WRONG - mocking at hook level
   vi.mock('../api/teams', () => ({ useTeam: () => ({ error: true }) }));
   
   // ✅ CORRECT - use mock-server scenario
   await fetch('http://localhost:3002/_scenario', {
     method: 'POST',
     body: JSON.stringify({ name: 'getTeam', scope: 'error' })
   });
   ```
4. **Test UI responses, not server behavior** — We test how the app displays errors, loading states, and empty states—not whether the server returns the right data

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
