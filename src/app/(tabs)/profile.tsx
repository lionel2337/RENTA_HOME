import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Switch,
  SafeAreaView,
  Platform,
  TextInput,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { GlassCard } from '@/components/GlassCard';
import { Spacing, Borders, Shadows } from '@/constants/theme';
import { auth } from '@/services/firebase';
import { firestoreDb } from '@/services/firestoreDb';
import { signOut } from 'firebase/auth';
import { User, Tenancy, MaintenanceTicket, Listing } from '@/types/database';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Profile and active state
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenancy, setTenancy] = useState<Tenancy | null>(null);
  const [landlordProfile, setLandlordProfile] = useState<User | null>(null);
  const [linkedProperty, setLinkedProperty] = useState<Listing | null>(null);

  // Link property state
  const [propertyCode, setPropertyCode] = useState('');
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [linkError, setLinkError] = useState('');

  // Maintenance tickets state
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [newTicketUrgency, setNewTicketUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // General state
  const [isHostMode, setIsHostMode] = useState(false);
  const [darkMode, setDarkMode] = useState(theme.text === '#F3F4F6');

  // Load profile and related data
  const loadData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.replace('/(auth)');
      return;
    }

    try {
      setLoading(true);
      const profile = await firestoreDb.getUserProfile(currentUser.uid);
      if (!profile) {
        router.replace('/(auth)');
        return;
      }
      setUserProfile(profile);

      if (profile.role === 'tenant') {
        // Load tenancy
        const activeTenancy = await firestoreDb.getTenancyByTenant(currentUser.uid);
        setTenancy(activeTenancy);

        if (activeTenancy) {
          // Load landlord
          const landlord = await firestoreDb.getUserProfile(activeTenancy.landlordId);
          setLandlordProfile(landlord);

          // Load property details
          const property = await firestoreDb.getListingById(activeTenancy.propertyId);
          setLinkedProperty(property);
        }

        // Load tickets
        loadTenantTickets(currentUser.uid);
      } else {
        // Landlord default host mode
        setIsHostMode(true);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTenantTickets = async (uid: string) => {
    setLoadingTickets(true);
    try {
      const data = await firestoreDb.getTicketsByTenant(uid);
      setTickets(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle link landlord action
  const handleLinkLandlord = async () => {
    if (!propertyCode.trim()) {
      setLinkError('Veuillez entrer un code de propriété.');
      return;
    }

    setLinkError('');
    setLinkingLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const newTenancy = await firestoreDb.linkTenantToProperty(currentUser.uid, propertyCode.trim().toUpperCase());
      setTenancy(newTenancy);

      // Load landlord name and property
      const landlord = await firestoreDb.getUserProfile(newTenancy.landlordId);
      setLandlordProfile(landlord);

      const property = await firestoreDb.getListingById(newTenancy.propertyId);
      setLinkedProperty(property);

      // Load tickets
      loadTenantTickets(currentUser.uid);
      setPropertyCode('');
    } catch (err: any) {
      setLinkError(err.message || 'Une erreur est survenue lors de la liaison.');
    } finally {
      setLinkingLoading(false);
    }
  };

  // Handle maintenance ticket submission
  const handleSubmitTicket = async () => {
    if (!newTicketTitle.trim() || !newTicketDesc.trim()) {
      return;
    }
    if (!tenancy) return;

    setSubmittingTicket(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await firestoreDb.createMaintenanceTicket({
        propertyId: tenancy.propertyId,
        tenantId: currentUser.uid,
        landlordId: tenancy.landlordId,
        title: newTicketTitle.trim(),
        description: newTicketDesc.trim(),
        urgency: newTicketUrgency
      });

      setNewTicketTitle('');
      setNewTicketDesc('');
      setNewTicketUrgency('medium');
      setShowTicketModal(false);

      // Refresh tickets list
      loadTenantTickets(currentUser.uid);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Chargement de votre profil...</Text>
      </SafeAreaView>
    );
  }

  // Helper payment cards (mock/stub)
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
            source={{ uri: userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80' }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {userProfile?.firstName} {userProfile?.name}
            </Text>
            <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                {userProfile?.role === 'tenant' ? 'Locataire' : 'Propriétaire'} • {userProfile?.city}
              </Text>
            </View>
          </View>
        </View>

        {/* ========================================================
            LANDLORD WORKSPACE (MODE HÔTE)
           ======================================================== */}
        {userProfile?.role === 'landlord' && (
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
        )}

        {/* ========================================================
            TENANT WORKSPACE (ESPACE LOCATAIRE)
           ======================================================== */}
        {userProfile?.role === 'tenant' && (
          <View>
            {/* LIAISON PROPRIÉTAIRE */}
            {!tenancy ? (
              <GlassCard style={styles.linkingCard} intensity="medium">
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="link-outline" size={24} color={theme.primary} />
                  <Text style={[styles.linkingTitle, { color: theme.text }]}>Lier mon logement</Text>
                </View>
                
                <Text style={[styles.linkingDesc, { color: theme.textSecondary }]}>
                  Entrez le Code Propriétaire (ex: PROP-XXXXX) fourni par votre bailleur pour importer votre bail, votre loyer, et déclarer des pannes.
                </Text>

                <TextInput
                  placeholder="PROP-XXXXX"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.linkingInput, { color: theme.text, borderColor: theme.cardBorder }]}
                  value={propertyCode}
                  onChangeText={setPropertyCode}
                  autoCapitalize="characters"
                />

                {linkError ? (
                  <Text style={[styles.errorText, { color: '#E11D48' }]}>{linkError}</Text>
                ) : null}

                <Pressable 
                  onPress={handleLinkLandlord}
                  disabled={linkingLoading}
                  style={[styles.linkBtn, { backgroundColor: theme.primary, ...Shadows.light }]}
                >
                  {linkingLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                      <Text style={styles.linkBtnText}>Lier mon logement</Text>
                    </>
                  )}
                </Pressable>
              </GlassCard>
            ) : (
              /* DÉTAILS DU BAIL ACTIF */
              <GlassCard style={styles.leaseCard} intensity="high">
                <View style={styles.leaseHeader}>
                  <View>
                    <Text style={[styles.leaseTitle, { color: theme.text }]}>Mon contrat de location active</Text>
                    <Text style={[styles.leaseSubtitle, { color: theme.textSecondary }]}>
                      Matricule : {tenancy.tenantMatricule}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    { 
                      backgroundColor: tenancy.paymentStatus === 'paid' ? 'rgba(5, 150, 105, 0.15)' : 'rgba(217, 119, 6, 0.15)'
                    }
                  ]}>
                    <Text style={[
                      styles.statusBadgeText, 
                      { 
                        color: tenancy.paymentStatus === 'paid' ? '#059669' : '#D97706'
                      }
                    ]}>
                      {tenancy.paymentStatus === 'paid' ? 'Loyer Payé' : 'Paiement En attente'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.leaseGrid}>
                  <View style={styles.leaseRow}>
                    <Ionicons name="business" size={16} color={theme.textSecondary} />
                    <Text style={[styles.leaseLabel, { color: theme.textSecondary }]}>Propriété :</Text>
                    <Text style={[styles.leaseValue, { color: theme.text }]} numberOfLines={1}>
                      {linkedProperty?.title || 'Logement RentaHome'}
                    </Text>
                  </View>

                  <View style={styles.leaseRow}>
                    <Ionicons name="person" size={16} color={theme.textSecondary} />
                    <Text style={[styles.leaseLabel, { color: theme.textSecondary }]}>Bailleur :</Text>
                    <Text style={[styles.leaseValue, { color: theme.text }]}>
                      {landlordProfile ? `${landlordProfile.firstName} ${landlordProfile.name}` : 'Chargement...'}
                    </Text>
                  </View>

                  <View style={styles.leaseRow}>
                    <Ionicons name="cash" size={16} color={theme.textSecondary} />
                    <Text style={[styles.leaseLabel, { color: theme.textSecondary }]}>Loyer Mensuel :</Text>
                    <Text style={[styles.leaseValue, { color: theme.text }]}>
                      {tenancy.monthlyRent} FCFA / mois
                    </Text>
                  </View>

                  <View style={styles.leaseRow}>
                    <Ionicons name="calendar" size={16} color={theme.textSecondary} />
                    <Text style={[styles.leaseLabel, { color: theme.textSecondary }]}>Période :</Text>
                    <Text style={[styles.leaseValue, { color: theme.text }]}>
                      Du {tenancy.startDate} au {tenancy.endDate}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Pressable 
                  onPress={() => setShowTicketModal(true)}
                  style={[styles.addListingBtn, { backgroundColor: theme.primary, marginTop: 0, ...Shadows.light }]}
                >
                  <Ionicons name="warning-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.addListingText}>Signaler un incident de maintenance</Text>
                </Pressable>
              </GlassCard>
            )}

            {/* TICKETS DE MAINTENANCE */}
            {tenancy && (
              <View style={styles.ticketSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Tickets de maintenance</Text>
                
                {loadingTickets ? (
                  <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: Spacing.three }} />
                ) : tickets.length === 0 ? (
                  <GlassCard style={styles.emptyTicketsCard} intensity="light">
                    <Text style={[styles.emptyTicketsText, { color: theme.textSecondary }]}>
                      Aucun incident déclaré. Tout fonctionne à merveille ! 🌟
                    </Text>
                  </GlassCard>
                ) : (
                  tickets.map((ticket) => (
                    <GlassCard key={ticket.id} style={styles.ticketCard} intensity="light">
                      <View style={styles.ticketHeader}>
                        <Text style={[styles.ticketTitle, { color: theme.text }]}>{ticket.title}</Text>
                        
                        <View style={[
                          styles.ticketBadge,
                          {
                            backgroundColor: ticket.status === 'done' ? 'rgba(5, 150, 105, 0.15)' :
                                             ticket.status === 'in_progress' ? 'rgba(37, 99, 235, 0.15)' :
                                             'rgba(225, 29, 72, 0.15)'
                          }
                        ]}>
                          <Text style={[
                            styles.ticketBadgeText,
                            {
                              color: ticket.status === 'done' ? '#059669' :
                                     ticket.status === 'in_progress' ? '#2563EB' :
                                     '#E11D48'
                            }
                          ]}>
                            {ticket.status === 'done' ? 'Résolu' :
                             ticket.status === 'in_progress' ? 'En cours' :
                             'À faire'}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.ticketDesc, { color: theme.textSecondary }]}>
                        {ticket.description}
                      </Text>

                      <View style={styles.ticketFooter}>
                        <Text style={[styles.ticketMeta, { color: theme.textSecondary }]}>
                          Urgence : {ticket.urgency === 'high' ? '🔴 Haute' : ticket.urgency === 'medium' ? '🟡 Moyenne' : '🟢 Basse'}
                        </Text>
                        <Text style={[styles.ticketMeta, { color: theme.textSecondary }]}>
                          Signalé le : {ticket.createdAt}
                        </Text>
                      </View>
                    </GlassCard>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {/* Wallet stub (only show for verified roles) */}
        {userProfile?.role === 'tenant' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Portefeuille & Paiement</Text>
            <GlassCard style={styles.walletCard} intensity="medium">
              <View style={styles.walletHeader}>
                <Ionicons name="card" size={20} color={theme.primary} />
                <Text style={[styles.walletTitle, { color: theme.text }]}>Cartes de crédit enregistrées</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
                {savedCards.map((card) => (
                  <View key={card.id} style={[styles.creditCard, { backgroundColor: card.color, ...Shadows.medium }]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardBank}>{card.bank}</Text>
                      <Ionicons name={card.type === 'visa' ? 'logo-usd' : 'logo-bitcoin'} size={22} color="#FFFFFF" />
                    </View>
                    <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardHolder}>
                        {userProfile?.firstName} {userProfile?.name}
                      </Text>
                      <Text style={styles.cardExp}>{card.exp}</Text>
                    </View>
                  </View>
                ))}
                
                <Pressable style={[styles.addCardBox, { borderColor: theme.cardBorder }]}>
                  <Ionicons name="add" size={28} color={theme.textSecondary} />
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4, fontWeight: '700' }}>
                    Ajouter
                  </Text>
                </Pressable>
              </ScrollView>

              <View style={styles.divider} />
              <View style={styles.paymentMethodRow}>
                <Ionicons name="logo-apple" size={20} color={theme.text} />
                <Text style={[styles.paymentMethodLabel, { color: theme.text }]}>Apple Pay actif</Text>
                <View style={styles.activeCheck}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.success} />
                </View>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Preferences */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Préférences de l'application</Text>
        <GlassCard style={styles.settingsCard} intensity="light">
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

          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="globe-outline" size={18} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Langue</Text>
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Français (FR) ›</Text>
          </Pressable>

          <View style={styles.innerDivider} />

          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="cash-outline" size={18} color={theme.textSecondary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Devise</Text>
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>FCFA ›</Text>
          </Pressable>
        </GlassCard>

        {/* Log out */}
        <Pressable onPress={handleLogout} style={[styles.logoutBtn, { borderColor: theme.error }]}>
          <Text style={[styles.logoutText, { color: theme.error }]}>Se déconnecter de RENTA_HOME</Text>
        </Pressable>

      </ScrollView>

      {/* ========================================================
          MODAL D'INCIDENT DE MAINTENANCE
         ======================================================== */}
      <Modal
        visible={showTicketModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTicketModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent} intensity="high">
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Déclarer un incident ⚠️</Text>
              <Pressable onPress={() => setShowTicketModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Titre de l'incident</Text>
            <TextInput
              placeholder="Ex: Fuite d'eau, Clim en panne..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.modalInput, { color: theme.text, borderColor: theme.cardBorder }]}
              value={newTicketTitle}
              onChangeText={setNewTicketTitle}
            />

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Description du problème</Text>
            <TextInput
              placeholder="Décrivez précisément l'incident..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.modalInput, styles.modalInputDesc, { color: theme.text, borderColor: theme.cardBorder }]}
              multiline={true}
              numberOfLines={4}
              value={newTicketDesc}
              onChangeText={setNewTicketDesc}
            />

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Niveau d'urgence</Text>
            <View style={styles.urgencyRow}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <Pressable
                  key={level}
                  onPress={() => setNewTicketUrgency(level)}
                  style={[
                    styles.urgencyOption,
                    {
                      borderColor: theme.cardBorder,
                      backgroundColor: newTicketUrgency === level ? 
                                       (level === 'high' ? 'rgba(225, 29, 72, 0.15)' : 
                                        level === 'medium' ? 'rgba(217, 119, 6, 0.15)' : 
                                        'rgba(5, 150, 105, 0.15)') : 
                                       'transparent'
                    }
                  ]}
                >
                  <Text style={[
                    styles.urgencyText,
                    {
                      color: newTicketUrgency === level ? 
                             (level === 'high' ? '#E11D48' : 
                              level === 'medium' ? '#D97706' : 
                              '#059669') : 
                             theme.textSecondary,
                      fontWeight: newTicketUrgency === level ? 'bold' : '600'
                    }
                  ]}>
                    {level === 'high' ? '🔴 Haute' : level === 'medium' ? '🟡 Moyenne' : '🟢 Basse'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable 
              onPress={handleSubmitTicket}
              disabled={submittingTicket || !newTicketTitle.trim() || !newTicketDesc.trim()}
              style={[
                styles.submitTicketBtn, 
                { 
                  backgroundColor: theme.primary,
                  opacity: (!newTicketTitle.trim() || !newTicketDesc.trim()) ? 0.6 : 1,
                  ...Shadows.light 
                }
              ]}
            >
              {submittingTicket ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitTicketText}>Soumettre l'incident</Text>
              )}
            </Pressable>
          </GlassCard>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
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

  // NEW STYLES FOR ESPACE LOCATAIRE
  linkingCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  linkingTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  linkingDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.three,
  },
  linkingInput: {
    borderWidth: 1.5,
    borderRadius: Borders.radiusSM,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two + 2,
    borderRadius: Borders.radiusSM,
    gap: Spacing.two,
  },
  linkBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.two,
  },

  leaseCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  leaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaseTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  leaseSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Borders.radiusXS,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  leaseGrid: {
    gap: Spacing.two,
  },
  leaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  leaseLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 95,
  },
  leaseValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },

  ticketSection: {
    marginBottom: Spacing.three,
  },
  emptyTicketsCard: {
    borderRadius: Borders.radiusMD,
    padding: Spacing.three,
    alignItems: 'center',
  },
  emptyTicketsText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  ticketCard: {
    borderRadius: Borders.radiusMD,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.one,
  },
  ticketTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    marginRight: Spacing.two,
  },
  ticketBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Borders.radiusXS,
  },
  ticketBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  ticketDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketMeta: {
    fontSize: 10,
    fontWeight: '600',
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.one,
    marginTop: Spacing.two,
  },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: Borders.radiusSM,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two + 2,
    fontSize: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  modalInputDesc: {
    height: 80,
    textAlignVertical: 'top',
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
    marginBottom: Spacing.four,
  },
  urgencyOption: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Borders.radiusSM,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: 11,
  },
  submitTicketBtn: {
    paddingVertical: Spacing.three,
    borderRadius: Borders.radiusSM,
    alignItems: 'center',
  },
  submitTicketText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
