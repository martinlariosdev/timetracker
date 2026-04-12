import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function LoginScreen() {
  const handleSignIn = () => {
    // TODO: Implement Okta authentication
    console.log('Sign in with Okta');
  };

  const handleHelpPress = () => {
    // TODO: Navigate to support/help
    console.log('Help pressed');
  };

  return (
    <LinearGradient
      colors={['#2563EB', '#0EA5E9', '#1E40AF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center px-6 py-8">
            {/* Decorative Background Circles - Optional */}
            <View className="absolute top-[20%] -right-[40%] w-60 h-60 rounded-full bg-white/10" />
            <View className="absolute bottom-[35%] -left-[30%] w-[180px] h-[180px] rounded-full bg-white/8" />
            <View className="absolute top-[50%] left-[85%] w-[120px] h-[120px] rounded-full bg-white/12" />

            {/* Software Mind Logo */}
            <View className="mb-12">
              {/* TODO: Replace with actual Software Mind logo from assets */}
              <Image
                source={{ uri: 'https://placeholder.com/180x48' }}
                style={{
                  width: 180,
                  height: 48,
                  tintColor: 'white',
                }}
                resizeMode="contain"
              />
            </View>

            {/* Main Login Card */}
            <View
              className="bg-white rounded-3xl p-8 w-[88%] max-w-[380px]"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.15,
                shadowRadius: 25,
                elevation: 10,
              }}
            >
              {/* Icon Container with Gradient */}
              <LinearGradient
                colors={['#2563EB', '#0EA5E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="w-20 h-20 items-center justify-center mx-auto mb-6"
                style={{
                  borderRadius: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                {/* TODO: Replace with @expo/vector-icons or react-native-vector-icons */}
                <View className="w-12 h-12 items-center justify-center">
                  <Text className="text-white text-2xl font-bold">TT</Text>
                </View>
              </LinearGradient>

              {/* Welcome Heading */}
              <Text
                className="text-[26px] font-bold text-gray-900 text-center mb-2"
                style={{ letterSpacing: -0.5 }}
              >
                Welcome to TimeTrack
              </Text>

              {/* Tagline */}
              <Text className="text-base text-gray-500 text-center mb-8">
                Your time, perfectly tracked
              </Text>

              {/* Sign In Button with Gradient */}
              <TouchableOpacity
                onPress={handleSignIn}
                activeOpacity={0.8}
                className="mb-6"
              >
                <LinearGradient
                  colors={['#2563EB', '#1E40AF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-[58px] items-center justify-center flex-row"
                  style={{
                    borderRadius: 14,
                    shadowColor: '#2563EB',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  {/* TODO: Replace with @expo/vector-icons or react-native-vector-icons */}
                  <View className="mr-3">
                    <Text className="text-white text-base font-bold">LOCK</Text>
                  </View>
                  <Text className="text-lg font-semibold text-white">
                    Sign in with Okta
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider with Text */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-[1px] bg-gray-200" />
                <Text className="text-sm font-medium text-gray-400 px-3">
                  or
                </Text>
                <View className="flex-1 h-[1px] bg-gray-200" />
              </View>

              {/* Feature Pills */}
              {/* TODO: Replace with @expo/vector-icons or react-native-vector-icons */}
              <View className="flex-row flex-wrap gap-2 justify-center">
                {/* Quick Entry Pill */}
                <View className="bg-gray-100 rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                  <Text className="text-blue-600 text-xs font-bold">FAST</Text>
                  <Text className="text-xs font-medium text-gray-600">
                    Quick Entry
                  </Text>
                </View>

                {/* Reports Pill */}
                <View className="bg-gray-100 rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                  <Text className="text-blue-600 text-xs font-bold">DATA</Text>
                  <Text className="text-xs font-medium text-gray-600">
                    Reports
                  </Text>
                </View>

                {/* Secure Pill */}
                <View className="bg-gray-100 rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                  <Text className="text-blue-600 text-xs font-bold">SAFE</Text>
                  <Text className="text-xs font-medium text-gray-600">
                    Secure
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer with Frosted Glass Effect */}
          <View className="items-center pb-8">
            <View
              className="bg-black/15 rounded-t-2xl px-6 py-4"
              style={{
                // Note: backdrop-blur not fully supported in React Native
                // Consider using @react-native-community/blur for iOS
              }}
            >
              <TouchableOpacity
                onPress={handleHelpPress}
                activeOpacity={0.7}
                className="h-11"
              >
                <Text
                  className="text-sm font-medium text-white text-center"
                  style={{
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Need help? Contact support
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
