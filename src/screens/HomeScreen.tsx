import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import { useQuery } from 'convex/react';
// import { api } from '../../convex/_generated/api';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');

  // Mock data for demo
  const posts: Post[] = [
    {
      _id: '1',
      userId: 'user1',
      content: 'Hello Framez! This is my first post. 🎉',
      timestamp: Date.now() - 3600000, // 1 hour ago
      user: {
        name: 'Demo User',
        avatarUrl: 'https://avatar.iran.liara.run/public/boy',
      },
    },
    {
      _id: '2',
      userId: 'user2',
      content: 'Beautiful sunset today! 📸',
      imageUrl: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Sunset',
      timestamp: Date.now() - 7200000, // 2 hours ago
      user: {
        name: 'Photo Lover',
        avatarUrl: 'https://avatar.iran.liara.run/public/girl',
      },
    },
    {
      _id: '3',
      userId: 'user3',
      content: 'Just finished an amazing workout! 💪 Feeling energized and ready for the day ahead.',
      timestamp: Date.now() - 10800000, // 3 hours ago
      user: {
        name: 'Fitness Fan',
        avatarUrl: 'https://avatar.iran.liara.run/public/boy',
      },
    },
    {
      _id: '4',
      userId: 'user4',
      content: 'Coffee and coding - the perfect combination ☕💻',
      imageUrl: 'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Coffee+%26+Code',
      timestamp: Date.now() - 14400000, // 4 hours ago
      user: {
        name: 'Code Ninja',
        avatarUrl: 'https://avatar.iran.liara.run/public/girl',
      },
    },
  ];

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

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={{
            uri: item.user?.avatarUrl || 'https://via.placeholder.com/40x40/000000/FFFFFF?text=U',
          }}
          style={styles.postAvatar}
        />
        <View style={styles.postUserInfo}>
          <Text style={styles.postUsername}>{item.user?.name || 'Unknown'}</Text>
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
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="favorite-border" size={24} color="#FF3B30" />
          <Text style={styles.actionCount}>12</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="chat-bubble-outline" size={24} color="#8E8E93" />
          <Text style={styles.actionCount}>5</Text>
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

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
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
        }
        contentContainerStyle={styles.feedContainer}
      />
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
});

export default HomeScreen;