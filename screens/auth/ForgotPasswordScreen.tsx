import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { resetPassword } from '../../services/authService';
import { Colors, Fonts, Radius, Spacing } from '../../theme';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  async function handleReset() {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.');
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      Alert.alert('Erreur', error);
    } else {
      setSent(true);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>← Retour</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.icon}>🔑</Text>
        <Text style={styles.title}>Mot de passe oublié</Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Email envoyé !</Text>
            <Text style={styles.successText}>
              Vérifiez votre boîte mail. Vous recevrez un lien pour réinitialiser votre mot de passe dans quelques minutes.
            </Text>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.btnPrimaryText}>Retour à la connexion</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.description}>
              Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </Text>
            <Text style={styles.label}>Adresse email</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.btnPrimary, loading && { opacity: 0.6 }]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage, padding: Spacing.xl },
  backBtn: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  backArrow: { fontSize: 14, color: Colors.primary },
  content: { flex: 1, alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: Spacing.md },
  title: { fontSize: 22, fontWeight: Fonts.bold, color: Colors.primary, marginBottom: Spacing.xl },
  form: { width: '100%', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 0.5, borderColor: Colors.border },
  description: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: Fonts.medium, color: Colors.textSecondary, marginBottom: 6 },
  input: { height: 46, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, fontSize: 14, color: Colors.textPrimary, backgroundColor: '#fafcf9', marginBottom: Spacing.lg },
  btnPrimary: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  btnPrimaryText: { color: Colors.white, fontSize: 15, fontWeight: Fonts.semibold },
  successBox: { width: '100%', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center' },
  successIcon: { fontSize: 40, marginBottom: Spacing.md },
  successTitle: { fontSize: 18, fontWeight: Fonts.semibold, color: Colors.primary, marginBottom: Spacing.sm },
  successText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl },
});
