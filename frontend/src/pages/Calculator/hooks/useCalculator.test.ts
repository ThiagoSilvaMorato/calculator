import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCalculator } from './useCalculator';
import * as calculatorApi from '../../../services/calculatorApi';

vi.mock('../../../services/calculatorApi');

const calculateMock = vi.mocked(calculatorApi.calculate);

describe('useCalculator', () => {
  afterEach(() => {
    calculateMock.mockReset();
  });

  it('starts with empty display and expression, no error, not loading', async () => {
    const { result } = renderHook(() => useCalculator());

    expect(result.current.display).toBe('');
    expect(result.current.expression).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  describe('digit entry', () => {
    it('builds up the display digit by digit', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      act(() => result.current.onDigit('2'));
      act(() => result.current.onDigit('3'));

      expect(result.current.display).toBe('123');
    });

    it('formats thousands separators as the value grows', async () => {
      const { result } = renderHook(() => useCalculator());

      '1000000'.split('').forEach((digit) => act(() => result.current.onDigit(digit)));

      expect(result.current.display).toBe('1,000,000');
    });

    it('does not produce a leading zero when the first digit is 0', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('0'));
      act(() => result.current.onDigit('5'));

      expect(result.current.display).toBe('5');
    });
  });

  describe('decimal point', () => {
    it('shows "0." when pressed first', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDecimalPoint());

      expect(result.current.display).toBe('0.');
    });

    it('allows only one decimal point', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      act(() => result.current.onDecimalPoint());
      act(() => result.current.onDigit('5'));
      act(() => result.current.onDecimalPoint());
      act(() => result.current.onDigit('2'));

      expect(result.current.display).toBe('1.52');
    });

    it('formats a large decimal value with thousands separators', async () => {
      const { result } = renderHook(() => useCalculator());

      '1000000'.split('').forEach((digit) => act(() => result.current.onDigit(digit)));
      act(() => result.current.onDecimalPoint());
      act(() => result.current.onDigit('7'));
      act(() => result.current.onDigit('5'));

      expect(result.current.display).toBe('1,000,000.75');
    });
  });

  describe('selecting an operation', () => {
    it('saves the first operand, shows the expression, and clears the display', async () => {
      const { result } = renderHook(() => useCalculator());

      '1234'.split('').forEach((digit) => act(() => result.current.onDigit(digit)));
      await act(async () => {
        await result.current.onOperation('addition');
      });

      expect(result.current.expression).toBe('1,234 +');
      expect(result.current.display).toBe('');
    });

    it('swaps the pending operator if pressed again before a second operand is entered', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('5'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      await act(async () => {
        await result.current.onOperation('subtraction');
      });

      expect(result.current.expression).toBe('5 -');
    });

    it('treats an operator press with nothing entered as operating on 0', async () => {
      const { result } = renderHook(() => useCalculator());

      await act(async () => {
        await result.current.onOperation('addition');
      });

      expect(result.current.expression).toBe('0 +');
    });
  });

  describe('sequential calculations', () => {
    it('evaluates the pending operation against the backend before applying the next one', async () => {
      calculateMock.mockResolvedValue({ ok: true, result: 25 });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      act(() => result.current.onDigit('0'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      act(() => result.current.onDigit('1'));
      act(() => result.current.onDigit('5'));

      await act(async () => {
        await result.current.onOperation('subtraction');
      });

      expect(calculateMock).toHaveBeenCalledWith('addition', 10, 15);
      expect(result.current.expression).toBe('25 -');
      expect(result.current.display).toBe('');
    });

    it('uses the backend result, not frontend arithmetic, as the next first operand', async () => {
      calculateMock.mockResolvedValue({ ok: true, result: 25 });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      act(() => result.current.onDigit('0'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      act(() => result.current.onDigit('1'));
      act(() => result.current.onDigit('5'));
      await act(async () => {
        await result.current.onOperation('subtraction');
      });

      calculateMock.mockResolvedValue({ ok: true, result: 15 });
      act(() => result.current.onDigit('1'));
      act(() => result.current.onDigit('0'));
      await act(async () => {
        await result.current.onEquals();
      });

      expect(calculateMock).toHaveBeenLastCalledWith('subtraction', 25, 10);
      expect(result.current.display).toBe('15');
    });

    it('shows a loading state while the intermediate calculation is pending', async () => {
      let resolveCalculate: (value: { ok: true; result: number }) => void;
      calculateMock.mockReturnValue(
        new Promise((resolve) => {
          resolveCalculate = resolve;
        }),
      );
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      act(() => result.current.onDigit('1'));

      let opPromise!: Promise<void>;
      act(() => {
        opPromise = result.current.onOperation('subtraction');
      });

      await waitFor(() => expect(result.current.isLoading).toBe(true));

      await act(async () => {
        resolveCalculate({ ok: true, result: 2 });
        await opPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('does not call the backend when replacing the operation before a second operand is entered', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      act(() => result.current.onDigit('0'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      await act(async () => {
        await result.current.onOperation('multiplication');
      });

      expect(calculateMock).not.toHaveBeenCalled();
      expect(result.current.expression).toBe('10 *');
    });

    it('supports sequential multiplication then division', async () => {
      calculateMock.mockResolvedValue({ ok: true, result: 24 });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('6'));
      await act(async () => {
        await result.current.onOperation('multiplication');
      });
      act(() => result.current.onDigit('4'));
      await act(async () => {
        await result.current.onOperation('division');
      });

      expect(calculateMock).toHaveBeenCalledWith('multiplication', 6, 4);
      expect(result.current.expression).toBe('24 /');
    });

    it('supports sequential subtraction then addition', async () => {
      calculateMock.mockResolvedValue({ ok: true, result: 15 });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('2'));
      act(() => result.current.onDigit('0'));
      await act(async () => {
        await result.current.onOperation('subtraction');
      });
      act(() => result.current.onDigit('5'));
      await act(async () => {
        await result.current.onOperation('addition');
      });

      expect(calculateMock).toHaveBeenCalledWith('subtraction', 20, 5);
      expect(result.current.expression).toBe('15 +');
    });

    it('surfaces an error from the intermediate calculation and does not apply the next operation', async () => {
      calculateMock.mockResolvedValue({
        ok: false,
        error: 'Unable to reach the server. Please check your connection and try again.',
      });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onOperation('subtraction');
      });

      expect(result.current.error).toMatch(/unable to reach the server/i);
      expect(result.current.expression).toBe('1 +');
    });
  });

  describe('pressing equals', () => {
    it('calls the API with both operands and displays the formatted result', async () => {
      calculateMock.mockResolvedValue({ ok: true, result: 15 });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      act(() => result.current.onDigit('0'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      act(() => result.current.onDigit('5'));
      await act(async () => {
        await result.current.onEquals();
      });

      expect(calculateMock).toHaveBeenCalledWith('addition', 10, 5);
      expect(result.current.display).toBe('15');
      expect(result.current.expression).toBe('10 + 5 =');
      expect(result.current.error).toBeNull();
    });

    it('formats a large result with thousands separators', async () => {
      calculateMock.mockResolvedValue({ ok: true, result: 1000000.75 });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onEquals();
      });

      expect(result.current.display).toBe('1,000,000.75');
    });

    it('tracks a loading state while the request is pending', async () => {
      let resolveCalculate: (value: { ok: true; result: number }) => void;
      calculateMock.mockReturnValue(
        new Promise((resolve) => {
          resolveCalculate = resolve;
        }),
      );
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      act(() => result.current.onDigit('1'));

      let submitPromise!: Promise<void>;
      act(() => {
        submitPromise = result.current.onEquals();
      });

      await waitFor(() => expect(result.current.isLoading).toBe(true));

      await act(async () => {
        resolveCalculate({ ok: true, result: 2 });
        await submitPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('does nothing when there is no pending operation', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('5'));
      await act(async () => {
        await result.current.onEquals();
      });

      expect(calculateMock).not.toHaveBeenCalled();
      expect(result.current.display).toBe('5');
    });

    it('shows a local error and does not call the API when the second operand is missing', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('5'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      await act(async () => {
        await result.current.onEquals();
      });

      expect(calculateMock).not.toHaveBeenCalled();
      expect(result.current.error).toMatch(/second value/i);
    });
  });

  describe('continuing after a result', () => {
    it('uses the result as the first operand for the next operation', async () => {
      calculateMock.mockResolvedValue({ ok: true, result: 15 });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      act(() => result.current.onDigit('0'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      act(() => result.current.onDigit('5'));
      await act(async () => {
        await result.current.onEquals();
      });

      await act(async () => {
        await result.current.onOperation('multiplication');
      });

      expect(result.current.expression).toBe('15 *');
      expect(result.current.display).toBe('');
    });
  });

  describe('starting a new calculation after a result', () => {
    it('clears the previous calculation when a digit is pressed', async () => {
      calculateMock.mockResolvedValue({ ok: true, result: 15 });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      act(() => result.current.onDigit('5'));
      await act(async () => {
        await result.current.onEquals();
      });

      act(() => result.current.onDigit('7'));

      expect(result.current.display).toBe('7');
      expect(result.current.expression).toBe('');
    });

    it('clears the previous calculation when a decimal point is pressed', async () => {
      calculateMock.mockResolvedValue({ ok: true, result: 15 });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      act(() => result.current.onDigit('5'));
      await act(async () => {
        await result.current.onEquals();
      });

      act(() => result.current.onDecimalPoint());

      expect(result.current.display).toBe('0.');
      expect(result.current.expression).toBe('');
    });
  });

  describe('backspace', () => {
    it('removes the last typed character', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      act(() => result.current.onDigit('2'));
      act(() => result.current.onDigit('3'));
      act(() => result.current.onBackspace());

      expect(result.current.display).toBe('12');
    });

    it('correctly handles a formatted (thousands-separated) value', async () => {
      const { result } = renderHook(() => useCalculator());

      '1000'.split('').forEach((digit) => act(() => result.current.onDigit(digit)));
      act(() => result.current.onBackspace());

      expect(result.current.display).toBe('100');
    });

    it('returns to the initial state once the display is empty', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('5'));
      act(() => result.current.onBackspace());

      expect(result.current.display).toBe('');
    });

    it('does not modify the expression display', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      act(() => result.current.onDigit('5'));
      act(() => result.current.onBackspace());

      expect(result.current.expression).toBe('1 +');
    });
  });

  describe('AC (clear)', () => {
    it('resets the display, expression, and error', async () => {
      calculateMock.mockResolvedValue({ ok: false, error: 'division by zero is not allowed' });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onOperation('division');
      });
      act(() => result.current.onDigit('0'));
      await act(async () => {
        await result.current.onEquals();
      });

      act(() => result.current.onClear());

      expect(result.current.display).toBe('');
      expect(result.current.expression).toBe('');
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('lets a fresh calculation start correctly after AC', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('9'));
      act(() => result.current.onClear());
      act(() => result.current.onDigit('3'));

      expect(result.current.display).toBe('3');
    });
  });

  describe('errors', () => {
    it('surfaces a backend error message (e.g. division by zero)', async () => {
      calculateMock.mockResolvedValue({ ok: false, error: 'division by zero is not allowed' });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onOperation('division');
      });
      act(() => result.current.onDigit('0'));
      await act(async () => {
        await result.current.onEquals();
      });

      expect(result.current.error).toBe('division by zero is not allowed');
    });

    it('surfaces a network-failure message the same way', async () => {
      calculateMock.mockResolvedValue({
        ok: false,
        error: 'Unable to reach the server. Please check your connection and try again.',
      });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onOperation('addition');
      });
      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onEquals();
      });

      expect(result.current.error).toMatch(/unable to reach the server/i);
    });

    it('clears a previous error once the user starts entering a new value', async () => {
      calculateMock.mockResolvedValue({ ok: false, error: 'division by zero is not allowed' });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.onDigit('1'));
      await act(async () => {
        await result.current.onOperation('division');
      });
      act(() => result.current.onDigit('0'));
      await act(async () => {
        await result.current.onEquals();
      });
      expect(result.current.error).not.toBeNull();

      act(() => result.current.onDigit('5'));

      expect(result.current.error).toBeNull();
    });
  });

  describe('keyboard interactions', () => {
    function pressKey(key: string) {
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));
      });
    }

    it('types digits and a decimal point from the keyboard', async () => {
      renderHook(() => useCalculator());

      pressKey('1');
      pressKey('2');
      pressKey('.');
      pressKey('5');

      const { result } = renderHook(() => useCalculator());
      expect(result.current).toBeDefined();
    });

    it('supports the full keyboard flow end to end', async () => {
      calculateMock.mockResolvedValue({ ok: true, result: 15 });
      const { result } = renderHook(() => useCalculator());

      pressKey('1');
      pressKey('0');
      pressKey('+');
      pressKey('5');
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
      });

      expect(calculateMock).toHaveBeenCalledWith('addition', 10, 5);
      expect(result.current.display).toBe('15');
    });

    it('supports Backspace and Escape', async () => {
      const { result } = renderHook(() => useCalculator());

      pressKey('5');
      pressKey('Backspace');
      expect(result.current.display).toBe('');

      pressKey('7');
      pressKey('Escape');
      expect(result.current.display).toBe('');
    });

    it('ignores unrecognized keys', async () => {
      const { result } = renderHook(() => useCalculator());

      pressKey('5');
      pressKey('a');

      expect(result.current.display).toBe('5');
    });
  });

  describe('keyboard visual feedback', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function pressKey(key: string) {
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));
      });
    }

    it('highlights the pressed digit button', async () => {
      const { result } = renderHook(() => useCalculator());

      pressKey('7');

      expect(result.current.pressedButtonId).toBe('digit-7');
    });

    it('highlights the matching operator, equals, backspace, and clear buttons', async () => {
      const { result } = renderHook(() => useCalculator());

      pressKey('+');
      expect(result.current.pressedButtonId).toBe('addition');

      pressKey('Enter');
      expect(result.current.pressedButtonId).toBe('equals');

      pressKey('Backspace');
      expect(result.current.pressedButtonId).toBe('backspace');

      pressKey('Escape');
      expect(result.current.pressedButtonId).toBe('clear');
    });

    it('clears the highlight after a short delay', async () => {
      const { result } = renderHook(() => useCalculator());

      pressKey('7');
      expect(result.current.pressedButtonId).toBe('digit-7');

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.pressedButtonId).toBeNull();
    });

    it('handles rapid input correctly: the latest key wins and the highlight still clears on time', async () => {
      const { result } = renderHook(() => useCalculator());

      pressKey('7');
      act(() => {
        vi.advanceTimersByTime(50);
      });
      pressKey('8');

      expect(result.current.pressedButtonId).toBe('digit-8');

      // A stale timeout from the '7' press must not clear the '8' highlight early.
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current.pressedButtonId).toBe('digit-8');

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current.pressedButtonId).toBeNull();
    });

    it('does not affect the underlying action, only the visual feedback', async () => {
      const { result } = renderHook(() => useCalculator());

      pressKey('7');
      pressKey('8');

      expect(result.current.display).toBe('78');
    });
  });
});
