import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentUser, setAuthToken } from './api';

describe('api request localStorage fallback', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Reset global fetch mock
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Test User' }),
    });
    setAuthToken(null);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should ignore exception when localStorage access throws', async () => {
    // Mock window.localStorage to throw an exception
    const originalLocalStorage = window.localStorage;

    Object.defineProperty(window, 'localStorage', {
      get: () => {
        throw new Error('Access denied');
      },
      configurable: true
    });

    // This should not throw, it should swallow the error and proceed without a token
    const result = await getCurrentUser();

    expect(result).toEqual({ id: 1, name: 'Test User' });

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const headers = fetchCall[1]?.headers as Record<string, string>;
    expect(headers?.Authorization).toBeUndefined();

    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true
    });
  });

  it('should ignore exception when JSON.parse throws', async () => {
    // Set invalid JSON in localStorage
    window.localStorage.setItem('spedex.dashboard.session', 'invalid json');

    // This should not throw, it should swallow the error and proceed without a token
    const result = await getCurrentUser();

    expect(result).toEqual({ id: 1, name: 'Test User' });

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const headers = fetchCall[1]?.headers as Record<string, string>;
    expect(headers?.Authorization).toBeUndefined();

    window.localStorage.removeItem('spedex.dashboard.session');
  });
});
