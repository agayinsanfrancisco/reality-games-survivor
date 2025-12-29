/**
 * Finalize Result Modal Component
 */
import { CheckCircle, Flame } from 'lucide-react';

interface FinalizeResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    success: boolean;
    eliminated: string[];
  };
}

export function FinalizeResultModal({ 
  isOpen, 
  onClose, 
  result 
}: FinalizeResultModalProps) {
  if (!isOpen) return null;
  const { success, eliminated } = result;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10" />
          </div>

          <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
            {success ? 'Scoring Finalized!' : 'Finalization Failed'}
          </h3>
          <p className="text-neutral-600 mb-6">
            {success 
              ? 'Episode scores have been locked and all league standings have been updated.'
              : 'There was an error finalizing the scores. Please check the server logs.'}
          </p>

          {success && eliminated.length > 0 && (
            <div className="bg-neutral-50 rounded-2xl p-4 mb-6 text-left border border-cream-200">
              <div className="flex items-center gap-2 mb-3 text-neutral-800 font-bold">
                <Flame className="h-4 w-4 text-orange-500" />
                Torches Snuffed ({eliminated.length})
              </div>
              <div className="grid grid-cols-2 gap-2">
                {eliminated.map(name => (
                  <div key={name} className="text-sm text-neutral-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-4 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-neutral-800 transition-colors shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
