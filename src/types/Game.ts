import type { Team } from './Team';
import { Downs } from './enums';

export interface Game {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam?: Team;
  awayTeam?: Team;
  homeScore: number;
  awayScore: number;
  fieldPosition: number;
  yardsToGo: number;
  currentDown: Downs;
  randomSeed?: number;
  plays?: Play[];
}

/**
 * Play-by-play data matching backend PlayDto
 */
export interface Play {
  playType: string;
  possession: string;
  down: number;
  yardsToGo: number;
  startFieldPosition: number;
  endFieldPosition: number;
  yardsGained: number;
  startTime: number;
  stopTime: number;
  elapsedTime: number;
  isTouchdown: boolean;
  isSafety: boolean;
  interception: boolean;
  possessionChange: boolean;
  penalties: string[];
  fumbles: string[];
  injuries: string[];
  description: string;
}

export interface SimulateGameRequest {
  homeTeamId: number;
  awayTeamId: number;
  randomSeed?: number;
}

export interface SimulateGameResponse {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  message?: string;
}
