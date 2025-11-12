import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useTheme } from '../context/ThemeContext';
import { typography, borderRadius, spacing } from '../lib/theme';

interface ForgotPasswordScreenProps {
  onSendOTP: (email: string) => void;
  onBackToLogin: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onSendOTP, onBackToLogin }) => {
  const { resetPassword } = useSupabaseAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xxxl,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    title: {
      ...typography.headline,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    subtitle: {
      ...typography.subtitle,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: spacing.xxxl,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: borderRadius.medium,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    sendButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.medium,
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    sendButtonText: {
      ...typography.button,
      color: '#FFFFFF',
    },
    backContainer: {
      alignItems: 'center',
    },
    backText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '500',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });

  const handleSendOTP = async () => {
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

    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Reset Email Sent',
          'Check your email for password reset instructions.',
          [{ text: 'OK', onPress: () => onSendOTP(email) }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.scrollContainer}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Forgot Password</Text>
        <Text style={dynamicStyles.subtitle}>Enter your email address and we'll send you a verification code</Text>
      </View>

      {/* Email Input */}
      <View style={dynamicStyles.inputContainer}>
        <TextInput
          style={dynamicStyles.input}
          placeholder="Email"
          placeholderTextColor={colors.inputPlaceholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Send OTP Button */}
      <TouchableOpacity
        style={[dynamicStyles.sendButton, loading && dynamicStyles.buttonDisabled]}
        onPress={handleSendOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={dynamicStyles.sendButtonText}>Send Reset Email</Text>
        )}
      </TouchableOpacity>

      {/* Back to Login */}
      <TouchableOpacity style={dynamicStyles.backContainer} onPress={onBackToLogin}>
        <Text style={dynamicStyles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
  // No static styles needed for ForgotPasswordScreen
});

export default ForgotPasswordScreen;