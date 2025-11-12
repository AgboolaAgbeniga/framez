import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

// Storage bucket names
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  POSTS: 'posts',
  MESSAGES: 'messages',
  STORIES: 'stories',
} as const;

/**
 * Upload a file to Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param file - The file to upload (URI for React Native)
 * @param fileOptions - Additional file options
 * @returns Promise with upload result
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: string, // URI in React Native
  fileOptions?: {
    contentType?: string;
    cacheControl?: string;
  }
) => {
  try {
    console.log('Starting file upload for:', file);

    // Check if we're in React Native (iOS or Android) or web
    const isReactNative = Platform.OS === 'ios' || Platform.OS === 'android';
    
    let uploadData: Blob | Uint8Array | ArrayBuffer;
    
    if (isReactNative) {
      // React Native environment - use FileSystem to read file
      console.log('Detected React Native environment, using FileSystem');
      const fileInfo = await FileSystem.getInfoAsync(file);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }
      
      // Read file as base64
      const base64Data = await FileSystem.readAsStringAsync(file, { encoding: 'base64' });
      console.log('File read as base64, length:', base64Data.length);
      
      // Convert base64 to Uint8Array (Supabase accepts this in React Native)
      // atob should be available in Expo/React Native (polyfilled)
      if (typeof atob === 'undefined') {
        throw new Error('atob is not available. Please ensure you are using a compatible React Native environment.');
      }
      
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      uploadData = bytes;
      console.log('Converted to Uint8Array, size:', bytes.length);
    } else {
      // Web environment - use fetch and blob
      console.log('Detected web environment, using fetch');
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      uploadData = await response.blob();
      console.log('Blob created, size:', (uploadData as Blob).size);
    }

    console.log('Uploading to Supabase storage...');
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, uploadData, {
        contentType: fileOptions?.contentType || 'image/jpeg',
        cacheControl: fileOptions?.cacheControl || '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    console.log('Upload successful, getting public URL...');
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    console.log('Public URL obtained:', urlData.publicUrl);
    return {
      success: true,
      data: {
        filePath: path,
        publicUrl: urlData.publicUrl,
        ...data,
      },
    };
  } catch (error) {
    console.error('File upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path to delete
 * @returns Promise with delete result
 */
