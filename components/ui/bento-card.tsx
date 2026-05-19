import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  elevation?: 'low' | 'base' | 'high' | 'highest';
}

export function BentoCard({
  children,
  className,
  title,
  description,
  icon: Icon,
  elevation = 'base',
  ...props
}: BentoCardProps) {
  const elevationClasses = {
    low: 'bg-surface-low',
    base: 'bg-surface-base',
    high: 'bg-surface-high',
    highest: 'bg-surface-highest',
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border/40 p-6 transition-all duration-400 ease-out hover:translate-y-[-4px] hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/5',
        elevationClasses[elevation],
        className
      )}
      {...props}
    >
      <div className="relative z-10 flex h-full flex-col justify-between space-y-4">
        {Icon && (
          <Icon className="h-8 w-8 text-primary transition-colors duration-400 group-hover:text-neon-volt" />
        )}
        <div className="space-y-2">
          {title && <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>}
          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
          {children}
        </div>
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
    </div>
  );
}
