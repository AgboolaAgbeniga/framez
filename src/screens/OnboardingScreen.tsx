import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { typography, borderRadius, spacing } from '../lib/theme';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
  onSignIn: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish, onSignIn }) => {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xxxl,
    },
    illustrationContainer: {
      marginBottom: spacing.xxxl,
    },
    illustration: {
      fontSize: 100,
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
      lineHeight: 24,
      marginBottom: spacing.xxxl,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: spacing.xxxl,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: borderRadius.small,
      backgroundColor: colors.inputBorder,
      marginHorizontal: spacing.xs,
    },
    activeDot: {
      backgroundColor: colors.primary,
      width: 24,
    },
    buttonContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: spacing.xl,
    },
    skipButton: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: borderRadius.medium,
      width: width * 0.8,
      maxWidth: 321,
    },
    skipText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    nextButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.medium,
      marginBottom: spacing.sm,
      width: width * 0.8,
      maxWidth: 321,
    },
    nextText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    signInContainer: {
      marginTop: spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
    },
    signInText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    signInLink: {
      color: colors.primary,
      fontSize: 14,
      textDecorationLine: 'underline',
    },
  });

  const screens = [
    {
      title: 'Connect with Friends and Family',
      subtitle: 'Connecting with family and friends provides a sense of belonging and security.',
      illustration: '👥', // Placeholder for illustration
    },
    {
      title: 'Make New Friends with Ease',
      subtitle: 'Allowing you to make new friends is our number one priority.',
      illustration: '🤝', // Placeholder for illustration
    },
    {
      title: 'Express Yourself to the World',
      subtitle: 'Let your voice be heard through the FRAMEZ features on the app without restrictions.',
      illustration: '📣', // Placeholder for illustration
    },
  ];

  const handleNext = () => {
    if (currentStep < screens.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const renderDots = () => {
    return (
      <View style={dynamicStyles.dotsContainer}>
        {screens.map((_, index) => (
          <View
            key={index}
            style={[
              dynamicStyles.dot,
              index === currentStep && dynamicStyles.activeDot,
            ]}
          />
        ))}
      </View>
    );
  };

  const currentScreen = screens[currentStep];

  return (
    <View style={dynamicStyles.container}>
      <ScrollView contentContainerStyle={dynamicStyles.scrollContainer}>
        {/* Illustration */}
        <View style={dynamicStyles.illustrationContainer}>
          <Text style={staticStyles.illustration}>{currentScreen.illustration}</Text>
        </View>

        {/* Title */}
        <Text style={dynamicStyles.title}>{currentScreen.title}</Text>

        {/* Subtitle */}
        <Text style={dynamicStyles.subtitle}>{currentScreen.subtitle}</Text>

        {/* Dots */}
        {renderDots()}

        {/* Buttons */}
        <View style={dynamicStyles.buttonContainer}>
          <TouchableOpacity style={dynamicStyles.nextButton} onPress={handleNext}>
            <Text style={dynamicStyles.nextText}>
              {currentStep === screens.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
          {currentStep < screens.length - 1 && (
            <TouchableOpacity style={dynamicStyles.skipButton} onPress={handleSkip}>
              <Text style={dynamicStyles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sign in text */}
        <View style={dynamicStyles.signInContainer}>
          <Text style={dynamicStyles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={onSignIn}>
            <Text style={dynamicStyles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
  illustration: {
    fontSize: 100,
  },
});

export default OnboardingScreen;