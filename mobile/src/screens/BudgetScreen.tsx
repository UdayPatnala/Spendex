import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { spedexApi } from "../api/client";
import { mockBudgetData } from "../api/mockData";
import { accentPalette, formatCurrency, iconFor } from "../theme/helpers";
import { colors, radii, shadows, spacing } from "../theme/tokens";
import type { BudgetScreenData } from "../types";

export function BudgetScreen() {
  const [data, setData] = useState<BudgetScreenData>(mockBudgetData);

  useEffect(() => {
    spedexApi.getBudgetScreen().then(setData).catch(() => setData(mockBudgetData));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>Spedex</Text>

        <View style={styles.hero}>
          <View>
            <Text style={styles.eyebrow}>Current Planning</Text>
            <Text style={styles.title}>Weekly Index</Text>
          </View>
          <View style={styles.remainingBox}>
            <Text style={styles.remainingLabel}>Remaining Budget</Text>
            <Text style={styles.remainingValue}>{formatCurrency(data.remaining_budget)}</Text>
          </View>
        </View>

        <View style={styles.budgetList}>
          {data.budgets.map((budget) => {
            const palette = accentPalette(budget.accent);
            return (
              <View key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetTop}>
                  <View style={[styles.budgetIcon, { backgroundColor: palette.bg }]}>
                    <MaterialIcons name={iconFor(budget.icon) as any} size={22} color={palette.text} />
                  </View>
                  <View style={styles.budgetMeta}>
                    <Text style={styles.budgetName}>{budget.category}</Text>
                    <Text style={styles.budgetSubline}>
                      Daily limit: {formatCurrency(budget.limit_amount / 30)}
                    </Text>
                  </View>
                </View>
                <View style={styles.budgetScale}>
                  <Text style={styles.budgetAmount}>{formatCurrency(budget.spent)}</Text>
                  <Text style={styles.budgetMuted}> / {formatCurrency(budget.limit_amount)}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${budget.progress * 100}%`, backgroundColor: palette.text }]} />
                </View>
              </View>
            );
          })}
          <View style={[styles.budgetCard, styles.newLimitCard]}>
            <View style={styles.newLimitCircle}>
              <MaterialIcons name="add" size={20} color={colors.primary} />
            </View>
            <Text style={styles.newLimitText}>New Limit</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
          <Text style={styles.sectionAction}>View Calendar</Text>
        </View>

        <View style={styles.reminderList}>
          {data.reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateMonth}>
                  {new Date(reminder.due_date).toLocaleString("en-US", { month: "short" }).toUpperCase()}
                </Text>
                <Text style={styles.dateDay}>{new Date(reminder.due_date).getDate()}</Text>
              </View>
              <View style={styles.reminderMeta}>
                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                <Text style={styles.reminderSubtitle}>{reminder.subtitle}</Text>
              </View>
              <Switch
                value={reminder.autopay_enabled}
                thumbColor={colors.surfaceLowest}
                trackColor={{ false: colors.surfaceHighest, true: colors.primary }}
              />
            </View>
          ))}
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Proactive Saving Tip</Text>
          <Text style={styles.tipBody}>{data.savings_tip}</Text>
          <View style={styles.tipAction}>
            <Text style={styles.tipActionText}>Apply Now</Text>
          </View>
        </View>
      </ScrollView>
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
  brand: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: "800",
  },
  hero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 2.1,
    fontSize: 11,
    marginBottom: 6,
  },
  title: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 36,
  },
  remainingBox: {
    alignItems: "flex-end",
  },
  remainingLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  remainingValue: {
    color: colors.secondary,
    fontSize: 30,
    fontWeight: "900",
  },
  budgetList: {
    gap: spacing.md,
  },
  budgetCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 22,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  budgetTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  budgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  budgetMeta: {
    flex: 1,
  },
  budgetName: {
    color: colors.onSurface,
    fontWeight: "800",
    fontSize: 20,
  },
  budgetSubline: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  budgetScale: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  budgetAmount: {
    color: colors.onSurface,
    fontWeight: "900",
    fontSize: 28,
  },
  budgetMuted: {
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
  progressTrack: {
    height: 10,
    backgroundColor: colors.surfaceHighest,
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.pill,
  },
  newLimitCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  newLimitCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  newLimitText: {
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 26,
    fontWeight: "800",
  },
  sectionAction: {
    color: colors.primary,
    fontWeight: "700",
  },
  reminderList: {
    gap: spacing.sm,
  },
  reminderCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 18,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card,
  },
  dateBadge: {
    width: 58,
    borderRadius: 16,
    backgroundColor: colors.surfaceLow,
    paddingVertical: 8,
    alignItems: "center",
  },
  dateMonth: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  dateDay: {
    color: colors.onSurface,
    fontSize: 24,
    fontWeight: "900",
  },
  reminderMeta: {
    flex: 1,
  },
  reminderTitle: {
    color: colors.onSurface,
    fontWeight: "800",
    fontSize: 16,
  },
  reminderSubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  tipCard: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  tipTitle: {
    color: colors.surfaceLowest,
    fontSize: 22,
    fontWeight: "800",
  },
  tipBody: {
    color: "#d7ddff",
    lineHeight: 22,
  },
  tipAction: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceLowest,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tipActionText: {
    color: colors.primary,
    fontWeight: "800",
  },
});

