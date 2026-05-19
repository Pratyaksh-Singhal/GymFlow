import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans, Playfair_Display } from 'next/font/google';
import { Providers } from '@/components/providers';
import { cn } from '@/lib/utils';
import './globals.css';

const playfairDisplayHeading = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GymFlow - Gym Management Made Simple',
  description: 'Manage your gym members, fees, and trainers in one place',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', notoSans.variable, playfairDisplayHeading.variable)}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
