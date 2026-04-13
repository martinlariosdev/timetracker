import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

const BANNER_HEIGHT = 40;
const ANIMATION_DURATION = 300;

/**
 * OfflineBanner displays a fixed warning banner at the top of the screen
 * when the device loses internet connectivity.
 *
 * The banner slides down when offline and slides back up when connectivity
 * is restored. It respects safe area insets for notch/status bar spacing.
 *
 * @example
 * ```tsx
 * // Place at the root of your screen layout
 * function RootLayout() {
 *   return (
 *     <View className="flex-1">
 *       <OfflineBanner />
 *       <MainContent />
 *     </View>
 *   );
 * }
 * ```
 */
export function OfflineBanner() {
  const { isOnline } = useOfflineStatus();
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(-BANNER_HEIGHT - insets.top);

  useEffect(() => {
    translateY.value = withTiming(isOnline ? -BANNER_HEIGHT - insets.top : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isOnline, insets.top, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          paddingTop: insets.top,
        },
        animatedStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel="No internet connection"
    >
      <View
        style={{ height: BANNER_HEIGHT }}
        className="flex-row items-center justify-center bg-warning/90 px-md"
      >
        <Ionicons
          name="alert-circle"
          size={18}
          color="#FFFFFF"
          style={{ marginRight: 8 }}
        />
        <Text className="text-body-small text-white font-medium">
          No internet connection
        </Text>
      </View>
    </Animated.View>
  );
}
