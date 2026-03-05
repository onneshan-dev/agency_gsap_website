import { resend, FROM_EMAIL } from '../config/resend.js';

interface EmailOptions {
  to: string;
  subject: string;
  recipientName: string;
  body: string;
  ctaUrl?: string;
  ctaText?: string;
}

export async function sendEmail(opts: EmailOptions): Promise<boolean> {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const ctaHtml = opts.ctaUrl
      ? `<p style="margin-top:24px"><a href="${opts.ctaUrl.startsWith('http') ? opts.ctaUrl : frontendUrl + opts.ctaUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600">${opts.ctaText || 'View Details'}</a></p>`
      : '';

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#ffffff;border-radius:12px">
        <div style="text-align:center;margin-bottom:32px">
          <h1 style="font-size:24px;font-weight:700;color:#111827;margin:0">Onneshon</h1>
        </div>
        <p style="color:#374151;font-size:16px;line-height:1.6">Hi ${opts.recipientName},</p>
        <p style="color:#374151;font-size:16px;line-height:1.6">${opts.body}</p>
        ${ctaHtml}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0" />
        <p style="color:#9ca3af;font-size:13px;text-align:center">Onneshon.dev &mdash; Building your ideas into reality</p>
      </div>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}
