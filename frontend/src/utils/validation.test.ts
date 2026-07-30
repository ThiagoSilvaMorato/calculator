import { describe, expect, it } from 'vitest';
import {
  appendDecimalPoint,
  appendDigit,
  formatDisplayValue,
  formatResultValue,
  parseCleanNumber,
  removeLastChar,
} from './validation';

describe('appendDigit', () => {
  it('starts a fresh value from an empty string', () => {
    expect(appendDigit('', '7')).toBe('7');
  });

  it('replaces a lone leading zero instead of concatenating', () => {
    expect(appendDigit('0', '5')).toBe('5');
  });

  it('appends digits after a non-zero value', () => {
    expect(appendDigit('12', '3')).toBe('123');
  });

  it('appends digits after a decimal point, including trailing zeros', () => {
    expect(appendDigit('0.', '5')).toBe('0.5');
    expect(appendDigit('1.5', '0')).toBe('1.50');
  });
});

describe('appendDecimalPoint', () => {
  it('shows "0." when pressed on an empty value', () => {
    expect(appendDecimalPoint('')).toBe('0.');
  });

  it('appends a decimal point to a value that has none', () => {
    expect(appendDecimalPoint('12')).toBe('12.');
  });

  it('does not add a second decimal point', () => {
    expect(appendDecimalPoint('12.5')).toBe('12.5');
    expect(appendDecimalPoint('12.')).toBe('12.');
  });
});

describe('removeLastChar', () => {
  it('removes the last character', () => {
    expect(removeLastChar('123')).toBe('12');
  });

  it('removes a trailing decimal point', () => {
    expect(removeLastChar('12.')).toBe('12');
  });

  it('returns an empty string once everything is removed', () => {
    expect(removeLastChar('1')).toBe('');
    expect(removeLastChar('')).toBe('');
  });
});

describe('parseCleanNumber', () => {
  it('parses whole and decimal values', () => {
    expect(parseCleanNumber('1234')).toBe(1234);
    expect(parseCleanNumber('1234.5')).toBe(1234.5);
  });

  it('treats a trailing decimal point as the whole number', () => {
    expect(parseCleanNumber('12.')).toBe(12);
  });

  it('treats an empty value as zero', () => {
    expect(parseCleanNumber('')).toBe(0);
  });

  it('parses negative values (e.g. a previous result)', () => {
    expect(parseCleanNumber('-5')).toBe(-5);
  });
});

describe('formatDisplayValue', () => {
  it('returns an empty string for an empty value', () => {
    expect(formatDisplayValue('')).toBe('');
  });

  it('formats thousands separators on the integer part while typing', () => {
    expect(formatDisplayValue('1000')).toBe('1,000');
    expect(formatDisplayValue('1000000')).toBe('1,000,000');
  });

  it('preserves an in-progress decimal part exactly as typed', () => {
    expect(formatDisplayValue('1000.')).toBe('1,000.');
    expect(formatDisplayValue('1000.25')).toBe('1,000.25');
    expect(formatDisplayValue('1000000.75')).toBe('1,000,000.75');
    expect(formatDisplayValue('1.50')).toBe('1.50');
  });

  it('formats a negative value (e.g. a negative result)', () => {
    expect(formatDisplayValue('-1000')).toBe('-1,000');
  });
});

describe('formatResultValue', () => {
  it('formats an integer result with thousands separators', () => {
    expect(formatResultValue(1000)).toBe('1,000');
  });

  it('formats a decimal result with thousands separators', () => {
    expect(formatResultValue(1000000.75)).toBe('1,000,000.75');
  });

  it('formats a negative result', () => {
    expect(formatResultValue(-5)).toBe('-5');
  });

  it('caps floating-point noise to a reasonable number of decimal places', () => {
    expect(formatResultValue(0.1 + 0.2)).toBe('0.3');
  });
});
