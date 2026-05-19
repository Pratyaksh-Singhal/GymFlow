'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { useMembers } from '@/hooks/use-members';
import { useCreateOneOffFee } from '@/hooks/use-fees';
import { usePackages, Package } from '@/hooks/use-packages';

interface CreateOneOffFeeDialogProps {
  memberId?: string;
  memberName?: string;
  triggerElement?: React.ReactNode;
}

export function CreateOneOffFeeDialog({
  memberId,
  memberName,
  triggerElement,
}: CreateOneOffFeeDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();
  const tenantId = user?.tenantId || '';

  // Fetch all members if no specific memberId is passed in
  const { data: members, isLoading: isLoadingMembers } = useMembers(tenantId, { status: 'active' });
  const { data: packages } = usePackages(tenantId);
  const createFeeMutation = useCreateOneOffFee(tenantId);

  // Set default due date to 7 days from now
  const getDefaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = React.useState({
    selectedMemberId: memberId || '',
    amount: '',
    dueDate: getDefaultDueDate(),
    category: 'Custom',
    customDescription: '',
  });

  // Re-sync memberId if it changes
  React.useEffect(() => {
    if (memberId) {
      setFormData((prev) => ({ ...prev, selectedMemberId: memberId }));
    }
  }, [memberId]);

  const handlePackageChange = (val: string) => {
    if (val === 'Custom') {
      setFormData((prev) => ({
        ...prev,
        category: 'Custom',
        amount: '',
      }));
    } else {
      const selectedPkg = packages?.find((p) => p.id === val);
      setFormData((prev) => ({
        ...prev,
        category: val,
        amount: selectedPkg ? selectedPkg.price.toString() : '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.selectedMemberId) return;

    let finalDescription = '';
    if (formData.category === 'Custom') {
      finalDescription = formData.customDescription.trim() || 'Custom Charge';
    } else {
      const selectedPkg = packages?.find((p) => p.id === formData.category);
      finalDescription = selectedPkg ? `${selectedPkg.name} Package` : 'Package Charge';
    }

    createFeeMutation.mutate(
      {
        memberId: formData.selectedMemberId,
        amount: parseFloat(formData.amount),
        dueDate: new Date(formData.dueDate).toISOString(),
        description: finalDescription,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      selectedMemberId: memberId || '',
      amount: '',
      dueDate: getDefaultDueDate(),
      category: 'Custom',
      customDescription: '',
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        {triggerElement || (
          <Button className="gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] bg-primary text-background hover:bg-primary/90 rounded-2xl h-12 px-6 font-black uppercase italic tracking-tighter">
            <PlusCircle className="h-5 w-5" /> Add Charge
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-white/5 bg-background p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="bg-primary/10 p-8 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
              Record <span className="text-primary">Custom Charge</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium mt-2">
              Apply a one-off fee or custom charge to an athlete&apos;s ledger.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Target Athlete Field */}
            {!memberId ? (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Target Athlete
                </label>
                <Select
                  value={formData.selectedMemberId}
                  onValueChange={(val) => setFormData({ ...formData, selectedMemberId: val })}
                  required
                >
                  <SelectTrigger className="h-12 bg-white/5 border-white/5 focus:bg-white/10 rounded-xl font-bold transition-all text-white">
                    <SelectValue
                      placeholder={isLoadingMembers ? 'Loading athletes...' : 'Select athlete'}
                    />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-surface-medium border-white/5 rounded-xl text-white"
                    position="popper"
                  >
                    {members?.map((m) => (
                      <SelectItem
                        key={m.id}
                        value={m.id}
                        className="text-white hover:bg-primary/10 focus:bg-primary/10 rounded-lg cursor-pointer"
                      >
                        {m.name} ({m.email})
                      </SelectItem>
                    ))}
                    {members?.length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No active members found.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Target Athlete
                </label>
                <Input
                  disabled
                  value={memberName || 'Selected Athlete'}
                  className="h-12 bg-white/[0.02] border-white/5 text-slate-400 font-bold rounded-xl"
                />
              </div>
            )}

            {/* Charge Preset / Package Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Charge Type (Package / Custom)
              </label>
              <Select value={formData.category} onValueChange={handlePackageChange} required>
                <SelectTrigger className="h-12 bg-white/5 border-white/5 focus:bg-white/10 rounded-xl font-bold transition-all text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent
                  className="bg-surface-medium border-white/5 rounded-xl text-white"
                  position="popper"
                >
                  <SelectItem
                    value="Custom"
                    className="text-white hover:bg-primary/10 focus:bg-primary/10 rounded-lg cursor-pointer font-bold"
                  >
                    Custom Charge
                  </SelectItem>
                  {packages?.map((pkg: Package) => (
                    <SelectItem
                      key={pkg.id}
                      value={pkg.id}
                      className="text-white hover:bg-primary/10 focus:bg-primary/10 rounded-lg cursor-pointer"
                    >
                      {pkg.name} — ₹{pkg.price.toString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Description */}
            {formData.category === 'Custom' && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Custom Description
                </label>
                <Input
                  placeholder="e.g. Lost tag fee, lockers rental"
                  value={formData.customDescription}
                  onChange={(e) => setFormData({ ...formData, customDescription: e.target.value })}
                  required
                  className="h-12 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/50 rounded-xl font-bold transition-all text-white"
                />
              </div>
            )}

            {/* Grid for Amount & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    ₹
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="h-12 pl-8 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/50 rounded-xl font-bold transition-all text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  className="h-12 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/50 rounded-xl font-bold transition-all text-white"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="rounded-xl font-bold text-slate-500 hover:text-white"
            >
              Abort
            </Button>
            <Button
              type="submit"
              disabled={createFeeMutation.isPending}
              className="bg-primary text-background hover:bg-primary/90 px-8 rounded-xl font-black uppercase italic tracking-tighter"
            >
              {createFeeMutation.isPending ? 'Adding...' : 'Apply Charge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
