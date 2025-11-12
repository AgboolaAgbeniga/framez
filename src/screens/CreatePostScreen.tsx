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
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { createPostSchema, type CreatePostFormData } from '../lib/validations';
import { uploadPostImage, validateFile } from '../lib/storage';
import { useCreatePost } from '../lib/queries';
import { addToUploadQueue } from '../lib/backgroundUpload';
import FastImage from '../components/FastImage';



const CreatePostScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useSupabaseAuth();
  const createPostMutation = useCreatePost();
  const [formData, setFormData] = useState<CreatePostFormData>({
    content: '',
  });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<CreatePostFormData>>({});
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

  const removeImage = () => {
    setImageUri(null);
  };

  const validateForm = (): boolean => {
    try {
      createPostSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Partial<CreatePostFormData> = {};
      error.errors.forEach((err: any) => {
        validationErrors[err.path[0] as keyof CreatePostFormData] = err.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleCreatePost = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    setLoading(true);
    try {
      let imageUrls: string[] = [];
      let createdPost: any = null;

      // Create the post first (without image initially)
      createdPost = await createPostMutation.mutateAsync({
        content: formData.content.trim(),
        imageUrls: [],
        visibility: 'public',
      });

      // If there's an image, queue it for background upload
      if (imageUri && createdPost?.id) {
        try {
          // Validate file before queuing
          const validation = await validateFile(imageUri);
          if (!validation.valid) {
            Alert.alert('Warning', `Post created but image upload failed: ${validation.error}`);
          } else {
            // Add to background upload queue
            await addToUploadQueue({
              id: `upload_${createdPost.id}_${Date.now()}`,
              userId: user.id,
              localUri: imageUri,
              postId: createdPost.id,
              timestamp: Date.now(),
            });

            console.log('Image queued for background upload');
          }
        } catch (queueError) {
          console.warn('Failed to queue image upload:', queueError);
          Alert.alert('Warning', 'Post created but image may not upload properly');
        }
      }

      Alert.alert('Success', 'Post created successfully!');
      setFormData({ content: '' });
      setImageUri(null);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <View style={styles.headerIcon} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* User Info Row */}
        <View style={styles.userInfoRow}>
          <Image
            source={{
              uri: 'https://avatar.iran.liara.run/public/boy', // TODO: Get from profile
            }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user?.user_metadata?.name || 'Demo User'}</Text>
            <Text style={styles.userSubtext}>What's on your mind?</Text>
          </View>
        </View>

        {/* Post Input Area */}
        <TextInput
          style={[styles.textInput, errors.content && styles.inputError]}
          placeholder="Write a caption..."
          value={formData.content}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, content: value }));
            if (errors.content) setErrors(prev => ({ ...prev, content: undefined }));
          }}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        {errors.content && <Text style={styles.errorText}>{errors.content}</Text>}

        {/* Media Upload Area */}
        {!imageUri ? (
          <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
            <MaterialIcons name="photo-camera" size={48} color="#8E8E93" />
            <Text style={styles.uploadText}>Tap to upload media</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.imagePreviewContainer}>
            <FastImage source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
              <MaterialIcons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
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

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  userSubtext: {
    fontSize: 12,
    color: '#8E8E93',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
  },
  uploadText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 10,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 30, // Account for bottom safe area
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  postButton: {
    flex: 1,
    backgroundColor: '#006175',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 25, // Account for safe area
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

export default CreatePostScreen;