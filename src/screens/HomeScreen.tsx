import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { Post } from '../types';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useSupabaseAuth();
  const [searchText, setSearchText] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        // Fetch posts with user profile data
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

        if (error) {
          console.error('Error fetching posts:', error);
          return;
        }

        // Get likes and comments counts for each post
        const postsWithCounts = await Promise.all(
          data.map(async (post: any) => {
            const [likesResult, commentsResult, userLikeResult] = await Promise.all([
              supabase
                .from('likes')
                .select('id', { count: 'exact' })
                .eq('post_id', post.id),
              supabase
                .from('comments')
                .select('id', { count: 'exact' })
                .eq('post_id', post.id),
              user?.id ? supabase
                .from('likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .single() : Promise.resolve({ data: null }),
            ]);

            return {
              _id: post.id,
              userId: post.user_id,
              content: post.content,
              imageUrl: post.image_urls?.[0] || null,
              timestamp: new Date(post.created_at).getTime(),
              user: {
                name: post.profiles?.display_name || 'Unknown User',
                avatarUrl: post.profiles?.avatar_url || 'https://via.placeholder.com/40x40/000000/FFFFFF?text=U',
              },
              likesCount: likesResult.count || 0,
              commentsCount: commentsResult.count || 0,
              isLiked: !!userLikeResult.data,
            };
          })
        );

        setPosts(postsWithCounts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
      <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
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
      // Check if user already liked this post
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
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
            post_id: postId,
          });
      }

      // Refresh posts to update like counts
      // Re-fetch posts to update like counts
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

      if (!error && data) {
        // Get likes and comments counts for each post
        const postsWithCounts = await Promise.all(
          data.map(async (post: any) => {
            const [likesResult, commentsResult, userLikeResult] = await Promise.all([
              supabase
                .from('likes')
                .select('id', { count: 'exact' })
                .eq('post_id', post.id),
              supabase
                .from('comments')
                .select('id', { count: 'exact' })
                .eq('post_id', post.id),
              user?.id ? supabase
                .from('likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .single() : Promise.resolve({ data: null }),
            ]);

            return {
              _id: post.id,
              userId: post.user_id,
              content: post.content,
              imageUrl: post.image_urls?.[0] || null,
              timestamp: new Date(post.created_at).getTime(),
              user: {
                name: post.profiles?.display_name || 'Unknown User',
                avatarUrl: post.profiles?.avatar_url || 'https://via.placeholder.com/40x40/000000/FFFFFF?text=U',
              },
              likesCount: likesResult.count || 0,
              commentsCount: commentsResult.count || 0,
              isLiked: !!userLikeResult.data,
            };
          })
        );

        setPosts(postsWithCounts);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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
          <Image
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
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
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
    <View style={styles.container}>
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
              <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
              <Text style={styles.storyName} numberOfLines={1}>
                {story.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Posts Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006175" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet. Be the first to share something!</Text>
            </View>
          }
        />
      )}
    </View>
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