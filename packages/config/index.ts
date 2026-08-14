export const DEFAULT_API_PORT = 5500;
export const DEFAULT_API_HOST = '140.245.217.109';
export const DEFAULT_API_URL = 'http://140.245.217.109:5500/api/v1';

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
    (process.env.API_PORT || process.env.API_HOST
      ? `http://${host === '0.0.0.0' ? '140.245.217.109' : host}:${port}/api/v1`
      : DEFAULT_API_URL);

  return {
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') ?? 'development',
    apiUrl,
    apiPort: port,
  };
}
