# Gridiron API Documentation

This document describes the API contracts for the Gridiron backend API, based on the actual implementation in the [gridiron repository](https://github.com/merciless-creations/gridiron).

## Base URL

```
Development: http://localhost:5000
Production: https://app-gridiron-api-dev.azurewebsites.net
```

Configure via environment variable: `VITE_API_URL`

## Authentication

All endpoints require authentication via Azure AD B2C JWT token unless otherwise noted.

---

## League Management Endpoints

Base path: `/api/leagues-management`

### Get All Leagues

```
GET /api/leagues-management
```

**Authorization**: Authenticated user  
**Returns**: List of leagues the user has access to

**Response**: `LeagueDto[]`
```typescript
{
  id: number;
  name: string;
  season: number;
  isActive: boolean;
  totalTeams: number;
  totalConferences: number;
}
```

---

### Get League by ID

```
GET /api/leagues-management/{id}
```

**Authorization**: Authenticated user with access to the league  
**Returns**: Full league structure with conferences, divisions, and teams

**Response**: `LeagueDetailDto`
```typescript
{
  id: number;
  name: string;
  season: number;
  isActive: boolean;
  totalTeams: number;
  totalConferences: number;
  conferences: ConferenceDto[];
}
```

**ConferenceDto**:
```typescript
{
  id: number;
  name: string;
  divisions: DivisionDto[];
}
```

**DivisionDto**:
```typescript
{
  id: number;
  name: string;
  teams: TeamDto[];
}
```

**TeamDto**:
```typescript
{
  id: number;
  name: string;
  city: string;
  budget: number;
  championships: number;
  wins: number;
  losses: number;
  ties: number;
  fanSupport: number;    // 0-100
  chemistry: number;     // 0-100
}
```

---

### Create League

```
POST /api/leagues-management
```

**Authorization**: Any authenticated user (creator becomes Commissioner)  
**Creates**: New league with full structure and placeholder names

**Request Body**: `CreateLeagueRequest`
```typescript
{
  name: string;                    // Required
  numberOfConferences: number;     // Required, must be > 0
  divisionsPerConference: number;  // Required, must be > 0
  teamsPerDivision: number;        // Required, must be > 0
}
```

**Response**: `LeagueDetailDto` (201 Created)

**Behavior**:
- Creates complete league structure with placeholder names
  - Conferences: "Conference 1", "Conference 2", etc.
  - Divisions: "Division 1", "Division 2", etc.
  - Teams: "Team 1", "Team 2", etc. with "City" placeholders
- Creator is automatically assigned as Commissioner
- Total teams = `numberOfConferences × divisionsPerConference × teamsPerDivision`

**Validation Errors** (400 Bad Request):
```typescript
{ error: "League name is required" }
{ error: "Number of conferences must be greater than 0" }
{ error: "Divisions per conference must be greater than 0" }
{ error: "Teams per division must be greater than 0" }
```

---

### Update League

```
PUT /api/leagues-management/{id}
```

**Authorization**: Commissioner of the league OR Global Admin  
**Updates**: League properties (name, season, isActive)

**Request Body**: `UpdateLeagueRequest`
```typescript
{
  name?: string;       // Optional
  season?: number;     // Optional (1900 to current year + 5)
  isActive?: boolean;  // Optional
}
```

**Response**: `LeagueDetailDto` (200 OK)

**Note**: Only provided properties are updated (partial update)

---

### Delete League

```
DELETE /api/leagues-management/{id}
```

**Authorization**: Commissioner of the league OR Global Admin  
**Action**: Soft delete with cascade to all child entities

**Query Parameters**:
- `deletedBy` (optional): User identifier
- `reason` (optional): Deletion reason

**Response**: `CascadeDeleteResult` (200 OK)
```typescript
{
  success: boolean;
  errorMessage?: string;
  totalEntitiesDeleted: number;
  deletedByType: { [entityType: string]: number };
}
```

**Behavior**: Cascades soft delete to conferences, divisions, teams, players, etc.

---

### Populate League Rosters

```
POST /api/leagues-management/{id}/populate-rosters
```

**Authorization**: Commissioner of the league OR Global Admin  
**Action**: Generates 53 players for each team in the league

**Response**: `LeagueDetailDto` (200 OK)

---

### Restore Deleted League

```
POST /api/leagues-management/{id}/restore
```

**Authorization**: Authenticated user  
**Action**: Restores a soft-deleted league

**Query Parameters**:
- `cascade` (optional, default: false): Whether to restore child entities

**Response**: `CascadeRestoreResult` (200 OK)
```typescript
{
  success: boolean;
  errorMessage?: string;
  totalEntitiesRestored: number;
  restoredByType: { [entityType: string]: number };
}
```

---

### Validate Restore

```
GET /api/leagues-management/{id}/validate-restore
```

**Authorization**: Authenticated user  
**Returns**: Whether a league can be restored

**Response**: `RestoreValidationResult`
```typescript
{
  canRestore: boolean;
  issues: string[];
}
```

---

### Get Deleted Leagues

```
GET /api/leagues-management/deleted
```

**Authorization**: Authenticated user  
**Returns**: All soft-deleted leagues

**Query Parameters**:
- `season` (optional): Filter by season

**Response**: `LeagueDto[]`

---

### Get League Constraints

```
GET /api/leagues-management/constraints
```

**Status**: ⚠️ **NOT YET IMPLEMENTED** (tracked in [gridiron#154](https://github.com/merciless-creations/gridiron/issues/154))

**Authorization**: TBD (likely public or authenticated)  
**Returns**: Validation constraints for league creation

**Proposed Response**: `LeagueConstraintsDto`
```typescript
{
  minConferences: number;              // Minimum (typically 1)
  maxConferences: number;              // Maximum allowed
  minDivisionsPerConference: number;   // Minimum (typically 1)
  maxDivisionsPerConference: number;   // Maximum allowed
  minTeamsPerDivision: number;         // Minimum (typically 1)
  maxTeamsPerDivision: number;         // Maximum allowed
}
```

**For Mocking**: Use NFL-inspired defaults:
```typescript
{
  minConferences: 1,
  maxConferences: 4,
  minDivisionsPerConference: 1,
  maxDivisionsPerConference: 8,
  minTeamsPerDivision: 1,
  maxTeamsPerDivision: 8
}
```

---

## Conference Management Endpoints

Base path: `/api/leagues-management/conferences`

### Update Conference

```
PUT /api/leagues-management/conferences/{id}
```

**Authorization**: Commissioner of the parent league OR Global Admin

**Request Body**: `UpdateConferenceRequest`
```typescript
{
  name?: string;  // Optional
}
```

**Response**: `ConferenceDto` (200 OK)

---

## Division Management Endpoints

Base path: `/api/leagues-management/divisions`

### Update Division

```
PUT /api/leagues-management/divisions/{id}
```

**Authorization**: Commissioner of the parent league OR Global Admin

**Request Body**: `UpdateDivisionRequest`
```typescript
{
  name?: string;  // Optional
}
```

**Response**: `DivisionDto` (200 OK)

---

## Team Management Endpoints

Base path: `/api/leagues-management/teams`

### Update Team

```
PUT /api/leagues-management/teams/{id}
```

**Authorization**: Commissioner of the parent league OR Global Admin

**Request Body**: `UpdateTeamRequest`
```typescript
{
  name?: string;         // Optional
  city?: string;         // Optional
  budget?: number;       // Optional
  championships?: number; // Optional
  wins?: number;         // Optional
  losses?: number;       // Optional
  ties?: number;         // Optional
  fanSupport?: number;   // Optional (0-100)
  chemistry?: number;    // Optional (0-100)
}
```

**Response**: `TeamDto` (200 OK)

---

## Mock Data Presets

For testing different league configurations:

### NFL Standard
```typescript
{
  name: "National Football League",
  numberOfConferences: 2,
  divisionsPerConference: 4,
  teamsPerDivision: 4
}
// Total: 32 teams
```

### Small League
```typescript
{
  name: "Small League",
  numberOfConferences: 1,
  divisionsPerConference: 2,
  teamsPerDivision: 4
}
// Total: 8 teams
```

### Large League
```typescript
{
  name: "Mega League",
  numberOfConferences: 4,
  divisionsPerConference: 8,
  teamsPerDivision: 8
}
// Total: 256 teams
```

### Single Conference
```typescript
{
  name: "Single Conference League",
  numberOfConferences: 1,
  divisionsPerConference: 4,
  teamsPerDivision: 6
}
// Total: 24 teams
```

---

## Error Responses

### 400 Bad Request
```typescript
{ error: "Validation error message" }
```

### 401 Unauthorized
```typescript
{ error: "User identity not found in token" }
```

### 403 Forbidden
No body (user lacks permission)

### 404 Not Found
```typescript
{ error: "League not found" }
```

### 500 Internal Server Error
```typescript
{ error: "Failed to perform operation" }
```

---

## Related Documentation

- **Frontend Repository**: [gridiron-web](https://github.com/merciless-creations/gridiron-web)
- **Backend Repository**: [gridiron](https://github.com/merciless-creations/gridiron)
- **API Implementation**: `Gridiron.WebApi/Controllers/LeaguesManagementController.cs`
- **Data Models**: `Gridiron.WebApi/DTOs/`

---

## Notes

- All endpoints return JSON
- Dates are in ISO 8601 format (UTC)
- Soft deletes preserve data with `IsDeleted` flag and `DeletedAt` timestamp
- Authorization is enforced at the controller level via `[Authorize]` attributes
- League creators are automatically assigned Commissioner role
- Commissioners have full control over their leagues
- Global Admins have access to all leagues
