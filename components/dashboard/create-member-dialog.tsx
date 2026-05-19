'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePackages, Package } from '@/hooks/use-packages';
import { useTrainers, Trainer } from '@/hooks/use-trainers';
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
import { UserPlus, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '@/lib/auth-client';

export function CreateMemberDialog() {
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();
  const tenantId = user?.tenantId || '';
  const queryClient = useQueryClient();

  const { data: packages } = usePackages(tenantId);
  const { data: trainers } = useTrainers(tenantId);

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    package_id: '',
    assigned_trainer_id: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return fetchJson(`/api/tenants/${tenantId}/members`, data, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', tenantId] });
      toast.success('New Athlete Registered!');
      setOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        package_id: '',
        assigned_trainer_id: '',
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to register member');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.package_id) {
      toast.error('Please select a membership package');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] bg-primary text-background hover:bg-primary/90 rounded-2xl h-12 px-6 font-black uppercase italic tracking-tighter">
          <UserPlus className="h-5 w-5" /> Register Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] border-white/5 bg-background p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="bg-primary/10 p-8 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
              Athlete <span className="text-primary">Registration</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium mt-2">
              Create a new member profile and assign their training program.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Full Name
              </label>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-12 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/50 rounded-xl font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/50 rounded-xl font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Phone Number
              </label>
              <Input
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="h-12 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/50 rounded-xl font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Date of Birth
              </label>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="h-12 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/50 rounded-xl font-bold transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Membership Package
              </label>
              <Select
                value={formData.package_id}
                onValueChange={(value) => setFormData({ ...formData, package_id: value })}
              >
                <SelectTrigger className="h-12 bg-white/5 border-white/5 rounded-xl font-bold text-slate-200">
                  <SelectValue placeholder="Select Program" />
                </SelectTrigger>
                <SelectContent
                  className="bg-surface-medium border-white/10 rounded-xl text-white"
                  position="popper"
                >
                  {packages?.map((pkg: Package) => (
                    <SelectItem
                      key={pkg.id}
                      value={pkg.id}
                      className="font-bold py-3 text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                    >
                      {pkg.name} — ₹{pkg.price.toString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Assigned Trainer
              </label>
              <Select
                value={formData.assigned_trainer_id}
                onValueChange={(value) => setFormData({ ...formData, assigned_trainer_id: value })}
              >
                <SelectTrigger className="h-12 bg-white/5 border-white/5 rounded-xl font-bold text-slate-200">
                  <SelectValue placeholder="Choose Coach" />
                </SelectTrigger>
                <SelectContent
                  className="bg-surface-medium border-white/10 rounded-xl text-white"
                  position="popper"
                >
                  <SelectItem
                    value="unassigned"
                    className="font-bold py-3 text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                  >
                    No Coach (Self-Trained)
                  </SelectItem>
                  {trainers?.map((trainer: Trainer) => (
                    <SelectItem
                      key={trainer.id}
                      value={trainer.id}
                      className="font-bold py-3 text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                    >
                      {trainer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Upon registration, the member will receive an automated welcome email with their
              temporary credentials and onboarding instructions.
            </p>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-xl font-bold text-slate-500 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-primary text-background hover:bg-primary/90 px-10 rounded-xl font-black uppercase italic tracking-tighter"
            >
              {mutation.isPending ? 'Registering...' : 'Confirm Registration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
