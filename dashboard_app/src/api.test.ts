import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from './api';

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('login', () => {
    it('should call fetch with the correct arguments', async () => {
      const mockResponse = { access_token: 'test_token', token_type: 'bearer' };
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await login({ email: 'test@example.com', password: 'password123' });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the response is not ok', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Unauthorized' }),
      } as Response);

      await expect(login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow('Unauthorized');
    });

    it('should throw a default error if response is not ok and no detail is provided', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

      await expect(login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow('Request failed with 500');
    });
  });
});
