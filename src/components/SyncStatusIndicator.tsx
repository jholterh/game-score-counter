import { Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncStatusIndicatorProps {
  isSyncing: boolean;
  syncError: string | null;
  lastSyncedRound: number;
  className?: string;
}

export const SyncStatusIndicator = ({
  isSyncing,
  syncError,
  lastSyncedRound,
  className,
}: SyncStatusIndicatorProps) => {
  if (!isSyncing && !syncError && lastSyncedRound === 0) {
    // No sync activity yet
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {isSyncing && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}

      {!isSyncing && !syncError && lastSyncedRound > 0 && (
        <>
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-muted-foreground">Saved</span>
        </>
      )}

      {syncError && (
        <>
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-yellow-600 dark:text-yellow-400 text-xs">
            Save failed - will retry
          </span>
        </>
      )}
    </div>
  );
};
