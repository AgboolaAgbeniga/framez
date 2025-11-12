import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useTheme } from '../context/ThemeContext';
import { typography, borderRadius, spacing } from '../lib/theme';

const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, signOut } = useSupabaseAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const [notifications, setNotifications] = useState(true);

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
      paddingHorizontal: 20,
      paddingBottom: 15,
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
      color: colors.textPrimary,
      fontSize: 16,
    },
    scrollContainer: {
      flex: 1,
    },
    userSection: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    userAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    userAvatarText: {
      color: colors.surface,
      fontSize: 24,
      fontWeight: 'bold',
    },
    displayName: {
      ...typography.body,
      color: colors.textPrimary,
      fontSize: 16,
      marginBottom: 5,
    },
    username: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: 20,
    },
    editProfileButton: {
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: borderRadius.medium,
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    editProfileText: {
      ...typography.button,
      color: colors.error,
      fontSize: 13,
    },
    settingsContainer: {
      paddingHorizontal: 20,
    },
    section: {
      marginTop: 30,
    },
    sectionTitle: {
      ...typography.caption,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 15,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingTitle: {
      ...typography.body,
      color: colors.textPrimary,
      marginLeft: 15,
    },
    settingRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButtonsContainer: {
      paddingHorizontal: 20,
      paddingVertical: 40,
      gap: 20,
    },
    logoutButton: {
      paddingVertical: 15,
      paddingHorizontal: 30,
      alignItems: 'center',
    },
    logoutText: {
      ...typography.body,
      color: colors.error,
      fontWeight: '600',
    },
    deleteButton: {
      paddingVertical: 15,
      paddingHorizontal: 30,
      alignItems: 'center',
    },
    deleteText: {
      ...typography.body,
      color: colors.error,
      fontWeight: '600',
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.navigate('Auth');
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    Alert.alert('Edit Profile', 'Edit profile functionality would be implemented here');
  };

  const handleChangePassword = async () => {
    try {
      // Sign out the user first
      await signOut();

      // Navigate to auth screen where they can use forgot password
      navigation.navigate('Auth');

      // Show instructions after a brief delay to ensure navigation completes
      setTimeout(() => {
        Alert.alert(
          'Password Reset Required',
          'You have been logged out. To change your password:\n\n1. On the login screen, tap "Forgot Password?"\n2. Enter your email address\n3. Check your email for reset instructions\n4. Follow the link to set a new password\n\nThis secure process ensures your account safety.',
          [{ text: 'Got it', style: 'default' }]
        );
      }, 500);
    } catch (error) {
      console.error('Error during sign out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };


  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Framez Privacy Policy\n\nLast updated: November 2024\n\n1. Information We Collect\nWe collect information you provide directly to us, such as when you create an account, post content, or contact us.\n\n2. How We Use Your Information\nWe use the information to provide, maintain, and improve our services, communicate with you, and protect our users.\n\n3. Information Sharing\nWe do not sell your personal information. We may share information only as described in this policy.\n\n4. Data Security\nWe implement appropriate security measures to protect your personal information.\n\n5. Your Rights\nYou have the right to access, update, or delete your personal information.\n\nFor full details, visit our website.',
      [
        { text: 'Close', style: 'default' }
      ]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'Framez Terms of Service\n\nLast updated: November 2024\n\n1. Acceptance of Terms\nBy accessing and using Framez, you accept and agree to be bound by these terms.\n\n2. User Accounts\nYou are responsible for maintaining the confidentiality of your account credentials.\n\n3. Content and Conduct\nYou retain ownership of your content. You are responsible for content you post and your conduct on the platform.\n\n4. Prohibited Activities\nYou may not use the service for illegal activities, harassment, or violation of others\' rights.\n\n5. Termination\nWe may terminate or suspend your account for violations of these terms.\n\n6. Disclaimers\nThe service is provided "as is" without warranties.\n\nFor full terms, visit our website.',
      [
        { text: 'Close', style: 'default' }
      ]
    );
  };

  const handleHelpCenter = () => {
    Alert.alert(
      'Help Center',
      'Framez Help Center\n\nGetting Started:\n• Create your account and complete your profile\n• Start following friends and interesting accounts\n• Post your first photo or update\n\nAccount Issues:\n• Forgot password? Use the reset option on login\n• Having trouble logging in? Check your email for verification\n\nPosting Content:\n• Tap the + icon to create a new post\n• Add photos, write captions, and share with friends\n• Use hashtags to reach more people\n\nPrivacy & Safety:\n• Control who sees your posts with privacy settings\n• Report inappropriate content\n• Block users if needed\n\nContact Support:\nFor additional help, email us at support@framez.com',
      [
        { text: 'Close', style: 'default' }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account?\n\nThis action cannot be undone. All your posts, comments, and profile information will be permanently deleted.\n\nConsider downloading your data before proceeding.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deletion Confirmed',
              'Your account deletion request has been submitted. You will receive a confirmation email within 24 hours.\n\nYour account will remain active for 30 days in case you change your mind.',
              [
                { text: 'OK', style: 'default' }
              ]
            );
          }
        }
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    onPress,
    showChevron = true,
    rightComponent
  }: {
    icon: string;
    title: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity style={dynamicStyles.settingItem} onPress={onPress}>
      <View style={dynamicStyles.settingLeft}>
        <MaterialIcons name={icon as any} size={24} color={colors.textPrimary} />
        <Text style={dynamicStyles.settingTitle}>{title}</Text>
      </View>
      <View style={dynamicStyles.settingRight}>
        {rightComponent}
        {showChevron && <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.headerIcon}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Settings</Text>
        <View style={dynamicStyles.headerIcon} />
      </View>

      <ScrollView style={dynamicStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* User Section */}
        <View style={dynamicStyles.userSection}>
          <View style={dynamicStyles.userAvatar}>
            <Text style={dynamicStyles.userAvatarText}>
              {user?.user_metadata?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={dynamicStyles.displayName}>{user?.user_metadata?.name || user?.email || 'User'}</Text>
          <Text style={dynamicStyles.username}>@{user?.user_metadata?.name?.toLowerCase().replace(' ', '') || user?.email?.split('@')[0] || 'user'}</Text>
          <TouchableOpacity style={dynamicStyles.editProfileButton} onPress={handleEditProfile}>
            <Text style={dynamicStyles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Options */}
        <View style={dynamicStyles.settingsContainer}>
          {/* Account Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Account</Text>
            <SettingItem
              icon="lock"
              title="Change Password"
              onPress={handleChangePassword}
            />
          </View>

          {/* Preferences Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Preferences</Text>
            <SettingItem
              icon="dark-mode"
              title="Dark Mode"
              showChevron={false}
              rightComponent={
                <Switch
                  value={theme === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.inputBorder, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              }
            />
            <SettingItem
              icon="notifications"
              title="Notifications"
              showChevron={false}
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.inputBorder, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              }
            />
          </View>

          {/* Support Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Support</Text>
            <SettingItem
              icon="privacy-tip"
              title="Privacy Policy"
              onPress={handlePrivacyPolicy}
            />
            <SettingItem
              icon="description"
              title="Terms of Service"
              onPress={handleTermsOfService}
            />
            <SettingItem
              icon="help"
              title="Help Center"
              onPress={handleHelpCenter}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={dynamicStyles.actionButtonsContainer}>
          <TouchableOpacity style={dynamicStyles.logoutButton} onPress={handleLogout}>
            <Text style={dynamicStyles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={dynamicStyles.deleteText}>Delete My Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};


export default SettingsScreen;