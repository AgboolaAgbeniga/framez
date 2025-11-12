import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import type { PanGestureHandlerGestureEvent, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useTheme } from '../context/ThemeContext';
import { useConversations, useChatMessages, useSendMessage, useMarkMessagesAsRead } from '../lib/queries';
import { typography, borderRadius, spacing } from '../lib/theme';
import FastImage from '../components/FastImage';

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: string;
  timestamp: number;
  unread: boolean;
  unreadCount?: number;
}

interface ChatMessage {
  id: string;
  text: string;
  isSender: boolean;
  timestamp: string;
}

const MessagesScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { user } = useSupabaseAuth();
  const { colors } = useTheme();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.medium,
      marginHorizontal: spacing.xl,
      marginVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      shadowColor: colors.cardShadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.textPrimary,
    },
    listContainer: {
      paddingHorizontal: spacing.xl,
    },
    messageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: spacing.lg,
    },
    messageContent: {
      flex: 1,
    },
    messageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    senderName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    timestamp: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    lastMessage: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    unreadMessage: {
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    unreadDot: {
      minWidth: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 2,
    },
    chatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 50,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.lg,
    },
    chatAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: spacing.sm,
    },
    chatUserName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    chatContainer: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xl,
    },
    chatMessageContainer: {
      marginBottom: spacing.lg,
      maxWidth: '80%',
    },
    senderMessage: {
      alignSelf: 'flex-end',
    },
    receiverMessage: {
      alignSelf: 'flex-start',
    },
    chatMessageText: {
      padding: spacing.md,
      borderRadius: borderRadius.xl,
      fontSize: 16,
      lineHeight: 20,
    },
    senderText: {
      backgroundColor: colors.error,
      color: '#FFFFFF',
    },
    receiverText: {
      backgroundColor: colors.surface,
      color: colors.textPrimary,
    },
    chatTimestamp: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'right',
    },
    messageInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    attachmentButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    messageInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      fontSize: 16,
      maxHeight: 100,
      color: colors.textPrimary,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.sm,
    },
    // Removed messagesContainer style as we're now using FlatList directly
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.sm,
      fontSize: 16,
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
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  // React Query hooks
  const { data: conversations = [], isLoading: loading, refetch: refetchConversations } = useConversations(user?.id);
  const { data: chatMessages = [], refetch: refetchMessages } = useChatMessages(
    selectedChat && !selectedChat.startsWith('new_') ? selectedChat : '',
    user?.id || ''
  );
  const sendMessageMutation = useSendMessage();
  const markMessagesAsReadMutation = useMarkMessagesAsRead();

  // Gesture handling for swipe down to go back
  const handleGesture = (event: PanGestureHandlerGestureEvent) => {
    // Gesture logic will be handled in onHandlerStateChange
  };

  const handleGestureStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    const { translationY, state } = event.nativeEvent;

    if (state === State.END && translationY > 100) {
      // Swipe down detected (more than 100 pixels)
      if (fromProfile && directUserId) {
        // Navigate back to the user's profile
        navigation.navigate('UserProfile', { userId: directUserId });
      } else {
        // Normal back to conversations list
        setSelectedChat(null);
      }
    }
  };

  // Check if navigating from profile to start a new conversation
  const directUserId = route?.params?.userId;
  const directUserName = route?.params?.userName;
  const fromProfile = route?.params?.fromProfile || false;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handle direct messaging from profile
  useEffect(() => {
    if (directUserId && directUserName && user?.id && conversations.length > 0) {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => conv.otherUserId === directUserId);
      if (existingConversation) {
        setSelectedChat(existingConversation.id);
      } else {
        // For new conversations, we'll let the sendMessage handle creating it
        // For now, just set a temporary state to indicate we want to start a new chat
        setSelectedChat(`new_${directUserId}`);
      }
    }
  }, [directUserId, directUserName, conversations, user?.id]);

  // Mark messages as read when opening a chat
  useEffect(() => {
    if (selectedChat && user?.id && selectedChat !== `new_${directUserId}`) {
      markMessagesAsReadMutation.mutate({
        conversationId: selectedChat,
        userId: user.id,
      });
    }
  }, [selectedChat, user?.id]);


  const selectedChatData = conversations.find(chat => chat.id === selectedChat) || (selectedChat?.startsWith('new_') && directUserId && directUserName ? {
    id: selectedChat,
    otherUserId: directUserId,
    otherUserName: directUserName,
    otherUserAvatar: 'https://avatar.iran.liara.run/public/boy', // Default avatar
    lastMessage: '',
    timestamp: Date.now(),
    unread: false,
  } : null);

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={dynamicStyles.messageItem}
      onPress={() => {
        setSelectedChat(item.id);
      }}
    >
      <FastImage source={{ uri: item.otherUserAvatar }} style={dynamicStyles.avatar} />
      <View style={dynamicStyles.messageContent}>
        <View style={dynamicStyles.messageHeader}>
          <Text style={dynamicStyles.senderName}>{item.otherUserName}</Text>
          <Text style={dynamicStyles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <Text style={[dynamicStyles.lastMessage, item.unread && dynamicStyles.unreadMessage]}>
          {item.lastMessage}
        </Text>
      </View>
      {item.unread && (
        <View style={dynamicStyles.unreadDot}>
          {item.unreadCount && item.unreadCount > 1 && (
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      dynamicStyles.chatMessageContainer,
      item.isSender ? dynamicStyles.senderMessage : dynamicStyles.receiverMessage
    ]}>
      <Text style={[
        dynamicStyles.chatMessageText,
        item.isSender ? dynamicStyles.senderText : dynamicStyles.receiverText
      ]}>
        {item.text}
      </Text>
      <Text style={dynamicStyles.chatTimestamp}>{item.timestamp}</Text>
    </View>
  );

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user?.id || !selectedChatData) return;

    try {
      // Use React Query mutation
      await sendMessageMutation.mutateAsync({
        senderId: user.id,
        receiverId: selectedChatData.otherUserId,
        content: newMessage.trim(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  if (selectedChat && selectedChatData) {
    const { height: screenHeight } = Dimensions.get('window');
    const inputContainerHeight = 70; // Approximate height of message input container
    const availableHeight = screenHeight - keyboardHeight - inputContainerHeight - 100; // 100 for header

    return (
      <PanGestureHandler
        onGestureEvent={handleGesture}
        onHandlerStateChange={handleGestureStateChange}
      >
        <View style={dynamicStyles.container}>
          {/* Chat Header */}
          <View style={dynamicStyles.chatHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={dynamicStyles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <FastImage source={{ uri: selectedChatData?.otherUserAvatar }} style={dynamicStyles.chatAvatar} />
            <Text style={dynamicStyles.chatUserName}>{selectedChatData?.otherUserName}</Text>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={renderChatMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[dynamicStyles.chatContainer, { minHeight: availableHeight }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={refetchMessages}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Message Input - Positioned absolutely above keyboard */}
          <View style={[
            dynamicStyles.messageInputContainer,
            {
              position: 'absolute',
              bottom: keyboardHeight || 0,
              left: 0,
              right: 0,
            }
          ]}>
            <TouchableOpacity style={dynamicStyles.attachmentButton}>
              <MaterialIcons name="attach-file" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <TextInput
              style={dynamicStyles.messageInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.inputPlaceholder}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={dynamicStyles.sendButton} onPress={sendMessage}>
              <MaterialIcons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </PanGestureHandler>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.headerIcon}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Messages</Text>
        <TouchableOpacity style={dynamicStyles.headerIcon}>
          <MaterialIcons name="add" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={dynamicStyles.searchContainer}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} style={dynamicStyles.searchIcon} />
        <TextInput
          style={dynamicStyles.searchInput}
          placeholder="Search messages"
          placeholderTextColor={colors.inputPlaceholder}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={dynamicStyles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetchConversations}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={dynamicStyles.emptyContainer}>
              <Text style={dynamicStyles.emptyText}>No conversations yet. Start messaging!</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
  // No static styles needed for MessagesScreen
});

export default MessagesScreen;