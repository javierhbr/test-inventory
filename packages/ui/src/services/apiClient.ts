import {
  AssignedTestData,
  CreateTestDataPayload,
  Test,
  TestDataRecord,
  User,
  UserProfile,
} from './types';

import type {
  GroupedDsls,
  GroupedRecipes,
  LobConfigurationSections,
} from './configService';

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
const TEST_CATALOG_ENDPOINT = `${API_BASE_URL}/api/test-catalog`;
const TEST_DATA_ENDPOINT = `${API_BASE_URL}/api/test-data`;
const EXECUTION_ENDPOINT = `${API_BASE_URL}/api/execution`;
const DSL_ENDPOINT = `${API_BASE_URL}/api/dsls`;

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
  create: (payload: CreateTestDataPayload): Promise<TestDataRecord> =>
    invokeRestApi(TEST_DATA_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
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

export const testCatalogApi = {
  list: (): Promise<Test[]> => invokeRestApi(TEST_CATALOG_ENDPOINT),
  get: (id: string): Promise<Test> =>
    invokeRestApi(`${TEST_CATALOG_ENDPOINT}/${encodeURIComponent(id)}`),
  create: (record: Test): Promise<Test> =>
    invokeRestApi(TEST_CATALOG_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(record),
    }),
  update: (record: Test): Promise<Test> =>
    invokeRestApi(`${TEST_CATALOG_ENDPOINT}/${encodeURIComponent(record.id)}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    }),
  delete: (id: string): Promise<{ id: string }> =>
    invokeRestApi(`${TEST_CATALOG_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    }),
  bulkDelete: (ids: string[]): Promise<{ deletedCount: number }> =>
    invokeRestApi(TEST_CATALOG_ENDPOINT, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),
};

export const executionApi = {
  listTests: (): Promise<Test[]> =>
    invokeRestApi(`${EXECUTION_ENDPOINT}/tests`),
  listTestData: (): Promise<TestDataRecord[]> =>
    invokeRestApi(`${EXECUTION_ENDPOINT}/test-data`),
  importCsv: (
    csvContent: string
  ): Promise<{ tests: Test[]; invalidTestIds: string[] }> =>
    invokeRestApi(`${EXECUTION_ENDPOINT}/import-csv`, {
      method: 'POST',
      body: JSON.stringify({ csvContent }),
    }),
  assignTestData: (
    tests: Array<{ id: string; dataRequirements: string[] }>
  ): Promise<{
    assignments: Array<{
      testId: string;
      assignedTestData: AssignedTestData | null;
    }>;
  }> =>
    invokeRestApi(`${EXECUTION_ENDPOINT}/assign-test-data`, {
      method: 'POST',
      body: JSON.stringify({ tests }),
    }),
};

export const configApi = {
  load: (): Promise<{
    grouped: GroupedDsls;
    recipes: GroupedRecipes;
    lobConfig: LobConfigurationSections;
  }> => invokeRestApi(DSL_ENDPOINT),

  loadByLob: (
    lob: string
  ): Promise<{
    grouped: GroupedDsls;
    recipes: GroupedRecipes;
    lobConfig: LobConfigurationSections;
  }> => invokeRestApi(`${DSL_ENDPOINT}?lob=${encodeURIComponent(lob)}`),

  saveDsls: (
    grouped: GroupedDsls,
    recipes: GroupedRecipes
  ): Promise<{ grouped: GroupedDsls; recipes: GroupedRecipes }> =>
    invokeRestApi(DSL_ENDPOINT, {
      method: 'PUT',
      body: JSON.stringify({ grouped, recipes }),
    }),

  saveLobConfig: (
    lobConfig: LobConfigurationSections
  ): Promise<LobConfigurationSections> =>
    invokeRestApi(`${DSL_ENDPOINT}/lob-config`, {
      method: 'PUT',
      body: JSON.stringify(lobConfig),
    }),
};
