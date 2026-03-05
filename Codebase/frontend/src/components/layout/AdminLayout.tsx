import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useNavigate, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  className,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (href: string) => {
    navigate(href);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-admin-bg flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">
        <Sidebar 
          currentPath={location.pathname}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
            <Sidebar 
              currentPath={location.pathname}
              onNavigate={handleNavigate}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header 
          onMenuToggle={() => setSidebarOpen(true)}
        />
        
        <main className={cn(
          'flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 overflow-auto',
          className
        )}>
          {children}
        </main>

        <BottomNav 
          currentPath={location.pathname}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
};

export default AdminLayout;
