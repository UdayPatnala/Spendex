import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ledgerApi } from "../api/client";
import { mockHomeOverview } from "../api/mockData";
import { formatCurrency, iconFor } from "../theme/helpers";
import { colors, radii, shadows, spacing } from "../theme/tokens";
import type { Vendor } from "../types";

const upiApps = [
  { id: "phonepe", name: "PhonePe", icon: "account-balance-wallet", handle: "phonepe@upi" },
  { id: "gpay", name: "Google Pay", icon: "payments", handle: "gpay@upi" },
  { id: "paytm", name: "Paytm", icon: "account-balance", handle: "paytm@upi" },
];

export function PaymentConfirmScreen({ navigation, route }: any) {
  const vendor: Vendor = route.params?.vendor ?? mockHomeOverview.quick_pay[0];
  const [selectedApp, setSelectedApp] = useState(upiApps[0]);
  const [submitting, setSubmitting] = useState(false);
  const amount = route.params?.amount ?? vendor.default_amount;

  const iconName = useMemo(() => iconFor(vendor.icon), [vendor.icon]);

  const handlePayment = async () => {
    try {
      setSubmitting(true);
      const prepared = await ledgerApi.preparePayment({
        vendor_id: vendor.id,
        amount,
        upi_handle: vendor.upi_handle || selectedApp.handle,
        payee_name: vendor.name,
      });
      await Linking.openURL(prepared.upi_url);
      Alert.alert("Redirecting", prepared.redirect_message);
    } catch {
      const fallbackUrl = `upi://pay?pa=${vendor.upi_handle || selectedApp.handle}&pn=${vendor.name}&am=${amount.toFixed(2)}&cu=INR`;
      try {
        await Linking.openURL(fallbackUrl);
      } catch {
        Alert.alert("Unable to launch UPI app", "Install a UPI application or update the payee handle.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.circleButton}>
            <MaterialIcons name="arrow-back" size={22} color={colors.primary} />
          </Pressable>
          <Text style={styles.brand}>Ledger</Text>
          <View style={styles.headerRight}>
            <MaterialIcons name="notifications" size={22} color={colors.onSurfaceVariant} />
            <View style={styles.lockBadge}>
              <MaterialIcons name="lock" size={16} color={colors.primary} />
            </View>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <MaterialIcons name="verified-user" size={30} color={colors.primary} />
          </View>
          <Text style={styles.title}>Confirm Payment</Text>
          <Text style={styles.subtitle}>Secure Transaction Encryption Active</Text>
        </View>

        <View style={styles.paymentCard}>
          <View style={styles.paymentTop}>
            <View>
              <Text style={styles.overline}>Paying To</Text>
              <View style={styles.payeeRow}>
                <Text style={styles.payee}>{vendor.name}</Text>
                <MaterialIcons name="check-circle" size={18} color={colors.secondary} />
              </View>
            </View>
            <View style={styles.vendorBadge}>
              <MaterialIcons name={iconName as any} size={28} color={colors.primary} />
            </View>
          </View>

          <View style={styles.amountCard}>
            <Text style={styles.overline}>Total Amount</Text>
            <Text style={styles.amountText}>{formatCurrency(amount)}</Text>
          </View>
        </View>

        <View style={styles.notice}>
          <MaterialIcons name="info" size={18} color={colors.primary} />
          <Text style={styles.noticeText}>
            You will be redirected to your preferred UPI app to complete this transaction.
          </Text>
        </View>

        <Text style={styles.overline}>Select UPI App</Text>
        <View style={styles.optionList}>
          {upiApps.map((app) => {
            const selected = app.id === selectedApp.id;
            return (
              <Pressable key={app.id} onPress={() => setSelectedApp(app)} style={styles.optionCard}>
                <View style={styles.optionMeta}>
                  <View style={styles.optionIcon}>
                    <MaterialIcons name={app.icon as any} size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.optionName}>{app.name}</Text>
                </View>
                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={handlePayment} disabled={submitting}>
          <LinearGradient colors={[colors.primary, colors.primaryContainer]} style={styles.payButton}>
            <Text style={styles.payButtonText}>{submitting ? "Preparing..." : "Proceed to Pay"}</Text>
            <MaterialIcons name="keyboard-double-arrow-right" size={24} color={colors.surfaceLowest} />
          </LinearGradient>
        </Pressable>

        <View style={styles.footer}>
          <View style={styles.footerLock}>
            <MaterialIcons name="verified" size={16} color={colors.onSurfaceVariant} />
            <Text style={styles.footerText}>PCI DSS Compliant & Secure</Text>
          </View>
          <View style={styles.footerLinks}>
            <Text style={styles.link}>Cancel Transaction</Text>
            <Text style={styles.link}>Help & Support</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLow,
  },
  brand: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: "800",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e3e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    gap: 8,
  },
  heroBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    color: colors.onSurface,
    textAlign: "center",
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  paymentCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 28,
    padding: spacing.xl,
    gap: spacing.xl,
    ...shadows.card,
  },
  paymentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overline: {
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 11,
    fontWeight: "800",
  },
  payeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  payee: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.primary,
  },
  vendorBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  amountCard: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 22,
    padding: spacing.xl,
    alignItems: "center",
  },
  amountText: {
    marginTop: 8,
    color: colors.onSurface,
    fontSize: 48,
    fontWeight: "900",
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#e8ecff",
    borderRadius: radii.md,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
    color: colors.primary,
    lineHeight: 20,
  },
  optionList: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.card,
  },
  optionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  optionName: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: "700",
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.onSurfaceVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLowest,
  },
  payButton: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  payButtonText: {
    color: colors.surfaceLowest,
    fontWeight: "800",
    fontSize: 18,
  },
  footer: {
    gap: spacing.sm,
    marginTop: "auto",
  },
  footerLock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontSize: 11,
    fontWeight: "700",
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  link: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
});
