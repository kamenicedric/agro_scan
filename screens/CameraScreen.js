import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, Alert, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {
  TopBar, Card, SectionTitle, PrimaryButton,
  SecondaryButton, WarningBox,
} from '../components/SharedComponents';
import { Colors, Spacing, Radius, Fonts } from '../theme';

// ─── Détection de flou (Laplacien simulé) ─────────────────────────────────────
async function computeLaplacianVariance(uri) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(Math.random() * 150 + 60), 300);
  });
}

function validatePhotoQuality(photo) {
  const issues = [];
  const mp = (photo.width * photo.height) / 1_000_000;
  if (mp < 8) {
    issues.push(`Résolution insuffisante (${mp.toFixed(1)} MP). Minimum requis : 12 MP.`);
  }
  return issues;
}

const STEPS = [
  { num: '1', text: 'Creuser un trou de 20–30 cm de profondeur' },
  { num: '2', text: 'Extraire une motte du fond du trou' },
  { num: '3', text: 'Poser la motte sur une surface neutre (sac blanc)' },
  { num: '4', text: 'Photographier en pleine lumière naturelle' },
];

export default function CameraScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef  = useRef(null);
  const [photo, setPhoto]       = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [validating, setValidating] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [mpStatus, setMpStatus]     = useState(null);
  const [facing] = useState('back');

  async function takePicture() {
    if (cameraRef.current) {
      const p = await cameraRef.current.takePictureAsync({ quality: 1, exif: true });
      await processPhoto(p);
      setCameraMode(false);
    }
  }

  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      exif: true,
    });
    if (!result.canceled && result.assets[0]) {
      await processPhoto(result.assets[0]);
    }
  }

  async function processPhoto(p) {
    setValidating(true);
    setWarnings([]);
    const newWarnings = [];

    const qualityIssues = validatePhotoQuality(p);
    newWarnings.push(...qualityIssues);

    const blurScore = await computeLaplacianVariance(p.uri);
    if (blurScore < 80) {
      newWarnings.push(`Image floue détectée (score: ${Math.round(blurScore)}). Stabilisez votre appareil.`);
    }

    const mp = ((p.width * p.height) / 1_000_000).toFixed(1);
    setMpStatus(`${mp} MP`);
    setWarnings(newWarnings);
    setPhoto({ ...p, blurScore });
    setValidating(false);
  }

  async function openCamera() {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission refusée', 'Autorisez l\'accès à la caméra dans les paramètres.');
        return;
      }
    }
    setCameraMode(true);
  }

  function handleAnalyze() {
    if (!photo) {
      Alert.alert('Photo manquante', 'Veuillez prendre ou sélectionner une photo de la motte de terre.');
      return;
    }
    if (warnings.length > 0) {
      Alert.alert('Qualité insuffisante', 'Corrigez les problèmes détectés avant de continuer.');
      return;
    }
    navigation.navigate('Analysis', { ...route.params, photo });
  }

  return (
    <View style={styles.container}>
      <TopBar
        title="Capture du sol"
        showBack
        onBack={() => navigation.goBack()}
        badge={mpStatus ? `${mpStatus} ✓` : '12 MP requis'}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.sc} showsVerticalScrollIndicator={false}>
        {/* Protocole */}
        <SectionTitle>Protocole obligatoire</SectionTitle>
        <Card style={{ marginBottom: Spacing.md }}>
          {STEPS.map((s) => (
            <View key={s.num} style={styles.stepRow}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>{s.num}</Text></View>
              <Text style={styles.stepText}>{s.text}</Text>
            </View>
          ))}
        </Card>

        {/* Caméra */}
        {cameraMode ? (
          <View style={styles.cameraWrapper}>
            <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
              <View style={styles.camOverlay}>
                <View style={styles.corner_tl} />
                <View style={styles.corner_tr} />
                <View style={styles.corner_bl} />
                <View style={styles.corner_br} />
                <View style={styles.camHint}>
                  <Text style={styles.camHintText}>Centrer la motte sur surface blanche</Text>
                </View>
              </View>
            </CameraView>
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCameraMode(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shutterBtn} onPress={takePicture}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
                <Text style={{ fontSize: 24 }}>📷</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Preview ou Placeholder */}
            {photo ? (
              <View style={styles.previewWrapper}>
                <Image source={{ uri: photo.uri }} style={styles.preview} />
                {!validating && warnings.length === 0 && (
                  <View style={styles.previewOverlay}>
                    <View style={styles.validBadge}>
                      <Text style={styles.validBadgeText}>✓ Qualité validée</Text>
                    </View>
                  </View>
                )}
                {validating && (
                  <View style={styles.previewOverlay}>
                    <ActivityIndicator color={Colors.white} />
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity style={styles.placeholder} onPress={openCamera}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>📸</Text>
                <Text style={styles.placeholderText}>Appuyer pour photographier la motte</Text>
              </TouchableOpacity>
            )}

            {warnings.map((w, i) => <WarningBox key={i} message={w} />)}

            {photo ? (
              <SecondaryButton label="📷 Reprendre la photo" onPress={openCamera} />
            ) : (
              <SecondaryButton label="📂 Choisir depuis la galerie" onPress={pickFromGallery} />
            )}

            <PrimaryButton
              label="Analyser avec l'IA →"
              onPress={handleAnalyze}
              loading={validating}
              style={{ marginTop: Spacing.sm }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  scroll: { flex: 1 },
  sc: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  stepNum: { width: 20, height: 20, backgroundColor: Colors.primary, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  stepText: { fontSize: 12, color: Colors.textSecondary, flex: 1, lineHeight: 17 },
  cameraWrapper: { borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.sm },
  camera: { height: 300 },
  camOverlay: { ...StyleSheet.absoluteFillObject },
  corner_tl: { position: 'absolute', top: 12, left: 12, width: 22, height: 22, borderTopWidth: 3, borderLeftWidth: 3, borderColor: Colors.accent },
  corner_tr: { position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderTopWidth: 3, borderRightWidth: 3, borderColor: Colors.accent },
  corner_bl: { position: 'absolute', bottom: 60, left: 12, width: 22, height: 22, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: Colors.accent },
  corner_br: { position: 'absolute', bottom: 60, right: 12, width: 22, height: 22, borderBottomWidth: 3, borderRightWidth: 3, borderColor: Colors.accent },
  camHint: { position: 'absolute', bottom: 72, left: 0, right: 0, alignItems: 'center' },
  camHintText: { color: 'rgba(255,255,255,0.85)', fontSize: 11, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.sm },
  cameraControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111', paddingVertical: 16, paddingHorizontal: 32 },
  shutterBtn: { width: 62, height: 62, borderRadius: 31, borderWidth: 3, borderColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.white },
  cancelBtn: { padding: 8 },
  cancelText: { color: Colors.white, fontSize: 13 },
  galleryBtn: { padding: 8 },
  previewWrapper: { borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.sm, position: 'relative' },
  preview: { width: '100%', height: 220, resizeMode: 'cover' },
  previewOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 12 },
  validBadge: { backgroundColor: 'rgba(76,175,80,0.9)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: Radius.full },
  validBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '500' },
  placeholder: { height: 160, backgroundColor: '#222', borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed' },
  placeholderText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center' },
});
