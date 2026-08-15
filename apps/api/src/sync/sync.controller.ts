import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Logger,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { AuthService } from '../auth/auth.service';
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

  constructor(
    @Inject(SyncService) private readonly syncService: SyncService,
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  private resolveUserId(req: ExtendedRequest): string {
    if (req.user?.userId) {
      return req.user.userId;
    }

    const rawHeader = req.headers.authorization;
    const authorization = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
    if (!authorization) {
      return 'default-local-user';
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    return this.authService.verifyToken(token).userId;
  }

  @Post('upload')
  async upload(
    @Req() req: ExtendedRequest,
    @Body() body: SyncUploadBatchRequest,
  ): Promise<SyncUploadBatchResponse> {
    try {
      const userId = this.resolveUserId(req);
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
      const userId = this.resolveUserId(req);
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
