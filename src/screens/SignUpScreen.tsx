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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface SignUpScreenProps {
  onSignIn: () => void;
  onSignUp: (userData: any) => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignIn, onSignUp }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  const handleSignUp = () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    onSignUp({ name, email, password, profileImage });
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
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

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

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpButtonText}>Sign Up</Text>
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
});

export default SignUpScreen;