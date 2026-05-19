'use client';

import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/use-members';
import { MemberTable, Member } from '@/components/dashboard/member-table';
import { CreateMemberDialog } from '@/components/dashboard/create-member-dialog';
import { Users, UserCheck, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MembersPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const { data: members, isLoading } = useMembers(tenantId || '');

  const stats = {
    total: members?.length || 0,
    active: members?.filter((m: Member) => m.status === 'active').length || 0,
    paused: members?.filter((m: Member) => m.status === 'paused').length || 0,
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Member Directory</h1>
          <p className="text-slate-500 mt-1">
            Manage your gym members, track status, and view profiles.
          </p>
        </div>
        <CreateMemberDialog />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Members"
          value={stats.total}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          description="Registered in system"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Now"
          value={stats.active}
          icon={<UserCheck className="h-5 w-5 text-emerald-600" />}
          description="Current memberships"
          isLoading={isLoading}
          color="emerald"
        />
        <StatCard
          title="Paused"
          value={stats.paused}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          description="On temporary break"
          isLoading={isLoading}
          color="amber"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-1">
        <MemberTable data={members || []} isLoading={isLoading} />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
  isLoading,
  color = 'blue',
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  isLoading?: boolean;
  color?: 'blue' | 'emerald' | 'amber';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-4 font-medium uppercase tracking-wider">
        {description}
      </p>
    </div>
  );
}
