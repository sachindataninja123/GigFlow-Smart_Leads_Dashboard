import { Users } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title = 'No leads found', description = 'Try adjusting your filters or add a new lead.', action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
        <Users className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-[var(--muted)] max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}
