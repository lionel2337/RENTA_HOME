import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme, ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { firestoreDb } from '../services/firestoreDb';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Écouter l'état d'authentification de l'utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (initializing) {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, [initializing]);

  // Gérer les redirections basées sur l'authentification et les rôles
  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user) {
      // Si non connecté, on redirige vers l'authentification
      if (!inAuthGroup) {
        router.replace('/(auth)');
      }
    } else {
      // Si connecté, on cherche le profil utilisateur pour connaître son rôle
      firestoreDb.getUserProfile(user.uid)
        .then((profile) => {
          if (profile) {
            if (profile.role === 'landlord') {
              // Propriétaire ➡️ Interface de gestion bailleur
              router.replace('/landlord/tenants');
            } else {
              // Locataire ➡️ Interface client principale (Tabs)
              router.replace('/(tabs)');
            }
          } else {
            router.replace('/(tabs)');
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la redirection :", error);
          router.replace('/(tabs)');
        });
    }
  }, [user, initializing, segments]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff8e3c" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="listing/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="booking/checkout" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0d0e15',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
