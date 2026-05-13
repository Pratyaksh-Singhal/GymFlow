'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { completePasswordReset, sendResetPasswordEmail } from '@/lib/auth-client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (mode === 'request' ? 'Reset your password' : 'Set a new password'),
    [mode]
  );
  const description = useMemo(
    () =>
      mode === 'request'
        ? 'Enter your email and we will send a reset link to your inbox.'
        : 'Provide the reset token and your new password.',
    [mode]
  );

  const handleRequestReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await sendResetPasswordEmail({ email });
      setMessage(result.message);
    } catch (err) {
      setError((err as Error).message || 'Unable to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await completePasswordReset({ email, token, password });
      setMessage(result.message);
    } catch (err) {
      setError((err as Error).message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        {mode === 'request' ? (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="you@example.com"
                required
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset email'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleCompleteReset} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Reset token</label>
              <input
                type="text"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Enter token from email"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="New secure password"
                required
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset password'}
            </Button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <button
            type="button"
            onClick={() => setMode(mode === 'request' ? 'reset' : 'request')}
            className="font-medium text-primary hover:underline"
          >
            {mode === 'request' ? 'I already have a reset token' : 'Send reset instructions'}
          </button>
          <Link href="/login" className="text-slate-900 hover:text-primary">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
