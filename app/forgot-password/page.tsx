'use client';

import Link from 'next/link';
import { PasswordResetForm } from '@/components/auth/password-reset-form';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 shadow-lg">
        <PasswordResetForm initialMode="request" />

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-medium text-slate-900 hover:text-primary">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
