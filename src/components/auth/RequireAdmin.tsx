import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { Loader2, Lock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface RequireAdminProps {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(user?.id);

  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
              <LogIn className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Login required</h2>
              <p className="text-sm text-muted-foreground">Sign in to access admin tools.</p>
            </div>
          </div>
          <Link to="/auth" className="block">
            <Button className="w-full">Go to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
              <Lock className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Access denied</h2>
              <p className="text-sm text-muted-foreground">This account is not an admin.</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Signed in as <span className="text-foreground font-medium">{user.email ?? user.id}</span>
          </p>
          <Link to="/" className="block">
            <Button variant="secondary" className="w-full">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
