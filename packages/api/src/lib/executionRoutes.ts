import { mockTestData } from '../data/mockTestData';
import { mockTests } from '../data/mockTests';
import { Test, TestDataRecord } from '../types/domain';

interface ExecutionRouteResult {
  statusCode: number;
  body: {
    success: boolean;
    data?: unknown;
    error?: {
      code: string;
      message: string;
    };
  };
}

interface CsvImportResponse {
  tests: Test[];
  invalidTestIds: string[];
}

interface AssignedExecutionTestData {
  id: string;
  accountId: string;
  referenceId: string;
  customerId: string;
  assignedAt: string;
  status: string;
}

interface ExecutionAssignmentResponse {
  assignments: Array<{
    testId: string;
    assignedTestData: AssignedExecutionTestData | null;
  }>;
}

const executionTestsStore: Test[] = structuredClone(mockTests);
const executionTestDataStore: TestDataRecord[] = structuredClone(mockTestData);

function normalizePath(path: string): string {
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function success(
  data: unknown,
  statusCode: number = 200
): ExecutionRouteResult {
  return {
    statusCode,
    body: {
      success: true,
      data,
    },
  };
}

function failure(
  statusCode: number,
  message: string,
  code: string = 'BAD_REQUEST'
): ExecutionRouteResult {
  return {
    statusCode,
    body: {
      success: false,
      error: {
        code,
        message,
      },
    },
  };
}

function methodNotAllowed(method: string, path: string): ExecutionRouteResult {
  return failure(
    405,
    `Method ${method} is not allowed for ${path}`,
    'METHOD_NOT_ALLOWED'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseCsvTestIds(csvContent: string): string[] {
  const lines = csvContent
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const header = lines[0].toLowerCase();
  if (!header.includes('testid')) {
    return [];
  }

  const uniqueIds = new Set<string>();
  for (const line of lines.slice(1)) {
    const firstColumn = line.split(',')[0]?.trim();
    if (firstColumn) {
      uniqueIds.add(firstColumn);
    }
  }

  return Array.from(uniqueIds);
}

function findMatchingTestData(
  dataRequirements: string[]
): TestDataRecord | null {
  if (executionTestDataStore.length === 0) {
    return null;
  }

  if (dataRequirements.length === 0) {
    const available = executionTestDataStore.find(
      item => item.status === 'Available'
    );
    return available || executionTestDataStore[0];
  }

  const normalizedRequirements = dataRequirements.map(requirement =>
    requirement.toLowerCase()
  );

  const matchingRecord = executionTestDataStore.find(item => {
    const normalizedClassifications = item.classifications.map(value =>
      value.toLowerCase()
    );

    return normalizedRequirements.every(requirement =>
      normalizedClassifications.some(classification =>
        classification.includes(requirement)
      )
    );
  });

  if (matchingRecord) {
    return matchingRecord;
  }

  const available = executionTestDataStore.find(
    item => item.status === 'Available'
  );
  return available || executionTestDataStore[0];
}

function toAssignedExecutionTestData(
  testId: string,
  record: TestDataRecord
): AssignedExecutionTestData {
  return {
    id: record.id,
    accountId: record.account.accountId,
    referenceId: record.account.referenceId,
    customerId: record.customer.customerId,
    assignedAt: new Date().toISOString(),
    status: `Assigned to ${testId}`,
  };
}

function handleGetExecutionTests(
  method: string,
  path: string
): ExecutionRouteResult {
  if (method !== 'GET') {
    return methodNotAllowed(method, path);
  }

  return success(structuredClone(executionTestsStore));
}

function handleGetExecutionTestData(
  method: string,
  path: string
): ExecutionRouteResult {
  if (method !== 'GET') {
    return methodNotAllowed(method, path);
  }

  return success(structuredClone(executionTestDataStore));
}

function handleImportCsvForExecution(
  method: string,
  path: string,
  body: unknown
): ExecutionRouteResult {
  if (method !== 'POST') {
    return methodNotAllowed(method, path);
  }

  if (!isRecord(body) || typeof body.csvContent !== 'string') {
    return failure(
      400,
      'Import CSV payload must include field "csvContent" as string'
    );
  }

  const csvTestIds = parseCsvTestIds(body.csvContent);
  if (csvTestIds.length === 0) {
    return success({
      tests: [],
      invalidTestIds: [],
    } satisfies CsvImportResponse);
  }

  const byId = new Map(executionTestsStore.map(test => [test.id, test]));
  const tests: Test[] = [];
  const invalidTestIds: string[] = [];

  for (const testId of csvTestIds) {
    const test = byId.get(testId);
    if (test) {
      tests.push(structuredClone(test));
    } else {
      invalidTestIds.push(testId);
    }
  }

  return success({
    tests,
    invalidTestIds,
  } satisfies CsvImportResponse);
}

function handleAssignTestData(
  method: string,
  path: string,
  body: unknown
): ExecutionRouteResult {
  if (method !== 'POST') {
    return methodNotAllowed(method, path);
  }

  if (!isRecord(body) || !Array.isArray(body.tests)) {
    return failure(400, 'Assign payload must include field "tests" as array');
  }

  const assignments: ExecutionAssignmentResponse['assignments'] = [];

  for (const candidate of body.tests) {
    if (!isRecord(candidate) || typeof candidate.id !== 'string') {
      return failure(
        400,
        'Every item in "tests" must include field "id" as string'
      );
    }

    const dataRequirements = Array.isArray(candidate.dataRequirements)
      ? (candidate.dataRequirements.filter(
          value => typeof value === 'string'
        ) as string[])
      : [];

    const matchedTestData = findMatchingTestData(dataRequirements);

    assignments.push({
      testId: candidate.id,
      assignedTestData: matchedTestData
        ? toAssignedExecutionTestData(candidate.id, matchedTestData)
        : null,
    });
  }

  return success({
    assignments,
  } satisfies ExecutionAssignmentResponse);
}

export function handleExecutionHttpRoute(
  method: string,
  rawPath: string,
  body: unknown
): ExecutionRouteResult | null {
  const path = normalizePath(rawPath);

  if (path === '/api/execution') {
    if (method !== 'GET') {
      return methodNotAllowed(method, path);
    }

    return success({
      routes: [
        '/api/execution/tests',
        '/api/execution/test-data',
        '/api/execution/import-csv',
        '/api/execution/assign-test-data',
      ],
    });
  }

  if (path === '/api/execution/tests') {
    return handleGetExecutionTests(method, path);
  }

  if (path === '/api/execution/test-data') {
    return handleGetExecutionTestData(method, path);
  }

  if (path === '/api/execution/import-csv') {
    return handleImportCsvForExecution(method, path, body);
  }

  if (path === '/api/execution/assign-test-data') {
    return handleAssignTestData(method, path, body);
  }

  return null;
}
