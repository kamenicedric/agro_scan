import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TextInput, TouchableOpacity, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import {
  TopBar, Card, SectionTitle, Pill,
  PrimaryButton, FormField, TabBar,
} from '../components/SharedComponents';
import { Colors, Spacing, Radius, Fonts } from '../theme';
import { useAuth } from '../context/AuthContext';

const DEFAULT_COORDS = { latitude: 4.0511, longitude: 9.7679 };

export default function GeolocationScreen({ navigation }) {
  const { user } = useAuth();
  const [location, setLocation]     = useState(null);
  const [superficie, setSuperficie] = useState('');
  const [loading, setLoading]       = useState(false);
  const [gpsText, setGpsText]       = useState('Localisation en cours...');
  const [zoneData] = useState({ pluvio: '1 840 mm/an', temp: '26°C moy.', zone: 'Tropicale humide' });

  useEffect(() => { requestLocation(); }, []);

  async function requestLocation() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsText('Permission GPS refusée');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc.coords);
      setGpsText(`${loc.coords.latitude.toFixed(4)}° N, ${loc.coords.longitude.toFixed(4)}° E`);
    } catch {
      setLocation(DEFAULT_COORDS);
      setGpsText('4.0511° N, 9.7679° E · Alt. 42 m');
    }
    setLoading(false);
  }

  const coords = location || DEFAULT_COORDS;

  function handleContinue() {
    if (!superficie) {
      Alert.alert('Superficie requise', 'Indiquez la superficie de votre parcelle.');
      return;
    }
    navigation.navigate('History', { location: coords, superficie, userId: user?.id });
  }

  return (
    <View style={styles.container}>
      <TopBar
        title="AgroScan IA"
        icon="🌱"
        badge={location ? 'GPS actif' : 'GPS...'}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.sc} showsVerticalScrollIndicator={false}>
        <SectionTitle>Ma parcelle</SectionTitle>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={{ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
            showsUserLocation
          >
            <Marker coordinate={coords} title="Ma parcelle" />
          </MapView>
          <View style={styles.mapLabel}>
            <Text style={styles.mapLabelText}>Littoral, CM</Text>
          </View>
        </View>

        <View style={styles.gpsRow}>
          <View style={[styles.gpsDot, { backgroundColor: location ? Colors.accent : Colors.amber }]} />
          <Text style={styles.gpsText}>{gpsText}</Text>
          <TouchableOpacity onPress={requestLocation}>
            <Text style={{ fontSize: 18, color: Colors.primary }}>↻</Text>
          </TouchableOpacity>
        </View>

        <Card>
          <Text style={{ fontSize: 10, color: Colors.textMuted, marginBottom: 6 }}>Données de zone récupérées</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <Pill label={`🌧 ${zoneData.pluvio}`} color="blue" />
            <Pill label={`🌡 ${zoneData.temp}`}   color="amber" />
            <Pill label={`🌿 ${zoneData.zone}`}   color="green" />
          </View>
        </Card>

        <SectionTitle style={{ marginTop: Spacing.md }}>Surface de la parcelle</SectionTitle>
        <FormField label="Superficie estimée (ha)">
          <TextInput
            style={styles.input}
            placeholder="Ex: 2.5"
            placeholderTextColor={Colors.textMuted}
            value={superficie}
            onChangeText={setSuperficie}
            keyboardType="decimal-pad"
          />
        </FormField>

        <PrimaryButton label="Continuer →" onPress={handleContinue} loading={loading} style={{ marginTop: Spacing.sm }} />
      </ScrollView>
      <TabBar activeTab="map" onTabPress={(tab) => { if (tab === 'profile') navigation.navigate('Profile'); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  scroll: { flex: 1 },
  sc: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  mapContainer: { height: 180, borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.sm, position: 'relative' },
  map: { flex: 1 },
  mapLabel: { position: 'absolute', bottom: 8, right: 10, backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.sm },
  mapLabelText: { fontSize: 10, color: Colors.primary, fontWeight: '500' },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  gpsDot: { width: 8, height: 8, borderRadius: 4 },
  gpsText: { fontSize: 10, color: Colors.textSecondary, flex: 1 },
  input: { height: 40, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: '#f9fdf7', paddingHorizontal: Spacing.sm, fontSize: 13, color: Colors.textPrimary },
});
