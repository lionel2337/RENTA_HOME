import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { GlassCard } from '@/components/GlassCard';
import { mockDatabase, Listing } from '@/services/mockDatabase';
import { Spacing, Borders, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchDetail = async () => {
      if (typeof id === 'string') {
        setLoading(true);
        const data = await mockDatabase.getListingById(id);
        setListing(data);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleBooking = () => {
    if (listing) {
      router.push({
        pathname: '/booking/checkout',
        params: { id: listing.id },
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Demeure introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Images Carousel Header */}
        <View style={styles.imageCarousel}>
          <Image source={{ uri: listing.imageUrls[activeImageIndex] }} style={styles.mainImage as any} />
          
          {/* Custom Back and Action Buttons */}
          <SafeAreaView style={styles.headerOverlay}>
            <View style={styles.headerOverlayRow}>
              <Pressable 
                onPress={() => router.back()}
                style={styles.circleBtn}
              >
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </Pressable>
              
              <View style={styles.headerRightActions}>
                <Pressable style={styles.circleBtn}>
                  <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                </Pressable>
                <Pressable 
                  onPress={() => setIsFavorite(!isFavorite)}
                  style={styles.circleBtn}
                >
                  <Ionicons 
                    name={isFavorite ? 'heart' : 'heart-outline'} 
                    size={20} 
                    color={isFavorite ? theme.accent : '#FFFFFF'} 
                  />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>

          {/* Dots Indicator */}
          {listing.imageUrls.length > 1 && (
            <View style={styles.dotsContainer}>
              {listing.imageUrls.map((_, i) => (
                <Pressable 
                  key={i} 
                  onPress={() => setActiveImageIndex(i)}
                  style={[
                    styles.dot, 
                    { backgroundColor: activeImageIndex === i ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)' }
                  ]} 
                />
              ))}
            </View>
          )}
        </View>

        {/* Content body */}
        <View style={styles.body}>
          {/* Header Info */}
          <Text style={[styles.title, { color: theme.text }]}>{listing.title}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FBBF24" />
            <Text style={[styles.ratingText, { color: theme.text }]}> {listing.rating}</Text>
            <Text style={{ color: theme.textSecondary }}> ({listing.reviewsCount} avis)</Text>
            <Text style={[{ color: theme.primary, fontWeight: '700', marginLeft: Spacing.two }]}>
              {listing.category}
            </Text>
          </View>
          
          <Text style={[styles.location, { color: theme.textSecondary }]}>
            <Ionicons name="location-outline" size={14} color={theme.textSecondary} /> {listing.location}
          </Text>

          <View style={styles.divider} />

          {/* Host Card */}
          <GlassCard style={styles.hostCard} intensity="light">
            <Image source={{ uri: listing.host.avatarUrl }} style={styles.hostAvatar as any} />
            <View style={styles.hostInfo}>
              <Text style={[styles.hostName, { color: theme.text }]}>Hôte : {listing.host.name}</Text>
              {listing.host.isSuperHost && (
                <View style={[styles.superHostBadge, { backgroundColor: theme.accentLight }]}>
                  <Text style={[styles.superHostText, { color: theme.accent }]}>★ Super Hôte</Text>
                </View>
              )}
              <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                Taux de réponse : {listing.host.responseRate}
              </Text>
            </View>
          </GlassCard>

          {/* Description */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>À propos de ce logement</Text>
          <Text style={[styles.descriptionText, { color: theme.text }]}>
            {listing.description}
          </Text>

          {/* Amenities */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Ce que propose ce lieu</Text>
          <View style={styles.amenitiesGrid}>
            {listing.amenities.map((item, index) => (
              <View key={index} style={[styles.amenityChip, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                <Ionicons name="checkmark-circle-outline" size={16} color={theme.primary} />
                <Text style={[styles.amenityText, { color: theme.text }]} numberOfLines={1}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Map Section */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Où se situe le logement</Text>
          <GlassCard style={styles.miniMapCard} intensity="light">
            {/* Fake map drawing */}
            <View style={[styles.fakeMap, { backgroundColor: theme.backgroundSelected }]}>
              <Ionicons name="map-outline" size={32} color={theme.primary} />
              <Text style={[styles.fakeMapText, { color: theme.textSecondary }]}>Carte interactive RENTA_HOME</Text>
              <View style={[styles.mapCenterPin, { backgroundColor: theme.primary }]}>
                <Ionicons name="home" size={14} color="#FFFFFF" />
              </View>
            </View>
          </GlassCard>

          <View style={styles.divider} />

          {/* Reviews List & Sentiment Badges */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Avis des Voyageurs</Text>
          {listing.reviews.map((rev) => (
            <GlassCard key={rev.id} style={styles.reviewCard} intensity="medium">
              <View style={styles.reviewHeader}>
                <Image source={{ uri: rev.avatarUrl }} style={styles.reviewAvatar as any} />
                <View style={styles.reviewMeta}>
                  <Text style={[styles.reviewAuthor, { color: theme.text }]}>{rev.author}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{rev.date}</Text>
                </View>
                <View style={styles.reviewStars}>
                  <Ionicons name="star" size={12} color="#FBBF24" />
                  <Text style={[styles.reviewRating, { color: theme.text }]}> {rev.rating}</Text>
                </View>
              </View>
              
              <Text style={[styles.reviewComment, { color: theme.text }]}>{rev.comment}</Text>

              {/* Sentiment tags */}
              <View style={styles.sentimentRow}>
                {rev.sentimentBadges.map((badge, idx) => (
                  <View key={idx} style={[styles.sentimentTag, { backgroundColor: theme.primaryLight }]}>
                    <Ionicons name="analytics" size={10} color={theme.primary} />
                    <Text style={[styles.sentimentText, { color: theme.primary }]}> {badge}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <GlassCard style={styles.bookingBar} intensity="heavy">
        <View style={styles.priceContainer}>
          <Text style={[styles.priceVal, { color: theme.text }]}>
            {listing.price}€
          </Text>
          <Text style={[styles.pricePerNight, { color: theme.textSecondary }]}> / nuit</Text>
        </View>
        <Pressable 
          onPress={handleBooking}
          style={({ pressed }) => [
            styles.bookButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1, ...Shadows.light }
          ]}
        >
          <Text style={styles.bookButtonText}>Réserver maintenant</Text>
        </Pressable>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 110, // Avoid overlapping booking bar
  },
  imageCarousel: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerOverlayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Platform.OS === 'android' ? Spacing.three : 0,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(9, 7, 20, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: Spacing.three,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  body: {
    padding: Spacing.three,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
  },
  location: {
    fontSize: 13,
    marginTop: Spacing.one,
    fontWeight: '500',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: Spacing.three,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: Borders.radiusMD,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 14,
    fontWeight: '700',
  },
  superHostBadge: {
    paddingHorizontal: Spacing.one,
    paddingVertical: 1,
    borderRadius: Borders.radiusXS,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  superHostText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  amenityChip: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.two,
    borderRadius: Borders.radiusSM,
    borderWidth: 1,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  miniMapCard: {
    padding: 0,
    borderRadius: Borders.radiusMD,
  },
  fakeMap: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: Borders.radiusMD - 1,
  },
  fakeMapText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: Spacing.one,
  },
  mapCenterPin: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  reviewCard: {
    borderRadius: Borders.radiusMD,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reviewMeta: {
    flex: 1,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRating: {
    fontSize: 12,
    fontWeight: '700',
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.two,
  },
  sentimentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  sentimentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Borders.radiusXS,
  },
  sentimentText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bookingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingVertical: Platform.OS === 'ios' ? Spacing.three : Spacing.two,
    borderTopLeftRadius: Borders.radiusLG,
    borderTopRightRadius: Borders.radiusLG,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  pricePerNight: {
    fontSize: 13,
  },
  bookButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Borders.radiusMD,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
