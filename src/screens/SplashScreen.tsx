import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 5000); // Show splash for 5 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      {/* Circular shapes */}
      <View style={[styles.circle, { top: height * 0.1, left: width * 0.1, width: 60, height: 60 }]} />
      <View style={[styles.circle, { top: height * 0.2, right: width * 0.15, width: 40, height: 40 }]} />
      <View style={[styles.circle, { top: height * 0.4, left: width * 0.2, width: 50, height: 50 }]} />
      <View style={[styles.circle, { bottom: height * 0.3, right: width * 0.1, width: 45, height: 45 }]} />
      <View style={[styles.circle, { bottom: height * 0.2, left: width * 0.15, width: 55, height: 55 }]} />
      <View style={[styles.circle, { bottom: height * 0.1, right: width * 0.2, width: 35, height: 35 }]} />

      {/* Tiny shapes */}
      <View style={[styles.plus, { top: height * 0.15, left: width * 0.5 }]} />
      <View style={[styles.rectangle, { top: height * 0.25, right: width * 0.3 }]} />
      <View style={[styles.square, { top: height * 0.35, left: width * 0.3 }]} />
      <View style={[styles.star, { bottom: height * 0.25, left: width * 0.4 }]} />
      <View style={[styles.plus, { bottom: height * 0.15, right: width * 0.4 }]} />
      <View style={[styles.star, { top: height * 0.45, right: width * 0.5 }]} />

      {/* App name */}
      <Text style={styles.appName}>Framez</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE', // Milky white background
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: '#006175',
  },
  plus: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#FF6B6B', // Bright red
  },
  rectangle: {
    position: 'absolute',
    width: 25,
    height: 15,
    backgroundColor: '#4ECDC4', // Bright teal
  },
  square: {
    position: 'absolute',
    width: 18,
    height: 18,
    backgroundColor: '#FFD93D', // Bright yellow
  },
  star: {
    position: 'absolute',
    width: 22,
    height: 22,
    backgroundColor: '#A8E6CF', // Bright green
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});

export default SplashScreen;