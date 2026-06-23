import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Pressable, 
  ActivityIndicator, 
  Image, 
  Dimensions, 
  SafeAreaView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BentoGrid } from '@/components/BentoGrid';
import { GlassCard } from '@/components/GlassCard';
import { InteractiveMap } from '@/components/InteractiveMap';
import { mockDatabase, Listing } from '@/services/mockDatabase';
import { Spacing, Borders, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

const BENTO_CATEGORIES = [
  { id: 'Tous', title: 'Tout explorer', subtitle: 'Toutes propriétés', icon: 'compass' as const, size: 'large' as const, color: '#4F46E5' },
  { id: 'Villas', title: 'Villas', subtitle: 'Bord de mer', icon: 'images' as const, size: 'small' as const, color: '#E11D48' },
  { id: 'Cabines', title: 'Cabines', subtitle: 'Dans les bois', icon: 'leaf' as const, size: 'small' as const, color: '#059669' },
  { id: 'Design', title: 'Design', subtitle: 'Architectural', icon: 'color-palette' as const, size: 'small' as const, color: '#2563EB' },
  { id: 'Châteaux', title: 'Châteaux', subtitle: 'Historiques', icon: 'shield-checkmark' as const, size: 'small' as const, color: '#D97706' },
];

export default function ExploreScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Load listings based on category
  const loadListings = async (category: string) => {
    setLoading(true);
    try {
      const data = await mockDatabase.getListings(category);
      setListings(data);
    } catch (error) {
      console.error('Failed to load listings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings(selectedCategory);
  }, [selectedCategory]);

  const handleSelectListing = (listing: Listing) => {
    router.push(`/listing/${listing.id}`);
  };

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <GlassCard style={styles.searchBar} intensity="light">
            <Ionicons name="search" size={20} color={theme.primary} style={styles.searchIcon} />
            <TextInput
              placeholder="Où voulez-vous aller ?"
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </GlassCard>
          
          <Pressable 
            onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            style={({ pressed }) => [
              styles.toggleBtn, 
              { 
                backgroundColor: theme.primary, 
                opacity: pressed ? 0.9 : 1,
                ...Shadows.light 
              }
            ]}
          >
            <Ionicons name={viewMode === 'list' ? 'map' : 'list'} size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <InteractiveMap 
          listings={filteredListings} 
          onSelectListing={handleSelectListing} 
        />
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Categories Bento Grid */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Catégories d'exception</Text>
          <BentoGrid 
            items={BENTO_CATEGORIES} 
            onPressItem={setSelectedCategory} 
            activeId={selectedCategory}
          />

          <View style={styles.listingsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.four }]}>
              {selectedCategory === 'Tous' ? 'Toutes nos adresses' : `${selectedCategory}`}
            </Text>
            <Text style={[styles.listingsCount, { color: theme.textSecondary, marginTop: Spacing.four }]}>
              {filteredListings.length} résultats
            </Text>
          </View>

          {/* Listings List */}
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loaderText, { color: theme.textSecondary }]}>Recherche des plus belles demeures...</Text>
            </View>
          ) : filteredListings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.text }]}>Aucun logement trouvé</Text>
              <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>Essayez d'ajuster vos filtres ou votre recherche.</Text>
            </View>
          ) : (
            filteredListings.map((item) => (
              <Pressable 
                key={item.id}
                onPress={() => handleSelectListing(item)}
                style={({ pressed }) => [
                  styles.cardWrapper,
                  { opacity: pressed ? 0.96 : 1 }
                ]}
              >
                <GlassCard style={styles.listingCard} intensity="medium">
                  {/* Property Image Cover */}
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: item.imageUrls[0] }} style={styles.listingImage} />
                    <View style={styles.tagWrapper}>
                      <Text style={styles.tagText}>{item.category}</Text>
                    </View>
                    <Pressable style={styles.favoriteIcon}>
                      <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
                    </Pressable>
                  </View>

                  {/* Card Description */}
                  <View style={styles.detailsContainer}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.listingTitle, { color: theme.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#FBBF24" />
                        <Text style={[styles.ratingText, { color: theme.text }]}> {item.rating}</Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.listingLocation, { color: theme.textSecondary }]}>
                      {item.location}
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.priceRow}>
                      <Text style={[styles.listingPrice, { color: theme.text }]}>
                        {item.price}€ <Text style={{ fontSize: 13, fontWeight: 'normal', color: theme.textSecondary }}>/ nuit</Text>
                      </Text>
                      <View style={[styles.bookBadge, { backgroundColor: theme.primaryLight }]}>
                        <Text style={[styles.bookBadgeText, { color: theme.primary }]}>Réserver</Text>
                      </View>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
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
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? Spacing.two : Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Borders.radiusLG,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    padding: 0, // Reset default Android margins
  },
  toggleBtn: {
    width: 48,
    height: 48,
    borderRadius: Borders.radiusSM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  listingsCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  loaderContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loaderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardWrapper: {
    marginBottom: Spacing.three,
  },
  listingCard: {
    padding: 0,
    borderRadius: Borders.radiusLG,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  listingImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: Borders.radiusLG - 1,
    borderTopRightRadius: Borders.radiusLG - 1,
  },
  tagWrapper: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    backgroundColor: 'rgba(9, 7, 20, 0.75)',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Borders.radiusXS,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  favoriteIcon: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    backgroundColor: 'rgba(9, 7, 20, 0.4)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    padding: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: Spacing.two,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listingLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: Spacing.two,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingPrice: {
    fontSize: 17,
    fontWeight: '800',
  },
  bookBadge: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one,
    borderRadius: Borders.radiusSM,
  },
  bookBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
