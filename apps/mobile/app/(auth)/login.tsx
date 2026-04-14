import { View, Text, Pressable, ActivityIndicator, AccessibilityInfo, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
// TEMP FIX: Reanimated requires custom development build, not available in Expo Go
// import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';
import { BiometricService } from '@/lib/auth/biometric-service';
import { MockLoginButtonWithSelector } from '@/components/MockLoginButton';
import { useRouter } from 'expo-router';

const FEATURE_PILLS = [
  { icon: 'clock' as const, label: 'Quick Entry' },
  { icon: 'bar-chart-2' as const, label: 'Reports' },
  { icon: 'shield' as const, label: 'Secure' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, biometricEnabled, authenticateWithBiometric } = useAuth();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometric');
  const [biometricIcon, setBiometricIcon] = useState<string>('finger-print-outline');
  const [showBiometric, setShowBiometric] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (biometricEnabled) {
      setShowBiometric(true);
      BiometricService.getBiometricLabel().then(setBiometricLabel);
      BiometricService.getBiometricIconName().then(setBiometricIcon);
    } else {
      setShowBiometric(false);
    }
  }, [biometricEnabled]);

  const handleSignIn = async () => {
    try {
      await login();
    } catch {
      // Error is surfaced via authState.error
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const success = await authenticateWithBiometric();
      if (!success) {
        // Biometric failed or tokens expired - user can use Okta button
      }
    } catch {
      // Error is surfaced via authState.error
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@softwaremind.com');
  };

  // TEMP FIX: Removed Reanimated animations - requires custom development build
  // const cardEntering = reduceMotion
  //   ? FadeIn.delay(200).duration(300)
  //   : FadeInUp.delay(200).duration(600).springify();
  //
  // const logoEntering = reduceMotion
  //   ? FadeIn.duration(200)
  //   : FadeIn.delay(100).duration(300);
  //
  // const pillsEntering = reduceMotion
  //   ? FadeIn.duration(200)
  //   : FadeIn.delay(600).duration(200);

  return (
    <LinearGradient
      colors={['#2563EB', '#0EA5E9', '#1E40AF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center">
          {/* Decorative circles */}
          <View
            style={{
              position: 'absolute',
              top: '20%',
              right: '-40%',
              width: 240,
              height: 240,
              borderRadius: 120,
              backgroundColor: 'rgba(255,255,255,0.1)',
            }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <View
            style={{
              position: 'absolute',
              bottom: '35%',
              left: '-15%',
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <View
            style={{
              position: 'absolute',
              top: '50%',
              left: '85%',
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(255,255,255,0.12)',
            }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />

          {/* Logo */}
          <View className="mb-2xl items-center">
            <View
              className="w-[180px] items-center justify-center"
              accessible
              accessibilityLabel="Software Mind logo"
            >
              <Text
                className="text-[28px] font-bold text-white"
                style={{
                  letterSpacing: 1,
                  textShadowColor: 'rgba(0,0,0,0.15)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8,
                }}
              >
                SOFTWARE MIND
              </Text>
            </View>
          </View>

          {/* Floating Card */}
          <View
            className="bg-white rounded-3xl p-xl w-[88%] max-w-[380px] items-center shadow-level-4"
            style={{ elevation: 24 }}
          >
            {/* Icon container */}
            <LinearGradient
              colors={['#2563EB', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="w-20 h-20 rounded-2xl items-center justify-center mb-lg shadow-level-2"
              style={{ elevation: 6 }}
              accessible
              accessibilityLabel="TimeTrack application icon"
            >
              <Feather name="clock" size={48} color="#FFFFFF" />
            </LinearGradient>

            {/* Welcome heading */}
            <Text
              className="text-[26px] font-bold text-gray-900 text-center mb-sm"
              style={{ letterSpacing: -0.5 }}
            >
              Welcome to TimeTrack
            </Text>

            {/* Tagline */}
            <Text className="text-body text-gray-500 text-center mb-xl">
              Your time, perfectly tracked
            </Text>

            {/* Sign in button */}
            <Pressable
              onPress={handleSignIn}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Okta"
              accessibilityState={{ disabled: isLoading }}
              className="w-full rounded-[14px] overflow-hidden"
              style={({ pressed }) => ({
                transform: [{ scale: pressed && !isLoading ? 0.97 : 1 }],
                opacity: isLoading ? 0.5 : 1,
              })}
            >
              <LinearGradient
                colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#2563EB', '#1E40AF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-[58px] flex-row items-center justify-center gap-3"
                style={{
                  shadowColor: '#2563EB',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Feather name="shield" size={24} color="#FFFFFF" />
                )}
                <Text className="text-body-large font-semibold text-white">
                  {isLoading ? 'Signing in...' : 'Sign in with Okta'}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Biometric sign-in button */}
            {showBiometric ? (
              <Pressable
                onPress={handleBiometricLogin}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel={`Sign in with ${biometricLabel}`}
                accessibilityState={{ disabled: isLoading }}
                className="w-full mt-md rounded-[14px] overflow-hidden border-2 border-blue-600"
                style={({ pressed }) => ({
                  transform: [{ scale: pressed && !isLoading ? 0.97 : 1 }],
                  opacity: isLoading ? 0.5 : 1,
                })}
              >
                <View className="h-[54px] flex-row items-center justify-center gap-3 bg-white">
                  <Ionicons
                    name={biometricIcon as any}
                    size={24}
                    color="#2563EB"
                  />
                  <Text className="text-body font-semibold text-blue-600">
                    Sign in with {biometricLabel}
                  </Text>
                </View>
              </Pressable>
            ) : null}

            {/* Error message */}
            {error ? (
              <View className="mt-md px-3 py-2 bg-red-50 rounded-sm w-full">
                <Text className="text-body-small text-red-600 text-center">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Divider */}
            <View className="flex-row items-center my-lg w-full">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="text-body-small font-medium text-gray-400 px-3">
                or
              </Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            {/* Mock Login (Development Only) */}
            <MockLoginButtonWithSelector
              onSuccess={() => router.replace('/(tabs)')}
            />

            {/* Feature pills */}
            <View
              className="flex-row flex-wrap gap-sm justify-center mt-lg"
            >
              {FEATURE_PILLS.map((pill) => (
                <View
                  key={pill.label}
                  className="bg-gray-100 rounded-full px-2 py-1.5 flex-row items-center gap-1.5"
                >
                  <Feather name={pill.icon} size={16} color="#2563EB" />
                  <Text className="text-caption font-medium text-gray-600">
                    {pill.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Footer */}
        <Pressable
          onPress={handleContactSupport}
          className="absolute bottom-xl self-center bg-black/15 rounded-t-lg px-md py-3"
          accessibilityRole="link"
          accessibilityLabel="Need help? Contact support"
        >
          <Text
            className="text-body-small font-medium text-white text-center"
            style={{
              textShadowColor: 'rgba(0,0,0,0.3)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            Need help? Contact support
          </Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}
