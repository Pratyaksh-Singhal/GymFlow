'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Members', href: '/dashboard/members' },
  { name: 'Trainers', href: '/dashboard/trainers' },
  { name: 'Packages', href: '/dashboard/packages' },
  { name: 'Fees', href: '/dashboard/fees' },
  { name: 'Notifications', href: '/dashboard/notifications' },
  { name: 'Reports', href: '/dashboard/reports' },
  { name: 'Settings', href: '/dashboard/settings' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72">
        <div className="mb-6 text-xl font-bold">GymFlow</div>

        <nav className="flex flex-col gap-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-slate-100 text-black'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
