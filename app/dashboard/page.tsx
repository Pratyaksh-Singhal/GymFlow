'use client';

import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/use-members';
import {
  Users,
  UserCheck,
  CreditCard,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const data = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 700 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: members, isLoading } = useMembers(user?.tenantId || '');

  const stats = {
    total: members?.length || 0,
    active: members?.filter((m) => m.status === 'active').length || 0,
    overdue: 12, // Stubbed for now
    revenue: '$12,450', // Stubbed for now
  };

  const pieData = [
    { name: 'Active', value: stats.active, color: 'hsl(72, 100%, 50%)' },
    { name: 'Paused', value: stats.total - stats.active, color: '#27272a' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Overview</h1>
        <p className="text-slate-500 font-medium">
          Welcome back, {user?.email?.split('@')[0]}. Here&apos;s your gym&apos;s performance today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/members" className="block group">
          <StatCard
            title="Total Members"
            value={stats.total}
            icon={<Users className="h-5 w-5" />}
            trend="+12% from last month"
            isLoading={isLoading}
            color="primary"
          />
        </Link>
        <Link href="/dashboard/members?status=active" className="block group">
          <StatCard
            title="Active Now"
            value={stats.active}
            icon={<UserCheck className="h-5 w-5" />}
            trend="+5% vs last week"
            isLoading={isLoading}
          />
        </Link>
        <Link href="/dashboard/fees?status=overdue" className="block group">
          <StatCard
            title="Overdue Fees"
            value={stats.overdue}
            icon={<AlertCircle className="h-5 w-5 text-rose-500" />}
            trend="Needs attention"
            isLoading={isLoading}
            isAlert
          />
        </Link>
        <div className="group">
          <StatCard
            title="Monthly Revenue"
            value={stats.revenue}
            icon={<CreditCard className="h-5 w-5 text-emerald-500" />}
            trend="+8.2% growth"
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-white/5 rounded-[2rem] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Visit Activity</h3>
              <p className="text-sm text-slate-500 font-medium">Daily member check-ins</p>
            </div>
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1 border-primary/20 bg-primary/10 text-primary"
            >
              <TrendingUp className="h-3 w-3 mr-2" /> Live
            </Badge>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(72, 100%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(72, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    fontWeight: 'bold',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(72, 100%, 50%)"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Member Status</h3>
            <p className="text-sm text-slate-500 font-medium">Current distribution</p>
          </div>
          <div className="h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black">{stats.active}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Active
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm font-bold">Active</span>
              </div>
              <span className="text-sm font-black">
                {Math.round((stats.active / stats.total) * 100) || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-slate-800" />
                <span className="text-sm font-bold text-slate-500">Other</span>
              </div>
              <span className="text-sm font-black text-slate-500">
                {100 - (Math.round((stats.active / stats.total) * 100) || 0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-white/5 rounded-[2rem] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Recent Members</h3>
            <p className="text-sm text-slate-500 font-medium">Last 5 registrations</p>
          </div>
          <Link href="/dashboard/members">
            <Button
              variant="ghost"
              className="text-primary hover:bg-primary/10 rounded-xl font-bold"
            >
              View All <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {isLoading
            ? Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0"
                  >
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))
            : members?.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0 group transition-all"
                >
                  <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg group-hover:bg-primary group-hover:text-background transition-colors">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold tracking-tight">{member.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{member.email}</p>
                  </div>
                  <div className="text-right hidden sm:block mr-8">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                      Joined
                    </p>
                    <p className="text-sm font-bold">
                      {format(new Date(member.joinedDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'rounded-full px-4 py-1 font-bold',
                      member.status === 'active'
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-slate-800 text-slate-400 border-white/5'
                    )}
                  >
                    {member.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  isLoading,
  color = 'default',
  isAlert = false,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  isLoading?: boolean;
  color?: 'default' | 'primary';
  isAlert?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-card border border-white/5 p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]',
        color === 'primary' && 'bg-gradient-to-br from-primary/10 to-transparent border-primary/10'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn(
            'p-3 rounded-2xl',
            color === 'primary' ? 'bg-primary text-background' : 'bg-white/5 text-primary'
          )}
        >
          {icon}
        </div>
        <ArrowUpRight
          className={cn(
            'h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1',
            isAlert ? 'text-rose-500' : 'text-slate-600'
          )}
        />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        {isLoading ? (
          <Skeleton className="h-10 w-24 mt-2" />
        ) : (
          <h2 className="text-4xl font-black tracking-tighter mt-1">{value}</h2>
        )}
      </div>
      <p className={cn('text-xs mt-4 font-bold', isAlert ? 'text-rose-500' : 'text-emerald-500')}>
        {trend}
      </p>

      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-primary rotate-12 group-hover:rotate-0 transition-transform duration-700">
        <Activity className="h-32 w-32" />
      </div>
    </div>
  );
}
