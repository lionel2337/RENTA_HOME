import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Switch,
  SafeAreaView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { GlassCard } from '@/components/GlassCard';
import { Spacing, Borders, Shadows } from '@/constants/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Host Mode states
  const [isHostMode, setIsHostMode] = useState(false);
  const [darkMode, setDarkMode] = useState(theme.text === '#F3F4F6');

  // Payment cards stub
  const savedCards = [
    { id: 'c1', type: 'visa', last4: '4242', exp: '12/28', bank: 'Société Générale', color: '#1E1B4B' },
    { id: 'c2', type: 'mastercard', last4: '8899', exp: '06/29', bank: 'Revolut Metal', color: '#090714' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* User Card */}
        <View style={styles.userSection}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80' }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>Lucas Dubois</Text>
            <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>Super Voyageur • 2026</Text>
            </View>
          </View>
        </View>

        {/* Mode Switch Card */}
        <GlassCard style={styles.toggleCard} intensity="light">
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleTitle, { color: theme.text }]}>Mode Hôte</Text>
              <Text style={[styles.toggleSub, { color: theme.textSecondary }]}>
                Gérer mes logements et mes revenus
              </Text>
            </View>
            <Switch 
              value={isHostMode} 
              onValueChange={setIsHostMode}
              trackColor={{ false: theme.cardBorder, true: theme.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>

          {/* Conditional Host Dashboard */}
          {isHostMode && (
            <View style={styles.hostDashboard}>
              <View style={styles.divider} />
              
              <Text style={[styles.dashTitle, { color: theme.text }]}>Tableau de bord Hôte</Text>
              
              <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: theme.backgroundSelected }]}>
                  <Text style={[styles.statValue, { color: theme.text }]}>1 420€</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Revenus juin</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.backgroundSelected }]}>
                  <Text style={[styles.statValue, { color: theme.text }]}>2</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Logements actifs</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.backgroundSelected }]}>
                  <Text style={[styles.statValue, { color: theme.text }]}>99%</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Réponses</Text>
                </View>
              </View>

              <Pressable 
                onPress={() => router.push('/landlord/add-property')}
                style={[styles.addListingBtn, { backgroundColor: theme.primary, ...Shadows.light }]}
              >
                <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                <Text style={styles.addListingText}>Ajouter un nouveau logement</Text>
              </Pressable>

              <Pressable 
                onPress={() => router.push('/landlord/tenants')}
                style={[styles.addListingBtn, { backgroundColor: theme.backgroundSelected, marginTop: Spacing.two }]}
              >
                <Ionicons name="people-circle" size={18} color={theme.primary} />
                <Text style={[styles.addListingText, { color: theme.text }]}>Gérer mes locataires & loyers</Text>
              </Pressable>
            </View>
          )}
        </GlassCard>

        {/* Payments Card Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Portefeuille & Paiement</Text>
        
        <GlassCard style={styles.walletCard} intensity="medium">
          <View style={styles.walletHeader}>
            <Ionicons name="card" size={20} color={theme.primary} />
            <Text style={[styles.walletTitle, { color: theme.text }]}>Cartes de crédit enregistrées</Text>
          </View>

          {/* Cards display */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
            {savedCards.map((card) => (
              <View key={card.id} style={[styles.creditCard, { backgroundColor: card.color, ...Shadows.medium }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardBank}>{card.bank}</Text>
                  <Ionicons 
                    name={card.type === 'visa' ? 'logo-usd' : 'logo-bitcoin'} 
                    size={22} 
                    color="#FFFFFF" 
                  />
                </View>
                <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardHolder}>Lucas Dubois</Text>
                  <Text style={styles.cardExp}>{card.exp}</Text>
                </View>
              </View>
            ))}
            
            {/* Add Card item */}
            <Pressable style={[styles.addCardBox, { borderColor: theme.cardBorder }]}>
              <Ionicons name="add" size={28} color={theme.textSecondary} />
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4, fontWeight: '700' }}>
                Ajouter
              </Text>
            </Pressable>
          </ScrollView>

          {/* Modern payment integrations list */}
          <View style={styles.divider} />
          <View style={styles.paymentMethodRow}>
            <Ionicons name="logo-apple" size={20} color={theme.text} />
            <Text style={[styles.paymentMethodLabel, { color: theme.text }]}>Apple Pay actif</Text>
            <View style={styles.activeCheck}><Ionicons name="checkmark-circle" size={18} color={theme.success} /></View>
          </View>
        </GlassCard>

        {/* Preference Settings List */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Préférences de l'application</Text>

        <GlassCard style={styles.settingsCard} intensity="light">
          {/* Dark Mode Preference */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={18} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Mode Sombre (Simulé)</Text>
            </View>
            <Switch 
              value={darkMode} 
              onValueChange={setDarkMode}
              trackColor={{ false: theme.cardBorder, true: theme.primary }}
            />
          </View>

          <View style={styles.innerDivider} />

          {/* Language Preference */}
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="globe-outline" size={18} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Langue</Text>
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Français (FR) ›</Text>
          </Pressable>

          <View style={styles.innerDivider} />

          {/* Currency Preference */}
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="cash-outline" size={18} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Devise</Text>
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Euro (€) ›</Text>
          </Pressable>
        </GlassCard>

        {/* Log out */}
        <Pressable style={[styles.logoutBtn, { borderColor: theme.error }]}>
          <Text style={[styles.logoutText, { color: theme.error }]}>Se déconnecter de RENTA_HOME</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Platform.OS === 'android' ? Spacing.four : Spacing.two,
    paddingBottom: Spacing.six,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  userInfo: {
    justifyContent: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Borders.radiusXS,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  toggleCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  toggleSub: {
    fontSize: 12,
    marginTop: 2,
  },
  hostDashboard: {
    marginTop: Spacing.two,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: Spacing.two,
  },
  dashTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBox: {
    flex: 1,
    padding: Spacing.two,
    borderRadius: Borders.radiusSM,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  addListingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Borders.radiusSM,
    marginTop: Spacing.three,
    gap: Spacing.one,
  },
  addListingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  walletCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  walletTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardsScroll: {
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  creditCard: {
    width: 190,
    height: 110,
    borderRadius: Borders.radiusSM,
    padding: Spacing.two + 2,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBank: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHolder: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardExp: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addCardBox: {
    width: 90,
    height: 110,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Borders.radiusSM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  paymentMethodLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: Spacing.two,
  },
  activeCheck: {
    marginLeft: 'auto',
  },
  settingsCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one + 2,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  innerDivider: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginVertical: 2,
  },
  logoutBtn: {
    borderWidth: 1.5,
    borderRadius: Borders.radiusMD,
    paddingVertical: Spacing.two + 2,
    alignItems: 'center',
    marginTop: Spacing.five,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
