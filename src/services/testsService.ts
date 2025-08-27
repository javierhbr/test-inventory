// Tests service - handles all test-related business logic

import { Test, CreateTestFormData, FilterOptions } from './types';
import {
  generateId,
  filterItems,
  validateRequiredFields,
} from './utils';

// Mock test data
const mockTests: Test[] = [
  {
    id: 'TC-00123',
    name: 'Pago de tarjeta vencida con usuario autorizado',
    flow: 'Pago -> Validación -> Confirmación',
    labels: {
      flujo: 'Pago',
      intent: 'Negativo',
      experience: 'Mobile',
      proyecto: 'Release Q3',
    },
    dataRequirements: [
      'Cuenta vencida',
      'Usuario autorizado',
      'Tarjeta de crédito expirada',
    ],
    supportedRuntimes: ['OCP Testing Studio', 'Xero'],
    lastExecution: {
      date: '2025-08-15T10:30:00Z',
      status: 'FAILED',
      runtime: 'OCP Testing Studio',
    },
    lastModified: '2025-08-20T09:15:00Z',
    version: 'v1.2',
  },
  {
    id: 'TC-00145',
    name: 'Validación login con cuenta empresa activa',
    flow: 'Login -> Autenticación -> Dashboard',
    labels: {
      flujo: 'Login',
      intent: 'Positivo',
      experience: 'Web',
      proyecto: 'Core Banking',
    },
    dataRequirements: ['Cuenta empresa', 'Usuario principal'],
    supportedRuntimes: ['OCP Testing Studio', 'Sierra'],
    lastExecution: {
      date: '2025-08-18T14:22:00Z',
      status: 'PASSED',
      runtime: 'Sierra',
    },
    lastModified: '2025-08-19T16:45:00Z',
    version: 'v2.1',
  },
  {
    id: 'TC-00198',
    name: 'Transferencia entre cuentas propias',
    flow: 'Transferencia -> Validación -> Confirmación',
    labels: {
      flujo: 'Transferencia',
      intent: 'Positivo',
      experience: 'Mobile',
      proyecto: 'Release Q3',
    },
    dataRequirements: ['Cuenta activa', 'Usuario principal'],
    supportedRuntimes: ['OCP Testing Studio', 'Xero', 'Sierra'],
    lastExecution: null,
    lastModified: '2025-08-20T11:30:00Z',
    version: 'v1.0',
  },
  {
    id: 'TC-00234',
    name: 'Consulta de saldo con múltiples cuentas',
    flow: 'Consulta -> Autenticación -> Listado',
    labels: {
      flujo: 'Consulta',
      intent: 'Positivo',
      experience: 'Mobile',
      proyecto: 'Core Banking',
    },
    dataRequirements: ['Cuenta activa', 'Usuario autorizado', 'Cuenta empresa'],
    supportedRuntimes: ['OCP Testing Studio', 'Sierra'],
    lastExecution: {
      date: '2025-08-19T15:45:00Z',
      status: 'PASSED',
      runtime: 'OCP Testing Studio',
    },
    lastModified: '2025-08-20T08:30:00Z',
    version: 'v1.1',
  },
  {
    id: 'TC-00267',
    name: 'Activación de tarjeta de crédito nueva',
    flow: 'Activación -> Validación -> Confirmación',
    labels: {
      flujo: 'Activación',
      intent: 'Positivo',
      experience: 'Web',
      proyecto: 'Release Q3',
    },
    dataRequirements: [
      'Tarjeta de crédito expirada',
      'Usuario principal',
      'Cuenta activa',
    ],
    supportedRuntimes: ['Xero', 'Sierra'],
    lastExecution: {
      date: '2025-08-17T11:20:00Z',
      status: 'BLOCKED',
      runtime: 'Xero',
    },
    lastModified: '2025-08-20T14:15:00Z',
    version: 'v2.0',
  },
];

/**
 * Fetches all tests
 */
export async function getAllTests(): Promise<Test[]> {
  // Simulate API call
  return new Promise(resolve => {
    setTimeout(() => resolve([...mockTests]), 500);
  });
}

/**
 * Fetches a single test by ID
 */
export async function getTestById(id: string): Promise<Test | null> {
  return new Promise(resolve => {
    setTimeout(() => {
      const test = mockTests.find(t => t.id === id);
      resolve(test || null);
    }, 300);
  });
}

/**
 * Filters tests based on search criteria
 */
