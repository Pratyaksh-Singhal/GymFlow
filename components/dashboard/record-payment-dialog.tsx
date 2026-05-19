'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMarkFeeAsPaid } from '@/hooks/use-fees';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feeId: string;
  amount: number;
  memberId?: string;
}

export function RecordPaymentDialog({
  isOpen,
  onClose,
  feeId,
  amount,
  memberId,
}: RecordPaymentDialogProps) {
  const { user } = useAuth();
  const tenantId = user?.tenantId || '';
  const markAsPaid = useMarkFeeAsPaid(tenantId, memberId);

  const [paymentMethod, setPaymentMethod] = React.useState<
    'cash' | 'upi' | 'bank_transfer' | 'other'
  >('cash');
  const [paymentDate, setPaymentDate] = React.useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [referenceId, setReferenceId] = React.useState<string>('');

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setPaymentMethod('cash');
      setPaymentDate(new Date().toISOString().substring(0, 10));
      setReferenceId('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeId) return;

    markAsPaid.mutate(
      {
        feeId,
        status: 'paid',
        payment_method: paymentMethod,
        transaction_id: referenceId.trim() || undefined,
        paid_date: new Date(paymentDate).toISOString(),
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface-low border border-white/5 shadow-2xl rounded-[2.5rem] max-w-md w-[calc(100%-2rem)] text-white p-8">
        <DialogHeader className="space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(204,255,0,0.1)]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-white">
              Record <span className="text-primary">Payment</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium text-xs mt-1">
              Mark invoices as completed by capturing payment parameters.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Total Dues
            </span>
            <span className="text-2xl font-black text-white">₹{amount.toFixed(2)}</span>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Payment Method
            </Label>
            <Select
              value={paymentMethod}
              onValueChange={(val: 'cash' | 'upi' | 'bank_transfer' | 'other') =>
                setPaymentMethod(val)
              }
            >
              <SelectTrigger className="h-12 bg-black/30 border-white/5 rounded-xl text-white font-bold text-xs focus:ring-primary/50 focus:border-primary/50 transition-all">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent className="bg-surface-medium border-white/10 rounded-xl text-white">
                <SelectItem value="cash" className="font-bold py-2.5 cursor-pointer text-xs">
                  CASH PAYMENT
                </SelectItem>
                <SelectItem value="upi" className="font-bold py-2.5 cursor-pointer text-xs">
                  UPI / QR SCANNER
                </SelectItem>
                <SelectItem
                  value="bank_transfer"
                  className="font-bold py-2.5 cursor-pointer text-xs"
                >
                  BANK WIRE / TRANSFER
                </SelectItem>
                <SelectItem value="other" className="font-bold py-2.5 cursor-pointer text-xs">
                  OTHER METHOD
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Clearance Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="pl-11 h-12 bg-black/30 border-white/5 focus:border-primary/50 rounded-xl font-bold text-xs transition-all text-white scheme-dark"
              />
            </div>
          </div>

          {/* Reference ID */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Reference / Transaction ID (Optional)
            </Label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="e.g. UPI-928492040, Bank Txn Ref"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                className="pl-11 h-12 bg-black/30 border-white/5 focus:border-primary/50 rounded-xl font-bold text-xs transition-all text-white"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/[0.02]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={markAsPaid.isPending}
              className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-background shadow-[0_0_20px_rgba(204,255,0,0.25)]"
            >
              {markAsPaid.isPending ? 'Saving...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
