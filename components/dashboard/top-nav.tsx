'use client';

import { Search, Bell, Moon, Sun } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export function TopNav() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between px-6 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search members, transactions, trainers..."
            className="pl-10 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/50 rounded-2xl h-11 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-xl hover:bg-white/5 text-slate-400"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-white/5 text-slate-400"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full shadow-[0_0_10px_rgba(204,255,0,0.8)]" />
        </Button>
      </div>
    </header>
  );
}
