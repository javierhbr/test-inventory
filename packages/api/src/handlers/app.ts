import { createHandler } from '../lib/middleware';
import { handleApiAction } from '../lib/router';

import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

function normalizePath(path: string): string {
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

export const handler = createHandler(
  async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const method = event.requestContext.http.method.toUpperCase();
    const path = normalizePath(event.rawPath || '/');

    if (method === 'GET' && path === '/health') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    if (path !== '/api') {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Route not found: ${method} ${path}`,
          },
        }),
      };
    }

    if (method !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Only POST is supported for /api',
          },
        }),
      };
    }

    const rawBody = event.body;
    let parsedBody: unknown = rawBody ?? {};

    if (typeof rawBody === 'string' && rawBody.length > 0) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        return {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'BAD_REQUEST',
              message: 'Request body must be valid JSON',
            },
          }),
        };
      }
    }

    const result = handleApiAction(parsedBody);

    return {
      statusCode: result.statusCode,
      body: JSON.stringify(result.body),
    };
  }
);
