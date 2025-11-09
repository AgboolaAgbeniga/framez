import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
// import { useQuery } from 'convex/react';
// import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();

  // Mock user posts for demo
  const userPosts: Post[] = [
    {
      _id: '1',
      userId: user?._id || 'user1',
      content: 'My first post on Framez! Excited to share my journey. 🚀',
      timestamp: Date.now() - 86400000, // 1 day ago
      user: {
        name: user?.name || 'Demo User',
        avatarUrl: user?.avatarUrl,
      },
    },
    {
      _id: '2',
      userId: user?._id || 'user1',
      content: 'Beautiful day for a walk in the park! 🌳',
      imageUrl: 'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Park',
      timestamp: Date.now() - 172800000, // 2 days ago
      user: {
        name: user?.name || 'Demo User',
        avatarUrl: user?.avatarUrl,
      },
    },
  ];

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      )}
      <Text style={styles.postContent}>{item.content}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{
            uri: user?.avatarUrl || 'https://via.placeholder.com/100',
          }}
          style={styles.profileAvatar}
        />
        <Text style={styles.profileName}>{user?.name || 'User'}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </View>

      <Text style={styles.postsTitle}>My Posts</Text>

      {userPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubtext}>Create your first post to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={userPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  postsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 15,
    color: '#333',
  },
  postContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default ProfileScreen;