import { describe, expect, test } from 'bun:test';
import {
  calculateErrorMs,
  formatDuration,
  isValidErrorMs,
  sanitizePlayerName,
} from '../src/lib/timer-game';

describe('timer game score contract', () => {
  test('records a 0.999 second 1s attempt as one millisecond off', () => {
    expect(calculateErrorMs(999, 1)).toBe(1);
  });

  test('accepts perfect and near-perfect attempts', () => {
    expect(isValidErrorMs(0)).toBe(true);
    expect(isValidErrorMs(1)).toBe(true);
    expect(isValidErrorMs(30_000)).toBe(true);
    expect(isValidErrorMs(30_001)).toBe(false);
  });

  test('formats the persisted millisecond value consistently', () => {
    expect(formatDuration(1)).toBe('0.001s');
    expect(formatDuration(131)).toBe('0.131s');
  });

  test('normalizes display names before persistence', () => {
    expect(sanitizePlayerName(' Fy zan! ')).toBe('Fyzan');
  });
});
