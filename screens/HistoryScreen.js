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
  PrimaryButton,
  FormField,
} from '../components/SharedComponents';
import { Colors, Spacing, Radius, Fonts } from '../theme';

const CULTURES = [
  'Maïs', 'Manioc', 'Igname', 'Soja', 'Plantain',
  'Arachide', 'Sorgho', 'Mil', 'Cacao', 'Café', 'Autre',
];

const MALADIES = [
  'Aucune', 'Mildiou', 'Rouille', 'Fusariose',
  'Charbon', 'Chrysomèle du maïs', 'Autre',
];

const RENDEMENTS = ['Bon', 'Moyen', 'Mauvais'];

function YearBlock({ year, label, data, onChange }) {
  const [showCulturePicker, setShowCulturePicker] = useState(false);
  const [showMaladiePicker, setShowMaladiePicker] = useState(false);

  function setField(field, value) {
    onChange({ ...data, [field]: value });
  }

  const rendementColors = {
    Bon: { bg: Colors.accentSoft, text: '#2e7d32' },
    Moyen: { bg: Colors.amberBg, text: Colors.amber },
    Mauvais: { bg: Colors.redBg, text: Colors.red },
  };

  return (
    <Card style={{ marginBottom: Spacing.md }}>
      <Text style={styles.yearLabel}>Année {label} ({year})</Text>

      {/* Culture */}
      <FormField label="Culture plantée">
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setShowCulturePicker(!showCulturePicker)}
        >
          <Text style={styles.selectText}>{data.culture || 'Sélectionner...'}</Text>
          <Text style={styles.selectArrow}>▾</Text>
        </TouchableOpacity>
        {showCulturePicker && (
          <View style={styles.picker}>
            {CULTURES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.pickerItem, data.culture === c && styles.pickerItemActive]}
                onPress={() => {
                  setField('culture', c);
                  setShowCulturePicker(false);
                }}
              >
                <Text style={[styles.pickerText, data.culture === c && styles.pickerTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </FormField>

      {/* Rendement */}
      <FormField label="Rendement obtenu">
        <View style={styles.rendementRow}>
          {RENDEMENTS.map((r) => {
            const isActive = data.rendement === r;
            const colors = rendementColors[r];
            return (
              <TouchableOpacity
                key={r}
                style={[
                  styles.rendementBtn,
                  { backgroundColor: isActive ? colors.bg : '#f5f5f5' },
                ]}
                onPress={() => setField('rendement', r)}
              >
                <Text
                  style={[
                    styles.rendementText,
                    { color: isActive ? colors.text : '#aaa', fontWeight: isActive ? Fonts.semibold : Fonts.regular },
                  ]}
                >
                  {isActive ? '✓ ' : ''}{r}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </FormField>

      {/* Maladies */}
      <FormField label="Maladies observées">
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setShowMaladiePicker(!showMaladiePicker)}
        >
          <Text style={styles.selectText}>{data.maladie || 'Sélectionner...'}</Text>
          <Text style={styles.selectArrow}>▾</Text>
        </TouchableOpacity>
        {showMaladiePicker && (
          <View style={styles.picker}>
            {MALADIES.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.pickerItem, data.maladie === m && styles.pickerItemActive]}
                onPress={() => {
                  setField('maladie', m);
                  setShowMaladiePicker(false);
                }}
              >
                <Text style={[styles.pickerText, data.maladie === m && styles.pickerTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </FormField>
    </Card>
  );
}

export default function HistoryScreen({ navigation, route }) {
  const currentYear = new Date().getFullYear();
  const [years, setYears] = useState([
    { year: currentYear - 1, label: '-1', culture: 'Maïs', rendement: 'Bon', maladie: 'Aucune' },
    { year: currentYear - 2, label: '-2', culture: '', rendement: '', maladie: '' },
    { year: currentYear - 3, label: '-3', culture: '', rendement: '', maladie: '' },
  ]);

  function updateYear(index, data) {
    const updated = [...years];
    updated[index] = { ...updated[index], ...data };
    setYears(updated);
  }

  function handleContinue() {
    navigation.navigate('Camera', {
      ...route.params,
      historique: years,
    });
  }

  return (
    <View style={styles.container}>
      <TopBar
        title="Historique cultural"
        showBack
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Ces informations permettent à l'IA d'affiner ses recommandations
            selon la rotation culturale de votre parcelle.
          </Text>
        </View>

        {years.map((y, i) => (
          <YearBlock
            key={y.year}
            year={y.year}
            label={y.label}
            data={y}
            onChange={(data) => updateYear(i, data)}
          />
        ))}

        <PrimaryButton
          label="Passer à la photo →"
          onPress={handleContinue}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.blueBg,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
    alignItems: 'flex-start',
  },
  infoIcon: { fontSize: 14 },
  infoText: { fontSize: 11, color: Colors.blue, flex: 1, lineHeight: 16 },
  yearLabel: {
    fontSize: 11,
    fontWeight: Fonts.semibold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  selectBox: {
    height: 38,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: '#f9fdf7',
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { fontSize: 12, color: Colors.textPrimary },
  selectArrow: { fontSize: 11, color: Colors.textMuted },
  picker: {
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.white,
    marginTop: 2,
    overflow: 'hidden',
  },
  pickerItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderMuted,
  },
  pickerItemActive: { backgroundColor: Colors.accentSoft },
  pickerText: { fontSize: 12, color: Colors.textSecondary },
  pickerTextActive: { color: Colors.primary, fontWeight: Fonts.medium },
  rendementRow: { flexDirection: 'row', gap: 6 },
  rendementBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  rendementText: { fontSize: 10 },
});
