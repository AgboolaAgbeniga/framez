import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useTheme } from '../context/ThemeContext';
import { signUpSchema, type SignUpFormData } from '../lib/validations';
import { uploadAvatar, validateFile } from '../lib/storage';
import { typography, borderRadius, spacing } from '../lib/theme';

interface SignUpScreenProps {
  onSignIn: () => void;
  onSignUp: (userData: any) => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignIn, onSignUp }) => {
  const { signUp } = useSupabaseAuth();
  const { colors } = useTheme();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
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
    imageContainer: {
      alignSelf: 'center',
      marginBottom: spacing.xxxl,
      position: 'relative',
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    placeholderImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      color: colors.inputPlaceholder,
      fontSize: 16,
    },
    cameraIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraText: {
      fontSize: 18,
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
    signUpButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.medium,
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    signUpButtonText: {
      ...typography.button,
      color: colors.surface,
    },
    signInContainer: {
      alignItems: 'center',
    },
    signInText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    signInLink: {
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const validateForm = (): boolean => {
    try {
      signUpSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Partial<SignUpFormData> = {};
      error.errors.forEach((err: any) => {
        validationErrors[err.path[0] as keyof SignUpFormData] = err.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Generate username from name
      const username = formData.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);

      // Upload profile image if provided
      let avatarUrl = null;
      if (profileImage) {
        // Validate file before upload
        const validation = await validateFile(profileImage);
        if (!validation.valid) {
          Alert.alert('Error', validation.error);
          setLoading(false);
          return;
        }

        // Upload to Supabase Storage (we'll get user ID after signup)
        // For now, we'll handle this after account creation
      }

      const result = await signUp(formData.email, formData.password, {
        name: formData.name.trim(),
        username: username,
      });

      if (result.error) {
        Alert.alert('Sign Up Failed', result.error.message);
      } else {
        // Note: Profile image upload is handled in the SupabaseAuthContext
        // The context creates the profile with the generated avatar URL

        Alert.alert('Success', 'Account created successfully! Please check your email to verify your account.');
        onSignUp({ name: formData.name, email: formData.email, password: formData.password, profileImage });
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
        <Text style={dynamicStyles.title}>Create Account</Text>
        <Text style={dynamicStyles.subtitle}>Join Framez and start connecting</Text>
      </View>

      {/* Profile Picture Upload */}
      <TouchableOpacity style={dynamicStyles.imageContainer} onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={staticStyles.profileImage} />
        ) : (
          <View style={dynamicStyles.placeholderImage}>
            <Text style={dynamicStyles.placeholderText}>Add Photo</Text>
          </View>
        )}
        <View style={dynamicStyles.cameraIcon}>
          <Text style={staticStyles.cameraText}>📷</Text>
        </View>
      </TouchableOpacity>

      {/* Input Fields */}
      <View style={dynamicStyles.inputContainer}>
        <TextInput
          style={[dynamicStyles.input, errors.name && dynamicStyles.inputError]}
          placeholder="Full Name"
          placeholderTextColor={colors.inputPlaceholder}
          value={formData.name}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, name: value }));
            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
          }}
          autoCapitalize="words"
        />
        {errors.name && <Text style={dynamicStyles.errorText}>{errors.name}</Text>}

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

        <TextInput
          style={[dynamicStyles.input, errors.confirmPassword && dynamicStyles.inputError]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.inputPlaceholder}
          value={formData.confirmPassword}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, confirmPassword: value }));
            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
          }}
          secureTextEntry
          autoCapitalize="none"
        />
        {errors.confirmPassword && <Text style={dynamicStyles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[dynamicStyles.signUpButton, loading && dynamicStyles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={dynamicStyles.signUpButtonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      {/* Sign In Link */}
      <TouchableOpacity style={dynamicStyles.signInContainer} onPress={onSignIn}>
        <Text style={dynamicStyles.signInText}>
          Already have an account? <Text style={dynamicStyles.signInLink}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraText: {
    fontSize: 18,
  },
});

export default SignUpScreen;