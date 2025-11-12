# Framez - Social Media App

A modern, cross-platform social media application built with React Native and Expo, featuring real-time messaging, image sharing, and a beautiful neumorphic design.

## 🚀 Features

- **Cross-Platform**: Runs on iOS, Android, and Web
- **Real-time Messaging**: Instant messaging with push notifications
- **Image Sharing**: Upload and share photos with background processing
- **User Authentication**: Secure authentication with Supabase
- **Beautiful UI**: Neumorphic design with glassmorphism effects
- **Dark/Light Themes**: Dynamic theming system
- **Offline Support**: Background upload capabilities
- **Stories**: Instagram-style stories feature
- **Notifications**: Real-time notifications system

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: TanStack Query (React Query)
- **Navigation**: React Navigation v7
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Icons**: Expo Vector Icons
- **Animations**: React Native Reanimated
- **Forms**: Zod validation
- **Background Tasks**: Expo Background Fetch

## 📱 Screenshots

*Add screenshots of your app here*

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/framez.git
   cd framez
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Copy `.env.local` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.local .env
   ```

   Edit `.env` with your values:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up the database:**

   Follow the database setup instructions in [`scripts/README.md`](./scripts/README.md)

5. **Start the development server:**
   ```bash
   # For web development
   npm run web

   # For iOS simulator
   npm run ios

   # For Android emulator
   npm run android

   # Universal start (choose platform)
   npm start
   ```

## 📁 Project Structure

```
framez/
├── assets/                 # Static assets (images, fonts, icons)
├── scripts/                # Database setup and seeding scripts
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AuroraBackground.tsx
│   │   ├── FastImage.tsx
│   │   ├── GlassCard.tsx
│   │   └── NeumorphicButton.tsx
│   ├── context/            # React contexts
│   │   ├── SupabaseAuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/                # Utility libraries and services
│   │   ├── backgroundUpload.ts
│   │   ├── queries.ts
│   │   ├── queryClient.ts
│   │   ├── realtime.ts
│   │   ├── storage.ts
│   │   ├── supabase.ts
│   │   ├── theme.ts
│   │   └── validations.ts
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   └── react-navigation.d.ts
│   ├── screens/            # App screens
│   │   ├── AuthScreen.tsx
│   │   ├── CreatePostScreen.tsx
│   │   ├── EditProfileScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── MessagesScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── OTPScreen.tsx
│   │   ├── PostDetailScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ResetPasswordScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── SplashScreen.tsx
│   │   └── WelcomeScreen.tsx
│   └── types.ts            # TypeScript type definitions
├── App.tsx                 # Main app component
├── app.json                # Expo configuration
├── index.ts                # App entry point
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🗄️ Database Schema

The app uses Supabase with the following main tables:

- **profiles**: User profiles with avatars, bios, and settings
- **posts**: User posts with images, content, and metadata
- **comments**: Post comments with threading support
- **likes**: Post and comment likes
- **messages**: Direct messages between users
- **follows**: User following relationships
- **notifications**: User notifications

### Storage Buckets

- **avatars**: User profile pictures
- **posts**: Post images
- **messages**: Message attachments
- **stories**: Story images

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

### App Configuration

The app configuration is managed through `app.json`:

- **Name**: framez
- **Version**: 1.0.0
- **Orientation**: Portrait only
- **Platforms**: iOS, Android, Web
- **Themes**: Light mode (configurable)

## 🚀 Deployment

### Building for Production

1. **Configure app.json** for production builds
2. **Set production environment variables**
3. **Build the app:**

   ```bash
   # Build for web
   npx expo export --platform web

   # Build for iOS
   npx expo build:ios

   # Build for Android
   npx expo build:android
   ```

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for production
eas build --platform ios
eas build --platform android
```

## 🧪 Testing

*Add testing instructions here*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - React Native development platform
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [React Navigation](https://reactnavigation.org/) - Navigation library
- [NativeWind](https://www.nativewind.dev/) - Tailwind CSS for React Native
- [React Query](https://tanstack.com/query/) - Data fetching and caching

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ using React Native and Expo**