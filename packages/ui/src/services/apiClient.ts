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

export const authApi = {
  getProfiles: (): Promise<UserProfile[]> => invokeApi('auth', 'profiles'),
  login: (profile: UserProfile): Promise<User> =>
    invokeApi('auth', 'login', { profile }),
  oauthLogin: (provider: string): Promise<User> =>
    invokeApi('auth', 'oauthLogin', { provider }),
};

export const testDataApi = {
  list: (): Promise<TestDataRecord[]> => invokeApi('testData', 'list'),
  create: (record: TestDataRecord): Promise<TestDataRecord> =>
    invokeApi('testData', 'create', record),
  update: (record: TestDataRecord): Promise<TestDataRecord> =>
    invokeApi('testData', 'update', record),
  delete: (id: string): Promise<{ id: string }> =>
    invokeApi('testData', 'delete', { id }),
  bulkDelete: (ids: string[]): Promise<{ deletedCount: number }> =>
    invokeApi('testData', 'bulkDelete', { ids }),
  recondition: (id: string): Promise<TestDataRecord> =>
    invokeApi('testData', 'recondition', { id }),
};
