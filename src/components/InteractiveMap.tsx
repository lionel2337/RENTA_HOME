import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Image, Dimensions, Animated } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Colors, Spacing, Borders, Shadows } from '@/constants/theme';
import { Listing } from '@/services/mockDatabase';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';

const { width, height } = Dimensions.get('window');

interface InteractiveMapProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
}

export function InteractiveMap({ listings, onSelectListing }: InteractiveMapProps) {
  const theme = useTheme();
  const [selectedPin, setSelectedPin] = useState<Listing | null>(null);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Loop radar pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Convert real latitude/longitude roughly to visual percentages on the map grid
  // Range covers France (approx Latitude 42 to 51, Longitude -5 to 10)
  const getXY = (lat: number, lng: number) => {
    const minLat = 42;
    const maxLat = 51;
    const minLng = -2;
    const maxLng = 9;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // Invert Y for screen coords

    return { 
      left: `${Math.max(10, Math.min(x, 90))}%`, 
      top: `${Math.max(10, Math.min(y, 90))}%` 
    };
  };

  const handleSelectPin = (listing: Listing) => {
    setSelectedPin(listing);
  };

  const isDark = theme.text === '#F3F4F6';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#05040d' : '#f0eef5' }]}>
      {/* Dynamic Grid Background Overlay mimicking Map Lines */}
      <View style={styles.gridLayer}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View 
            key={`v-${i}`} 
            style={[styles.gridLineV, { left: `${i * 10}%`, borderColor: isDark ? '#14122d' : '#e6e4ec' }]} 
          />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <View 
            key={`h-${i}`} 
            style={[styles.gridLineH, { top: `${i * 7}%`, borderColor: isDark ? '#14122d' : '#e6e4ec' }]} 
          />
        ))}
      </View>

      {/* Compass / Location indicator */}
      <View style={[styles.compassWrapper, { backgroundColor: theme.cardBackground, ...Shadows.light }]}>
        <Ionicons name="compass" size={24} color={theme.primary} />
        <Text style={[styles.compassText, { color: theme.text }]}>Zoom x1.5</Text>
      </View>

      {/* Pins Layer */}
      {listings.map((listing) => {
        const coords = getXY(listing.coordinates.latitude, listing.coordinates.longitude);
        const isSelected = selectedPin?.id === listing.id;

        return (
          <Pressable
            key={listing.id}
            onPress={() => handleSelectPin(listing)}
            style={[styles.pinContainer, coords as any]}
          >
            {isSelected && (
              <Animated.View 
                style={[
                  styles.pulseRing, 
                  { 
                    transform: [{ scale: pulseAnim }],
                    borderColor: theme.primary,
                    backgroundColor: theme.primary + '20',
                  }
                ]} 
              />
            )}
            <View 
              style={[
                styles.pinBubble, 
                { 
                  backgroundColor: isSelected ? theme.primary : theme.cardBackground,
                  borderColor: theme.primary,
                }
              ]}
            >
              <Text 
                style={[
                  styles.pinText, 
                  { color: isSelected ? '#FFFFFF' : theme.text }
                ]}
              >
                {listing.price}€
              </Text>
            </View>
            <View style={[styles.pinTail, { borderTopColor: isSelected ? theme.primary : theme.cardBorder }]} />
          </Pressable>
        );
      })}

      {/* Detail Slide-up Glass Card */}
      {selectedPin && (
        <GlassCard style={styles.slideUpCard} intensity="heavy">
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLocation, { color: theme.primary }]}>{selectedPin.location}</Text>
            <Pressable onPress={() => setSelectedPin(null)}>
              <Ionicons name="close-circle-outline" size={24} color={theme.textSecondary} />
            </Pressable>
          </View>

          <Pressable onPress={() => onSelectListing(selectedPin)} style={styles.cardBody}>
            <Image source={{ uri: selectedPin.imageUrls[0] }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{selectedPin.title}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text style={[styles.cardRating, { color: theme.text }]}> {selectedPin.rating}</Text>
                <Text style={{ color: theme.textSecondary }}> ({selectedPin.reviewsCount} avis)</Text>
              </View>
              <Text style={[styles.cardPrice, { color: theme.text }]}>
                {selectedPin.price}€ <Text style={{ fontSize: 12, fontWeight: 'normal', color: theme.textSecondary }}>/ nuit</Text>
              </Text>
            </View>
          </Pressable>
        </GlassCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gridLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.8,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderWidth: 0.5,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderWidth: 0.5,
  },
  compassWrapper: {
    position: 'absolute',
    top: Spacing.four,
    right: Spacing.four,
    padding: Spacing.one + 4,
    borderRadius: Borders.radiusSM,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    zIndex: 10,
  },
  compassText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 40,
    zIndex: 5,
  },
  pinBubble: {
    paddingHorizontal: Spacing.one + 2,
    paddingVertical: Spacing.half + 2,
    borderRadius: Borders.radiusSM,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  pinText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  pulseRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5,
  },
  slideUpCard: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
    zIndex: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  cardLocation: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  cardImage: {
    width: 90,
    height: 70,
    borderRadius: Borders.radiusSM,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  cardRating: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '800',
  },
});
