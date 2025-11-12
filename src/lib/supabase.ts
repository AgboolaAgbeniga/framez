import { createClient } from '@supabase/supabase-js';

console.log('Initializing Supabase client');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types (generated from Supabase)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          email: string;
          bio: string | null;
          avatar_url: string | null;
          website: string | null;
          is_verified: boolean;
          is_private: boolean;
          status: 'active' | 'suspended' | 'deleted';
          created_at: string;
          updated_at: string;
          display_name_last_updated: string | null;
          username_last_updated: string | null;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          email: string;
          bio?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          is_verified?: boolean;
          is_private?: boolean;
          status?: 'active' | 'suspended' | 'deleted';
          created_at?: string;
          updated_at?: string;
          display_name_last_updated?: string | null;
          username_last_updated?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          email?: string;
          bio?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          is_verified?: boolean;
          is_private?: boolean;
          status?: 'active' | 'suspended' | 'deleted';
          created_at?: string;
          updated_at?: string;
          display_name_last_updated?: string | null;
          username_last_updated?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string | null;
          image_urls: string[] | null;
          video_url: string | null;
          visibility: 'public' | 'followers' | 'private';
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content?: string | null;
          image_urls?: string[] | null;
          video_url?: string | null;
          visibility?: 'public' | 'followers' | 'private';
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string | null;
          image_urls?: string[] | null;
          video_url?: string | null;
          visibility?: 'public' | 'followers' | 'private';
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_comment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_comment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          parent_comment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string | null;
          message_type: 'text' | 'image' | 'video' | 'file';
          file_url: string | null;
          reply_to_message_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string | null;
          message_type?: 'text' | 'image' | 'video' | 'file';
          file_url?: string | null;
          reply_to_message_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string | null;
          message_type?: 'text' | 'image' | 'video' | 'file';
          file_url?: string | null;
          reply_to_message_id?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          content: string;
          related_post_id: string | null;
          related_user_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          content: string;
          related_post_id?: string | null;
          related_user_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          content?: string;
          related_post_id?: string | null;
          related_user_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_status: 'active' | 'suspended' | 'deleted';
      post_visibility: 'public' | 'followers' | 'private';
      message_type: 'text' | 'image' | 'video' | 'file';
    };
  };
};