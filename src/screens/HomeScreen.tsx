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
  const [searchText, setSearchText] = useState('');
  const { data: posts = [], isLoading: loading, error } = usePosts();
  const likePostMutation = useLikePost();

  // Mock stories data
  const stories = [
    { id: '1', name: 'Your Story', avatar: 'https://avatar.iran.liara.run/public/boy' },
    { id: '2', name: 'Alice', avatar: 'https://avatar.iran.liara.run/public/girl' },
    { id: '3', name: 'Bob', avatar: 'https://avatar.iran.liara.run/public/boy' },
    { id: '4', name: 'Carol', avatar: 'https://avatar.iran.liara.run/public/girl' },
    { id: '5', name: 'David', avatar: 'https://avatar.iran.liara.run/public/boy' },
  ];

  const renderStory = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.storyItem}>
      <FastImage source={{ uri: item.avatar }} style={styles.storyAvatar} />
      <Text style={styles.storyName} numberOfLines={1}>
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
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={() => handleUserPress(item.userId)}>
          <FastImage
            source={{
              uri: item.user?.avatarUrl || 'https://via.placeholder.com/40x40/000000/FFFFFF?text=U',
            }}
            style={styles.postAvatar}
          />
        </TouchableOpacity>
        <View style={styles.postUserInfo}>
          <TouchableOpacity onPress={() => handleUserPress(item.userId)}>
            <Text style={styles.postUsername}>{item.user?.name || 'Unknown'}</Text>
          </TouchableOpacity>
          <Text style={styles.postTimestamp}>
            {formatTimeAgo(item.timestamp)}
          </Text>
        </View>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.imageUrl && (
        <FastImage source={{ uri: item.imageUrl }} style={styles.postImage} />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLikePost(item._id)}
        >
          <MaterialIcons
            name={item.isLiked ? "favorite" : "favorite-border"}
            size={24}
            color="#FF3B30"
          />
          <Text style={styles.actionCount}>{item.likesCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCommentPress(item._id)}
        >
          <MaterialIcons name="chat-bubble-outline" size={24} color="#8E8E93" />
          <Text style={styles.actionCount}>{item.commentsCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={24} color="#8E8E93" />
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
      contentContainerStyle={styles.feedContainer}
      ListEmptyComponent={
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#006175" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet. Be the first to share something!</Text>
          </View>
        )
      }
      ListHeaderComponent={
        <View>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Framez</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.headerIcon}>
                <MaterialIcons name="search" size={24} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <MaterialIcons name="notifications-none" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Fixed Stories Section */}
          <View style={styles.storiesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesScroll}
            >
              {stories.map((story) => (
                <TouchableOpacity key={story.id} style={styles.storyItem}>
                  <FastImage source={{ uri: story.avatar }} style={styles.storyAvatar} />
                  <Text style={styles.storyName} numberOfLines={1}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Inter-Bold',
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
    borderBottomColor: '#F0F0F0',
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
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    maxWidth: 60,
  },
  feedContainer: {
    paddingBottom: 80, // Account for tab bar
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
    fontFamily: 'Inter-Bold',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'Inter-Regular',
  },
  postContent: {
    fontSize: 13,
    lineHeight: 18,
    color: '#000000',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  postImage: {
    width: '100%',
    height: 250,
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
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});

export default HomeScreen;