import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Heading, BodyText, Input, Button } from '@/components/BentoBox';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Implement actual login logic (Task 29)
    console.log('Login pressed', { username, password });
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="auto" />

      <View className="flex-1 p-lg justify-center">
        <Heading level={1} className="mb-2 text-center">
          TimeTrack
        </Heading>
        <BodyText className="mb-xl text-center text-gray-600">
          Sign in to continue
        </BodyText>

        <View className="gap-4">
          <Input
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoComplete="username"
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <Button variant="primary" onPress={handleLogin} className="mt-2">
            Sign In
          </Button>
        </View>
      </View>
    </View>
  );
}
