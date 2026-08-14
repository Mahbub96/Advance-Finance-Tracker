import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';

interface HttpRequest {
  method: string;
  originalUrl: string;
  url: string;
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
}

interface HttpResponse {
  statusCode: number;
  on(event: string, callback: () => void): void;
}

async function bootstrap() {
  const env = loadEnv();
  const logger = new Logger('API_DEBUG');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Request & Action Debugger Middleware
  app.use((req: HttpRequest, res: HttpResponse, next: () => void) => {
    const start = Date.now();
    const { method, originalUrl, ip, headers, query, body } = req;
    const clientIp = ip || (headers['x-forwarded-for'] as string) || '127.0.0.1';

    if (env.debug) {
      const sanitizedBody = body ? { ...body } : undefined;
      if (sanitizedBody && typeof sanitizedBody === 'object' && 'password' in sanitizedBody) {
        sanitizedBody.password = '******';
      }

      logger.log(`📥 [INCOMING ${method}] ${originalUrl} | Client: ${clientIp}`);
      if (query && Object.keys(query).length > 0) {
        logger.debug(`   Query Params: ${JSON.stringify(query)}`);
      }
      if (sanitizedBody && Object.keys(sanitizedBody).length > 0) {
        logger.debug(`   Payload: ${JSON.stringify(sanitizedBody, null, 2)}`);
      }
    }

    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const statusIcon = statusCode >= 400 ? '❌' : '✅';
      const logMessage = `📤 [OUTGOING ${statusIcon} ${statusCode}] ${method} ${originalUrl} +${duration}ms`;

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
  Logger.log(
    `🚀 API Server running on http://${env.host}:${env.port}/api/v1 (DEBUG_MODE: ${env.debug ? 'ON ✅' : 'OFF ❌'})`,
    'Bootstrap',
  );
}

void bootstrap();
