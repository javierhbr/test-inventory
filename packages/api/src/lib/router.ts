import { availableProfiles, mockUsers } from '../data/mockUsers';
import {
  ApiActionRequest,
  ApiActionResponse,
  User,
  UserProfile,
} from '../types/domain';
import {
  bulkDeleteTestData,
  createTestData,
  deleteTestData,
  getTestData,
  listTestData,
  reconditionTestData,
  updateTestData,
} from './testDataCrud';

interface ActionResult {
  statusCode: number;
  body: ApiActionResponse<unknown>;
}

const usersStore: User[] = structuredClone(mockUsers);

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
    const result = listTestData();
    return result.ok
      ? success(result.data, result.statusCode)
      : failure(result.statusCode, result.message, result.code);
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

    const result = getTestData(id);
    return result.ok
      ? success(result.data, result.statusCode)
      : failure(result.statusCode, result.message, result.code);
  }

  if (action === 'create') {
    const payloadRecord = requireObjectPayload(payload);

    if (!payloadRecord) {
      return failure(400, 'Create payload must be an object');
    }

    const result = createTestData(payloadRecord);
    return result.ok
      ? success(result.data, result.statusCode)
      : failure(result.statusCode, result.message, result.code);
  }

  if (action === 'update') {
    const payloadRecord = requireObjectPayload(payload);

    if (!payloadRecord) {
      return failure(400, 'Update payload must be an object');
    }

    const id = getStringField(payloadRecord, 'id');
    if (!id) {
      return failure(400, 'Update payload requires field "id"');
    }

    const result = updateTestData(id, payloadRecord);
    return result.ok
      ? success(result.data, result.statusCode)
      : failure(result.statusCode, result.message, result.code);
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

    const result = deleteTestData(id);
    return result.ok
      ? success(result.data, result.statusCode)
      : failure(result.statusCode, result.message, result.code);
  }

  if (action === 'bulkDelete') {
    const payloadRecord = requireObjectPayload(payload);

    if (!payloadRecord) {
      return failure(400, 'Bulk delete payload must be an object');
    }

    const result = bulkDeleteTestData(payloadRecord.ids);
    return result.ok
      ? success(result.data, result.statusCode)
      : failure(result.statusCode, result.message, result.code);
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

    const result = reconditionTestData(id);
    return result.ok
      ? success(result.data, result.statusCode)
      : failure(result.statusCode, result.message, result.code);
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
