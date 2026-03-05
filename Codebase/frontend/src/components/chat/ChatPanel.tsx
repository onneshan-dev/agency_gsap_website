import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import type { ChatMessage, Profile } from '@/types/supabase';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { io, type Socket } from 'socket.io-client';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface MessageWithSender extends ChatMessage {
  sender?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

interface ChatPanelProps {
  conversationId: string | null;
  proposalId?: string;
  projectId?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  conversationId: initialConversationId,
  proposalId,
  projectId,
}) => {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
  }, []);

  // Create conversation if needed
  useEffect(() => {
    if (conversationId) return;
    let cancelled = false;
    const create = async () => {
      try {
        const data = await api.post<{ id: string }>(
          '/api/chat/conversations',
          {
            proposal_id: proposalId ?? null,
            project_id: projectId ?? null,
          },
        );
        if (!cancelled) setConversationId(data.id);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to create conversation',
        );
      }
    };
    create();
    return () => {
      cancelled = true;
    };
  }, [conversationId, proposalId, projectId]);

  // Fetch messages
  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await api.get<MessageWithSender[]>(
          `/api/chat/conversations/${conversationId}/messages`,
        );
        if (!cancelled) {
          setMessages(data);
          scrollToBottom();
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to load messages',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMessages();
    return () => {
      cancelled = true;
    };
  }, [conversationId, scrollToBottom]);

  // Socket.io connection
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    let socket: Socket;

    const connect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      socket = io(`${API_URL}/chat`, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join_conversation', { conversation_id: conversationId });
      });

      socket.on('new_message', (message: MessageWithSender) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      });

      socket.on(
        'user_typing',
        ({ user_id, name }: { user_id: string; name: string }) => {
          if (user_id === currentUserId) return;
          setTypingUsers((prev) =>
            prev.includes(name) ? prev : [...prev, name],
          );
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((n) => n !== name));
          }, 3000);
        },
      );

      socket.on('user_stop_typing', ({ name }: { name: string }) => {
        setTypingUsers((prev) => prev.filter((n) => n !== name));
      });
    };

    connect();

    return () => {
      if (socket) {
        socket.emit('leave_conversation', {
          conversation_id: conversationId,
        });
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [conversationId, currentUserId, scrollToBottom]);

  const emitTyping = useCallback(() => {
    if (!socketRef.current || !conversationId) return;
    socketRef.current.emit('typing', { conversation_id: conversationId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', {
        conversation_id: conversationId,
      });
    }, 2000);
  }, [conversationId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !conversationId) return;
    setSending(true);
    setInput('');

    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        conversation_id: conversationId,
        content: text,
      });
      setSending(false);
      return;
    }

    try {
      const message = await api.post<MessageWithSender>(
        `/api/chat/conversations/${conversationId}/messages`,
        { content: text },
      );
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to send message',
      );
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (loading && !messages.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-admin-text-muted" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-admin-surface rounded-lg border border-admin-border overflow-hidden">
      {/* ── Messages Area ───────────────────────────────── */}
      <ScrollArea className="flex-1 min-h-0">
        <div ref={scrollRef} className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-admin-text-muted">
              <MessageCircle size={32} className="mb-3 opacity-40" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          )}

          {messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2.5',
                  isOwn ? 'flex-row-reverse' : 'flex-row',
                )}
              >
                <Avatar className="size-8 shrink-0 mt-0.5">
                  <AvatarImage src={msg.sender?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs bg-admin-bg text-admin-text-secondary">
                    {getInitials(msg.sender?.full_name)}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={cn(
                    'max-w-[75%] space-y-1',
                    isOwn ? 'items-end' : 'items-start',
                  )}
                >
                  <div className={cn('flex items-baseline gap-2', isOwn && 'flex-row-reverse')}>
                    <span className="text-xs font-medium text-admin-text-secondary">
                      {msg.sender?.full_name ?? 'Unknown'}
                    </span>
                    <span className="text-[10px] text-admin-text-muted">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                      isOwn
                        ? 'bg-admin-primary text-white rounded-tr-sm'
                        : 'bg-admin-bg text-admin-text-primary border border-admin-border rounded-tl-sm',
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 px-2">
              <div className="flex gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-admin-text-muted animate-bounce [animation-delay:0ms]" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-admin-text-muted animate-bounce [animation-delay:150ms]" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-admin-text-muted animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-admin-text-muted">
                {typingUsers.join(', ')}{' '}
                {typingUsers.length === 1 ? 'is' : 'are'} typing…
              </span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Input Area ──────────────────────────────────── */}
      <div className="border-t border-admin-border p-3">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              emitTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            disabled={sending || !conversationId}
            className="flex-1 bg-admin-bg border-admin-border text-admin-text-primary placeholder:text-admin-text-muted rounded-full px-4"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={sending || !input.trim() || !conversationId}
            className="bg-admin-primary hover:bg-admin-primary/90 rounded-full shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
