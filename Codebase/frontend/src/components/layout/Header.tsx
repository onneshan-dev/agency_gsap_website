import React from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface HeaderProps {
  className?: string;
  title?: string;
  onMenuToggle?: () => void;
}

const getPageTitle = (pathname: string): string => {
  if (pathname.includes('/dashboard')) return 'Dashboard';
  if (pathname.includes('/projects/')) return 'Project Details';
  if (pathname.includes('/projects')) return 'Projects';
  if (pathname.includes('/proposals/new')) return 'New Proposal';
  if (pathname.includes('/proposals/')) return 'Proposal Details';
  if (pathname.includes('/proposals')) return 'Proposals';
  if (pathname.includes('/team')) return 'Team';
  return 'Dashboard';
};

export const Header: React.FC<HeaderProps> = ({ 
  className,
  title,
  onMenuToggle
}) => {
  const location = useLocation();
  const { profile } = useAuth();
  const pageTitle = title || getPageTitle(location.pathname);
  
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className={cn(
      'h-16 bg-admin-surface border-b border-admin-border flex items-center justify-between px-6',
      className
    )}>
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-admin-bg rounded-lg text-admin-text-secondary transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-admin-text-primary">{pageTitle}</h2>
          <p className="text-xs text-admin-text-muted hidden sm:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-2 bg-admin-bg border border-admin-border rounded-lg px-3 py-1.5">
          <Search size={16} className="text-admin-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-admin-text-primary placeholder:text-admin-text-muted outline-none w-32 lg:w-48"
          />
          <kbd className="px-1.5 py-0.5 bg-admin-surface border border-admin-border rounded text-[10px] text-admin-text-muted font-medium">
            ⌘K
          </kbd>
        </div>

        <button className="md:hidden p-2 hover:bg-admin-bg rounded-lg text-admin-text-secondary transition-colors">
          <Search size={20} />
        </button>

        <NotificationCenter />

        <button className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-admin-border hover:bg-admin-bg rounded-lg p-1.5 transition-colors">
          <div className="w-8 h-8 bg-admin-primary rounded-full flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white text-xs font-semibold">{initials}</span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-admin-text-primary">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-admin-text-muted">{profile?.role || 'client'}</p>
          </div>
          <ChevronDown size={16} className="text-admin-text-muted hidden sm:block" />
        </button>
      </div>
    </header>
  );
};

export default Header;
