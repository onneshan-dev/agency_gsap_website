export interface Invoice {
    id: string;
    amount: number;
    currency: string;
    description: string;
    clientEmail: string;
    clientName: string;
}
export interface PaymentResult {
    success: boolean;
    reference?: string;
    error?: string;
}
export interface PaymentProvider {
    createPaymentLink(invoice: Invoice): Promise<string>;
    verifyPayment(reference: string): Promise<PaymentResult>;
    handleWebhook(payload: unknown): Promise<void>;
}
/**
 * Manual payment provider — admin marks payments as paid manually.
 * This is the default until a gateway (Stripe, SSLCommerz, etc.) is integrated.
 */
export declare class ManualPaymentProvider implements PaymentProvider {
    createPaymentLink(_invoice: Invoice): Promise<string>;
    verifyPayment(_reference: string): Promise<PaymentResult>;
    handleWebhook(_payload: unknown): Promise<void>;
}
export declare const paymentProvider: PaymentProvider;
//# sourceMappingURL=payment.d.ts.map