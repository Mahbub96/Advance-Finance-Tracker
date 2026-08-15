import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  it('registers and logs in through Nest dependency injection', async () => {
    const email = 'controller-auth@example.com';
    const password = 'password123';

    const register = await controller.register({
      email,
      password,
      displayName: 'Controller Auth',
    });

    expect(register.data.user.email).toBe(email);
    expect(register.data.tokens.accessToken).toBeDefined();

    const login = await controller.login({ email, password });

    expect(login.data.user.email).toBe(email);
    expect(login.data.tokens.accessToken).toBeDefined();
  });
});