export const deleteFile = async (bucket: string, path: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('File delete failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
};

/**
 * Upload profile avatar
 * @param userId - The user ID
 * @param fileUri - The image file URI
 * @returns Promise with upload result
 */
export const uploadAvatar = async (userId: string, fileUri: string) => {
  const fileName = `${Date.now()}.jpg`;
  const path = `${userId}/${fileName}`;

  const result = await uploadFile(STORAGE_BUCKETS.AVATARS, path, fileUri, {
    contentType: 'image/jpeg',
  });

  if (result.success) {
    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: result.data?.publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  return result;
};

/**
 * Get content type from file URI
 * @param fileUri - The file URI
 * @returns Content type string
 */
const getContentTypeFromUri = (fileUri: string): string => {
  const uriLower = fileUri.toLowerCase();
  if (uriLower.endsWith('.png')) {
    return 'image/png';
  } else if (uriLower.endsWith('.jpg') || uriLower.endsWith('.jpeg')) {
    return 'image/jpeg';
  } else if (uriLower.endsWith('.gif')) {
    return 'image/gif';
  } else if (uriLower.endsWith('.webp')) {
    return 'image/webp';
  }
  return 'image/jpeg'; // default
};

/**
 * Get file extension from URI
 * @param fileUri - The file URI
 * @returns File extension (without dot)
 */
const getFileExtension = (fileUri: string): string => {
  const uriLower = fileUri.toLowerCase();
  if (uriLower.endsWith('.png')) return 'png';
  if (uriLower.endsWith('.jpg') || uriLower.endsWith('.jpeg')) return 'jpg';
  if (uriLower.endsWith('.gif')) return 'gif';
  if (uriLower.endsWith('.webp')) return 'webp';
  return 'jpg'; // default
};

/**
 * Upload post image
 * @param userId - The user ID
 * @param fileUri - The image file URI
 * @returns Promise with upload result
 */
export const uploadPostImage = async (userId: string, fileUri: string) => {
  const extension = getFileExtension(fileUri);
  const fileName = `${Date.now()}.${extension}`;
  const path = `${userId}/${fileName}`;
  const contentType = getContentTypeFromUri(fileUri);

  return await uploadFile(STORAGE_BUCKETS.POSTS, path, fileUri, {
    contentType,
  });
};

/**
 * Upload message attachment
 * @param conversationId - The conversation ID
 * @param userId - The user ID
 * @param fileUri - The file URI
 * @param fileType - The file type ('image', 'video', etc.)
 * @returns Promise with upload result
 */
export const uploadMessageAttachment = async (
  conversationId: string,
  userId: string,
  fileUri: string,
  fileType: 'image' | 'video' | 'file' = 'image'
) => {
  const extension = fileType === 'image' ? 'jpg' : fileType === 'video' ? 'mp4' : 'file';
  const fileName = `${conversationId}_${Date.now()}.${extension}`;
  const path = `${userId}/${fileName}`;

  const contentType = fileType === 'image' ? 'image/jpeg' :
                     fileType === 'video' ? 'video/mp4' :
                     'application/octet-stream';

  return await uploadFile(STORAGE_BUCKETS.MESSAGES, path, fileUri, {
    contentType,
  });
};

/**
 * Upload story image
 * @param userId - The user ID
 * @param fileUri - The image file URI
 * @returns Promise with upload result
 */
export const uploadStoryImage = async (userId: string, fileUri: string) => {
  const fileName = `${Date.now()}.jpg`;
  const path = `${userId}/${fileName}`;

  return await uploadFile(STORAGE_BUCKETS.STORIES, path, fileUri, {
    contentType: 'image/jpeg',
  });
};

/**
 * Generate a unique file path
 * @param prefix - File prefix (e.g., 'avatar', 'post')
 * @param userId - User ID for namespacing
 * @param extension - File extension
 * @returns Unique file path
 */
export const generateFilePath = (
  prefix: string,
  userId: string,
  extension: string = 'jpg'
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}/${userId}_${timestamp}_${random}.${extension}`;
};

/**
 * Validate file size and type
 * @param fileUri - File URI to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateFile = async (
  fileUri: string,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): Promise<{ valid: boolean; error?: string }> => {
  try {
    const { maxSizeMB = 10, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'] } = options;
    const isReactNative = Platform.OS === 'ios' || Platform.OS === 'android';

    let fileSize: number;
    let mimeType: string;

    if (isReactNative) {
      // React Native: use FileSystem
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        return {
          valid: false,
          error: 'File does not exist',
        };
      }
      
      fileSize = fileInfo.size || 0;
      
      // Determine MIME type from file extension
      const uriLower = fileUri.toLowerCase();
      if (uriLower.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (uriLower.endsWith('.jpg') || uriLower.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (uriLower.endsWith('.gif')) {
        mimeType = 'image/gif';
      } else {
        mimeType = 'image/jpeg'; // default
      }
    } else {
      // Web: use fetch
      const response = await fetch(fileUri);
      if (!response.ok) {
        return {
          valid: false,
          error: 'Failed to fetch file for validation',
        };
      }
      const blob = await response.blob();
      fileSize = blob.size;
      mimeType = blob.type || 'image/jpeg';
    }

    // Check file size
    const sizeMB = fileSize / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return {
        valid: false,
        error: `File size must be less than ${maxSizeMB}MB. Current size: ${sizeMB.toFixed(2)}MB`,
      };
    }

    // Check file type (normalize mime types)
    const normalizedMimeType = mimeType.toLowerCase();
    const normalizedAllowedTypes = allowedTypes.map(t => t.toLowerCase());
    
    if (!normalizedAllowedTypes.includes(normalizedMimeType)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate file',
    };
  }
};