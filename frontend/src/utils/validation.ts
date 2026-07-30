const MAX_RESULT_DECIMALS = 10;

export function appendDigit(value: string, digit: string): string {
  if (value === "0") {
    return digit;
  }
  return value + digit;
}

export function appendDecimalPoint(value: string): string {
  if (value.includes(".")) {
    return value;
  }
  return value === "" ? "0." : `${value}.`;
}

export function removeLastChar(value: string): string {
  return value.slice(0, -1);
}

export function parseCleanNumber(value: string): number {
  if (value === "" || value === ".") {
    return 0;
  }
  const withoutTrailingPoint = value.endsWith(".") ? value.slice(0, -1) : value;
  return Number(withoutTrailingPoint);
}

export function formatDisplayValue(value: string): string {
  if (value === "") {
    return "";
  }

  const isNegative = value.startsWith("-");
  const unsigned = isNegative ? value.slice(1) : value;
  const [integerPart, decimalPart] = unsigned.split(".");
  const formattedInteger = integerPart === "" ? "" : Number(integerPart).toLocaleString("en-US");
  const sign = isNegative ? "-" : "";

  return decimalPart === undefined
    ? `${sign}${formattedInteger}`
    : `${sign}${formattedInteger}.${decimalPart}`;
}

export function formatResultValue(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: MAX_RESULT_DECIMALS });
}
