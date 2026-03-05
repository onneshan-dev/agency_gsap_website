import { sendWhatsAppTemplate } from '../config/whatsapp.js';
export async function sendWhatsAppNotification(opts) {
    return sendWhatsAppTemplate({
        to: opts.to,
        templateName: 'project_notification',
        components: [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: opts.name },
                    { type: 'text', text: opts.message },
                ],
            },
        ],
    });
}
//# sourceMappingURL=whatsapp.js.map