import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { Post, Comment, Story } from '../types';

// Query Keys
export const queryKeys = {
  posts: ['posts'] as const,
  post: (id: string) => ['posts', id] as const,
  userPosts: (userId: string) => ['posts', 'user', userId] as const,
  profile: (userId: string) => ['profile', userId] as const,
  comments: (postId: string) => ['comments', postId] as const,
  conversations: ['conversations'] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  likes: (postId: string) => ['likes', postId] as const,
  stories: ['stories'] as const,
  userStories: (userId: string) => ['stories', 'user', userId] as const,
};

// Posts Queries
export const usePosts = () => {
  return useQuery({
    queryKey: queryKeys.posts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_urls,
          location,
          visibility,
          created_at,
          user_id,
          profiles:user_id (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform and get counts
      const postsWithCounts = await Promise.all(
        data.map(async (post: any) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post.id),
            supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', post.id),
          ]);

          return {
            _id: post.id,
            userId: post.user_id,
            content: post.content,
            imageUrl: post.image_urls?.[0] || null,
            timestamp: new Date(post.created_at).getTime(),
            user: {
              name: post.profiles?.display_name || 'Unknown User',
              avatarUrl: post.profiles?.avatar_url || 'https://avatar.iran.liara.run/public/boy',
            },
            likesCount: likesResult.count || 0,
            commentsCount: commentsResult.count || 0,
            isLiked: false, // Will be set by individual queries
          };
        })
      );

      return postsWithCounts;
    },
  });
};

export const useUserPosts = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userPosts(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((post: any) => ({
        _id: post.id,
        userId: post.user_id,
        content: post.content,
        imageUrl: post.image_urls?.[0] || null,
        timestamp: new Date(post.created_at).getTime(),
        user: {
          name: 'Current User', // Will be filled by profile query
          avatarUrl: 'https://avatar.iran.liara.run/public/boy',
        },
      }));
    },
    enabled: !!userId,
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_urls,
          created_at,
          user_id,
          profiles!inner (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      const [likesResult, commentsResult] = await Promise.all([
        supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', postId),
        supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', postId),
      ]);

      return {
        _id: data.id,
        userId: data.user_id,
        content: data.content,
        imageUrl: data.image_urls?.[0] || null,
        timestamp: new Date(data.created_at).getTime(),
        user: {
          name: (data.profiles as any)?.display_name || 'Unknown User',
          avatarUrl: (data.profiles as any)?.avatar_url || 'https://avatar.iran.liara.run/public/boy',
        },
        likesCount: likesResult.count || 0,
        commentsCount: commentsResult.count || 0,
        isLiked: false,
      };
    },
    enabled: !!postId,
  });
};

// Profile Queries
export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Comments Queries
export const useComments = (postId: string) => {
  return useQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!inner (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map((comment: any) => ({
        _id: comment.id,
        postId: postId,
        userId: comment.user_id,
        content: comment.content,
        timestamp: new Date(comment.created_at).getTime(),
        user: {
          name: (comment.profiles as any)?.display_name || 'Unknown User',
          avatarUrl: (comment.profiles as any)?.avatar_url || 'https://avatar.iran.liara.run/public/boy',
        },
      }));
    },
    enabled: !!postId,
  });
};

// Conversations and Messages Queries
export const useConversations = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: async () => {
      if (!userId) return [];

      // Fetch messages where user is sender or receiver
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          receiver_id,
          sender_id,
          profiles!messages_receiver_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          receiver_id,
          sender_id,
          profiles!messages_sender_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false });

      if (sentError || receivedError) {
        console.error('Error fetching messages:', sentError || receivedError);
        return [];
      }

      // Combine and group by conversation
      const allMessages = [
        ...(sentMessages || []).map(msg => ({ ...msg, isSent: true })),
        ...(receivedMessages || []).map(msg => ({ ...msg, isSent: false })),
      ];

      const conversationMap = new Map<string, any>();

      allMessages.forEach((msg: any) => {
        const otherUserId = msg.isSent ? msg.receiver_id : msg.sender_id;
        const otherUser = msg.isSent ? msg.profiles : msg.profiles;
        const conversationId = [userId, otherUserId].sort().join('_');

        if (!conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, {
            id: conversationId,
            otherUserId,
            otherUserName: otherUser?.display_name || 'Unknown User',
            otherUserAvatar: otherUser?.avatar_url || 'https://avatar.iran.liara.run/public/boy',
            lastMessage: msg.content,
            timestamp: new Date(msg.created_at).getTime(),
            unread: !msg.isSent, // Simplified - in real app you'd track read status
          });
        }
      });

      return Array.from(conversationMap.values());
    },
    enabled: !!userId,
  });
};

