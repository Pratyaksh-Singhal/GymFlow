'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTrainers, Trainer, useDeleteTrainer } from '@/hooks/use-trainers';
import { CreateTrainerDialog } from '@/components/dashboard/create-trainer-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Mail, Phone, Users, ShieldAlert, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function TrainersPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || '';
  const { data: trainers, isLoading } = useTrainers(tenantId);
  const deleteTrainerMutation = useDeleteTrainer(tenantId);

  // Check if current user is owner (or super admin)
  const isOwner = user?.role === 'owner' || user?.role === 'super_admin';

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
            Coach <span className="text-primary">Network</span>
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            Manage your coaching staff and their active assignments.
          </p>
        </div>
        {isOwner && (
          <div className="flex items-center gap-3">
            <CreateTrainerDialog />
          </div>
        )}
      </div>

      {!isOwner && (
        <Card className="bg-surface-low border-white/5 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 flex items-center gap-4">
            <ShieldAlert className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="font-bold text-white">Restricted Access</p>
              <p className="text-sm text-slate-400">Only Gym Owners can provision new coaches.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid of trainers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers?.map((trainer: Trainer) => (
          <Card
            key={trainer.id}
            className="bg-surface-low border-white/5 hover:border-primary/30 transition-colors shadow-2xl rounded-3xl overflow-hidden group"
          >
            <CardHeader className="border-b border-white/5 bg-white/[0.02] p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black text-white">{trainer.name}</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary">
                    Operator Identity
                  </CardDescription>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{trainer.email}</span>
                </div>
                {trainer.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>{trainer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <Users className="h-4 w-4 shrink-0 text-slate-500" />
                  <span>
                    <strong className="text-white">{trainer._count?.assignedMembers || 0}</strong>{' '}
                    Active Athletes
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-600">
                  Provisioned{' '}
                  {trainer.createdAt
                    ? format(new Date(trainer.createdAt), 'MMM dd, yyyy')
                    : 'Unknown'}
                </p>
                {isOwner && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Are you absolutely sure you want to delete Coach ${trainer.name}? This will unassign any active athletes.`
                        )
                      ) {
                        deleteTrainerMutation.mutate(trainer.id);
                      }
                    }}
                    disabled={deleteTrainerMutation.isPending}
                    className="p-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-50"
                    title="Delete Coach"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {trainers?.length === 0 && (
          <div className="col-span-full py-20 text-center bg-surface-low rounded-3xl border border-white/5">
            <ShieldCheck className="h-12 w-12 text-slate-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-black text-white mb-2">No Coaches Provisioned</h3>
            <p className="text-slate-400 font-medium">
              Provision your first coach to start delegating athletes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
