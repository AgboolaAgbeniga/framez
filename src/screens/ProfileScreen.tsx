import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { Post } from '../types';

const { width } = Dimensions.get('window');
const numColumns = 3;
const itemSize = (width - 40 - 20) / numColumns; // 40 for padding, 20 for spacing


const ProfileScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { user } = useSupabaseAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const userId = route?.params?.userId || user?.id;

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      setIsOwnProfile(userId === user?.id);
    }
  }, [userId, user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      setProfile(profileData);

      // Fetch follow counts and following status (only if not own profile)
      if (!isOwnProfile && user?.id) {
        const [followersResult, followingResult, followStatusResult] = await Promise.all([
          supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
          supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId),
          supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', userId).maybeSingle(),
        ]);

        setFollowersCount(followersResult.count || 0);
        setFollowingCount(followingResult.count || 0);
        setIsFollowing(!!followStatusResult.data);
      } else {
        // For own profile, fetch follower/following counts
        const [followersResult, followingResult] = await Promise.all([
          supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
          supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId),
        ]);

        setFollowersCount(followersResult.count || 0);
        setFollowingCount(followingResult.count || 0);
      }

      // Fetch user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }

      // Transform posts data
      const transformedPosts: Post[] = postsData.map((post: any) => ({
        _id: post.id,
        userId: post.user_id,
        content: post.content,
        imageUrl: post.image_urls?.[0] || null,
        timestamp: new Date(post.created_at).getTime(),
        user: {
          name: profileData.display_name,
          avatarUrl: profileData.avatar_url,
        },
      }));

      setUserPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from posts
  const userStats = {
    posts: userPosts.length,
    followers: followersCount,
    following: followingCount,
  };

  const handleFollowToggle = async () => {
    console.log('Follow button pressed for user:', userId);
    if (!user?.id || isOwnProfile) return;

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        // Check if already following (prevent duplicate)
        const { data: existingFollow } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .maybeSingle();

        if (existingFollow) {
          // Already following, just update state
          setIsFollowing(true);
          return;
        }

        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId,
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status. Please try again.');
    }
  };

  const handleMessagePress = () => {
    console.log('Message button pressed for user:', userId, profile?.display_name);
    if (!user?.id || isOwnProfile) return;
    // Navigate to messages with this user
    navigation.navigate('Messages', { userId, userName: profile?.display_name });
  };

  const renderGridItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => navigation.navigate('PostDetail', {
        post: item,
        allPosts: userPosts
      })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile?.username || 'username'}</Text>
        {isOwnProfile ? (
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Settings')}>
            <MaterialIcons name="settings" size={24} color="#000000" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerIcon} />
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006175" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Info Section */}
          <View style={styles.profileSection}>
            <Image
              source={{
                uri: profile?.avatar_url || 'https://avatar.iran.liara.run/public/boy',
              }}
              style={styles.profileAvatar}
            />
            <Text style={styles.displayName}>{profile?.display_name || 'Demo User'}</Text>
            <Text style={styles.username}>@{profile?.username || 'demouser'}</Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {/* Action Buttons - Show follow/message for other profiles, edit for own */}
            {isOwnProfile ? (
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.followButton, isFollowing && styles.followingButton]}
                  onPress={handleFollowToggle}
                >
                  <Text style={[styles.actionButtonText, isFollowing && styles.followingButtonText]}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.messageButton]}
                  onPress={handleMessagePress}
                >
                  <MaterialIcons name="message" size={20} color="#006175" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Bio Section */}
          <View style={styles.bioSection}>
            <Text style={styles.bioText}>{profile?.bio || 'No bio yet'}</Text>
          </View>

          {/* Posts Grid */}
          <View style={styles.postsSection}>
            <Text style={styles.postsTitle}>{isOwnProfile ? 'Your Posts' : 'Posts'}</Text>
            <FlatList
              data={userPosts}
              renderItem={renderGridItem}
              keyExtractor={(item) => item._id}
              numColumns={numColumns}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No posts yet. Share your first moment!</Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      )}

      {/* Bottom Navigation */}
      {/* <BottomNavigation navigation={navigation} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header styles
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
  // Scroll content
  scrollContent: {
    paddingBottom: 80, // Account for bottom navigation
  },
  // Profile section
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 15,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  username: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 20,
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  // Edit button
  editButton: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 6,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FF3B30',
  },
  // Action buttons for other profiles
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  followButton: {
    backgroundColor: '#006175',
  },
  followingButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#006175',
  },
  messageButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  followingButtonText: {
    color: '#006175',
  },
  // Bio section
  bioSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  bioText: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Posts section
  postsSection: {
    paddingTop: 20,
  },
  postsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  // Grid styles
  gridContainer: {
    paddingHorizontal: 20,
  },
  gridItem: {
    flex: 1,
    margin: 2,
    aspectRatio: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  // Bottom navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});

export default ProfileScreen;