import { describe, expect, it } from 'vitest';

import { handler } from '../../src/handlers/app';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

function createEvent(method: string, path: string, body?: unknown) {
  return {
    version: '2.0',
    routeKey: `${method} ${path}`,
    rawPath: path,
    rawQueryString: '',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'api-id',
      domainName: 'id.execute-api.us-east-1.amazonaws.com',
      domainPrefix: 'id',
      http: {
        method,
        path,
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'test',
      },
      requestId: 'id',
      routeKey: `${method} ${path}`,
      stage: '$default',
      time: '01/Jan/2024:00:00:00 +0000',
      timeEpoch: 1704067200000,
    },
    isBase64Encoded: false,
  };
}

describe('app handler', () => {
  it('auth.login returns user for selected profile', async () => {
    const event = createEvent('POST', '/api', {
      resource: 'auth',
      action: 'login',
      payload: { profile: 'admin' },
    });

    const result = await handler(event as any, {} as any, () => {});
    const envelope = JSON.parse((result as any).body) as ApiEnvelope<{
      id: string;
      profile: string;
    }>;

    expect((result as any).statusCode).toBe(200);
    expect(envelope.success).toBe(true);
    expect(envelope.data?.profile).toBe('admin');
    expect(envelope.data?.id).toBe('admin-001');
  });

  it('GET /api/test-data returns mock test data from API', async () => {
    const event = createEvent('GET', '/api/test-data');

    const result = await handler(event as any, {} as any, () => {});
    const envelope = JSON.parse((result as any).body) as ApiEnvelope<
      Array<{ id: string }>
    >;

    expect((result as any).statusCode).toBe(200);
    expect(envelope.success).toBe(true);
    expect(Array.isArray(envelope.data)).toBe(true);
    expect((envelope.data || []).length).toBeGreaterThan(0);
    expect(envelope.data?.[0].id).toBe('TD-20031');
  });

  it('GET /api/test-catalog returns mock tests from API', async () => {
    const event = createEvent('GET', '/api/test-catalog');

    const result = await handler(event as any, {} as any, () => {});
    const envelope = JSON.parse((result as any).body) as ApiEnvelope<
      Array<{ id: string }>
    >;

    expect((result as any).statusCode).toBe(200);
    expect(envelope.success).toBe(true);
    expect(Array.isArray(envelope.data)).toBe(true);
    expect((envelope.data || []).length).toBeGreaterThan(0);
    expect(envelope.data?.[0].id).toBe('TC-00123');
  });

  it('supports create and delete through /api/test-data CRUD routes', async () => {
    const id = `TD-TEST-${Date.now()}`;

    const createEventPayload = createEvent('POST', '/api/test-data', {
      id,
      customer: {
        customerId: 'CUST-TEST',
        name: 'Test User',
        type: 'Individual',
      },
      account: {
        accountId: 'ACC-TEST',
        referenceId: 'REF-ACC-TEST',
        type: 'Checking Account',
        createdAt: new Date().toISOString(),
      },
      classifications: ['Active account'],
      labels: {
        project: 'Core Migration',
        environment: 'QA',
        dataOwner: 'QA Team',
      },
      scope: {
        visibility: 'manual',
      },
      status: 'Available',
      lastUsed: null,
      team: 'QA Team',
    });

    const createResult = await handler(
      createEventPayload as any,
      {} as any,
      () => {}
    );

    expect((createResult as any).statusCode).toBe(201);

    const deleteEventPayload = createEvent(
      'DELETE',
      `/api/test-data/${encodeURIComponent(id)}`,
      {}
    );

    const deleteResult = await handler(
      deleteEventPayload as any,
      {} as any,
      () => {}
    );
    const deleteEnvelope = JSON.parse(
      (deleteResult as any).body
    ) as ApiEnvelope<{
      id: string;
    }>;

    expect((deleteResult as any).statusCode).toBe(200);
    expect(deleteEnvelope.success).toBe(true);
    expect(deleteEnvelope.data?.id).toBe(id);
  });

  it('supports create and delete through /api/test-catalog CRUD routes', async () => {
    const id = `TC-TEST-${Date.now()}`;

    const createEventPayload = createEvent('POST', '/api/test-catalog', {
      id,
      name: 'Test catalog case',
      flow: 'Payment -> Validation -> Confirmation',
      labels: {
        flow: 'Payment',
        intent: 'Positive',
        experience: 'Web',
        project: 'Core Banking',
      },
      dataRequirements: ['Active account'],
      supportedRuntimes: ['OCP Testing Studio'],
      lastExecution: null,
      lastModified: new Date().toISOString(),
      version: 'v1.0',
      team: 'QA Team',
    });

    const createResult = await handler(
      createEventPayload as any,
      {} as any,
      () => {}
    );

    expect((createResult as any).statusCode).toBe(201);

    const deleteEventPayload = createEvent(
      'DELETE',
      `/api/test-catalog/${encodeURIComponent(id)}`,
      {}
    );

    const deleteResult = await handler(
      deleteEventPayload as any,
      {} as any,
      () => {}
    );
    const deleteEnvelope = JSON.parse(
      (deleteResult as any).body
    ) as ApiEnvelope<{
      id: string;
    }>;

    expect((deleteResult as any).statusCode).toBe(200);
    expect(deleteEnvelope.success).toBe(true);
    expect(deleteEnvelope.data?.id).toBe(id);
  });
});
