import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Lead, LeadFormData } from '@/types';
import { LEAD_STATUSES, LEAD_SOURCES } from '@/utils';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email'),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']),
  source: z.enum(['Website', 'Instagram', 'Referral']),
  notes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

interface LeadModalProps {
  lead?: Lead | null;
  onClose: () => void;
  onSubmit: (data: LeadFormData) => void;
  isLoading?: boolean;
}

export function LeadModal({ lead, onClose, onSubmit, isLoading }: LeadModalProps) {
  const isEdit = !!lead;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      status: 'New',
      source: 'Website',
      notes: '',
    },
  });

  useEffect(() => {
    if (lead) {
      reset({
        name: lead.name,
        email: lead.email,
        status: lead.status,
        source: lead.source,
        notes: lead.notes || '',
      });
    }
  }, [lead, reset]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="card w-full max-w-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit lead' : 'Add new lead'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input {...register('name')} className="input" placeholder="Jane Doe" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="jane@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Source</label>
              <select {...register('source')} className="input">
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Notes <span className="text-gray-400 normal-case">(optional)</span></label>
            <textarea
              {...register('notes')}
              rows={3}
              className="input resize-none"
              placeholder="Add any notes about this lead…"
            />
            {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isEdit ? 'Save changes' : 'Create lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
