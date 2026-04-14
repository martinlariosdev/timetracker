import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// TEMP FIX: Reanimated requires custom development build, not available in Expo Go
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   Easing,
// } from 'react-native-reanimated';

export function ExpandToggle({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  // TEMP FIX: Removed rotation animation, using icon swap instead
  // const rotateValue = useSharedValue(0);
  //
  // useEffect(() => {
  //   rotateValue.value = withTiming(isExpanded ? 180 : 0, {
  //     duration: 300,
  //     easing: Easing.out(Easing.ease),
  //   });
  // }, [isExpanded, rotateValue]);
  //
  // const chevronStyle = useAnimatedStyle(() => ({
  //   transform: [{ rotate: `${rotateValue.value}deg` }],
  // }));

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
      <View style={{ marginLeft: 4 }}>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={16}
          color="#2563EB"
        />
      </View>
    </TouchableOpacity>
  );
}
