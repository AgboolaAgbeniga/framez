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
import { loginSchema, type LoginFormData } from '../lib/validations';

interface LoginScreenProps {
  onSignUp: () => void;
  onLogin: (credentials: { email: string; password: string }) => void;
  onForgotPassword: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSignUp, onLogin, onForgotPassword }) => {
  const { signIn } = useSupabaseAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [loading, setLoading] = useState(false);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your Framez account</Text>
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, email: value }));
            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Password"
          value={formData.password}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, password: value }));
            if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
          }}
          secureTextEntry
          autoCapitalize="none"
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotPasswordContainer} onPress={onForgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.loginButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Sign Up Link */}
      <TouchableOpacity style={styles.signUpContainer} onPress={onSignUp}>
        <Text style={styles.signUpText}>
          Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
        </Text>
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
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#00A8A8',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#006175',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpContainer: {
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: '#666',
  },
  signUpLink: {
    color: '#00A8A8',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
});

export default LoginScreen;