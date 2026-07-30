import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('allows overriding the type, e.g. to "submit"', () => {
    render(<Button type="submit">Save</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Click me
      </Button>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('defaults to the primary variant', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button').className).toContain('bg-gray-700');
  });

  it('renders visually distinct variants', () => {
    render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="muted">Muted</Button>
      </>,
    );

    const primary = screen.getByRole('button', { name: 'Primary' }).className;
    const secondary = screen.getByRole('button', { name: 'Secondary' }).className;
    const muted = screen.getByRole('button', { name: 'Muted' }).className;

    expect(new Set([primary, secondary, muted]).size).toBe(3);
  });

  it('applies the same visual weight as :active when pressed is true', () => {
    render(<Button variant="primary">Click me</Button>);
    const resting = screen.getByRole('button').className;

    render(<Button variant="primary" pressed>Click me</Button>);
    const pressedClassNames = screen.getAllByRole('button', { name: 'Click me' })[1].className;

    expect(pressedClassNames).not.toBe(resting);
    // Matches the same shade the primary variant's `active:` (real mouse
    // press) style already uses, so keyboard-triggered feedback looks
    // identical to a mouse click.
    expect(pressedClassNames).toContain('bg-gray-900');
  });
});
