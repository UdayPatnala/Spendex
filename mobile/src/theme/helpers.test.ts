import { formatCurrency } from './helpers';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(10)).toBe('$10.00');
    expect(formatCurrency(10.5)).toBe('$10.50');
    expect(formatCurrency(10.55)).toBe('$10.55');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-10)).toBe('$-10.00');
  });
});
