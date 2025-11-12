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
import { loginSchema, type LoginFormData } from '../lib/validations';
import { typography, borderRadius, spacing } from '../lib/theme';

interface LoginScreenProps {
  onSignUp: () => void;
  onLogin: (credentials: { email: string; password: string }) => void;
  onForgotPassword: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSignUp, onLogin, onForgotPassword }) => {
  const { signIn } = useSupabaseAuth();
  const { colors } = useTheme();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
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
      marginBottom: spacing.xl,
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
    forgotPasswordContainer: {
      alignSelf: 'flex-end',
      marginBottom: spacing.xxxl,
    },
    forgotPasswordText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    loginButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.medium,
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    loginButtonText: {
      ...typography.button,
      color: colors.surface,
    },
    signUpContainer: {
      alignItems: 'center',
    },
    signUpText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    signUpLink: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    inputError: {
      borderColor: colors.error,
      borderWidth: 1,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: spacing.xs,
      marginBottom: spacing.sm,
    },
  });

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Partial<LoginFormData> = {};
      error.errors.forEach((err: any) => {
        validationErrors[err.path[0] as keyof LoginFormData] = err.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        // Navigation will be handled by auth state change
        onLogin({ email: formData.email, password: formData.password });
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
        <Text style={dynamicStyles.title}>Welcome Back</Text>
        <Text style={dynamicStyles.subtitle}>Sign in to your Framez account</Text>
      </View>

      {/* Input Fields */}
      <View style={dynamicStyles.inputContainer}>
        <TextInput
          style={[dynamicStyles.input, errors.email && dynamicStyles.inputError]}
          placeholder="Email"
          placeholderTextColor={colors.inputPlaceholder}
          value={formData.email}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, email: value }));
            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errors.email && <Text style={dynamicStyles.errorText}>{errors.email}</Text>}

        <TextInput
          style={[dynamicStyles.input, errors.password && dynamicStyles.inputError]}
          placeholder="Password"
          placeholderTextColor={colors.inputPlaceholder}
          value={formData.password}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, password: value }));
            if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
          }}
          secureTextEntry
          autoCapitalize="none"
        />
        {errors.password && <Text style={dynamicStyles.errorText}>{errors.password}</Text>}
      </View>

      {/* Forgot Password */}
      <TouchableOpacity style={dynamicStyles.forgotPasswordContainer} onPress={onForgotPassword}>
        <Text style={dynamicStyles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[dynamicStyles.loginButton, loading && dynamicStyles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={dynamicStyles.loginButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Sign Up Link */}
      <TouchableOpacity style={dynamicStyles.signUpContainer} onPress={onSignUp}>
        <Text style={dynamicStyles.signUpText}>
          Don't have an account? <Text style={dynamicStyles.signUpLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
  // No static styles needed for LoginScreen
});

export default LoginScreen;