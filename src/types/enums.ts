// Enums matching C# DomainObjects enums
// Using const objects instead of numeric enums for TypeScript compatibility

export const Position = {
  QB: 0,
  RB: 1,
  WR: 2,
  TE: 3,
  OL: 4,
  DL: 5,
  LB: 6,
  CB: 7,
  S: 8,
  K: 9,
  P: 10,
} as const;

export type Position = typeof Position[keyof typeof Position];

export const Possession = {
  Home: 0,
  Away: 1,
} as const;

export type Possession = typeof Possession[keyof typeof Possession];

export const Downs = {
  First: 1,
  Second: 2,
  Third: 3,
  Fourth: 4,
} as const;

export type Downs = typeof Downs[keyof typeof Downs];

export const PlayType = {
  Run: 0,
  Pass: 1,
  Kickoff: 2,
  Punt: 3,
  FieldGoal: 4,
} as const;

export type PlayType = typeof PlayType[keyof typeof PlayType];

export const PositionLabels: Record<Position, string> = {
  [Position.QB]: 'QB',
  [Position.RB]: 'RB',
  [Position.WR]: 'WR',
  [Position.TE]: 'TE',
  [Position.OL]: 'OL',
  [Position.DL]: 'DL',
  [Position.LB]: 'LB',
  [Position.CB]: 'CB',
  [Position.S]: 'S',
  [Position.K]: 'K',
  [Position.P]: 'P',
};

// Player status for filtering and display
export const PlayerStatus = {
  Active: 0,
  Injured: 1,
  Retired: 2,
} as const;

export type PlayerStatus = typeof PlayerStatus[keyof typeof PlayerStatus];

export const PlayerStatusLabels: Record<PlayerStatus, string> = {
  [PlayerStatus.Active]: 'Active',
  [PlayerStatus.Injured]: 'Injured',
  [PlayerStatus.Retired]: 'Retired',
};

// Short labels for compact display
export const PlayerStatusShortLabels: Record<PlayerStatus, string> = {
  [PlayerStatus.Active]: 'ACT',
  [PlayerStatus.Injured]: 'INJ',
  [PlayerStatus.Retired]: 'RET',
};

// CSS classes for status badges
export const PlayerStatusColors: Record<PlayerStatus, string> = {
  [PlayerStatus.Active]: 'bg-gridiron-win text-white',
  [PlayerStatus.Injured]: 'bg-gridiron-loss text-white',
  [PlayerStatus.Retired]: 'bg-gridiron-text-muted text-gridiron-bg-primary',
};
