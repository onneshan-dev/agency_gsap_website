/**
 * Manual payment provider — admin marks payments as paid manually.
 * This is the default until a gateway (Stripe, SSLCommerz, etc.) is integrated.
 */
export class ManualPaymentProvider {
    async createPaymentLink(_invoice) {
        return '';
    }
    async verifyPayment(_reference) {
        return { success: true };
    }
    async handleWebhook(_payload) {
        // no-op
    }
}
export const paymentProvider = new ManualPaymentProvider();
//# sourceMappingURL=payment.js.map