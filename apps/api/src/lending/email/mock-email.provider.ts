import { Injectable } from '@nestjs/common';
import type { IEmailProvider, EmailMessage, EmailSendResult } from './email.interface';

@Injectable()
export class MockEmailProvider implements IEmailProvider {
  private readonly sentMessages: Array<EmailMessage & { sentAt: string; messageId: string }> = [];
  private failNextWith?: { error: string; retryable: boolean };

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    if (this.failNextWith) {
      const err = this.failNextWith;
      this.failNextWith = undefined;
      return {
        success: false,
        error: err.error,
        retryable: err.retryable,
      };
    }

    // Email format validation guard
    if (!message.to || !message.to.includes('@')) {
      return {
        success: false,
        error: 'Invalid recipient email address format',
        retryable: false,
      };
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.sentMessages.push({
      ...message,
      sentAt: new Date().toISOString(),
      messageId,
    });

    return {
      success: true,
      messageId,
      retryable: false,
    };
  }

  getSentMessages(): Array<EmailMessage & { sentAt: string; messageId: string }> {
    return [...this.sentMessages];
  }

  clear(): void {
    this.sentMessages.length = 0;
    this.failNextWith = undefined;
  }

  simulateFailure(error: string, retryable = true): void {
    this.failNextWith = { error, retryable };
  }
}
