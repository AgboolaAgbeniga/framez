import React from 'react';
import { Image as RNImage } from 'react-native';
import { Image } from 'expo-image';

// Simplified FastImage component using expo-image
interface FastImageProps {
  source: { uri: string } | number;
  style?: any;
  placeholder?: string | number;
  transition?: number;
  cachePolicy?: 'memory' | 'disk' | 'memory-disk';
  priority?: 'low' | 'normal' | 'high';
  [key: string]: any;
}

const FastImage: React.FC<FastImageProps> = ({
  source,
  style,
  placeholder,
  transition = 200,
  cachePolicy = 'memory-disk',
  priority = 'normal',
  ...props
}) => {
  // Handle static image sources (require() calls)
  if (typeof source === 'number') {
    return <RNImage source={source} style={style} {...props} />;
  }

  // Handle URI sources with expo-image for better performance
  const imageSource = {
    uri: source.uri,
  };

  // Placeholder configuration
  let placeholderSource;
  if (placeholder) {
    if (typeof placeholder === 'string') {
      placeholderSource = { uri: placeholder };
    } else if (typeof placeholder === 'number') {
      placeholderSource = placeholder;
    }
  }

  return (
    <Image
      source={imageSource}
      style={style}
      placeholder={placeholderSource}
      transition={transition}
      cachePolicy={cachePolicy}
      priority={priority}
      contentFit="cover"
      {...props}
    />
  );
};

export default FastImage;