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

interface OTPScreenProps {
  email: string;
  onVerifyOTP: (otp: string) => void;
  onResendOTP: () => void;
  onBack: () => void;
}

const OTPScreen: React.FC<OTPScreenProps> = ({ email, onVerifyOTP, onResendOTP, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to {email}
        </Text>
      </View>

      {/* OTP Input Fields */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            style={styles.otpInput}
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
      <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOTP}>
        <Text style={styles.verifyButtonText}>Verify Code</Text>
      </TouchableOpacity>

      {/* Resend OTP */}
      <TouchableOpacity style={styles.resendContainer} onPress={handleResendOTP}>
        <Text style={styles.resendText}>Didn't receive the code? </Text>
        <Text style={styles.resendLink}>Resend</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity style={styles.backContainer} onPress={onBack}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#FAFAFA',
  },
  verifyButton: {
    backgroundColor: '#006175',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    color: '#006175',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backContainer: {
    alignItems: 'center',
  },
  backText: {
    color: '#006175',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OTPScreen;