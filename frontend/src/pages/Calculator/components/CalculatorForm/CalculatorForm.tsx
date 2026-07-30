import { Button } from "../../../../components/Button";
import type { ButtonVariant } from "../../../../components/Button";
import { Text } from "../../../../components/Text";
import type { Operation } from "../../../../types/calculator";

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

interface KeypadKey {
  id: string;
  label: string;
  ariaLabel: string;
  variant: ButtonVariant;
  span2?: boolean;
  onClick: () => void;
}

const NBSP = " ";

export function CalculatorForm({
  display,
  expression,
  error,
  isLoading,
  pressedButtonId,
  onDigit,
  onDecimalPoint,
  onOperation,
  onEquals,
  onBackspace,
  onClear,
}: CalculatorFormProps) {
  const digitKey = (digit: string): KeypadKey => ({
    id: `digit-${digit}`,
    label: digit,
    ariaLabel: digit,
    variant: "secondary",
    onClick: () => onDigit(digit),
  });

  const operatorKey = (operation: Operation, label: string, ariaLabel: string): KeypadKey => ({
    id: operation,
    label,
    ariaLabel,
    variant: "primary",
    onClick: () => onOperation(operation),
  });

  const keys: KeypadKey[] = [
    { id: "backspace", label: "←", ariaLabel: "Backspace", variant: "muted", onClick: onBackspace },
    {
      id: "clear",
      label: "AC",
      ariaLabel: "All clear",
      variant: "muted",
      span2: true,
      onClick: onClear,
    },
    operatorKey("division", "/", "Divide"),

    digitKey("7"),
    digitKey("8"),
    digitKey("9"),
    operatorKey("multiplication", "*", "Multiply"),

    digitKey("4"),
    digitKey("5"),
    digitKey("6"),
    operatorKey("subtraction", "-", "Subtract"),

    digitKey("1"),
    digitKey("2"),
    digitKey("3"),
    operatorKey("addition", "+", "Add"),

    { ...digitKey("0"), span2: true },
    {
      id: "decimal",
      label: ".",
      ariaLabel: "Decimal point",
      variant: "secondary",
      onClick: onDecimalPoint,
    },
    { id: "equals", label: "=", ariaLabel: "Calculate", variant: "primary", onClick: onEquals },
  ];

  return (
    <div className='flex flex-col gap-4'>
      <div className='rounded-md bg-gray-200 px-4 py-3 text-right'>
        <Text as='p' aria-label='Expression' className='h-5 text-sm text-gray-500 font-bold'>
          {expression || NBSP}
        </Text>
        <Text as='p' aria-label='Display' className='overflow-x-auto text-3xl font-bold text-black'>
          {display || NBSP}
        </Text>
      </div>

      {isLoading && <Text className='text-sm text-gray-500'>Calculating…</Text>}

      {error !== null && (
        <Text role='alert' className='rounded-md bg-red-50 px-4 py-3 text-sm text-red-600'>
          {error}
        </Text>
      )}

      <div className='grid grid-cols-4 gap-2'>
        {keys.map((key) => (
          <Button
            key={key.id}
            type='button'
            variant={key.variant}
            pressed={key.id === pressedButtonId}
            aria-label={key.ariaLabel}
            disabled={isLoading}
            onClick={key.onClick}
            className={key.span2 ? "col-span-2" : undefined}
          >
            {key.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
