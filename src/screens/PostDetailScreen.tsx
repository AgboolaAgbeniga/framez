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
import { supabase } from '../lib/supabase';
import { commentSchema, type CommentFormData } from '../lib/validations';

const PostDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };
  const { postId } = route.params;
  const { user } = useSupabaseAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [errors, setErrors] = useState<Partial<CommentFormData>>({});
  const [submittingComment, setSubmittingComment] = useState(false);

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
            avatarUrl: (postData.profiles as any)?.avatar_url || 'https://via.placeholder.com/40x40/000000/FFFFFF?text=U',
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
              avatarUrl: (comment.profiles as any)?.avatar_url || 'https://via.placeholder.com/40x40/000000/FFFFFF?text=U',
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
            avatarUrl: (comment.profiles as any)?.avatar_url || 'https://via.placeholder.com/40x40/000000/FFFFFF?text=U',
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
    <View key={postItem._id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={() => handleUserPress(postItem.userId)}>
          <Image
            source={{
              uri: postItem.user?.avatarUrl || 'https://via.placeholder.com/40x40/000000/FFFFFF?text=U',
            }}
            style={styles.postAvatar}
          />
        </TouchableOpacity>
        <View style={styles.postUserInfo}>
          <TouchableOpacity onPress={() => handleUserPress(postItem.userId)}>
            <Text style={styles.postUsername}>{postItem.user?.name || 'Unknown'}</Text>
          </TouchableOpacity>
          <Text style={styles.postTimestamp}>
            {new Date(postItem.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>

      <Text style={styles.postContent}>{postItem.content}</Text>

      {postItem.imageUrl && (
        <Image source={{ uri: postItem.imageUrl }} style={styles.postImage} />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLikePost}
        >
          <MaterialIcons
            name={postItem.isLiked ? "favorite" : "favorite-border"}
            size={24}
            color="#FF3B30"
          />
          <Text style={styles.actionCount}>{postItem.likesCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="chat-bubble-outline" size={24} color="#8E8E93" />
          <Text style={styles.actionCount}>{postItem.commentsCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <TouchableOpacity onPress={() => handleUserPress(item.userId)}>
        <Image
          source={{
            uri: item.user?.avatarUrl || 'https://via.placeholder.com/40x40/000000/FFFFFF?text=U',
          }}
          style={styles.commentAvatar}
        />
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <TouchableOpacity onPress={() => handleUserPress(item.userId)}>
            <Text style={styles.commentUsername}>{item.user?.name || 'Unknown'}</Text>
          </TouchableOpacity>
          <Text style={styles.commentTimestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <MaterialIcons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerIcon} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006175" />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <MaterialIcons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerIcon} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{post.user?.name || 'User'}</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <MaterialIcons name="more-vert" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Post Detail and Comments */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderPost(post)}

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>

          {comments.length > 0 ? (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.commentSeparator} />}
            />
          ) : (
            <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={[styles.commentInput, errors.content && styles.inputError]}
          placeholder="Write a comment..."
          value={commentText}
          onChangeText={(value) => {
            setCommentText(value);
            if (errors.content) setErrors({ content: undefined });
          }}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, submittingComment && styles.buttonDisabled]}
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
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
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
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postUserInfo: {
    flex: 1,
  },
  postUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  postContent: {
    fontSize: 13,
    lineHeight: 18,
    color: '#000000',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  // Comments section
  commentsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  commentText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  commentSeparator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 10,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Comment input
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#006175',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
});

export default PostDetailScreen;