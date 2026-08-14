import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it('registers a new user and generates JWT tokens', async () => {
    const res = await authService.register('ahmed@example.com', 'password123', 'Ahmed');
    expect(res.user.email).toBe('ahmed@example.com');
    expect(res.user.displayName).toBe('Ahmed');
    expect(res.tokens.accessToken).toBeDefined();
  });

  it('rejects duplicate email registrations', async () => {
    await authService.register('ahmed@example.com', 'password123');
    await expect(authService.register('ahmed@example.com', 'password456')).rejects.toThrow();
  });

  it('authenticates existing user on login', async () => {
    await authService.register('ahmed@example.com', 'password123');
    const loginRes = await authService.login('ahmed@example.com', 'password123');
    expect(loginRes.user.email).toBe('ahmed@example.com');
    expect(loginRes.tokens.accessToken).toBeDefined();
  });

  it('validates and extracts user payload from token', async () => {
    const res = await authService.register('ahmed@example.com', 'password123');
    const payload = authService.verifyToken(res.tokens.accessToken);
    expect(payload.userId).toBe(res.user.id);
    expect(payload.email).toBe('ahmed@example.com');
  });
});
