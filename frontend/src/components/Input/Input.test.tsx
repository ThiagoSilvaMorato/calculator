import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('associates a label with the input', () => {
    render(<Input label="First operand" value="" onChange={() => {}} />);

    expect(screen.getByLabelText('First operand')).toBeInTheDocument();
  });

  it('calls onChange when the value changes', () => {
    const onChange = vi.fn();
    render(<Input label="First operand" value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('First operand'), { target: { value: '10' } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('renders no error UI when no error is given', () => {
    render(<Input label="First operand" value="" onChange={() => {}} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('First operand')).not.toHaveAttribute('aria-invalid');
  });

  it('shows an accessible error message when error is given', () => {
    render(<Input label="First operand" value="" onChange={() => {}} error="This field is required" />);

    const input = screen.getByLabelText('First operand');
    const errorMessage = screen.getByRole('alert');

    expect(errorMessage).toHaveTextContent('This field is required');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', errorMessage.id);
  });
});
