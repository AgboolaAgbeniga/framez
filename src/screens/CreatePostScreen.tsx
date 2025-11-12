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
import { useTheme } from '../context/ThemeContext';
import { typography, borderRadius, spacing } from '../lib/theme';
import { createPostSchema, type CreatePostFormData } from '../lib/validations';
import { uploadPostImage, validateFile } from '../lib/storage';
import { useCreatePost, useProfile } from '../lib/queries';
import { addToUploadQueue } from '../lib/backgroundUpload';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import FastImage from '../components/FastImage';



const CreatePostScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useSupabaseAuth();
  const { colors } = useTheme();
  const createPostMutation = useCreatePost();
  const queryClient = useQueryClient();
  const { data: userProfile } = useProfile(user?.id || '');
  const [formData, setFormData] = useState<CreatePostFormData>({
    content: '',
  });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<CreatePostFormData>>({});
  const [loading, setLoading] = useState(false);

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 15,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    headerIcon: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      ...typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
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
      ...typography.body,
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    userSubtext: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.accent, // accent border as per styleguide
      borderRadius: borderRadius.medium,
      padding: spacing.lg,
      fontSize: 14,
      marginBottom: 20,
      minHeight: 120,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    uploadArea: {
      borderWidth: 2,
      borderColor: colors.inputBorder,
      borderStyle: 'dashed',
      borderRadius: borderRadius.medium,
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      backgroundColor: colors.surface,
    },
    uploadText: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: 10,
    },
    imagePreviewContainer: {
      position: 'relative',
      marginBottom: 20,
    },
    previewImage: {
      width: '100%',
      height: 250,
      borderRadius: borderRadius.medium,
    },
    removeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: colors.cardShadow,
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
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingBottom: 30, // Account for bottom safe area
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.surface, // surface background as per styleguide
      borderRadius: borderRadius.medium,
      padding: spacing.lg,
      alignItems: 'center',
      marginRight: 10,
    },
    cancelButtonText: {
      ...typography.button,
      color: colors.textSecondary,
    },
    postButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.medium,
      padding: spacing.lg,
      alignItems: 'center',
      marginLeft: 10,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    postButtonText: {
      ...typography.button,
      color: '#FFFFFF',
    },
    inputError: {
      borderColor: colors.error,
      borderWidth: 1,
    },
    errorText: {
      ...typography.caption,
      color: colors.error,
      marginTop: 4,
      marginBottom: 8,
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

      // If there's an image, upload it immediately for web compatibility
      if (imageUri && createdPost?.id) {
        try {
          console.log('Uploading image immediately...');
          // Validate file before uploading
          const validation = await validateFile(imageUri);
          if (!validation.valid) {
            console.error('File validation failed:', validation.error);
            Alert.alert('Warning', `Post created but image upload failed: ${validation.error}`);
          } else {
            console.log('File validation passed, uploading...');
            // Upload immediately instead of queuing
            const uploadResult = await uploadPostImage(user.id, imageUri);
            console.log('Upload result:', uploadResult);

            if (uploadResult.success && uploadResult.data?.publicUrl) {
              console.log('Upload successful, updating post with image URL:', uploadResult.data.publicUrl);
              // Update the post with the real image URL
              const { error: updateError } = await supabase
                .from('posts')
                .update({
                  image_urls: [uploadResult.data.publicUrl]
                })
                .eq('id', createdPost.id);

              if (updateError) {
                console.error('Failed to update post with image URL:', updateError);
                Alert.alert('Warning', 'Post created but image may not display properly');
              } else {
                console.log('Image uploaded and post updated successfully');
                // Invalidate queries to refresh the feed
                queryClient.invalidateQueries({ queryKey: ['posts'] });
              }
            } else {
              console.error('Image upload failed:', uploadResult.error);
              Alert.alert('Warning', 'Post created but image upload failed');
            }
          }
        } catch (uploadError) {
          console.warn('Failed to upload image:', uploadError);
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
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.headerIcon}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Create Post</Text>
        <View style={dynamicStyles.headerIcon} />
      </View>

      <ScrollView style={dynamicStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* User Info Row */}
        <View style={dynamicStyles.userInfoRow}>
          <FastImage
            source={{
              uri: userProfile?.avatar_url || 'https://avatar.iran.liara.run/public/boy',
            }}
            style={dynamicStyles.userAvatar}
          />
          <View style={dynamicStyles.userInfo}>
            <Text style={dynamicStyles.username}>{userProfile?.display_name || user?.user_metadata?.name || 'Demo User'}</Text>
            <Text style={dynamicStyles.userSubtext}>What's on your mind?</Text>
          </View>
        </View>

        {/* Post Input Area */}
        <TextInput
          style={[dynamicStyles.textInput, errors.content && dynamicStyles.inputError]}
          placeholder="Write a caption..."
          placeholderTextColor={colors.inputPlaceholder}
          value={formData.content}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, content: value }));
            if (errors.content) setErrors(prev => ({ ...prev, content: undefined }));
          }}
          multiline
          numberOfLines={6}
        />
        {errors.content && <Text style={dynamicStyles.errorText}>{errors.content}</Text>}

        {/* Media Upload Area */}
        {!imageUri ? (
          <TouchableOpacity style={dynamicStyles.uploadArea} onPress={pickImage}>
            <MaterialIcons name="photo-camera" size={48} color={colors.textSecondary} />
            <Text style={dynamicStyles.uploadText}>Tap to upload media</Text>
          </TouchableOpacity>
        ) : (
          <View style={dynamicStyles.imagePreviewContainer}>
            <FastImage source={{ uri: imageUri }} style={dynamicStyles.previewImage} />
            <TouchableOpacity style={dynamicStyles.removeButton} onPress={removeImage}>
              <MaterialIcons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={dynamicStyles.actionButtonsContainer}>
        <TouchableOpacity style={dynamicStyles.cancelButton} onPress={handleCancel}>
          <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.postButton, loading && dynamicStyles.buttonDisabled]}
          onPress={handleCreatePost}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={dynamicStyles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>


    </View>
  );
};


export default CreatePostScreen;