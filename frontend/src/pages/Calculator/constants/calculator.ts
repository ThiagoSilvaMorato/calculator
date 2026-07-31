import type { Operation } from "../models/calculator";

export const OPERATION_SYMBOLS: Record<Operation, string> = {
  addition: "+",
  subtraction: "-",
  multiplication: "*",
  division: "/",
};

export const KEY_TO_OPERATION: Record<string, Operation> = Object.fromEntries(
  (Object.entries(OPERATION_SYMBOLS) as [Operation, string][]).map(([op, symbol]) => [symbol, op]),
);

export const KEY_PRESS_HIGHLIGHT_MS = 150;

export const KEYPAD_BUTTON_IDS = {
  backspace: "backspace",
  clear: "clear",
  decimal: "decimal",
  equals: "equals",
} as const;

export function digitButtonId(digit: string): string {
  return `digit-${digit}`;
}

export const SECOND_VALUE_REQUIRED_ERROR = "Second value is required";
