import { Module } from '@nestjs/common';
import { EMAIL_PROVIDER } from './email/email.interface';
import { MockEmailProvider } from './email/mock-email.provider';
import { LendingReminderService } from './lending-reminder.service';
import { LendingController } from './lending.controller';

@Module({
  controllers: [LendingController],
  providers: [
    LendingReminderService,
    {
      provide: EMAIL_PROVIDER,
      useClass: MockEmailProvider,
    },
    MockEmailProvider,
  ],
  exports: [LendingReminderService, EMAIL_PROVIDER, MockEmailProvider],
})
export class LendingModule {}
