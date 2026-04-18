import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { spedexApi } from "../api/client";
import { formatCurrency, iconFor } from "../theme/helpers";
import { colors, radii, shadows, spacing } from "../theme/tokens";
import type { HomeOverview as HomeOverviewType, Vendor } from "../types";

export function HomeScreen({ navigation }: any) {
  const [data, setData] = useState<HomeOverviewType | null>(null);

  useEffect(() => {
    spedexApi.getHomeOverview().then(setData).catch(console.error);
  }, []);

  if (!data) return <SafeAreaView style={styles.safeArea} />;

  const spendRatio = Math.min(data.today_spend / (data.today_budget || 1), 1) || 0;

  const openPayment = (vendor?: Vendor) => {
    navigation.getParent()?.navigate("PaymentConfirm", { vendor, amount: vendor?.default_amount });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{data.user.avatar_initials}</Text>
            </View>
            <Text style={styles.brand}>Spedex</Text>
          </View>
          <MaterialIcons name="notifications" size={24} color={colors.primary} />
        </View>

        <View style={styles.hero}>
          <View>
            <Text style={styles.eyebrow}>Daily Outlook</Text>
            <Text style={styles.heroTitle}>Today's Spending</Text>
          </View>
          <Text style={styles.heroAmount}>
            {formatCurrency(data.today_spend)}
            <Text style={styles.heroMuted}> / {formatCurrency(data.today_budget)}</Text>
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${spendRatio * 100}%` }]} />
        </View>

        <View style={styles.noticeCard}>
          <MaterialIcons name="energy-savings-leaf" size={20} color={colors.secondary} />
          <Text style={styles.noticeText}>{data.on_track_copy}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Pay</Text>
          <Pressable onPress={() => navigation.navigate("Payments")}>
            <Text style={styles.sectionAction}>View All</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPayRow}>
          {data.quick_pay.map((vendor) => (
            <Pressable key={vendor.id} onPress={() => openPayment(vendor)} style={styles.quickPayCard}>
              <View style={styles.quickIconWrap}>
                <MaterialIcons name={iconFor(vendor.icon) as any} size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickLabel}>{vendor.name}</Text>
              <Text style={styles.quickAmount}>{formatCurrency(vendor.default_amount)}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => navigation.navigate("Payments")} style={styles.quickPayCard}>
            <View style={[styles.quickIconWrap, styles.quickNewWrap]}>
              <MaterialIcons name="add" size={24} color={colors.onSurfaceVariant} />
            </View>
            <Text style={styles.quickLabel}>New</Text>
            <Text style={styles.quickAmount}>Quick link</Text>
          </Pressable>
        </ScrollView>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.transactionList}>
          {data.recent_transactions.length === 0 ? (
            <View style={{ padding: 24, alignItems: "center", backgroundColor: colors.surfaceContainer, borderRadius: 16 }}>
              <MaterialIcons name="receipt-long" size={48} color={colors.onSurfaceVariant} style={{ opacity: 0.5, marginBottom: 8 }} />
              <Text style={{ color: colors.onSurface, fontWeight: "600" }}>No transactions yet.</Text>
            </View>
          ) : (
            data.recent_transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionRow}>
                <View style={styles.transactionIcon}>
                  <MaterialIcons name="payments" size={20} color={colors.primary} />
                </View>
                <View style={styles.transactionMeta}>
                  <Text style={styles.transactionTitle}>{transaction.description}</Text>
                  <Text style={styles.transactionSubtitle}>{transaction.category}</Text>
                </View>
                <Text style={styles.transactionAmount}>
                  {transaction.direction === "expense" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => navigation.navigate("Payments")}>
        <MaterialIcons name="person-add-alt-1" size={24} color={colors.surfaceLowest} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 124,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontWeight: "800",
  },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
  },
  hero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  eyebrow: {
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 2.2,
    fontSize: 11,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 34,
    color: colors.onSurface,
    fontWeight: "800",
  },
  heroAmount: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 28,
  },
  heroMuted: {
    color: colors.onSurfaceVariant,
    fontWeight: "600",
    fontSize: 14,
  },
  progressTrack: {
    height: 14,
    backgroundColor: colors.surfaceHighest,
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  noticeCard: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
  },
  noticeText: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 15,
    lineHeight: 21,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 28,
    color: colors.onSurface,
    fontWeight: "800",
  },
  sectionAction: {
    color: colors.primary,
    fontWeight: "700",
  },
  quickPayRow: {
    gap: spacing.md,
  },
  quickPayCard: {
    width: 96,
    alignItems: "center",
    gap: spacing.sm,
  },
  quickIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  quickNewWrap: {
    borderStyle: "dashed",
    backgroundColor: colors.background,
  },
  quickLabel: {
    fontWeight: "700",
    color: colors.onSurface,
    textAlign: "center",
  },
  quickAmount: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  transactionList: {
    gap: spacing.sm,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionMeta: {
    flex: 1,
  },
  transactionTitle: {
    color: colors.onSurface,
    fontWeight: "700",
    fontSize: 18,
  },
  transactionSubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  transactionAmount: {
    color: colors.onSurface,
    fontWeight: "800",
    fontSize: 18,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 110,
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
});

