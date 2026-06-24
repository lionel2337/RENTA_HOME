import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { firestoreDb } from '../../services/firestoreDb';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Toggle state
  const handleToggleTab = (loginMode: boolean) => {
    setIsLogin(loginMode);
    // Reset state values
    setEmail('');
    setPassword('');
    setName('');
    setFirstName('');
    setPhone('');
    setCity('');
    setAddress('');
    setRole('tenant');
    setPrivacyAccepted(false);
  };

  // Submit flow
  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Veuillez saisir votre email et votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Connexion Firebase Auth
        await signInWithEmailAndPassword(auth, email.trim(), password);
        console.log('Connexion réussie !');
        // La redirection est gérée globalement dans le layout racine
      } else {
        // Inscription Firebase Auth
        if (!name || !firstName || !phone || !city || !address) {
          Alert.alert('Champs requis', 'Veuillez remplir tous les champs du profil.');
          setLoading(false);
          return;
        }
        if (!privacyAccepted) {
          Alert.alert('Politique de confidentialité', 'Vous devez accepter la politique de confidentialité pour continuer.');
          setLoading(false);
          return;
        }

        // Créer l'utilisateur dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const uid = userCredential.user.uid;

        // Enregistrer le profil utilisateur dans Firestore
        await firestoreDb.saveUserProfile(uid, {
          name: name.trim(),
          firstName: firstName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
          address: address.trim(),
          role,
          privacyAccepted
        });

        console.log('Inscription et profil Firestore créés !');
      }
    } catch (error: any) {
      console.error(error);
      let errorMsg = "Une erreur est survenue lors de l'authentification.";
      if (error.code === 'auth/wrong-password') {
        errorMsg = 'Mot de passe incorrect.';
      } else if (error.code === 'auth/user-not-found') {
        errorMsg = 'Aucun utilisateur trouvé avec cet email.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'Cet email est déjà associé à un compte.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Adresse email non valide.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Le mot de passe doit faire au moins 6 caractères.';
      }
      Alert.alert('Erreur', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient 
      colors={['#1a1c29', '#0d0e15']} 
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="home-outline" size={32} color="#ff8e3c" />
            </View>
            <Text style={styles.appName}>Renta<Text style={{ color: '#ff8e3c' }}>Home</Text></Text>
            <Text style={styles.appSubtitle}>Trouvez votre logement de rêve en quelques clics</Text>
          </View>

          {/* Card Container (effet Glassmorphic simulé) */}
          <View style={styles.authCard}>
            
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, isLogin && styles.activeTabButton]}
                onPress={() => handleToggleTab(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Connexion</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, !isLogin && styles.activeTabButton]}
                onPress={() => handleToggleTab(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Inscription</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              
              {!isLogin && (
                <>
                  {/* Role Selector (Pour l'inscription) */}
                  <Text style={styles.sectionLabel}>Je m'inscris en tant que :</Text>
                  <View style={styles.roleContainer}>
                    <TouchableOpacity 
                      style={[styles.roleCard, role === 'tenant' && styles.activeRoleCard]}
                      onPress={() => setRole('tenant')}
                    >
                      <Ionicons name="bed" size={24} color={role === 'tenant' ? '#ff8e3c' : '#8f9bb3'} />
                      <Text style={[styles.roleText, role === 'tenant' && styles.activeRoleText]}>Locataire</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.roleCard, role === 'landlord' && styles.activeRoleCard]}
                      onPress={() => setRole('landlord')}
                    >
                      <Ionicons name="business" size={24} color={role === 'landlord' ? '#ff8e3c' : '#8f9bb3'} />
                      <Text style={[styles.roleText, role === 'landlord' && styles.activeRoleText]}>Propriétaire</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Profil Inputs */}
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color="#8f9bb3" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      placeholder="Nom"
                      placeholderTextColor="#5a6880"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color="#8f9bb3" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      placeholder="Prénom"
                      placeholderTextColor="#5a6880"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="phone-portrait-outline" size={20} color="#8f9bb3" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      placeholder="Téléphone"
                      placeholderTextColor="#5a6880"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="map-outline" size={20} color="#8f9bb3" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      placeholder="Ville"
                      placeholderTextColor="#5a6880"
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Ionicons name="pin-outline" size={20} color="#8f9bb3" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      placeholder="Adresse / Résidence"
                      placeholderTextColor="#5a6880"
                      value={address}
                      onChangeText={setAddress}
                    />
                  </View>
                </>
              )}

              {/* Email & Password */}
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#8f9bb3" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="Adresse email"
                  placeholderTextColor="#5a6880"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#8f9bb3" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="Mot de passe"
                  placeholderTextColor="#5a6880"
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {!isLogin && (
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setPrivacyAccepted(!privacyAccepted)}
                >
                  <View style={[styles.checkbox, privacyAccepted && styles.checkboxChecked]}>
                    {privacyAccepted && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    J'accepte la politique de confidentialité.
                  </Text>
                </TouchableOpacity>
              )}

              {/* Submit Button */}
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isLogin ? 'Se connecter' : "S'inscrire"}
                  </Text>
                )}
              </TouchableOpacity>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 64,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    backgroundColor: 'rgba(255, 142, 60, 0.1)',
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 142, 60, 0.2)',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#8f9bb3',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  authCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.3)',
      }
    }),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: '#ff8e3c',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8f9bb3',
  },
  activeTabText: {
    color: '#ffffff',
  },
  formContainer: {
    width: '100%',
  },
  sectionLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  activeRoleCard: {
    borderColor: '#ff8e3c',
    backgroundColor: 'rgba(255, 142, 60, 0.05)',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8f9bb3',
  },
  activeRoleText: {
    color: '#ff8e3c',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    color: '#ffffff',
    fontSize: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
    paddingRight: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  checkboxChecked: {
    backgroundColor: '#ff8e3c',
    borderColor: '#ff8e3c',
  },
  checkboxLabel: {
    color: '#8f9bb3',
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#ff8e3c',
    borderRadius: 18,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#ff8e3c',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 6px 16px rgba(255, 142, 60, 0.35)',
      }
    }),
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
