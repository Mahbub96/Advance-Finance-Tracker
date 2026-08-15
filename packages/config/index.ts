/**
 * =======================================================================
 * CENTRAL ENVIRONMENT CONFIGURATION (SINGLE SOURCE OF TRUTH)
 * Change the host, port, or protocol here to reflect across the entire app.
 * =======================================================================
 */
export const SERVER_HOST = 'finance-tracker-api.mahbub.dev';
export const SERVER_PORT = 443;
export const API_VERSION_PREFIX = '/api/v1';

export const DEFAULT_API_HOST = SERVER_HOST;
export const DEFAULT_API_PORT = SERVER_PORT;
export const DEFAULT_API_URL = `https://${SERVER_HOST}${API_VERSION_PREFIX}`;

export interface AppEnvironment {
  nodeEnv: 'development' | 'production' | 'test';
  apiUrl: string;
  apiPort: number;
  apiHost: string;
}

export function getAppConfig(): AppEnvironment {
  const port = Number(process.env.API_PORT ?? DEFAULT_API_PORT);
  const host = process.env.API_HOST ?? DEFAULT_API_HOST;
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.API_URL ??
    (process.env.API_PORT || process.env.API_HOST
      ? `http://${host === '0.0.0.0' ? DEFAULT_API_HOST : host}:${port}${API_VERSION_PREFIX}`
      : DEFAULT_API_URL);

  return {
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') ?? 'development',
    apiUrl,
    apiPort: port,
    apiHost: host,
  };
}
