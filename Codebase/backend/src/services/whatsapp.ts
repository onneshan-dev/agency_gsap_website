import { sendWhatsAppTemplate } from '../config/whatsapp.js';

interface WhatsAppNotification {
  to: string;
  name: string;
  message: string;
}

export async function sendWhatsAppNotification(
  opts: WhatsAppNotification,
): Promise<boolean> {
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
