export type SeasonPhase = 'preseason' | 'regular' | 'playoffs' | 'offseason';

export interface Season {
  id: number;
  leagueId: number;
  year: number;
  currentWeek: number;
  totalWeeks: number;
  phase: SeasonPhase;
  isComplete: boolean;
}

export interface TeamStanding {
  teamId: number;
  teamName: string;
  teamCity: string;
  divisionId: number;
  divisionName: string;
  conferenceId: number;
  conferenceName: string;
  wins: number;
  losses: number;
  ties: number;
  winPercentage: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
  divisionWins: number;
  divisionLosses: number;
  conferenceWins: number;
  conferenceLosses: number;
  streak: string;
  lastFive: string;
}

export interface DivisionStandings {
  divisionId: number;
  divisionName: string;
  conferenceId: number;
  conferenceName: string;
  teams: TeamStanding[];
}

export interface ConferenceStandings {
  conferenceId: number;
  conferenceName: string;
  divisions: DivisionStandings[];
}

export interface SeasonStandings {
  seasonId: number;
  year: number;
  currentWeek: number;
  conferences: ConferenceStandings[];
}

export interface ScheduledGame {
  id: number;
  week: number;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamCity: string;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamCity: string;
  homeScore: number | null;
  awayScore: number | null;
  isComplete: boolean;
  isByeWeek: boolean;
}

export interface ScheduleWeek {
  week: number;
  games: ScheduledGame[];
  isCurrent: boolean;
  isComplete: boolean;
}

export interface SeasonSchedule {
  seasonId: number;
  year: number;
  currentWeek: number;
  weeks: ScheduleWeek[];
}

export interface AdvanceWeekResponse {
  previousWeek: number;
  currentWeek: number;
  gamesSimulated: number;
  seasonComplete: boolean;
}

export interface GenerateScheduleRequest {
  leagueId: number;
  randomSeed?: number;
}

export interface GenerateScheduleResponse {
  seasonId: number;
  totalGames: number;
  totalWeeks: number;
}

export interface ProcessYearEndResponse {
  newSeasonId: number;
  newYear: number;
  playersProgressed: number;
  playersRetired: number;
}
