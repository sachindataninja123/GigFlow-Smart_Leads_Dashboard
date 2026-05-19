import { Lead } from '@/types';
import { getStatusBadgeClass, getSourceBadgeClass, formatRelativeTime } from '@/utils';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface LeadRowProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export function LeadRow({ lead, onEdit, onDelete }: LeadRowProps) {
  const { user } = useAuthStore();
  const isOwner = typeof lead.createdBy === 'object'
    ? lead.createdBy._id === user?.id
    : lead.createdBy === user?.id;

  const canEdit = user?.role === 'admin' || isOwner;

  return (
    <tr className="border-b border-[var(--border)] hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.name}</p>
          <p className="text-xs text-[var(--muted)]">{lead.email}</p>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className={getStatusBadgeClass(lead.status)}>{lead.status}</span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className={getSourceBadgeClass(lead.source)}>{lead.source}</span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-[var(--muted)]">
          {typeof lead.createdBy === 'object' ? lead.createdBy.name : '—'}
        </span>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-xs text-[var(--muted)]">{formatRelativeTime(lead.createdAt)}</span>
      </td>
      <td className="px-4 py-3">
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(lead)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600 transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(lead)}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
