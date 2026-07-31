import { useId } from 'react';
import { Text } from '../Text';
import { ERROR_TEXT_CLASSES, FIELD_CLASSES, INPUT_BASE_CLASSES, LABEL_CLASSES } from './constants';
import type { InputProps } from './models';

export function Input({ label, error, id, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const inputClasses = [INPUT_BASE_CLASSES, error ? 'border-red-600' : 'border-gray-300', className]
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
