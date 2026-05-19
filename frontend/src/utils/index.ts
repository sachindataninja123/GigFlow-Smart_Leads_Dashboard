import { LeadStatus, LeadSource } from '@/types';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getStatusBadgeClass(status: LeadStatus): string {
  const map: Record<LeadStatus, string> = {
    New: 'badge-new',
    Contacted: 'badge-contacted',
    Qualified: 'badge-qualified',
    Lost: 'badge-lost',
  };
  return map[status];
}

export function getSourceBadgeClass(source: LeadSource): string {
  const map: Record<LeadSource, string> = {
    Website: 'badge-website',
    Instagram: 'badge-instagram',
    Referral: 'badge-referral',
  };
  return map[source];
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
export const LEAD_SOURCES: LeadSource[] = ['Website', 'Instagram', 'Referral'];
