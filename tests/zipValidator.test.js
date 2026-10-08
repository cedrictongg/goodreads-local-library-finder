import { isValidUsZip } from '../src/utils/zipValidator.js';

describe('isValidUsZip', () => {
  test('accepts a standard 5-digit ZIP', () => {
    expect(isValidUsZip('91754')).toBe(true);
  });

  test('accepts ZIP+4', () => {
    expect(isValidUsZip('91754-1234')).toBe(true);
  });

  test('handles leading and trailing whitespace', () => {
    expect(isValidUsZip(' 91754 ')).toBe(true);
    expect(isValidUsZip('\t91754-1234\n')).toBe(true);
  });

  test('accepts numeric input', () => {
    expect(isValidUsZip(91754)).toBe(true);
  });

  test('rejects letters', () => {
    expect(isValidUsZip('ABCDE')).toBe(false);
  });

  test('rejects empty string or whitespace only', () => {
    expect(isValidUsZip('')).toBe(false);
    expect(isValidUsZip('   ')).toBe(false);
  });

  test('rejects null and undefined', () => {
    expect(isValidUsZip(null)).toBe(false);
    expect(isValidUsZip(undefined)).toBe(false);
  });

  test('rejects invalid lengths and digits', () => {
    expect(isValidUsZip('9175')).toBe(false);
    expect(isValidUsZip('917540')).toBe(false);
    expect(isValidUsZip('91754-123')).toBe(false);
    expect(isValidUsZip('91754-12345')).toBe(false);
    expect(isValidUsZip('917541234')).toBe(false);
  });

  test('rejects invalid characters and spaces inside ZIP', () => {
    expect(isValidUsZip('917 54')).toBe(false);
    expect(isValidUsZip('91754!')).toBe(false);
    expect(isValidUsZip('91754+1234')).toBe(false);
  });
});
