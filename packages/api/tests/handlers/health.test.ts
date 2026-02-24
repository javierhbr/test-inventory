import { describe, it, expect } from 'vitest';
import { handler } from '../../src/handlers/health';

describe('health handler', () => {
  it('returns 200 with status ok', async () => {
    const event = {
      version: '2.0',
      routeKey: 'GET /health',
      rawPath: '/health',
      rawQueryString: '',
      headers: { 'content-type': 'application/json' },
      body: '{}',
      requestContext: {
        accountId: '123456789012',
        apiId: 'api-id',
        domainName: 'id.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'id',
        http: {
          method: 'GET',
          path: '/health',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test',
        },
        requestId: 'id',
        routeKey: 'GET /health',
        stage: '$default',
        time: '01/Jan/2024:00:00:00 +0000',
        timeEpoch: 1704067200000,
      },
      isBase64Encoded: false,
    };

    const result = await handler(event as any, {} as any, () => {});
    const body = JSON.parse((result as any).body);

    expect((result as any).statusCode).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});
