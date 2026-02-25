import { ServiceResult } from './testDataCrud';
import {
  bulkDeleteTestCatalog,
  createTestCatalog,
  deleteTestCatalog,
  getTestCatalog,
  listTestsCatalog,
  updateTestCatalog,
} from './testCatalogCrud';

interface TestCatalogRouteResult {
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

function toHttpResult(result: ServiceResult<unknown>): TestCatalogRouteResult {
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

function methodNotAllowed(
  method: string,
  path: string
): TestCatalogRouteResult {
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

export function handleTestCatalogHttpRoute(
  method: string,
  rawPath: string,
  body: unknown
): TestCatalogRouteResult | null {
  const path = normalizePath(rawPath);

  if (path === '/api/test-catalog') {
    if (method === 'GET') {
      return toHttpResult(listTestsCatalog());
    }

    if (method === 'POST') {
      return toHttpResult(createTestCatalog(body));
    }

    if (method === 'DELETE') {
      const payload =
        typeof body === 'object' && body !== null
          ? (body as Record<string, unknown>)
          : {};
      return toHttpResult(bulkDeleteTestCatalog(payload.ids));
    }

    return methodNotAllowed(method, path);
  }

  const testCatalogIdMatch = path.match(/^\/api\/test-catalog\/([^/]+)$/);
  if (testCatalogIdMatch) {
    const id = decodeURIComponent(testCatalogIdMatch[1]);

    if (method === 'GET') {
      return toHttpResult(getTestCatalog(id));
    }

    if (method === 'PUT') {
      return toHttpResult(updateTestCatalog(id, body));
    }

    if (method === 'DELETE') {
      return toHttpResult(deleteTestCatalog(id));
    }

    return methodNotAllowed(method, path);
  }

  return null;
}
