import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt-auth.guard';
import type {
  SyncUploadBatchRequest,
  SyncUploadBatchResponse,
  SyncDownloadResponse,
} from '@personal-finance/types';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('upload')
  async upload(
    @Req() req: AuthenticatedRequest,
    @Body() body: SyncUploadBatchRequest,
  ): Promise<{ data: SyncUploadBatchResponse }> {
    const userId = req.user!.userId;
    const res = await this.syncService.uploadBatch(userId, body);
    return { data: res };
  }

  @Get('download')
  async download(
    @Req() req: AuthenticatedRequest,
    @Query('since') sinceStr?: string,
    @Query('limit') limitStr?: string,
  ): Promise<{ data: SyncDownloadResponse }> {
    const userId = req.user!.userId;
    const since = sinceStr ? parseInt(sinceStr, 10) : 0;
    const limit = limitStr ? parseInt(limitStr, 10) : 100;
    const res = await this.syncService.downloadChanges(userId, since, limit);
    return { data: res };
  }
}
