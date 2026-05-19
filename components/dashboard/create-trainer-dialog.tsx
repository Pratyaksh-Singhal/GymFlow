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
import { ShieldCheck, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '@/lib/auth-client';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CreateTrainerDialog() {
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();
  const tenantId = user?.tenantId || '';
  const queryClient = useQueryClient();
  const [tempCredentials, setTempCredentials] = React.useState<{
    email: string;
    password: string;
  } | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Only include password if it is not blank
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password.trim() || undefined,
      };
      return fetchJson<{ success: boolean; data: { trainer: any; tempPassword: string } }>(
        `/api/tenants/${tenantId}/trainers`,
        payload,
        {
          method: 'POST',
        }
      );
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['trainers', tenantId] });
      toast.success('Coach provisioned successfully!');
      setTempCredentials({
        email: formData.email,
        password: formData.password.trim() || response.data.tempPassword,
      });
      // Do not close immediately so they can see the password
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to provision coach');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    mutation.mutate(formData);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', email: '', phone: '', password: '' });
    setTempCredentials(null);
    mutation.reset();
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
        <Button className="gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] bg-primary text-background hover:bg-primary/90 rounded-2xl h-12 px-6 font-black uppercase italic tracking-tighter">
          <ShieldCheck className="h-5 w-5" /> Provision Coach
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-white/5 bg-background p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="bg-primary/10 p-8 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
              Provision <span className="text-primary">Coach</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium mt-2">
              Create a trainer identity and grant them platform access.
            </DialogDescription>
          </DialogHeader>
        </div>

        {tempCredentials ? (
          <div className="p-8 space-y-6">
            <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 text-center space-y-4">
              <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
              <div>
                <h3 className="text-lg font-black text-white">Identity Provisioned</h3>
                <p className="text-sm text-slate-400">
                  Share these secure credentials with the coach.
                </p>
              </div>
              <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-left space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-black uppercase tracking-widest">
                    Key
                  </span>
                  <span className="text-sm font-mono text-white">{tempCredentials.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-black uppercase tracking-widest">
                    String (Password)
                  </span>
                  <span className="text-sm font-mono text-primary font-bold">
                    {tempCredentials.password}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleClose}
              className="w-full h-14 rounded-full bg-surface-high border border-white/10 text-white hover:bg-white hover:text-black transition-all font-black italic"
            >
              ACKNOWLEDGE
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Full Name
                </label>
                <Input
                  placeholder="Jane Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/50 rounded-xl font-bold transition-all text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Network Identity (Email)
                </label>
                <Input
                  type="email"
                  placeholder="jane@gym.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/50 rounded-xl font-bold transition-all text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Comms Channel (Phone)
                </label>
                <Input
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/50 rounded-xl font-bold transition-all text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Login Password (Optional)
                </label>
                <Input
                  type="password"
                  placeholder="At least 6 characters (otherwise auto-generated)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/50 rounded-xl font-bold transition-all text-white"
                />
              </div>
            </div>

            <Alert className="bg-primary/5 border-primary/10 rounded-2xl">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs text-slate-400 font-medium ml-2">
                A highly secure, temporary passphrase will be auto-generated if left empty.
              </AlertDescription>
            </Alert>

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
                disabled={mutation.isPending}
                className="bg-primary text-background hover:bg-primary/90 px-8 rounded-xl font-black uppercase italic tracking-tighter"
              >
                {mutation.isPending ? 'Provisioning...' : 'Provision'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
