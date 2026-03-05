import { supabaseAdmin } from '../config/supabase.js';
export function setupChatSocket(io) {
    const chatNs = io.of('/chat');
    chatNs.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('Authentication required'));
        try {
            const { data, error } = await supabaseAdmin.auth.getUser(token);
            if (error || !data.user)
                return next(new Error('Invalid token'));
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('full_name, avatar_url, role')
                .eq('id', data.user.id)
                .single();
            socket.data.userId = data.user.id;
            socket.data.profile = profile;
            next();
        }
        catch {
            next(new Error('Authentication failed'));
        }
    });
    chatNs.on('connection', (socket) => {
        console.log(`Chat connected: ${socket.data.userId}`);
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conv:${conversationId}`);
        });
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conv:${conversationId}`);
        });
        socket.on('send_message', async (msg, callback) => {
            try {
                const { data, error } = await supabaseAdmin
                    .from('chat_messages')
                    .insert({
                    conversation_id: msg.conversation_id,
                    sender_id: socket.data.userId,
                    content: msg.content,
                    attachments: msg.attachments || [],
                })
                    .select('*, profiles!chat_messages_sender_id_fkey(full_name, avatar_url, role)')
                    .single();
                if (error)
                    throw error;
                chatNs.to(`conv:${msg.conversation_id}`).emit('new_message', data);
                callback?.({ success: true, message: data });
            }
            catch (error) {
                console.error('Send message error:', error);
                callback?.({ success: false, error: 'Failed to send message' });
            }
        });
        socket.on('typing', (conversationId) => {
            socket.to(`conv:${conversationId}`).emit('user_typing', {
                userId: socket.data.userId,
                name: socket.data.profile?.full_name || 'Someone',
            });
        });
        socket.on('stop_typing', (conversationId) => {
            socket.to(`conv:${conversationId}`).emit('user_stop_typing', {
                userId: socket.data.userId,
            });
        });
        socket.on('mark_read', async (conversationId) => {
            try {
                const { data: messages } = await supabaseAdmin
                    .from('chat_messages')
                    .select('id, read_by')
                    .eq('conversation_id', conversationId)
                    .not('sender_id', 'eq', socket.data.userId);
                if (messages) {
                    for (const msg of messages) {
                        const readBy = msg.read_by || [];
                        if (!readBy.includes(socket.data.userId)) {
                            await supabaseAdmin
                                .from('chat_messages')
                                .update({ read_by: [...readBy, socket.data.userId] })
                                .eq('id', msg.id);
                        }
                    }
                }
            }
            catch (error) {
                console.error('Mark read error:', error);
            }
        });
        socket.on('disconnect', () => {
            console.log(`Chat disconnected: ${socket.data.userId}`);
        });
    });
}
//# sourceMappingURL=chat.js.map