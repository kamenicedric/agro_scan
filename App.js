import 'react-native-url-polyfill/auto';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import RootNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#1a4a2e" />
      <View style={styles.container}>
        <View style={styles.brandBar}>
          <Image
            source={require('./assets/android-chrome-192x192.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandText}>AgroScan IA</Text>
        </View>
        <View style={styles.content}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f2',
  },
  brandBar: {
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: '#1a4a2e',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  brandText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