export const useChatMessages = (conversationId: string, userId: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId || !userId) return [];

      // Extract other user ID from conversation ID
      const otherUserId = conversationId.split('_').find(id => id !== userId);
      if (!otherUserId) return [];

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id
        `)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat messages:', error);
        return [];
      }

      return (messages || []).map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        isSender: msg.sender_id === userId,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        createdAt: msg.created_at,
      }));
    },
    enabled: !!conversationId && !!userId,
  });
};

// Mutations
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: { content: string; imageUrls?: string[]; visibility?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: postData.content,
          image_urls: postData.imageUrls || null,
          visibility: postData.visibility || 'public',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newPost) => {
      // Transform the new post to match our Post type
      const transformedPost: Post = {
        _id: newPost.id,
        userId: newPost.user_id,
        content: newPost.content,
        imageUrl: newPost.image_urls?.[0] || null,
        timestamp: new Date(newPost.created_at).getTime(),
        user: {
          name: 'Current User', // This will be updated when the query refetches
          avatarUrl: 'https://avatar.iran.liara.run/public/boy',
        },
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
      };

      // Optimistically add to the posts cache
      queryClient.setQueryData(queryKeys.posts, (oldPosts: Post[] = []) => {
        return [transformedPost, ...oldPosts];
      });

      // Invalidate to get fresh data with proper user info
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
        if (error) throw error;
        return { action: 'unlike' };
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: userId, post_id: postId });
        if (error) throw error;
        return { action: 'like' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, userId, content }: { postId: string; userId: string; content: string }) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(variables.postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      return postId;
    },
    onSuccess: (postId) => {
      // Remove the post from the cache
      queryClient.setQueryData(queryKeys.posts, (oldPosts: any[] = []) => {
        return oldPosts.filter(post => post._id !== postId);
      });
      // Also invalidate user posts if needed
      queryClient.invalidateQueries({ queryKey: ['posts', 'user'] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ senderId, receiverId, content }: { senderId: string; receiverId: string; content: string }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate conversations and specific chat
      const conversationId = [variables.senderId, variables.receiverId].sort().join('_');
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
};

// Stories Queries
export const useStories = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.stories,
    queryFn: async () => {
      if (!userId) return [];

      // Get followers and following
      const { data: followers, error: followersError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);

      const { data: following, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (followersError || followingError) {
        console.error('Error fetching follows:', followersError || followingError);
        return [];
      }

      const followerIds = followers?.map(f => f.follower_id) || [];
      const followingIds = following?.map(f => f.following_id) || [];
      const relevantUserIds = [...new Set([...followerIds, ...followingIds, userId])];

      // Get stories from relevant users (within last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: stories, error: storiesError } = await supabase
        .from('stories')
        .select(`
          id,
          image_url,
          created_at,
          user_id,
          profiles:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .in('user_id', relevantUserIds)
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false });

      if (storiesError) {
        console.error('Error fetching stories:', storiesError);
        return [];
      }

      // Group stories by user and get latest story per user
      const userStoriesMap = new Map<string, Story>();

      stories?.forEach((story: any) => {
        const userId = story.user_id;
        if (!userStoriesMap.has(userId)) {
          userStoriesMap.set(userId, {
            _id: story.id,
            userId: story.user_id,
            imageUrl: story.image_url,
            timestamp: new Date(story.created_at).getTime(),
            user: {
              name: story.profiles?.display_name || 'Unknown User',
              avatarUrl: story.profiles?.avatar_url || 'https://avatar.iran.liara.run/public/boy',
            },
          });
        }
      });

      return Array.from(userStoriesMap.values());
    },
    enabled: !!userId,
  });
};

export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageUri: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First upload the image
      const { uploadStoryImage } = await import('./storage');
      const uploadResult = await uploadStoryImage(user.id, imageUri);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Then create the story record
      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          image_url: uploadResult.data?.publicUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories });
    },
  });
};