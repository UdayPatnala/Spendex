import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useAuth } from "../auth/AuthProvider";
import { colors, radii, shadows, spacing } from "../theme/tokens";

const settingRows = [
  { key: "notifications", label: "Smart Notifications", hint: "Receive reminder and payment alerts." },
  { key: "biometric", label: "Biometric Lock", hint: "Use Face ID or fingerprint for fast entry." },
  { key: "digest", label: "Weekly Digest", hint: "Get a summary every Monday morning." },
];

export function SettingsScreen() {
  const { signOut, user } = useAuth();
  const [toggles, setToggles] = useState({
    notifications: true,
    biometric: true,
    digest: true,
  });
  const profile = user ?? { name: "User", email: "", avatar_initials: "U", plan: "Free" };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>Spedex</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.avatar_initials}</Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.email}>{profile.email}</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planLabel}>{profile.plan}</Text>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {settingRows.map((row) => (
            <View key={row.key} style={styles.settingRow}>
              <View style={styles.settingMeta}>
                <Text style={styles.settingLabel}>{row.label}</Text>
                <Text style={styles.settingHint}>{row.hint}</Text>
              </View>
              <Switch
                value={toggles[row.key as keyof typeof toggles]}
                onValueChange={(value) =>
                  setToggles((current) => ({
                    ...current,
                    [row.key]: value,
                  }))
                }
                thumbColor={colors.surfaceLowest}
                trackColor={{ false: colors.surfaceHighest, true: colors.primary }}
              />
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Support</Text>
          {[
            { icon: "help-outline", title: "Help Center", subtitle: "Guides for transfers, budgeting, and analytics." },
            { icon: "shield", title: "Security Review", subtitle: "Inspect sessions, devices, and transfer permissions." },
            { icon: "mail-outline", title: "Contact Support", subtitle: "support@spedex.app" },
          ].map((item) => (
            <View key={item.title} style={styles.supportRow}>
              <View style={styles.supportIcon}>
                <MaterialIcons name={item.icon as any} size={22} color={colors.primary} />
              </View>
              <View style={styles.supportMeta}>
                <Text style={styles.supportTitle}>{item.title}</Text>
                <Text style={styles.supportSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable style={styles.signOutButton} onPress={() => void signOut()}>
          <Text style={styles.signOutLabel}>Sign out {profile.name}</Text>
        </Pressable>
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
  profileCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 24,
    padding: spacing.xl,
    flexDirection: "row",
    gap: spacing.lg,
    ...shadows.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  profileMeta: {
    flex: 1,
    gap: 6,
  },
  name: {
    color: colors.onSurface,
    fontSize: 24,
    fontWeight: "800",
  },
  email: {
    color: colors.onSurfaceVariant,
  },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  planLabel: {
    color: colors.primary,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 11,
  },
  panel: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 24,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 26,
    fontWeight: "800",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: 8,
  },
  settingMeta: {
    flex: 1,
  },
  settingLabel: {
    color: colors.onSurface,
    fontWeight: "700",
    fontSize: 17,
  },
  settingHint: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 20,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 8,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },
  supportMeta: {
    flex: 1,
  },
  supportTitle: {
    color: colors.onSurface,
    fontWeight: "700",
    fontSize: 17,
  },
  supportSubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 20,
  },
  signOutButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  signOutLabel: {
    color: colors.surfaceLowest,
    fontWeight: "800",
    fontSize: 16,
  },
});
