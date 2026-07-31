import type {
  CalculationOutcome,
  CalculatorErrorResponse,
  CalculatorSuccessResponse,
  Operation,
} from '../pages/Calculator/models/calculator';

const DEFAULT_BASE_URL = 'http://localhost:8080';

const OPERATION_PATHS: Record<Operation, string> = {
  addition: '/api/v1/calculator/addition',
  subtraction: '/api/v1/calculator/subtraction',
  multiplication: '/api/v1/calculator/multiplication',
  division: '/api/v1/calculator/division',
};

function getBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL;
}

function isErrorResponse(body: unknown): body is CalculatorErrorResponse {
  return typeof body === 'object' && body !== null && typeof (body as CalculatorErrorResponse).error === 'string';
}

function isSuccessResponse(body: unknown): body is CalculatorSuccessResponse {
  return typeof body === 'object' && body !== null && typeof (body as CalculatorSuccessResponse).result === 'number';
}

export async function calculate(
  operation: Operation,
  firstOperand: number,
  secondOperand: number,
): Promise<CalculationOutcome> {
  const url = `${getBaseUrl()}${OPERATION_PATHS[operation]}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstOperand, secondOperand }),
    });
  } catch {
    return {
      ok: false,
      error: 'Unable to reach the server. Please check your connection and try again.',
    };
  }

  const body: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const message = isErrorResponse(body) ? body.error : 'Something went wrong. Please try again.';
    return { ok: false, error: message };
  }

  if (!isSuccessResponse(body)) {
    return { ok: false, error: 'Received an unexpected response from the server.' };
  }

  return { ok: true, result: body.result };
}
