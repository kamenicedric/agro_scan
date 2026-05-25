import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signUp } from '../../services/authService';
import { Colors, Fonts, Radius, Spacing } from '../../theme';

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  secureTextEntry?: boolean;
};

function FormField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
}: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
      />
      {error && <Text style={styles.errorMsg}>{error}</Text>}
    </View>
  );
}

export default function RegisterScreen({ navigation }: any) {
  const [nom, setNom]           = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!nom.trim()) e.nom = 'Nom requis';
    if (!email.trim()) e.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide';
    if (!password) e.password = 'Mot de passe requis';
    else if (password.length < 6) e.password = 'Minimum 6 caractères';
    if (password !== confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    const { error } = await signUp(email, password, nom);
    setLoading(false);
    if (error) {
      Alert.alert('Inscription échouée', error);
    } else {
      Alert.alert(
        'Compte créé',
        'Un email de confirmation vous a été envoyé. Vérifiez aussi Spam/Indésirables puis connectez-vous.',
        [{ text: 'Se connecter', onPress: () => navigation.navigate('Login') }]
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf-outline" size={26} color={Colors.white} />
          </View>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Commencez vos diagnostics en moins de 2 minutes</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <FormField
            label="Nom complet"
            value={nom}
            onChangeText={(t) => {
              setNom(t);
              setErrors((p) => ({ ...p, nom: undefined }));
            }}
            error={errors.nom}
            placeholder="Jean Dupont"
          />
          <FormField
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErrors((p) => ({ ...p, email: undefined }));
            }}
            error={errors.email}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password with eye toggle */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[styles.input, { paddingRight: 48 }, errors.password && styles.inputError]}
                placeholder="Minimum 6 caractères"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors(p => ({ ...p, password: undefined })); }}
                secureTextEntry={!showPwd}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPwd(!showPwd)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <Ionicons
                  name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorMsg}>{errors.password}</Text>}
          </View>

          <FormField
            label="Confirmer le mot de passe"
            value={confirm}
            onChangeText={(t) => {
              setConfirm(t);
              setErrors((p) => ({ ...p, confirm: undefined }));
            }}
            error={errors.confirm}
            placeholder="••••••••"
            secureTextEntry={!showPwd}
            autoCapitalize="none"
          />

          {/* Password strength */}
          {password.length > 0 && (
            <View style={styles.strengthWrap}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor:
                        password.length >= i * 3
                          ? i <= 1 ? Colors.red
                          : i <= 2 ? Colors.amber
                          : Colors.accent
                          : Colors.border,
                    },
                  ]}
                />
              ))}
              <Text style={styles.strengthLabel}>
                {password.length < 6 ? 'Trop court'
                  : password.length < 10 ? 'Moyen'
                  : 'Fort'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>{loading ? 'Création du compte...' : "Créer mon compte"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Vous avez déjà un compte ?{' '}
              <Text style={{ color: Colors.primary, fontWeight: Fonts.semibold }}>
                Se connecter
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  header: { alignItems: 'center', paddingTop: Spacing.xl, marginBottom: Spacing.xl },
  backBtn: { alignSelf: 'flex-start', padding: 4, marginBottom: Spacing.lg },
  backArrow: { fontSize: 22, color: Colors.primary },
  logoCircle: {
    width: 64, height: 64,
    backgroundColor: Colors.primary,
    borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: { fontSize: 22, fontWeight: Fonts.bold, color: Colors.primary },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },

  form: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  fieldWrap: { marginBottom: Spacing.md },
  label: { fontSize: 12, fontWeight: Fonts.medium, color: Colors.textSecondary, marginBottom: 6 },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: '#fafcf9',
  },
  inputError: { borderColor: Colors.red },
  eyeBtn: {
    position: 'absolute', right: 12,
    top: 0, bottom: 0, justifyContent: 'center',
    paddingHorizontal: 4,
  },
  errorMsg: { fontSize: 11, color: Colors.red, marginTop: 4 },

  strengthWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginBottom: Spacing.md, marginTop: -4,
  },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: 10, color: Colors.textMuted, minWidth: 50 },

  btnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: Colors.white, fontSize: 15, fontWeight: Fonts.semibold },

  loginLink: { alignItems: 'center', marginTop: Spacing.lg },
  loginLinkText: { fontSize: 13, color: Colors.textSecondary },
});
