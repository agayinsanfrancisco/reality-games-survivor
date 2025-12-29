/**
 * Admin Castaways Component Types
 *
 * Shared types for admin castaway components.
 */

import type { Castaway, Episode } from '@/types';

export interface EditFormData {
  name: string;
  age: string;
  hometown: string;
  occupation: string;
  photo_url: string;
  previous_seasons: string;
  best_placement: string;
  fun_fact: string;
}

export interface CastawayCardProps {
  castaway: Castaway;
  isEliminated?: boolean;
  onEdit: () => void;
  onEliminate?: () => void;
  onReactivate?: () => void;
  isReactivating?: boolean;
}

export interface CastawayGridProps {
  castaways: Castaway[];
  isLoading?: boolean;
  variant: 'active' | 'eliminated';
  onEdit: (castaway: Castaway) => void;
  onEliminate?: (castawayId: string) => void;
  onReactivate?: (castawayId: string) => void;
  isReactivating?: boolean;
}

export interface EliminateModalProps {
  castawayName: string;
  episodes: Episode[];
  selectedEpisodeId: string;
  onEpisodeChange: (episodeId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export interface EditCastawayModalProps {
  formData: EditFormData;
  onFormChange: (data: EditFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export interface BulkActionsProps {
  missingPhotosCount: number;
  onAutoPopulatePhotos: () => void;
  isPending: boolean;
}
