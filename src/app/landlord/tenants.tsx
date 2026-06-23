import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { GlassCard } from '@/components/GlassCard';
import { mockDatabase, Tenant, MaintenanceTicket } from '@/services/mockDatabase';
import { Spacing, Borders, Shadows } from '@/constants/theme';

export default function TenantsDashboardScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected Tenant details modal
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  // PDF generator states
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generatedPdfPath, setGeneratedPdfPath] = useState<string | null>(null);

  // Digital Inventory items state (simulated)
  const [inventoryItems, setInventoryItems] = useState([
    { id: '1', label: 'Compteur d\'eau relevé', done: true },
    { id: '2', label: 'Cuisine & Four nettoyés', done: true },
    { id: '3', label: 'Clés d\'accès remises', done: false },
    { id: '4', label: 'Détecteur fumée testé', done: false },
  ]);
  const [isSigned, setIsSigned] = useState(false);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await mockDatabase.getTenants();
      setTenants(data);
      // Sync selected tenant details if open
      if (selectedTenant) {
        const updated = data.find(t => t.id === selectedTenant.id);
        if (updated) setSelectedTenant(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleUpdatePaymentStatus = async (tenantId: string, status: 'paid' | 'late' | 'pending') => {
    try {
      await mockDatabase.updatePaymentStatus(tenantId, status);
      await loadTenants();
      Alert.alert('Statut mis à jour', 'Le statut de paiement du locataire a bien été modifié.');
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleTicketStatus = async (tenantId: string, ticketId: string, currentStatus: 'todo' | 'in_progress' | 'done') => {
    let nextStatus: 'todo' | 'in_progress' | 'done' = 'todo';
    if (currentStatus === 'todo') nextStatus = 'in_progress';
    else if (currentStatus === 'in_progress') nextStatus = 'done';
    
    try {
      await mockDatabase.updateTicketStatus(tenantId, ticketId, nextStatus);
      await loadTenants();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendReminder = (tenant: Tenant) => {
    Alert.alert(
      'Envoyer une relance',
      `Souhaitez-vous relancer ${tenant.name} pour son retard de loyer (${tenant.monthlyRent}€) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Relancer par SMS', 
          onPress: () => {
            Alert.alert('SMS envoyé 💬', `Message de relance envoyé avec succès au ${tenant.phone}`);
          } 
        }
      ]
    );
  };

  // PDF Receipt Generation
  const handleGenerateReceipt = (tenant: Tenant) => {
    setIsGeneratingPdf(true);
    setGeneratedPdfPath(null);

    setTimeout(() => {
      setIsGeneratingPdf(false);
      setGeneratedPdfPath(`quittance_${tenant.name.toLowerCase().replace(' ', '_')}_juin26.pdf`);
    }, 1200);
  };

  const handleToggleInventory = (id: string) => {
    setInventoryItems(inventoryItems.map(item => {
      if (item.id === id) return { ...item, done: !item.done };
      return item;
    }));
  };

  // Stats calculations
  const totalRent = tenants.reduce((acc, curr) => acc + curr.monthlyRent, 0);
  const lateRent = tenants.filter(t => t.paymentStatus === 'late').reduce((acc, curr) => acc + curr.monthlyRent, 0);
  const paidTenantsCount = tenants.filter(t => t.paymentStatus === 'paid').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Gestion locative</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Yield Dashboard Box */}
          <GlassCard style={styles.dashboardCard} intensity="heavy">
            <Text style={[styles.dashTitle, { color: theme.text }]}>Rendement Mensuel (Juin)</Text>
            <View style={styles.dashStats}>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.text }]}>{totalRent - lateRent}€</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Loyer perçu</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.error }]}>{lateRent}€</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>En retard</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.text }]}>{paidTenantsCount}/{tenants.length}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Payé</Text>
              </View>
            </View>
          </GlassCard>

          {/* Tenants Section */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Mes Locataires ({tenants.length})</Text>
          {tenants.map((tenant) => {
            const isLate = tenant.paymentStatus === 'late';
            const isPaid = tenant.paymentStatus === 'paid';
            
            return (
              <GlassCard key={tenant.id} style={styles.tenantCard} intensity="medium">
                <Pressable onPress={() => { setSelectedTenant(tenant); setGeneratedPdfPath(null); }}>
                  <View style={styles.tenantHeader}>
                    <View>
                      <Text style={[styles.tenantName, { color: theme.text }]}>{tenant.name}</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{tenant.propertyName}</Text>
                    </View>

                    {/* Status Badge */}
                    <View 
                      style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: isPaid 
                            ? theme.success + '20' 
                            : isLate 
                              ? theme.error + '20' 
                              : theme.warning + '20'
                        }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.statusText, 
                          { 
                            color: isPaid 
                              ? theme.success 
                              : isLate 
                                ? theme.error 
                                : theme.warning
                          }
                        ]}
                      >
                        {isPaid ? 'Loyer payé' : isLate ? 'En retard' : 'En attente'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.tenantFooter}>
                    <Text style={[styles.rentText, { color: theme.text }]}>{tenant.monthlyRent}€ / mois</Text>
                    <View style={styles.actionsRow}>
                      {isLate && (
                        <Pressable 
                          onPress={() => handleSendReminder(tenant)}
                          style={[styles.smallBtn, { backgroundColor: theme.error + '15' }]}
                        >
                          <Ionicons name="notifications-outline" size={14} color={theme.error} />
                          <Text style={{ color: theme.error, fontSize: 11, fontWeight: 'bold' }}> Relancer</Text>
                        </Pressable>
                      )}
                      <Text style={[styles.detailsLink, { color: theme.primary }]}>Détails ›</Text>
                    </View>
                  </View>
                </Pressable>
              </GlassCard>
            );
          })}

          {/* Maintenance Section */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tickets de Maintenance Actifs</Text>
          <GlassCard style={styles.maintenanceCard} intensity="light">
            {tenants.flatMap(t => t.maintenanceTickets.map(tk => ({ ticket: tk, tenant: t }))).map(({ ticket, tenant }) => {
              const isTodo = ticket.status === 'todo';
              const isProgress = ticket.status === 'in_progress';
              
              return (
                <View key={ticket.id} style={styles.ticketItem}>
                  <View style={styles.ticketHeader}>
                    <Text style={[styles.ticketTitle, { color: theme.text }]}>{ticket.title}</Text>
                    <View 
                      style={[
                        styles.urgencyBadge, 
                        { 
                          backgroundColor: ticket.urgency === 'high' 
                            ? theme.error + '15' 
                            : ticket.urgency === 'medium'
                              ? theme.warning + '15'
                              : theme.primary + '15'
                        }
                      ]}
                    >
                      <Text 
                        style={{ 
                          fontSize: 9, 
                          fontWeight: 'bold', 
                          color: ticket.urgency === 'high' 
                            ? theme.error 
                            : ticket.urgency === 'medium'
                              ? theme.warning
                              : theme.primary 
                        }}
                      >
                        {ticket.urgency.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                    Locataire : {tenant.name} • {tenant.propertyName}
                  </Text>
                  
                  <Text style={[styles.ticketDesc, { color: theme.text }]}>{ticket.description}</Text>

                  {/* Toggle Status Button */}
                  <Pressable 
                    onPress={() => handleToggleTicketStatus(tenant.id, ticket.id, ticket.status)}
                    style={[
                      styles.statusToggleBtn, 
                      { 
                        backgroundColor: isTodo 
                          ? theme.backgroundSelected 
                          : isProgress
                            ? theme.primaryLight
                            : theme.success + '15'
                      }
                    ]}
                  >
                    <Ionicons 
                      name={isTodo ? 'ellipse-outline' : isProgress ? 'sync-outline' : 'checkmark-circle'} 
                      size={14} 
                      color={isTodo ? theme.textSecondary : isProgress ? theme.primary : theme.success} 
                    />
                    <Text 
                      style={{ 
                        fontSize: 12, 
                        fontWeight: 'bold',
                        color: isTodo ? theme.textSecondary : isProgress ? theme.primary : theme.success
                      }}
                    >
                      {isTodo ? ' À faire' : isProgress ? ' En cours' : ' Terminé'}
                    </Text>
                  </Pressable>
                  <View style={styles.ticketDivider} />
                </View>
              );
            })}
          </GlassCard>

        </ScrollView>
      )}

      {/* Selected Tenant Details Panel */}
      {selectedTenant && (
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent} intensity="heavy">
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTenantName, { color: theme.text }]}>{selectedTenant.name}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{selectedTenant.propertyName}</Text>
              </View>
              <Pressable onPress={() => setSelectedTenant(null)}>
                <Ionicons name="close-circle-outline" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.three }}>
              
              {/* Payment Quick Actions */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Actions du loyer</Text>
                
                <View style={styles.paymentActionsRow}>
                  <Pressable 
                    onPress={() => handleUpdatePaymentStatus(selectedTenant.id, 'paid')}
                    style={[styles.actionBadge, { backgroundColor: theme.success + '15' }]}
                  >
                    <Text style={{ color: theme.success, fontWeight: 'bold', fontSize: 12 }}>Marquer Payé</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => handleUpdatePaymentStatus(selectedTenant.id, 'late')}
                    style={[styles.actionBadge, { backgroundColor: theme.error + '15' }]}
                  >
                    <Text style={{ color: theme.error, fontWeight: 'bold', fontSize: 12 }}>Marquer Retard</Text>
                  </Pressable>
                </View>

                {/* PDF Quittance Generator Component */}
                <View style={styles.pdfGeneratorWrapper}>
                  <Pressable
                    onPress={() => handleGenerateReceipt(selectedTenant)}
                    style={[styles.pdfBtn, { backgroundColor: theme.primary }]}
                  >
                    {isGeneratingPdf ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="document-text" size={16} color="#FFFFFF" />
                        <Text style={styles.pdfBtnText}> Générer Quittance Loyer (PDF)</Text>
                      </>
                    )}
                  </Pressable>

                  {generatedPdfPath && (
                    <View style={[styles.pdfSuccessBox, { backgroundColor: theme.success + '10', borderColor: theme.success }]}>
                      <Ionicons name="checkmark-circle" size={18} color={theme.success} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.text, fontSize: 12, fontWeight: 'bold' }}>{generatedPdfPath}</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Fichier généré avec succès</Text>
                      </View>
                      <Pressable 
                        onPress={() => Alert.alert('Partage PDF', 'Lien de téléchargement copié dans le presse-papier !')}
                        style={styles.pdfDlBtn}
                      >
                        <Ionicons name="share-outline" size={16} color={theme.primary} />
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>

              {/* Digital Check-in Inventory Checklist */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>État des lieux & Remise des clés</Text>
                
                <View style={styles.inventoryList}>
                  {inventoryItems.map(item => (
                    <Pressable 
                      key={item.id} 
                      onPress={() => handleToggleInventory(item.id)}
                      style={styles.inventoryItem}
                    >
                      <Ionicons 
                        name={item.done ? 'checkbox' : 'square-outline'} 
                        size={18} 
                        color={item.done ? theme.primary : theme.textSecondary} 
                      />
                      <Text style={[styles.inventoryText, { color: theme.text, textDecorationLine: item.done ? 'line-through' : 'none' }]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Digital Signature section */}
                <View style={[styles.signatureBox, { borderColor: theme.cardBorder, backgroundColor: theme.backgroundElement }]}>
                  {isSigned ? (
                    <View style={styles.signedContent}>
                      <Text style={[styles.signedText, { color: theme.success }]}>✓ Signature enregistrée</Text>
                      <Text style={{ fontSize: 10, color: theme.textSecondary }}>Lucas Dubois - {new Date().toLocaleDateString()}</Text>
                    </View>
                  ) : (
                    <Pressable onPress={() => setIsSigned(true)} style={styles.signTrigger}>
                      <Ionicons name="pencil-sharp" size={18} color={theme.textSecondary} />
                      <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>
                        Signer numériquement pour valider
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>

            </ScrollView>
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
  dashboardCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  dashTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  dashStats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  tenantCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tenantName: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Borders.radiusXS,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: Spacing.two,
  },
  tenantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rentText: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Borders.radiusXS,
  },
  detailsLink: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  maintenanceCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
  },
  ticketItem: {
    marginBottom: Spacing.three,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  urgencyBadge: {
    paddingHorizontal: Spacing.one + 2,
    paddingVertical: 2,
    borderRadius: Borders.radiusXS,
  },
  ticketDesc: {
    fontSize: 12,
    marginTop: Spacing.one,
    lineHeight: 16,
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Borders.radiusXS,
    marginTop: Spacing.two,
    gap: 4,
  },
  ticketDivider: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginTop: Spacing.three,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
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
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: Borders.radiusLG,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    paddingBottom: Spacing.two,
  },
  modalTenantName: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSection: {
    marginTop: Spacing.one,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  paymentActionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Borders.radiusSM,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  pdfGeneratorWrapper: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Borders.radiusSM,
  },
  pdfBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pdfSuccessBox: {
    borderWidth: 1,
    borderRadius: Borders.radiusSM,
    padding: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pdfDlBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  inventoryList: {
    gap: Spacing.one + 2,
    marginBottom: Spacing.two,
  },
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 2,
  },
  inventoryText: {
    fontSize: 13,
  },
  signatureBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Borders.radiusSM,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  signTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  signedContent: {
    alignItems: 'center',
  },
  signedText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
