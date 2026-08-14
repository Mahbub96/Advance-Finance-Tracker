import { SyncService } from './sync.service';

describe('SyncService', () => {
  let syncService: SyncService;

  beforeEach(() => {
    syncService = new SyncService();
  });

  it('processes batch upload operations and increments revision sequence', async () => {
    const uploadRes = await syncService.uploadBatch('user-1', {
      deviceId: 'device-1',
      operations: [
        {
          operationId: 'op-1',
          deviceId: 'device-1',
          entityType: 'TRANSACTION',
          entityId: 'tx-1',
          operationType: 'CREATE',
          entityVersion: 1,
          payload: { amount: '500.00', currency: 'BDT' },
          createdAt: new Date().toISOString(),
        },
      ],
    });

    expect(uploadRes.processed).toBe(1);
    expect(uploadRes.results[0]!.status).toBe('ACKNOWLEDGED');
    expect(uploadRes.latestRevision).toBeGreaterThan(1000);
  });

  it('is idempotent when re-uploading the same operationId', async () => {
    const op = {
      operationId: 'op-idem',
      deviceId: 'device-1',
      entityType: 'ACCOUNT' as const,
      entityId: 'acc-1',
      operationType: 'CREATE' as const,
      entityVersion: 1,
      payload: { name: 'bKash' },
      createdAt: new Date().toISOString(),
    };

    const first = await syncService.uploadBatch('user-1', {
      deviceId: 'device-1',
      operations: [op],
    });

    const second = await syncService.uploadBatch('user-1', {
      deviceId: 'device-1',
      operations: [op],
    });

    expect(second.results[0]!.status).toBe('ACKNOWLEDGED');
    expect(second.results[0]!.serverRevision).toBe(first.results[0]!.serverRevision);
  });

  it('downloads changes since specified cursor revision', async () => {
    await syncService.uploadBatch('user-1', {
      deviceId: 'device-1',
      operations: [
        {
          operationId: 'op-dl-1',
          deviceId: 'device-1',
          entityType: 'BUDGET',
          entityId: 'b-1',
          operationType: 'CREATE',
          entityVersion: 1,
          payload: { name: 'Dining' },
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const changes = await syncService.downloadChanges('user-1', 0);
    expect(changes.changes.length).toBeGreaterThan(0);
    expect(changes.changes[0]!.entityId).toBe('b-1');
  });
});
