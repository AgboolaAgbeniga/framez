import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
  onSignIn: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish, onSignIn }) => {
  const [currentStep, setCurrentStep] = useState(0);

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
      <View style={styles.dotsContainer}>
        {screens.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentStep && styles.activeDot,
            ]}
          />
        ))}
      </View>
    );
  };

  const currentScreen = screens[currentStep];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustration}>{currentScreen.illustration}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{currentScreen.title}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{currentScreen.subtitle}</Text>

        {/* Dots */}
        {renderDots()}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>
              {currentStep === screens.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
          {currentStep < screens.length - 1 && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sign in text */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={onSignIn}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  illustrationContainer: {
    marginBottom: 40,
  },
  illustration: {
    fontSize: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter-Bold', // Assuming Inter is available
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    fontFamily: 'Inter-Regular',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#006175',
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    width: width * 0.8, // 80% of screen width
    maxWidth: 321, // Maximum width
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#006175',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 10,
    width: width * 0.8, // 80% of screen width
    maxWidth: 321, // Maximum width
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signInContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInText: {
    color: '#666',
    fontSize: 14,
  },
  signInLink: {
    color: '#006175',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;