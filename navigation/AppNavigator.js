import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme';
import { markStartup } from '../utils/startupLogger';

import LoginScreen          from '../screens/auth/LoginScreen';
import RegisterScreen       from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const AuthStack = createNativeStackNavigator();
const AppStack  = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <AuthStack.Screen name="Login"          component={LoginScreen} />
      <AuthStack.Screen name="Register"       component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <AppStack.Navigator
      initialRouteName="Geolocation"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <AppStack.Screen
        name="Geolocation"
        getComponent={() => require('../screens/GeolocationScreen').default}
      />
      <AppStack.Screen
        name="History"
        getComponent={() => require('../screens/HistoryScreen').default}
      />
      <AppStack.Screen
        name="Camera"
        getComponent={() => require('../screens/CameraScreen').default}
      />
      <AppStack.Screen
        name="Analysis"
        getComponent={() => require('../screens/AnalysisScreen').default}
      />
      <AppStack.Screen
        name="Results"
        getComponent={() => require('../screens/ResultsScreen').default}
      />
      <AppStack.Screen
        name="Profile"
        getComponent={() => require('../screens/ProfileScreen').default}
      />
    </AppStack.Navigator>
  );
}

export default function RootNavigator({ onReady }) {
  const { user, loading } = useAuth();

  const hasNotifiedReady = useRef(false);

  useEffect(() => {
    if (loading || hasNotifiedReady.current) return;
    hasNotifiedReady.current = true;
    markStartup('Auth flow resolved', { hasUser: !!user });
    onReady?.();
  }, [loading, user, onReady]);



  if (loading) {
    return (
      <View style={{ flex:1, backgroundColor: Colors.primary, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator color={Colors.white} size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
