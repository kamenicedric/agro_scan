import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '../theme';

// ─── Top Bar ─────────────────────────────────────────────────────────────────
export function TopBar({ title, icon, showBack, onBack, badge, badgeColor }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        )}
        {icon && (
          <View style={styles.topBarIcon}>
            <Text style={{ fontSize: 13 }}>{icon}</Text>
          </View>
        )}
        <Text style={styles.topBarTitle}>{title}</Text>
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeColor || Colors.accentSoft }]}>
          <Text style={[styles.badgeText, { color: badgeColor ? Colors.white : Colors.accent }]}>
            {badge}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── Section Title ─────────────────────────────────────────────────────────────
export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

// ─── Pill Badge ───────────────────────────────────────────────────────────────
export function Pill({ label, color = 'green' }) {
  const colorMap = {
    green: { bg: Colors.accentSoft, text: '#2e7d32' },
    amber: { bg: Colors.amberBg, text: Colors.amber },
    red: { bg: Colors.redBg, text: Colors.red },
    blue: { bg: Colors.blueBg, text: Colors.blue },
  };
  const c = colorMap[color] || colorMap.green;
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Text style={[styles.pillText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────
export function PrimaryButton({ label, onPress, loading, style }) {
  return (
    <TouchableOpacity style={[styles.primaryBtn, style]} onPress={onPress} activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Secondary Button ─────────────────────────────────────────────────────────
export function SecondaryButton({ label, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.secondaryBtn, style]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────
export function FormField({ label, children, style }) {
  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
      <Text style={styles.formLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
export function TabBar({ activeTab, onTabPress }) {
  const tabs = [
    { key: 'map', icon: '📍', label: 'Carte' },
    { key: 'history', icon: '📋', label: 'Historique' },
    { key: 'scan', icon: '🔬', label: 'Scan' },
    { key: 'profile', icon: '👤', label: 'Profil' },
  ];
  return (
    <View style={styles.tabBar}>
      {tabs.map((t) => (
        <TouchableOpacity
          key={t.key}
          style={styles.tabItem}
          onPress={() => onTabPress?.(t.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === t.key && styles.tabIconActive]}>
            {t.icon}
          </Text>
          <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Warning Box ─────────────────────────────────────────────────────────────
export function WarningBox({ message }) {
  return (
    <View style={styles.warningBox}>
      <Text style={styles.warningIcon}>⚠️</Text>
      <Text style={styles.warningText}>{message}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  topBar: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { marginRight: 4 },
  backArrow: { color: Colors.white, fontSize: 20 },
  topBarIcon: {
    width: 26, height: 26,
    backgroundColor: Colors.accent,
    borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { color: Colors.white, fontSize: 14, fontWeight: Fonts.medium },
  badge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: 10, fontWeight: Fonts.medium },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: Fonts.semibold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: 10, fontWeight: Fonts.medium },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  primaryBtnText: { color: Colors.white, fontSize: 13, fontWeight: Fonts.medium },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  secondaryBtnText: { color: Colors.primary, fontSize: 11 },
  formLabel: { fontSize: 10, color: Colors.textMuted, marginBottom: 4 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
    paddingBottom: 4,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabIcon: { fontSize: 16, marginBottom: 2 },
  tabIconActive: {},
  tabLabel: { fontSize: 9, color: Colors.textMuted },
  tabLabelActive: { color: Colors.primary, fontWeight: Fonts.medium },
  warningBox: {
    backgroundColor: Colors.amberBg,
    borderWidth: 0.5,
    borderColor: '#ffe082',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  warningIcon: { fontSize: 13 },
  warningText: { fontSize: 10, color: '#5d4037', flex: 1, lineHeight: 14 },
});
