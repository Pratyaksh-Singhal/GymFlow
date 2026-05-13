import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-light to-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo / Brand */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-2">GymFlow</h1>
            <p className="text-xl text-gray-600">Manage your gym in 5 minutes</p>
          </div>

          {/* Hero Text */}
          <div className="mb-12">
            <p className="text-lg text-gray-700 mb-4">
              Stop managing gym members and fees in spreadsheets. GymFlow automates member
              management, fee tracking, and notifications—so you can focus on growing your gym.
            </p>
            <ul className="text-left space-y-2 text-gray-600 inline-block">
              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span>
                Member management and tracking
              </li>
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
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-8">
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Footer Note */}
          <p className="text-sm text-gray-500 mt-8">
            No credit card required. Free for first 14 days.
          </p>
        </div>
      </div>
    </main>
  );
}
