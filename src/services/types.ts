// Shared types for the application

export interface User {
  id: string;
  name: string;
  profile: UserProfile;
}

export type UserProfile = 'dev' | 'automation' | 'product' | 'admin';

export interface Test {
  id: string;
  name: string;
  flow: string;
  labels: {
    flujo: string;
    intent: string;
    experience: string;
    proyecto: string;
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
}

export interface TestData {
  id: string;
  accountId: string;
  referenceId: string;
  customerId: string;
  classification: string[];
  status: 'Disponible' | 'En uso' | 'Consumida' | 'Reacondicionamiento';
  createdAt: string;
  lastUsed: string | null;
  s3Location: {
    bucket: string;
    path: string;
  };
  metadata: {
    source: string;
    environment: string;
    region: string;
  };
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
    flujo: string;
    intent: string;
    experience: string;
    proyecto: string;
  };
  dataRequirements: string[];
  supportedRuntimes: string[];
}

export interface CreateTestDataFormData {
  accountId: string;
  referenceId: string;
  customerId: string;
  classification: string[];
  metadata: {
    source: string;
    environment: string;
    region: string;
  };
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
