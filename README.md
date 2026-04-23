# 🌱 AgroScan IA — React Native (Expo)

Diagnostic intelligent du sol agricole via IA et géolocalisation.

---

## 📁 Structure du projet

```
agroscan/
├── App.js                          # Point d'entrée
├── app.json                        # Config Expo
├── package.json                    # Dépendances
├── babel.config.js
│
├── theme/
│   └── index.js                   # Couleurs, typographie, spacing
│
├── components/
│   └── SharedComponents.js        # TopBar, Card, Pill, Button, TabBar...
│
├── navigation/
│   └── AppNavigator.js            # Stack Navigator (6 écrans)
│
└── screens/
    ├── GeolocationScreen.js       # Écran 1 : GPS + carte parcelle
    ├── HistoryScreen.js           # Écran 2 : Historique cultural (3 ans)
    ├── CameraScreen.js            # Écran 3 : Capture guidée + validation
    ├── AnalysisScreen.js          # Écran 4 : Analyse IA animée
    ├── ResultsScreen.js           # Écran 5 : Recommandations + NPK
    └── ProfileScreen.js           # Écran 6 : Profil + historique diagnostics
```

---

## 🚀 Installation

### Prérequis
- Node.js >= 18
- Expo CLI : `npm install -g expo-cli`
- Expo Go sur votre téléphone (iOS ou Android)

### Lancer le projet

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer Expo
npx expo start

# 3. Scanner le QR code avec Expo Go
```

---

## 📦 Dépendances principales

| Package | Usage |
|---|---|
| `expo-location` | GPS haute précision |
| `expo-camera` | Caméra native + accès EXIF |
| `expo-image-picker` | Sélection depuis galerie |
| `expo-image-manipulator` | Redimensionnement photo |
| `react-native-maps` | Carte MapView + Marker |
| `@react-navigation/native-stack` | Navigation entre écrans |

---

## 🔬 Logique de validation photo (CameraScreen.js)

```
Photo prise
  ├── Résolution < 12 MP ? → ⚠ "Matériel insuffisant"
  ├── Score Laplacien < 80 ? → ⚠ "Image floue"
  ├── BrightnessValue EXIF < 0.5 ? → ⚠ "Trop sombre"
  └── Tout OK → ✅ Validation + envoi à l'IA
```

> En production, remplacer `computeLaplacianVariance()` par un appel
> à une Edge Function Supabase ou un shader GLSL via expo-gl.

---

## 🌐 Architecture API (MVP)

```
Frontend RN
    │
    ├── POST /analyze
    │     { image_base64, lat, lng, historique[] }
    │
    └── Supabase Edge Function
          ├── MobileNetV2 → texture classification
          ├── SoilGrids API → données GPS sol
          ├── OpenMeteo API → pluviométrie / température
          └── Recommandations N-P-K → réponse JSON
```

---

## 🗃 Schéma base de données Supabase

```sql
-- Utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT,
  localisation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parcelles
CREATE TABLE parcelles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  nom TEXT,
  lat FLOAT,
  lng FLOAT,
  superficie FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diagnostics
CREATE TABLE diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcelle_id UUID REFERENCES parcelles(id),
  texture JSONB,          -- { argile, limon, sable }
  classification TEXT,
  ph FLOAT,
  npk JSONB,              -- { N, P, K }
  cultures_recommandees JSONB,
  historique JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🛠 Prochaines étapes

- [ ] Authentification Supabase Auth
- [ ] Intégration vraie API SoilGrids
- [ ] Modèle MobileNetV2 fine-tuné sur textures sol africain
- [ ] Mode hors-ligne avec stockage local (expo-sqlite)
- [ ] Génération PDF du rapport (expo-print)
- [ ] Notifications push (expo-notifications)

---

*AgroScan IA · Développé pour l'agriculture africaine*
