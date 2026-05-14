import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../theme';

// ─── Top Bar ─────────────────────────────────────────────────────────────────
export function TopBar({ title, icon, showBack, onBack, badge, badgeColor }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        {showBack && (
          <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && styles.pressedDim]}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        )}
        {icon && (
          <View style={styles.topBarIcon}>
            {typeof icon === 'string' && icon.includes('ion:') ? (
              <Ionicons name={icon.replace('ion:', '')} size={14} color={Colors.white} />
            ) : (
              <Text style={{ fontSize: 13 }}>{icon}</Text>
            )}
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
    <Pressable
      style={({ pressed }) => [styles.primaryBtn, style, pressed && styles.pressedScale, loading && styles.disabledState]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </Pressable>
  );
}

// ─── Secondary Button ─────────────────────────────────────────────────────────
export function SecondaryButton({ label, onPress, style }) {
  return (
    <Pressable style={({ pressed }) => [styles.secondaryBtn, style, pressed && styles.pressedDim]} onPress={onPress}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </Pressable>
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
    { key: 'map', icon: 'navigate-outline', iconActive: 'navigate', label: 'Carte' },
    { key: 'history', icon: 'time-outline', iconActive: 'time', label: 'Historique' },
    { key: 'scan', icon: 'camera-outline', iconActive: 'camera', label: 'Scan' },
    { key: 'profile', icon: 'person-outline', iconActive: 'person', label: 'Profil' },
  ];
  return (
    <View style={styles.tabBar}>
      {tabs.map((t) => (
        <Pressable
          key={t.key}
          style={({ pressed }) => [styles.tabItem, pressed && styles.tabPressed]}
          onPress={() => onTabPress?.(t.key)}
        >
          <Ionicons
            name={activeTab === t.key ? t.iconActive : t.icon}
            size={17}
            color={activeTab === t.key ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>
            {t.label}
          </Text>
        </Pressable>
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
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { marginRight: 4 },
  backArrow: { color: Colors.white, fontSize: 20 },
  topBarIcon: {
    width: 26, height: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { color: Colors.white, fontSize: 15, fontWeight: Fonts.semibold, letterSpacing: 0.2 },
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
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
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
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  primaryBtnText: { color: Colors.white, fontSize: 14, fontWeight: Fonts.semibold },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  secondaryBtnText: { color: Colors.primary, fontSize: 13, fontWeight: Fonts.medium },
  formLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
    paddingBottom: 6,
    paddingTop: 2,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 7 },
  tabPressed: { opacity: 0.7 },
  tabLabel: { fontSize: 10, color: Colors.textMuted },
  tabLabelActive: { color: Colors.primary, fontWeight: Fonts.medium },
  pressedDim: { opacity: 0.85 },
  pressedScale: { transform: [{ scale: 0.99 }] },
  disabledState: { opacity: 0.7 },
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
