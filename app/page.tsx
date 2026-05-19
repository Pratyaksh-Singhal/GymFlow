import { CinematicShell } from '@/components/layout/cinematic-shell';
import { BentoCard } from '@/components/ui/bento-card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Activity, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <CinematicShell>
      <main className="container relative mx-auto px-4 py-20 lg:py-32">
        {/* Background Accent */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(160,205,224,0.05),transparent_50%)]" />

        <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-6">
          {/* Hero Section */}
          <div className="lg:col-span-8 lg:row-span-3 flex flex-col justify-center space-y-6">
            <h1 className="text-6xl font-extrabold italic tracking-tighter sm:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-neon-volt bg-clip-text text-transparent">
                REDEFINE
              </span>
              <br />
              <span className="text-foreground">PERFORMANCE</span>
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
              The ultimate multi-tenant OS for elite gym operators. Experience high-performance
              member management with cinematic precision.
            </p>

            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span>
                Automated fee reminders and tracking
              </li>

              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span>
                Real-time business insights
              </li>

              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span>
                Works for small to medium gyms
              </li>
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Footer Note */}
            <p className="text-sm text-gray-500">
              No credit card required. Free for first 14 days.
            </p>
          </div>

          {/* Bento Cards */}
          <div className="lg:col-span-4 lg:row-span-2">
            <BentoCard
              title="Smart Analytics"
              description="Track memberships, revenue, and growth in real time."
              icon={Activity}
            />
          </div>

          <div className="lg:col-span-2 lg:row-span-2">
            <BentoCard
              title="Member Management"
              description="Manage members and subscriptions effortlessly."
              icon={Users}
            />
          </div>

          <div className="lg:col-span-2 lg:row-span-2">
            <BentoCard
              title="Automation"
              description="Automate reminders and operational workflows."
              icon={Zap}
            />
          </div>
        </div>
      </main>
    </CinematicShell>
  );
}
