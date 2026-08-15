import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SyncModule } from '../sync/sync.module';
import { LendingModule } from '../lending/lending.module';
import { DataDeletionService } from './data-deletion.service';
import { DataDeletionController } from './data-deletion.controller';

@Module({
  imports: [AuthModule, SyncModule, LendingModule],
  controllers: [DataDeletionController],
  providers: [DataDeletionService],
  exports: [DataDeletionService],
})
export class DataDeletionModule {}
