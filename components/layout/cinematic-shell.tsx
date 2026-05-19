import { cn } from '@/lib/utils';
import React from 'react';

interface CinematicShellProps {
  children: React.ReactNode;
  className?: string;
}

export function CinematicShell({ children, className }: CinematicShellProps) {
  return (
    <div
      className={cn(
        'animate-warp-entrance min-h-screen w-full bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}
