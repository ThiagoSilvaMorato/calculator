import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Text } from './Text';

describe('Text', () => {
  it('renders as a paragraph by default', () => {
    render(<Text>Hello</Text>);

    const element = screen.getByText('Hello');
    expect(element.tagName).toBe('P');
  });

  it('renders the tag given by the "as" prop', () => {
    render(<Text as="span">Hello</Text>);

    expect(screen.getByText('Hello').tagName).toBe('SPAN');
  });

  it('forwards arbitrary props such as role and id', () => {
    render(
      <Text as="span" role="alert" id="my-text">
        Error!
      </Text>,
    );

    const element = screen.getByRole('alert');
    expect(element).toHaveAttribute('id', 'my-text');
  });

  it('merges a custom className with its own styling', () => {
    render(<Text className="custom">Hello</Text>);

    expect(screen.getByText('Hello')).toHaveClass('custom');
  });
});
