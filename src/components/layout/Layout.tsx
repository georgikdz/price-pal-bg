import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin(user?.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container py-6 pb-24 md:pb-6 flex-1">
        {children}
      </main>
      <footer className="hidden md:block border-t border-border/30 py-4">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} ЦениБГ</span>
          {isAdmin && (
            <Link 
              to="/admin" 
              className="hover:text-foreground transition-colors"
            >
              Админ панел
            </Link>
          )}
        </div>
      </footer>
      <MobileNav />
    </div>
  );
}
