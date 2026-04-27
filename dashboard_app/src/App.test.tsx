import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import App from "./App";
import * as api from "./api";

vi.mock("./api", () => ({
  login: vi.fn(),
  signUp: vi.fn(),
  getCurrentUser: vi.fn(),
  loadDashboardBundle: vi.fn(),
  warmUpBackend: vi.fn(),
  setAuthToken: vi.fn(),
  addVendor: vi.fn(),
  updateProfile: vi.fn(),
}));

describe("App Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
    vi.mocked(api.warmUpBackend).mockResolvedValue(false);
  });

  it("handles Error authentication failures correctly", async () => {
    vi.mocked(api.login).mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Sign in to your personal wallet")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Enter Spedex/i }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("handles non-Error authentication failures correctly", async () => {
    vi.mocked(api.login).mockRejectedValueOnce("String error");

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Sign in to your personal wallet")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Enter Spedex/i }));

    await waitFor(() => {
      expect(screen.getByText("Unable to authenticate")).toBeInTheDocument();
    });
  });
});
