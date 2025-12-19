import { Link, useLocation } from 'react-router-dom';
import { BarChart3, ShoppingCart, Settings, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';

const publicNavItems = [
  { path: '/', label: 'Начало', icon: BarChart3 },
  { path: '/compare', label: 'Сравнение', icon: ShoppingCart },
  { path: '/trends', label: 'Тенденции', icon: TrendingDown },
];

const adminNavItems = [{ path: '/admin', label: 'Админ', icon: Settings }];

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(user?.id);

  // Show admin link while role is being verified to avoid "missing Admin" UX.
  const navItems = isAdmin || adminLoading ? [...publicNavItems, ...adminNavItems] : publicNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
              location.pathname === path ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
