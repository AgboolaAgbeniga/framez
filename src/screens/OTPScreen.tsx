import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { typography, borderRadius, spacing } from '../lib/theme';

interface OTPScreenProps {
  email: string;
  onVerifyOTP: (otp: string) => void;
  onResendOTP: () => void;
  onBack: () => void;
}

const OTPScreen: React.FC<OTPScreenProps> = ({ email, onVerifyOTP, onResendOTP, onBack }) => {
  const { colors } = useTheme();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xxxl,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    title: {
      ...typography.headline,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    subtitle: {
      ...typography.subtitle,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xxxl,
      paddingHorizontal: spacing.xl,
    },
    otpInput: {
      width: 45,
      height: 45,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: borderRadius.small,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    verifyButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.medium,
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    verifyButtonText: {
      ...typography.button,
      color: '#FFFFFF',
    },
    resendContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    resendText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    resendLink: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    backContainer: {
      alignItems: 'center',
    },
    backText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '500',
    },
  });

  const handleOTPChange = (value: string, index: number) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    onVerifyOTP(otpString);
  };

  const handleResendOTP = () => {
    onResendOTP();
    Alert.alert('OTP Sent', 'A new verification code has been sent to your email');
  };

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.scrollContainer}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Verify Your Email</Text>
        <Text style={dynamicStyles.subtitle}>
          We've sent a 6-digit verification code to {email}
        </Text>
      </View>

      {/* OTP Input Fields */}
      <View style={dynamicStyles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            style={[dynamicStyles.otpInput, staticStyles.otpInput]}
            value={digit}
            onChangeText={(value) => handleOTPChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Verify Button */}
      <TouchableOpacity style={dynamicStyles.verifyButton} onPress={handleVerifyOTP}>
        <Text style={dynamicStyles.verifyButtonText}>Verify Code</Text>
      </TouchableOpacity>

      {/* Resend OTP */}
      <TouchableOpacity style={dynamicStyles.resendContainer} onPress={handleResendOTP}>
        <Text style={dynamicStyles.resendText}>Didn't receive the code? </Text>
        <Text style={dynamicStyles.resendLink}>Resend</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity style={dynamicStyles.backContainer} onPress={onBack}>
        <Text style={dynamicStyles.backText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
  otpInput: {
    width: 45,
    height: 45,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default OTPScreen;