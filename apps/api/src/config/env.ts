import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DEFAULT_API_PORT } from '@personal-finance/config';

export type Env = {
  nodeEnv: string;
  port: number;
  host: string;
  debug: boolean;
};

function parseEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};

  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .reduce<Record<string, string>>((values, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return values;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) return values;

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      if (!key) return values;

      values[key] = rawValue.replace(/^['"]|['"]$/g, '');
      return values;
    }, {});
}

function loadEnvFiles(): void {
  const fileValues = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), 'apps/api/.env'),
    resolve(__dirname, '../../../../.env'),
    resolve(__dirname, '../../.env'),
  ].reduce<Record<string, string>>(
    (values, path) => ({
      ...values,
      ...parseEnvFile(path),
    }),
    {},
  );

  for (const [key, value] of Object.entries(fileValues)) {
    process.env[key] ??= value;
  }
}

export function loadEnv(): Env {
  loadEnvFiles();

  const port = Number(process.env.API_PORT ?? DEFAULT_API_PORT);
  if (!Number.isInteger(port) || port < 1) {
    throw new Error('API_PORT must be a positive integer');
  }

  const debug =
    process.env.DEBUG === 'true' ||
    process.env.API_DEBUG === 'true' ||
    process.env.NODE_ENV !== 'production';

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port,
    host: process.env.API_HOST ?? '0.0.0.0',
    debug,
  };
}
