export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  metadata?: Record<string, unknown>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryable: boolean;
}

export interface IEmailProvider {
  sendEmail(message: EmailMessage): Promise<EmailSendResult>;
}

export const EMAIL_PROVIDER = 'EMAIL_PROVIDER';
