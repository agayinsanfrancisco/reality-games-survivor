/**
 * Danger Zone Component
 *
 * Delete league section with confirmation modal.
 */

import { useState } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

interface DangerZoneProps {
  onDelete: () => void;
  isPending: boolean;
}

export function DangerZone({ onDelete, isPending }: DangerZoneProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleConfirmDelete = () => {
    if (confirmText.toLowerCase() === 'delete') {
      onDelete();
      setShowConfirmModal(false);
      setConfirmText('');
    }
  };

  return (
    <>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-red-600 font-medium mb-2 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Danger Zone
        </h3>
        <p className="text-red-500 text-sm mb-4">
          Deleting the league cannot be undone. All members will be removed.
        </p>
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={isPending}
          className="w-full bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 font-bold py-3 rounded-xl transition-colors"
        >
          {isPending ? 'Deleting...' : 'Delete League'}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-red-200 shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-red-600 font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete League
              </h3>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmText('');
                }}
                className="text-neutral-400 hover:text-neutral-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-neutral-600 text-sm mb-4">
              This action cannot be undone. All league data, members, and history will be
              permanently deleted.
            </p>

            <label className="block mb-4">
              <span className="text-neutral-700 text-sm font-medium">
                Type "delete" to confirm:
              </span>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete"
                className="input mt-2"
                autoComplete="off"
              />
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmText('');
                }}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={confirmText.toLowerCase() !== 'delete' || isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-200 text-white disabled:text-red-400 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
