import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Download, SlidersHorizontal, Loader2, X } from 'lucide-react';
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from '@/hooks/useLeads';
import { useDebounce } from '@/hooks/useDebounce';
import { Lead, LeadFilters, LeadFormData, LeadStatus, LeadSource } from '@/types';
import { leadService } from '@/services/leadService';
import { LeadModal } from '@/components/leads/LeadModal';
import { DeleteDialog } from '@/components/leads/DeleteDialog';
import { LeadRow } from '@/components/leads/LeadRow';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { LEAD_STATUSES, LEAD_SOURCES, cn } from '@/utils';
import { useAuthStore } from '@/store/authStore';

export function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();

  // Filters state
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState<LeadStatus | ''>(
    (searchParams.get('status') as LeadStatus) || ''
  );
  const [source, setSource] = useState<LeadSource | ''>(
    (searchParams.get('source') as LeadSource) || ''
  );
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest');
  const [page, setPage] = useState(1);

  // Modals
  const [showCreate, setShowCreate] = useState(searchParams.get('modal') === 'create');
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  const filters: LeadFilters = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    source: source || undefined,
    sort,
    page,
    limit: 10,
  };

  const { data, isLoading, isFetching } = useLeads(filters);
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, status, source, sort]);

  const handleCreate = async (formData: LeadFormData) => {
    await createMutation.mutateAsync(formData);
    setShowCreate(false);
  };

  const handleUpdate = async (formData: LeadFormData) => {
    if (!editLead) return;
    await updateMutation.mutateAsync({ id: editLead._id, data: formData });
    setEditLead(null);
  };

  const handleDelete = async () => {
    if (!deleteLead) return;
    await deleteMutation.mutateAsync(deleteLead._id);
    setDeleteLead(null);
  };

  const handleExport = () => {
    leadService.exportCSV({ status: status || undefined, source: source || undefined, search: debouncedSearch || undefined });
  };

  const hasFilters = !!status || !!source || !!debouncedSearch;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Leads</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {data?.pagination.total ?? 0} total leads
            {isFetching && !isLoading && <span className="ml-2 inline-flex"><Loader2 className="w-3 h-3 animate-spin" /></span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn-secondary hidden sm:inline-flex">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add lead
          </button>
        </div>
      </div>

      {/* Search & filters */}
      <div className="card p-3 space-y-3">
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input pl-9 pr-4"
              placeholder="Search by name or email…"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn('btn-secondary', hasFilters && 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800')}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
          </button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--border)] animate-slide-up">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus | '')}
              className="input flex-1 min-w-[120px]"
            >
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource | '')}
              className="input flex-1 min-w-[120px]"
            >
              <option value="">All sources</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'latest' | 'oldest')}
              className="input flex-1 min-w-[120px]"
            >
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
            </select>

            {hasFilters && (
              <button
                onClick={() => { setStatus(''); setSource(''); setSearchInput(''); }}
                className="btn-secondary text-xs"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : !data?.items.length ? (
          <EmptyState
            title={hasFilters ? 'No leads match your filters' : 'No leads yet'}
            description={hasFilters ? 'Try adjusting your search or filters.' : 'Add your first lead to get started.'}
            action={
              !hasFilters ? (
                <button onClick={() => setShowCreate(true)} className="btn-primary">
                  <Plus className="w-4 h-4" /> Add first lead
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-gray-50/50 dark:bg-gray-800/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wide hidden sm:table-cell">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wide hidden md:table-cell">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wide hidden lg:table-cell">Created by</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wide hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 w-20" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((lead) => (
                    <LeadRow
                      key={lead._id}
                      lead={lead}
                      onEdit={setEditLead}
                      onDelete={setDeleteLead}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {data.pagination.totalPages > 1 && (
              <Pagination meta={data.pagination} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <LeadModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
        />
      )}

      {editLead && (
        <LeadModal
          lead={editLead}
          onClose={() => setEditLead(null)}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
        />
      )}

      {deleteLead && (
        <DeleteDialog
          leadName={deleteLead.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteLead(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
