import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-4xl font-black italic tracking-tighter sm:text-5xl">
          REGISTER NETWORK
        </h2>
        <p className="text-muted-foreground font-medium">
          Provision a new multi-tenant instance for your facility.
        </p>
      </div>

      <form className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="group space-y-2">
          <Label
            htmlFor="name"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary"
          >
            Operator Name
          </Label>
          <Input
            id="name"
            placeholder="John Doe"
            className="h-12 bg-surface-low focus:border-neon-volt focus:ring-2 focus:ring-neon-volt/20"
          />
        </div>

        <div className="group space-y-2">
          <Label
            htmlFor="gym"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary"
          >
            Facility Name
          </Label>
          <Input
            id="gym"
            placeholder="Iron Temple"
            className="h-12 bg-surface-low focus:border-neon-volt focus:ring-2 focus:ring-neon-volt/20"
          />
        </div>

        <div className="group col-span-full space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary"
          >
            Network Identity (Email)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@facility.com"
            className="h-12 bg-surface-low focus:border-neon-volt focus:ring-2 focus:ring-neon-volt/20"
          />
        </div>

        <div className="group col-span-full space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary"
          >
            Secure String (Password)
          </Label>
          <Input
            id="password"
            type="password"
            className="h-12 bg-surface-low focus:border-neon-volt focus:ring-2 focus:ring-neon-volt/20"
          />
        </div>

        <div className="col-span-full flex items-center space-x-3 rounded-xl border border-border/40 bg-surface-low p-4 transition-colors hover:border-primary/40">
          <Checkbox
            id="terms"
            className="border-primary data-[state=checked]:bg-neon-volt data-[state=checked]:text-background"
          />
          <Label htmlFor="terms" className="text-sm font-medium leading-none text-muted-foreground">
            I accept the{' '}
            <Link href="/terms" className="font-bold text-foreground hover:text-primary">
              Service Protocols
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-bold text-foreground hover:text-primary">
              Data Encryption
            </Link>{' '}
            standards.
          </Label>
        </div>

        <Button className="col-span-full h-14 rounded-full bg-primary text-primary-foreground hover:bg-neon-volt hover:text-background transition-all text-lg font-black italic">
          PROVISION NETWORK
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Existing Operator?{' '}
          <Link
            href="/login"
            className="font-bold text-foreground hover:text-neon-volt transition-colors"
          >
            Identity Sync
          </Link>
        </p>
      </div>
    </div>
  );
}
