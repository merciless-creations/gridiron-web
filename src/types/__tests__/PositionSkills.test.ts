import { describe, it, expect } from 'vitest';
import { Position } from '../enums';
import {
  POSITION_SKILLS,
  UNIVERSAL_ATTRIBUTES,
  ALL_SKILLS,
  SKILL_LABELS,
  ROSTER_GRID_POSITIONS,
  getPositionSkills,
  isSkillRelevant,
  getGridSkills,
  OFFENSE_SKILLS,
  DEFENSE_SKILLS,
  SPECIAL_TEAMS_SKILLS,
} from '../PositionSkills';

describe('PositionSkills', () => {
  describe('POSITION_SKILLS mapping', () => {
    it('covers all positions', () => {
      const allPositions = Object.values(Position).filter(v => typeof v === 'number') as Position[];

      allPositions.forEach(position => {
        expect(POSITION_SKILLS[position]).toBeDefined();
        expect(POSITION_SKILLS[position].primary).toBeDefined();
        expect(POSITION_SKILLS[position].secondary).toBeDefined();
        expect(POSITION_SKILLS[position].tertiary).toBeDefined();
      });
    });

    it('QB has passing as primary skill', () => {
      expect(POSITION_SKILLS[Position.QB].primary).toContain('passing');
    });

    it('K has kicking as primary skill', () => {
      expect(POSITION_SKILLS[Position.K].primary).toContain('kicking');
    });

    it('LB has tackling and coverage as primary skills', () => {
      expect(POSITION_SKILLS[Position.LB].primary).toContain('tackling');
      expect(POSITION_SKILLS[Position.LB].primary).toContain('coverage');
    });

    it('WR has catching and speed as primary skills', () => {
      expect(POSITION_SKILLS[Position.WR].primary).toContain('catching');
      expect(POSITION_SKILLS[Position.WR].primary).toContain('speed');
    });
  });

  describe('UNIVERSAL_ATTRIBUTES', () => {
    it('includes speed, strength, agility, and awareness', () => {
      expect(UNIVERSAL_ATTRIBUTES).toContain('speed');
      expect(UNIVERSAL_ATTRIBUTES).toContain('strength');
      expect(UNIVERSAL_ATTRIBUTES).toContain('agility');
      expect(UNIVERSAL_ATTRIBUTES).toContain('awareness');
    });
  });

  describe('ALL_SKILLS', () => {
    it('includes all universal attributes', () => {
      UNIVERSAL_ATTRIBUTES.forEach(attr => {
        expect(ALL_SKILLS).toContain(attr);
      });
    });

    it('includes position-specific skills', () => {
      expect(ALL_SKILLS).toContain('passing');
      expect(ALL_SKILLS).toContain('catching');
      expect(ALL_SKILLS).toContain('rushing');
      expect(ALL_SKILLS).toContain('blocking');
      expect(ALL_SKILLS).toContain('tackling');
      expect(ALL_SKILLS).toContain('coverage');
      expect(ALL_SKILLS).toContain('kicking');
    });
  });

  describe('SKILL_LABELS', () => {
    it('has labels for all skills', () => {
      ALL_SKILLS.forEach(skill => {
        expect(SKILL_LABELS[skill]).toBeDefined();
        expect(typeof SKILL_LABELS[skill]).toBe('string');
        expect(SKILL_LABELS[skill].length).toBeGreaterThan(0);
      });
    });
  });

  describe('getPositionSkills', () => {
    it('returns all skills for a position (primary + secondary + tertiary)', () => {
      const qbSkills = getPositionSkills(Position.QB);

      expect(qbSkills).toContain('passing');
      expect(qbSkills).toContain('awareness');
      expect(qbSkills).toContain('speed');
      expect(qbSkills).toContain('agility');
      expect(qbSkills).toContain('strength');
    });

    it('does not include irrelevant skills', () => {
      const qbSkills = getPositionSkills(Position.QB);

      expect(qbSkills).not.toContain('kicking');
      expect(qbSkills).not.toContain('tackling');
      expect(qbSkills).not.toContain('coverage');
    });
  });

  describe('isSkillRelevant', () => {
    it('returns true for relevant skills', () => {
      expect(isSkillRelevant(Position.QB, 'passing')).toBe(true);
      expect(isSkillRelevant(Position.RB, 'rushing')).toBe(true);
      expect(isSkillRelevant(Position.WR, 'catching')).toBe(true);
      expect(isSkillRelevant(Position.K, 'kicking')).toBe(true);
      expect(isSkillRelevant(Position.LB, 'tackling')).toBe(true);
      expect(isSkillRelevant(Position.CB, 'coverage')).toBe(true);
    });

    it('returns false for irrelevant skills', () => {
      expect(isSkillRelevant(Position.QB, 'kicking')).toBe(false);
      expect(isSkillRelevant(Position.QB, 'tackling')).toBe(false);
      expect(isSkillRelevant(Position.K, 'passing')).toBe(false);
      expect(isSkillRelevant(Position.K, 'tackling')).toBe(false);
      expect(isSkillRelevant(Position.WR, 'blocking')).toBe(false);
    });

    it('returns true for universal attributes for ALL positions', () => {
      // Universal attributes are always relevant regardless of position
      const allPositions = Object.values(Position).filter(v => typeof v === 'number') as Position[];

      allPositions.forEach(position => {
        expect(isSkillRelevant(position, 'speed')).toBe(true);
        expect(isSkillRelevant(position, 'strength')).toBe(true);
        expect(isSkillRelevant(position, 'agility')).toBe(true);
        expect(isSkillRelevant(position, 'awareness')).toBe(true);
      });
    });
  });

  describe('ROSTER_GRID_POSITIONS', () => {
    it('all grid includes all positions', () => {
      const allPositions = Object.values(Position).filter(v => typeof v === 'number') as Position[];

      allPositions.forEach(position => {
        expect(ROSTER_GRID_POSITIONS.all).toContain(position);
      });
    });

    it('offense grid includes only offensive positions', () => {
      expect(ROSTER_GRID_POSITIONS.offense).toContain(Position.QB);
      expect(ROSTER_GRID_POSITIONS.offense).toContain(Position.RB);
      expect(ROSTER_GRID_POSITIONS.offense).toContain(Position.WR);
      expect(ROSTER_GRID_POSITIONS.offense).toContain(Position.TE);
      expect(ROSTER_GRID_POSITIONS.offense).toContain(Position.OL);

      expect(ROSTER_GRID_POSITIONS.offense).not.toContain(Position.DL);
      expect(ROSTER_GRID_POSITIONS.offense).not.toContain(Position.LB);
      expect(ROSTER_GRID_POSITIONS.offense).not.toContain(Position.K);
    });

    it('defense grid includes only defensive positions', () => {
      expect(ROSTER_GRID_POSITIONS.defense).toContain(Position.DL);
      expect(ROSTER_GRID_POSITIONS.defense).toContain(Position.LB);
      expect(ROSTER_GRID_POSITIONS.defense).toContain(Position.CB);
      expect(ROSTER_GRID_POSITIONS.defense).toContain(Position.S);

      expect(ROSTER_GRID_POSITIONS.defense).not.toContain(Position.QB);
      expect(ROSTER_GRID_POSITIONS.defense).not.toContain(Position.WR);
      expect(ROSTER_GRID_POSITIONS.defense).not.toContain(Position.K);
    });

    it('special teams grid includes only K and P', () => {
      expect(ROSTER_GRID_POSITIONS.specialTeams).toContain(Position.K);
      expect(ROSTER_GRID_POSITIONS.specialTeams).toContain(Position.P);
      expect(ROSTER_GRID_POSITIONS.specialTeams).toHaveLength(2);
    });
  });

  describe('getGridSkills', () => {
    it('all grids include universal attributes', () => {
      const gridTypes: ('all' | 'offense' | 'defense' | 'specialTeams')[] = ['all', 'offense', 'defense', 'specialTeams'];

      gridTypes.forEach(gridType => {
        const skills = getGridSkills(gridType);
        expect(skills).toContain('speed');
        expect(skills).toContain('strength');
        expect(skills).toContain('agility');
        expect(skills).toContain('awareness');
      });
    });

    it('all grid returns all skills', () => {
      const allGridSkills = getGridSkills('all');

      // Should include skills from all positions
      expect(allGridSkills).toContain('passing');
      expect(allGridSkills).toContain('kicking');
      expect(allGridSkills).toContain('tackling');
      expect(allGridSkills).toContain('coverage');
    });

    it('offense grid includes offensive skills only', () => {
      const offenseSkills = getGridSkills('offense');

      expect(offenseSkills).toContain('passing');
      expect(offenseSkills).toContain('catching');
      expect(offenseSkills).toContain('rushing');
      expect(offenseSkills).toContain('blocking');

      expect(offenseSkills).not.toContain('kicking');
      expect(offenseSkills).not.toContain('tackling');
      expect(offenseSkills).not.toContain('coverage');
    });

    it('defense grid includes defensive skills only', () => {
      const defenseSkills = getGridSkills('defense');

      expect(defenseSkills).toContain('tackling');
      expect(defenseSkills).toContain('coverage');

      expect(defenseSkills).not.toContain('passing');
      expect(defenseSkills).not.toContain('kicking');
      expect(defenseSkills).not.toContain('blocking');
    });

    it('special teams grid includes kicking skills only', () => {
      const stSkills = getGridSkills('specialTeams');

      expect(stSkills).toContain('kicking');
      expect(stSkills).toContain('awareness');

      expect(stSkills).not.toContain('passing');
      expect(stSkills).not.toContain('tackling');
      expect(stSkills).not.toContain('catching');
    });
  });

  describe('Precomputed grid skills', () => {
    it('OFFENSE_SKILLS matches getGridSkills offense', () => {
      const computed = getGridSkills('offense');
      expect(OFFENSE_SKILLS.sort()).toEqual(computed.sort());
    });

    it('DEFENSE_SKILLS matches getGridSkills defense', () => {
      const computed = getGridSkills('defense');
      expect(DEFENSE_SKILLS.sort()).toEqual(computed.sort());
    });

    it('SPECIAL_TEAMS_SKILLS matches getGridSkills specialTeams', () => {
      const computed = getGridSkills('specialTeams');
      expect(SPECIAL_TEAMS_SKILLS.sort()).toEqual(computed.sort());
    });
  });
});
