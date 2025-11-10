import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

// Dummy auth hook for demo purposes
const useDummyAuth = () => ({
  isAuthenticated: true,
  isLoading: false,
  fetchAccessToken: async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => null,
});

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProviderInner>{children}</AuthProviderInner>;
};

const AuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async () => {
    // For demo purposes, we'll simulate authentication
    // In a real app, this would integrate with OAuth providers
    console.log('Sign in initiated');
  };

  const signUp = async () => {
    // For demo purposes, we'll simulate authentication
    console.log('Sign up initiated');
  };

  const signOut = async () => {
    // Convex sign out
    console.log('Sign out');
  };

  const value: AuthContextType = {
    user,
    isLoading: false,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};