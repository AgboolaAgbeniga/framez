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
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { typography, borderRadius, spacing } from '../lib/theme';

interface ResetPasswordScreenProps {
  onResetPassword: (newPassword: string, confirmPassword: string) => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onResetPassword }) => {
  const { colors } = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      marginBottom: spacing.lg,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    resetButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.medium,
      alignItems: 'center',
    },
    resetButtonText: {
      ...typography.button,
      color: '#FFFFFF',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Password updated successfully!', [
          { text: 'OK', onPress: () => onResetPassword(newPassword, confirmPassword) }
        ]);
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
        <Text style={dynamicStyles.title}>Reset Password</Text>
        <Text style={dynamicStyles.subtitle}>Enter your new password below</Text>
      </View>

      {/* Password Inputs */}
      <View style={dynamicStyles.inputContainer}>
        <TextInput
          style={dynamicStyles.input}
          placeholder="New Password"
          placeholderTextColor={colors.inputPlaceholder}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TextInput
          style={dynamicStyles.input}
          placeholder="Confirm New Password"
          placeholderTextColor={colors.inputPlaceholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      {/* Reset Password Button */}
      <TouchableOpacity
        style={[dynamicStyles.resetButton, loading && dynamicStyles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={dynamicStyles.resetButtonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
  // No static styles needed for ResetPasswordScreen
});

export default ResetPasswordScreen;