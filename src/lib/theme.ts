// Theme configuration for Framez app
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Primary Palette
  primary: string;
  secondary: string;
  accent: string;

  // Backgrounds
  background: string;
  surface: string;

  // Text
  textPrimary: string;
  textSecondary: string;

  // Semantic
  error: string;
  success: string;

  // Glassmorphism
  glassBackground: string;
  glassBorder: string;

  // Component specific
  cardShadow: string;
  divider: string;
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;

  // Navigation
  navBackground: string;
  navBorder: string;

  // Interactive states
  ripple: string;
  focus: string;
}

export const lightTheme: ThemeColors = {
  // Primary Palette
  primary: '#4A90E2',
  secondary: '#50E3C2',
  accent: '#B3D4FC',

  // Backgrounds
  background: '#F5F9FF',
  surface: '#E3ECF8',

  // Text
  textPrimary: '#1C1C1E',
  textSecondary: '#5E6C84',

  // Semantic
  error: '#E35B5B',
  success: '#5EBE7E',

  // Glassmorphism
  glassBackground: 'rgba(255, 255, 255, 0.25)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',

  // Component specific
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  divider: 'rgba(0, 0, 0, 0.1)',
  inputBackground: 'rgba(255, 255, 255, 0.8)',
  inputBorder: '#B3D4FC',
  inputPlaceholder: '#888888',

  // Navigation
  navBackground: 'rgba(255, 255, 255, 0.25)',
  navBorder: 'rgba(255, 255, 255, 0.3)',

  // Interactive states
  ripple: 'rgba(74, 144, 226, 0.2)',
  focus: '#4A90E2',
};

export const darkTheme: ThemeColors = {
  // Primary Palette
  primary: '#357ABD',
  secondary: '#3CBFAE',
  accent: '#8AB4F8',

  // Backgrounds
  background: '#121212',
  surface: '#1E1E1E',

  // Text
  textPrimary: '#F2F2F2',
  textSecondary: '#B3B3B3',

  // Semantic
  error: '#FF6B6B',
  success: '#52A86F',

  // Glassmorphism
  glassBackground: 'rgba(0, 0, 0, 0.35)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Component specific
  cardShadow: 'rgba(0, 0, 0, 0.4)',
  divider: 'rgba(255, 255, 255, 0.1)',
  inputBackground: 'rgba(255, 255, 255, 0.05)',
  inputBorder: '#444444',
  inputPlaceholder: '#AAAAAA',

  // Navigation
  navBackground: 'rgba(0, 0, 0, 0.80)',
  navBorder: 'rgba(255, 255, 255, 0.1)',

  // Interactive states
  ripple: 'rgba(53, 122, 189, 0.2)',
  focus: '#357ABD',
};

export const getTheme = (mode: ThemeMode): ThemeColors => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

// Typography configuration
export const typography = {
  appName: {
    fontFamily: 'CaesarDressing-Regular',
    fontSize: 48,
    fontWeight: '400' as const,
  },
  headline: {
    fontFamily: 'CaesarDressing-Regular',
    fontSize: 24,
    fontWeight: '400' as const,
  },
  subtitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    fontWeight: '500' as const,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: 'Inter-Light',
    fontSize: 12,
    fontWeight: '300' as const,
  },
  button: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    fontWeight: '500' as const,
  },
};

// Component style constants
export const borderRadius = {
  small: 8,
  medium: 10,
  large: 12,
  xl: 16,
  xxl: 24,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const shadows = {
  light: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
  },
  dark: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 3,
    },
  },
};