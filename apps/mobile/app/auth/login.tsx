import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { useAuth } from '../../src/providers/auth-provider';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

type AuthMode = 'LOGIN' | 'REGISTER';

export default function LoginScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { login, register, isAuthenticated, user, logout } = useAuth();
  const { syncWithApi } = useFinance();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const authTabs = [
    { id: 'LOGIN' as const, label: 'Sign In' },
    { id: 'REGISTER' as const, label: 'Create Account' },
  ];

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'LOGIN') {
        await login(email.trim(), password);
        setSuccessMessage('Signed in successfully! Syncing your data…');
      } else {
        await register(email.trim(), password, displayName.trim() || undefined);
        setSuccessMessage('Account created! Initializing cloud sync…');
      }

      // Trigger immediate cloud synchronization
      void syncWithApi();

      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
      setSuccessMessage('Logged out. Your local offline data is safely preserved.');
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
      }, 600);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar / Back */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {isAuthenticated ? (
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backButton,
                  {
                    backgroundColor: pressed ? colors.surfaceSubtle : colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>✕ Close</Text>
              </Pressable>
            ) : (
              <View />
            )}

            <Text style={[typography.caption, { color: colors.textTertiary }]}>AUTHENTICATION REQUIRED</Text>
          </View>

          {/* Hero Header */}
          <View style={{ alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm }}>
            <View
              style={[
                styles.brandEmblem,
                {
                  backgroundColor: 'rgba(59, 130, 246, 0.14)',
                  borderColor: 'rgba(59, 130, 246, 0.35)',
                  borderRadius: radius.xl,
                },
              ]}
            >
              <Text style={{ fontSize: 36 }}>☁️</Text>
            </View>
            <Text style={[typography.title, { color: colors.textPrimary, textAlign: 'center', marginTop: 8, fontSize: 24 }]}>
              {isAuthenticated ? 'Cloud Account' : mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', maxWidth: 320 }]}>
              {isAuthenticated
                ? 'Your ledger is linked and synchronizes across all your devices.'
                : 'Connect your secure account to access and sync finances across multiple phones.'}
            </Text>
          </View>

          {/* If already authenticated */}
          {isAuthenticated && user ? (
            <Card style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, gap: spacing.lg, padding: spacing.lg }}>
              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>ACTIVE ACCOUNT</Text>
                <Text style={[typography.title, { color: colors.textPrimary }]}>{user.displayName || 'User'}</Text>
                <Text style={[typography.body, { color: colors.primary }]}>{user.email}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="🔄 Sync Now"
                    variant="primary"
                    loading={busy}
                    onPress={async () => {
                      setBusy(true);
                      await syncWithApi();
                      setBusy(false);
                      setSuccessMessage('Sync complete! All devices updated.');
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Log Out"
                    variant="danger"
                    loading={busy}
                    onPress={handleLogout}
                  />
                </View>
              </View>
            </Card>
          ) : (
            <>
              {/* Mode Selector Tabs */}
              <SegmentedControl options={authTabs} value={mode} onChange={setMode} />

              {/* Status & Error Messages */}
              {error && (
                <View style={[styles.alertBanner, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: colors.danger, borderRadius: radius.md }]}>
                  <Text style={{ fontSize: 16 }}>⚠️</Text>
                  <Text style={[typography.caption, { color: '#FCA5A5', flex: 1 }]}>{error}</Text>
                </View>
              )}

              {successMessage && (
                <View style={[styles.alertBanner, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: colors.income, borderRadius: radius.md }]}>
                  <Text style={{ fontSize: 16 }}>✓</Text>
                  <Text style={[typography.caption, { color: '#6EE7B7', flex: 1 }]}>{successMessage}</Text>
                </View>
              )}

              {/* Form Fields Card */}
              <Card style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, gap: spacing.md, padding: spacing.lg }}>
                {mode === 'REGISTER' && (
                  <Input
                    label="Display Name"
                    placeholder="e.g. Ahmed"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                  />
                )}

                <Input
                  label="Email Address"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <View style={{ gap: 6 }}>
                  <Input
                    label="Password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ alignSelf: 'flex-end', paddingVertical: 2 }}
                  >
                    <Text style={[typography.caption, { color: colors.primary }]}>
                      {showPassword ? 'Hide Password' : 'Show Password'}
                    </Text>
                  </Pressable>
                </View>

                {mode === 'LOGIN' && (
                  <Pressable
                    onPress={() => {
                      setEmail('user@mahbub.dev');
                      setPassword('user@1230');
                    }}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? colors.surfaceSubtle : colors.surfaceMuted,
                      borderColor: colors.border,
                      borderWidth: 1,
                      borderRadius: radius.md,
                      padding: spacing.xs,
                      alignItems: 'center',
                    })}
                  >
                    <Text style={[typography.captionMedium, { color: colors.primary }]}>
                      🔑 Quick Login as user@mahbub.dev
                    </Text>
                  </Pressable>
                )}

                <Button
                  label={mode === 'LOGIN' ? 'Sign In & Sync' : 'Create Account & Sync'}
                  variant="primary"
                  loading={busy}
                  onPress={handleSubmit}
                  style={{ marginTop: spacing.sm }}
                />
              </Card>

              {/* Offline-First Privacy Guarantee */}
              <View style={[styles.privacyBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border, borderRadius: radius.md }]}>
                <Text style={{ fontSize: 16 }}>🛡️</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>Offline-First Local Storage</Text>
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>
                    All existing transactions on this phone will seamlessly link to your account.
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backButton: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  brandEmblem: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
});
