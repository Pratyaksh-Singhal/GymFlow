'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, logout, status } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') {
      // User will be redirected by middleware if not authenticated.
    }
  }, [status]);

  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 shadow-lg">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Manage your gym and view tenant data in one place.
            </p>
          </div>

          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-slate-900">
            Welcome back, {user?.email ?? 'Gym owner'}.
          </h2>
          <p className="mt-3 text-slate-700">
            Your tenant ID is{' '}
            <span className="font-medium text-slate-900">{user?.tenantId ?? 'unknown'}</span> and
            your role is <span className="font-medium text-slate-900">{user?.role ?? 'n/a'}</span>.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-semibold">Members</h3>
              <p className="mt-2 text-sm text-slate-600">Add, update, and manage gym members.</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-semibold">Packages</h3>
              <p className="mt-2 text-sm text-slate-600">Create membership packages and pricing.</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-semibold">Fees</h3>
              <p className="mt-2 text-sm text-slate-600">Track payments and overdue invoices.</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-semibold">Notifications</h3>
              <p className="mt-2 text-sm text-slate-600">Send reminders and updates to members.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
