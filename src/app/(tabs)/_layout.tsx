import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { Spacing, Borders } from '@/constants/theme';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.cardBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingTop: Spacing.one,
          paddingBottom: Platform.OS === 'ios' ? Spacing.four : Spacing.two,
          elevation: 8,
          shadowColor: theme.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlists"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Voyages',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
