interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse bg-gridiron-bg-tertiary rounded ${className}`}
      aria-hidden="true"
    />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="card animate-fade-in">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-2">
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  );
};

export const SkeletonRow = () => {
  return (
    <div className="flex items-center justify-between p-3 bg-gridiron-dark rounded-lg">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-20 rounded" />
    </div>
  );
};

interface DashboardSkeletonProps {
  showLeagues?: boolean;
  showTeams?: boolean;
}

export const DashboardSkeleton = ({ showLeagues = true, showTeams = true }: DashboardSkeletonProps) => {
  return (
    <div className="space-y-8 animate-fade-in" role="status" aria-label="Loading dashboard">
      <Skeleton className="h-9 w-56" />

      {showLeagues && (
        <section className="card">
          <Skeleton className="h-7 w-44 mb-4" />
          <div className="space-y-2">
            <SkeletonRow />
            <SkeletonRow />
          </div>
          <div className="mt-4">
            <Skeleton className="h-10 w-36 rounded" />
          </div>
        </section>
      )}

      {showTeams && (
        <section className="card">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="space-y-2">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        </section>
      )}
    </div>
  );
};
