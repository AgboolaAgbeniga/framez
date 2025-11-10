export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Post {
  _id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  user?: {
    name: string;
    avatarUrl?: string;
  } | null;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
}

export interface Comment {
  _id: string;
  postId: string;
  userId: string;
  content: string;
  timestamp: number;
  user?: {
    name: string;
    avatarUrl?: string;
  } | null;
}

export interface Like {
  _id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  timestamp: number;
}

export interface Follow {
  _id: string;
  followerId: string;
  followingId: string;
  timestamp: number;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  sender?: {
    name: string;
    avatarUrl?: string;
  } | null;
  receiver?: {
    name: string;
    avatarUrl?: string;
  } | null;
}