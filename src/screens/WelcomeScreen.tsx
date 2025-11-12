import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { typography, borderRadius, spacing } from '../lib/theme';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  userName: string;
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName, onContinue }) => {
  const { colors } = useTheme();

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    content: {
      alignItems: 'center',
      maxWidth: 400,
    },
    iconContainer: {
      marginBottom: spacing.xxxl,
    },
    welcomeIcon: {
      fontSize: 80,
    },
    title: {
      ...typography.headline,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    subtitle: {
      ...typography.subtitle,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
      lineHeight: 24,
    },
    description: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.xxxl,
    },
    continueButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.medium,
      alignItems: 'center',
      width: width * 0.8,
      maxWidth: 321,
    },
    continueButtonText: {
      ...typography.button,
      color: '#FFFFFF',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.content}>
        {/* Welcome Icon */}
        <View style={dynamicStyles.iconContainer}>
          <Text style={staticStyles.welcomeIcon}>🎉</Text>
        </View>

        {/* Welcome Message */}
        <Text style={dynamicStyles.title}>Welcome to Framez!</Text>
        <Text style={dynamicStyles.subtitle}>
          Hi {userName}! Your account has been created successfully.
        </Text>
        <Text style={dynamicStyles.description}>
          We've sent a confirmation email to your inbox. You're now ready to start connecting and sharing with the Framez community!
        </Text>

        {/* Continue Button */}
        <TouchableOpacity style={dynamicStyles.continueButton} onPress={onContinue}>
          <Text style={dynamicStyles.continueButtonText}>Continue to Framez</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
  welcomeIcon: {
    fontSize: 80,
  },
});

export default WelcomeScreen;