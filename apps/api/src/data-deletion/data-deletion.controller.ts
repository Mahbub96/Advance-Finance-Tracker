import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type {
  DataDeletionPreviewRequest,
  DataDeletionPreviewResponse,
  DataDeletionExecuteRequest,
  DataDeletionExecuteResponse,
} from '@personal-finance/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DataDeletionService } from './data-deletion.service';

@Controller('data-deletion')
@UseGuards(JwtAuthGuard)
export class DataDeletionController {
  constructor(private readonly dataDeletionService: DataDeletionService) {}

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  async preview(
    @Request() req: { user: { userId: string } },
    @Body() body: DataDeletionPreviewRequest,
  ): Promise<DataDeletionPreviewResponse> {
    return this.dataDeletionService.preview(req.user.userId, body);
  }

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  async execute(
    @Request() req: { user: { userId: string } },
    @Body() body: DataDeletionExecuteRequest,
  ): Promise<DataDeletionExecuteResponse> {
    return this.dataDeletionService.execute(req.user.userId, body);
  }

  @Post('audit')
  @HttpCode(HttpStatus.OK)
  async getAuditLogs(
    @Request() req: { user: { userId: string } },
  ) {
    const logs = this.dataDeletionService.getAuditLogs();
    return {
      audits: logs.filter((l) => l.userId === req.user.userId),
    };
  }
}

