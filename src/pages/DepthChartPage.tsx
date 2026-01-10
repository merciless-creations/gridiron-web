import { useParams, Link } from 'react-router-dom';
import { useTeam } from '../api/teams';
import { useDepthChart } from '../api/depthChart';
import { Loading } from '../components/Loading';
import { Position, PositionLabels } from '../types/enums';
import type { Player } from '../types/Player';

interface PositionGroupProps {
  title: string;
  positions: Position[];
  depthChart: Partial<Record<Position, Player[]>>;
  isOwner: boolean;
}

const getRatingColor = (rating: number): string => {
  if (rating >= 90) return 'text-yellow-400';
  if (rating >= 80) return 'text-gridiron-accent';
  if (rating >= 70) return 'text-blue-400';
  if (rating >= 60) return 'text-gray-300';
  return 'text-gray-500';
};

const getRatingBgColor = (rating: number): string => {
  if (rating >= 90) return 'bg-yellow-400/20 border-yellow-400/40';
  if (rating >= 80) return 'bg-gridiron-accent/20 border-gridiron-accent/40';
  if (rating >= 70) return 'bg-blue-400/20 border-blue-400/40';
  if (rating >= 60) return 'bg-gray-400/20 border-gray-400/40';
  return 'bg-gray-600/20 border-gray-600/40';
};

const PlayerCard = ({
  player,
  depth,
  isOwner
}: {
  player: Player;
  depth: number;
  isOwner: boolean;
}) => {
  const isStarter = depth === 0;
  const rating = player.awareness;

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg border transition-all
        ${isStarter
          ? 'bg-gridiron-bg-tertiary border-gridiron-accent/30'
          : 'bg-gridiron-bg-secondary border-gridiron-border-subtle'
        }
        ${isOwner ? 'hover:border-gridiron-accent/50 cursor-grab' : ''}
      `}
      data-testid={`player-card-${player.id}`}
    >
      <div className={`
        w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm border
        ${getRatingBgColor(rating)} ${getRatingColor(rating)}
      `}>
        {rating}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white truncate">
            {player.firstName} {player.lastName}
          </span>
          {isStarter && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-gridiron-accent/20 text-gridiron-accent rounded">
              STARTER
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gridiron-text-secondary">
          <span>#{player.number}</span>
          <span>{player.exp} YR{player.exp !== 1 ? 'S' : ''}</span>
          <span>${(player.salary / 1000000).toFixed(1)}M</span>
        </div>
      </div>

      {isOwner && (
        <div className="text-gridiron-text-muted">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}
    </div>
  );
};

const PositionSlot = ({
  position,
  players,
  isOwner
}: {
  position: Position;
  players: Player[];
  isOwner: boolean;
}) => {
  return (
    <div className="bg-gridiron-bg-card rounded-lg border border-gridiron-border-subtle overflow-hidden">
      <div className="px-4 py-3 bg-gridiron-bg-tertiary border-b border-gridiron-border-subtle">
        <h4 className="font-semibold text-gridiron-text-primary">
          {PositionLabels[position]}
          <span className="ml-2 text-sm font-normal text-gridiron-text-secondary">
            ({players.length})
          </span>
        </h4>
      </div>
      <div className="p-3 space-y-2">
        {players.map((player, idx) => (
          <PlayerCard
            key={player.id}
            player={player}
            depth={idx}
            isOwner={isOwner}
          />
        ))}
        {players.length === 0 && (
          <div className="text-center py-4 text-gridiron-text-muted text-sm">
            No players assigned
          </div>
        )}
      </div>
    </div>
  );
};

const PositionGroup = ({ title, positions, depthChart, isOwner }: PositionGroupProps) => {
  return (
    <div className="card" data-testid={`position-group-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h3 className="text-xl font-bold text-gridiron-text-primary mb-4 flex items-center gap-2">
        <span className={`
          w-2 h-6 rounded
          ${title === 'Offense' ? 'bg-gridiron-accent' : ''}
          ${title === 'Defense' ? 'bg-red-500' : ''}
          ${title === 'Special Teams' ? 'bg-yellow-500' : ''}
        `} />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {positions.map(pos => (
          <PositionSlot
            key={pos}
            position={pos}
            players={depthChart[pos] || []}
            isOwner={isOwner}
          />
        ))}
      </div>
    </div>
  );
};

export const DepthChartPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const teamIdNum = Number(teamId);

  const { data: team, isLoading: teamLoading, error: teamError } = useTeam(teamIdNum);
  const { data: depthChartData, isLoading: depthChartLoading, error: depthChartError } = useDepthChart(teamIdNum);

  // For now, assume the viewer is the owner (this would come from auth context in real app)
  const isOwner = true;

  const isLoading = teamLoading || depthChartLoading;
  const error = teamError || depthChartError;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;

    if (status === 404) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Team Not Found</h2>
          <p className="text-gray-400 mb-6">
            The team you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      );
    }

    if (status === 403) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            You don't have permission to view this depth chart.
          </p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Team</h2>
        <p className="text-gray-400 mb-6">
          Something went wrong while loading the depth chart. Please try again.
        </p>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-400">Team Not Found</h2>
        <Link to="/dashboard" className="btn-primary mt-4">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const offensePositions = [Position.QB, Position.RB, Position.WR, Position.TE, Position.OL];
  const defensePositions = [Position.DL, Position.LB, Position.CB, Position.S];
  const specialTeamsPositions = [Position.K, Position.P];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link
            to={`/teams/${teamId}/manage`}
            className="text-gridiron-accent hover:underline text-sm mb-2 inline-block"
          >
            &larr; Back to Team Management
          </Link>
          <h1 className="text-3xl font-bold">
            {team.city} {team.name}
          </h1>
          <p className="text-gray-400">Depth Chart</p>
        </div>

        <div className="flex items-center gap-3">
          {isOwner && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gridiron-bg-tertiary rounded-lg border border-gridiron-border-subtle">
              <svg className="w-5 h-5 text-gridiron-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gridiron-text-secondary">
                Drag & drop coming soon
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="text-gridiron-text-secondary">Rating:</span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded ${getRatingBgColor(90)} ${getRatingColor(90)} border`}>90+</span>
            <span className="text-gridiron-text-muted">Elite</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded ${getRatingBgColor(80)} ${getRatingColor(80)} border`}>80+</span>
            <span className="text-gridiron-text-muted">Star</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded ${getRatingBgColor(70)} ${getRatingColor(70)} border`}>70+</span>
            <span className="text-gridiron-text-muted">Starter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded ${getRatingBgColor(60)} ${getRatingColor(60)} border`}>60+</span>
            <span className="text-gridiron-text-muted">Backup</span>
          </div>
        </div>
      </div>

      {/* Position Groups */}
      <PositionGroup
        title="Offense"
        positions={offensePositions}
        depthChart={depthChartData?.positions ?? {}}
        isOwner={isOwner}
      />

      <PositionGroup
        title="Defense"
        positions={defensePositions}
        depthChart={depthChartData?.positions ?? {}}
        isOwner={isOwner}
      />

      <PositionGroup
        title="Special Teams"
        positions={specialTeamsPositions}
        depthChart={depthChartData?.positions ?? {}}
        isOwner={isOwner}
      />
    </div>
  );
};

export default DepthChartPage;
