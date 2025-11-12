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
import { usePosts, useLikePost } from '../lib/queries';
import { Post } from '../types';
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
  const likePostMutation = useLikePost();

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
    feedContainer: {
      paddingBottom: 80, // Account for tab bar
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

  // Mock stories data
  const stories = [
    { id: '1', name: 'Your Story', avatar: 'https://avatar.iran.liara.run/public/boy' },
    { id: '2', name: 'Alice', avatar: 'https://avatar.iran.liara.run/public/girl' },
    { id: '3', name: 'Bob', avatar: 'https://avatar.iran.liara.run/public/boy' },
    { id: '4', name: 'Carol', avatar: 'https://avatar.iran.liara.run/public/girl' },
    { id: '5', name: 'David', avatar: 'https://avatar.iran.liara.run/public/boy' },
  ];

  const renderStory = ({ item }: { item: any }) => (
    <TouchableOpacity style={dynamicStyles.storyItem}>
      <FastImage source={{ uri: item.avatar }} style={dynamicStyles.storyAvatar} />
      <Text style={dynamicStyles.storyName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

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

  const renderPost = ({ item }: { item: Post }) => (
    <View style={dynamicStyles.postCard}>
      <View style={dynamicStyles.postHeader}>
        <TouchableOpacity onPress={() => handleUserPress(item.userId)}>
          <FastImage
            source={{
              uri: item.user?.avatarUrl || 'https://via.placeholder.com/40x40/000000/FFFFFF?text=U',
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
            color="#FF3B30"
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

        <TouchableOpacity style={dynamicStyles.actionButton}>
          <MaterialIcons name="share" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
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
              {stories.map((story) => (
                <TouchableOpacity key={story.id} style={dynamicStyles.storyItem}>
                  <FastImage source={{ uri: story.avatar }} style={dynamicStyles.storyAvatar} />
                  <Text style={dynamicStyles.storyName} numberOfLines={1}>
                    {story.name}
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