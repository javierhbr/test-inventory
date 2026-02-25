import { mockDslGroups, mockRecipeGroups } from '../data/mockDsls';

interface DslRouteResult {
  statusCode: number;
  body: {
    success: boolean;
    data?: any;
    error?: {
      code: string;
      message: string;
    };
  };
}

function normalizePath(path: string): string {
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

export function handleDslHttpRoute(
  method: string,
  rawPath: string
): DslRouteResult | null {
  const path = normalizePath(rawPath);

  if (path === '/api/dsls') {
    if (method === 'GET') {
      return {
        statusCode: 200,
        body: {
          success: true,
          data: {
            grouped: mockDslGroups,
            recipes: mockRecipeGroups,
          },
        },
      };
    }

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

  return null;
}
