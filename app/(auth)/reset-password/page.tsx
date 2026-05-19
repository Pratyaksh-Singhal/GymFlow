import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-black italic tracking-tighter sm:text-5xl">
          IDENTITY RECOVERY
        </h2>
        <p className="text-muted-foreground font-medium">
          Verify your network identity to reset your secure string.
        </p>
      </div>

      <div className="space-y-8">
        {/* Verification Success Example (Hidden by default in real usage) */}
        {/* 
        <Alert className="border-neon-volt bg-neon-volt/10 text-neon-volt">
          <CheckCircle2 className="h-4 w-4 stroke-neon-volt" />
          <AlertTitle className="font-bold uppercase tracking-widest">Protocol Verified</AlertTitle>
          <AlertDescription className="font-medium">
            Recovery instructions have been dispatched to your identity key.
          </AlertDescription>
        </Alert> 
        */}

        <form className="space-y-8">
          <div className="group space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary"
            >
              Identity Key (Email)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@facility.com"
              className="h-14 bg-surface-low focus:border-neon-volt focus:ring-2 focus:ring-neon-volt/20"
            />
          </div>

          <Button className="h-14 w-full rounded-full bg-primary text-primary-foreground hover:bg-neon-volt hover:text-background transition-all text-lg font-black italic">
            DISPATCH RECOVERY LINK
          </Button>
        </form>

        <Alert className="border-crimson-laser/50 bg-crimson-laser/5 text-crimson-laser">
          <ShieldAlert className="h-4 w-4 stroke-crimson-laser" />
          <AlertTitle className="font-bold uppercase tracking-widest">Security Warning</AlertTitle>
          <AlertDescription className="text-sm">
            Multiple failed recovery attempts will trigger a temporary network lockout.
          </AlertDescription>
        </Alert>
      </div>

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          Return to Portal
        </Link>
      </div>
    </div>
  );
}
