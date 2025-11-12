import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useTheme } from '../context/ThemeContext';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OTPScreen from '../screens/OTPScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import UserProfileScreen from '../screens/ProfileScreen'; // Reuse ProfileScreen for user profiles

const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Upload') {
            iconName = 'add-circle';
          } else if (route.name === 'Messages') {
            iconName = 'chat';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else {
            iconName = 'home';
          }

          return <MaterialIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.navBackground,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.navBorder,
          elevation: 8,
          shadowColor: colors.cardShadow,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          display: 'none', // Hide labels for icon-only design
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Upload" component={CreatePostScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AuthNavigator: React.FC<{ onAuthSuccess: (userData?: any) => void; initialRoute?: string }> = ({ onAuthSuccess, initialRoute = 'SignUp' }: { onAuthSuccess: (userData?: any) => void; initialRoute?: string }) => {
  const [currentEmail, setCurrentEmail] = useState('');
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <AuthStack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
            color: colors.textPrimary,
          },
        }}
      >
        <AuthStack.Screen
          name="Login"
          options={{ headerShown: false }}
        >
          {(props: any) => (
            <LoginScreen
              onSignUp={() => props.navigation.navigate('SignUp')}
              onLogin={(credentials) => {
                // Handle login logic here
                console.log('Login:', credentials);
                onAuthSuccess();
              }}
              onForgotPassword={() => props.navigation.navigate('ForgotPassword')}
            />
          )}
        </AuthStack.Screen>
        <AuthStack.Screen
          name="SignUp"
          options={{ headerShown: false }}
        >
          {(props: any) => (
            <SignUpScreen
              onSignIn={() => props.navigation.navigate('Login')}
              onSignUp={(userData) => {
                // Handle sign up logic here
                console.log('Sign up:', userData);

                // Simulate email notification
                console.log(`Email sent to ${userData.email}: Welcome to Framez! Your account has been created successfully.`);

                // Pass user data to show welcome screen
                onAuthSuccess(userData);
              }}
            />
          )}
        </AuthStack.Screen>
        <AuthStack.Screen
          name="ForgotPassword"
          options={{ headerShown: false }}
        >
          {(props: any) => (
            <ForgotPasswordScreen
              onSendOTP={(email) => {
                setCurrentEmail(email);
                console.log(`OTP sent to ${email}`);
                props.navigation.navigate('OTP');
              }}
              onBackToLogin={() => props.navigation.goBack()}
            />
          )}
        </AuthStack.Screen>
        <AuthStack.Screen
          name="OTP"
          options={{ headerShown: false }}
        >
          {(props: any) => (
            <OTPScreen
              email={currentEmail}
              onVerifyOTP={(otp) => {
                console.log('OTP verified:', otp);
                props.navigation.navigate('ResetPassword');
              }}
              onResendOTP={() => {
                console.log(`OTP resent to ${currentEmail}`);
              }}
              onBack={() => props.navigation.goBack()}
            />
          )}
        </AuthStack.Screen>
        <AuthStack.Screen
          name="ResetPassword"
          options={{ headerShown: false }}
        >
          {(props: any) => (
            <ResetPasswordScreen
              onResetPassword={(newPassword, confirmPassword) => {
                console.log('Password reset successful');
                // Navigate back to login
                props.navigation.popToTop();
              }}
            />
          )}
        </AuthStack.Screen>
      </AuthStack.Navigator>
    </NavigationContainer>
  );
};

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  console.log('AppNavigator rendering');
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');
  const [authInitialRoute, setAuthInitialRoute] = useState<'SignUp' | 'Login'>('SignUp');
  // Check authentication status with Supabase
  const { user, loading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  // Show loading screen while checking auth status
  if (loading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => {
      setShowSplash(false);
      setShowOnboarding(true);
    }} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen
      onFinish={() => {
        setShowOnboarding(false);
        setShowAuth(true);
        setAuthInitialRoute('SignUp');
        // Default to SignUp screen after onboarding
      }}
      onSignIn={() => {
        setShowOnboarding(false);
        setShowAuth(true);
        setAuthInitialRoute('Login');
        // Will show Login screen
      }}
    />;
  }

  if (showAuth) {
    return (
      <AuthNavigator
        onAuthSuccess={(userData?: any) => {
          if (userData) {
            // This is a signup success, show welcome screen
            setUserName(userData.name);
            setShowAuth(false);
            setShowWelcome(true);
          } else {
            // This is a login success, go directly to main app
            setShowAuth(false);
          }
        }}
        initialRoute={authInitialRoute}
      />
    );
  }

  if (showWelcome) {
    return <WelcomeScreen
      userName={userName}
      onContinue={() => setShowWelcome(false)}
    />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
            color: colors.textPrimary,
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Messages"
              component={MessagesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;