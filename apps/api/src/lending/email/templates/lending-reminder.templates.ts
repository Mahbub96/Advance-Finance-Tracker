import { LendingReminderType, type LendingEmailTemplateData, type RenderedEmail } from '@personal-finance/types';

export function renderLendingReminderEmail(
  type: LendingReminderType,
  data: LendingEmailTemplateData,
): RenderedEmail {
  const { recipientName, amount, currency, dueDate, userNote } = data;
  const formattedAmount = `${currency} ${amount}`;
  const noteSuffix = userNote ? `\n\nNote: ${userNote}` : '';

  switch (type) {
    case LendingReminderType.LENDING_DUE_7_DAYS: {
      const subject = 'Friendly reminder about the repayment';
      const textBody = `Hi ${recipientName},\n\nJust a friendly reminder that the ${formattedAmount} you borrowed is due in 7 days, on ${dueDate}.\n\nPlease let me know if you expect any change in the timing.${noteSuffix}\n\nThank you.`;
      return { subject, textBody };
    }

    case LendingReminderType.LENDING_DUE_3_DAYS: {
      const subject = 'A quick repayment reminder';
      const textBody = `Hi ${recipientName},\n\nJust a quick reminder that the ${formattedAmount} repayment is due in 3 days, on ${dueDate}.${noteSuffix}\n\nThanks!`;
      return { subject, textBody };
    }

    case LendingReminderType.LENDING_DUE: {
      const subject = 'Repayment reminder for today';
      const textBody = `Hi ${recipientName},\n\nJust a friendly reminder that the ${formattedAmount} repayment is due today (${dueDate}).${noteSuffix}\n\nThank you.`;
      return { subject, textBody };
    }

    case LendingReminderType.LENDING_OVERDUE: {
      const subject = 'Friendly repayment reminder';
      const textBody = `Hi ${recipientName},\n\nJust a friendly reminder that the ${formattedAmount} repayment was due on ${dueDate}.\n\nPlease let me know when you expect to be able to make the payment.${noteSuffix}\n\nThank you.`;
      return { subject, textBody };
    }

    default: {
      const subject = 'Repayment reminder';
      const textBody = `Hi ${recipientName},\n\nJust a reminder regarding the ${formattedAmount} repayment scheduled for ${dueDate}.${noteSuffix}\n\nThank you.`;
      return { subject, textBody };
    }
  }
}
