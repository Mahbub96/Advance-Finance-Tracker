import { Controller, Post, Get, Body, Query, Req, Logger, Inject } from '@nestjs/common';
import { SyncService } from './sync.service';
import type {
  SyncUploadBatchRequest,
  SyncUploadBatchResponse,
  SyncDownloadResponse,
} from '@personal-finance/types';

export interface ExtendedRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: { userId: string; email: string };
}

@Controller('sync')
export class SyncController {
  private readonly logger = new Logger('SyncController');

  constructor(@Inject(SyncService) private readonly syncService: SyncService) {}

  @Post('upload')
  async upload(
    @Req() req: ExtendedRequest,
    @Body() body: SyncUploadBatchRequest,
  ): Promise<SyncUploadBatchResponse> {
    try {
      const userId = req.user?.userId || 'default-local-user';
      const ops = body?.operations || [];
      this.logger.debug(`[SYNC UPLOAD] Received ${ops.length} operations for user: ${userId}`);
      return await this.syncService.uploadBatch(userId, {
        deviceId: body?.deviceId || 'unknown-device',
        operations: ops,
      });
    } catch (err) {
      this.logger.error(`[SYNC UPLOAD ERROR] ${String(err)}`);
      throw err;
    }
  }

  @Get('download')
  async download(
    @Req() req: ExtendedRequest,
    @Query('since') sinceStr?: string,
    @Query('limit') limitStr?: string,
  ): Promise<SyncDownloadResponse> {
    try {
      const userId = req.user?.userId || 'default-local-user';
      const parsedSince = sinceStr ? parseInt(sinceStr, 10) : 0;
      const parsedLimit = limitStr ? parseInt(limitStr, 10) : 100;
      const since = Number.isNaN(parsedSince) ? 0 : parsedSince;
      const limit = Number.isNaN(parsedLimit) ? 100 : parsedLimit;

      this.logger.debug(
        `[SYNC DOWNLOAD] Query changes for user: ${userId} since rev: ${since} (limit: ${limit})`,
      );
      return await this.syncService.downloadChanges(userId, since, limit);
    } catch (err) {
      this.logger.error(`[SYNC DOWNLOAD ERROR] ${String(err)}`);
      throw err;
    }
  }
}
