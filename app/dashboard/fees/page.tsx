'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFees, useGenerateFees, Fee } from '@/hooks/use-fees';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateOneOffFeeDialog } from '@/components/dashboard/create-one-off-fee-dialog';
import { RecordPaymentDialog } from '@/components/dashboard/record-payment-dialog';
import { DigitalReceiptDialog } from '@/components/dashboard/digital-receipt-dialog';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Search,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  RefreshCw,
  Receipt,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function FeesPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || '';

  const { data: fees, isLoading } = useFees(tenantId);
  const generateMutation = useGenerateFees(tenantId);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [paymentFee, setPaymentFee] = React.useState<{
    id: string;
    amount: number;
    memberId?: string;
  } | null>(null);
  const [receiptFee, setReceiptFee] = React.useState<Fee | null>(null);

  const getChargeName = (fee: Fee) => {
    if (fee.transactionId?.startsWith('manual_charge:')) {
      return fee.transactionId.replace('manual_charge:', '');
    }
    return fee.membershipInstance?.package?.name || 'Membership Renewal';
  };

  // Helper calculations for metrics
  const totalCollected = React.useMemo(() => {
    if (!fees) return 0;
    return fees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + Number(f.amount), 0);
  }, [fees]);

  const totalOutstanding = React.useMemo(() => {
    if (!fees) return 0;
    return fees.filter((f) => f.status === 'pending').reduce((sum, f) => sum + Number(f.amount), 0);
  }, [fees]);

  const totalOverdue = React.useMemo(() => {
    if (!fees) return 0;
    return fees.filter((f) => f.status === 'overdue').reduce((sum, f) => sum + Number(f.amount), 0);
  }, [fees]);

  // Filtered fees list
  const filteredFees = React.useMemo(() => {
    if (!fees) return [];
    return fees.filter((fee) => {
      const athleteName = fee.member?.name?.toLowerCase() || '';
      const athleteEmail = fee.member?.email?.toLowerCase() || '';
      const matchesSearch =
        athleteName.includes(searchTerm.toLowerCase()) ||
        athleteEmail.includes(searchTerm.toLowerCase());

      const matchesStatus = activeTab === 'all' || fee.status === activeTab;

      return matchesSearch && matchesStatus;
    });
  }, [fees, searchTerm, activeTab]);

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
            Financial <span className="text-primary">Ledger</span>
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            Track club billings, record payments, and audit athlete accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            variant="outline"
            className="h-12 border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-white rounded-2xl gap-2 font-bold uppercase tracking-wider text-xs px-5 transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
            {generateMutation.isPending ? 'Scanning...' : 'Billing Renewal Scan'}
          </Button>

          <CreateOneOffFeeDialog />
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-surface-low border-white/5 shadow-2xl rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Revenue Collected
            </CardDescription>
            <CardTitle className="text-3xl font-black text-white mt-1">
              ₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-primary font-bold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Ledger cleared and paid
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-low border-white/5 shadow-2xl rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign className="h-16 w-16 text-cyan-400" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Outstanding Dues
            </CardDescription>
            <CardTitle className="text-3xl font-black text-white mt-1">
              ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-bold">Awaiting payment confirmations</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-low border-white/5 shadow-2xl rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Overdue Collections
            </CardDescription>
            <CardTitle className="text-3xl font-black text-red-500 mt-1">
              ₹{totalOverdue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-500/80 font-bold">Require operator intervention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main filter list */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-surface-low p-4 rounded-[2rem] border border-white/5">
          <TabsList className="bg-black/30 p-1.5 rounded-2xl border border-white/5">
            <TabsTrigger
              value="all"
              className="rounded-xl px-5 font-bold text-xs uppercase tracking-wider"
            >
              All Records
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="rounded-xl px-5 font-bold text-xs uppercase tracking-wider"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="paid"
              className="rounded-xl px-5 font-bold text-xs uppercase tracking-wider"
            >
              Paid
            </TabsTrigger>
            <TabsTrigger
              value="overdue"
              className="rounded-xl px-5 font-bold text-xs uppercase tracking-wider text-red-400 focus:text-red-400"
            >
              Overdue
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search athlete by identity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 h-11 bg-black/30 border-white/5 focus:bg-black/50 focus:border-primary/50 rounded-2xl font-medium transition-all"
            />
          </div>
        </div>

        <TabsContent
          value={activeTab}
          className="bg-surface-low border border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden m-0"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.02] border-b border-white/5">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-500 py-4 pl-6">
                    Athlete Info
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-500">
                    Bill Type
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-500">
                    Due Date
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-500">
                    Amount
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-500">
                    Status
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-500">
                    Paid Date
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-500 text-right pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.map((fee) => (
                  <TableRow
                    key={fee.id}
                    className="border-b border-white/5 hover:bg-white/[0.01] transition-all group"
                  >
                    {/* Athlete Profile */}
                    <TableCell className="py-4 pl-6 whitespace-normal max-w-[200px]">
                      <div className="font-bold text-white group-hover:text-primary transition-colors">
                        <Link href={`/dashboard/members/${fee.memberId}`}>{fee.member?.name}</Link>
                      </div>
                      <div className="text-xs text-slate-500 break-all">{fee.member?.email}</div>
                    </TableCell>

                    {/* Charge Descriptor */}
                    <TableCell className="whitespace-normal max-w-[180px]">
                      <div className="font-semibold text-white text-sm">{getChargeName(fee)}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        {fee.transactionId?.startsWith('manual_charge:')
                          ? 'Custom Invoice'
                          : 'Cycle Renewal'}
                      </div>
                    </TableCell>

                    {/* Due Date */}
                    <TableCell className="text-slate-300 font-medium">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        {format(new Date(fee.dueDate), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="font-black text-white text-sm">
                      ₹{Number(fee.amount).toFixed(2)}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Badge
                        className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider border transition-all ${
                          fee.status === 'paid'
                            ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 shadow-[0_0_15px_rgba(204,255,0,0.1)]'
                            : fee.status === 'overdue'
                              ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20'
                        }`}
                      >
                        {fee.status}
                      </Badge>
                    </TableCell>

                    {/* Paid Date / Method */}
                    <TableCell className="text-xs text-slate-400 font-medium whitespace-normal max-w-[120px]">
                      {fee.paidDate ? (
                        <div>
                          <div>{format(new Date(fee.paidDate), 'MMM dd, yyyy')}</div>
                          <div className="text-[9px] uppercase font-bold tracking-widest text-slate-600 mt-0.5">
                            via {fee.paymentMethod || 'Other'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-bold uppercase tracking-wider text-[9px]">
                          —
                        </span>
                      )}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end items-center gap-2">
                        {fee.status !== 'paid' ? (
                          <Button
                            onClick={() =>
                              setPaymentFee({
                                id: fee.id,
                                amount: Number(fee.amount),
                                memberId: fee.memberId,
                              })
                            }
                            variant="outline"
                            size="sm"
                            className="h-8 border-primary/20 bg-primary/5 hover:bg-primary hover:text-background text-primary font-black text-[10px] uppercase tracking-wider rounded-lg px-3 transition-all"
                          >
                            Record Payment
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => setReceiptFee(fee)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg"
                              title="View digital receipt"
                            >
                              <Receipt className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="h-8 w-8 text-slate-500 hover:text-white rounded-lg"
                              title="View member identity"
                            >
                              <Link href={`/dashboard/members/${fee.memberId}`}>
                                <ArrowUpRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredFees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20 text-slate-500 font-bold">
                      No invoices found matching criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <RecordPaymentDialog
        isOpen={!!paymentFee}
        onClose={() => setPaymentFee(null)}
        feeId={paymentFee?.id || ''}
        amount={paymentFee?.amount || 0}
        memberId={paymentFee?.memberId}
      />

      <DigitalReceiptDialog
        isOpen={!!receiptFee}
        onClose={() => setReceiptFee(null)}
        fee={receiptFee}
      />
    </div>
  );
}
