import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser, login, setAuthToken } from "./api";

describe("api", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, name: "Test User" }),
    }) as typeof globalThis.fetch;
    setAuthToken(null);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    setAuthToken(null);
    vi.restoreAllMocks();
  });

  describe("login", () => {
    it("should call fetch with the correct arguments", async () => {
      const mockResponse = { access_token: "test_token", token_type: "bearer" };
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await login({ email: "test@example.com", password: "password123" });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ email: "test@example.com", password: "password123" }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw an error if the response is not ok", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ detail: "Unauthorized" }),
      } as Response);

      await expect(login({ email: "test@example.com", password: "wrong" })).rejects.toThrow("Unauthorized");
    });

    it("should throw a default error if response is not ok and no detail is provided", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

      await expect(login({ email: "test@example.com", password: "wrong" })).rejects.toThrow("Request failed with 500");
    });
  });

  describe("request auth fallback", () => {
    it("should ignore localStorage exceptions and proceed without token", async () => {
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn().mockImplementation(() => {
            throw new Error("localStorage is disabled or restricted");
          }),
        },
        writable: true,
      });

      try {
        const user = await getCurrentUser();

        expect(user).toEqual({ id: 1, name: "Test User" });
        expect(globalThis.fetch).toHaveBeenCalledOnce();

        const fetchArgs = vi.mocked(globalThis.fetch).mock.calls[0];
        expect(fetchArgs[1]?.headers).not.toHaveProperty("Authorization");
      } finally {
        Object.defineProperty(window, "localStorage", {
          value: originalLocalStorage,
          writable: true,
        });
      }
    });

    it("should ignore JSON.parse exceptions and proceed without token", async () => {
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn().mockReturnValue("invalid json"),
        },
        writable: true,
      });

      try {
        const user = await getCurrentUser();

        expect(user).toEqual({ id: 1, name: "Test User" });
        expect(globalThis.fetch).toHaveBeenCalledOnce();

        const fetchArgs = vi.mocked(globalThis.fetch).mock.calls[0];
        expect(fetchArgs[1]?.headers).not.toHaveProperty("Authorization");
      } finally {
        Object.defineProperty(window, "localStorage", {
          value: originalLocalStorage,
          writable: true,
        });
      }
    });
  });
});
