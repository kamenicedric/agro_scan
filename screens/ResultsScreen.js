import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Share,
  Alert,
} from 'react-native';
import {
  TopBar,
  Card,
  SectionTitle,
  PrimaryButton,
  SecondaryButton,
  Pill,
  TabBar,
} from '../components/SharedComponents';
import { Colors, Spacing, Radius, Fonts } from '../theme';

// ─── Recommended crops logic ──────────────────────────────────────────────────
function getRecommendations(texture, ph, historique = []) {
  const { argile, limon } = texture;

  let cultures = [];
  if (argile > 35) {
    cultures = [
      { emoji: '🌽', name: 'Maïs', score: 95 },
      { emoji: '🍠', name: 'Igname', score: 88 },
      { emoji: '🫘', name: 'Soja', score: 82 },
    ];
  } else if (limon > 30) {
    cultures = [
      { emoji: '🌾', name: 'Sorgho', score: 91 },
      { emoji: '🥜', name: 'Arachide', score: 85 },
      { emoji: '🌽', name: 'Maïs', score: 80 },
    ];
  } else {
    cultures = [
      { emoji: '🥜', name: 'Arachide', score: 90 },
      { emoji: '🌾', name: 'Mil', score: 85 },
      { emoji: '🫘', name: 'Niébé', score: 78 },
    ];
  }

  // Rotation alert: same crop 2+ years
  const recentCultures = (historique || []).map((h) => h.culture).filter(Boolean);
  const topCulture = cultures[0]?.name;
  const rotationAlert =
    recentCultures.filter((c) => c === topCulture).length >= 2;

  // NPK plan based on ph and texture
  const npk = {
    N: ph < 6.5 ? 90 : 80,
    P: argile > 35 ? 55 : 65,
    K: limon > 30 ? 45 : 40,
  };

  return { cultures, npk, rotationAlert };
}

// ─── NPK Card ─────────────────────────────────────────────────────────────────
function NPKCard({ element, value, unit, color, textColor, description }) {
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.npkCard, { backgroundColor: color, transform: [{ scale }] }]}>
      <Text style={[styles.npkValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.npkElement, { color: textColor }]}>{element}</Text>
      <Text style={[styles.npkDesc, { color: textColor, opacity: 0.7 }]}>{description}</Text>
      <Text style={[styles.npkUnit, { color: textColor, opacity: 0.6 }]}>{unit}</Text>
    </Animated.View>
  );
}

// ─── Crop Tag ─────────────────────────────────────────────────────────────────
function CropTag({ emoji, name, score, delay }) {
  const slide = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.cropTag, { transform: [{ translateY: slide }], opacity }]}>
      <Text style={styles.cropEmoji}>{emoji}</Text>
      <View>
        <Text style={styles.cropName}>{name}</Text>
        <Text style={styles.cropScore}>Score: {score}%</Text>
      </View>
    </Animated.View>
  );
}

