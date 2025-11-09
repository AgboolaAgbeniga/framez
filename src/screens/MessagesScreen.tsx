import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

interface Message {
  id: string;
  sender: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

const MessagesScreen: React.FC = () => {
  // Mock data for demonstration
  const messages: Message[] = [
    {
      id: '1',
      sender: 'Alice Johnson',
      lastMessage: 'Hey! How are you doing?',
      timestamp: '2 min ago',
      unread: true,
    },
    {
      id: '2',
      sender: 'Bob Smith',
      lastMessage: 'Thanks for the recommendation!',
      timestamp: '1 hour ago',
      unread: false,
    },
    {
      id: '3',
      sender: 'Carol Williams',
      lastMessage: 'See you at the event tomorrow',
      timestamp: '3 hours ago',
      unread: true,
    },
    {
      id: '4',
      sender: 'David Brown',
      lastMessage: 'Great meeting you today!',
      timestamp: '1 day ago',
      unread: false,
    },
  ];

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.sender.charAt(0)}</Text>
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{item.sender}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <Text style={[styles.lastMessage, item.unread && styles.unreadMessage]}>
          {item.lastMessage}
        </Text>
      </View>
      {item.unread && <View style={styles.unreadDot} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00A8A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#333',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00A8A8',
  },
});

export default MessagesScreen;