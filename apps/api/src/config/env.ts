export type Env = {
  nodeEnv: string;
  port: number;
  host: string;
};

export function loadEnv(): Env {
  const port = Number(process.env.API_PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1) {
    throw new Error('API_PORT must be a positive integer');
  }

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port,
    host: process.env.API_HOST ?? '0.0.0.0',
  };
}
