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
}