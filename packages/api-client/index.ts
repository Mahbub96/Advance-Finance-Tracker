import type {
  AuthResponse,
  UserProfile,
  SyncDownloadResponse,
  SyncUploadBatchRequest,
  SyncUploadBatchResponse,
  LendingEmailPreviewRequest,
  LendingEmailPreviewResponse,
  DataDeletionPreviewRequest,
  DataDeletionPreviewResponse,
  DataDeletionExecuteRequest,
  DataDeletionExecuteResponse,
} from '@personal-finance/types';
import { DEFAULT_API_URL } from '@personal-finance/config';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  timestamp?: string;
  uptime?: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiClientConfig {
  baseUrl?: string;
  timeoutMs?: number;
  getAuthToken?: () => Promise<string | null> | string | null;
}

type ApiEnvelope<T> = {
  data: T;
};

export class ApiClient {
  private baseUrl: string;
  private timeoutMs: number;
  private getAuthToken?: () => Promise<string | null> | string | null;

  constructor(config: ApiClientConfig = {}) {
    // Default fallback to centrally configured API URL
    this.baseUrl = config.baseUrl?.replace(/\/$/, '') || DEFAULT_API_URL;
    this.timeoutMs = config.timeoutMs ?? 10000;
    this.getAuthToken = config.getAuthToken;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken ? await this.getAuthToken() : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!res.ok) {
        let errMsg = `API error: ${res.status} ${res.statusText}`;
        try {
          const errorData = await res.json();
          errMsg = errorData.message || errMsg;
        } catch {
          // Fallback to HTTP error
        }
        throw new Error(errMsg);
      }

      const payload = (await res.json()) as T | ApiEnvelope<T>;
      if (
        payload &&
        typeof payload === 'object' &&
        'data' in payload &&
        Object.keys(payload).length === 1
      ) {
        return payload.data;
      }

      return payload as T;
    } finally {
      clearTimeout(timer);
    }
  }

  /** Health & readiness checks */
  async health(): Promise<HealthCheckResult> {
    return this.fetch<HealthCheckResult>('/health');
  }

  /** Authentication APIs */
  readonly auth = {
    register: async (dto: RegisterPayload): Promise<AuthResponse> => {
      return this.fetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    },

    login: async (dto: LoginPayload): Promise<AuthResponse> => {
      return this.fetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    },

    me: async (): Promise<UserProfile> => {
      return this.fetch<UserProfile>('/auth/me');
    },
  };

  /** Sync APIs */
  readonly sync = {
    upload: async (payload: SyncUploadBatchRequest): Promise<SyncUploadBatchResponse> => {
      return this.fetch<SyncUploadBatchResponse>('/sync/upload', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    uploadBatch: async (payload: SyncUploadBatchRequest): Promise<SyncUploadBatchResponse> => {
      return this.fetch<SyncUploadBatchResponse>('/sync/upload', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    download: async (since?: string | number, limit?: number): Promise<SyncDownloadResponse> => {
      const params = new URLSearchParams();
      if (since !== undefined) params.append('since', String(since));
      if (limit !== undefined) params.append('limit', String(limit));
      const query = params.toString() ? `?${params.toString()}` : '';
      return this.fetch<SyncDownloadResponse>(`/sync/download${query}`);
    },
  };

  /** Lending reminder preview & scheduling APIs */
  readonly lending = {
    previewReminder: async (
      payload: LendingEmailPreviewRequest,
    ): Promise<LendingEmailPreviewResponse> => {
      return this.fetch<LendingEmailPreviewResponse>('/lending/reminder/preview', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };

  /** High-risk secure data deletion APIs */
  readonly dataDeletion = {
    preview: async (
      payload: DataDeletionPreviewRequest,
    ): Promise<DataDeletionPreviewResponse> => {
      return this.fetch<DataDeletionPreviewResponse>('/data-deletion/preview', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    execute: async (
      payload: DataDeletionExecuteRequest,
    ): Promise<DataDeletionExecuteResponse> => {
      return this.fetch<DataDeletionExecuteResponse>('/data-deletion/execute', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };
}

export function createApiClient(config: ApiClientConfig = {}): ApiClient {
  return new ApiClient(config);
}
