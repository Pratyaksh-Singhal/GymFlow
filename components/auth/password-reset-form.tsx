'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { completePasswordReset, sendResetPasswordEmail } from '@/lib/auth-client';
import { toast } from 'sonner';

export function PasswordResetForm({
  initialMode = 'request',
}: {
  initialMode?: 'request' | 'reset';
}) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'request' | 'reset'>(initialMode);
  const [loading, setLoading] = useState(false);

  const title = mode === 'request' ? 'Reset your password' : 'Set a new password';
  const description =
    mode === 'request'
      ? 'Enter your email and we will send a reset link to your inbox.'
      : 'Provide the reset token and your new password.';

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await sendResetPasswordEmail({ email });
      toast.success(result.message);
      setMode('reset');
    } catch (err) {
      toast.error((err as Error).message || 'Unable to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await completePasswordReset({ email, token, password });
      toast.success(result.message);
    } catch (err) {
      toast.error((err as Error).message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      {mode === 'request' ? (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Email'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleCompleteReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reset Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Enter token from email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Min. 8 characters"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={() => setMode(mode === 'request' ? 'reset' : 'request')}
          className="text-sm font-medium text-primary hover:underline"
        >
          {mode === 'request' ? 'I already have a reset token' : 'Back to email request'}
        </button>
      </div>
    </div>
  );
}
