import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CalculatorForm } from './CalculatorForm';
import type { CalculatorFormProps } from './models';

function renderForm(overrides: Partial<CalculatorFormProps> = {}) {
  const props: CalculatorFormProps = {
    display: '',
    expression: '',
    error: null,
    isLoading: false,
    pressedButtonId: null,
    onDigit: vi.fn(),
    onDecimalPoint: vi.fn(),
    onOperation: vi.fn(),
    onEquals: vi.fn(),
    onBackspace: vi.fn(),
    onClear: vi.fn(),
    ...overrides,
  };
  render(<CalculatorForm {...props} />);
  return props;
}

describe('CalculatorForm', () => {
  it('renders the expression and main display', () => {
    renderForm({ expression: '1,234 +', display: '5' });

    expect(screen.getByLabelText('Expression')).toHaveTextContent('1,234 +');
    expect(screen.getByLabelText('Display')).toHaveTextContent('5');
  });

  it('renders every digit 0-9', () => {
    renderForm();

    for (const digit of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      expect(screen.getByRole('button', { name: digit })).toBeInTheDocument();
    }
  });

  it('renders the operators, decimal point, equals, AC, and backspace keys', () => {
    renderForm();

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Subtract' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Multiply' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Divide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decimal point' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All clear' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Backspace' })).toBeInTheDocument();
  });

  it('calls onDigit with the pressed digit', () => {
    const props = renderForm();

    fireEvent.click(screen.getByRole('button', { name: '7' }));

    expect(props.onDigit).toHaveBeenCalledWith('7');
  });

  it('calls onOperation with the corresponding operation for each operator key', () => {
    const props = renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: 'Subtract' }));
    fireEvent.click(screen.getByRole('button', { name: 'Multiply' }));
    fireEvent.click(screen.getByRole('button', { name: 'Divide' }));

    expect(props.onOperation).toHaveBeenNthCalledWith(1, 'addition');
    expect(props.onOperation).toHaveBeenNthCalledWith(2, 'subtraction');
    expect(props.onOperation).toHaveBeenNthCalledWith(3, 'multiplication');
    expect(props.onOperation).toHaveBeenNthCalledWith(4, 'division');
  });

  it('calls onDecimalPoint, onEquals, onClear, and onBackspace', () => {
    const props = renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Decimal point' }));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    fireEvent.click(screen.getByRole('button', { name: 'All clear' }));
    fireEvent.click(screen.getByRole('button', { name: 'Backspace' }));

    expect(props.onDecimalPoint).toHaveBeenCalledTimes(1);
    expect(props.onEquals).toHaveBeenCalledTimes(1);
    expect(props.onClear).toHaveBeenCalledTimes(1);
    expect(props.onBackspace).toHaveBeenCalledTimes(1);
  });

  it('shows an accessible error message when error is set', () => {
    renderForm({ error: 'division by zero is not allowed' });

    expect(screen.getByRole('alert')).toHaveTextContent('division by zero is not allowed');
  });

  it('shows no error region when error is null', () => {
    renderForm();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables every keypad button and shows loading feedback while isLoading', () => {
    renderForm({ isLoading: true });

    expect(screen.getByRole('button', { name: '7' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'All clear' })).toBeDisabled();
    expect(screen.getByText(/calculating/i)).toBeInTheDocument();
  });

  it('shows the button matching pressedButtonId as visually pressed', () => {
    renderForm({ pressedButtonId: 'digit-7' });

    const seven = screen.getByRole('button', { name: '7' });
    const eight = screen.getByRole('button', { name: '8' });

    expect(seven.className).not.toBe(eight.className);
  });

  it('does not mark any button as pressed when pressedButtonId is null', () => {
    renderForm({ pressedButtonId: null });

    const seven = screen.getByRole('button', { name: '7' });
    const eight = screen.getByRole('button', { name: '8' });

    expect(seven.className).toBe(eight.className);
  });
});
