/**
 * Player routes
 * - GET /api/players - List all players (with optional teamId filter)
 * - GET /api/players/:id - Get single player
 */

// Position enum matching frontend
const Position = {
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
};

// Generate realistic mock players for a team
function generateMockPlayers(teamId) {
  const firstNames = ['Marcus', 'James', 'Michael', 'David', 'Chris', 'Kevin', 'Justin', 'Tyler', 'Josh', 'Ryan', 'Brandon', 'Derek', 'Antonio', 'DeAndre', 'Tyreek', 'Travis', 'Patrick', 'Lamar', 'Derrick', 'Davante', 'Stefon', 'CeeDee', 'DK', 'Jaylen'];
  const lastNames = ['Johnson', 'Williams', 'Smith', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Lewis', 'Lee', 'Walker'];
  const colleges = ['Alabama', 'Ohio State', 'Georgia', 'Clemson', 'LSU', 'Michigan', 'Texas', 'Oklahoma', 'Notre Dame', 'Penn State', 'USC', 'Florida', 'Oregon', 'Auburn', 'Miami'];

  // Roster composition (53-man roster)
  const positionCounts = [
    { position: Position.QB, count: 3, numbers: [1, 2, 3, 4, 7, 8, 10, 12] },
    { position: Position.RB, count: 4, numbers: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29] },
    { position: Position.WR, count: 6, numbers: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 80, 81, 82, 83, 84, 85] },
    { position: Position.TE, count: 3, numbers: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89] },
    { position: Position.OL, count: 9, numbers: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79] },
    { position: Position.DL, count: 8, numbers: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 70, 71, 72, 73, 74, 75] },
    { position: Position.LB, count: 7, numbers: [40, 41, 42, 43, 44, 45, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59] },
    { position: Position.CB, count: 6, numbers: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35] },
    { position: Position.S, count: 5, numbers: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43] },
    { position: Position.K, count: 1, numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    { position: Position.P, count: 1, numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  ];

  const players = [];
  let playerId = teamId * 100; // Unique IDs based on team
  const usedNumbers = new Set();

  for (const { position, count, numbers } of positionCounts) {
    for (let i = 0; i < count; i++) {
      // Find an unused number
      let number = numbers[i % numbers.length];
      while (usedNumbers.has(number)) {
        number = (number % 99) + 1;
      }
      usedNumbers.add(number);

      const age = Math.floor(Math.random() * 12) + 22; // 22-33
      const exp = Math.max(0, age - 22 - Math.floor(Math.random() * 3));

      // Generate position-appropriate attributes
      const baseRating = Math.floor(Math.random() * 25) + 65; // 65-90 base
      const variance = () => Math.floor(Math.random() * 20) - 10; // -10 to +10

      players.push({
        id: playerId++,
        teamId,
        position,
        number,
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        age,
        exp,
        height: `${Math.floor(Math.random() * 12) + 68}"`, // 5'8" to 6'8" in inches
        college: colleges[Math.floor(Math.random() * colleges.length)],

        // General attributes
        speed: Math.min(99, Math.max(50, baseRating + variance())),
        strength: Math.min(99, Math.max(50, baseRating + variance())),
        agility: Math.min(99, Math.max(50, baseRating + variance())),
        awareness: Math.min(99, Math.max(50, baseRating + variance())),
        fragility: Math.floor(Math.random() * 30) + 20,
        morale: Math.floor(Math.random() * 30) + 60,
        discipline: Math.floor(Math.random() * 30) + 60,

        // Position-specific skills
        passing: position === Position.QB ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 40) + 20,
        catching: [Position.WR, Position.TE, Position.RB].includes(position) ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 40) + 20,
        rushing: [Position.RB, Position.QB].includes(position) ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 40) + 20,
        blocking: [Position.OL, Position.TE].includes(position) ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 40) + 20,
        tackling: [Position.DL, Position.LB, Position.CB, Position.S].includes(position) ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 40) + 20,
        coverage: [Position.CB, Position.S, Position.LB].includes(position) ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 40) + 20,
        kicking: [Position.K, Position.P].includes(position) ? Math.min(99, Math.max(50, baseRating + variance() + 10)) : Math.floor(Math.random() * 30) + 10,

        // Contract
        contractYears: Math.floor(Math.random() * 4) + 1,
        salary: Math.floor(Math.random() * 20000000) + 800000,

        // Development
        potential: Math.min(99, Math.max(50, baseRating + Math.floor(Math.random() * 15))),
        progression: Math.floor(Math.random() * 30) + 60,

        // Status
        health: Math.floor(Math.random() * 20) + 80,
        isRetired: false,
        isInjured: Math.random() < 0.1, // 10% injury rate
      });
    }
  }

  return players;
}

