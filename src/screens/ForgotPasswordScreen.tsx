import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

interface ForgotPasswordScreenProps {
  onSendOTP: (email: string) => void;
  onBackToLogin: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onSendOTP, onBackToLogin }) => {
  const [email, setEmail] = useState('');

  const handleSendOTP = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    onSendOTP(email);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email address and we'll send you a verification code</Text>
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Send OTP Button */}
      <TouchableOpacity style={styles.sendButton} onPress={handleSendOTP}>
        <Text style={styles.sendButtonText}>Send Verification Code</Text>
      </TouchableOpacity>

      {/* Back to Login */}
      <TouchableOpacity style={styles.backContainer} onPress={onBackToLogin}>
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  sendButton: {
    backgroundColor: '#006175',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backContainer: {
    alignItems: 'center',
  },
  backText: {
    color: '#006175',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;