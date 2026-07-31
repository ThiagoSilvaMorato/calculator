import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculate } from './calculatorApi';
import type { Operation } from '../pages/Calculator/models/calculator';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('calculate', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const operationPaths: Record<Operation, string> = {
    addition: '/api/v1/calculator/addition',
    subtraction: '/api/v1/calculator/subtraction',
    multiplication: '/api/v1/calculator/multiplication',
    division: '/api/v1/calculator/division',
  };

  it.each(Object.entries(operationPaths) as [Operation, string][])(
    'sends a correctly-shaped POST request for %s',
    async (operation, path) => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, { result: 15 }));

      await calculate(operation, 10, 5);

      expect(fetchMock).toHaveBeenCalledWith(
        `http://localhost:8080${path}`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstOperand: 10, secondOperand: 5 }),
        }),
      );
    },
  );

  it('uses VITE_API_BASE_URL when set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { result: 15 }));

    await calculate('addition', 10, 5);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/calculator/addition',
      expect.anything(),
    );
  });

  it('returns ok:true with the result on a successful response', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { result: 15 }));

    const outcome = await calculate('addition', 10, 5);

    expect(outcome).toEqual({ ok: true, result: 15 });
  });

  it('returns ok:false with the backend message on an error response', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(400, { error: 'division by zero is not allowed' }));

    const outcome = await calculate('division', 10, 0);

    expect(outcome).toEqual({ ok: false, error: 'division by zero is not allowed' });
  });

  it('returns a generic message when the error response body is not parseable JSON', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('not json', { status: 500, headers: { 'Content-Type': 'text/plain' } }),
    );

    const outcome = await calculate('addition', 10, 5);

    expect(outcome).toEqual({ ok: false, error: 'Something went wrong. Please try again.' });
  });

  it('returns a network-failure message when fetch rejects', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const outcome = await calculate('addition', 10, 5);

    expect(outcome).toEqual({
      ok: false,
      error: 'Unable to reach the server. Please check your connection and try again.',
    });
  });

  it('returns a generic message when a successful response has an unexpected shape', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { unexpected: true }));

    const outcome = await calculate('addition', 10, 5);

    expect(outcome).toEqual({ ok: false, error: 'Received an unexpected response from the server.' });
  });
});
