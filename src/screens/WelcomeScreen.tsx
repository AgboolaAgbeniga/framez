import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  userName: string;
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName, onContinue }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Welcome Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.welcomeIcon}>🎉</Text>
        </View>

        {/* Welcome Message */}
        <Text style={styles.title}>Welcome to Framez!</Text>
        <Text style={styles.subtitle}>
          Hi {userName}! Your account has been created successfully.
        </Text>
        <Text style={styles.description}>
          We've sent a confirmation email to your inbox. You're now ready to start connecting and sharing with the Framez community!
        </Text>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Continue to Framez</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 30,
  },
  welcomeIcon: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#006175',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    width: width * 0.8,
    maxWidth: 321,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;