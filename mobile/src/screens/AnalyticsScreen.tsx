import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { spedexApi } from "../api/client";
import { mockAnalyticsData } from "../api/mockData";
import { accentPalette, formatCurrency, iconFor } from "../theme/helpers";
import { colors, radii, shadows, spacing } from "../theme/tokens";
import type { AnalyticsData } from "../types";

export function AnalyticsScreen() {
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData);

  useEffect(() => {
    spedexApi.getAnalytics().then(setData).catch(() => setData(mockAnalyticsData));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.brand}>Spedex</Text>
          <Text style={styles.monthlyTag}>Monthly Insights</Text>
          <MaterialIcons name="notifications" size={22} color={colors.primary} />
        </View>

        <View style={styles.ringCard}>
          <View style={styles.ringWrap}>
            <View style={styles.ringOuter}>
              <View style={styles.ringInner}>
                <Text style={styles.ringLabel}>Total Spent</Text>
                <Text style={styles.ringValue}>{formatCurrency(data.total_spent)}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.currentMonth}>Current Month</Text>
          <View style={styles.breakdownList}>
            {data.category_breakdown.map((item) => {
              const palette = accentPalette(item.accent);
              return (
                <View key={item.category} style={styles.breakdownRow}>
                  <View style={[styles.breakdownDot, { backgroundColor: palette.text }]} />
                  <Text style={styles.breakdownText}>{item.category}</Text>
                  <Text style={styles.breakdownPercent}>{item.percentage}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>Smart Insight</Text>
          <Text style={styles.insightText}>{data.smart_insight}</Text>
          <View style={styles.insightButton}>
            <Text style={styles.insightButtonText}>Full Report</Text>
            <MaterialIcons name="arrow-forward" size={16} color={colors.surfaceLowest} />
          </View>
        </View>

        <View style={styles.weeklyCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Spend</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Week 4 Active</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>Transaction volume across the last 4 weeks</Text>
          <View style={styles.chart}>
            {data.weekly_spend.map((week) => {
              const maxAmount = Math.max(...data.weekly_spend.map((point) => point.amount), 1);
              return (
                <View key={week.week_label} style={styles.barWrap}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(week.amount / maxAmount) * 100}%`,
                        backgroundColor: week.is_active ? colors.primary : colors.surfaceHighest,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{week.week_label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {[data.highest_sector, data.busiest_day].map((card) => {
          const palette = accentPalette(card.accent);
          return (
            <View key={card.title} style={styles.highlightCard}>
              <View style={[styles.highlightIcon, { backgroundColor: palette.bg }]}>
                <MaterialIcons name={iconFor(card.icon) as any} size={22} color={palette.text} />
              </View>
              <View style={styles.highlightMeta}>
                <Text style={styles.highlightTitle}>{card.title}</Text>
                <Text style={styles.highlightSubtitle}>{card.subtitle}</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.weekPartCard}>
          <Text style={styles.sectionTitle}>Weekday vs Weekend</Text>
          <View style={styles.ratioRow}>
            <Text style={styles.ratioLabel}>{data.weekday_ratio}% Weekday</Text>
            <Text style={styles.ratioLabel}>{data.weekend_ratio}% Weekend</Text>
          </View>
          <View style={styles.ratioTrack}>
            <View style={[styles.ratioFill, { width: `${data.weekday_ratio}%` }]} />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 26,
  },
  monthlyTag: {
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
  ringCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 28,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 16,
    borderColor: colors.primary,
    borderTopColor: colors.surfaceHighest,
    borderRightColor: colors.secondary,
    borderBottomColor: colors.tertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  ringLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontWeight: "700",
  },
  ringValue: {
    marginTop: 8,
    color: colors.primary,
    fontSize: 32,
    fontWeight: "900",
  },
  currentMonth: {
    alignSelf: "flex-end",
    color: colors.onSurfaceVariant,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontSize: 11,
  },
  breakdownList: {
    gap: spacing.sm,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownText: {
    flex: 1,
    color: colors.onSurface,
    fontWeight: "600",
  },
  breakdownPercent: {
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
  insightCard: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  insightLabel: {
    color: "#cdd4ff",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontSize: 11,
    fontWeight: "700",
  },
  insightText: {
    color: colors.surfaceLowest,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  insightButton: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  insightButtonText: {
    color: colors.surfaceLowest,
    fontWeight: "700",
  },
  weeklyCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 22,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 26,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: colors.onSurfaceVariant,
  },
  badge: {
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.3,
  },
  chart: {
    height: 180,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  barWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  bar: {
    width: "100%",
    borderRadius: 18,
    minHeight: 12,
  },
  barLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  highlightCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 22,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    ...shadows.card,
  },
  highlightIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  highlightMeta: {
    flex: 1,
  },
  highlightTitle: {
    color: colors.onSurface,
    fontWeight: "800",
    fontSize: 18,
  },
  highlightSubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 20,
  },
  weekPartCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 22,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  ratioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ratioLabel: {
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
  ratioTrack: {
    height: 10,
    backgroundColor: colors.surfaceHighest,
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  ratioFill: {
    height: "100%",
    backgroundColor: colors.secondaryFixed,
  },
});

