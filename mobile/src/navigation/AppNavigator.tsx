import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from "react-native";

import { useAuth } from "../auth/AuthProvider";
import { AnalyticsScreen } from "../screens/AnalyticsScreen";
import { AuthScreen } from "../screens/AuthScreen";
import { BudgetScreen } from "../screens/BudgetScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PaymentConfirmScreen } from "../screens/PaymentConfirmScreen";
import { PaymentsScreen } from "../screens/PaymentsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { colors } from "../theme/tokens";
import type { Vendor } from "../types";

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  PaymentConfirm: { vendor?: Vendor; amount?: number } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Payments: undefined;
  Analytics: undefined;
  Budget: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      id="main-tabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarActiveBackgroundColor: colors.surfaceLow,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          height: 74,
          borderRadius: 28,
          backgroundColor: "rgba(255,255,255,0.94)",
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: "#1a1b22",
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginBottom: 8,
        },
        tabBarIcon: ({ color, focused }) => {
          const iconByRoute: Record<string, keyof typeof MaterialIcons.glyphMap> = {
            Home: "home",
            Payments: "account-balance-wallet",
            Analytics: "show-chart",
            Budget: "event-note",
            Settings: "settings",
          };
          return (
            <MaterialIcons
              name={iconByRoute[route.name]}
              size={24}
              color={color}
              style={{
                marginTop: 8,
                opacity: focused ? 1 : 0.85,
              }}
            />
          );
        },
        tabBarItemStyle: {
          marginTop: 10,
          marginBottom: 10,
          borderRadius: 20,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { ready, user } = useAuth();

  if (!ready) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Restoring your Spedex session...</Text>
      </SafeAreaView>
    );
  }

  return (
    <Stack.Navigator id="root-stack" screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="PaymentConfirm"
            component={PaymentConfirmScreen}
            options={{
              presentation: "card",
              animation: "slide_from_right",
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
  },
});
