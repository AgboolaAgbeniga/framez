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
import { signUpSchema, type SignUpFormData } from '../lib/validations';
import { uploadAvatar, validateFile } from '../lib/storage';

interface SignUpScreenProps {
  onSignIn: () => void;
  onSignUp: (userData: any) => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignIn, onSignUp }) => {
  const { signUp } = useSupabaseAuth();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
  const [loading, setLoading] = useState(false);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Framez and start connecting</Text>
      </View>

      {/* Profile Picture Upload */}
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
        <View style={styles.cameraIcon}>
          <Text style={styles.cameraText}>📷</Text>
        </View>
      </TouchableOpacity>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, name: value }));
            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
          }}
          autoCapitalize="words"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

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

        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, confirmPassword: value }));
            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
          }}
          secureTextEntry
          autoCapitalize="none"
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[styles.signUpButton, loading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      {/* Sign In Link */}
      <TouchableOpacity style={styles.signInContainer} onPress={onSignIn}>
        <Text style={styles.signInText}>
          Already have an account? <Text style={styles.signInLink}>Sign In</Text>
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
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 30,
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
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00A8A8',
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
    marginBottom: 30,
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
  signUpButton: {
    backgroundColor: '#006175',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInContainer: {
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
    color: '#666',
  },
  signInLink: {
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

export default SignUpScreen;