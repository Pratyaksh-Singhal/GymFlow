'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({
        email,
        password,
      });
      toast.success('Signed in successfully!');
    } catch (error) {
      toast.error((error as Error).message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-black italic tracking-tighter sm:text-5xl">OPERATOR LOGIN</h2>
        <p className="text-muted-foreground font-medium">
          Enter your credentials to access the performance suite.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div className="group space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors group-focus-within:text-primary"
            >
              Identity Key
            </Label>
            <Input
              id="email"
              placeholder="name@gym.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 rounded-md border-border/40 bg-surface-low px-4 text-lg transition-all focus:border-neon-volt focus:ring-2 focus:ring-neon-volt/20"
            />
          </div>

          <div className="group space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors group-focus-within:text-primary"
              >
                Secure String
              </Label>
              <Link
                href="/reset-password"
                title="Forgot Password"
                className="text-xs font-bold uppercase tracking-widest text-primary hover:text-neon-volt transition-colors"
              >
                Recovery?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 rounded-md border-border/40 bg-surface-low px-4 text-lg transition-all focus:border-neon-volt focus:ring-2 focus:ring-neon-volt/20"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || status === 'loading'}
          className="h-14 w-full rounded-full bg-primary text-primary-foreground hover:bg-neon-volt hover:text-background transition-all text-lg font-black italic"
        >
          {loading ? 'AUTHENTICATING...' : 'SIGN IN TO SUITE'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          New Operator?{' '}
          <Link
            href="/signup"
            className="font-bold text-foreground hover:text-neon-volt transition-colors"
          >
            Register Network
          </Link>
        </p>
      </div>
    </div>
  );
}
