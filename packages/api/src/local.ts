import { createServer } from 'node:http';

import { handleExecutionHttpRoute } from './lib/executionRoutes';
import { handleApiAction } from './lib/router';
import { handleTestCatalogHttpRoute } from './lib/testCatalogRoutes';
import { handleTestDataHttpRoute } from './lib/testDataRoutes';

const port = Number(process.env.PORT || 3001);

function normalizePath(path: string): string {
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function writeJson(
  res: import('node:http').ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  res.writeHead(statusCode, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type,authorization',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

async function parseJsonBody(
  req: import('node:http').IncomingMessage
): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  const body = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(body);
}

createServer(async (req, res) => {
  const method = (req.method || 'GET').toUpperCase();
  const url = req.url || '/';
  const path = normalizePath(url.split('?')[0]);

  if (method === 'OPTIONS') {
    writeJson(res, 200, { ok: true });
    return;
  }

  if (method === 'GET' && path === '/health') {
    writeJson(res, 200, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      mode: 'local',
    });
    return;
  }

  if (path.startsWith('/api/test-data')) {
    let body: unknown = {};

    if (
      method === 'POST' ||
      method === 'PUT' ||
      method === 'PATCH' ||
      method === 'DELETE'
    ) {
      try {
        body = await parseJsonBody(req);
      } catch {
        writeJson(res, 400, {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Request body must be valid JSON',
          },
        });
        return;
      }
    }

    const routeResult = handleTestDataHttpRoute(method, path, body);
    if (routeResult) {
      writeJson(res, routeResult.statusCode, routeResult.body);
      return;
    }
  }

  if (path.startsWith('/api/test-catalog')) {
    let body: unknown = {};

    if (
      method === 'POST' ||
      method === 'PUT' ||
      method === 'PATCH' ||
      method === 'DELETE'
    ) {
      try {
        body = await parseJsonBody(req);
      } catch {
        writeJson(res, 400, {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Request body must be valid JSON',
          },
        });
        return;
      }
    }

    const routeResult = handleTestCatalogHttpRoute(method, path, body);
    if (routeResult) {
      writeJson(res, routeResult.statusCode, routeResult.body);
      return;
    }
  }

  if (path.startsWith('/api/execution')) {
    let body: unknown = {};

    if (
      method === 'POST' ||
      method === 'PUT' ||
      method === 'PATCH' ||
      method === 'DELETE'
    ) {
      try {
        body = await parseJsonBody(req);
      } catch {
        writeJson(res, 400, {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Request body must be valid JSON',
          },
        });
        return;
      }
    }

    const routeResult = handleExecutionHttpRoute(method, path, body);
    if (routeResult) {
      writeJson(res, routeResult.statusCode, routeResult.body);
      return;
    }
  }

  if (method !== 'POST' || path !== '/api') {
    writeJson(res, 404, {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route not found: ${method} ${path}`,
      },
    });
    return;
  }

  try {
    const payload = await parseJsonBody(req);
    const result = handleApiAction(payload);
    writeJson(res, result.statusCode, result.body);
  } catch {
    writeJson(res, 400, {
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Request body must be valid JSON',
      },
    });
  }
}).listen(port, () => {
  console.log(`[api] local server running on http://localhost:${port}`);
});
