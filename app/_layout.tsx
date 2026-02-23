import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? '#0D0D1A' : '#F8F9FA',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="item/[id]"
          options={{
            headerShown: true,
            headerTitle: '',
            headerTransparent: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="collection/[id]"
          options={{
            headerShown: true,
            headerTitle: '',
            headerTransparent: true,
            presentation: 'card',
          }}
        />
      </Stack>
    </>
  );
}
