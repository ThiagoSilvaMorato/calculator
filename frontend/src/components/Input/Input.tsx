import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Text } from '../Text';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const FIELD_CLASSES = 'flex flex-col gap-1.5';
const LABEL_CLASSES = 'text-sm font-semibold text-gray-700';
const INPUT_BASE_CLASSES = 'rounded-md border px-3 py-2.5 text-gray-900 focus:outline-2 focus:outline-gray-500';
const ERROR_TEXT_CLASSES = 'text-xs text-red-600';

export function Input({ label, error, id, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const inputClasses = [
    INPUT_BASE_CLASSES,
    error ? 'border-red-600' : 'border-gray-300',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={FIELD_CLASSES}>
      {label && (
        <label htmlFor={inputId} className={LABEL_CLASSES}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={inputClasses}
        {...rest}
      />
      {error && (
        <Text as="span" id={errorId} role="alert" className={ERROR_TEXT_CLASSES}>
          {error}
        </Text>
      )}
    </div>
  );
}