// Pre-generate players for teams 1-24
const allPlayers = new Map();
for (let teamId = 1; teamId <= 24; teamId++) {
  allPlayers.set(teamId, generateMockPlayers(teamId));
}

// Deterministic test players for reliable testing
// These have fixed values we can assert against
const testPlayers = [
  // QBs (3)
  { id: 1, teamId: 1, position: Position.QB, number: 12, firstName: 'Tom', lastName: 'Brady', age: 35, exp: 15, height: '76"', college: 'Michigan', speed: 65, strength: 70, agility: 72, awareness: 99, fragility: 30, morale: 90, discipline: 95, passing: 99, catching: 40, rushing: 55, blocking: 30, tackling: 20, coverage: 15, kicking: 25, contractYears: 2, salary: 25000000, potential: 85, progression: 70, health: 100, isRetired: false, isInjured: false },
  { id: 2, teamId: 1, position: Position.QB, number: 4, firstName: 'Derek', lastName: 'Carr', age: 30, exp: 8, height: '75"', college: 'Fresno State', speed: 72, strength: 68, agility: 75, awareness: 85, fragility: 35, morale: 80, discipline: 85, passing: 88, catching: 35, rushing: 65, blocking: 25, tackling: 18, coverage: 12, kicking: 20, contractYears: 3, salary: 18000000, potential: 88, progression: 75, health: 95, isRetired: false, isInjured: false },
  { id: 3, teamId: 1, position: Position.QB, number: 7, firstName: 'Injured', lastName: 'Quarterback', age: 25, exp: 3, height: '74"', college: 'Alabama', speed: 78, strength: 65, agility: 80, awareness: 75, fragility: 50, morale: 60, discipline: 70, passing: 82, catching: 30, rushing: 70, blocking: 20, tackling: 15, coverage: 10, kicking: 15, contractYears: 4, salary: 5000000, potential: 92, progression: 85, health: 30, isRetired: false, isInjured: true },

  // RBs (4)
  { id: 4, teamId: 1, position: Position.RB, number: 22, firstName: 'Derrick', lastName: 'Henry', age: 28, exp: 6, height: '75"', college: 'Alabama', speed: 92, strength: 95, agility: 88, awareness: 85, fragility: 40, morale: 85, discipline: 80, passing: 25, catching: 65, rushing: 98, blocking: 55, tackling: 45, coverage: 20, kicking: 10, contractYears: 2, salary: 12000000, potential: 90, progression: 65, health: 100, isRetired: false, isInjured: false },
  { id: 5, teamId: 1, position: Position.RB, number: 26, firstName: 'Saquon', lastName: 'Barkley', age: 26, exp: 5, height: '72"', college: 'Penn State', speed: 94, strength: 82, agility: 96, awareness: 88, fragility: 55, morale: 90, discipline: 85, passing: 30, catching: 85, rushing: 95, blocking: 50, tackling: 40, coverage: 25, kicking: 8, contractYears: 1, salary: 10000000, potential: 95, progression: 80, health: 90, isRetired: false, isInjured: false },
  { id: 6, teamId: 1, position: Position.RB, number: 21, firstName: 'Young', lastName: 'Rookie', age: 22, exp: 0, height: '70"', college: 'Georgia', speed: 90, strength: 75, agility: 92, awareness: 65, fragility: 25, morale: 95, discipline: 75, passing: 20, catching: 70, rushing: 80, blocking: 40, tackling: 35, coverage: 20, kicking: 5, contractYears: 4, salary: 2000000, potential: 98, progression: 95, health: 100, isRetired: false, isInjured: false },
  { id: 7, teamId: 1, position: Position.RB, number: 33, firstName: 'Old', lastName: 'Veteran', age: 33, exp: 11, height: '71"', college: 'Ohio State', speed: 78, strength: 80, agility: 75, awareness: 92, fragility: 60, morale: 75, discipline: 95, passing: 28, catching: 75, rushing: 82, blocking: 70, tackling: 50, coverage: 30, kicking: 12, contractYears: 1, salary: 3000000, potential: 82, progression: 40, health: 85, isRetired: false, isInjured: false },

  // WRs (5)
  { id: 8, teamId: 1, position: Position.WR, number: 17, firstName: 'Davante', lastName: 'Adams', age: 29, exp: 8, height: '73"', college: 'Fresno State', speed: 91, strength: 72, agility: 94, awareness: 95, fragility: 35, morale: 88, discipline: 90, passing: 15, catching: 99, rushing: 45, blocking: 55, tackling: 25, coverage: 20, kicking: 5, contractYears: 3, salary: 22000000, potential: 92, progression: 60, health: 100, isRetired: false, isInjured: false },
  { id: 9, teamId: 1, position: Position.WR, number: 14, firstName: 'Stefon', lastName: 'Diggs', age: 28, exp: 7, height: '72"', college: 'Maryland', speed: 93, strength: 68, agility: 95, awareness: 92, fragility: 30, morale: 75, discipline: 70, passing: 12, catching: 96, rushing: 50, blocking: 45, tackling: 22, coverage: 18, kicking: 3, contractYears: 2, salary: 20000000, potential: 93, progression: 65, health: 100, isRetired: false, isInjured: false },
  { id: 10, teamId: 1, position: Position.WR, number: 1, firstName: 'Injured', lastName: 'Receiver', age: 24, exp: 2, height: '74"', college: 'LSU', speed: 96, strength: 65, agility: 92, awareness: 78, fragility: 55, morale: 50, discipline: 65, passing: 8, catching: 88, rushing: 40, blocking: 35, tackling: 18, coverage: 15, kicking: 2, contractYears: 3, salary: 4000000, potential: 96, progression: 90, health: 25, isRetired: false, isInjured: true },
  { id: 11, teamId: 1, position: Position.WR, number: 11, firstName: 'Fast', lastName: 'Speedster', age: 23, exp: 1, height: '69"', college: 'Alabama', speed: 99, strength: 55, agility: 97, awareness: 70, fragility: 45, morale: 85, discipline: 72, passing: 5, catching: 82, rushing: 55, blocking: 30, tackling: 15, coverage: 12, kicking: 1, contractYears: 4, salary: 1500000, potential: 94, progression: 92, health: 100, isRetired: false, isInjured: false },
  { id: 12, teamId: 1, position: Position.WR, number: 85, firstName: 'Slow', lastName: 'Possession', age: 31, exp: 9, height: '75"', college: 'Notre Dame', speed: 82, strength: 78, agility: 80, awareness: 94, fragility: 40, morale: 90, discipline: 95, passing: 10, catching: 92, rushing: 35, blocking: 65, tackling: 30, coverage: 22, kicking: 4, contractYears: 1, salary: 5000000, potential: 88, progression: 45, health: 95, isRetired: false, isInjured: false },

  // TE (2)
  { id: 13, teamId: 1, position: Position.TE, number: 87, firstName: 'Travis', lastName: 'Kelce', age: 32, exp: 10, height: '77"', college: 'Cincinnati', speed: 85, strength: 82, agility: 88, awareness: 98, fragility: 35, morale: 95, discipline: 88, passing: 8, catching: 97, rushing: 30, blocking: 78, tackling: 35, coverage: 25, kicking: 2, contractYears: 2, salary: 14000000, potential: 90, progression: 50, health: 100, isRetired: false, isInjured: false },
  { id: 14, teamId: 1, position: Position.TE, number: 88, firstName: 'Blocking', lastName: 'Tight', age: 27, exp: 5, height: '78"', college: 'Iowa', speed: 75, strength: 88, agility: 72, awareness: 82, fragility: 30, morale: 80, discipline: 90, passing: 5, catching: 72, rushing: 25, blocking: 92, tackling: 45, coverage: 30, kicking: 1, contractYears: 3, salary: 6000000, potential: 84, progression: 55, health: 100, isRetired: false, isInjured: false },

  // OL (5)
  { id: 15, teamId: 1, position: Position.OL, number: 71, firstName: 'Trent', lastName: 'Williams', age: 34, exp: 12, height: '77"', college: 'Oklahoma', speed: 65, strength: 95, agility: 70, awareness: 96, fragility: 40, morale: 88, discipline: 92, passing: 2, catching: 15, rushing: 10, blocking: 99, tackling: 55, coverage: 10, kicking: 0, contractYears: 1, salary: 18000000, potential: 88, progression: 35, health: 92, isRetired: false, isInjured: false },
  { id: 16, teamId: 1, position: Position.OL, number: 76, firstName: 'Average', lastName: 'Guard', age: 27, exp: 5, height: '76"', college: 'Michigan', speed: 58, strength: 88, agility: 62, awareness: 80, fragility: 35, morale: 82, discipline: 85, passing: 1, catching: 10, rushing: 8, blocking: 85, tackling: 48, coverage: 8, kicking: 0, contractYears: 2, salary: 8000000, potential: 85, progression: 60, health: 100, isRetired: false, isInjured: false },
  { id: 17, teamId: 1, position: Position.OL, number: 65, firstName: 'Backup', lastName: 'Center', age: 25, exp: 3, height: '74"', college: 'Wisconsin', speed: 55, strength: 82, agility: 58, awareness: 72, fragility: 30, morale: 78, discipline: 80, passing: 0, catching: 8, rushing: 5, blocking: 78, tackling: 42, coverage: 5, kicking: 0, contractYears: 3, salary: 2500000, potential: 82, progression: 70, health: 100, isRetired: false, isInjured: false },
  { id: 18, teamId: 1, position: Position.OL, number: 72, firstName: 'Injured', lastName: 'Tackle', age: 29, exp: 7, height: '79"', college: 'Texas', speed: 60, strength: 92, agility: 65, awareness: 88, fragility: 55, morale: 65, discipline: 78, passing: 1, catching: 12, rushing: 6, blocking: 90, tackling: 50, coverage: 8, kicking: 0, contractYears: 2, salary: 12000000, potential: 88, progression: 55, health: 20, isRetired: false, isInjured: true },
  { id: 19, teamId: 1, position: Position.OL, number: 68, firstName: 'Rookie', lastName: 'Lineman', age: 22, exp: 0, height: '78"', college: 'Georgia', speed: 62, strength: 85, agility: 60, awareness: 62, fragility: 25, morale: 90, discipline: 72, passing: 0, catching: 5, rushing: 3, blocking: 72, tackling: 38, coverage: 4, kicking: 0, contractYears: 4, salary: 3500000, potential: 95, progression: 90, health: 100, isRetired: false, isInjured: false },

  // DL (4)
  { id: 20, teamId: 1, position: Position.DL, number: 99, firstName: 'Aaron', lastName: 'Donald', age: 31, exp: 9, height: '73"', college: 'Pittsburgh', speed: 82, strength: 99, agility: 88, awareness: 98, fragility: 30, morale: 92, discipline: 95, passing: 2, catching: 20, rushing: 15, blocking: 65, tackling: 99, coverage: 45, kicking: 0, contractYears: 2, salary: 28000000, potential: 92, progression: 45, health: 100, isRetired: false, isInjured: false },
  { id: 21, teamId: 1, position: Position.DL, number: 91, firstName: 'Edge', lastName: 'Rusher', age: 26, exp: 4, height: '76"', college: 'Ohio State', speed: 88, strength: 90, agility: 85, awareness: 82, fragility: 35, morale: 85, discipline: 80, passing: 1, catching: 15, rushing: 12, blocking: 55, tackling: 92, coverage: 35, kicking: 0, contractYears: 3, salary: 15000000, potential: 93, progression: 75, health: 100, isRetired: false, isInjured: false },
  { id: 22, teamId: 1, position: Position.DL, number: 95, firstName: 'Nose', lastName: 'Tackle', age: 29, exp: 7, height: '74"', college: 'Alabama', speed: 65, strength: 98, agility: 60, awareness: 85, fragility: 40, morale: 80, discipline: 88, passing: 0, catching: 10, rushing: 8, blocking: 70, tackling: 88, coverage: 25, kicking: 0, contractYears: 2, salary: 10000000, potential: 86, progression: 50, health: 95, isRetired: false, isInjured: false },
  { id: 23, teamId: 1, position: Position.DL, number: 97, firstName: 'Rotational', lastName: 'End', age: 24, exp: 2, height: '77"', college: 'Clemson', speed: 80, strength: 85, agility: 78, awareness: 70, fragility: 30, morale: 88, discipline: 75, passing: 0, catching: 12, rushing: 10, blocking: 50, tackling: 80, coverage: 28, kicking: 0, contractYears: 3, salary: 3000000, potential: 90, progression: 85, health: 100, isRetired: false, isInjured: false },

  // LBs (4)
  { id: 24, teamId: 1, position: Position.LB, number: 52, firstName: 'Bobby', lastName: 'Wagner', age: 32, exp: 11, height: '72"', college: 'Utah State', speed: 85, strength: 88, agility: 90, awareness: 99, fragility: 35, morale: 90, discipline: 95, passing: 3, catching: 55, rushing: 20, blocking: 60, tackling: 98, coverage: 88, kicking: 0, contractYears: 1, salary: 12000000, potential: 90, progression: 40, health: 100, isRetired: false, isInjured: false },
  { id: 25, teamId: 1, position: Position.LB, number: 55, firstName: 'Pass', lastName: 'Rusher', age: 27, exp: 5, height: '75"', college: 'Georgia', speed: 90, strength: 85, agility: 88, awareness: 85, fragility: 40, morale: 85, discipline: 82, passing: 2, catching: 40, rushing: 18, blocking: 55, tackling: 92, coverage: 72, kicking: 0, contractYears: 2, salary: 10000000, potential: 91, progression: 65, health: 100, isRetired: false, isInjured: false },
  { id: 26, teamId: 1, position: Position.LB, number: 58, firstName: 'Coverage', lastName: 'Linebacker', age: 25, exp: 3, height: '73"', college: 'LSU', speed: 88, strength: 80, agility: 92, awareness: 82, fragility: 30, morale: 88, discipline: 78, passing: 4, catching: 62, rushing: 15, blocking: 50, tackling: 85, coverage: 90, kicking: 0, contractYears: 3, salary: 6000000, potential: 92, progression: 80, health: 100, isRetired: false, isInjured: false },
  { id: 27, teamId: 1, position: Position.LB, number: 50, firstName: 'Backup', lastName: 'Backer', age: 24, exp: 2, height: '74"', college: 'Penn State', speed: 82, strength: 78, agility: 80, awareness: 70, fragility: 28, morale: 82, discipline: 75, passing: 1, catching: 35, rushing: 12, blocking: 45, tackling: 78, coverage: 68, kicking: 0, contractYears: 2, salary: 1500000, potential: 85, progression: 82, health: 100, isRetired: false, isInjured: false },

  // CBs (4)
  { id: 28, teamId: 1, position: Position.CB, number: 24, firstName: 'Sauce', lastName: 'Gardner', age: 23, exp: 2, height: '75"', college: 'Cincinnati', speed: 95, strength: 72, agility: 96, awareness: 88, fragility: 25, morale: 95, discipline: 85, passing: 2, catching: 72, rushing: 25, blocking: 40, tackling: 82, coverage: 98, kicking: 0, contractYears: 3, salary: 8000000, potential: 99, progression: 92, health: 100, isRetired: false, isInjured: false },
  { id: 29, teamId: 1, position: Position.CB, number: 20, firstName: 'Veteran', lastName: 'Corner', age: 30, exp: 8, height: '71"', college: 'Florida', speed: 90, strength: 70, agility: 88, awareness: 95, fragility: 45, morale: 82, discipline: 92, passing: 1, catching: 68, rushing: 20, blocking: 38, tackling: 78, coverage: 92, kicking: 0, contractYears: 1, salary: 10000000, potential: 88, progression: 45, health: 88, isRetired: false, isInjured: false },
  { id: 30, teamId: 1, position: Position.CB, number: 23, firstName: 'Slot', lastName: 'Corner', age: 26, exp: 4, height: '69"', college: 'Ohio State', speed: 92, strength: 68, agility: 94, awareness: 85, fragility: 35, morale: 85, discipline: 80, passing: 2, catching: 65, rushing: 22, blocking: 35, tackling: 75, coverage: 88, kicking: 0, contractYears: 2, salary: 7000000, potential: 89, progression: 70, health: 100, isRetired: false, isInjured: false },
  { id: 31, teamId: 1, position: Position.CB, number: 27, firstName: 'Injured', lastName: 'Cornerback', age: 25, exp: 3, height: '72"', college: 'Alabama', speed: 93, strength: 70, agility: 91, awareness: 80, fragility: 50, morale: 55, discipline: 72, passing: 1, catching: 60, rushing: 18, blocking: 32, tackling: 72, coverage: 85, kicking: 0, contractYears: 2, salary: 5000000, potential: 91, progression: 78, health: 15, isRetired: false, isInjured: true },

  // Safeties (3)
  { id: 32, teamId: 1, position: Position.S, number: 3, firstName: 'Derwin', lastName: 'James', age: 27, exp: 5, height: '74"', college: 'Florida State', speed: 92, strength: 85, agility: 90, awareness: 94, fragility: 40, morale: 90, discipline: 88, passing: 3, catching: 70, rushing: 28, blocking: 55, tackling: 95, coverage: 92, kicking: 0, contractYears: 3, salary: 16000000, potential: 94, progression: 70, health: 100, isRetired: false, isInjured: false },
  { id: 33, teamId: 1, position: Position.S, number: 31, firstName: 'Free', lastName: 'Safety', age: 28, exp: 6, height: '72"', college: 'LSU', speed: 94, strength: 75, agility: 92, awareness: 90, fragility: 35, morale: 85, discipline: 85, passing: 2, catching: 75, rushing: 22, blocking: 45, tackling: 82, coverage: 95, kicking: 0, contractYears: 2, salary: 11000000, potential: 90, progression: 60, health: 100, isRetired: false, isInjured: false },
  { id: 34, teamId: 1, position: Position.S, number: 29, firstName: 'Box', lastName: 'Safety', age: 25, exp: 3, height: '73"', college: 'Clemson', speed: 88, strength: 82, agility: 85, awareness: 82, fragility: 30, morale: 88, discipline: 80, passing: 1, catching: 58, rushing: 25, blocking: 52, tackling: 90, coverage: 80, kicking: 0, contractYears: 3, salary: 5000000, potential: 88, progression: 75, health: 100, isRetired: false, isInjured: false },

  // K and P
  { id: 35, teamId: 1, position: Position.K, number: 5, firstName: 'Justin', lastName: 'Tucker', age: 33, exp: 11, height: '73"', college: 'Texas', speed: 55, strength: 65, agility: 60, awareness: 95, fragility: 20, morale: 92, discipline: 98, passing: 5, catching: 20, rushing: 15, blocking: 25, tackling: 30, coverage: 15, kicking: 99, contractYears: 2, salary: 6000000, potential: 92, progression: 40, health: 100, isRetired: false, isInjured: false },
  { id: 36, teamId: 1, position: Position.P, number: 6, firstName: 'Michael', lastName: 'Dickson', age: 28, exp: 5, height: '74"', college: 'Texas', speed: 62, strength: 70, agility: 65, awareness: 88, fragility: 22, morale: 85, discipline: 90, passing: 35, catching: 25, rushing: 20, blocking: 30, tackling: 35, coverage: 20, kicking: 95, contractYears: 3, salary: 3500000, potential: 90, progression: 55, health: 100, isRetired: false, isInjured: false },
];

