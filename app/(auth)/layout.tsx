import { CinematicShell } from '@/components/layout/cinematic-shell';
import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <CinematicShell className="flex min-h-screen">
      {/* Left Showcase Layer (60% Desktop) */}
      <div className="relative hidden w-[60%] flex-col justify-between overflow-hidden lg:flex">
        {/* Cinematic Background Image Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-10000 hover:scale-110"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        {/* Radial Gradient Mask */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_0%_100%,transparent_0%,rgba(11,15,16,1)_100%)]" />

        {/* Branding/Quote Overlay */}
        <div className="relative z-20 p-16">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-lg bg-neon-volt shadow-[0_0_20px_rgba(204,255,0,0.5)]" />
            <span className="text-3xl font-black italic tracking-tighter text-white">GYMFLOW</span>
          </div>
        </div>

        <div className="relative z-20 p-16">
          <blockquote className="space-y-2">
            <p className="text-4xl font-extrabold italic leading-tight tracking-tight text-white">
              &ldquo;PRECISION IS THE ULTIMATE ADVANTAGE.&rdquo;
            </p>
            <footer className="text-sm font-bold uppercase tracking-widest text-primary">
              Elite Performance Suite v2.0
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Access Form Layer (40% Desktop / 100% Mobile) */}
      <div className="flex w-full flex-col items-center justify-center bg-background p-8 lg:w-[40%] lg:p-16">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>
    </CinematicShell>
  );
}
