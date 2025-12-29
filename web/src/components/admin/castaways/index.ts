/**
 * Admin Castaways Component Exports
 *
 * All admin castaways sub-components exported from a single location.
 */

export { CastawayCard } from './CastawayCard';
export { CastawayGrid } from './CastawayGrid';
export { EliminateModal } from './EliminateModal';
export { EditCastawayModal } from './EditCastawayModal';
export { BulkActions } from './BulkActions';

// Re-export types for convenience
export type {
  EditFormData,
  CastawayCardProps,
  CastawayGridProps,
  EliminateModalProps,
  EditCastawayModalProps,
  BulkActionsProps,
} from './types';
