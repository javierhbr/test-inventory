import { availableProfiles, mockUsers } from '../data/mockUsers';
import { mockTestData } from '../data/mockTestData';
import {
  ApiActionRequest,
  ApiActionResponse,
  TestDataRecord,
  User,
  UserProfile,
} from '../types/domain';

interface ActionResult {
  statusCode: number;
  body: ApiActionResponse<unknown>;
}

const usersStore: User[] = structuredClone(mockUsers);
const testDataStore: TestDataRecord[] = structuredClone(mockTestData);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function success<T>(data: T, statusCode: number = 200): ActionResult {
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
): ActionResult {
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

function clone<T>(value: T): T {
  return structuredClone(value);
}

function parseActionRequest(
  payload: unknown
): { ok: true; value: ApiActionRequest } | { ok: false; result: ActionResult } {
  if (!isRecord(payload)) {
    return {
      ok: false,
      result: failure(400, 'Request body must be an object'),
    };
  }

  const resource = payload.resource;
  const action = payload.action;

  if (typeof resource !== 'string' || resource.length === 0) {
    return {
      ok: false,
      result: failure(400, 'Field "resource" must be a non-empty string'),
    };
  }

  if (typeof action !== 'string' || action.length === 0) {
    return {
      ok: false,
      result: failure(400, 'Field "action" must be a non-empty string'),
    };
  }

  return {
    ok: true,
    value: {
      resource,
      action,
      payload: payload.payload,
    },
  };
}

function requireObjectPayload(
  payload: unknown
): Record<string, unknown> | null {
  if (!isRecord(payload)) {
    return null;
  }

  return payload;
}

function getStringField(
  payload: Record<string, unknown>,
  field: string
): string | null {
  const value = payload[field];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function handleAuthAction(action: string, payload: unknown): ActionResult {
  if (action === 'profiles') {
    return success(Array.from(new Set(availableProfiles)));
  }

  if (action === 'login') {
    const payloadRecord = requireObjectPayload(payload);

    if (!payloadRecord) {
      return failure(400, 'Login payload must be an object');
    }

    const profile = getStringField(
      payloadRecord,
      'profile'
    ) as UserProfile | null;
    if (!profile) {
      return failure(400, 'Login payload requires field "profile"');
    }

    const user = usersStore.find(u => u.profile === profile);
    if (!user) {
      return failure(
        404,
        `User profile "${profile}" was not found`,
        'NOT_FOUND'
      );
    }

    return success(clone(user));
  }

  if (action === 'oauthLogin') {
    const payloadRecord = requireObjectPayload(payload);

    if (!payloadRecord) {
      return failure(400, 'OAuth payload must be an object');
    }

    const provider = getStringField(payloadRecord, 'provider');
    if (!provider) {
      return failure(400, 'OAuth payload requires field "provider"');
    }

    const profile: UserProfile =
      provider === 'enterprise' ? 'admin' : 'automation';
    const user: User = {
      id: `oauth-${provider}-${Date.now()}`,
      name:
        provider === 'enterprise' ? 'Corporate User' : `User from ${provider}`,
      profile,
    };

    return success(user);
  }

  return failure(404, `Unknown auth action "${action}"`, 'NOT_FOUND');
}

function handleTestDataAction(action: string, payload: unknown): ActionResult {
  if (action === 'list') {
    return success(clone(testDataStore));
  }

  if (action === 'get') {
    const payloadRecord = requireObjectPayload(payload);

    if (!payloadRecord) {
      return failure(400, 'Get payload must be an object');
    }

    const id = getStringField(payloadRecord, 'id');
    if (!id) {
      return failure(400, 'Get payload requires field "id"');
    }

    const record = testDataStore.find(item => item.id === id);
    if (!record) {
      return failure(404, `Test data "${id}" was not found`, 'NOT_FOUND');
    }

    return success(clone(record));
  }

  if (action === 'create') {
    const payloadRecord = requireObjectPayload(payload);

    if (!payloadRecord) {
      return failure(400, 'Create payload must be an object');
    }

    const candidate = payloadRecord as unknown as TestDataRecord;
    if (!candidate.id || !candidate.customer || !candidate.account) {
      return failure(400, 'Create payload must be a valid test data record');
    }

    const exists = testDataStore.some(item => item.id === candidate.id);
    if (exists) {
      return failure(
        409,
        `Test data "${candidate.id}" already exists`,
        'CONFLICT'
      );
    }

    const created = clone(candidate);
    testDataStore.push(created);
    return success(clone(created), 201);
  }

  if (action === 'update') {
    const payloadRecord = requireObjectPayload(payload);

    if (!payloadRecord) {
      return failure(400, 'Update payload must be an object');
    }

    const candidate = payloadRecord as unknown as TestDataRecord;
    if (!candidate.id) {
      return failure(400, 'Update payload requires field "id"');
    }

    const index = testDataStore.findIndex(item => item.id === candidate.id);
    if (index === -1) {
      return failure(
        404,
        `Test data "${candidate.id}" was not found`,
        'NOT_FOUND'
      );
    }

    testDataStore[index] = clone(candidate);
    return success(clone(testDataStore[index]));
  }

  if (action === 'delete') {
    const payloadRecord = requireObjectPayload(payload);

    if (!payloadRecord) {
      return failure(400, 'Delete payload must be an object');
    }

    const id = getStringField(payloadRecord, 'id');
    if (!id) {
      return failure(400, 'Delete payload requires field "id"');
    }

    const index = testDataStore.findIndex(item => item.id === id);
    if (index === -1) {
      return failure(404, `Test data "${id}" was not found`, 'NOT_FOUND');
    }

    testDataStore.splice(index, 1);
    return success({ id });
  }

  if (action === 'bulkDelete') {
    const payloadRecord = requireObjectPayload(payload);

    if (!payloadRecord) {
      return failure(400, 'Bulk delete payload must be an object');
    }

    const ids = payloadRecord.ids;
    if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) {
      return failure(
        400,
        'Bulk delete payload requires field "ids" as string[]'
      );
    }

    const idSet = new Set(ids as string[]);
    const before = testDataStore.length;

    for (let i = testDataStore.length - 1; i >= 0; i -= 1) {
      if (idSet.has(testDataStore[i].id)) {
        testDataStore.splice(i, 1);
      }
    }

    return success({ deletedCount: before - testDataStore.length });
  }

  if (action === 'recondition') {
    const payloadRecord = requireObjectPayload(payload);

    if (!payloadRecord) {
      return failure(400, 'Recondition payload must be an object');
    }

    const id = getStringField(payloadRecord, 'id');
    if (!id) {
      return failure(400, 'Recondition payload requires field "id"');
    }

    const index = testDataStore.findIndex(item => item.id === id);
    if (index === -1) {
      return failure(404, `Test data "${id}" was not found`, 'NOT_FOUND');
    }

    testDataStore[index] = {
      ...testDataStore[index],
      status: 'Reconditioning',
    };

    return success(clone(testDataStore[index]));
  }

  return failure(404, `Unknown testData action "${action}"`, 'NOT_FOUND');
}

export function handleApiAction(payload: unknown): ActionResult {
  const parsedRequest = parseActionRequest(payload);
  if (!parsedRequest.ok) {
    return parsedRequest.result;
  }

  const { resource, action, payload: actionPayload } = parsedRequest.value;

  if (resource === 'auth') {
    return handleAuthAction(action, actionPayload);
  }

  if (resource === 'testData') {
    return handleTestDataAction(action, actionPayload);
  }

  return failure(404, `Unknown resource "${resource}"`, 'NOT_FOUND');
}
