import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Milestone,
  RotateCcw,
  Package,
  Loader2,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@/types/supabase';

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  message: MessageSquare,
  proposal: FileText,
  project: Package,
  milestone: Milestone,
  deliverable: CheckCircle2,
  revision: RotateCcw,
  invoice: CreditCard,
  payment: CreditCard,
  alert: AlertCircle,
};

function getNotificationIcon(type: string) {
  const Icon = NOTIFICATION_ICONS[type] || Bell;
  return Icon;
}

function getIconColor(type: string): string {
  const colors: Record<string, string> = {
    message: 'text-blue-500 bg-blue-50',
    proposal: 'text-purple-500 bg-purple-50',
    project: 'text-[var(--admin-primary)] bg-emerald-50',
    milestone: 'text-[var(--admin-primary)] bg-emerald-50',
    deliverable: 'text-green-500 bg-green-50',
    revision: 'text-amber-500 bg-amber-50',
    invoice: 'text-orange-500 bg-orange-50',
    payment: 'text-green-600 bg-green-50',
    alert: 'text-red-500 bg-red-50',
  };
  return colors[type] || 'text-[var(--admin-text-muted)] bg-gray-50';
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const hasFetchedRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await api.get<Notification[]>('/api/notifications?limit=20');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.get<{ count: number }>('/api/notifications/unread-count');
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open && !hasFetchedRef.current) {
      fetchNotifications();
      hasFetchedRef.current = true;
    }
    if (!open) {
      hasFetchedRef.current = false;
    }
  }, [open, fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notification: Notification) => {
    if (notification.read_at) return;

    try {
      await api.patch(`/api/notifications/${notification.id}`, { read_at: new Date().toISOString() });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/mark-all-read');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification);
    const data = notification.data as Record<string, unknown> | null;
    if (data?.url) {
      setOpen(false);
      navigate(data.url as string);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-[var(--admin-text-secondary)]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-lg"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--admin-border)]">
          <h3 className="text-sm font-semibold text-[var(--admin-text-primary)]">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-[var(--admin-primary)] hover:text-[var(--admin-primary)]/80"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--admin-text-muted)]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="h-10 w-10 text-[var(--admin-text-muted)]/40 mb-3" />
              <p className="text-sm text-[var(--admin-text-muted)]">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getIconColor(notification.type);
                const isUnread = !notification.read_at;

                return (
                  <div key={notification.id}>
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left px-4 py-3 flex gap-3 transition-colors hover:bg-[var(--admin-bg)] ${
                        isUnread ? 'bg-[var(--admin-primary)]/[0.03]' : ''
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconColor}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm leading-tight ${
                              isUnread
                                ? 'font-semibold text-[var(--admin-text-primary)]'
                                : 'font-medium text-[var(--admin-text-secondary)]'
                            }`}
                          >
                            {notification.title}
                          </p>
                          {isUnread && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--admin-primary)]" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="mt-0.5 text-xs text-[var(--admin-text-muted)] line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-[var(--admin-text-muted)]">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </button>
                    {index < notifications.length - 1 && (
                      <Separator className="bg-[var(--admin-border)]" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
