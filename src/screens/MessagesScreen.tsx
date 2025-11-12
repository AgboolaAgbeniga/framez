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
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import type { PanGestureHandlerGestureEvent, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useConversations, useChatMessages, useSendMessage } from '../lib/queries';
import FastImage from '../components/FastImage';

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: string;
  timestamp: number;
  unread: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  isSender: boolean;
  timestamp: string;
}

const MessagesScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { user } = useSupabaseAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // React Query hooks
  const { data: conversations = [], isLoading: loading } = useConversations(user?.id);
  const { data: chatMessages = [] } = useChatMessages(selectedChat || '', user?.id || '');
  const sendMessageMutation = useSendMessage();

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
        // Start new conversation with direct user info
        setSelectedChat(directUserId);
      }
    }
  }, [directUserId, directUserName, conversations, user?.id]);


  const selectedChatData = conversations.find(chat => chat.id === selectedChat) || (directUserId && directUserName ? {
    id: directUserId,
    otherUserId: directUserId,
    otherUserName: directUserName,
    otherUserAvatar: 'https://avatar.iran.liara.run/public/boy', // Default avatar
    lastMessage: '',
    timestamp: Date.now(),
    unread: false,
  } : null);

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() => {
        setSelectedChat(item.id);
      }}
    >
      <FastImage source={{ uri: item.otherUserAvatar }} style={styles.avatar} />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{item.otherUserName}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <Text style={[styles.lastMessage, item.unread && styles.unreadMessage]}>
          {item.lastMessage}
        </Text>
      </View>
      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.chatMessageContainer,
      item.isSender ? styles.senderMessage : styles.receiverMessage
    ]}>
      <Text style={[
        styles.chatMessageText,
        item.isSender ? styles.senderText : styles.receiverText
      ]}>
        {item.text}
      </Text>
      <Text style={styles.chatTimestamp}>{item.timestamp}</Text>
    </View>
  );

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user?.id) return;

    try {
      const otherUserId = selectedChat.includes('_')
        ? selectedChat.split('_').find(id => id !== user.id)
        : selectedChat;

      if (!otherUserId) return;

      // Use React Query mutation
      await sendMessageMutation.mutateAsync({
        senderId: user.id,
        receiverId: otherUserId,
        content: newMessage.trim(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  if (selectedChat) {
    const { height: screenHeight } = Dimensions.get('window');
    const inputContainerHeight = 70; // Approximate height of message input container
    const availableHeight = screenHeight - keyboardHeight - inputContainerHeight - 100; // 100 for header

    return (
      <PanGestureHandler
        onGestureEvent={handleGesture}
        onHandlerStateChange={handleGestureStateChange}
      >
        <View style={styles.container}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
            <FastImage source={{ uri: selectedChatData?.otherUserAvatar }} style={styles.chatAvatar} />
            <Text style={styles.chatUserName}>{selectedChatData?.otherUserName}</Text>
          </View>

          {/* Messages */}
          <View style={[styles.messagesContainer, { height: availableHeight }]}>
            <FlatList
              ref={flatListRef}
              data={chatMessages}
              renderItem={renderChatMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chatContainer}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          </View>

          {/* Message Input - Positioned absolutely above keyboard */}
          <View style={[
            styles.messageInputContainer,
            {
              position: 'absolute',
              bottom: keyboardHeight || 0,
              left: 0,
              right: 0,
            }
          ]}>
            <TouchableOpacity style={styles.attachmentButton}>
              <MaterialIcons name="attach-file" size={24} color="#8E8E93" />
            </TouchableOpacity>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <MaterialIcons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </PanGestureHandler>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <MaterialIcons name="add" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006175" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversations yet. Start messaging!</Text>
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
  // Search styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  // Messages list styles
  listContainer: {
    paddingHorizontal: 20,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 15,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  lastMessage: {
    fontSize: 14,
    color: '#8E8E93',
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#000000',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  // Chat window styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  chatUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  chatContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  chatMessageContainer: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  senderMessage: {
    alignSelf: 'flex-end',
  },
  receiverMessage: {
    alignSelf: 'flex-start',
  },
  chatMessageText: {
    padding: 12,
    borderRadius: 18,
    fontSize: 16,
    lineHeight: 20,
  },
  senderText: {
    backgroundColor: '#FF3B30',
    color: '#FFFFFF',
  },
  receiverText: {
    backgroundColor: '#F2F2F7',
    color: '#000000',
  },
  chatTimestamp: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 5,
    textAlign: 'right',
  },
  // Message input styles
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  attachmentButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  messagesContainer: {
    flex: 1,
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
  },
});

export default MessagesScreen;