import { startTransition, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../auth/AuthProvider";
import { colors, radii, spacing } from "../theme/tokens";

type AuthMode = "login" | "signup";

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "login") {
        await signIn(email.trim(), password);
      } else {
        await signUp(name.trim(), email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to authenticate");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.brand}>Spedex</Text>
        <Text style={styles.eyebrow}>Smart Wallet</Text>
        <Text style={styles.title}>
          {mode === "login" ? "Welcome back" : "Create your personal wallet"}
        </Text>
        <Text style={styles.subtitle}>
          {mode === "login"
            ? "Sign in to track your bills, subscriptions, and daily expenses."
            : "Set up a new account for 1-tap fast payments."}
        </Text>

        <View style={styles.switchRow}>
          <Pressable
            onPress={() => startTransition(() => setMode("login"))}
            style={[styles.switchPill, mode === "login" && styles.switchPillActive]}
          >
            <Text style={[styles.switchLabel, mode === "login" && styles.switchLabelActive]}>
              Login
            </Text>
          </Pressable>
          <Pressable
            onPress={() => startTransition(() => setMode("signup"))}
            style={[styles.switchPill, mode === "signup" && styles.switchPillActive]}
          >
            <Text style={[styles.switchLabel, mode === "signup" && styles.switchLabelActive]}>
              Sign up
            </Text>
          </Pressable>
        </View>

        {mode === "signup" ? (
          <TextInput
            placeholder="Full name"
            placeholderTextColor={colors.onSurfaceVariant}
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        ) : null}
        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.onSurfaceVariant}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.onSurfaceVariant}
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.submitButton} disabled={submitting} onPress={handleSubmit}>
          {submitting ? (
            <ActivityIndicator color={colors.surfaceLowest} />
          ) : (
            <Text style={styles.submitLabel}>
              {mode === "login" ? "Enter Spedex" : "Create Account"}
            </Text>
          )}
        </Pressable>


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
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  brand: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "800",
  },
  eyebrow: {
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 2.2,
    fontSize: 11,
    marginTop: -4,
  },
  title: {
    color: colors.onSurface,
    fontSize: 38,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  switchPill: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: 12,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
  },
  switchPillActive: {
    backgroundColor: colors.primary,
  },
  switchLabel: {
    color: colors.primary,
    fontWeight: "700",
  },
  switchLabelActive: {
    color: colors.surfaceLowest,
  },
  input: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    color: colors.onSurface,
    fontSize: 16,
  },
  error: {
    color: "#ba1a1a",
    fontWeight: "600",
  },
  submitButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitLabel: {
    color: colors.surfaceLowest,
    fontWeight: "800",
    fontSize: 16,
  },
  helper: {
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
