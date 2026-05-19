'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMember, useUpdateMemberStatus } from '@/hooks/use-member';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  CreditCard,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CreateOneOffFeeDialog } from '@/components/dashboard/create-one-off-fee-dialog';
import { RecordPaymentDialog } from '@/components/dashboard/record-payment-dialog';
import { DigitalReceiptDialog } from '@/components/dashboard/digital-receipt-dialog';

export default function MemberDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const tenantId = user?.tenantId || '';
  const memberId = params.id;

  const { data: member, isLoading } = useMember(tenantId, memberId);
  const statusMutation = useUpdateMemberStatus(tenantId, memberId);

  const [paymentFee, setPaymentFee] = React.useState<{ id: string; amount: number } | null>(null);
  const [receiptFee, setReceiptFee] = React.useState<any | null>(null);

  if (isLoading || !member) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: 'active' | 'paused' | 'deactivated') => {
    if (newStatus !== member.status) {
      statusMutation.mutate(newStatus);
    }
  };

  const statusColors = {
    active: 'bg-primary/20 text-primary border-primary/30',
    paused: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    deactivated: 'bg-red-500/20 text-red-500 border-red-500/30',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Member Identity */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="bg-surface-low border-white/5 shadow-2xl rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent"></div>
            <CardContent className="p-8 pt-12 relative z-10">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-24 w-24 rounded-full bg-surface-high border-2 border-primary/50 flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{member.name}</h2>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mt-1">
                    Athlete Profile
                  </p>
                </div>

                <Badge
                  className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusColors[member.status]}`}
                >
                  {member.status}
                </Badge>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 text-sm text-slate-400 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Mail className="h-5 w-5 shrink-0 text-primary" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-4 text-sm text-slate-400 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Phone className="h-5 w-5 shrink-0 text-primary" />
                    <span>{member.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-400 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Calendar className="h-5 w-5 shrink-0 text-primary" />
                  <span>Joined {format(new Date(member.joinedDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                  <span>
                    {member.assignedTrainer
                      ? `Coach: ${member.assignedTrainer.name}`
                      : 'Self-Trained'}
                  </span>
                </div>
              </div>

              {/* Status Manager */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">
                  Lifecycle State
                </label>
                <Select
                  value={member.status}
                  onValueChange={handleStatusChange}
                  disabled={statusMutation.isPending}
                >
                  <SelectTrigger className="h-14 bg-surface-high border-white/10 rounded-xl font-bold text-white focus:ring-primary focus:border-primary transition-all">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10 rounded-xl">
                    <SelectItem value="active" className="font-bold py-3 text-white">
                      ACTIVE (Training)
                    </SelectItem>
                    <SelectItem value="paused" className="font-bold py-3 text-yellow-500">
                      PAUSED (Hold)
                    </SelectItem>
                    <SelectItem value="deactivated" className="font-bold py-3 text-red-500">
                      DEACTIVATED (Churned)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details Tabs */}
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="packages" className="w-full">
            <TabsList className="bg-surface-low border border-white/5 h-16 w-full rounded-2xl p-1 mb-6 flex">
              <TabsTrigger
                value="packages"
                className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-background font-black uppercase italic tracking-tighter text-slate-400 text-lg transition-all"
              >
                <Activity className="h-5 w-5 mr-2 inline-block -mt-1" />
                Programs
              </TabsTrigger>
              <TabsTrigger
                value="fees"
                className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-background font-black uppercase italic tracking-tighter text-slate-400 text-lg transition-all"
              >
                <CreditCard className="h-5 w-5 mr-2 inline-block -mt-1" />
                Ledger
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="packages"
              className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {member.membershipInstances.length === 0 ? (
                <Card className="bg-surface-low border-white/5 rounded-3xl p-12 text-center">
                  <Activity className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white">No Active Programs</h3>
                  <p className="text-slate-400">
                    This athlete is not currently enrolled in any membership packages.
                  </p>
                </Card>
              ) : (
                member.membershipInstances.map((instance) => (
                  <Card
                    key={instance.id}
                    className="bg-surface-low border-white/5 shadow-2xl rounded-3xl overflow-hidden group hover:border-primary/30 transition-all"
                  >
                    <CardHeader className="border-b border-white/5 bg-white/[0.02] p-6 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-black text-white">
                          {instance.package.name}
                        </CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary mt-1">
                          ₹{instance.package.price.toString()} / Cycle
                        </CardDescription>
                      </div>
                      <Badge
                        className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${instance.status === 'active' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'}`}
                      >
                        {instance.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-slate-500" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                              Started
                            </p>
                            <p className="font-bold text-white text-sm">
                              {format(new Date(instance.startDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                              Renews On
                            </p>
                            <p className="font-bold text-white text-sm">
                              {format(new Date(instance.renewalDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent
              value="fees"
              className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                    Billing Log
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">
                    History of fees applied to this athlete.
                  </p>
                </div>
                <CreateOneOffFeeDialog memberId={member.id} memberName={member.name} />
              </div>

              {member.fees.length === 0 ? (
                <Card className="bg-surface-low border-white/5 rounded-3xl p-12 text-center">
                  <CreditCard className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white">Empty Ledger</h3>
                  <p className="text-slate-400">
                    No fees have been generated for this athlete yet.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {member.fees.map((fee) => {
                    const feeName = fee.transactionId?.startsWith('manual_charge:')
                      ? fee.transactionId.replace('manual_charge:', '')
                      : fee.membershipInstance?.package?.name || 'Membership Renewal';

                    return (
                      <Card
                        key={fee.id}
                        className="bg-surface-low border-white/5 shadow-2xl rounded-2xl overflow-hidden group hover:border-primary/30 transition-all"
                      >
                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                fee.status === 'paid'
                                  ? 'bg-primary/20 text-primary'
                                  : fee.status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-500'
                                    : 'bg-red-500/20 text-red-500'
                              }`}
                            >
                              {fee.status === 'paid' ? (
                                <CheckCircle2 className="h-6 w-6" />
                              ) : (
                                <AlertCircle className="h-6 w-6" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-baseline gap-2">
                                <p className="font-black text-white text-lg">
                                  ₹{Number(fee.amount).toFixed(2)}
                                </p>
                                <span className="text-xs text-slate-400 font-bold">
                                  ({feeName})
                                </span>
                              </div>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                Due: {format(new Date(fee.dueDate), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                fee.status === 'paid'
                                  ? 'bg-primary/20 text-primary border-primary/30'
                                  : fee.status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-500 border-red-500/30'
                              }`}
                            >
                              {fee.status}
                            </Badge>
                            {fee.status !== 'paid' ? (
                              <Button
                                onClick={() =>
                                  setPaymentFee({ id: fee.id, amount: Number(fee.amount) })
                                }
                                variant="outline"
                                size="sm"
                                className="h-8 border-primary/20 bg-primary/5 hover:bg-primary hover:text-background text-primary font-black text-[10px] uppercase tracking-wider rounded-lg px-3 transition-all mt-1"
                              >
                                Record Payment
                              </Button>
                            ) : (
                              <>
                                <Button
                                  onClick={() => setReceiptFee(fee)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-slate-400 hover:text-primary font-bold text-xs uppercase tracking-wider rounded-lg px-2 flex items-center gap-1.5 mt-1"
                                >
                                  <Receipt className="h-3.5 w-3.5" /> Receipt
                                </Button>
                                {fee.paidDate && (
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                    Paid {format(new Date(fee.paidDate), 'MMM dd')} via{' '}
                                    {fee.paymentMethod || 'Unknown'}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <RecordPaymentDialog
        isOpen={!!paymentFee}
        onClose={() => setPaymentFee(null)}
        feeId={paymentFee?.id || ''}
        amount={paymentFee?.amount || 0}
        memberId={member.id}
      />

      <DigitalReceiptDialog
        isOpen={!!receiptFee}
        onClose={() => setReceiptFee(null)}
        fee={
          receiptFee ? { ...receiptFee, member: { name: member.name, email: member.email } } : null
        }
      />
    </div>
  );
}
