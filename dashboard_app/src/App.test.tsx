import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import * as api from "./api";

// Mock the API module
vi.mock("./api", () => ({
  login: vi.fn(),
  signUp: vi.fn(),
  getCurrentUser: vi.fn(),
  loadDashboardBundle: vi.fn(),
  warmUpBackend: vi.fn(),
  setAuthToken: vi.fn(),
}));

describe("App Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("handles authentication error correctly", async () => {
    const mockError = new Error("Invalid credentials");
    (api.login as any).mockRejectedValueOnce(mockError);
    (api.warmUpBackend as any).mockResolvedValueOnce(undefined);

    render(<App />);

    // Wait for the app to render the auth screen
    await waitFor(() => {
      expect(screen.getByText("Sign in to your personal wallet")).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /Enter Spedex/i });
    fireEvent.click(submitButton);

    // Assert that login was called with the correct credentials
    expect(api.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    // The submit button should not be in the submitting state (which disables it usually, or changes text)
    expect(submitButton).not.toHaveAttribute("disabled");
  });

  it("handles non-Error authentication failures correctly", async () => {
    (api.login as any).mockRejectedValueOnce("String error");
    (api.warmUpBackend as any).mockResolvedValueOnce(undefined);

    render(<App />);

    // Wait for the app to render the auth screen
    await waitFor(() => {
      expect(screen.getByText("Sign in to your personal wallet")).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /Enter Spedex/i });
    fireEvent.click(submitButton);

    // Wait for the generic error message to appear
    await waitFor(() => {
      expect(screen.getByText("Unable to authenticate")).toBeInTheDocument();
    });
  });
});
