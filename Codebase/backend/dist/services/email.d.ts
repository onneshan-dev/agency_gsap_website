interface EmailOptions {
    to: string;
    subject: string;
    recipientName: string;
    body: string;
    ctaUrl?: string;
    ctaText?: string;
}
export declare function sendEmail(opts: EmailOptions): Promise<boolean>;
export {};
//# sourceMappingURL=email.d.ts.map