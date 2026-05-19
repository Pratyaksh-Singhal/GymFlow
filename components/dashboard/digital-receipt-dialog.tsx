'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Receipt, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';
import { Fee } from '@/hooks/use-fees';

interface DigitalReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fee: Fee | null;
}

export function DigitalReceiptDialog({ isOpen, onClose, fee }: DigitalReceiptDialogProps) {
  if (!fee) return null;

  const feeName = fee.transactionId?.startsWith('manual_charge:')
    ? fee.transactionId.replace('manual_charge:', '')
    : fee.membershipInstance?.package?.name || 'Membership Renewal';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedDate = format(new Date(fee.paidDate || new Date()), 'dd MMM yyyy, hh:mm a');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt_${fee.id.substring(0, 8)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
            body {
              background-color: #ffffff;
              color: #000000;
              font-family: 'Courier Prime', Courier, monospace;
              padding: 30px;
              margin: 0;
            }
            .receipt-box {
              max-width: 450px;
              margin: 0 auto;
              border: 1px solid #000;
              padding: 24px;
            }
            .center {
              text-align: center;
            }
            .brand {
              font-size: 22px;
              font-weight: 700;
              letter-spacing: -1px;
              margin-bottom: 4px;
            }
            .subtitle {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #555;
              margin-bottom: 20px;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 16px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin: 8px 0;
              text-transform: uppercase;
            }
            .label {
              font-weight: 400;
              color: #444;
            }
            .value {
              font-weight: 700;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 18px;
              font-weight: 700;
              margin: 16px 0;
              padding: 10px 0;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
            }
            .footer-msg {
              font-size: 10px;
              margin-top: 24px;
              color: #444;
            }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="center">
              <div class="brand">IRON GYM</div>
              <div class="subtitle">STEALTH ATHLETIC CLUB</div>
              <p style="font-size: 10px; margin: 4px 0;">INVOICE RECORD #REF-${fee.id.substring(0, 8).toUpperCase()}</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="row">
              <span class="label">ATHLETE NAME</span>
              <span class="value">${fee.member?.name || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">EMAIL</span>
              <span class="value" style="text-transform: none;">${fee.member?.email || 'N/A'}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="row">
              <span class="label">PARTICULARS</span>
              <span class="value">${feeName}</span>
            </div>
            <div class="row">
              <span class="label">CLEARANCE DATE</span>
              <span class="value">${formattedDate}</span>
            </div>
            <div class="row">
              <span class="label">PAYMENT METHOD</span>
              <span class="value">${fee.paymentMethod || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">REFERENCE NO.</span>
              <span class="value">${fee.transactionId || 'NONE'}</span>
            </div>
            
            <div class="total-row">
              <span>TOTAL PAID</span>
              <span>INR ${Number(fee.amount).toFixed(2)}</span>
            </div>
            
            <div class="center footer-msg">
              <p style="margin: 0; font-weight: 700;">THANK YOU FOR TRAINING WITH US</p>
              <p style="margin: 4px 0 0 0;">WE NEVER BACK DOWN</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formattedClearance = fee.paidDate
    ? format(new Date(fee.paidDate), 'dd MMM yyyy, hh:mm a')
    : 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface-low border border-white/5 shadow-2xl rounded-[2.5rem] max-w-lg w-[calc(100%-2rem)] text-white p-8">
        <DialogHeader className="space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(204,255,0,0.1)]">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-white">
              Digital <span className="text-primary">Receipt</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium text-xs mt-1">
              Verify receipt particulars or generate a hardcopy document.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Visual Receipt Card in UI */}
        <div className="relative mt-6 overflow-hidden bg-black/40 border border-white/5 rounded-3xl p-6 space-y-6">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Dumbbell className="h-40 w-40 text-primary rotate-45" />
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div>
              <h4 className="text-lg font-black tracking-tight text-white uppercase">IRON GYM</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-0.5">
                Stealth Athletic Club
              </p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                #REF-{fee.id.substring(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-dashed border-white/10 relative z-10">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Athlete
              </p>
              <p className="font-bold text-white mt-1 truncate">{fee.member?.name || 'N/A'}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {fee.member?.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Particulars
              </p>
              <p className="font-bold text-white mt-1">{feeName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-dashed border-white/10 relative z-10">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Payment Date
              </p>
              <p className="font-bold text-white mt-1">{formattedClearance}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Reference / Txn ID
              </p>
              <p className="font-bold text-primary mt-1 truncate">{fee.transactionId || 'NONE'}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-white/10 relative z-10">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Clearance Method
              </p>
              <p className="font-bold text-white uppercase text-xs mt-1">
                {fee.paymentMethod?.replace('_', ' ') || 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Total Paid
              </p>
              <p className="text-2xl font-black text-white mt-0.5">
                ₹{Number(fee.amount).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 flex sm:flex-row flex-col items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full sm:flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/[0.02]"
          >
            Close Dialog
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="w-full sm:flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-background gap-2 shadow-[0_0_20px_rgba(204,255,0,0.25)]"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
