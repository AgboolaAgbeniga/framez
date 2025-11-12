import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SupabaseAuthProvider } from './src/context/SupabaseAuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { queryClient } from './src/lib/queryClient';
import { initializeBackgroundUpload } from './src/lib/backgroundUpload';

export default function App() {
  console.log('App component rendering');

  useEffect(() => {
    // Initialize background upload service
    initializeBackgroundUpload();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}
