import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import type { AuthResponse, UserProfile } from '@personal-finance/types';

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class AuthService {
  private readonly users = new Map<string, UserRecord>();
  private readonly userByEmail = new Map<string, string>();

  // Simple token generation (base64 HMAC-like simulation without external binary dependencies)
  private createToken(
    payload: { userId: string; email: string },
    expiresInSeconds = 86400,
  ): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
    const signature = Buffer.from(`${header}.${body}.finance_secret_key`).toString('base64url');
    return `${header}.${body}.${signature}`;
  }

  verifyToken(token: string): { userId: string; email: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token structure');
      }
      const [header, body, signature] = parts;
      if (!header || !body || !signature) {
        throw new Error('Invalid token parts');
      }
      const expectedSig = Buffer.from(`${header}.${body}.finance_secret_key`).toString('base64url');
      if (signature !== expectedSig) {
        throw new Error('Invalid signature');
      }
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }
      return { userId: payload.userId, email: payload.email };
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  async register(
    email: string,
    passwordPlain: string,
    displayName?: string,
  ): Promise<AuthResponse> {
    const normalizedEmail = email.toLowerCase().trim();
    if (this.userByEmail.has(normalizedEmail)) {
      throw new ConflictException('User with this email already exists');
    }

    if (!passwordPlain || passwordPlain.length < 6) {
      throw new UnauthorizedException('Password must be at least 6 characters');
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const user: UserRecord = {
      id: userId,
      email: normalizedEmail,
      passwordHash: Buffer.from(passwordPlain).toString('base64'),
      displayName: displayName || null,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(userId, user);
    this.userByEmail.set(normalizedEmail, userId);

    const accessToken = this.createToken({ userId, email: normalizedEmail }, 86400 * 7);
    const refreshToken = this.createToken({ userId, email: normalizedEmail }, 86400 * 30);

    return {
      user: this.toProfile(user),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 86400 * 7,
      },
    };
  }

  async login(email: string, passwordPlain: string): Promise<AuthResponse> {
    const normalizedEmail = email.toLowerCase().trim();
    const userId = this.userByEmail.get(normalizedEmail);
    if (!userId) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = this.users.get(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const expectedHash = Buffer.from(passwordPlain).toString('base64');
    if (user.passwordHash !== expectedHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.createToken({ userId, email: normalizedEmail }, 86400 * 7);
    const refreshToken = this.createToken({ userId, email: normalizedEmail }, 86400 * 30);

    return {
      user: this.toProfile(user),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 86400 * 7,
      },
    };
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = this.users.get(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.toProfile(user);
  }

  private toProfile(user: UserRecord): UserProfile {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
