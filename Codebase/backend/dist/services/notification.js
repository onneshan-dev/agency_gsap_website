import { supabaseAdmin } from '../config/supabase.js';
import { sendEmail } from './email.js';
import { sendWhatsAppNotification } from './whatsapp.js';
export async function notify(opts) {
    const channels = opts.channels ?? ['in_app'];
    const { error } = await supabaseAdmin.from('notifications').insert({
        user_id: opts.userId,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        data: opts.data ?? {},
        channels,
    });
    if (error) {
        console.error('Failed to create notification:', error);
    }
    if (channels.includes('email')) {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('email, full_name')
            .eq('id', opts.userId)
            .single();
        if (profile?.email) {
            await sendEmail({
                to: profile.email,
                subject: opts.title,
                recipientName: profile.full_name || 'there',
                body: opts.message,
                ctaUrl: opts.data?.url,
                ctaText: 'View Details',
            });
            await supabaseAdmin
                .from('notifications')
                .update({ email_sent_at: new Date().toISOString() })
                .eq('user_id', opts.userId)
                .eq('type', opts.type)
                .order('created_at', { ascending: false })
                .limit(1);
        }
    }
    if (channels.includes('whatsapp')) {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('whatsapp_number, full_name')
            .eq('id', opts.userId)
            .single();
        if (profile?.whatsapp_number) {
            await sendWhatsAppNotification({
                to: profile.whatsapp_number,
                name: profile.full_name || 'there',
                message: opts.message,
            });
            await supabaseAdmin
                .from('notifications')
                .update({ whatsapp_sent_at: new Date().toISOString() })
                .eq('user_id', opts.userId)
                .eq('type', opts.type)
                .order('created_at', { ascending: false })
                .limit(1);
        }
    }
}
export async function notifyAdmins(type, title, message, data, channels) {
    const { data: admins } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'admin');
    if (admins) {
        await Promise.all(admins.map((admin) => notify({ userId: admin.id, type, title, message, data, channels })));
    }
}
//# sourceMappingURL=notification.js.map