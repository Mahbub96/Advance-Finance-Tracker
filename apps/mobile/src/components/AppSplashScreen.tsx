import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export interface AppSplashScreenProps {
  /** Optional status text shown below progress */
  statusText?: string;
  /** Subtitle message */
  subtitle?: string;
}

export function AppSplashScreen({
  statusText = 'Initializing secure local ledger...',
  subtitle = 'Smart • Offline-First • Private',
}: AppSplashScreenProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const ringAnim1 = useRef(new Animated.Value(0.6)).current;
  const ringOpacity1 = useRef(new Animated.Value(0.8)).current;
  const ringAnim2 = useRef(new Animated.Value(0.3)).current;
  const ringOpacity2 = useRef(new Animated.Value(0.6)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Initializing secure local ledger...',
    'Loading SQLite database...',
    'Preparing financial intelligence...',
    'Ready',
  ];

  useEffect(() => {
    // 1. Gentle logo pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // 2. Glow intensity pulse
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.9,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // 3. Expanding ripple ring 1
    const ringLoop1 = Animated.loop(
      Animated.parallel([
        Animated.timing(ringAnim1, {
          toValue: 1.6,
          duration: 2200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(ringOpacity1, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity1, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    // 4. Expanding ripple ring 2 (delayed)
    const ringLoop2 = Animated.loop(
      Animated.sequence([
        Animated.delay(700),
        Animated.parallel([
          Animated.timing(ringAnim2, {
            toValue: 1.7,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ringOpacity2, {
              toValue: 0.4,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity2, {
              toValue: 0,
              duration: 1400,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
    );

    // 5. Progress bar shimmer
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    pulseLoop.start();
    glowLoop.start();
    ringLoop1.start();
    ringLoop2.start();
    shimmerLoop.start();

    // Step cycle
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 2 ? prev + 1 : prev));
    }, 700);

    return () => {
      pulseLoop.stop();
      glowLoop.stop();
      ringLoop1.stop();
      ringLoop2.stop();
      shimmerLoop.stop();
      clearInterval(stepInterval);
    };
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 180],
  });

  return (
    <View style={styles.container}>
      {/* Background radial ambient glow orb */}
      <View style={styles.ambientGlow} />

      {/* Ripple Rings */}
      <Animated.View
        style={[
          styles.rippleRing,
          {
            transform: [{ scale: ringAnim1 }],
            opacity: ringOpacity1,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.rippleRing,
          {
            transform: [{ scale: ringAnim2 }],
            opacity: ringOpacity2,
          },
        ]}
      />

      {/* Main Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Glow backdrop behind badge */}
        <Animated.View style={[styles.badgeGlow, { opacity: glowAnim }]} />

        {/* Brand Icon SVG */}
        <Svg width={96} height={96} viewBox="0 0 96 96" fill="none">
          <Defs>
            <LinearGradient id="bgGrad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#2563EB" />
              <Stop offset="50%" stopColor="#1D4ED8" />
              <Stop offset="100%" stopColor="#0F172A" />
            </LinearGradient>
            <LinearGradient id="accentGrad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#60A5FA" />
              <Stop offset="100%" stopColor="#3B82F6" />
            </LinearGradient>
            <LinearGradient id="emeraldGrad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#34D399" />
              <Stop offset="100%" stopColor="#10B981" />
            </LinearGradient>
          </Defs>

          {/* Rounded Squircle Container */}
          <Rect
            x="4"
            y="4"
            width="88"
            height="88"
            rx="24"
            fill="url(#bgGrad)"
            stroke="rgba(96, 165, 250, 0.4)"
            strokeWidth="1.5"
          />

          {/* Inner Accent Ring */}
          <Rect
            x="10"
            y="10"
            width="76"
            height="76"
            rx="18"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />

          {/* Growth Chart Polyline / Geometric Logo */}
          <Path
            d="M26 62 L42 46 L54 54 L70 34"
            stroke="url(#emeraldGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Upward Growth Arrow */}
          <Path
            d="M58 34 H70 V46"
            stroke="url(#emeraldGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Currency Gem / Node Dots */}
          <Circle cx="26" cy="62" r="4" fill="#38BDF8" />
          <Circle cx="42" cy="46" r="4" fill="#60A5FA" />
          <Circle cx="54" cy="54" r="4" fill="#818CF8" />
          <Circle cx="70" cy="34" r="5" fill="#34D399" />
        </Svg>
      </Animated.View>

      {/* Brand Title & Subtitle */}
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.titleMain}>Fin</Text>
          <Text style={styles.titleAccent}>Track</Text>
        </View>
        <Text style={styles.brandTagline}>ADVANCED FINANCE INTELLIGENCE</Text>
        <Text style={styles.brandPill}>{subtitle}</Text>
      </View>

      {/* Shimmer Loading Bar */}
      <View style={styles.loaderSection}>
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarShimmer,
              {
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          />
        </View>

        <Text style={styles.statusText}>{statusText || steps[currentStep]}</Text>
      </View>

      {/* Security & Offline-First Footer */}
      <View style={styles.footer}>
        <View style={styles.securityBadge}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.securityText}>100% Offline-First • Local SQLite Encrypted</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ambientGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#1E40AF',
    opacity: 0.18,
    top: '30%',
  },
  rippleRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    top: '36%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  badgeGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2563EB',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 28,
    elevation: 20,
  },
  textContainer: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 36,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleMain: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  titleAccent: {
    fontSize: 34,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
    letterSpacing: 2.2,
    marginTop: 2,
  },
  brandPill: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 4,
  },
  loaderSection: {
    width: '100%',
    maxWidth: 240,
    alignItems: 'center',
    gap: 12,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarShimmer: {
    width: 80,
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 44,
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  lockIcon: {
    fontSize: 12,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
