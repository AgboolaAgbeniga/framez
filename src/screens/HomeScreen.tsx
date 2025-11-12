import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePosts, useLikePost, useStories, useCreateStory, useDeletePost } from '../lib/queries';
import { Post, Story } from '../types';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useTheme } from '../context/ThemeContext';
import { typography, borderRadius, spacing } from '../lib/theme';
import FastImage from '../components/FastImage';

const { width } = Dimensions.get('window');

// Helper function to format time ago
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  return `${months} month${months !== 1 ? 's' : ''} ago`;
};

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useSupabaseAuth();
  const { colors } = useTheme();
  const [searchText, setSearchText] = useState('');
  const { data: posts = [], isLoading: loading, error } = usePosts();
  const { data: stories = [] } = useStories(user?.id);
  const likePostMutation = useLikePost();
  const createStoryMutation = useCreateStory();
  const deletePostMutation = useDeletePost();

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
      paddingTop: 40,
      paddingHorizontal: 20,
      paddingBottom: 15,
      backgroundColor: colors.background
    },
    title: {
      ...typography.headline,
      color: colors.textPrimary,
      fontSize: 24,
    },
    headerIcons: {
      flexDirection: 'row',
    },
    headerIcon: {
      marginLeft: 20,
    },
    storiesContainer: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.background,
    },
    storiesScroll: {
      paddingHorizontal: 20,
    },
    storyItem: {
      alignItems: 'center',
      marginRight: 20,
    },
    storyAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginBottom: 5,
    },
    storyName: {
      ...typography.caption,
      color: colors.textPrimary,
      textAlign: 'center',
      maxWidth: 60,
    },
    storyAvatarContainer: {
      position: 'relative',
    },
    plusIconContainer: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: colors.surface,
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    storyIndicator: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.background,
    },
    feedContainer: {
      paddingBottom: 80, // Account for tab bar
      backgroundColor: colors.background,
    },
    postCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginVertical: 10,
      borderRadius: borderRadius.medium,
      padding: 15,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
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
      gap: 4,
    },
    postUsername: {
      ...typography.body,
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    postTimestamp: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    postContent: {
      ...typography.body,
      color: colors.textPrimary,
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 12,
    },
    postImage: {
      width: '100%',
      height: 250,
      borderRadius: borderRadius.medium,
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
      ...typography.caption,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      ...typography.body,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  // Prepare stories data with "Your Story" first
  const processedStories = React.useMemo(() => {
    const hasUserStory = stories.some(story => story.userId === user?.id);
    const yourStory = hasUserStory
      ? stories.find(story => story.userId === user?.id)
      : { _id: 'your-story', userId: user?.id || '', imageUrl: '', timestamp: 0, user: { name: 'Your Story', avatarUrl: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || 'https://avatar.iran.liara.run/public/boy' } };

    const otherStories = stories.filter(story => story.userId !== user?.id);

    return [yourStory, ...otherStories];
  }, [stories, user]);

  const handleAddStory = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to add a story');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera roll permissions are required to add stories');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await createStoryMutation.mutateAsync(result.assets[0].uri);
        Alert.alert('Success', 'Story added successfully!');
      }
    } catch (error) {
      console.error('Error adding story:', error);
      Alert.alert('Error', 'Failed to add story');
    }
  };

  const renderStory = ({ item }: { item: Story }) => {
    const isYourStory = item._id === 'your-story';
    const hasStory = item.imageUrl && item.imageUrl !== '';

    return (
      <TouchableOpacity
        style={dynamicStyles.storyItem}
        onPress={isYourStory ? handleAddStory : () => {/* Navigate to story viewer */}}
      >
        <View style={dynamicStyles.storyAvatarContainer}>
          <FastImage
            source={{ uri: item.user?.avatarUrl || 'https://avatar.iran.liara.run/public/boy' }}
            style={dynamicStyles.storyAvatar}
          />
          {isYourStory && (
            <View style={dynamicStyles.plusIconContainer}>
              <MaterialIcons name="add" size={16} color={colors.primary} />
            </View>
          )}
          {hasStory && !isYourStory && (
            <View style={dynamicStyles.storyIndicator} />
          )}
        </View>
        <Text style={dynamicStyles.storyName} numberOfLines={1}>
          {item.user?.name || 'Unknown'}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleLikePost = async (postId: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to like posts');
      return;
    }

    try {
      await likePostMutation.mutateAsync({ postId, userId: user.id });
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to like/unlike post');
    }
  };

  const handleCommentPress = (postId: string) => {
    // Navigate to post detail screen
    navigation.navigate('PostDetail', { postId });
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const handleDeletePost = async (postId: string) => {
    console.log('handleDeletePost called with postId:', postId);
    // For web, Alert doesn't work well, so we'll use window.confirm
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
      if (confirmed) {
        console.log('Delete confirmed, calling mutation');
        try {
          await deletePostMutation.mutateAsync(postId);
          console.log('Delete mutation completed');
          alert('Post deleted successfully');
        } catch (error) {
          console.error('Error deleting post:', error);
          alert('Failed to delete post');
        }
      } else {
        console.log('Delete cancelled');
      }
    } else {
      // For mobile, use Alert
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('Delete cancelled'),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              console.log('Delete confirmed, calling mutation');
              try {
                await deletePostMutation.mutateAsync(postId);
                console.log('Delete mutation completed');
                Alert.alert('Success', 'Post deleted successfully');
              } catch (error) {
                console.error('Error deleting post:', error);
                Alert.alert('Error', 'Failed to delete post');
              }
            },
          },
        ]
      );
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={dynamicStyles.postCard}>
      <View style={dynamicStyles.postHeader}>
        <TouchableOpacity onPress={() => handleUserPress(item.userId)}>
          <FastImage
            source={{
              uri: item.user?.avatarUrl || 'https://avatar.iran.liara.run/public/boy',
            }}
            style={dynamicStyles.postAvatar}
          />
        </TouchableOpacity>
        <View style={dynamicStyles.postUserInfo}>
          <TouchableOpacity onPress={() => handleUserPress(item.userId)}>
            <Text style={dynamicStyles.postUsername}>{item.user?.name || 'Unknown'}</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.postTimestamp}>
            {formatTimeAgo(item.timestamp)}
          </Text>
        </View>
      </View>

      <Text style={dynamicStyles.postContent}>{item.content}</Text>

      {item.imageUrl && (
        <FastImage source={{ uri: item.imageUrl }} style={dynamicStyles.postImage} />
      )}

      <View style={dynamicStyles.postActions}>
        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={() => handleLikePost(item._id)}
        >
          <MaterialIcons
            name={item.isLiked ? "favorite" : "favorite-border"}
            size={24}
            color={colors.error}
          />
          <Text style={dynamicStyles.actionCount}>{item.likesCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={() => handleCommentPress(item._id)}
        >
          <MaterialIcons name="chat-bubble-outline" size={24} color={colors.textSecondary} />
          <Text style={dynamicStyles.actionCount}>{item.commentsCount || 0}</Text>
        </TouchableOpacity>

        {item.userId === user?.id && (
          <TouchableOpacity
            style={dynamicStyles.actionButton}
            onPress={() => {
              console.log('Delete button pressed for post:', item._id, 'User:', user?.id, 'Post user:', item.userId);
              handleDeletePost(item._id);
            }}
          >
            <MaterialIcons name="delete" size={24} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={dynamicStyles.feedContainer}
      ListEmptyComponent={
        loading ? (
          <View style={dynamicStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={dynamicStyles.loadingText}>Loading posts...</Text>
          </View>
        ) : (
          <View style={dynamicStyles.emptyContainer}>
            <Text style={dynamicStyles.emptyText}>No posts yet. Be the first to share something!</Text>
          </View>
        )
      }
      ListHeaderComponent={
        <View>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title}>Framez</Text>
            <View style={dynamicStyles.headerIcons}>
              <TouchableOpacity style={dynamicStyles.headerIcon}>
                <MaterialIcons name="search" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={dynamicStyles.headerIcon} onPress={() => navigation.navigate('Notifications')}>
                <MaterialIcons name="notifications-none" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Fixed Stories Section */}
          <View style={dynamicStyles.storiesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={dynamicStyles.storiesScroll}
            >
              {processedStories.map((story) => (
                <TouchableOpacity key={story?._id} style={dynamicStyles.storyItem}>
                  <View style={dynamicStyles.storyAvatarContainer}>
                    <FastImage source={{ uri: story?.user?.avatarUrl || 'https://avatar.iran.liara.run/public/boy' }} style={dynamicStyles.storyAvatar} />
                    {story?._id === 'your-story' && (
                      <View style={dynamicStyles.plusIconContainer}>
                        <MaterialIcons name="add" size={16} color={colors.primary} />
                      </View>
                    )}
                    {story?.imageUrl && story?._id !== 'your-story' && (
                      <View style={dynamicStyles.storyIndicator} />
                    )}
                  </View>
                  <Text style={dynamicStyles.storyName} numberOfLines={1}>
                    {story?.user?.name || 'Unknown'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      }
    />
  );
};


export default HomeScreen;