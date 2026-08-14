export const DEFAULT_API_PORT = 3000;
export const DEFAULT_API_HOST = '0.0.0.0';
export const DEFAULT_API_URL = 'http://localhost:3000/api/v1';

export interface AppEnvironment {
  nodeEnv: 'development' | 'production' | 'test';
  apiUrl: string;
  apiPort: number;
}

export function getAppConfig(): AppEnvironment {
  const port = Number(process.env.API_PORT ?? DEFAULT_API_PORT);
  const host = process.env.API_HOST ?? DEFAULT_API_HOST;
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.API_URL ??
    `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/api/v1`;

  return {
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') ?? 'development',
    apiUrl,
    apiPort: port,
  };
}
