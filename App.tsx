import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SupabaseAuthProvider } from './src/context/SupabaseAuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { queryClient } from './src/lib/queryClient';
import { initializeBackgroundUpload } from './src/lib/backgroundUpload';

// Load fonts
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  Inter_400Regular,
} from '@expo-google-fonts/inter';

function AppContent() {
  const { colors, theme } = useTheme();

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'Inter-Regular': Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }

  console.log('App component rendering');
  return (
    <>
      <AppNavigator />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize background upload service
    initializeBackgroundUpload();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SupabaseAuthProvider>
          <AppContent />
        </SupabaseAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
