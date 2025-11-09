import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
// import { useMutation } from 'convex/react';
// import { api } from '../../convex/_generated/api';
import * as ImagePicker from 'expo-image-picker';

const CreatePostScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
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
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, simulate post creation
      console.log('Creating post:', {
        content: content.trim(),
        imageUrl: imageUri,
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Post created successfully!');
      setContent('');
      setImageUri(null);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Post</Text>

      <TextInput
        style={styles.textInput}
        placeholder="What's on your mind?"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
      />

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      )}

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>
          {imageUri ? 'Change Image' : 'Add Image'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.postButton, loading && styles.buttonDisabled]}
        onPress={handleCreatePost}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.postButtonText}>Post</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  imageButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  imageButtonText: {
    color: '#333',
    fontSize: 16,
  },
  postButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreatePostScreen;