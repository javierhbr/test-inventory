import {
  bulkDeleteTestData,
  createTestData,
  deleteTestData,
  getTestData,
  listTestData,
  reconditionTestData,
  ServiceResult,
  updateTestData,
} from './testDataCrud';

interface TestDataRouteResult {
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

function normalizePath(path: string): string {
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function toHttpResult(result: ServiceResult<unknown>): TestDataRouteResult {
  if (result.ok) {
    return {
      statusCode: result.statusCode,
      body: {
        success: true,
        data: result.data,
      },
    };
  }

  return {
    statusCode: result.statusCode,
    body: {
      success: false,
      error: {
        code: result.code,
        message: result.message,
      },
    },
  };
}

function methodNotAllowed(method: string, path: string): TestDataRouteResult {
  return {
    statusCode: 405,
    body: {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `Method ${method} is not allowed for ${path}`,
      },
    },
  };
}

export function handleTestDataHttpRoute(
  method: string,
  rawPath: string,
  body: unknown
): TestDataRouteResult | null {
  const path = normalizePath(rawPath);

  if (path === '/api/test-data') {
    if (method === 'GET') {
      return toHttpResult(listTestData());
    }

    if (method === 'POST') {
      return toHttpResult(createTestData(body));
    }

    if (method === 'DELETE') {
      const payload =
        typeof body === 'object' && body !== null
          ? (body as Record<string, unknown>)
          : {};
      return toHttpResult(bulkDeleteTestData(payload.ids));
    }

    return methodNotAllowed(method, path);
  }

  const testDataIdMatch = path.match(/^\/api\/test-data\/([^/]+)$/);
  if (testDataIdMatch) {
    const id = decodeURIComponent(testDataIdMatch[1]);

    if (method === 'GET') {
      return toHttpResult(getTestData(id));
    }

    if (method === 'PUT') {
      return toHttpResult(updateTestData(id, body));
    }

    if (method === 'DELETE') {
      return toHttpResult(deleteTestData(id));
    }

    return methodNotAllowed(method, path);
  }

  const reconditionMatch = path.match(
    /^\/api\/test-data\/([^/]+)\/recondition$/
  );
  if (reconditionMatch) {
    const id = decodeURIComponent(reconditionMatch[1]);

    if (method === 'PATCH') {
      return toHttpResult(reconditionTestData(id));
    }

    return methodNotAllowed(method, path);
  }

  return null;
}
