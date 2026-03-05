export interface WhatsAppMessage {
    to: string;
    templateName: string;
    languageCode?: string;
    components?: Array<{
        type: string;
        parameters: Array<{
            type: string;
            text?: string;
        }>;
    }>;
}
export declare function sendWhatsAppTemplate(msg: WhatsAppMessage): Promise<boolean>;
//# sourceMappingURL=whatsapp.d.ts.map