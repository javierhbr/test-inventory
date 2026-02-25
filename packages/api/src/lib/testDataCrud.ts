import { mockTestData } from '../data/mockTestData';
import { CreateTestDataPayload, TestDataRecord } from '../types/domain';

export interface ServiceSuccess<T> {
  ok: true;
  statusCode: number;
  data: T;
}

export interface ServiceError {
  ok: false;
  statusCode: number;
  code: string;
  message: string;
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

const testDataStore: TestDataRecord[] = structuredClone(mockTestData);

function success<T>(data: T, statusCode: number = 200): ServiceSuccess<T> {
  return {
    ok: true,
    statusCode,
    data,
  };
}

function failure(
  statusCode: number,
  code: string,
  message: string
): ServiceError {
  return {
    ok: false,
    statusCode,
    code,
    message,
  };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function isValidRecord(candidate: unknown): candidate is TestDataRecord {
  if (typeof candidate !== 'object' || candidate === null) {
    return false;
  }

  const record = candidate as Partial<TestDataRecord>;
  return Boolean(record.id && record.customer && record.account && record.lob);
}

function isValidCreatePayload(
  candidate: unknown
): candidate is CreateTestDataPayload {
  if (typeof candidate !== 'object' || candidate === null) {
    return false;
  }

  const payload = candidate as Partial<CreateTestDataPayload>;
  return Boolean(
    Array.isArray(payload.classifications) &&
    payload.labels &&
    payload.labels.environment &&
    payload.labels.dataOwner &&
    payload.scope &&
    payload.scope.visibility &&
    typeof payload.lob === 'string' &&
    payload.lob.length > 0
  );
}

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  'primary-user': 'Primary user',
  'authorized-user': 'Authorized user',
  company: 'Company',
  retail: 'Retail',
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'Checking Account',
  savings: 'Savings Account',
  'credit-card': 'Credit Card',
  'debit-card': 'Debit Card',
  business: 'Business Account',
  'line-of-credit': 'Line of Credit',
};

function extractTagValue(tags: string[], key: string): string | undefined {
  const tag = tags.find(t => t.startsWith(`${key}:`));
  return tag ? tag.slice(key.length + 1) : undefined;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-5)}`;
}

function generateNumericId(prefix: string): string {
  return `${prefix}-${Math.floor(Math.random() * 90000) + 10000}`;
}

function extractScheduleFromTags(tags: string[]): {
  schedule: { month?: number; days?: number; year?: number } | null;
  remainingTags: string[];
} {
  const schedule: { month?: number; days?: number; year?: number } = {};
  const remainingTags: string[] = [];
  for (const tag of tags) {
    const m = tag.match(/^schedule:(month|days|year):(\d+)$/i);
    if (m) {
      const unit = m[1].toLowerCase() as 'month' | 'days' | 'year';
      schedule[unit] = parseInt(m[2], 10);
    } else {
      remainingTags.push(tag);
    }
  }
  return {
    schedule: Object.keys(schedule).length > 0 ? schedule : null,
    remainingTags,
  };
}

export function listTestData(): ServiceSuccess<TestDataRecord[]> {
  return success(clone(testDataStore));
}

export function getTestData(id: string): ServiceResult<TestDataRecord> {
  const record = testDataStore.find(item => item.id === id);

  if (!record) {
    return failure(404, 'NOT_FOUND', `Test data "${id}" was not found`);
  }

  return success(clone(record));
}

export function createTestData(
  candidate: unknown
): ServiceResult<TestDataRecord> {
  if (!isValidCreatePayload(candidate)) {
    return failure(
      400,
      'BAD_REQUEST',
      'Create payload must include classifications, labels, and scope'
    );
  }

  const customerTypeTag = extractTagValue(
    candidate.classifications,
    'customer-type'
  );
  const accountTypeTag = extractTagValue(
    candidate.classifications,
    'account-type'
  );

  if (!customerTypeTag || !accountTypeTag) {
    return failure(
      400,
      'BAD_REQUEST',
      'Classifications must include both customer-type: and account-type: tags'
    );
  }

  const { schedule, remainingTags } = extractScheduleFromTags(
    candidate.classifications
  );

  const customerId = generateNumericId('CUST');
  const accountId = generateNumericId('ACC');

  const customerTypeLabel =
    CUSTOMER_TYPE_LABELS[customerTypeTag] || customerTypeTag;
  const accountTypeLabel =
    ACCOUNT_TYPE_LABELS[accountTypeTag] || accountTypeTag;

  const created: TestDataRecord = {
    id: generateId('TD'),
    customer: {
      customerId,
      name:
        customerTypeTag === 'company'
          ? `Company ${customerId.slice(-3)}`
          : `User ${customerId.slice(-3)}`,
      type: customerTypeLabel,
    },
    account: {
      accountId,
      referenceId: `REF-${accountId}`,
      type: accountTypeLabel,
      createdAt: new Date().toISOString(),
    },
    classifications: remainingTags,
    labels: candidate.labels,
    scope: candidate.scope,
    status: 'Available',
    lastUsed: null,
    team: candidate.labels.dataOwner || 'Default Team',
    lob: candidate.lob,
    reconditioningSchedule: schedule,
  };

  testDataStore.push(created);
  return success(clone(created), 201);
}

export function updateTestData(
  id: string,
  candidate: unknown
): ServiceResult<TestDataRecord> {
  if (!isValidRecord(candidate)) {
    return failure(
      400,
      'BAD_REQUEST',
      'Update payload must be a valid test data record'
    );
  }

  if (candidate.id !== id) {
    return failure(
      400,
      'BAD_REQUEST',
      'Path id must match payload id for update'
    );
  }

  const index = testDataStore.findIndex(item => item.id === id);
  if (index === -1) {
    return failure(404, 'NOT_FOUND', `Test data "${id}" was not found`);
  }

  const { schedule, remainingTags } = extractScheduleFromTags(
    candidate.classifications
  );

  const updated: TestDataRecord = {
    ...clone(candidate),
    classifications: remainingTags,
    reconditioningSchedule: schedule,
  };

  testDataStore[index] = updated;
  return success(clone(testDataStore[index]));
}

export function deleteTestData(id: string): ServiceResult<{ id: string }> {
  const index = testDataStore.findIndex(item => item.id === id);
  if (index === -1) {
    return failure(404, 'NOT_FOUND', `Test data "${id}" was not found`);
  }

  testDataStore.splice(index, 1);
  return success({ id });
}

export function bulkDeleteTestData(
  ids: unknown
): ServiceResult<{ deletedCount: number }> {
  if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) {
    return failure(
      400,
      'BAD_REQUEST',
      'Bulk delete payload requires field "ids" as string[]'
    );
  }

  const idSet = new Set(ids);
  const before = testDataStore.length;

  for (let i = testDataStore.length - 1; i >= 0; i -= 1) {
    if (idSet.has(testDataStore[i].id)) {
      testDataStore.splice(i, 1);
    }
  }

  return success({ deletedCount: before - testDataStore.length });
}

export function reconditionTestData(id: string): ServiceResult<TestDataRecord> {
  const index = testDataStore.findIndex(item => item.id === id);
  if (index === -1) {
    return failure(404, 'NOT_FOUND', `Test data "${id}" was not found`);
  }

  testDataStore[index] = {
    ...testDataStore[index],
    status: 'Reconditioning',
  };

  return success(clone(testDataStore[index]));
}
