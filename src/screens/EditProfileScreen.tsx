import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { uploadAvatar } from '../lib/storage';
import { typography, borderRadius, spacing } from '../lib/theme';

const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useSupabaseAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    display_name: '',
    username: '',
    bio: '',
    avatar_url: '',
    display_name_last_updated: null as string | null,
    username_last_updated: null as string | null,
  });
  const [originalProfile, setOriginalProfile] = useState<any>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

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
    headerTitle: {
      ...typography.body,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    headerIcon: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      padding: spacing.xl,
      paddingBottom: 100,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: spacing.lg,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.background,
    },
    inputContainer: {
      marginBottom: spacing.xl,
    },
    inputLabel: {
      ...typography.caption,
      fontWeight: '500',
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.divider,
      borderRadius: borderRadius.small,
      padding: spacing.md,
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
    },
    editableInput: {
      borderWidth: 1,
      borderColor: editingField ? colors.primary : colors.divider,
      borderRadius: borderRadius.small,
      padding: spacing.md,
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
    },
    warningText: {
      ...typography.caption,
      color: colors.error,
      marginTop: spacing.xs,
      fontSize: 12,
    },
    currentValueText: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    bioInput: {
      height: 100,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.small,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    saveButtonText: {
      ...typography.body,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const profileData = {
        display_name: data.display_name || '',
        username: data.username || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
        display_name_last_updated: data.display_name_last_updated,
        username_last_updated: data.username_last_updated,
      };

      setProfile(profileData);
      setOriginalProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfile(prev => ({ ...prev, avatar_url: result.assets[0].uri }));
    }
  };

  const canChangeDisplayName = () => {
    if (!profile.display_name_last_updated) return true;
    const lastUpdated = new Date(profile.display_name_last_updated);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate >= 14;
  };

  const canChangeUsername = () => {
    if (!profile.username_last_updated) return true;
    const lastUpdated = new Date(profile.username_last_updated);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate >= 14;
  };

  const getDaysUntilNextChange = (lastUpdated: string | null) => {
    if (!lastUpdated) return 0;
    const lastUpdatedDate = new Date(lastUpdated);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 14 - Math.floor(daysSinceUpdate));
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    try {
      setSaving(true);

      let avatarUrl = profile.avatar_url;

      // Upload new avatar if it's a local URI (file:// for native, blob: for web)
      if (profile.avatar_url && (profile.avatar_url.startsWith('file://') || profile.avatar_url.startsWith('blob:'))) {
        console.log('Uploading avatar...');
        const uploadResult = await uploadAvatar(user.id, profile.avatar_url);
        if (uploadResult.success && 'data' in uploadResult && uploadResult.data) {
          avatarUrl = uploadResult.data.publicUrl;
          console.log('Avatar uploaded successfully:', avatarUrl);
        } else if (!uploadResult.success) {
          console.error('Avatar upload failed:', uploadResult.error);
          Alert.alert('Upload Error', uploadResult.error || 'Failed to upload avatar. Please try again.');
          return;
        }
      } else {
        // If it's not a local URI, use it as-is (already uploaded or default)
        avatarUrl = profile.avatar_url;
      }

      const updateData: any = {
        bio: profile.bio,
        avatar_url: avatarUrl,
      };

      // Check if display name has actually changed
      const hasDisplayNameChanged = profile.display_name !== originalProfile?.display_name;
      const hasUsernameChanged = profile.username !== originalProfile?.username;

      // Only update display_name if it changed and is allowed
      if (hasDisplayNameChanged) {
        if (!canChangeDisplayName()) {
          Alert.alert('Cannot Change Display Name', `You can change your display name again in ${getDaysUntilNextChange(profile.display_name_last_updated)} days.`);
          return;
        }
        updateData.display_name = profile.display_name;
        // Note: display_name_last_updated field needs to be added to database
        console.log('Updating display name to:', profile.display_name);
      }

      // Only update username if it changed and is allowed
      if (hasUsernameChanged) {
        if (!canChangeUsername()) {
          Alert.alert('Cannot Change Username', `You can change your username again in ${getDaysUntilNextChange(profile.username_last_updated)} days.`);
          return;
        }
        updateData.username = profile.username;
        // Note: username_last_updated field needs to be added to database
        console.log('Updating username to:', profile.username);
      }

      console.log('Update data:', updateData);

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Profile updated successfully');
      // Show success message briefly, then auto-close
      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          }
        }
      ], { cancelable: false });

      // Auto-close after 2 seconds if user doesn't tap OK
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.headerIcon} onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={dynamicStyles.headerIcon} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialIcons name="check" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.scrollContent}>
        {/* Avatar Section */}
        <View style={dynamicStyles.avatarSection}>
          <View style={dynamicStyles.avatarContainer}>
            <Image
              source={{ uri: profile.avatar_url || 'https://avatar.iran.liara.run/public/boy' }}
              style={dynamicStyles.avatar}
            />
            <TouchableOpacity style={dynamicStyles.editAvatarButton} onPress={pickImage}>
              <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Display Name */}
        <View style={dynamicStyles.inputContainer}>
          <Text style={dynamicStyles.inputLabel}>Display Name</Text>
          <Text style={dynamicStyles.currentValueText}>Current: {profile.display_name}</Text>
          <TouchableOpacity onPress={() => setEditingField('display_name')}>
            <TextInput
              style={dynamicStyles.editableInput}
              value={profile.display_name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, display_name: text }))}
              placeholder="Enter your display name"
              placeholderTextColor={colors.textSecondary}
              editable={editingField === 'display_name'}
            />
          </TouchableOpacity>
          {!canChangeDisplayName() && (
            <Text style={dynamicStyles.warningText}>
              You can change your display name again in {getDaysUntilNextChange(profile.display_name_last_updated)} days
            </Text>
          )}
        </View>

        {/* Username */}
        <View style={dynamicStyles.inputContainer}>
          <Text style={dynamicStyles.inputLabel}>Username</Text>
          <Text style={dynamicStyles.currentValueText}>Current: @{profile.username}</Text>
          <TouchableOpacity onPress={() => setEditingField('username')}>
            <TextInput
              style={dynamicStyles.editableInput}
              value={profile.username}
              onChangeText={(text) => setProfile(prev => ({ ...prev, username: text }))}
              placeholder="Enter your username"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              editable={editingField === 'username'}
            />
          </TouchableOpacity>
          {!canChangeUsername() && (
            <Text style={dynamicStyles.warningText}>
              You can change your username again in {getDaysUntilNextChange(profile.username_last_updated)} days
            </Text>
          )}
        </View>

        {/* Bio */}
        <View style={dynamicStyles.inputContainer}>
          <Text style={dynamicStyles.inputLabel}>Bio</Text>
          <Text style={dynamicStyles.currentValueText}>Current: {profile.bio || 'No bio set'}</Text>
          <TouchableOpacity onPress={() => setEditingField('bio')}>
            <TextInput
              style={[dynamicStyles.editableInput, dynamicStyles.bioInput]}
              value={profile.bio}
              onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={150}
              editable={editingField === 'bio'}
            />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={dynamicStyles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={dynamicStyles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;