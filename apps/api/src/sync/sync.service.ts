import { Injectable } from '@nestjs/common';
import type {
  SyncUploadBatchRequest,
  SyncUploadBatchResponse,
  SyncDownloadResponse,
  SyncOperationResult,
  SyncChangeItem,
} from '@personal-finance/types';

type StoredChange = SyncChangeItem & { userId: string };

@Injectable()
export class SyncService {
  private currentRevision = 1000;
  private readonly changeLog: StoredChange[] = [];
  private readonly processedOperations = new Map<string, SyncOperationResult>();
  private readonly entityVersions = new Map<string, number>();

  async uploadBatch(userId: string, req: SyncUploadBatchRequest): Promise<SyncUploadBatchResponse> {
    const results: SyncOperationResult[] = [];

    for (const op of req.operations) {
      // 1. Idempotency check: If operationId already processed, return existing result
      if (this.processedOperations.has(op.operationId)) {
        const existing = this.processedOperations.get(op.operationId)!;
        results.push(existing);
        continue;
      }

      // 2. Concurrency / Version check
      const entityKey = `${userId}:${op.entityType}:${op.entityId}`;
      const currentVer = this.entityVersions.get(entityKey) ?? 0;

      if (op.operationType === 'UPDATE' && op.entityVersion < currentVer) {
        const conflictRes: SyncOperationResult = {
          operationId: op.operationId,
          status: 'CONFLICT',
          error: `Stale version ${op.entityVersion}; server version is ${currentVer}`,
        };
        this.processedOperations.set(op.operationId, conflictRes);
        results.push(conflictRes);
        continue;
      }

      // 3. Apply mutation and advance revision sequence
      this.currentRevision += 1;
      const nextVer = Math.max(currentVer + 1, op.entityVersion);
      this.entityVersions.set(entityKey, nextVer);

      const changeItem: StoredChange = {
        userId,
        revision: this.currentRevision,
        entityType: op.entityType,
        entityId: op.entityId,
        operation: op.operationType,
        entityVersion: nextVer,
        payload: op.payload,
        changedAt: new Date().toISOString(),
      };

      this.changeLog.push(changeItem);

      const successRes: SyncOperationResult = {
        operationId: op.operationId,
        status: 'ACKNOWLEDGED',
        serverRevision: this.currentRevision,
      };

      this.processedOperations.set(op.operationId, successRes);
      results.push(successRes);
    }

    return {
      processed: results.length,
      results,
      latestRevision: this.currentRevision,
    };
  }

  async downloadChanges(
    userId: string,
    sinceRevision = 0,
    limit = 100,
  ): Promise<SyncDownloadResponse> {
    const userChanges = this.changeLog.filter(
      (c) => c.userId === userId && c.revision > sinceRevision,
    );

    const paged = userChanges.slice(0, limit);
    const hasMore = userChanges.length > limit;

    return {
      changes: paged.map(({ userId: _u, ...rest }) => rest),
      latestRevision: this.currentRevision,
      hasMore,
    };
  }
}
