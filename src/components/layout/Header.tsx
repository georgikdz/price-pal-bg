import { Link, useLocation } from 'react-router-dom';
import { BarChart3, ShoppingCart, Settings, TrendingDown, GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  { path: '/compare', label: 'Compare', icon: ShoppingCart },
  { path: '/trends', label: 'Trends', icon: TrendingDown },
  { path: '/mapping', label: 'Mapping', icon: GitCompare },
  { path: '/admin', label: 'Admin', icon: Settings },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xl shadow-md group-hover:shadow-lg transition-shadow">
            🛒
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-none">
              ЦениБГ
            </h1>
            <p className="text-xs text-muted-foreground">Price Tracker</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                location.pathname === path
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-store-billa" />
            <span className="h-2 w-2 rounded-full bg-store-kaufland" />
            <span className="h-2 w-2 rounded-full bg-store-lidl" />
          </div>
        </div>
      </div>
    </header>
  );
}
