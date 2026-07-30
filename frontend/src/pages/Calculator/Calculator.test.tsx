import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Calculator } from './Calculator';

describe('Calculator', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the display, expression, and full keypad', () => {
    render(<Calculator />);

    expect(screen.getByLabelText('Display')).toBeInTheDocument();
    expect(screen.getByLabelText('Expression')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument();
  });

  it('performs a full calculation end-to-end through the mocked API', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: 15 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<Calculator />);

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));

    await waitFor(() => expect(screen.getByLabelText('Display')).toHaveTextContent('15'));
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/calculator/addition',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
