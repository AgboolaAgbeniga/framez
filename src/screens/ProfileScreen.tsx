import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  Platform,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useTheme } from '../context/ThemeContext';
import { Post } from '../types';
import { typography, borderRadius, spacing } from '../lib/theme';

const { width } = Dimensions.get('window');
const numColumns = 3;
const itemSize = (width - 40 - 20) / numColumns; // 40 for padding, 20 for spacing


const ProfileScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { user } = useSupabaseAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const userId = route?.params?.userId || user?.id;

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
    scrollContent: {
      paddingBottom: 80, // Account for bottom navigation
    },
    profileSection: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
      paddingHorizontal: spacing.xl,
    },
    profileAvatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      marginBottom: spacing.lg,
    },
    displayName: {
      ...typography.body,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    username: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.xl,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: spacing.xl,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      ...typography.body,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    statLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    editButton: {
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: borderRadius.small,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
    },
    editButtonText: {
      ...typography.caption,
      fontWeight: '500',
      color: colors.error,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    actionButton: {
      flex: 1,
      borderRadius: borderRadius.small,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 120,
    },
    followButton: {
      backgroundColor: colors.primary,
    },
    followingButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    messageButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    actionButtonText: {
      ...typography.caption,
      fontWeight: '500',
      color: '#FFFFFF',
    },
    followingButtonText: {
      color: colors.primary,
    },
    bioSection: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    bioText: {
      ...typography.body,
      color: colors.textPrimary,
      textAlign: 'center',
      lineHeight: 20,
    },
    postsSection: {
      paddingTop: spacing.xl,
    },
    postsTitle: {
      ...typography.subtitle,
      fontWeight: 'bold',
      color: colors.textPrimary,
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.lg,
    },
    gridContainer: {
      paddingHorizontal: spacing.xl,
    },
    gridItem: {
      flex: 1,
      margin: 2,
      aspectRatio: 1,
    },
    gridImage: {
      width: '100%',
      height: '100%',
      borderRadius: borderRadius.small,
    },
    bottomNav: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
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
      marginTop: spacing.md,
      ...typography.body,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xxxl,
      paddingVertical: spacing.xxxl * 2,
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    unfollowModal: {
      position: 'absolute',
      top: 60,
      right: spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.small,
      padding: spacing.md,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 1000,
    },
    unfollowButton: {
      // paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
    },
    unfollowButtonText: {
      ...typography.body,
      color: colors.error,
      fontWeight: '500',
    },
  });

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      setIsOwnProfile(userId === user?.id);
    }
  }, [userId, user]);

  // Refresh profile when screen comes into focus (e.g., returning from EditProfile)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userId) {
        fetchUserProfile();
      }
    });

    return unsubscribe;
  }, [navigation, userId]);

  // Add useEffect to refresh follow status when navigating to profile
  useEffect(() => {
    if (!isOwnProfile && user?.id && userId) {
      // Refresh follow status when component mounts or userId changes
      const refreshFollowStatus = async () => {
        const { data: followStatusResult } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .maybeSingle();

        setIsFollowing(!!followStatusResult);
        console.log('Refreshed follow status for user', userId, ':', !!followStatusResult);
      };

      refreshFollowStatus();
    }
  }, [userId, user?.id, isOwnProfile]);

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
        console.log('Follow status for user', userId, ':', !!followStatusResult.data);
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
          avatarUrl: profileData.avatar_url ? `${profileData.avatar_url}?t=${Date.now()}` : undefined,
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
    console.log('Follow button pressed for user:', userId, 'Current following status:', isFollowing);
    if (!user?.id || isOwnProfile) return;

    try {
      if (isFollowing) {
        // Unfollow
        console.log('Unfollowing user:', userId);
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        console.log('Successfully unfollowed user:', userId);
      } else {
        // Check if already following (prevent duplicate)
        console.log('Checking if already following user:', userId);
        const { data: existingFollow } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .maybeSingle();

        if (existingFollow) {
          console.log('Already following user, updating state');
          setIsFollowing(true);
          return;
        }

        // Follow
        console.log('Following user:', userId);
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId,
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        console.log('Successfully followed user:', userId);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status. Please try again.');
    }
  };

  const handleMessagePress = () => {
    console.log('Message button pressed for user:', userId, profile?.display_name);
    if (!user?.id || isOwnProfile) return;
    // Navigate to messages with this user, indicating we came from profile
    navigation.navigate('Messages', {
      userId,
      userName: profile?.display_name,
      fromProfile: true
    });
  };

  const handleMoreOptions = () => {
    console.log('More options pressed, isFollowing:', isFollowing, 'isOwnProfile:', isOwnProfile);

    if (isOwnProfile || !isFollowing) {
      console.log('Not showing options: isOwnProfile =', isOwnProfile, 'isFollowing =', isFollowing);
      return;
    }

    console.log('Toggling unfollow modal for user:', profile?.username);
    setShowUnfollowModal(!showUnfollowModal);
  };

  const handleUnfollow = async () => {
    if (!user?.id || isOwnProfile) return;

    try {
      console.log('Unfollowing user:', userId);
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
      console.log('Successfully unfollowed user:', userId);
    } catch (error) {
      console.error('Error unfollowing:', error);
      Alert.alert('Error', 'Failed to unfollow user. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  };

  const renderGridItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={dynamicStyles.gridItem}
      onPress={() => navigation.navigate('PostDetail', {
        post: item,
        allPosts: userPosts
      })}
    >
      <Image source={{ uri: item.imageUrl }} style={staticStyles.gridImage} />
    </TouchableOpacity>
  );

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.headerIcon} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>{profile?.username || 'username'}</Text>
        {isOwnProfile ? (
          <TouchableOpacity style={dynamicStyles.headerIcon} onPress={() => navigation.navigate('Settings')}>
            <MaterialIcons name="settings" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : isFollowing ? (
          <TouchableOpacity style={dynamicStyles.headerIcon} onPress={handleMoreOptions}>
            <MaterialIcons name="more-vert" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={dynamicStyles.headerIcon} />
        )}
      </View>

      {/* Unfollow Modal */}
      {showUnfollowModal && (
        <TouchableOpacity
          style={dynamicStyles.unfollowModal}
          onPress={() => setShowUnfollowModal(false)}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={dynamicStyles.unfollowButton}
            onPress={() => {
              setShowUnfollowModal(false);
              handleUnfollow();
            }}
          >
            <Text style={dynamicStyles.unfollowButtonText}>Unfollow</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <FlatList
          data={userPosts}
          renderItem={renderGridItem}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={dynamicStyles.gridContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Profile Info Section */}
              <View style={dynamicStyles.profileSection}>
                <Image
                  source={{
                    uri: profile?.avatar_url ? `${profile.avatar_url}?t=${Date.now()}` : 'https://avatar.iran.liara.run/public/boy',
                  }}
                  style={staticStyles.profileAvatar}
                />
                <Text style={dynamicStyles.displayName}>{profile?.display_name || 'Demo User'}</Text>
                <Text style={dynamicStyles.username}>@{profile?.username || 'demouser'}</Text>

                {/* Stats Row */}
                <View style={dynamicStyles.statsRow}>
                  <View style={dynamicStyles.statItem}>
                    <Text style={dynamicStyles.statNumber}>{userStats.posts}</Text>
                    <Text style={dynamicStyles.statLabel}>Posts</Text>
                  </View>
                  <View style={dynamicStyles.statItem}>
                    <Text style={dynamicStyles.statNumber}>{userStats.followers}</Text>
                    <Text style={dynamicStyles.statLabel}>Followers</Text>
                  </View>
                  <View style={dynamicStyles.statItem}>
                    <Text style={dynamicStyles.statNumber}>{userStats.following}</Text>
                    <Text style={dynamicStyles.statLabel}>Following</Text>
                  </View>
                </View>

                {/* Action Buttons - Show follow/message for other profiles, edit for own */}
                {isOwnProfile ? (
                  <TouchableOpacity style={dynamicStyles.editButton} onPress={() => navigation.navigate('EditProfile')}>
                    <Text style={dynamicStyles.editButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={dynamicStyles.actionButtons}>
                    <TouchableOpacity
                      style={[dynamicStyles.actionButton, dynamicStyles.followButton, isFollowing && dynamicStyles.followingButton]}
                      onPress={handleFollowToggle}
                    >
                      <Text style={[dynamicStyles.actionButtonText, isFollowing && dynamicStyles.followingButtonText]}>
                        {isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[dynamicStyles.actionButton, dynamicStyles.messageButton]}
                      onPress={handleMessagePress}
                    >
                      <MaterialIcons name="message" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Bio Section */}
              <View style={dynamicStyles.bioSection}>
                <Text style={dynamicStyles.bioText}>{profile?.bio || 'No bio yet'}</Text>
              </View>

              {/* Posts Title */}
              <View style={dynamicStyles.postsSection}>
                <Text style={dynamicStyles.postsTitle}>{isOwnProfile ? 'Your Posts' : 'Posts'}</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={dynamicStyles.emptyContainer}>
              <Text style={dynamicStyles.emptyText}>No posts yet. Share your first moment!</Text>
            </View>
          }
        />
      )}

      {/* Bottom Navigation */}
      {/* <BottomNavigation navigation={navigation} /> */}
    </View>
  );
};

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
});

export default ProfileScreen;