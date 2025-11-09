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

interface LoginScreenProps {
  onSignUp: () => void;
  onLogin: (credentials: { email: string; password: string }) => void;
  onForgotPassword: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSignUp, onLogin, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    onLogin({ email, password });
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
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotPasswordContainer} onPress={onForgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Sign In</Text>
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
});

export default LoginScreen;