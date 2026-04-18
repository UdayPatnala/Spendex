import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, screen, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";

import { AuthProvider, useAuth } from "../AuthProvider";
import { setAuthToken, spedexApi } from "../../api/client";

jest.mock("../../api/client", () => ({
  setAuthToken: jest.fn(),
  spedexApi: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    signUp: jest.fn(),
  },
}));

function Consumer() {
  const { ready, user } = useAuth();
  return <Text>{ready ? user?.email ?? "ready-no-user" : "loading"}</Text>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("clears persisted state when session restoration fails", async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify({ token: "bad-token" }));
    jest.mocked(spedexApi.getCurrentUser).mockRejectedValueOnce(new Error("restore failed"));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("ready-no-user")).toBeTruthy();
    });

    expect(setAuthToken).toHaveBeenCalledWith(null);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("spedex.mobile.session");
  });
});
