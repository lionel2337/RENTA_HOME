import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Borders, Shadows } from '@/constants/theme';

interface GlassCardProps extends ViewProps {
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
}

export function GlassCard({ style, children, intensity = 'medium', ...otherProps }: GlassCardProps) {
  const theme = useTheme();

  const getGlassStyle = (): ViewStyle => {
    const isDark = theme.text === '#F3F4F6'; // Quick check for dark mode
    
    let backgroundColor = '';
    let borderColor = '';

    if (isDark) {
      backgroundColor = intensity === 'light' 
        ? 'rgba(19, 17, 39, 0.45)' 
        : intensity === 'medium'
          ? 'rgba(19, 17, 39, 0.75)'
          : 'rgba(9, 7, 20, 0.9)';
      borderColor = 'rgba(34, 30, 66, 0.6)';
    } else {
      backgroundColor = intensity === 'light' 
        ? 'rgba(255, 255, 255, 0.5)' 
        : intensity === 'medium'
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(250, 249, 246, 0.95)';
      borderColor = 'rgba(239, 236, 230, 0.8)';
    }

    return {
      backgroundColor,
      borderColor,
      borderWidth: Borders.widthThin,
      borderRadius: Borders.radiusMD,
      ...Shadows.light,
    };
  };

  return (
    <View 
      style={[styles.base, getGlassStyle(), style]} 
      {...otherProps}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 16,
    overflow: 'hidden',
  },
});
