import { Test } from '@nestjs/testing';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { AuthService } from '../auth/auth.service';

describe('SyncController', () => {
  let controller: SyncController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SyncController],
      providers: [SyncService, AuthService],
    }).compile();

    controller = moduleRef.get(SyncController);
    authService = moduleRef.get(AuthService);
  });

  it('uses bearer token identity for upload and download instead of default local user', async () => {
    const auth = await authService.register('sync-user@example.com', 'secret123');
    const req = {
      headers: {
        authorization: `Bearer ${auth.tokens.accessToken}`,
      },
    };

    const upload = await controller.upload(req, {
      deviceId: 'test-device',
      operations: [
        {
          operationId: 'op-account-delete-1',
          deviceId: 'test-device',
          entityType: 'ACCOUNT',
          entityId: 'account-1',
          operationType: 'DELETE',
          entityVersion: 1,
          payload: { id: 'account-1', deleted_at: '2026-08-15T00:00:00.000Z' },
          createdAt: '2026-08-15T00:00:00.000Z',
        },
      ],
    });

    const authenticatedDownload = await controller.download(req, '0', '100');
    const defaultLocalDownload = await controller.download({ headers: {} }, '0', '100');

    expect(upload.processed).toBe(1);
    expect(authenticatedDownload.changes).toHaveLength(1);
    expect(authenticatedDownload.changes[0]).toMatchObject({
      entityType: 'ACCOUNT',
      entityId: 'account-1',
      operation: 'DELETE',
    });
    expect(defaultLocalDownload.changes).toHaveLength(0);
  });
});
