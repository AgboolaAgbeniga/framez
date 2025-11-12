import { supabase } from './supabase';
import { queryClient } from './queryClient';

// Real-time subscriptions for messaging
export const subscribeToMessages = (userId: string) => {
  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        console.log('New message received:', payload);
        // Invalidate conversations and messages queries
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['messages'] });
      }
    )
    .subscribe();

  return channel;
};

// Real-time subscriptions for posts and comments
export const subscribeToPosts = () => {
  const channel = supabase
    .channel('posts')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'posts',
      },
      (payload) => {
        console.log('Post change:', payload);
        // Invalidate posts queries
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
      },
      (payload) => {
        console.log('Comment change:', payload);
        // Invalidate comments queries
        queryClient.invalidateQueries({ queryKey: ['comments'] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'likes',
      },
      (payload) => {
        console.log('Like change:', payload);
        // Invalidate posts queries to update like counts
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    )
    .subscribe();

  return channel;
};

// Real-time subscriptions for follows
export const subscribeToFollows = (userId: string) => {
  const channel = supabase
    .channel('follows')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'follows',
        filter: `follower_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Follow change:', payload);
        // Invalidate profile queries
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'follows',
        filter: `following_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Follower change:', payload);
        // Invalidate profile queries
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    )
    .subscribe();

  return channel;
};

// Real-time subscriptions for notifications
export const subscribeToNotifications = (userId: string) => {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('New notification received:', payload);
        // Invalidate notifications query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    )
    .subscribe();

  return channel;
};

// Initialize all subscriptions for a user
export const initializeRealtimeSubscriptions = (userId: string) => {
  const subscriptions = [
    subscribeToMessages(userId),
    subscribeToPosts(),
    subscribeToFollows(userId),
    subscribeToNotifications(userId),
  ];

  console.log('Real-time subscriptions initialized for user:', userId);

  return subscriptions;
};

// Cleanup subscriptions
export const cleanupSubscriptions = (subscriptions: any[]) => {
  subscriptions.forEach(subscription => {
    supabase.removeChannel(subscription);
  });
  console.log('Real-time subscriptions cleaned up');
};