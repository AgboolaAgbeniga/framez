import { supabase } from './supabase';

// Storage bucket names
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  POSTS: 'posts',
  MESSAGES: 'messages',
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
    // Convert URI to blob for upload
    const response = await fetch(file);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, blob, {
        contentType: fileOptions?.contentType || 'image/jpeg',
        cacheControl: fileOptions?.cacheControl || '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

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
  const fileName = `${userId}_${Date.now()}.jpg`;
  const path = `avatars/${fileName}`;

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
 * Upload post image
 * @param userId - The user ID
 * @param fileUri - The image file URI
 * @returns Promise with upload result
 */
export const uploadPostImage = async (userId: string, fileUri: string) => {
  const fileName = `${userId}_${Date.now()}.jpg`;
  const path = `posts/${fileName}`;

  return await uploadFile(STORAGE_BUCKETS.POSTS, path, fileUri, {
    contentType: 'image/jpeg',
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
  const fileName = `${conversationId}_${userId}_${Date.now()}.${extension}`;
  const path = `messages/${fileName}`;

  const contentType = fileType === 'image' ? 'image/jpeg' :
                     fileType === 'video' ? 'video/mp4' :
                     'application/octet-stream';

  return await uploadFile(STORAGE_BUCKETS.MESSAGES, path, fileUri, {
    contentType,
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
    const { maxSizeMB = 10, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'] } = options;

    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Check file size
    const sizeMB = blob.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return {
        valid: false,
        error: `File size must be less than ${maxSizeMB}MB. Current size: ${sizeMB.toFixed(2)}MB`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(blob.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate file',
    };
  }
};