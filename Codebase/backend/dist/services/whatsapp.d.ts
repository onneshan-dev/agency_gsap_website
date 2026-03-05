interface WhatsAppNotification {
    to: string;
    name: string;
    message: string;
}
export declare function sendWhatsAppNotification(opts: WhatsAppNotification): Promise<boolean>;
export {};
//# sourceMappingURL=whatsapp.d.ts.map