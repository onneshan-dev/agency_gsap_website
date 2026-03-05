import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import type { NavSection, NavItem } from '@/types/admin';
import { ChevronDown, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface SidebarProps {
  className?: string;
  onNavigate?: (href: string) => void;
  currentPath?: string;
}

// Colors from pen file design
const colors = {
  primary: '#2D5A3D',
  surface: '#FFFFFF',
  bg: '#F8F7F4',
  sidebarBg: '#F1F0ED',
  border: '#E5E3DE',
  textPrimary: '#1A1A1E',
  textSecondary: '#5F5F67',
  textMuted: '#9A9AA0',
  accent: '#C76F30',
};

const NavItemComponent: React.FC<{
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
        isActive
          ? 'text-white'
          : 'hover:bg-white'
      )}
      style={{
        backgroundColor: isActive ? colors.primary : 'transparent',
        color: isActive ? colors.surface : colors.textSecondary,
      }}
    >
      <Icon 
        name={item.icon as import('@/components/ui/Icon').IconName} 
        size={18} 
        className={isActive ? 'text-white' : 'text-[#5F5F67]'}
      />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span 
          className="text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
          style={{ backgroundColor: colors.accent }}
        >
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </button>
  );
};

const NavSectionComponent: React.FC<{
  section: NavSection;
  currentPath: string;
  onNavigate: (href: string) => void;
  pendingProposalsCount: number;
}> = ({ section, currentPath, onNavigate, pendingProposalsCount }) => {
  const [expanded, setExpanded] = useState(true);

  // Update proposals nav item with badge count
  const navItems = section.items.map(item => {
    if (item.id === 'proposals') {
      return { ...item, badge: pendingProposalsCount };
    }
    return item;
  });

  return (
    <div className="mb-1">
      {section.label && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-2 py-2 text-[10px] font-semibold tracking-wider uppercase"
          style={{ color: colors.textMuted }}
        >
          <span>{section.label}</span>
          <ChevronDown 
            size={12} 
            className={cn(
              'transition-transform duration-200',
              expanded ? 'rotate-0' : '-rotate-90'
            )}
            style={{ color: colors.textMuted }}
          />
        </button>
      )}
      
      {expanded && (
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavItemComponent
              key={item.id}
              item={item}
              isActive={item.href === currentPath || currentPath.startsWith(item.href + '/')}
              onClick={() => item.href && onNavigate(item.href)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  onNavigate,
  currentPath = '/admin/dashboard'
}) => {
  const [pendingProposalsCount, setPendingProposalsCount] = useState(0);

  useEffect(() => {
    fetchPendingProposalsCount();
    
    // Subscribe to changes
    const subscription = supabase
      .channel('proposals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proposals' },
        () => {
          fetchPendingProposalsCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchPendingProposalsCount() {
    try {
      const { count, error } = await supabase
        .from('proposals')
        .select('id', { count: 'exact', head: true })
        .in('status', ['submitted', 'under_review']);

      if (error) throw error;
      setPendingProposalsCount(count || 0);
    } catch (error) {
      console.error('Error fetching pending proposals count:', error);
    }
  }

  const navSections: NavSection[] = [
    {
      id: 'main',
      label: '',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', href: '/admin/dashboard' },
        { id: 'projects', label: 'Projects', icon: 'folder-kanban', href: '/admin/projects' },
        { id: 'proposals', label: 'Client Proposals', icon: 'clipboard-list', href: '/admin/proposals', badge: pendingProposalsCount },
        { id: 'team', label: 'Team', icon: 'users', href: '/admin/team' },
        { id: 'analytics', label: 'Analytics', icon: 'bar-chart', href: '/admin/analytics' },
      ],
    },
  ];

  const handleNavigate = (href: string) => {
    onNavigate?.(href);
  };

  return (
    <aside
      className={cn(
        'w-[272px] h-screen flex flex-col overflow-hidden',
        className
      )}
      style={{ backgroundColor: colors.sidebarBg }}
    >
      {/* Brand Header */}
      <div 
        className="flex items-center gap-2.5 px-5 py-4"
        style={{ 
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <span className="text-white text-lg font-bold">O</span>
        </div>
        <span 
          className="text-xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Onneshan
        </span>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2.5">
        <div 
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ 
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Search size={16} style={{ color: colors.textMuted }} />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: colors.textPrimary }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav 
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-4 min-h-0 scrollbar-thin"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.border} transparent`,
        }}
      >
        {navSections.map((section) => (
          <NavSectionComponent
            key={section.id}
            section={section}
            currentPath={currentPath}
            onNavigate={handleNavigate}
            pendingProposalsCount={pendingProposalsCount}
          />
        ))}
      </nav>

      {/* User Profile Card */}
      <div 
        className="px-4 py-3"
        style={{ 
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div 
          className="flex items-center gap-3 rounded-lg p-2.5 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ backgroundColor: colors.surface }}
        >
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.accent }}
          >
            <span className="text-white text-sm font-semibold">AU</span>
          </div>
          <div className="flex-1">
            <div 
              className="text-sm font-semibold"
              style={{ color: colors.textPrimary }}
            >
              Admin User
            </div>
            <div 
              className="text-xs"
              style={{ color: colors.textMuted }}
            >
              Super Admin
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
