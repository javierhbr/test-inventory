// Test Data service - handles all test data-related business logic

import { TestData, CreateTestDataFormData, FilterOptions } from './types';
import {
  generateId,
  filterItems,
  validateRequiredFields,
} from './utils';

// Mock test data
const mockTestData: TestData[] = [
  {
    id: 'TD-45123',
    accountId: 'ACC-45123',
    referenceId: 'REF-ACC-45123',
    customerId: 'CUST-78901',
    classification: ['Cuenta activa', 'Usuario principal'],
    status: 'Disponible',
    createdAt: '2025-08-18T09:30:00Z',
    lastUsed: null,
    s3Location: {
      bucket: 'test-data-storage',
      path: 'banking/accounts/active/ACC-45123.json',
    },
    metadata: {
      source: 'API Generator',
      environment: 'Staging',
      region: 'us-east-1',
    },
  },
  {
    id: 'TD-45124',
    accountId: 'ACC-45124',
    referenceId: 'REF-ACC-45124',
    customerId: 'CUST-78902',
    classification: ['Cuenta empresa', 'Usuario autorizado'],
    status: 'En uso',
    createdAt: '2025-08-17T14:15:00Z',
    lastUsed: '2025-08-20T10:22:00Z',
    s3Location: {
      bucket: 'test-data-storage',
      path: 'banking/accounts/enterprise/ACC-45124.json',
    },
    metadata: {
      source: 'Database Export',
      environment: 'Production Clone',
      region: 'us-east-1',
    },
  },
  {
    id: 'TD-45125',
    accountId: 'ACC-45125',
    referenceId: 'REF-ACC-45125',
    customerId: 'CUST-78903',
    classification: ['Cuenta vencida', 'Tarjeta de crédito expirada'],
    status: 'Consumida',
    createdAt: '2025-08-16T11:45:00Z',
    lastUsed: '2025-08-19T16:30:00Z',
    s3Location: {
      bucket: 'test-data-storage',
      path: 'banking/accounts/expired/ACC-45125.json',
    },
    metadata: {
      source: 'Manual Creation',
      environment: 'Testing',
      region: 'us-west-2',
    },
  },
  {
    id: 'TD-45126',
    accountId: 'ACC-45126',
    referenceId: 'REF-ACC-45126',
    customerId: 'CUST-78904',
    classification: ['Cuenta activa', 'Usuario autorizado'],
    status: 'Reacondicionamiento',
    createdAt: '2025-08-15T08:20:00Z',
    lastUsed: '2025-08-18T13:45:00Z',
    s3Location: {
      bucket: 'test-data-storage',
      path: 'banking/accounts/active/ACC-45126.json',
    },
    metadata: {
      source: 'API Generator',
      environment: 'Staging',
      region: 'us-east-1',
    },
  },
  {
    id: 'TD-45127',
    accountId: 'ACC-45127',
    referenceId: 'REF-ACC-45127',
    customerId: 'CUST-78905',
    classification: ['Cuenta corriente', 'Usuario principal'],
    status: 'Disponible',
    createdAt: '2025-08-19T12:10:00Z',
    lastUsed: null,
    s3Location: {
      bucket: 'test-data-storage',
      path: 'banking/accounts/checking/ACC-45127.json',
    },
    metadata: {
      source: 'Database Export',
      environment: 'Production Clone',
      region: 'us-east-1',
    },
  },
];

/**
 * Fetches all test data
 */
export async function getAllTestData(): Promise<TestData[]> {
  return new Promise(resolve => {
    setTimeout(() => resolve([...mockTestData]), 500);
  });
}

/**
 * Fetches a single test data by ID
 */
export async function getTestDataById(id: string): Promise<TestData | null> {
  return new Promise(resolve => {
    setTimeout(() => {
      const testData = mockTestData.find(td => td.id === id);
      resolve(testData || null);
    }, 300);
  });
}

/**
 * Filters test data based on search criteria
 */
export function filterTestData(
  testData: TestData[],
  filters: FilterOptions
): TestData[] {
  const searchFields: (keyof TestData)[] = [
    'id',
    'accountId',
    'referenceId',
    'customerId',
  ];

  return filterItems(testData, filters, searchFields).filter(data => {
    // Additional custom filtering logic
    if (
      filters.status &&
      filters.status !== 'all' &&
      data.status !== filters.status
    ) {
      return false;
    }

    if (filters.classification && filters.classification !== 'all') {
      return data.classification.includes(filters.classification);
    }

    if (
      filters.source &&
      filters.source !== 'all' &&
      data.metadata.source !== filters.source
    ) {
      return false;
    }

    if (
      filters.environment &&
      filters.environment !== 'all' &&
      data.metadata.environment !== filters.environment
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Creates new test data
 */
export async function createTestData(
  formData: CreateTestDataFormData
): Promise<TestData> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validate required fields
      const validation = validateRequiredFields(formData, [
        'accountId',
        'referenceId',
        'customerId',
        'classification',
      ]);

      if (!validation.isValid) {
        reject(
          new Error(
            `Campos requeridos faltantes: ${validation.missingFields.join(', ')}`
          )
        );
        return;
      }

      const newTestData: TestData = {
        id: generateId('TD'),
        accountId: formData.accountId,
        referenceId: formData.referenceId,
        customerId: formData.customerId,
        classification: formData.classification,
        status: 'Disponible',
        createdAt: new Date().toISOString(),
        lastUsed: null,
        s3Location: {
          bucket: 'test-data-storage',
          path: `banking/accounts/generated/${formData.accountId}.json`,
        },
        metadata: formData.metadata,
      };

      mockTestData.push(newTestData);
      resolve(newTestData);
    }, 1000);
  });
}

