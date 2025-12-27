import { Card } from '@/components/ui/card';

export const HistoryLoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-muted rounded animate-pulse w-16" />
                <div className="h-4 bg-muted rounded animate-pulse w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters Skeleton */}
      <Card className="p-4">
        <div className="h-6 bg-muted rounded animate-pulse w-20 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-24" />
              <div className="h-10 bg-muted rounded animate-pulse w-full" />
            </div>
          ))}
        </div>
      </Card>

      {/* Game Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                <div className="h-5 bg-muted rounded animate-pulse w-32" />
              </div>
              <div className="h-4 bg-muted rounded animate-pulse w-48" />
              <div className="flex items-center gap-4">
                <div className="h-4 bg-muted rounded animate-pulse w-24" />
                <div className="h-4 bg-muted rounded animate-pulse w-20" />
                <div className="h-4 bg-muted rounded animate-pulse w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
