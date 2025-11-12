import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadPostImage } from './storage';
import { supabase } from './supabase';

const UPLOAD_QUEUE_KEY = 'background_upload_queue';
const BACKGROUND_UPLOAD_TASK = 'background-upload-task';

// Types
interface UploadTask {
  id: string;
  userId: string;
  localUri: string;
  postId: string;
  timestamp: number;
  retryCount: number;
}

// Register background task
TaskManager.defineTask(BACKGROUND_UPLOAD_TASK, async () => {
  try {
    console.log('Background upload task started');

    // Get pending uploads
    const queue = await getUploadQueue();

    if (queue.length === 0) {
      console.log('No pending uploads');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Process uploads
    for (const task of queue) {
      try {
        console.log(`Processing upload for post ${task.postId}`);

        // Upload the image
        const result = await uploadPostImage(task.userId, task.localUri);

        if (result.success) {
          // Update the post with the real image URL
          const { error } = await supabase
            .from('posts')
            .update({
              image_urls: [result.data?.publicUrl]
            })
            .eq('id', task.postId);

          if (!error) {
            console.log(`Upload completed for post ${task.postId}`);
            // Remove from queue
            await removeFromUploadQueue(task.id);
          } else {
            console.error('Failed to update post:', error);
            await incrementRetryCount(task.id);
          }
        } else {
          console.error('Upload failed:', result.error);
          await incrementRetryCount(task.id);
        }
      } catch (error) {
        console.error(`Upload task failed for ${task.id}:`, error);
        await incrementRetryCount(task.id);
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background upload task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Queue management functions
export const addToUploadQueue = async (task: Omit<UploadTask, 'retryCount'>) => {
  try {
    const queue = await getUploadQueue();
    const uploadTask: UploadTask = { ...task, retryCount: 0 };

    queue.push(uploadTask);
    await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(queue));

    // Start background task if not already running
    await registerBackgroundTask();

    console.log('Added to upload queue:', task.id);
  } catch (error) {
    console.error('Failed to add to upload queue:', error);
  }
};

export const getUploadQueue = async (): Promise<UploadTask[]> => {
  try {
    const queueJson = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Failed to get upload queue:', error);
    return [];
  }
};

const removeFromUploadQueue = async (taskId: string) => {
  try {
    const queue = await getUploadQueue();
    const filteredQueue = queue.filter(task => task.id !== taskId);
    await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(filteredQueue));
  } catch (error) {
    console.error('Failed to remove from upload queue:', error);
  }
};

const incrementRetryCount = async (taskId: string) => {
  try {
    const queue = await getUploadQueue();
    const taskIndex = queue.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
      queue[taskIndex].retryCount += 1;

      // Remove task if it has failed too many times (max 3 retries)
      if (queue[taskIndex].retryCount >= 3) {
        console.log(`Removing failed task ${taskId} after 3 retries`);
        queue.splice(taskIndex, 1);
      }

      await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(queue));
    }
  } catch (error) {
    console.error('Failed to increment retry count:', error);
  }
};

// Background task management
export const registerBackgroundTask = async () => {
  try {
    // Check if already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_UPLOAD_TASK);

    if (!isRegistered) {
      console.log('Registering background upload task');

      await BackgroundFetch.registerTaskAsync(BACKGROUND_UPLOAD_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('Background upload task registered');
    }
  } catch (error) {
    console.error('Failed to register background task:', error);
  }
};

export const unregisterBackgroundTask = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_UPLOAD_TASK);
    console.log('Background upload task unregistered');
  } catch (error) {
    console.error('Failed to unregister background task:', error);
  }
};

// Initialize background upload on app start
export const initializeBackgroundUpload = async () => {
  try {
    const queue = await getUploadQueue();
    console.log(`Initializing background upload with ${queue.length} pending tasks`);

    if (queue.length > 0) {
      await registerBackgroundTask();
    }
  } catch (error) {
    console.error('Failed to initialize background upload:', error);
  }
};