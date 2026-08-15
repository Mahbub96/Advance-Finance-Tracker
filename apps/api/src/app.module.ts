import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { SyncModule } from './sync/sync.module';
import { LendingModule } from './lending/lending.module';
import { DataDeletionModule } from './data-deletion/data-deletion.module';

@Module({
  imports: [HealthModule, AuthModule, SyncModule, LendingModule, DataDeletionModule],
})
export class AppModule {}

