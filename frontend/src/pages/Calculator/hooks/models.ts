import type { Operation } from "../models/calculator";

export interface UseCalculatorResult {
  display: string;
  expression: string;
  error: string | null;
  isLoading: boolean;
  pressedButtonId: string | null;
  onDigit: (digit: string) => void;
  onDecimalPoint: () => void;
  onOperation: (operation: Operation) => Promise<void>;
  onEquals: () => Promise<void>;
  onBackspace: () => void;
  onClear: () => void;
}
