import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';

interface HttpRequest {
  method: string;
  originalUrl: string;
  ip?: string;
}

interface HttpResponse {
  statusCode: number;
  on(event: string, callback: () => void): void;
}

async function bootstrap() {
  const env = loadEnv();
  const logger = new Logger('HTTP');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Request logger middleware
  app.use((req: HttpRequest, res: HttpResponse, next: () => void) => {
    const start = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const logMessage = `${method} ${originalUrl} ${statusCode} +${duration}ms [${ip || 'unknown'}]`;

      if (statusCode >= 500) {
        logger.error(logMessage);
      } else if (statusCode >= 400) {
        logger.warn(logMessage);
      } else {
        logger.log(logMessage);
      }
    });

    next();
  });

  app.setGlobalPrefix('api/v1');

  await app.listen(env.port, env.host);
  Logger.log(`🚀 API Server running on http://${env.host}:${env.port}/api/v1`, 'Bootstrap');
}

void bootstrap();
