import { supabaseAdmin } from '../config/supabase.js';
export async function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
    }
    const token = header.slice(7);
    try {
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !data.user) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role, email')
            .eq('id', data.user.id)
            .single();
        req.userId = data.user.id;
        req.userRole = profile?.role ?? 'client';
        req.userEmail = profile?.email ?? data.user.email;
        next();
    }
    catch {
        res.status(401).json({ error: 'Authentication failed' });
    }
}
//# sourceMappingURL=auth.js.map