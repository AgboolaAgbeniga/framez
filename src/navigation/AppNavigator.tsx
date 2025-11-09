import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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

const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Upload') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chat' : 'chat';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00A8A8',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          elevation: 8,
          shadowColor: '#000',
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

const AuthNavigator: React.FC<{ onAuthSuccess: (userData?: any) => void; initialRoute?: string }> = ({ onAuthSuccess, initialRoute = 'SignUp' }) => {
  const [currentEmail, setCurrentEmail] = useState('');

  return (
    <NavigationContainer>
      <AuthStack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <AuthStack.Screen
          name="Login"
          options={{ headerShown: false }}
        >
          {(props) => (
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
          {(props) => (
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
          {(props) => (
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
          {(props) => (
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
          {(props) => (
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
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');
  // For demo purposes, we'll show the main app
  // In a real app, this would check authentication status
  const isAuthenticated = true;

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
        // Default to SignUp screen after onboarding
      }}
      onSignIn={() => {
        setShowOnboarding(false);
        setShowAuth(true);
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
        initialRoute="SignUp" // Default to SignUp after onboarding
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
            backgroundColor: '#fff',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: 'bold',
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
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;