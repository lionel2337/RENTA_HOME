import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { GlassCard } from '@/components/GlassCard';
import { mockDatabase } from '@/services/mockDatabase';
import { Spacing, Borders, Shadows } from '@/constants/theme';

const AMENITIES_LIST = [
  'Wifi 6',
  'Piscine débordement',
  'Climatisation',
  'Poêle à bois',
  'Cuisine équipée',
  'Jacuzzi',
  'Parking privé',
  'Jardin arboré'
];

const CATEGORIES_LIST = ['Villas', 'Cabines', 'Design', 'Châteaux', 'Appartements'];

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
];

export default function AddPropertyScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(CATEGORIES_LIST[0]);
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_PHOTOS[0]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter(item => item !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !price || !location.trim()) {
      Alert.alert('Champs incomplets', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Prix invalide', 'Le prix par nuit doit être un nombre supérieur à zéro.');
      return;
    }

    setIsSubmitting(true);

    try {
      await mockDatabase.createProperty({
        title,
        description,
        price: priceNum,
        location,
        category,
        imageUrls: [selectedPhoto],
        amenities: selectedAmenities,
        host: {
          name: 'Lucas Dubois (Moi)',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
          isSuperHost: true,
          rating: 4.95,
          responseRate: '100%'
        },
        coordinates: {
          latitude: 46.2276, // Generic center France coordinates
          longitude: 2.2137
        }
      });

      setIsSubmitting(false);
      Alert.alert(
        'Annonce Publiée ! 🎉',
        'Votre propriété RENTA_HOME a été enregistrée avec succès.',
        [{ text: 'Super', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      Alert.alert('Erreur', 'Impossible d\'enregistrer le bien. Veuillez réessayer.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Ajouter une propriété</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Core details card */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Informations générales</Text>
        <GlassCard style={styles.formCard} intensity="light">
          
          <Text style={[styles.inputLabel, { color: theme.text }]}>Titre de l'annonce *</Text>
          <TextInput
            placeholder="Ex: Chalet en bois avec piscine suspendue..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.cardBorder }]}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.inputLabel, { color: theme.text, marginTop: Spacing.three }]}>Description *</Text>
          <TextInput
            placeholder="Décrivez l'expérience unique de votre demeure..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.textArea, { color: theme.text, borderColor: theme.cardBorder }]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </GlassCard>

        {/* Pricing & Location */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tarifs & Emplacement</Text>
        <GlassCard style={styles.formCard} intensity="light">
          
          <Text style={[styles.inputLabel, { color: theme.text }]}>Prix par nuit (€) *</Text>
          <TextInput
            placeholder="Ex: 180"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            style={[styles.input, { color: theme.text, borderColor: theme.cardBorder }]}
            value={price}
            onChangeText={setPrice}
          />

          <Text style={[styles.inputLabel, { color: theme.text, marginTop: Spacing.three }]}>Localisation (Ville, Pays) *</Text>
          <TextInput
            placeholder="Ex: Annecy, France"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.cardBorder }]}
            value={location}
            onChangeText={setLocation}
          />
        </GlassCard>

        {/* Category Chips Selector */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Catégorie de propriété</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES_LIST.map((cat) => {
            const isSelected = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.categoryChip,
                  { 
                    backgroundColor: isSelected ? theme.primary : theme.cardBackground,
                    borderColor: isSelected ? theme.primary : theme.cardBorder
                  }
                ]}
              >
                <Text style={[styles.categoryChipText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Photo Picker stub */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Image de couverture (Simulé)</Text>
        <GlassCard style={styles.photoPickerCard} intensity="medium">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
            {SAMPLE_PHOTOS.map((url, i) => {
              const isSelected = selectedPhoto === url;
              return (
                <Pressable
                  key={i}
                  onPress={() => setSelectedPhoto(url)}
                  style={[
                    styles.photoWrapper,
                    isSelected && { borderColor: theme.primary, borderWidth: 2 }
                  ]}
                >
                  <View style={[styles.photoCover, { backgroundColor: '#e2e2e2' }]}>
                    {/* Simulated visual image thumb */}
                    <Ionicons name="image-outline" size={24} color="#888888" />
                  </View>
                  <Text style={[styles.photoLabel, { color: theme.text }]}>Option {i + 1}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </GlassCard>

        {/* Amenities Selection */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Équipements inclus</Text>
        <GlassCard style={styles.amenitiesCard} intensity="light">
          <View style={styles.amenitiesGrid}>
            {AMENITIES_LIST.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity);
              return (
                <Pressable
                  key={amenity}
                  onPress={() => handleToggleAmenity(amenity)}
                  style={[
                    styles.amenityBox,
                    { 
                      backgroundColor: isSelected ? theme.primaryLight : theme.backgroundElement,
                      borderColor: isSelected ? theme.primary : theme.cardBorder
                    }
                  ]}
                >
                  <Ionicons 
                    name={isSelected ? 'checkbox' : 'square-outline'} 
                    size={16} 
                    color={isSelected ? theme.primary : theme.textSecondary} 
                  />
                  <Text style={[styles.amenityText, { color: theme.text }]}>{amenity}</Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        {/* Action Button */}
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: theme.primary, opacity: pressed ? 0.95 : 1, ...Shadows.medium }
          ]}
        >
          <Text style={styles.submitBtnText}>Publier l'annonce immobilière</Text>
        </Pressable>

      </ScrollView>

      {/* Processing Loader */}
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <GlassCard style={styles.loadingBox} intensity="heavy">
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingTitle, { color: theme.text }]}>Création de l'annonce...</Text>
            <Text style={[styles.loadingSub, { color: theme.textSecondary }]}>
              Enregistrement dans le catalogue RENTA_HOME
            </Text>
          </GlassCard>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Platform.OS === 'android' ? Spacing.four : Spacing.two,
    paddingBottom: Spacing.two,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  formCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Borders.radiusSM,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: Borders.radiusSM,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top', // Android align textarea text top
  },
  categoryScroll: {
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  categoryChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Borders.radiusSM,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  photoPickerCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
  },
  photosScroll: {
    gap: Spacing.two,
  },
  photoWrapper: {
    alignItems: 'center',
    borderRadius: Borders.radiusSM,
    padding: Spacing.one,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  photoCover: {
    width: 80,
    height: 60,
    borderRadius: Borders.radiusSM - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  amenitiesCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  amenityBox: {
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
  },
  submitBtn: {
    paddingVertical: Spacing.two + 4,
    borderRadius: Borders.radiusMD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.five,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: Spacing.four,
  },
  loadingBox: {
    width: '100%',
    maxWidth: 300,
    borderRadius: Borders.radiusLG,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.three,
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: Spacing.two,
  },
  loadingSub: {
    fontSize: 12,
    textAlign: 'center',
  },
});
