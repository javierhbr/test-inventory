import { mockTests } from '../data/mockTests';
import { Test } from '../types/domain';
import { ServiceError, ServiceResult, ServiceSuccess } from './testDataCrud';

const testCatalogStore: Test[] = structuredClone(mockTests);

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

function isValidTest(candidate: unknown): candidate is Test {
  if (typeof candidate !== 'object' || candidate === null) {
    return false;
  }

  const test = candidate as Partial<Test>;
  return Boolean(test.id && test.name && test.flow && test.lob);
}

export function listTestsCatalog(): ServiceSuccess<Test[]> {
  return success(clone(testCatalogStore));
}

export function getTestCatalog(id: string): ServiceResult<Test> {
  const record = testCatalogStore.find(item => item.id === id);

  if (!record) {
    return failure(404, 'NOT_FOUND', `Test "${id}" was not found`);
  }

  return success(clone(record));
}

export function createTestCatalog(candidate: unknown): ServiceResult<Test> {
  if (!isValidTest(candidate)) {
    return failure(400, 'BAD_REQUEST', 'Create payload must be a valid test');
  }

  const exists = testCatalogStore.some(item => item.id === candidate.id);
  if (exists) {
    return failure(409, 'CONFLICT', `Test "${candidate.id}" already exists`);
  }

  const created = clone(candidate);
  testCatalogStore.push(created);
  return success(clone(created), 201);
}

export function updateTestCatalog(
  id: string,
  candidate: unknown
): ServiceResult<Test> {
  if (!isValidTest(candidate)) {
    return failure(400, 'BAD_REQUEST', 'Update payload must be a valid test');
  }

  if (candidate.id !== id) {
    return failure(
      400,
      'BAD_REQUEST',
      'Path id must match payload id for update'
    );
  }

  const index = testCatalogStore.findIndex(item => item.id === id);
  if (index === -1) {
    return failure(404, 'NOT_FOUND', `Test "${id}" was not found`);
  }

  testCatalogStore[index] = clone(candidate);
  return success(clone(testCatalogStore[index]));
}

export function deleteTestCatalog(id: string): ServiceResult<{ id: string }> {
  const index = testCatalogStore.findIndex(item => item.id === id);
  if (index === -1) {
    return failure(404, 'NOT_FOUND', `Test "${id}" was not found`);
  }

  testCatalogStore.splice(index, 1);
  return success({ id });
}

export function bulkDeleteTestCatalog(
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
  const before = testCatalogStore.length;

  for (let i = testCatalogStore.length - 1; i >= 0; i -= 1) {
    if (idSet.has(testCatalogStore[i].id)) {
      testCatalogStore.splice(i, 1);
    }
  }

  return success({ deletedCount: before - testCatalogStore.length });
}
