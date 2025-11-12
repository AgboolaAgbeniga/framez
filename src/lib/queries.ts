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
  notifications: ['notifications'] as const,
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

      // Fetch conversations where user is user_a or user_b
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          user_a_id,
          user_b_id,
          created_at,
          updated_at,
          messages!inner (
            id,
            content,
            created_at,
            sender_id,
            is_read
          )
        `)
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      // Process conversations with user details and last message
      const processedConversations = await Promise.all(
        (conversations || []).map(async (conv: any) => {
          const otherUserId = conv.user_a_id === userId ? conv.user_b_id : conv.user_a_id;

          // Get other user's profile
          const { data: otherUserProfile } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          // Get the most recent message
          const sortedMessages = conv.messages?.sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ) || [];
          const lastMessage = sortedMessages[0];

          // Check for unread messages (messages not read by current user)
          const unreadCount = sortedMessages.filter((msg: any) =>
            msg.sender_id !== userId && !msg.is_read
          ).length;

          return {
            id: conv.id,
            otherUserId,
            otherUserName: otherUserProfile?.display_name || 'Unknown User',
            otherUserAvatar: otherUserProfile?.avatar_url || 'https://avatar.iran.liara.run/public/boy',
            lastMessage: lastMessage?.content || '',
            timestamp: lastMessage ? new Date(lastMessage.created_at).getTime() : new Date(conv.created_at).getTime(),
            unread: unreadCount > 0,
            unreadCount,
          };
        })
      );

      return processedConversations;
    },
    enabled: !!userId,
  });
};

export const useChatMessages = (conversationId: string, userId: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId || !userId) return [];

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          is_read
        `)
        .eq('conversation_id', conversationId)
        .is('is_deleted', false) // Only show non-deleted messages
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
        isRead: msg.is_read,
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
        // Like - get post owner info first for notification
        const { data: post } = await supabase
          .from('posts')
          .select('user_id, content')
          .eq('id', postId)
          .single();

        if (!post) throw new Error('Post not found');

        // Insert like
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: userId, post_id: postId });
        if (error) throw error;

        // Create notification for post owner (if not liking own post)
        if (post.user_id !== userId) {
          const { data: likerProfile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', userId)
            .single();

          const contentPreview = post.content?.substring(0, 50) || 'your post';
          const preview = contentPreview.length < post.content?.length ? `${contentPreview}...` : contentPreview;

          await supabase
            .from('notifications')
            .insert({
              user_id: post.user_id,
              type: 'like',
              title: `${likerProfile?.display_name || 'Someone'} liked your post`,
              content: `"${preview}"`,
              related_post_id: postId,
              related_user_id: userId,
            });
        }

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
      // Get post owner info first for notification
      const { data: post } = await supabase
        .from('posts')
        .select('user_id, content')
        .eq('id', postId)
        .single();

      if (!post) throw new Error('Post not found');

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

      // Create notification for post owner (if not commenting on own post)
      if (post.user_id !== userId) {
        const { data: commenterProfile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', userId)
          .single();

        const contentPreview = content.length > 30 ? `${content.substring(0, 30)}...` : content;

        await supabase
          .from('notifications')
          .insert({
            user_id: post.user_id,
            type: 'comment',
            title: `${commenterProfile?.display_name || 'Someone'} commented on your post`,
            content: `"${contentPreview}"`,
            related_post_id: postId,
            related_user_id: userId,
          });
      }

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
      // Find existing conversation between these users
      const { data: existingConv, error: findError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user_a_id.eq.${senderId},user_b_id.eq.${receiverId}),and(user_a_id.eq.${receiverId},user_b_id.eq.${senderId})`)
        .maybeSingle();

      let conversationId: string;

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            user_a_id: senderId,
            user_b_id: receiverId,
          })
          .select('id')
          .single();

        if (createError) throw createError;
        conversationId = newConv.id;
      }

      // Send message with proper conversation_id
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate conversations and specific chat
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] });
    },
  });
};

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      // Get unread messages in this conversation sent by others
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (fetchError) throw fetchError;

      if (!unreadMessages || unreadMessages.length === 0) return;

      // Mark messages as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (updateError) throw updateError;

      // Insert read records for tracking
      const readRecords = unreadMessages.map(msg => ({
        message_id: msg.id,
        reader_id: userId,
      }));

      const { error: insertError } = await supabase
        .from('message_reads')
        .insert(readRecords);

      if (insertError) throw insertError;

      return unreadMessages.length;
    },
    onSuccess: (_, variables) => {
      // Invalidate conversations and messages to update read status
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    },
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetUserId, currentUserId }: { targetUserId: string; currentUserId: string }) => {
      // Check if already following
      const { data: existingFollow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single();

      if (existingFollow) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('id', existingFollow.id);
        if (error) throw error;
        return { action: 'unfollow' };
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            following_id: targetUserId
          });
        if (error) throw error;

        // Create notification for the followed user
        const { data: followerProfile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', currentUserId)
          .single();

        await supabase
          .from('notifications')
          .insert({
            user_id: targetUserId,
            type: 'follow',
            title: `${followerProfile?.display_name || 'Someone'} started following you`,
            content: `${followerProfile?.display_name || 'Someone'} is now following you`,
            related_user_id: currentUserId,
          });

        return { action: 'follow' };
      }
    },
    onSuccess: () => {
      // Invalidate profile and stories queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stories });
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