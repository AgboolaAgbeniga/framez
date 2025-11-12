import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useTheme } from '../context/ThemeContext';
import { typography, borderRadius, spacing } from '../lib/theme';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  title: string;
  content: string;
  related_post_id?: string;
  related_user_id?: string;
  is_read: boolean;
  created_at: string;
  user?: {
    name: string;
    avatarUrl: string;
  };
}

const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useSupabaseAuth();
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
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
    listContainer: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
    },
    notificationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      marginVertical: spacing.xs,
      borderRadius: borderRadius.medium,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  });

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Fetch notifications with user data
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          title,
          content,
          related_post_id,
          related_user_id,
          is_read,
          created_at,
          profiles!notifications_related_user_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      // Transform notifications data
      const transformedNotifications: Notification[] = (data || []).map((notification: any) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        related_post_id: notification.related_post_id,
        related_user_id: notification.related_user_id,
        is_read: notification.is_read,
        created_at: notification.created_at,
        user: {
          name: notification.profiles?.display_name || 'Unknown User',
          avatarUrl: notification.profiles?.avatar_url || 'https://avatar.iran.liara.run/public/boy',
        },
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.related_post_id) {
      navigation.navigate('PostDetail', { postId: notification.related_post_id });
    } else if (notification.related_user_id) {
      navigation.navigate('UserProfile', { userId: notification.related_user_id });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return 'favorite';
      case 'comment':
        return 'chat-bubble-outline';
      case 'follow':
        return 'person-add';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return colors.error; // Red for likes
      case 'comment':
        return colors.primary; // Primary for comments
      case 'follow':
        return colors.success; // Green for follows
      default:
        return colors.textSecondary;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        dynamicStyles.notificationItem,
        { backgroundColor: colors.surface },
        !item.is_read && { backgroundColor: colors.accent + '20' } // Slight accent tint for unread
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationLeft}>
        <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(item.type) + '20' }]}>
          <MaterialIcons
            name={getNotificationIcon(item.type) as any}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>
        {item.user && (
          <Image source={{ uri: item.user.avatarUrl || 'https://avatar.iran.liara.run/public/boy' }} style={styles.userAvatar} />
        )}
      </View>

      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, { color: colors.textPrimary }]}>
          {item.title}
        </Text>
        <Text style={[styles.notificationText, { color: colors.textSecondary }]}>
          {item.content}
        </Text>
        <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
          {new Date(item.created_at).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>

      {!item.is_read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
          <View style={styles.headerIcon} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading notifications...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
        <View style={styles.headerIcon} />
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={dynamicStyles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No notifications yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              When someone likes your posts, comments, or follows you, you'll see it here.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.body,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationText: {
    ...typography.caption,
    fontSize: 13,
    marginBottom: 4,
  },
  notificationTime: {
    ...typography.caption,
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    ...typography.body,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    ...typography.body,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default NotificationsScreen;