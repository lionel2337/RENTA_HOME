import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Switch,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { GlassCard } from '@/components/GlassCard';
import { mockDatabase, Listing } from '@/services/mockDatabase';
import { Spacing, Borders, Shadows } from '@/constants/theme';

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout flow state
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<'apple' | 'card'>('apple');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (typeof id === 'string') {
        setLoading(true);
        const data = await mockDatabase.getListingById(id);
        setListing(data);
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

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

  // Cost calculations
  const nightsCount = 5;
  const basePrice = listing.price * nightsCount;
  const cleaningFee = 65;
  const serviceFee = Math.round(basePrice * 0.08);
  const totalCost = basePrice + cleaningFee + serviceFee;
  const perPersonCost = Math.round(totalCost / splitCount);

  const handlePay = async () => {
    setIsProcessing(true);

    try {
      // Create new booking in mock db
      await mockDatabase.createBooking({
        listingId: listing.id,
        listingTitle: listing.title,
        listingImage: listing.imageUrls[0],
        listingLocation: listing.location,
        startDate: '2026-07-15',
        endDate: '2026-07-20',
        totalPrice: totalCost,
        status: 'upcoming',
        digitalKey: `🔑 ${listing.id.toUpperCase()}-JULY26`,
        splitPayment: isSplitPayment ? {
          totalPeople: splitCount,
          amountPerPerson: perPersonCost,
          paidCount: 1, // Only the booker has paid initially
        } : undefined
      });

      setIsProcessing(false);

      // Custom Success Alert
      Alert.alert(
        'Réservation Confirmée ! 🎉',
        isSplitPayment 
          ? `Votre acompte de ${perPersonCost}€ a été prélevé. Un lien de paiement a été envoyé à vos ${splitCount - 1} amis.`
          : `Votre paiement de ${totalCost}€ a bien été traité. Bon voyage !`,
        [
          {
            text: 'Voir mes réservations',
            onPress: () => {
              // Redirect back to Bookings tab (tabs navigation)
              router.dismissAll();
              router.push('/bookings');
            }
          }
        ]
      );

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      Alert.alert('Erreur', 'Impossible de valider votre paiement. Veuillez réessayer.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Confirmation & Paiement</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Listing preview header */}
        <GlassCard style={styles.previewCard} intensity="light">
          <View style={styles.previewRow}>
            <Ionicons name="home-outline" size={24} color={theme.primary} />
            <View style={styles.previewInfo}>
              <Text style={[styles.previewTitle, { color: theme.text }]} numberOfLines={1}>{listing.title}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{listing.location}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Date / Travelers summary */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Détails du séjour</Text>
        <GlassCard style={styles.summaryCard} intensity="light">
          <View style={styles.summaryRow}>
            <Ionicons name="calendar" size={18} color={theme.primary} />
            <View>
              <Text style={[styles.summaryLabel, { color: theme.text }]}>Dates</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>15 - 20 Juillet 2026 ({nightsCount} nuits)</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Ionicons name="people" size={18} color={theme.primary} />
            <View>
              <Text style={[styles.summaryLabel, { color: theme.text }]}>Voyageurs</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{isSplitPayment ? `${splitCount} voyageurs` : '1 voyageur'}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Split Payment Toggle */}
        <GlassCard style={styles.splitCard} intensity="medium">
          <View style={styles.splitToggleRow}>
            <View style={styles.splitTextCol}>
              <Text style={[styles.splitTitle, { color: theme.text }]}>Partager la note 👥</Text>
              <Text style={[styles.splitSub, { color: theme.textSecondary }]}>
                Diviser le montant équitablement avec vos amis
              </Text>
            </View>
            <Switch
              value={isSplitPayment}
              onValueChange={setIsSplitPayment}
              trackColor={{ false: theme.cardBorder, true: theme.primary }}
            />
          </View>

          {isSplitPayment && (
            <View style={styles.splitSettings}>
              <View style={styles.divider} />
              
              <Text style={[styles.splitCountLabel, { color: theme.text }]}>
                Nombre de personnes : <Text style={{ color: theme.primary, fontWeight: '800' }}>{splitCount}</Text>
              </Text>

              {/* Custom Selector/Slider buttons */}
              <View style={styles.sliderRow}>
                <Pressable
                  onPress={() => setSplitCount(Math.max(2, splitCount - 1))}
                  style={[styles.countBtn, { backgroundColor: theme.backgroundSelected }]}
                >
                  <Ionicons name="remove" size={18} color={theme.text} />
                </Pressable>
                <Text style={[styles.sliderCountText, { color: theme.text }]}>{splitCount}</Text>
                <Pressable
                  onPress={() => setSplitCount(Math.min(6, splitCount + 1))}
                  style={[styles.countBtn, { backgroundColor: theme.backgroundSelected }]}
                >
                  <Ionicons name="add" size={18} color={theme.text} />
                </Pressable>
              </View>

              <View style={[styles.splitSplitBox, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.splitSplitLabel, { color: theme.primary }]}>Chacun paie :</Text>
                <Text style={[styles.splitSplitValue, { color: theme.primary }]}>{perPersonCost}€</Text>
              </View>
            </View>
          )}
        </GlassCard>

        {/* Price Breakdown */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Détail des coûts</Text>
        <GlassCard style={styles.priceCard} intensity="light">
          <View style={styles.priceRow}>
            <Text style={{ color: theme.textSecondary }}>{listing.price}€ x {nightsCount} nuits</Text>
            <Text style={{ color: theme.text }}>{basePrice}€</Text>
          </View>
          <View style={[styles.priceRow, { marginTop: Spacing.one }]}>
            <Text style={{ color: theme.textSecondary }}>Frais de ménage RENTA_HOME</Text>
            <Text style={{ color: theme.text }}>{cleaningFee}€</Text>
          </View>
          <View style={[styles.priceRow, { marginTop: Spacing.one }]}>
            <Text style={{ color: theme.textSecondary }}>Frais de service plateforme</Text>
            <Text style={{ color: theme.text }}>{serviceFee}€</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>
              {isSplitPayment ? 'Total de la réservation' : 'Total (EUR)'}
            </Text>
            <Text style={[styles.totalVal, { color: theme.text }]}>{totalCost}€</Text>
          </View>
        </GlassCard>

        {/* Payment selector */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Moyen de paiement</Text>
        <GlassCard style={styles.paymentCard} intensity="light">
          {/* Apple Pay Option */}
          <Pressable 
            onPress={() => setPaymentMethod('apple')}
            style={[
              styles.paymentOption, 
              paymentMethod === 'apple' && { borderColor: theme.primary, borderWidth: 1.5 }
            ]}
          >
            <Ionicons name="logo-apple" size={20} color={theme.text} />
            <Text style={[styles.paymentLabel, { color: theme.text }]}>Apple Pay</Text>
            <View style={[styles.radioDot, { borderColor: theme.primary }]}>
              {paymentMethod === 'apple' && <View style={[styles.radioDotInner, { backgroundColor: theme.primary }]} />}
            </View>
          </Pressable>

          {/* Visa Card Option */}
          <Pressable 
            onPress={() => setPaymentMethod('card')}
            style={[
              styles.paymentOption, 
              { marginTop: Spacing.two },
              paymentMethod === 'card' && { borderColor: theme.primary, borderWidth: 1.5 }
            ]}
          >
            <Ionicons name="card" size={20} color={theme.text} />
            <Text style={[styles.paymentLabel, { color: theme.text }]}>Carte Visa (•••• 4242)</Text>
            <View style={[styles.radioDot, { borderColor: theme.primary }]}>
              {paymentMethod === 'card' && <View style={[styles.radioDotInner, { backgroundColor: theme.primary }]} />}
            </View>
          </Pressable>
        </GlassCard>

        {/* Action Button */}
        <Pressable 
          onPress={handlePay}
          style={({ pressed }) => [
            styles.payBtn, 
            { backgroundColor: theme.primary, opacity: pressed ? 0.95 : 1, ...Shadows.medium }
          ]}
        >
          <Text style={styles.payBtnText}>
            {isSplitPayment 
              ? `Confirmer & Payer l'acompte (${perPersonCost}€)` 
              : `Confirmer & Payer (${totalCost}€)`}
          </Text>
        </Pressable>

      </ScrollView>

      {/* Processing Payment Modal Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <GlassCard style={styles.processingBox} intensity="heavy">
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.processingTitle, { color: theme.text }]}>Sécurisation de la transaction</Text>
            <Text style={[styles.processingSub, { color: theme.textSecondary }]}>
              Communication avec la passerelle bancaire RENTA_HOME...
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
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  previewCard: {
    borderRadius: Borders.radiusMD,
    padding: Spacing.two,
    marginBottom: Spacing.three,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  summaryCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: Spacing.two,
  },
  splitCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
    marginTop: Spacing.three,
  },
  splitToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitTextCol: {
    flex: 1,
    marginRight: Spacing.two,
  },
  splitTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  splitSub: {
    fontSize: 11,
    marginTop: 2,
  },
  splitSettings: {
    marginTop: Spacing.two,
  },
  splitCountLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.two,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginVertical: Spacing.one,
  },
  countBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderCountText: {
    fontSize: 18,
    fontWeight: '800',
  },
  splitSplitBox: {
    padding: Spacing.two,
    borderRadius: Borders.radiusSM,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  splitSplitLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  splitSplitValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  priceCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  paymentCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: Borders.radiusSM,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  paymentLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: Spacing.two,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  payBtn: {
    paddingVertical: Spacing.two + 4,
    borderRadius: Borders.radiusMD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.five,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  processingOverlay: {
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
  processingBox: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Borders.radiusLG,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.three,
  },
  processingTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: Spacing.two,
  },
  processingSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
