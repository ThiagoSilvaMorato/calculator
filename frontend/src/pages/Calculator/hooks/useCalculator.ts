import { useEffect, useRef, useState } from "react";
import { calculate } from "../../../services/calculatorApi";
import {
  appendDecimalPoint,
  appendDigit,
  formatDisplayValue,
  formatResultValue,
  parseCleanNumber,
  removeLastChar,
} from "../../../utils/validation";
import type { CalculationOutcome, Operation } from "../../../types/calculator";

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

const OPERATION_SYMBOLS: Record<Operation, string> = {
  addition: "+",
  subtraction: "-",
  multiplication: "*",
  division: "/",
};

const KEY_TO_OPERATION: Record<string, Operation> = Object.fromEntries(
  (Object.entries(OPERATION_SYMBOLS) as [Operation, string][]).map(([op, symbol]) => [symbol, op]),
);

const KEY_PRESS_HIGHLIGHT_MS = 150;

function describeOperand(value: number, operationSymbol: string): string {
  return `${formatResultValue(value)} ${operationSymbol}`;
}
function keyToButtonId(key: string): string | null {
  if (key >= "0" && key <= "9") {
    return `digit-${key}`;
  }
  if (key === ".") {
    return "decimal";
  }
  if (key in KEY_TO_OPERATION) {
    return KEY_TO_OPERATION[key];
  }
  if (key === "Enter" || key === "=") {
    return "equals";
  }
  if (key === "Backspace") {
    return "backspace";
  }
  if (key === "Escape") {
    return "clear";
  }
  return null;
}

export function useCalculator(): UseCalculatorResult {
  const [currentValue, setCurrentValue] = useState("");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation | null>(null);
  const [expression, setExpression] = useState("");
  const [justCalculated, setJustCalculated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pressedButtonId, setPressedButtonId] = useState<string | null>(null);

  const requestToken = useRef(0);
  const pressHighlightTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startFresh = (initialValue: string) => {
    setCurrentValue(initialValue);
    setExpression("");
    setFirstOperand(null);
    setOperation(null);
    setJustCalculated(false);
  };

  const runCalculation = async (
    op: Operation,
    first: number,
    second: number,
  ): Promise<CalculationOutcome | null> => {
    const token = ++requestToken.current;
    setIsLoading(true);
    const outcome = await calculate(op, first, second);
    if (token !== requestToken.current) {
      return null;
    }
    setIsLoading(false);
    return outcome;
  };

  const onDigit = (digit: string) => {
    setError(null);
    if (justCalculated) {
      startFresh(appendDigit("", digit));
      return;
    }
    setCurrentValue(appendDigit(currentValue, digit));
  };

  const onDecimalPoint = () => {
    setError(null);
    if (justCalculated) {
      startFresh("0.");
      return;
    }
    setCurrentValue(appendDecimalPoint(currentValue));
  };

  const onOperation = async (nextOperation: Operation) => {
    setError(null);
    if (isLoading) {
      return;
    }

    const hasPendingOperation = !justCalculated && firstOperand !== null && operation !== null;
    const hasTypedSecondOperand = currentValue !== "";

    if (hasPendingOperation && !hasTypedSecondOperand) {
      setOperation(nextOperation);
      setExpression(describeOperand(firstOperand, OPERATION_SYMBOLS[nextOperation]));
      return;
    }

    if (hasPendingOperation && hasTypedSecondOperand) {
      const secondOperand = parseCleanNumber(currentValue);
      const outcome = await runCalculation(operation, firstOperand, secondOperand);
      if (outcome === null) {
        return;
      }
      if (!outcome.ok) {
        setError(outcome.error);
        return;
      }

      setFirstOperand(outcome.result);
      setOperation(nextOperation);
      setExpression(describeOperand(outcome.result, OPERATION_SYMBOLS[nextOperation]));
      setCurrentValue("");
      return;
    }

    const operand = currentValue !== "" ? parseCleanNumber(currentValue) : (firstOperand ?? 0);
    setFirstOperand(operand);
    setOperation(nextOperation);
    setExpression(describeOperand(operand, OPERATION_SYMBOLS[nextOperation]));
    setCurrentValue("");
    setJustCalculated(false);
  };

  const onEquals = async () => {
    setError(null);
    if (isLoading || operation === null || firstOperand === null) {
      return;
    }
    if (currentValue === "") {
      setError("Second value is required");
      return;
    }

    const activeOperation = operation;
    const activeFirstOperand = firstOperand;
    const secondOperand = parseCleanNumber(currentValue);

    const outcome = await runCalculation(activeOperation, activeFirstOperand, secondOperand);
    if (outcome === null) {
      return;
    }

    if (outcome.ok) {
      const equation = describeOperand(activeFirstOperand, OPERATION_SYMBOLS[activeOperation]);
      setExpression(`${equation} ${formatResultValue(secondOperand)} =`);
      setCurrentValue(String(outcome.result));
      setFirstOperand(null);
      setOperation(null);
      setJustCalculated(true);
    } else {
      setError(outcome.error);
    }
  };

  const onBackspace = () => {
    if (isLoading) {
      return;
    }
    setError(null);
    setCurrentValue((prev) => removeLastChar(prev));
    setJustCalculated(false);
  };

  const onClear = () => {
    requestToken.current += 1;
    setCurrentValue("");
    setFirstOperand(null);
    setOperation(null);
    setExpression("");
    setJustCalculated(false);
    setError(null);
    setIsLoading(false);
  };

  const flashPressedButton = (buttonId: string | null) => {
    if (buttonId === null) {
      return;
    }
    if (pressHighlightTimeout.current !== null) {
      clearTimeout(pressHighlightTimeout.current);
    }
    setPressedButtonId(buttonId);
    pressHighlightTimeout.current = setTimeout(() => {
      setPressedButtonId(null);
      pressHighlightTimeout.current = null;
    }, KEY_PRESS_HIGHLIGHT_MS);
  };

  useEffect(() => {
    return () => {
      if (pressHighlightTimeout.current !== null) {
        clearTimeout(pressHighlightTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      flashPressedButton(keyToButtonId(event.key));

      if (event.key >= "0" && event.key <= "9") {
        event.preventDefault();
        onDigit(event.key);
      } else if (event.key === ".") {
        event.preventDefault();
        onDecimalPoint();
      } else if (event.key in KEY_TO_OPERATION) {
        event.preventDefault();
        void onOperation(KEY_TO_OPERATION[event.key]);
      } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        void onEquals();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        onBackspace();
      } else if (event.key === "Escape") {
        event.preventDefault();
        onClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    display: formatDisplayValue(currentValue),
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
  };
}
