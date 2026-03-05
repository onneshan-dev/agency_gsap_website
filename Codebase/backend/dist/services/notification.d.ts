export type NotificationType = 'proposal_status' | 'new_message' | 'quote_received' | 'quote_response' | 'agreement_ready' | 'agreement_confirmed' | 'payment_due' | 'payment_received' | 'deliverable_ready' | 'revision_update' | 'project_update' | 'phase_advanced' | 'team_assigned' | 'task_assigned' | 'invoice_sent';
export type Channel = 'in_app' | 'email' | 'whatsapp';
interface NotifyOptions {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    channels?: Channel[];
}
export declare function notify(opts: NotifyOptions): Promise<void>;
export declare function notifyAdmins(type: NotificationType, title: string, message: string, data?: Record<string, unknown>, channels?: Channel[]): Promise<void>;
export {};
//# sourceMappingURL=notification.d.ts.map