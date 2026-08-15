import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import type {
  LendingEmailPreviewRequest,
  LendingEmailPreviewResponse,
} from '@personal-finance/types';
import { LendingReminderService } from './lending-reminder.service';

@Controller('lending')
export class LendingController {
  constructor(private readonly lendingReminderService: LendingReminderService) {}

  @Post('reminder/preview')
  @HttpCode(HttpStatus.OK)
  previewReminder(
    @Body() body: LendingEmailPreviewRequest,
  ): LendingEmailPreviewResponse {
    return this.lendingReminderService.previewReminder(body);
  }

  @Post('reminder/dispatch')
  @HttpCode(HttpStatus.OK)
  async dispatchReminders(
    @Body() body: { referenceDate?: string },
  ): Promise<{ dispatched: number; failed: number; skipped: number }> {
    return this.lendingReminderService.dispatchPendingReminders(body?.referenceDate);
  }
}
