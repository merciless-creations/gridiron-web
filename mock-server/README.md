# Gridiron Mock API Server

A mock REST API server for Gridiron development and testing using [mock-json-api](https://github.com/jeffflater/mock-json-api).

## Quick Start

```bash
npm install
npm start
```

Server runs at `http://localhost:3001` by default.

## Configuration

Set `PORT` environment variable to change the port:

```bash
PORT=3002 npm start
```

## Usage with gridiron-web

### Development

```bash
# In gridiron-web:
VITE_API_URL=http://localhost:3001 npm run dev
```

Or use the convenience script:

```bash
npm run dev:mock
```

### E2E Tests

The Playwright config automatically starts the mock server.

### Unit Tests

Vitest is configured to start/stop the mock server automatically.

## API Endpoints

### Meta Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/_reset` | Reset all state to initial seed data |
| POST | `/_scenario` | Change route scenario for testing |

### League Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leagues-management/constraints` | Get structure constraints |
| GET | `/api/leagues-management` | List all leagues |
| POST | `/api/leagues-management` | Create new league |
| GET | `/api/leagues-management/:id` | Get league by ID |
| PUT | `/api/leagues-management/:id` | Update league |
| POST | `/api/leagues-management/:leagueId/conferences` | Add conference |
| DELETE | `/api/leagues-management/conferences/:conferenceId` | Delete conference |
| POST | `/api/leagues-management/conferences/:conferenceId/divisions` | Add division |
| DELETE | `/api/leagues-management/divisions/:divisionId` | Delete division |
| POST | `/api/leagues-management/divisions/:divisionId/teams` | Add team |
| DELETE | `/api/leagues-management/teams/:teamId` | Delete team |
| POST | `/api/leagues-management/:id/populate-rosters` | Populate rosters |

### Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List teams |
| GET | `/api/teams/:id` | Get team by ID |

### Games

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | List games |
| POST | `/api/games/simulate` | Simulate a game |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| GET | `/api/users/league/:leagueId` | List users in league |
| POST | `/api/users/:userId/league-roles` | Add league role |
| DELETE | `/api/users/:userId/league-roles/:roleId` | Remove league role |

## Test Scenarios

Switch scenarios using the `/_scenario` endpoint:

```bash
# Switch route to error state
curl -X POST http://localhost:3001/_scenario \
  -H "Content-Type: application/json" \
  -d '{"name": "getLeague", "scope": "error"}'

# Switch route to not found state
curl -X POST http://localhost:3001/_scenario \
  -H "Content-Type: application/json" \
  -d '{"name": "getLeague", "scope": "notFound"}'
```

Or use query parameters:

```bash
# Get league with error scenario
curl http://localhost:3001/api/leagues-management/1?scope=error
```

## State Management

- State is persisted in memory during server runtime
- Use `POST /_reset` to restore initial seed data
- Seed data is loaded from `data/seed.json`

## Seed Data

Edit `data/seed.json` to customize initial data. The file contains:

- `constraints` - League structure constraints
- `user` - Mock current user
- `teams` - Mock teams list
- `leagues` - Full league hierarchy (conferences, divisions, teams)
