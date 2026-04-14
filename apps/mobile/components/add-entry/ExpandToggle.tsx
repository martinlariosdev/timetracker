import React, { useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export function ExpandToggle({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const rotateValue = useSharedValue(0);

  useEffect(() => {
    rotateValue.value = withTiming(isExpanded ? 180 : 0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [isExpanded, rotateValue]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value}deg` }],
  }));

  return (
    <TouchableOpacity
      onPress={onToggle}
      className="mt-2 mb-md items-center justify-center flex-row"
      style={{ height: 44 }}
      accessibilityLabel={
        isExpanded ? 'Show less details' : 'Show more details'
      }
      accessibilityRole="button"
    >
      <Text className="text-body font-semibold" style={{ color: '#2563EB' }}>
        {isExpanded ? 'Less Details' : 'More Details'}
      </Text>
      <Animated.View style={[{ marginLeft: 4 }, chevronStyle]}>
        <Ionicons name="chevron-down" size={16} color="#2563EB" />
      </Animated.View>
    </TouchableOpacity>
  );
}
