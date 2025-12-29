/**
 * Bulk Actions Component
 *
 * Bulk action buttons for admin castaway management.
 */

import { Star } from 'lucide-react';
import type { BulkActionsProps } from './types';

export function BulkActions({
  missingPhotosCount,
  onAutoPopulatePhotos,
  isPending,
}: BulkActionsProps) {
  if (missingPhotosCount === 0) {
    return null;
  }

  return (
    <button
      onClick={onAutoPopulatePhotos}
      disabled={isPending}
      className="btn bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
    >
      {isPending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Populating...
        </>
      ) : (
        <>
          <Star className="h-4 w-4" />
          Auto-Populate {missingPhotosCount} Photos
        </>
      )}
    </button>
  );
}