/**
 * Updates test data status
 */
export async function updateTestDataStatus(
  id: string,
  status: TestData['status']
): Promise<TestData> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTestData.findIndex(td => td.id === id);
      if (index === -1) {
        reject(new Error('Test data no encontrado'));
        return;
      }

      mockTestData[index] = {
        ...mockTestData[index],
        status,
        lastUsed:
          status === 'En uso'
            ? new Date().toISOString()
            : mockTestData[index].lastUsed,
      };

      resolve(mockTestData[index]);
    }, 500);
  });
}

/**
 * Marks test data as used
 */
export async function markTestDataAsUsed(id: string): Promise<TestData> {
  return updateTestDataStatus(id, 'En uso');
}

/**
 * Releases test data (makes it available again)
 */
export async function releaseTestData(id: string): Promise<TestData> {
  return updateTestDataStatus(id, 'Disponible');
}

/**
 * Marks test data as consumed
 */
export async function markTestDataAsConsumed(id: string): Promise<TestData> {
  return updateTestDataStatus(id, 'Consumida');
}

/**
 * Deletes test data
 */
export async function deleteTestData(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTestData.findIndex(td => td.id === id);
      if (index === -1) {
        reject(new Error('Test data no encontrado'));
        return;
      }

      mockTestData.splice(index, 1);
      resolve();
    }, 500);
  });
}

/**
 * Gets available filter options for test data
 */
export function getTestDataFilterOptions(): {
  statuses: TestData['status'][];
  classifications: string[];
  sources: string[];
  environments: string[];
} {
  const statuses: TestData['status'][] = [
    'Disponible',
    'En uso',
    'Consumida',
    'Reacondicionamiento',
  ];
  const classifications = [
    ...new Set(mockTestData.flatMap(td => td.classification)),
  ];
  const sources = [...new Set(mockTestData.map(td => td.metadata.source))];
  const environments = [
    ...new Set(mockTestData.map(td => td.metadata.environment)),
  ];

  return { statuses, classifications, sources, environments };
}

/**
 * Finds available test data for specific requirements
 */
export async function findAvailableTestData(
  requirements: string[]
): Promise<TestData[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const available = mockTestData.filter(
        td =>
          td.status === 'Disponible' &&
          requirements.some(req => td.classification.includes(req))
      );
      resolve(available);
    }, 300);
  });
}

/**
 * Gets test data statistics
 */
export function getTestDataStatistics(testData: TestData[]): {
  total: number;
  byStatus: Record<TestData['status'], number>;
  byClassification: Record<string, number>;
  bySource: Record<string, number>;
  byEnvironment: Record<string, number>;
} {
  const stats = {
    total: testData.length,
    byStatus: {} as Record<TestData['status'], number>,
    byClassification: {} as Record<string, number>,
    bySource: {} as Record<string, number>,
    byEnvironment: {} as Record<string, number>,
  };

  testData.forEach(data => {
    // Status stats
    stats.byStatus[data.status] = (stats.byStatus[data.status] || 0) + 1;

    // Classification stats
    data.classification.forEach(classification => {
      stats.byClassification[classification] =
        (stats.byClassification[classification] || 0) + 1;
    });

    // Source stats
    stats.bySource[data.metadata.source] =
      (stats.bySource[data.metadata.source] || 0) + 1;

    // Environment stats
    stats.byEnvironment[data.metadata.environment] =
      (stats.byEnvironment[data.metadata.environment] || 0) + 1;
  });

  return stats;
}

/**
 * Exports test data to YAML format
 */
export function exportTestDataToYaml(testData: TestData[]): string {
  const yamlContent = testData
    .map(
      data => `
id: ${data.id}
accountId: ${data.accountId}
referenceId: ${data.referenceId}
customerId: ${data.customerId}
classification:
${data.classification.map(c => `  - ${c}`).join('\n')}
status: ${data.status}
createdAt: ${data.createdAt}
lastUsed: ${data.lastUsed || 'null'}
s3Location:
  bucket: ${data.s3Location.bucket}
  path: ${data.s3Location.path}
metadata:
  source: ${data.metadata.source}
  environment: ${data.metadata.environment}
  region: ${data.metadata.region}
`
    )
    .join('\n---\n');

  return `# Test Data Export\n# Generated on: ${new Date().toISOString()}\n\n${yamlContent}`;
}

/**
 * Validates S3 location format
 */
export function validateS3Location(
  bucket: string,
  path: string
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!bucket || bucket.length < 3) {
    errors.push('Bucket name must be at least 3 characters');
  }

  if (!path || !path.includes('.')) {
    errors.push('Path must include a file extension');
  }

  if (path && path.startsWith('/')) {
    errors.push('Path should not start with /');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generates S3 path for test data
 */
export function generateS3Path(
  accountId: string,
  classification: string[]
): string {
  const category =
    classification[0]?.toLowerCase().replace(' ', '-') || 'general';
  return `banking/accounts/${category}/${accountId}.json`;
}
