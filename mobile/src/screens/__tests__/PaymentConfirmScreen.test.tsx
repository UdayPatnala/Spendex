import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert, Linking } from "react-native";

import { PaymentConfirmScreen } from "../PaymentConfirmScreen";
import { spedexApi } from "../../api/client";

jest.mock("../../api/client", () => ({
  spedexApi: {
    preparePayment: jest.fn(),
    completePayment: jest.fn(),
  },
}));

describe("PaymentConfirmScreen", () => {
  const navigation = { goBack: jest.fn() };
  const route = {
    params: {
      vendor: {
        id: 1,
        name: "Test Vendor",
        category: "food",
        icon: "restaurant",
        accent: "rose",
        upi_handle: "test@upi",
        default_amount: 100,
        is_quick_pay: false,
      },
      amount: 100,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  });

  it("shows an alert if launching the UPI app fails", async () => {
    jest.spyOn(Linking, "openURL").mockRejectedValueOnce(new Error("Mocked Linking Error"));
    jest.mocked(spedexApi.preparePayment).mockResolvedValue({
      transaction: { id: 123 } as any,
      upi_url: "upi://pay?test=true",
      redirect_message: "Redirecting",
    });

    const { getByText } = render(<PaymentConfirmScreen navigation={navigation as any} route={route as any} />);

    fireEvent.press(getByText("Proceed to Pay"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Unable to launch UPI app",
        "Please ensure a UPI app is installed.",
      );
    });
  });
});
