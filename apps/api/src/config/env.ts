export type Env = {
  nodeEnv: string;
  port: number;
  host: string;
  debug: boolean;
};

export function loadEnv(): Env {
  const port = Number(process.env.API_PORT ?? 3000);
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
