import type { ButtonVariant } from '../../../../components/Button';
import type { Operation } from '../../models/calculator';

export interface CalculatorFormProps {
  display: string;
  expression: string;
  error: string | null;
  isLoading: boolean;
  pressedButtonId: string | null;
  onDigit: (digit: string) => void;
  onDecimalPoint: () => void;
  onOperation: (operation: Operation) => void;
  onEquals: () => void;
  onBackspace: () => void;
  onClear: () => void;
}

export interface KeypadKey {
  id: string;
  label: string;
  ariaLabel: string;
  variant: ButtonVariant;
  span2?: boolean;
  onClick: () => void;
}
