export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';

export type SyncEntityType =
  | 'ACCOUNT'
  | 'CATEGORY'
  | 'TRANSACTION'
  | 'BUDGET'
  | 'RECURRING_RULE'
  | 'DEBT'
  | 'GOAL'
  | 'SETTINGS';

export type SyncOperationStatus =
  'PENDING' | 'UPLOADING' | 'ACKNOWLEDGED' | 'CONFLICT' | 'REJECTED';

export type SyncOperationRecord = {
  operationId: string;
  deviceId: string;
  userId?: string | null;
  entityType: SyncEntityType;
  entityId: string;
  operationType: SyncOperationType;
  entityVersion: number;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type SyncUploadBatchRequest = {
  deviceId: string;
  operations: SyncOperationRecord[];
};

export type SyncOperationResult = {
  operationId: string;
  status: SyncOperationStatus;
  serverRevision?: number;
  error?: string;
};

export type SyncUploadBatchResponse = {
  processed: number;
  results: SyncOperationResult[];
  latestRevision: number;
};

export type SyncChangeItem = {
  revision: number;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperationType;
  entityVersion: number;
  payload: Record<string, unknown>;
  changedAt: string;
};

export type SyncDownloadResponse = {
  changes: SyncChangeItem[];
  latestRevision: number;
  hasMore: boolean;
};
