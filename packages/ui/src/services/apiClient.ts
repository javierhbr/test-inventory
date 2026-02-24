import { TestDataRecord, User, UserProfile } from './types';

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(
  /\/$/,
  ''
);
const API_ENDPOINT = `${API_BASE_URL}/api`;
const TEST_DATA_ENDPOINT = `${API_BASE_URL}/api/test-data`;

async function invokeApi<T>(
  resource: string,
  action: string,
  payload?: unknown
): Promise<T> {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      resource,
      action,
      payload,
    }),
  });

  const parsed = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !parsed.success) {
    const errorMessage =
      parsed.success === false
        ? parsed.error.message
        : `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return parsed.data;
}

async function invokeRestApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'content-type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  const parsed = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !parsed.success) {
    const errorMessage =
      parsed.success === false
        ? parsed.error.message
        : `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return parsed.data;
}

export const authApi = {
  getProfiles: (): Promise<UserProfile[]> => invokeApi('auth', 'profiles'),
  login: (profile: UserProfile): Promise<User> =>
    invokeApi('auth', 'login', { profile }),
  oauthLogin: (provider: string): Promise<User> =>
    invokeApi('auth', 'oauthLogin', { provider }),
};

export const testDataApi = {
  list: (): Promise<TestDataRecord[]> => invokeRestApi(TEST_DATA_ENDPOINT),
  get: (id: string): Promise<TestDataRecord> =>
    invokeRestApi(`${TEST_DATA_ENDPOINT}/${encodeURIComponent(id)}`),
  create: (record: TestDataRecord): Promise<TestDataRecord> =>
    invokeRestApi(TEST_DATA_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(record),
    }),
  update: (record: TestDataRecord): Promise<TestDataRecord> =>
    invokeRestApi(`${TEST_DATA_ENDPOINT}/${encodeURIComponent(record.id)}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    }),
  delete: (id: string): Promise<{ id: string }> =>
    invokeRestApi(`${TEST_DATA_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    }),
  bulkDelete: (ids: string[]): Promise<{ deletedCount: number }> =>
    invokeRestApi(TEST_DATA_ENDPOINT, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),
  recondition: (id: string): Promise<TestDataRecord> =>
    invokeRestApi(
      `${TEST_DATA_ENDPOINT}/${encodeURIComponent(id)}/recondition`,
      {
        method: 'PATCH',
        body: JSON.stringify({}),
      }
    ),
};
