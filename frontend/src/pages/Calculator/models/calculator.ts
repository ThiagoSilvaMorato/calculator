export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

export interface CalculatorRequest {
  firstOperand: number;
  secondOperand: number;
}

export interface CalculatorSuccessResponse {
  result: number;
}

export interface CalculatorErrorResponse {
  error: string;
}

export type CalculationOutcome = { ok: true; result: number } | { ok: false; error: string };
