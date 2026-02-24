import { mockTestData } from '../data/mockTestData';
import { TestDataRecord } from '../types/domain';

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
  return Boolean(record.id && record.customer && record.account);
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
  if (!isValidRecord(candidate)) {
    return failure(
      400,
      'BAD_REQUEST',
      'Create payload must be a valid test data record'
    );
  }

  const exists = testDataStore.some(item => item.id === candidate.id);
  if (exists) {
    return failure(
      409,
      'CONFLICT',
      `Test data "${candidate.id}" already exists`
    );
  }

  const created = clone(candidate);
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

  testDataStore[index] = clone(candidate);
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
