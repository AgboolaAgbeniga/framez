import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../lib/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 5000); // Show splash for 5 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    circle: {
      position: 'absolute',
      borderRadius: 50,
      backgroundColor: colors.primary,
    },
    plus: {
      position: 'absolute',
      width: 20,
      height: 20,
      backgroundColor: colors.secondary,
    },
    rectangle: {
      position: 'absolute',
      width: 25,
      height: 15,
      backgroundColor: colors.accent,
    },
    square: {
      position: 'absolute',
      width: 18,
      height: 18,
      backgroundColor: colors.primary,
    },
    star: {
      position: 'absolute',
      width: 22,
      height: 22,
      backgroundColor: colors.secondary,
    },
    appName: {
      ...typography.appName,
      color: colors.textPrimary,
      textAlign: 'center',
      // Gradient from primary to secondary - would need LinearGradient component for full gradient
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Circular shapes */}
      <View style={[dynamicStyles.circle, { top: height * 0.1, left: width * 0.1, width: 60, height: 60 }]} />
      <View style={[dynamicStyles.circle, { top: height * 0.2, right: width * 0.15, width: 40, height: 40 }]} />
      <View style={[dynamicStyles.circle, { top: height * 0.4, left: width * 0.2, width: 50, height: 50 }]} />
      <View style={[dynamicStyles.circle, { bottom: height * 0.3, right: width * 0.1, width: 45, height: 45 }]} />
      <View style={[dynamicStyles.circle, { bottom: height * 0.2, left: width * 0.15, width: 55, height: 55 }]} />
      <View style={[dynamicStyles.circle, { bottom: height * 0.1, right: width * 0.2, width: 35, height: 35 }]} />

      {/* Tiny shapes */}
      <View style={[dynamicStyles.plus, { top: height * 0.15, left: width * 0.5 }]} />
      <View style={[dynamicStyles.rectangle, { top: height * 0.25, right: width * 0.3 }]} />
      <View style={[dynamicStyles.square, { top: height * 0.35, left: width * 0.3 }]} />
      <View style={[dynamicStyles.star, { bottom: height * 0.25, left: width * 0.4 }]} />
      <View style={[dynamicStyles.plus, { bottom: height * 0.15, right: width * 0.4 }]} />
      <View style={[dynamicStyles.star, { top: height * 0.45, right: width * 0.5 }]} />

      {/* App name */}
      <Text style={dynamicStyles.appName}>Framez</Text>
    </View>
  );
};

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
  // No static styles needed for SplashScreen
});

export default SplashScreen;