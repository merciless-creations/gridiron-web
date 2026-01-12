/**
 * Position Skills Mapping
 *
 * Defines which skills/attributes are relevant for each position.
 * Based on docs/position-skills-mapping.md
 *
 * Skills not in a position's primary/secondary/tertiary list will
 * display as "--" in the roster grid.
 */

import { Position } from './enums';

/**
 * All skill keys that exist on a Player
 * These map directly to Player interface fields
 */
export type Skill =
  // Universal attributes
  | 'speed'
  | 'strength'
  | 'agility'
  | 'awareness'
  // Position-specific skills
  | 'passing'
  | 'catching'
  | 'rushing'
  | 'blocking'
  | 'tackling'
  | 'coverage'
  | 'kicking';

/**
 * Universal attributes that all positions have
 */
export const UNIVERSAL_ATTRIBUTES: Skill[] = ['speed', 'strength', 'agility', 'awareness'];

/**
 * Position skills configuration
 */
export interface PositionSkillConfig {
  primary: Skill[];
  secondary: Skill[];
  tertiary: Skill[];
}

/**
 * Maps each position to its relevant skills
 *
 * - Primary: Core stats for that position
 * - Secondary: Supporting stats that contribute to performance
 * - Tertiary: Situational or minor contributors
 */
export const POSITION_SKILLS: Record<Position, PositionSkillConfig> = {
  // Quarterback
  [Position.QB]: {
    primary: ['passing', 'awareness'],
    secondary: ['speed', 'agility'],
    tertiary: ['strength'],
  },

  // Running Back
  [Position.RB]: {
    primary: ['speed', 'agility', 'rushing'],
    secondary: ['catching'],
    tertiary: ['strength'],
  },

  // Wide Receiver
  [Position.WR]: {
    primary: ['speed', 'catching'],
    secondary: ['agility'],
    tertiary: ['strength'],
  },

  // Tight End
  [Position.TE]: {
    primary: ['catching', 'blocking'],
    secondary: ['speed', 'strength'],
    tertiary: ['agility'],
  },

  // Offensive Line
  [Position.OL]: {
    primary: ['blocking', 'strength'],
    secondary: ['agility'],
    tertiary: ['awareness'],
  },

  // Defensive Line
  [Position.DL]: {
    primary: ['tackling', 'strength'],
    secondary: ['speed', 'agility'],
    tertiary: ['awareness'],
  },

  // Linebacker
  [Position.LB]: {
    primary: ['tackling', 'coverage', 'awareness'],
    secondary: ['speed', 'agility'],
    tertiary: ['strength'],
  },

  // Cornerback
  [Position.CB]: {
    primary: ['coverage', 'speed', 'agility'],
    secondary: ['tackling', 'awareness'],
    tertiary: ['strength'],
  },

  // Safety
  [Position.S]: {
    primary: ['coverage', 'speed', 'agility'],
    secondary: ['tackling', 'awareness'],
    tertiary: ['strength'],
  },

  // Kicker
  [Position.K]: {
    primary: ['kicking'],
    secondary: ['awareness'],
    tertiary: [],
  },

  // Punter
  [Position.P]: {
    primary: ['kicking'],
    secondary: ['awareness'],
    tertiary: [],
  },
};

/**
 * Get all skills relevant to a position (primary + secondary + tertiary)
 */
export function getPositionSkills(position: Position): Skill[] {
  const config = POSITION_SKILLS[position];
  return [...config.primary, ...config.secondary, ...config.tertiary];
}

/**
 * Check if a skill is relevant for a given position
 * Universal attributes are always relevant for all positions
 */
export function isSkillRelevant(position: Position, skill: Skill): boolean {
  // Universal attributes are always relevant
  if (UNIVERSAL_ATTRIBUTES.includes(skill)) {
    return true;
  }
  const skills = getPositionSkills(position);
  return skills.includes(skill);
}

/**
 * All skills available in the system
 */
export const ALL_SKILLS: Skill[] = [
  'speed',
  'strength',
  'agility',
  'awareness',
  'passing',
  'catching',
  'rushing',
  'blocking',
  'tackling',
  'coverage',
  'kicking',
];

/**
 * Human-readable labels for skills
 */
export const SKILL_LABELS: Record<Skill, string> = {
  speed: 'Speed',
  strength: 'Strength',
  agility: 'Agility',
  awareness: 'Awareness',
  passing: 'Passing',
  catching: 'Catching',
  rushing: 'Rushing',
  blocking: 'Blocking',
  tackling: 'Tackling',
  coverage: 'Coverage',
  kicking: 'Kicking',
};

/**
 * 3-letter abbreviations for skills (used in grid headers)
 */
export const SKILL_ABBREV: Record<Skill, string> = {
  speed: 'SPD',
  strength: 'STR',
  agility: 'AGI',
  awareness: 'AWR',
  passing: 'PAS',
  catching: 'CAT',
  rushing: 'RSH',
  blocking: 'BLK',
  tackling: 'TKL',
  coverage: 'COV',
  kicking: 'KCK',
};

/**
 * Roster grid types
 */
export type RosterGridType = 'all' | 'offense' | 'defense' | 'specialTeams';

/**
 * Positions included in each grid type
 */
export const ROSTER_GRID_POSITIONS: Record<RosterGridType, Position[]> = {
  all: [
    Position.QB, Position.RB, Position.WR, Position.TE, Position.OL,
    Position.DL, Position.LB, Position.CB, Position.S,
    Position.K, Position.P,
  ],
  offense: [Position.QB, Position.RB, Position.WR, Position.TE, Position.OL],
  defense: [Position.DL, Position.LB, Position.CB, Position.S],
  specialTeams: [Position.K, Position.P],
};

/**
 * Get the union of all skills relevant to positions in a grid type
 * Used to determine which skill columns are available in each grid
 * Universal attributes are always included in every grid
 */
export function getGridSkills(gridType: RosterGridType): Skill[] {
  const positions = ROSTER_GRID_POSITIONS[gridType];
  // Always start with universal attributes
  const skillSet = new Set<Skill>(UNIVERSAL_ATTRIBUTES);

  for (const position of positions) {
    const skills = getPositionSkills(position);
    for (const skill of skills) {
      skillSet.add(skill);
    }
  }

  return Array.from(skillSet);
}

/**
 * Offense grid available skills
 */
export const OFFENSE_SKILLS = getGridSkills('offense');

/**
 * Defense grid available skills
 */
export const DEFENSE_SKILLS = getGridSkills('defense');

/**
 * Special teams grid available skills
 */
export const SPECIAL_TEAMS_SKILLS = getGridSkills('specialTeams');
