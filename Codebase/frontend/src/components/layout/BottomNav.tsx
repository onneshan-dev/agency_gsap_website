import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid, FolderKanban, ListTodo, User } from 'lucide-react';

interface BottomNavProps {
  className?: string;
  currentPath?: string;
  onNavigate?: (href: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutGrid, href: '/admin/dashboard' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, href: '/admin/projects' },
  { id: 'tasks', label: 'Tasks', icon: ListTodo, href: '/admin/tasks' },
  { id: 'profile', label: 'Profile', icon: User, href: '/admin/profile' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ 
  className,
  currentPath = '/admin/dashboard',
  onNavigate
}) => {
  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0 lg:hidden z-50',
        className
      )}
      style={{ 
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E3DE',
        height: '64px',
      }}
    >
      <div 
        className="flex items-center justify-around h-full"
        style={{ padding: '12px 16px' }}
      >
        {navItems.map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.href)}
              className="flex flex-col items-center gap-1 transition-colors"
              style={{ 
                color: isActive ? '#2D5A3D' : '#9A9AA0',
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span 
                style={{ 
                  fontSize: '11px',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
