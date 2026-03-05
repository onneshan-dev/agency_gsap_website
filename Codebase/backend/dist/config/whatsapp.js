const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
export async function sendWhatsAppTemplate(msg) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) {
        console.warn('WhatsApp credentials not configured, skipping');
        return false;
    }
    try {
        const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: msg.to,
                type: 'template',
                template: {
                    name: msg.templateName,
                    language: { code: msg.languageCode || 'en' },
                    components: msg.components || [],
                },
            }),
        });
        if (!res.ok) {
            const err = await res.text();
            console.error('WhatsApp API error:', err);
            return false;
        }
        return true;
    }
    catch (error) {
        console.error('WhatsApp send failed:', error);
        return false;
    }
}
//# sourceMappingURL=whatsapp.js.map