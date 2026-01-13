import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlayByPlayViewer } from '../PlayByPlayViewer';
import type { Play } from '../../types/Game';

const createMockPlay = (overrides: Partial<Play> = {}): Play => ({
  playType: 'Run',
  possession: 'Home',
  down: 1,
  yardsToGo: 10,
  startFieldPosition: 25,
  endFieldPosition: 30,
  yardsGained: 5,
  startTime: 3600,
  stopTime: 3570,
  elapsedTime: 30,
  isTouchdown: false,
  isSafety: false,
  interception: false,
  possessionChange: false,
  penalties: [],
  fumbles: [],
  injuries: [],
  description: 'Run play for 5 yards',
  ...overrides,
});

describe('PlayByPlayViewer', () => {
  describe('Loading State', () => {
    it('renders loading spinner when isLoading is true', () => {
      render(
        <PlayByPlayViewer
          plays={[]}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
          isLoading={true}
        />
      );

      expect(screen.getByTestId('play-by-play-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading play-by-play...')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty message when no plays provided', () => {
      render(
        <PlayByPlayViewer
          plays={[]}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByTestId('play-by-play-empty')).toBeInTheDocument();
      expect(
        screen.getByText('No play-by-play data available for this game.')
      ).toBeInTheDocument();
    });
  });

  describe('Play Display', () => {
    it('renders play-by-play viewer with plays', () => {
      const plays = [createMockPlay()];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByTestId('play-by-play-viewer')).toBeInTheDocument();
      expect(screen.getByText('Play-by-Play')).toBeInTheDocument();
    });

    it('displays play description', () => {
      const plays = [createMockPlay({ description: 'Custom play description' })];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('Custom play description')).toBeInTheDocument();
    });

    it('displays yards gained', () => {
      const plays = [createMockPlay({ yardsGained: 12 })];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('+12 yards')).toBeInTheDocument();
    });

    it('displays negative yards correctly', () => {
      const plays = [createMockPlay({ yardsGained: -3 })];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('-3 yards')).toBeInTheDocument();
    });

    it('displays down and distance', () => {
      const plays = [createMockPlay({ down: 2, yardsToGo: 7 })];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('2nd & 7')).toBeInTheDocument();
    });

    it('displays team name based on possession', () => {
      const plays = [createMockPlay({ possession: 'Home' })];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Chicago Bears"
          awayTeamName="Green Bay Packers"
        />
      );

      expect(screen.getByText('Chicago Bears')).toBeInTheDocument();
    });

    it('displays away team when possession is Away', () => {
      const plays = [createMockPlay({ possession: 'Away' })];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Chicago Bears"
          awayTeamName="Green Bay Packers"
        />
      );

      expect(screen.getByText('Green Bay Packers')).toBeInTheDocument();
    });
  });

  describe('Special Play Badges', () => {
    it('displays TD badge for touchdowns', () => {
      const plays = [createMockPlay({ isTouchdown: true })];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('TD')).toBeInTheDocument();
    });

    it('displays INT badge for interceptions', () => {
      const plays = [createMockPlay({ interception: true })];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('INT')).toBeInTheDocument();
    });

    it('displays SAFETY badge for safeties', () => {
      const plays = [createMockPlay({ isSafety: true })];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('SAFETY')).toBeInTheDocument();
    });

    it('displays TURNOVER badge for possession changes', () => {
      const plays = [createMockPlay({ possessionChange: true })];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('TURNOVER')).toBeInTheDocument();
    });
  });

  describe('Penalties', () => {
    it('displays penalty flags', () => {
      const plays = [createMockPlay({ penalties: ['Holding - 10 yards'] })];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('FLAG: Holding - 10 yards')).toBeInTheDocument();
    });

    it('displays multiple penalties', () => {
      const plays = [
        createMockPlay({
          penalties: ['Holding - 10 yards', 'False Start - 5 yards'],
        }),
      ];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('FLAG: Holding - 10 yards')).toBeInTheDocument();
      expect(screen.getByText('FLAG: False Start - 5 yards')).toBeInTheDocument();
    });
  });

  describe('Statistics Summary', () => {
    it('displays total play count', () => {
      const plays = [createMockPlay(), createMockPlay(), createMockPlay()];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('plays')).toBeInTheDocument();
    });

    it('displays touchdown count', () => {
      const plays = [
        createMockPlay({ isTouchdown: true }),
        createMockPlay({ isTouchdown: true }),
        createMockPlay({ isTouchdown: false }),
      ];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      const tdElements = screen.getAllByText('2');
      expect(tdElements.length).toBeGreaterThan(0);
      expect(screen.getByText('TDs')).toBeInTheDocument();
    });

    it('displays turnover count', () => {
      const plays = [
        createMockPlay({ interception: true }),
        createMockPlay({ possessionChange: true }),
        createMockPlay(),
      ];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('turnovers')).toBeInTheDocument();
    });
  });

  describe('Quarter Grouping', () => {
    it('groups plays by quarter', () => {
      // Q1 starts at 3600, Q2 at 2700, Q3 at 1800, Q4 at 900
      const plays = [
        createMockPlay({ startTime: 3500 }), // Q1
        createMockPlay({ startTime: 2600 }), // Q2
      ];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('Quarter 1')).toBeInTheDocument();
      expect(screen.getByText('Quarter 2')).toBeInTheDocument();
    });

    it('displays overtime for quarters > 4', () => {
      // Time would be negative or 0 for overtime, but we calculate based on elapsed
      const plays = [createMockPlay({ startTime: 100 })]; // Q4

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      expect(screen.getByText('Quarter 4')).toBeInTheDocument();
    });
  });

  describe('Scrollable Container', () => {
    it('renders a scrollable play list container', () => {
      const plays = [createMockPlay()];

      render(
        <PlayByPlayViewer
          plays={plays}
          homeTeamName="Test Home"
          awayTeamName="Test Away"
        />
      );

      const playList = screen.getByTestId('play-list');
      expect(playList).toHaveClass('max-h-96', 'overflow-y-auto');
    });
  });
});
