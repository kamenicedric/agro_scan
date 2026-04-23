import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {
  TopBar,
  Card,
  SectionTitle,
  Pill,
  PrimaryButton,
  TabBar,
} from '../components/SharedComponents';
import { Colors, Spacing, Radius, Fonts } from '../theme';

// ─── Mock history data ────────────────────────────────────────────────────────
const MOCK_HISTORY = [
  {
    id: '1',
    name: 'Parcelle Nord',
    date: 'Il y a 2 jours',
    status: 'Fertile',
    statusColor: 'green',
    texture: 'Argile-limoneux',
    cultures: ['Maïs', 'Igname'],
    surface: '2.5 ha',
    coords: '4.0511° N',
  },
  {
    id: '2',
    name: 'Parcelle Sud',
    date: 'Il y a 1 semaine',
    status: 'Acidité élevée',
    statusColor: 'amber',
    texture: 'Sableux',
    cultures: ['Arachide'],
    surface: '1.8 ha',
    coords: '4.0498° N',
  },
  {
    id: '3',
    name: 'Parcelle Est',
    date: 'Il y a 3 semaines',
    status: 'Carence N-P',
    statusColor: 'red',
    texture: 'Limoneux',
    cultures: ['Soja'],
    surface: '3.2 ha',
    coords: '4.0534° N',
  },
];

function HistoryItem({ item, onPress }) {
  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <Card style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View>
            <Text style={styles.historyName}>{item.name}</Text>
            <Text style={styles.historyDate}>{item.date} · {item.surface}</Text>
          </View>
          <Pill label={item.status} color={item.statusColor} />
        </View>
        <View style={styles.historyMeta}>
          <Text style={styles.historyMetaText}>🧱 {item.texture}</Text>
          <Text style={styles.historyMetaText}>📍 {item.coords}</Text>
          <Text style={styles.historyMetaText}>
            🌿 {item.cultures.join(', ')}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  function handleHistoryPress(item) {
    setSelectedItem(item);
  }

  const stats = [
    { icon: '🔬', value: MOCK_HISTORY.length.toString(), label: 'Diagnostics' },
    { icon: '🌿', value: '4', label: 'Parcelles' },
    { icon: '📅', value: '3 mois', label: "Depuis" },
    { icon: '✅', value: '2', label: 'Fertiles' },
  ];

  return (
    <View style={styles.container}>
      <TopBar title="Mon profil" icon="👤" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AG</Text>
            </View>
            <View>
              <Text style={styles.profileName}>Agriculteur Gbane</Text>
              <Text style={styles.profileSub}>Douala, Littoral · Cameroun</Text>
              <View style={styles.profileTagRow}>
                <Pill label="Compte gratuit" color="green" />
              </View>
            </View>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </View>

        {/* History */}
        <SectionTitle style={{ marginTop: Spacing.sm }}>
          Mes diagnostics récents
        </SectionTitle>

        {MOCK_HISTORY.map((item) => (
          <HistoryItem key={item.id} item={item} onPress={handleHistoryPress} />
        ))}

        {/* Expanded detail */}
        {selectedItem && (
          <Card style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>📋 {selectedItem.name}</Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <Text style={styles.detailClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Statut</Text>
                <Pill label={selectedItem.status} color={selectedItem.statusColor} />
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Texture</Text>
                <Text style={styles.detailVal}>{selectedItem.texture}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Surface</Text>
                <Text style={styles.detailVal}>{selectedItem.surface}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Cultures</Text>
                <Text style={styles.detailVal}>{selectedItem.cultures.join(', ')}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Settings */}
        <SectionTitle style={{ marginTop: Spacing.md }}>Paramètres</SectionTitle>
        <Card>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDesc}>Alertes saisonnières et rappels</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>
          <View style={[styles.settingRow, { borderTopWidth: 0.5, borderTopColor: Colors.borderMuted, paddingTop: 10, marginTop: 4 }]}>
            <View>
              <Text style={styles.settingLabel}>Mode hors-ligne</Text>
              <Text style={styles.settingDesc}>Analyses sans connexion internet</Text>
            </View>
            <Switch
              value={offlineModeEnabled}
              onValueChange={setOfflineModeEnabled}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>
        </Card>

        <PrimaryButton
          label="+ Nouveau diagnostic"
          onPress={() => navigation.navigate('Geolocation')}
          style={{ marginTop: Spacing.sm }}
        />
      </ScrollView>

      <TabBar
        activeTab="profile"
        onTabPress={(tab) => {
          if (tab === 'map') navigation.navigate('Geolocation');
          if (tab === 'scan') navigation.navigate('Camera');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  profileCard: { marginBottom: Spacing.md },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 16, fontWeight: Fonts.semibold },
  profileName: { fontSize: 15, fontWeight: Fonts.semibold, color: Colors.textPrimary },
  profileSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  profileTagRow: { marginTop: 6 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  statIcon: { fontSize: 16, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: Fonts.semibold, color: Colors.primary },
  statLabel: { fontSize: 9, color: Colors.textMuted, textAlign: 'center' },

  historyCard: { marginBottom: 8 },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyName: { fontSize: 12, fontWeight: Fonts.medium, color: Colors.textPrimary },
  historyDate: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  historyMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  historyMetaText: { fontSize: 10, color: Colors.textSecondary },

  detailCard: {
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
    backgroundColor: Colors.accentSoft,
  },
  detailHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  detailTitle: { fontSize: 12, fontWeight: Fonts.semibold, color: Colors.primary },
  detailClose: { fontSize: 16, color: Colors.textMuted },
  detailBody: { gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailKey: { fontSize: 11, color: Colors.textSecondary },
  detailVal: { fontSize: 11, fontWeight: Fonts.medium, color: Colors.textPrimary },

  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLabel: { fontSize: 13, fontWeight: Fonts.medium, color: Colors.textPrimary },
  settingDesc: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
});
