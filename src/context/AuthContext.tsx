import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConvexProviderWithAuth, ConvexReactClient, useConvexAuth, useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { User } from '../types';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

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
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useDummyAuth}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </ConvexProviderWithAuth>
  );
};

const AuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setUser(currentUser);
    } else {
      setUser(null);
    }
  }, [isAuthenticated, currentUser]);

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
    isLoading: isLoading || (isAuthenticated && !currentUser),
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};