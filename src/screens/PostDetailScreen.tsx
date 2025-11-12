import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Post, Comment } from '../types';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { commentSchema, type CommentFormData } from '../lib/validations';
import { typography, borderRadius, spacing } from '../lib/theme';

const PostDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };
  const { postId } = route.params;
  const { user } = useSupabaseAuth();
  const { colors } = useTheme();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [errors, setErrors] = useState<Partial<CommentFormData>>({});
  const [submittingComment, setSubmittingComment] = useState(false);

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
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
      backgroundColor: colors.background,
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
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    scrollContainer: {
      flex: 1,
    },
    postCard: {
      backgroundColor: colors.background,
      marginHorizontal: spacing.xl,
      marginVertical: spacing.md,
      borderRadius: borderRadius.medium,
      padding: spacing.lg,
      shadowColor: colors.cardShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    postAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: spacing.md,
    },
    postUserInfo: {
      flex: 1,
    },
    postUsername: {
      ...typography.body,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    postTimestamp: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    postContent: {
      ...typography.body,
      lineHeight: 18,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    postImage: {
      width: '100%',
      height: 300,
      borderRadius: borderRadius.small,
      marginBottom: spacing.md,
    },
    postActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.xl,
    },
    actionCount: {
      ...typography.caption,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.md,
      ...typography.body,
      color: colors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xxxl,
    },
    errorText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    commentsSection: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
    },
    commentsTitle: {
      ...typography.subtitle,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: spacing.lg,
    },
    commentItem: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
    },
    commentAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: spacing.md,
    },
    commentContent: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    commentUsername: {
      ...typography.body,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    commentTimestamp: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    commentText: {
      ...typography.body,
      color: colors.textPrimary,
      lineHeight: 20,
    },
    commentSeparator: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: spacing.md,
    },
    noCommentsText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: spacing.xl,
    },
    commentInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    commentInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      fontSize: 14,
      maxHeight: 80,
      color: colors.textPrimary,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.md,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    inputError: {
      borderColor: colors.error,
      borderWidth: 1,
    },
  });

  // Fetch post and comments
  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        setLoading(true);

        // Fetch post with user data
        const { data: postData, error: postError } = await supabase
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

        if (postError) {
          console.error('Error fetching post:', postError);
          return;
        }

        // Get likes and comments counts
        const [likesResult, commentsResult, userLikeResult] = await Promise.all([
          supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', postId),
          supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', postId),
          user?.id ? supabase.from('likes').select('id').eq('post_id', postId).eq('user_id', user.id).single() : Promise.resolve({ data: null }),
        ]);

        const postWithCounts: Post = {
          _id: postData.id,
          userId: postData.user_id,
          content: postData.content,
          imageUrl: postData.image_urls?.[0] || null,
          timestamp: new Date(postData.created_at).getTime(),
          user: {
            name: (postData.profiles as any)?.display_name || 'Unknown User',
            avatarUrl: (postData.profiles as any)?.avatar_url || 'https://avatar.iran.liara.run/public/boy',
          },
          likesCount: likesResult.count || 0,
          commentsCount: commentsResult.count || 0,
          isLiked: !!userLikeResult.data,
        };

        setPost(postWithCounts);

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
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

        if (!commentsError && commentsData) {
          const transformedComments: Comment[] = commentsData.map((comment: any) => ({
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
          setComments(transformedComments);
        }
      } catch (error) {
        console.error('Error fetching post and comments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostAndComments();
    }
  }, [postId, user?.id]);

  const handleLikePost = async () => {
    if (!user?.id || !post) {
      Alert.alert('Error', 'You must be logged in to like posts');
      return;
    }

    try {
      // Check if user already liked this post
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', post._id)
        .single();

      if (existingLike) {
        // Unlike the post
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // Like the post
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: post._id,
          });
      }

      // Refresh post data
      // Re-fetch post with updated counts
      const [likesResult, userLikeResult] = await Promise.all([
        supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post._id),
        user?.id ? supabase.from('likes').select('id').eq('post_id', post._id).eq('user_id', user.id).single() : Promise.resolve({ data: null }),
      ]);

      setPost(prev => prev ? {
        ...prev,
        likesCount: likesResult.count || 0,
        isLiked: !!userLikeResult.data,
      } : null);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async () => {
    if (!user?.id || !post) {
      Alert.alert('Error', 'You must be logged in to comment');
      return;
    }

    try {
      const validation = commentSchema.safeParse({ content: commentText });
      if (!validation.success) {
        setErrors({ content: validation.error.errors[0].message });
        return;
      }

      setSubmittingComment(true);
      setErrors({});

      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          post_id: post._id,
          content: commentText.trim(),
        });

      if (error) {
        console.error('Error adding comment:', error);
        Alert.alert('Error', 'Failed to add comment. Please try again.');
        return;
      }

      // Clear input and refresh comments
      setCommentText('');

      // Refresh comments
      const { data: commentsData, error: commentsError } = await supabase
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
        .eq('post_id', post._id)
        .order('created_at', { ascending: true });

      if (!commentsError && commentsData) {
        const transformedComments: Comment[] = commentsData.map((comment: any) => ({
          _id: comment.id,
          postId: post._id,
          userId: comment.user_id,
          content: comment.content,
          timestamp: new Date(comment.created_at).getTime(),
          user: {
            name: (comment.profiles as any)?.display_name || 'Unknown User',
            avatarUrl: (comment.profiles as any)?.avatar_url || 'https://avatar.iran.liara.run/public/boy',
          },
        }));
        setComments(transformedComments);

        // Update comment count in post
        setPost(prev => prev ? {
          ...prev,
          commentsCount: transformedComments.length,
        } : null);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const renderPost = (postItem: Post) => (
    <View key={postItem._id} style={dynamicStyles.postCard}>
      <View style={dynamicStyles.postHeader}>
        <TouchableOpacity onPress={() => handleUserPress(postItem.userId)}>
          <Image
            source={{
              uri: postItem.user?.avatarUrl || 'https://avatar.iran.liara.run/public/boy',
            }}
            style={staticStyles.postAvatar}
          />
        </TouchableOpacity>
        <View style={dynamicStyles.postUserInfo}>
          <TouchableOpacity onPress={() => handleUserPress(postItem.userId)}>
            <Text style={dynamicStyles.postUsername}>{postItem.user?.name || 'Unknown'}</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.postTimestamp}>
            {new Date(postItem.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>

      <Text style={dynamicStyles.postContent}>{postItem.content}</Text>

      {postItem.imageUrl && (
        <Image source={{ uri: postItem.imageUrl }} style={staticStyles.postImage} />
      )}

      <View style={dynamicStyles.postActions}>
        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={handleLikePost}
        >
          <MaterialIcons
            name={postItem.isLiked ? "favorite" : "favorite-border"}
            size={24}
            color={colors.error}
          />
          <Text style={dynamicStyles.actionCount}>{postItem.likesCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={dynamicStyles.actionButton}>
          <MaterialIcons name="chat-bubble-outline" size={24} color={colors.textSecondary} />
          <Text style={dynamicStyles.actionCount}>{postItem.commentsCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={dynamicStyles.actionButton}>
          <MaterialIcons name="share" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={dynamicStyles.commentItem}>
      <TouchableOpacity onPress={() => handleUserPress(item.userId)}>
        <Image
          source={{
            uri: item.user?.avatarUrl || 'https://avatar.iran.liara.run/public/boy',
          }}
          style={staticStyles.commentAvatar}
        />
      </TouchableOpacity>
      <View style={dynamicStyles.commentContent}>
        <View style={dynamicStyles.commentHeader}>
          <TouchableOpacity onPress={() => handleUserPress(item.userId)}>
            <Text style={dynamicStyles.commentUsername}>{item.user?.name || 'Unknown'}</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.commentTimestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <Text style={dynamicStyles.commentText}>{item.content}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.headerIcon}>
            <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>Post</Text>
          <View style={dynamicStyles.headerIcon} />
        </View>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading post...</Text>
        </View>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.headerIcon}>
            <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>Post</Text>
          <View style={dynamicStyles.headerIcon} />
        </View>
        <View style={dynamicStyles.errorContainer}>
          <Text style={dynamicStyles.errorText}>Post not found</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.headerIcon}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>{post.user?.name || 'User'}</Text>
        <TouchableOpacity style={dynamicStyles.headerIcon}>
          <MaterialIcons name="more-vert" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Post Detail and Comments */}
      <FlatList
        style={dynamicStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        data={[{ type: 'post', data: post }, ...comments.map(comment => ({ type: 'comment', data: comment }))]}
        keyExtractor={(item, index) => item.type === 'post' ? item.data._id : `${item.data._id}_${index}`}
        renderItem={({ item, index }) => {
          if (item.type === 'post') {
            return renderPost(item.data);
          } else {
            return (
              <View style={dynamicStyles.commentsSection}>
                {index === 1 && <Text style={dynamicStyles.commentsTitle}>Comments ({comments.length})</Text>}
                <View style={dynamicStyles.commentItem}>
                  <TouchableOpacity onPress={() => handleUserPress(item.data.userId)}>
                    <Image
                      source={{
                        uri: item.data.user?.avatarUrl || 'https://avatar.iran.liara.run/public/boy',
                      }}
                      style={staticStyles.commentAvatar}
                    />
                  </TouchableOpacity>
                  <View style={dynamicStyles.commentContent}>
                    <View style={dynamicStyles.commentHeader}>
                      <TouchableOpacity onPress={() => handleUserPress(item.data.userId)}>
                        <Text style={dynamicStyles.commentUsername}>{item.data.user?.name || 'Unknown'}</Text>
                      </TouchableOpacity>
                      <Text style={dynamicStyles.commentTimestamp}>
                        {new Date(item.data.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    <Text style={dynamicStyles.commentText}>{item.data.content}</Text>
                  </View>
                </View>
                <View style={dynamicStyles.commentSeparator} />
              </View>
            );
          }
        }}
        ListEmptyComponent={() => (
          <View style={dynamicStyles.commentsSection}>
            <Text style={dynamicStyles.commentsTitle}>Comments ({comments.length})</Text>
            <Text style={dynamicStyles.noCommentsText}>No comments yet. Be the first to comment!</Text>
          </View>
        )}
      />

      {/* Comment Input */}
      <View style={dynamicStyles.commentInputContainer}>
        <TextInput
          style={[dynamicStyles.commentInput, errors.content && dynamicStyles.inputError]}
          placeholder="Write a comment..."
          placeholderTextColor={colors.inputPlaceholder}
          value={commentText}
          onChangeText={(value) => {
            setCommentText(value);
            if (errors.content) setErrors({ content: undefined });
          }}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[dynamicStyles.sendButton, submittingComment && dynamicStyles.buttonDisabled]}
          onPress={handleAddComment}
          disabled={submittingComment}
        >
          {submittingComment ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
});

export default PostDetailScreen;