export function filterTests(tests: Test[], filters: FilterOptions): Test[] {
  const searchFields: (keyof Test)[] = ['name', 'id', 'flow'];

  return filterItems(tests, filters, searchFields).filter(test => {
    // Additional custom filtering logic
    if (
      filters.flujo &&
      filters.flujo !== 'all' &&
      test.labels.flujo !== filters.flujo
    ) {
      return false;
    }

    if (filters.status && filters.status !== 'all') {
      const hasExecution = test.lastExecution !== null;
      switch (filters.status) {
        case 'passed':
          return hasExecution && test.lastExecution?.status === 'PASSED';
        case 'failed':
          return hasExecution && test.lastExecution?.status === 'FAILED';
        case 'never':
          return !hasExecution;
        default:
          return true;
      }
    }

    if (filters.runtime && filters.runtime !== 'all') {
      return test.supportedRuntimes.includes(filters.runtime);
    }

    return true;
  });
}

/**
 * Creates a new test
 */
export async function createTest(testData: CreateTestFormData): Promise<Test> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validate required fields
      const validation = validateRequiredFields(testData, [
        'name',
        'flow',
        'labels',
        'dataRequirements',
        'supportedRuntimes',
      ]);

      if (!validation.isValid) {
        reject(
          new Error(
            `Campos requeridos faltantes: ${validation.missingFields.join(', ')}`
          )
        );
        return;
      }

      const newTest: Test = {
        id: generateId('TC'),
        name: testData.name,
        flow: testData.flow,
        labels: testData.labels,
        dataRequirements: testData.dataRequirements,
        supportedRuntimes: testData.supportedRuntimes,
        lastExecution: null,
        lastModified: new Date().toISOString(),
        version: 'v1.0',
      };

      mockTests.push(newTest);
      resolve(newTest);
    }, 1000);
  });
}

/**
 * Updates an existing test
 */
export async function updateTest(
  id: string,
  updates: Partial<Test>
): Promise<Test> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTests.findIndex(t => t.id === id);
      if (index === -1) {
        reject(new Error('Test no encontrado'));
        return;
      }

      mockTests[index] = {
        ...mockTests[index],
        ...updates,
        lastModified: new Date().toISOString(),
      };

      resolve(mockTests[index]);
    }, 800);
  });
}

/**
 * Deletes a test
 */
export async function deleteTest(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTests.findIndex(t => t.id === id);
      if (index === -1) {
        reject(new Error('Test no encontrado'));
        return;
      }

      mockTests.splice(index, 1);
      resolve();
    }, 500);
  });
}

/**
 * Gets available filter options
 */
export function getFilterOptions(): {
  flujos: string[];
  statuses: string[];
  runtimes: string[];
} {
  const flujos = [...new Set(mockTests.map(t => t.labels.flujo))];
  const statuses = ['passed', 'failed', 'never'];
  const runtimes = [...new Set(mockTests.flatMap(t => t.supportedRuntimes))];

  return { flujos, statuses, runtimes };
}

/**
 * Exports tests to YAML format
 */
export function exportTestsToYaml(tests: Test[]): string {
  const yamlContent = tests
    .map(
      test => `
id: ${test.id}
name: ${test.name}
flow: ${test.flow}
labels:
  flujo: ${test.labels.flujo}
  intent: ${test.labels.intent}
  experience: ${test.labels.experience}
  proyecto: ${test.labels.proyecto}
dataRequirements:
${test.dataRequirements.map(req => `  - ${req}`).join('\n')}
supportedRuntimes:
${test.supportedRuntimes.map(runtime => `  - ${runtime}`).join('\n')}
version: ${test.version}
lastModified: ${test.lastModified}
`
    )
    .join('\n---\n');

  return `# Tests Export\n# Generated on: ${new Date().toISOString()}\n\n${yamlContent}`;
}

/**
 * Gets test statistics
 */
export function getTestStatistics(tests: Test[]): {
  total: number;
  passed: number;
  failed: number;
  neverRun: number;
  byFlujo: Record<string, number>;
  byRuntime: Record<string, number>;
} {
  const stats = {
    total: tests.length,
    passed: 0,
    failed: 0,
    neverRun: 0,
    byFlujo: {} as Record<string, number>,
    byRuntime: {} as Record<string, number>,
  };

  tests.forEach(test => {
    // Execution stats
    if (!test.lastExecution) {
      stats.neverRun++;
    } else if (test.lastExecution.status === 'PASSED') {
      stats.passed++;
    } else if (test.lastExecution.status === 'FAILED') {
      stats.failed++;
    }

    // Flujo stats
    const flujo = test.labels.flujo;
    stats.byFlujo[flujo] = (stats.byFlujo[flujo] || 0) + 1;

    // Runtime stats
    test.supportedRuntimes.forEach(runtime => {
      stats.byRuntime[runtime] = (stats.byRuntime[runtime] || 0) + 1;
    });
  });

  return stats;
}

/**
 * Validates test data requirements against available test data
 */
export function validateTestDataRequirements(
  test: Test,
  availableClassifications: string[]
): {
  isValid: boolean;
  missingRequirements: string[];
} {
  const missingRequirements = test.dataRequirements.filter(
    req => !availableClassifications.includes(req)
  );

  return {
    isValid: missingRequirements.length === 0,
    missingRequirements,
  };
}
