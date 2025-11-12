import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useTheme } from '../context/ThemeContext';
import { typography, borderRadius, spacing } from '../lib/theme';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useSupabaseAuth();
  const { colors } = useTheme();

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.xl,
      backgroundColor: colors.background,
    },
    title: {
      ...typography.headline,
      textAlign: 'center',
      marginBottom: spacing.sm,
      color: colors.textPrimary,
    },
    subtitle: {
      ...typography.subtitle,
      textAlign: 'center',
      marginBottom: spacing.xxxl,
      color: colors.textSecondary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: borderRadius.medium,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.medium,
      padding: spacing.lg,
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      ...typography.button,
      color: '#FFFFFF',
    },
    switchButton: {
      alignItems: 'center',
    },
    switchText: {
      ...typography.body,
      color: colors.primary,
      fontSize: 16,
    },
  });
  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const result = await signIn(email, password);
        if (result.error) {
          throw new Error(result.error.message);
        }
      } else {
        const result = await signUp(email, password, { name, username: '' }); // Username will be auto-generated from display name
        if (result.error) {
          throw new Error(result.error.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Framez</Text>
      <Text style={dynamicStyles.subtitle}>
        {isLogin ? 'Welcome back!' : 'Join the community'}
      </Text>

      {!isLogin && (
        <TextInput
          style={dynamicStyles.input}
          placeholder="Full Name"
          placeholderTextColor={colors.inputPlaceholder}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}

      <TextInput
        style={dynamicStyles.input}
        placeholder="Email"
        placeholderTextColor={colors.inputPlaceholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={dynamicStyles.input}
        placeholder="Password"
        placeholderTextColor={colors.inputPlaceholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[dynamicStyles.button, loading && dynamicStyles.buttonDisabled]}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={dynamicStyles.buttonText}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={dynamicStyles.switchButton}
        onPress={() => setIsLogin(!isLogin)}
      >
        <Text style={dynamicStyles.switchText}>
          {isLogin
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Sign In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};


export default AuthScreen;