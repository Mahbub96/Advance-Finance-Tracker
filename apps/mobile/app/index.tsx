import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppSplashScreen } from '../src/components/AppSplashScreen';
import { useSettings } from '../src/hooks/use-settings';
import { useAuth } from '../src/providers/auth-provider';
import { useFinance } from '../src/providers/finance-provider';

export default function Index() {
  useFinance();
  const { settings, ready } = useSettings();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  useEffect(() => {
    // Ensure the user experiences a smooth, premium brand introduction rather than a 10ms flash
    const timer = setTimeout(() => {
      setMinSplashElapsed(true);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  if (!ready || authLoading || !minSplashElapsed) {
    return <AppSplashScreen statusText="Loading profile & workspace..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  if (!settings || !settings.onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
