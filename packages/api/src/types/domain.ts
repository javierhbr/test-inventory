export type UserProfile =
  | 'dev'
  | 'automation'
  | 'product'
  | 'qa_engineer'
  | 'admin';

export interface User {
  id: string;
  name: string;
  profile: UserProfile;
}

export interface Test {
  id: string;
  name: string;
  flow: string;
  labels: {
    flow: string;
    intent: string;
    experience: string;
    project: string;
  };
  dataRequirements: string[];
  supportedRuntimes: string[];
  lastExecution: {
    date: string;
    status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'BLOCKED';
    runtime: string;
  } | null;
  lastModified: string;
  version: string;
  team: string;
}

export interface TestDataRecord {
  id: string;
  customer: {
    customerId: string;
    name: string;
    type: string;
  };
  account: {
    accountId: string;
    referenceId: string;
    type: string;
    createdAt: string;
  };
  classifications: string[];
  labels: {
    project: string;
    environment: string;
    dataOwner: string;
    group?: string;
    source?: string;
  };
  scope: {
    visibility: 'manual' | 'automated' | 'platform';
    platforms?: string[];
  };
  status: 'Available' | 'In Use' | 'Consumed' | 'Reconditioning' | 'Inactive';
  lastUsed: {
    date: string;
    testId: string;
    runtime: string;
  } | null;
  team: string;
}

export interface ApiActionRequest {
  resource: string;
  action: string;
  payload?: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiActionResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