// Summary of test players:
// Total: 36 players
// Injured: 5 (ids: 3, 10, 18, 31, plus one with low health)
// Ages: 22-35 (Young Rookie is 22, Tom Brady is 35)
// Positions: QB(3), RB(4), WR(5), TE(2), OL(5), DL(4), LB(4), CB(4), S(3), K(1), P(1)

const mocks = [];

// List all players (optionally filtered by teamId)
const listPlayers = {
  name: 'listPlayers',
  mockRoute: '/api/players',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const teamId = req.query.teamId ? Number(req.query.teamId) : null;
        if (teamId) {
          const teamPlayers = allPlayers.get(teamId) || [];
          return JSON.stringify(teamPlayers);
        }
        // Return all players
        const all = [];
        allPlayers.forEach(players => all.push(...players));
        return JSON.stringify(all);
      },
      // Deterministic test data for reliable integration tests
      testDataScenario: function (req) {
        const teamId = req.query.teamId ? Number(req.query.teamId) : null;
        if (teamId === 1) {
          return JSON.stringify(testPlayers);
        }
        return JSON.stringify([]);
      },
      emptyScenario: function () {
        return JSON.stringify([]);
      },
      errorScenario: function (req, res) {
        res.status(500);
        return JSON.stringify({ error: 'Internal server error', status: 500 });
      },
    },
  ],
};

// Get single player
const getPlayer = {
  name: 'getPlayer',
  mockRoute: '/api/players/:id',
  method: 'GET',
  testScope: 'success',
  testScenario: 'defaultScenario',
  jsonTemplate: [
    {
      defaultScenario: function (req) {
        const playerId = Number(req.params.id);
        for (const players of allPlayers.values()) {
          const player = players.find(p => p.id === playerId);
          if (player) {
            return JSON.stringify(player);
          }
        }
        return JSON.stringify({ error: 'Player not found' });
      },
      notFoundScenario: function (req, res) {
        res.status(404);
        return JSON.stringify({ error: 'Player not found', status: 404 });
      },
    },
  ],
};

mocks.push(listPlayers);
mocks.push(getPlayer);

exports.mocks = mocks;
