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
import { signIn } from '../../services/authService';
import { Colors, Fonts, Radius, Spacing } from '../../theme';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide';
    if (!password) e.password = 'Mot de passe requis';
    else if (password.length < 6) e.password = 'Minimum 6 caractères';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      Alert.alert('Connexion échouée', error);
    }
    // Si succès → AuthContext met à jour user → AppNavigator redirige automatiquement
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
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.appName}>AgroScan IA</Text>
          <Text style={styles.tagline}>Diagnostic intelligent du sol</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Connexion</Text>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="votre@email.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors(p => ({ ...p, email: undefined })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={styles.errorMsg}>{errors.email}</Text>}
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.pwdRow}>
              <TextInput
                style={[styles.input, styles.pwdInput, errors.password && styles.inputError]}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors(p => ({ ...p, password: undefined })); }}
                secureTextEntry={!showPwd}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd(!showPwd)}>
                <Text style={styles.eyeIcon}>{showPwd ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorMsg}>{errors.password}</Text>}
          </View>

          {/* Forgot */}
          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register */}
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSecondaryText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    justifyContent: 'center',
  },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.xxl, paddingTop: Spacing.xxl },
  logoCircle: {
    width: 72, height: 72,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 26, fontWeight: Fonts.bold, color: Colors.primary, letterSpacing: 0.5 },
  tagline: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },

  form: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  formTitle: { fontSize: 20, fontWeight: Fonts.semibold, color: Colors.textPrimary, marginBottom: Spacing.lg },

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
  pwdRow: { position: 'relative' },
  pwdInput: { paddingRight: 48 },
  eyeBtn: {
    position: 'absolute', right: 12,
    top: 0, bottom: 0, justifyContent: 'center',
  },
  eyeIcon: { fontSize: 16 },
  errorMsg: { fontSize: 11, color: Colors.red, marginTop: 4 },

  forgotWrap: { alignSelf: 'flex-end', marginBottom: Spacing.lg },
  forgotText: { fontSize: 12, color: Colors.primary },

  btnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: Colors.white, fontSize: 15, fontWeight: Fonts.semibold },

  divider: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: Spacing.lg, gap: 12,
  },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: Colors.border },
  dividerText: { fontSize: 12, color: Colors.textMuted },

  btnSecondary: {
    borderWidth: 1, borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnSecondaryText: { color: Colors.primary, fontSize: 14, fontWeight: Fonts.medium },
});
