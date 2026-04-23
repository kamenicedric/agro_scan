import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme';

import LoginScreen          from '../screens/auth/LoginScreen';
import RegisterScreen       from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

import GeolocationScreen  from '../screens/GeolocationScreen';
import HistoryScreen      from '../screens/HistoryScreen';
import CameraScreen       from '../screens/CameraScreen';
import AnalysisScreen     from '../screens/AnalysisScreen';
import ResultsScreen      from '../screens/ResultsScreen';
import ProfileScreen      from '../screens/ProfileScreen';

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
      <AppStack.Screen name="Geolocation" component={GeolocationScreen} />
      <AppStack.Screen name="History"     component={HistoryScreen} />
      <AppStack.Screen name="Camera"      component={CameraScreen} />
      <AppStack.Screen name="Analysis"    component={AnalysisScreen} />
      <AppStack.Screen name="Results"     component={ResultsScreen} />
      <AppStack.Screen name="Profile"     component={ProfileScreen} />
    </AppStack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();
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
