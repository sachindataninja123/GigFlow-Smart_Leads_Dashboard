import { useLeadStats } from '@/hooks/useLeads';
import { useAuthStore } from '@/store/authStore';
import { Users, TrendingUp, Target, XCircle, Globe, Instagram, UserCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
}

function StatCard({ label, value, icon: Icon, color, iconBg }: StatCardProps) {
  return (
    <div className="card p-4 md:p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useLeadStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  const s = stats ?? { total: 0, byStatus: {}, bySource: {} };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="md:text-xl text-lg font-semibold text-gray-900 dark:text-white">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Here's your leads overview</p>
        </div>
        <Link to="/leads" className="btn-primary">
          View all leads
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total leads" value={s.total} icon={Users} color="text-brand-600" iconBg="bg-brand-50 dark:bg-brand-950/50" />
        <StatCard label="Qualified" value={s.byStatus.Qualified ?? 0} icon={Target} color="text-green-600" iconBg="bg-green-50 dark:bg-green-950/40" />
        <StatCard label="Contacted" value={s.byStatus.Contacted ?? 0} icon={TrendingUp} color="text-yellow-600" iconBg="bg-yellow-50 dark:bg-yellow-950/40" />
        <StatCard label="Lost" value={s.byStatus.Lost ?? 0} icon={XCircle} color="text-red-500" iconBg="bg-red-50 dark:bg-red-950/40" />
      </div>

      {/* Two column: Status + Source breakdown */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Status breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Leads by status</h3>
          <div className="space-y-3">
            {[
              { key: 'New', label: 'New', color: 'bg-blue-500' },
              { key: 'Contacted', label: 'Contacted', color: 'bg-yellow-500' },
              { key: 'Qualified', label: 'Qualified', color: 'bg-green-500' },
              { key: 'Lost', label: 'Lost', color: 'bg-red-500' },
            ].map(({ key, label, color }) => {
              const count = s.byStatus[key as keyof typeof s.byStatus] ?? 0;
              const pct = s.total > 0 ? Math.round((count / s.total) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{count} <span className="text-[var(--muted)]">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Leads by source</h3>
          <div className="space-y-3">
            {[
              { key: 'Website', label: 'Website', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
              { key: 'Instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/40' },
              { key: 'Referral', label: 'Referral', icon: UserCheck, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40' },
            ].map(({ key, label, icon: Icon, color, bg }) => {
              const count = s.bySource[key as keyof typeof s.bySource] ?? 0;
              const pct = s.total > 0 ? Math.round((count / s.total) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{label}</span>
                      <span className="font-medium">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-brand-500 rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/leads?modal=create" className="btn-primary text-xs">+ Add new lead</Link>
          <Link to="/leads?status=New" className="btn-secondary text-xs">View new leads</Link>
          <Link to="/leads?status=Qualified" className="btn-secondary text-xs">View qualified</Link>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
