import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Linking, View } from 'react-native';
import { PaymentConfirmScreen } from '../PaymentConfirmScreen';
import { NavigationContainer } from '@react-navigation/native';
import { spedexApi } from '../../api/client';

// Mock dependencies
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert.alert = jest.fn();
  RN.Linking.openURL = jest.fn();
  return RN;
});

jest.mock('../../api/client', () => ({
  spedexApi: {
    preparePayment: jest.fn(),
    completePayment: jest.fn(),
  },
}));

// Mock MaterialIcons and LinearGradient properly
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

describe('PaymentConfirmScreen', () => {
  const mockRoute = {
    params: {
      amount: 100,
      vendor: { id: 'v1', name: 'Test Vendor', category: 'food' },
    },
  };

  const mockNavigation = {
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles linking error and shows alert', async () => {
    // Setup mock to throw error
    (Linking.openURL as jest.Mock).mockRejectedValue(new Error('Failed to open URI'));
    (spedexApi.preparePayment as jest.Mock).mockResolvedValue({
      id: 'tx123',
      upi_url: 'upi://pay?pa=test@upi'
    });

    const { getByText } = render(
      <NavigationContainer>
        <PaymentConfirmScreen route={mockRoute as any} navigation={mockNavigation as any} />
      </NavigationContainer>
    );

    // Press the pay button
    fireEvent.press(getByText('Proceed to Pay'));

    // Wait for the alert to be called
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Unable to launch UPI app",
        "Please ensure a UPI app is installed."
      );
    });
  });
});
