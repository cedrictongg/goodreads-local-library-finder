import { isValidUsZip } from '../src/utils/zipValidator.js';

describe('isValidUsZip', () => {
  test('accepts a standard 5-digit ZIP', () => {
    expect(isValidUsZip('91754')).toBe(true);
  });

  test('accepts ZIP+4', () => {
    expect(isValidUsZip('91754-1234')).toBe(true);
  });

  test('rejects letters', () => {
    expect(isValidUsZip('ABCDE')).toBe(false);
  });

  test('rejects empty string', () => {
    expect(isValidUsZip('')).toBe(false);
  });
});
