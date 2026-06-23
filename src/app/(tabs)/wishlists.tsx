import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  TextInput,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { GlassCard } from '@/components/GlassCard';
import { mockDatabase, Wishlist, Listing } from '@/services/mockDatabase';
import { Spacing, Borders, Shadows } from '@/constants/theme';

export default function WishlistsScreen() {
  const theme = themeObject();
  function themeObject() { return useTheme(); }
  
  const router = useRouter();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [activeWishlist, setActiveWishlist] = useState<Wishlist | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  
  // Comments stub for collaborative wishlist
  const [comments, setComments] = useState([
    { id: '1', author: 'Sophie L.', text: 'La piscine de Villa Lumina est incroyable ! 😍', time: 'Il y a 2h' },
    { id: '2', author: 'Thomas L.', text: 'Le chalet A-Frame est super pour le jacuzzi.', time: 'Il y a 5h' },
  ]);
  const [newCommentText, setNewCommentText] = useState('');

  const loadWishlists = async () => {
    setLoading(true);
    try {
      const data = await mockDatabase.getWishlists();
      setWishlists(data);
      if (data.length > 0 && !activeWishlist) {
        setActiveWishlist(data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadListingsForWishlist = async (wishlist: Wishlist) => {
    try {
      const allListings = await mockDatabase.getListings();
      const filtered = allListings.filter(l => wishlist.listingIds.includes(l.id));
      setListings(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadWishlists();
  }, []);

  useEffect(() => {
    if (activeWishlist) {
      loadListingsForWishlist(activeWishlist);
    }
  }, [activeWishlist, wishlists]);

  const handleCreateWishlist = async () => {
    if (!newWishlistName.trim()) return;
    try {
      const newW = await mockDatabase.createWishlist(newWishlistName);
      setNewWishlistName('');
      setShowCreateModal(false);
      await loadWishlists();
      setActiveWishlist(newW);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const newC = {
      id: Date.now().toString(),
      author: 'Moi',
      text: newCommentText,
      time: 'À l\'instant',
    };
    setComments([...comments, newC]);
    setNewCommentText('');
  };

  const handleVote = (listingId: string) => {
    // Simulate updating active wishlist vote counters
    if (activeWishlist) {
      setWishlists(wishlists.map(w => {
        if (w.id === activeWishlist.id) {
          return { ...w, votesCount: w.votesCount + 1 };
        }
        return w;
      }));
      // Show mini alert in real-time feel
      Alert.alert('Vote enregistré !', 'Votre vote a bien été ajouté à cette propriété partagée.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Favoris partagés</Text>
        <Pressable 
          onPress={() => setShowCreateModal(true)}
          style={[styles.addBtn, { backgroundColor: theme.primaryLight }]}
        >
          <Ionicons name="add" size={24} color={theme.primary} />
        </Pressable>
      </View>

      {/* Wishlists Tab Selector */}
      <View style={styles.tabSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {wishlists.map((w) => {
            const isActive = activeWishlist?.id === w.id;
            return (
              <Pressable
                key={w.id}
                onPress={() => setActiveWishlist(w)}
                style={[
                  styles.tabItem,
                  { 
                    backgroundColor: isActive ? theme.primary : theme.cardBackground,
                    borderColor: isActive ? theme.primary : theme.cardBorder,
                    borderWidth: Borders.widthThin,
                    borderRadius: Borders.radiusSM,
                  }
                ]}
              >
                <Text style={[styles.tabText, { color: isActive ? '#FFFFFF' : theme.text }]}>
                  {w.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Collaborative Header Card */}
          {activeWishlist && (
            <GlassCard style={styles.collabCard} intensity="light">
              <View style={styles.collabHeader}>
                <Ionicons name="people" size={20} color={theme.primary} />
                <Text style={[styles.collabTitle, { color: theme.text }]}>Collaboration active</Text>
              </View>
              <Text style={[styles.collabSub, { color: theme.textSecondary }]}>
                Partagé avec {activeWishlist.sharedWith.length > 0 ? activeWishlist.sharedWith.join(', ') : 'aucun ami (lien invité actif)'}
              </Text>
              <View style={styles.avatarRow}>
                {activeWishlist.sharedWith.map((name, i) => (
                  <View key={i} style={[styles.avatarCircle, { backgroundColor: theme.primaryLight, left: i * -12 }]}>
                    <Text style={[styles.avatarInitial, { color: theme.primary }]}>{name[0]}</Text>
                  </View>
                ))}
                <Pressable style={[styles.inviteCircle, { left: activeWishlist.sharedWith.length * -12 }]}>
                  <Ionicons name="share-social-outline" size={16} color={theme.textSecondary} />
                </Pressable>
              </View>
            </GlassCard>
          )}

          {/* Properties List in this Wishlist */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Propriétés sauvegardées ({listings.length})
          </Text>
          
          {listings.length === 0 ? (
            <View style={styles.emptyList}>
              <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
                Aucune propriété dans cette liste. Retournez sur l'onglet Explorer pour en ajouter.
              </Text>
            </View>
          ) : (
            listings.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/listing/${item.id}`)}
                style={styles.propertyCard}
              >
                <GlassCard style={styles.innerCard} intensity="medium">
                  <Image source={{ uri: item.imageUrls[0] }} style={styles.propertyImage} />
                  <View style={styles.propertyInfo}>
                    <Text style={[styles.propertyTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{item.location}</Text>
                    
                    <View style={styles.voteRow}>
                      <Text style={[styles.priceText, { color: theme.text }]}>{item.price}€ / nuit</Text>
                      <Pressable 
                        onPress={() => handleVote(item.id)}
                        style={[styles.voteButton, { backgroundColor: theme.primaryLight }]}
                      >
                        <Ionicons name="thumbs-up" size={14} color={theme.primary} />
                        <Text style={[styles.voteButtonText, { color: theme.primary }]}>
                          Vote ({activeWishlist?.votesCount || 0})
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
            ))
          )}

          {/* Collaborative Chat/Comments Feed */}
          {activeWishlist && (
            <View style={styles.commentsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: Spacing.two }]}>
                Discussion du groupe ({comments.length})
              </Text>
              
              <GlassCard style={styles.chatCard} intensity="heavy">
                {comments.map((c) => (
                  <View key={c.id} style={styles.commentItem}>
                    <View style={styles.commentMeta}>
                      <Text style={[styles.commentAuthor, { color: theme.text }]}>{c.author}</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 10 }}>{c.time}</Text>
                    </View>
                    <Text style={[styles.commentText, { color: theme.text }]}>{c.text}</Text>
                  </View>
                ))}

                {/* Comment Input */}
                <View style={styles.commentInputRow}>
                  <TextInput
                    placeholder="Écrire un message..."
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.commentInput, { color: theme.text, borderColor: theme.cardBorder }]}
                    value={newCommentText}
                    onChangeText={setNewCommentText}
                  />
                  <Pressable 
                    onPress={handleAddComment}
                    style={[styles.sendBtn, { backgroundColor: theme.primary }]}
                  >
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              </GlassCard>
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal/Dialog Simulation for Creation */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent} intensity="heavy">
            <Text style={[styles.modalTitle, { color: theme.text }]}>Nouvelle liste de favoris</Text>
            <TextInput
              placeholder="Ex: Escapade Ski Chamonix ❄️"
              placeholderTextColor={theme.textSecondary}
              style={[styles.modalInput, { color: theme.text, borderColor: theme.cardBorder }]}
              value={newWishlistName}
              onChangeText={setNewWishlistName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable 
                onPress={() => setShowCreateModal(false)}
                style={[styles.modalBtn, { backgroundColor: theme.backgroundSelected }]}
              >
                <Text style={{ color: theme.text }}>Annuler</Text>
              </Pressable>
              <Pressable 
                onPress={handleCreateWishlist}
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Créer</Text>
              </Pressable>
            </View>
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
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: Borders.radiusSM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelector: {
    paddingVertical: Spacing.one,
  },
  tabScroll: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.one + 2,
  },
  tabItem: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
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
  collabCard: {
    marginVertical: Spacing.two,
    borderRadius: Borders.radiusMD,
  },
  collabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  collabTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  collabSub: {
    fontSize: 12,
    marginTop: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.two,
    height: 32,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  avatarInitial: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  inviteCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#B0B4BA',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
  },
  emptyList: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
  propertyCard: {
    marginBottom: Spacing.two,
  },
  innerCard: {
    padding: Spacing.one,
    borderRadius: Borders.radiusMD,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: Borders.radiusSM,
  },
  propertyInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  voteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Borders.radiusXS,
    gap: 4,
  },
  voteButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  commentsSection: {
    marginTop: Spacing.four,
  },
  chatCard: {
    borderRadius: Borders.radiusLG,
    padding: Spacing.three,
  },
  commentItem: {
    marginBottom: Spacing.two,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: Spacing.one,
  },
  commentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 13,
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: Spacing.one + 2,
    marginTop: Spacing.one,
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Borders.radiusSM,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    fontSize: 13,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: Borders.radiusXS,
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
    maxWidth: 320,
    borderRadius: Borders.radiusLG,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: Borders.radiusSM,
    padding: Spacing.two,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Borders.radiusSM,
    alignItems: 'center',
  },
});
