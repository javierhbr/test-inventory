// Shared types for the application

export const LOB_VALUES = ['CARD', 'BANK', 'FS', 'DFS'] as const;
export type Lob = (typeof LOB_VALUES)[number];

export interface User {
  id: string;
  name: string;
  profile: UserProfile;
  lob: Lob;
}

export type UserProfile =
  | 'dev'
  | 'automation'
  | 'product'
  | 'qa_engineer'
  | 'admin';

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
  lob: Lob;
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
  lob: Lob;
  reconditioningSchedule: {
    month?: number;
    days?: number;
    year?: number;
  } | null;
}

export interface AssignedTestData {
  id: string;
  accountId: string;
  referenceId: string;
  customerId: string;
  assignedAt: string;
  status: string;
}

export interface CartItem {
  test: Test;
  assignedTestData?: AssignedTestData;
}

export interface CreateTestFormData {
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
  lob: Lob;
  [key: string]: unknown;
}

export interface CreateTestDataPayload {
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
  recipeId?: string;
  lob: Lob;
}

export interface FilterOptions {
  searchTerm: string;
  [key: string]: string | string[];
}

export interface ExecutionConfig {
  runtime: string;
  tests: CartItem[];
}

export interface YamlGenerationOptions {
  cart: CartItem[];
  selectedRuntime: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface UserPermissions {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
}

// --- Hydrated DSL types (client-side only) ---

export interface SemanticRule {
  key: string;
  regex: RegExp;
  parse: (match: RegExpMatchArray) => Record<string, string>;
  format: (parsed: Record<string, string>) => string;
  suggestions: string[];
}

export interface DslList {
  lob: Lob;
  type: 'flavor' | 'recon';
  items: SemanticRule[];
}
