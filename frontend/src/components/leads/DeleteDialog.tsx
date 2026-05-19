import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteDialogProps {
  leadName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteDialog({ leadName, onConfirm, onCancel, isLoading }: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-sm animate-slide-up p-6 text-center">
        <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Delete lead?</h3>
        <p className="text-sm text-[var(--muted)] mb-6">
          Are you sure you want to delete <strong className="text-gray-700 dark:text-gray-300">{leadName}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="btn-danger flex-1 justify-center">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
