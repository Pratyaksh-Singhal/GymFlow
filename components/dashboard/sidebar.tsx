'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  Package,
  CreditCard,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Dumbbell,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Trainers', href: '/dashboard/trainers', icon: UserSquare2 },
  { name: 'Packages', href: '/dashboard/packages', icon: Package },
  { name: 'Fees', href: '/dashboard/fees', icon: CreditCard },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { user, logout } = useAuth();

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div
        className={cn(
          'flex h-20 items-center px-6 border-b border-white/5',
          isCollapsed && !mobile && 'justify-center px-0'
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.3)]">
            <Dumbbell className="h-6 w-6 text-background" />
          </div>
          {!isCollapsed || mobile ? (
            <span className="text-xl font-black tracking-tighter uppercase italic">
              Gym<span className="text-primary">Flow</span>
            </span>
          ) : null}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="flex flex-col gap-2 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                variant="ghost"
                asChild
                className={cn(
                  'w-full justify-start gap-4 h-12 rounded-xl transition-all duration-300',
                  isActive
                    ? 'bg-primary text-background hover:bg-primary/90 shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5',
                  isCollapsed && !mobile && 'justify-center p-0 h-12 w-12 mx-auto'
                )}
              >
                <Link href={item.href}>
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-background' : 'text-inherit'
                    )}
                  />
                  {(!isCollapsed || mobile) && (
                    <span className="font-bold text-sm tracking-wide">{item.name}</span>
                  )}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>

      <div className={cn('p-4 border-t border-white/5', isCollapsed && !mobile && 'px-2')}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full flex items-center justify-start gap-3 h-14 rounded-2xl hover:bg-white/5',
                isCollapsed && !mobile && 'justify-center p-0'
              )}
            >
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} />
                <AvatarFallback className="bg-primary text-background font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed || mobile ? (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-bold truncate w-full">
                    {user?.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                    Gym Owner
                  </span>
                </div>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-2xl bg-card border-white/10 p-2 shadow-2xl"
          >
            <DropdownMenuLabel className="font-bold px-3 py-2">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem className="rounded-xl focus:bg-primary focus:text-background font-medium py-2 px-3">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl focus:bg-primary focus:text-background font-medium py-2 px-3">
              Gym Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={() => logout()}
              className="rounded-xl focus:bg-rose-600 focus:text-white text-rose-500 font-bold py-2 px-3"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 backdrop-blur-md border-white/10 rounded-xl shadow-xl"
            >
              <Menu className="h-5 w-5 text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 border-r border-white/10">
            <NavContent mobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col sticky top-0 h-screen transition-all duration-500 border-r border-white/5',
          isCollapsed ? 'w-[88px]' : 'w-72'
        )}
      >
        <NavContent />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-24 h-8 w-8 rounded-full border border-white/10 bg-background shadow-xl hover:bg-primary hover:text-background transition-all"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </aside>
    </>
  );
}
