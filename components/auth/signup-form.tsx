'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SignupForm() {
  const { signup, status } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const nextStep = () => {
    if (step === 1 && !gymName) {
      toast.error('Please enter your gym name');
      return;
    }
    if (step === 2 && !ownerName) {
      toast.error('Please enter your name');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await signup({
        gym_name: gymName,
        owner_name: ownerName,
        email,
        password,
      });
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error((error as Error).message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 mx-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-slate-200'}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gym Name</label>
            <input
              type="text"
              placeholder="e.g. Iron Paradise"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <Button onClick={nextStep} className="w-full">
            Next
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Owner Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1">
              Back
            </Button>
            <Button onClick={nextStep} className="flex-1">
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="owner@gym.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1" disabled={loading}>
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || status === 'loading'}>
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
