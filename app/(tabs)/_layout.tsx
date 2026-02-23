import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: isDark ? '#555' : '#B2BEC3',
        tabBarStyle: {
          backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
          borderTopColor: isDark ? '#2D2D3E' : '#F0F0F0',
          borderTopWidth: 1,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: isDark ? '#0D0D1A' : '#F8F9FA',
        },
        headerTintColor: isDark ? '#F0F0F0' : '#2D3436',
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="🏠" color={color} size={size} />
          ),
          headerTitle: 'Wanderly ✨',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Collections',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="📁" color={color} size={size} />
          ),
          headerTitle: 'Collections',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="➕" color={color} size={size} />
          ),
          headerTitle: 'Save Link',
          headerShown: true,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color, size }: { emoji: string; color: string; size: number }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: size - 4 }}>{emoji}</Text>;
}
