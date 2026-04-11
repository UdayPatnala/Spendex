import { MaterialIcons } from "@expo/vector-icons";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { spedexApi } from "../api/client";
import { mockVendorDirectory } from "../api/mockData";
import { accentPalette, formatCurrency, iconFor } from "../theme/helpers";
import { colors, radii, shadows, spacing } from "../theme/tokens";
import type { Vendor, VendorDirectoryData } from "../types";

export function PaymentsScreen({ navigation }: any) {
  const [data, setData] = useState<VendorDirectoryData>(mockVendorDirectory);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    spedexApi.getVendorDirectory().then(setData).catch(() => setData(mockVendorDirectory));
  }, []);

  const groups = useMemo<Record<string, Vendor[]>>(() => {
    const lowered = deferredQuery.trim().toLowerCase();
    if (!lowered) {
      return data.groups;
    }
    return Object.fromEntries(
      Object.entries(data.groups)
        .map(([groupName, vendors]) => [
          groupName,
          vendors.filter(
            (vendor) =>
              vendor.name.toLowerCase().includes(lowered) ||
              vendor.category.toLowerCase().includes(lowered),
          ),
        ])
        .filter(([, vendors]) => vendors.length > 0),
    ) as Record<string, Vendor[]>;
  }, [data.groups, deferredQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{data.user.avatar_initials}</Text>
          </View>
          <Text style={styles.brand}>Spedex</Text>
          <View style={styles.headerSpacer} />
          <MaterialIcons name="notifications" size={24} color={colors.primary} />
        </View>

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.eyebrow}>Manage Directory</Text>
            <Text style={styles.title}>Vendors</Text>
          </View>
          <Pressable style={styles.addButton}>
            <MaterialIcons name="add" size={18} color={colors.surfaceLowest} />
            <Text style={styles.addLabel}>Add New Vendor</Text>
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
          <TextInput
            placeholder="Search by name or category..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={query}
            onChangeText={(value) => startTransition(() => setQuery(value))}
            style={styles.searchInput}
          />
        </View>

        {Object.entries(groups).map(([groupName, vendors]) => (
          <View key={groupName} style={styles.groupSection}>
            <View style={styles.groupHeader}>
              <View style={styles.groupLine} />
              <Text style={styles.groupTitle}>{groupName}</Text>
              <View style={styles.groupLine} />
            </View>
            {vendors.map((vendor) => {
              const palette = accentPalette(vendor.accent);
              return (
                <Pressable
                  key={vendor.id}
                  style={styles.vendorCard}
                  onPress={() => navigation.getParent()?.navigate("PaymentConfirm", { vendor, amount: vendor.default_amount })}
                >
                  <View style={styles.vendorInfo}>
                    <View style={[styles.vendorIcon, { backgroundColor: palette.bg }]}>
                      <MaterialIcons name={iconFor(vendor.icon) as any} size={26} color={palette.text} />
                    </View>
                    <View>
                      <Text style={styles.vendorName}>{vendor.name}</Text>
                      <Text style={[styles.vendorChip, { color: palette.text, backgroundColor: `${palette.bg}AA` }]}>
                        {vendor.category}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.vendorMeta}>
                    <Text style={styles.vendorAmount}>{formatCurrency(vendor.default_amount)}</Text>
                    <MaterialIcons name="edit" size={16} color={colors.onSurfaceVariant} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
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
    marginLeft: spacing.sm,
    color: colors.primary,
    fontWeight: "800",
    fontSize: 28,
  },
  headerSpacer: {
    flex: 1,
  },
  titleRow: {
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
    color: colors.onSurface,
    fontSize: 40,
    fontWeight: "800",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    ...shadows.card,
  },
  addLabel: {
    color: colors.surfaceLowest,
    fontWeight: "700",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 15,
  },
  groupSection: {
    gap: spacing.md,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  groupLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceHighest,
  },
  groupTitle: {
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 2.4,
    fontSize: 11,
    fontWeight: "800",
  },
  vendorCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.card,
  },
  vendorInfo: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    flex: 1,
  },
  vendorIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorName: {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: "700",
  },
  vendorChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    overflow: "hidden",
    fontSize: 10,
    textTransform: "uppercase",
    marginTop: 6,
    fontWeight: "800",
  },
  vendorMeta: {
    alignItems: "flex-end",
    gap: 6,
  },
  vendorAmount: {
    color: colors.onSurface,
    fontWeight: "800",
    fontSize: 20,
  },
});
