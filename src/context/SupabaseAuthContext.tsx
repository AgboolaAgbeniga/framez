import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { initializeRealtimeSubscriptions, cleanupSubscriptions } from '../lib/realtime';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, userData: { name: string; username: string }) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    console.log('SupabaseAuthProvider useEffect running');

    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const previousUser = user;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle real-time subscriptions
      if (session?.user && !previousUser) {
        // User logged in - initialize subscriptions
        const newSubscriptions = initializeRealtimeSubscriptions(session.user.id);
        setSubscriptions(newSubscriptions);
      } else if (!session?.user && previousUser) {
        // User logged out - cleanup subscriptions
        cleanupSubscriptions(subscriptions);
        setSubscriptions([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      cleanupSubscriptions(subscriptions);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // First check if user exists in profiles table
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (!existingUser) {
      return {
        error: {
          message: 'No account found with this email address. Please check your email or sign up for a new account.',
        }
      };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Provide more specific error messages
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return {
          error: {
            message: 'Incorrect password. Please try again or reset your password.',
          }
        };
      }
      if (error.message.includes('Email not confirmed')) {
        return {
          error: {
            message: 'Please check your email and click the verification link before signing in.',
          }
        };
      }
    }

    return { error };
  };

  const signUp = async (email: string, password: string, userData: { name: string; username: string }) => {
    // Check if user already exists in profiles table
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return {
        error: {
          message: 'An account with this email address already exists. Please try signing in instead.',
        }
      };
    }

    // Generate username from display name if not provided
    const username = userData.username || userData.name.toLowerCase().replace(/\s+/g, '');

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return {
        error: {
          message: 'This username is already taken. Please choose a different one.',
        }
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          username: username,
        },
      },
    });

    if (!error && data.user) {
      // Generate avatar URL from name
      const nameParts = userData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts[1] || '';
      const avatarUrl = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(firstName + '+' + lastName)}`;

      // Create profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: username,
          display_name: userData.name,
          email: email,
          avatar_url: avatarUrl,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't return error here as auth signup succeeded
      }
    }

    // Provide more specific error messages for signup
    if (error) {
      if (error.message.includes('User already registered')) {
        return {
          error: {
            message: 'An account with this email address already exists. Please try signing in instead.',
          }
        };
      }
      if (error.message.includes('Password should be at least')) {
        return {
          error: {
            message: 'Password must be at least 6 characters long.',
          }
        };
      }
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'framez://reset-password',
    });
    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};