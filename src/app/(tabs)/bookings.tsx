import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Platform,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { GlassCard } from '@/components/GlassCard';
import { mockDatabase, Booking } from '@/services/mockDatabase';
import { Spacing, Borders, Shadows } from '@/constants/theme';

type BookingTab = 'upcoming' | 'active' | 'past';

export default function BookingsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Digital key simulation states
  const [keyState, setKeyState] = useState<'locked' | 'connecting' | 'unlocked'>('locked');
  const keyPulse = useState(new Animated.Value(1))[0];

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await mockDatabase.getBookings();
      setBookings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleUnlockDoor = () => {
    if (keyState !== 'locked') return;

    setKeyState('connecting');

    // Radar pulse animation during connection
    Animated.loop(
      Animated.sequence([
        Animated.timing(keyPulse, {
          toValue: 1.4,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(keyPulse, {
          toValue: 1.0,
          duration: 400,
          useNativeDriver: true,
        })
      ]),
      { iterations: 3 }
    ).start(() => {
      // After 2.4 seconds, unlock the door
      setKeyState('unlocked');

      // Lock it back automatically after 5 seconds
      setTimeout(() => {
        setKeyState('locked');
      }, 5000);
    });
  };

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Mes Voyages</Text>
      </View>

      {/* Tabs Selector */}
      <View style={[styles.tabContainer, { borderColor: theme.cardBorder }]}>
        {(['active', 'upcoming', 'past'] as BookingTab[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'active' ? 'Séjour en cours' : tab === 'upcoming' ? 'À venir' : 'Historique';
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabItem,
                isActive && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
              ]}
            >
              <Text 
                style={[
                  styles.tabLabel, 
                  { 
                    color: isActive ? theme.primary : theme.textSecondary,
                    fontWeight: isActive ? '700' : '600'
                  }
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Active / Current Stay Features: Render Digital Room Key */}
          {activeTab === 'active' && filteredBookings.length > 0 && (
            <GlassCard style={styles.keyCard} intensity="heavy">
              <View style={styles.keyHeader}>
                <Ionicons name="key" size={20} color={theme.primary} />
                <Text style={[styles.keyTitle, { color: theme.text }]}>Clé Numérique RENTA_HOME</Text>
              </View>
              <Text style={[styles.keySub, { color: theme.textSecondary }]}>
                {filteredBookings[0].listingTitle} • Chambre 204
              </Text>

              {/* Interactive Lock circle */}
              <View style={styles.lockContainer}>
                {keyState === 'connecting' && (
                  <Animated.View 
                    style={[
                      styles.pulseRing, 
                      { 
                        transform: [{ scale: keyPulse }],
                        borderColor: theme.primary,
                        backgroundColor: theme.primary + '15',
                      }
                    ]} 
                  />
                )}
                
                <Pressable
                  onPress={handleUnlockDoor}
                  style={({ pressed }) => [
                    styles.lockCircle,
                    {
                      backgroundColor: keyState === 'unlocked' 
                        ? theme.success 
                        : keyState === 'connecting'
                          ? theme.primaryLight
                          : theme.backgroundSelected,
                      borderColor: keyState === 'unlocked'
                        ? theme.success
                        : theme.primary,
                      opacity: pressed ? 0.9 : 1,
                      ...Shadows.medium
                    }
                  ]}
                >
                  <Ionicons 
                    name={
                      keyState === 'unlocked' 
                        ? 'lock-open' 
                        : keyState === 'connecting' 
                          ? 'radio-outline' 
                          : 'lock-closed'
                    } 
                    size={38} 
                    color={
                      keyState === 'unlocked' 
                        ? '#FFFFFF' 
                        : theme.primary
                    } 
                  />
                </Pressable>
              </View>

              <Text style={[styles.lockStatusText, { color: theme.text }]}>
                {keyState === 'unlocked' 
                  ? 'Porte Déverrouillée ! (Se reverrouille dans 5s)' 
                  : keyState === 'connecting' 
                    ? 'Connexion NFC au verrou...' 
                    : 'Touchez pour ouvrir la porte'}
              </Text>
            </GlassCard>
          )}

          {/* Bookings Feed */}
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="airplane-outline" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun voyage trouvé</Text>
              <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
                Vous n'avez pas de réservation dans cette catégorie pour le moment.
              </Text>
            </View>
          ) : (
            filteredBookings.map((booking) => (
              <GlassCard key={booking.id} style={styles.bookingCard} intensity="medium">
                <Image source={{ uri: booking.listingImage }} style={styles.bookingImage} />
                <View style={styles.bookingDetails}>
                  <Text style={[styles.bookingTitle, { color: theme.text }]} numberOfLines={1}>
                    {booking.listingTitle}
                  </Text>
                  <Text style={[styles.bookingLocation, { color: theme.textSecondary }]}>
                    {booking.listingLocation}
                  </Text>

                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                    <Text style={[styles.dateText, { color: theme.text }]}>
                      Du {booking.startDate} au {booking.endDate}
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.footerRow}>
                    <Text style={[styles.priceText, { color: theme.text }]}>
                      Total : {booking.totalPrice}€
                    </Text>
                    <Pressable
                      onPress={() => router.push(`/listing/${booking.listingId}`)}
                      style={[styles.actionBtn, { backgroundColor: theme.primaryLight }]}
                    >
                      <Text style={[styles.actionBtnText, { color: theme.primary }]}>Détails</Text>
                    </Pressable>
                  </View>
                </View>
              </GlassCard>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Platform.OS === 'android' ? Spacing.four : Spacing.two,
    paddingBottom: Spacing.two,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  tabLabel: {
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
  },
  keyCard: {
    marginVertical: Spacing.three,
    borderRadius: Borders.radiusLG,
    padding: Spacing.four,
    alignItems: 'center',
  },
  keyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  keyTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  keySub: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: Spacing.three,
  },
  lockContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 130,
    marginVertical: Spacing.two,
  },
  lockCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  pulseRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
  },
  lockStatusText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: Spacing.two,
    textAlign: 'center',
  },
  bookingCard: {
    padding: 0,
    borderRadius: Borders.radiusLG,
    overflow: 'hidden',
    marginTop: Spacing.three,
  },
  bookingImage: {
    width: '100%',
    height: 150,
  },
  bookingDetails: {
    padding: Spacing.three,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  bookingLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: Spacing.two,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
  },
  actionBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Borders.radiusSM,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: Spacing.two,
  },
});
