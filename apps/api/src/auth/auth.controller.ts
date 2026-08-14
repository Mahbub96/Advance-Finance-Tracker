import { Controller, Post, Get, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard, type AuthenticatedRequest } from './jwt-auth.guard';
import type { AuthResponse, UserProfile } from '@personal-finance/types';

export type RegisterDto = {
  email: string;
  password: string;
  displayName?: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto): Promise<{ data: AuthResponse }> {
    const res = await this.authService.register(body.email, body.password, body.displayName);
    return { data: res };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto): Promise<{ data: AuthResponse }> {
    const res = await this.authService.login(body.email, body.password);
    return { data: res };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest): Promise<{ data: UserProfile }> {
    if (!req.user?.userId) {
      throw new Error('User context missing');
    }
    const profile = await this.authService.getProfile(req.user.userId);
    return { data: profile };
  }
}
