import { Button } from "../../../../components/Button";
import { Text } from "../../../../components/Text";
import { digitButtonId, KEYPAD_BUTTON_IDS, OPERATION_SYMBOLS } from "../../constants/calculator";
import type { Operation } from "../../models/calculator";
import type { CalculatorFormProps, KeypadKey } from "./models";

const NBSP = " ";

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
    id: digitButtonId(digit),
    label: digit,
    ariaLabel: digit,
    variant: "secondary",
    onClick: () => onDigit(digit),
  });

  const operatorKey = (operation: Operation, ariaLabel: string): KeypadKey => ({
    id: operation,
    label: OPERATION_SYMBOLS[operation],
    ariaLabel,
    variant: "primary",
    onClick: () => onOperation(operation),
  });

  const keys: KeypadKey[] = [
    {
      id: KEYPAD_BUTTON_IDS.backspace,
      label: "←",
      ariaLabel: "Backspace",
      variant: "muted",
      onClick: onBackspace,
    },
    {
      id: KEYPAD_BUTTON_IDS.clear,
      label: "AC",
      ariaLabel: "All clear",
      variant: "muted",
      span2: true,
      onClick: onClear,
    },
    operatorKey("division", "Divide"),

    digitKey("7"),
    digitKey("8"),
    digitKey("9"),
    operatorKey("multiplication", "Multiply"),

    digitKey("4"),
    digitKey("5"),
    digitKey("6"),
    operatorKey("subtraction", "Subtract"),

    digitKey("1"),
    digitKey("2"),
    digitKey("3"),
    operatorKey("addition", "Add"),

    { ...digitKey("0"), span2: true },
    {
      id: KEYPAD_BUTTON_IDS.decimal,
      label: ".",
      ariaLabel: "Decimal point",
      variant: "secondary",
      onClick: onDecimalPoint,
    },
    {
      id: KEYPAD_BUTTON_IDS.equals,
      label: "=",
      ariaLabel: "Calculate",
      variant: "primary",
      onClick: onEquals,
    },
  ];

  return (
    <div className='flex flex-col gap-4'>
      <div className='rounded-md bg-gray-200 px-4 py-3 text-right h-20'>
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
