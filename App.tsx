import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SupabaseAuthProvider } from './src/context/SupabaseAuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  console.log('App component rendering');
  return (
    <SupabaseAuthProvider>
      <AppNavigator />
      <StatusBar style="dark" />
    </SupabaseAuthProvider>
  );
}