export default function ResultsScreen({ navigation, route }) {
  const { result, historique } = route.params || {};

  const { cultures, npk, rotationAlert } = getRecommendations(
    result?.texture || { argile: 42, limon: 35, sable: 23 },
    result?.ph || 6.2,
    historique
  );

  async function shareReport() {
    try {
      await Share.share({
        title: 'Rapport AgroScan IA',
        message: `
🌱 AgroScan IA — Rapport de diagnostic sol

📍 Localisation: ${route.params?.location?.latitude?.toFixed(4) || 'N/A'}° N

🧱 Texture: ${result?.classification || 'Argile-limoneux'}
  • Argile: ${result?.texture?.argile}%
  • Limon: ${result?.texture?.limon}%
  • Sable: ${result?.texture?.sable}%
  • pH: ${result?.ph}

🌿 Cultures recommandées:
${cultures.map((c) => `  ${c.emoji} ${c.name} (${c.score}%)`).join('\n')}

💊 Plan de fertilisation N-P-K:
  • Azote (N): ${npk.N} kg/ha
  • Phosphore (P): ${npk.P} kg/ha
  • Potassium (K): ${npk.K} kg/ha

Généré par AgroScan IA
        `.trim(),
      });
    } catch (e) {
      Alert.alert('Erreur', "Impossible de partager le rapport.");
    }
  }

  return (
    <View style={styles.container}>
      <TopBar
        title="Résultats"
        icon="✅"
        badge="Diagnostic complet"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Recommended Crops */}
        <View style={styles.resultHeader}>
          <Text style={styles.resultHeaderTitle}>🌿 Cultures recommandées</Text>
          <Text style={styles.resultHeaderSub}>
            Basé sur sol {result?.classification || 'argilo-limoneux'} · Climat tropical humide
          </Text>
          <View style={styles.cropsContainer}>
            {cultures.map((c, i) => (
              <CropTag key={c.name} {...c} delay={i * 150} />
            ))}
          </View>
        </View>

        {/* Rotation alert */}
        {rotationAlert && (
          <Card style={styles.alertCard}>
            <View style={styles.alertRow}>
              <Text style={styles.alertIcon}>🔄</Text>
              <View>
                <Text style={styles.alertTitle}>Alerte rotation culturale</Text>
                <Text style={styles.alertText}>
                  2 années consécutives de {cultures[0]?.name} détectées.
                  Recommandation : légumineuses pour la prochaine saison.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* NPK */}
        <SectionTitle style={{ marginTop: Spacing.sm }}>Plan de fertilisation N-P-K</SectionTitle>
        <View style={styles.npkRow}>
          <NPKCard
            element="N — Azote"
            value={npk.N}
            unit="kg/ha"
            color="#e8f5e9"
            textColor="#1b5e20"
            description="Croissance foliaire"
          />
          <NPKCard
            element="P — Phosphore"
            value={npk.P}
            unit="kg/ha"
            color="#e3f2fd"
            textColor="#0d47a1"
            description="Développement racinaire"
          />
          <NPKCard
            element="K — Potassium"
            value={npk.K}
            unit="kg/ha"
            color="#fff8e1"
            textColor="#e65100"
            description="Résistance maladies"
          />
        </View>

        {/* Application plan */}
        <SectionTitle style={{ marginTop: Spacing.sm }}>Plan d'application</SectionTitle>
        <Card>
          {[
            { phase: 'Préparation sol', timing: 'J-15', action: `Apporter ${npk.P} kg/ha de superphosphate` },
            { phase: 'Semis', timing: 'J0', action: `Incorporer ${Math.round(npk.N * 0.4)} kg/ha de NPK de fond` },
            { phase: 'Croissance', timing: 'J+30', action: `Apporter ${Math.round(npk.N * 0.6)} kg/ha d'urée en couverture` },
            { phase: 'Floraison', timing: 'J+60', action: `${npk.K} kg/ha de chlorure de potassium` },
          ].map((p, i) => (
            <View key={i} style={[styles.planRow, i < 3 && styles.planRowBorder]}>
              <View style={styles.planLeft}>
                <Text style={styles.planPhase}>{p.phase}</Text>
                <Text style={styles.planAction}>{p.action}</Text>
              </View>
              <View style={styles.planTimingBadge}>
                <Text style={styles.planTiming}>{p.timing}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Résumé du sol</Text>
          <View style={styles.summaryGrid}>
            {[
              { label: 'Classification', value: result?.classification || 'Argile-limoneux' },
              { label: 'Fertilité', value: result?.fertilite || 'Fertile' },
              { label: 'pH', value: result?.ph?.toString() || '6.2' },
              { label: 'Pluviométrie', value: '1 840 mm/an' },
            ].map((s) => (
              <View key={s.label} style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>{s.label}</Text>
                <Text style={styles.summaryStatValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </Card>

        <PrimaryButton
          label="📄 Partager le rapport"
          onPress={shareReport}
          style={{ marginBottom: Spacing.sm }}
        />
        <SecondaryButton
          label="+ Nouveau diagnostic"
          onPress={() => navigation.navigate('Geolocation')}
        />
      </ScrollView>

      <TabBar
        activeTab="scan"
        onTabPress={(tab) => {
          if (tab === 'profile') navigation.navigate('Profile');
          if (tab === 'map') navigation.navigate('Geolocation');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  resultHeader: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  resultHeaderTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: Fonts.semibold,
    marginBottom: 4,
  },
  resultHeaderSub: {
    color: Colors.textOnDarkMuted,
    fontSize: 10,
    marginBottom: Spacing.sm,
  },
  cropsContainer: { gap: 6 },
  cropTag: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.sm,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cropEmoji: { fontSize: 22 },
  cropName: { color: Colors.white, fontSize: 13, fontWeight: Fonts.medium },
  cropScore: { color: Colors.textOnDarkMuted, fontSize: 10 },

  alertCard: {
    borderColor: '#ffe082',
    backgroundColor: Colors.amberBg,
    marginBottom: Spacing.sm,
  },
  alertRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  alertIcon: { fontSize: 18 },
  alertTitle: { fontSize: 11, fontWeight: Fonts.semibold, color: '#5d4037', marginBottom: 3 },
  alertText: { fontSize: 11, color: '#5d4037', lineHeight: 16 },

  npkRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  npkCard: {
    flex: 1,
    borderRadius: Radius.md,
    padding: 10,
    alignItems: 'center',
  },
  npkValue: { fontSize: 22, fontWeight: Fonts.bold },
  npkElement: { fontSize: 9, fontWeight: Fonts.semibold, marginTop: 2, textAlign: 'center' },
  npkDesc: { fontSize: 8, textAlign: 'center', marginTop: 2 },
  npkUnit: { fontSize: 8, marginTop: 3 },

  planRow: { paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planRowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.borderMuted },
  planLeft: { flex: 1, paddingRight: 10 },
  planPhase: { fontSize: 11, fontWeight: Fonts.medium, color: Colors.textPrimary, marginBottom: 2 },
  planAction: { fontSize: 10, color: Colors.textSecondary },
  planTimingBadge: {
    backgroundColor: Colors.accentSoft,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  planTiming: { fontSize: 10, color: Colors.primary, fontWeight: Fonts.medium },

  summaryCard: { marginBottom: Spacing.md },
  summaryTitle: { fontSize: 11, fontWeight: Fonts.semibold, color: Colors.primary, marginBottom: Spacing.sm },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryStat: {
    width: '47%',
    backgroundColor: Colors.bgPage,
    borderRadius: Radius.sm,
    padding: 8,
  },
  summaryStatLabel: { fontSize: 9, color: Colors.textMuted, marginBottom: 2 },
  summaryStatValue: { fontSize: 12, fontWeight: Fonts.medium, color: Colors.primary },
});
