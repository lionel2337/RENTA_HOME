import React from 'react';
import { View, StyleSheet, Pressable, Text, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Colors, Spacing, Borders, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface BentoItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  size: 'large' | 'medium' | 'small';
  color: string;
}

interface BentoGridProps {
  items: BentoItem[];
  onPressItem: (id: string) => void;
  activeId?: string;
}

export function BentoGrid({ items, onPressItem, activeId }: BentoGridProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Row 1 */}
      <View style={styles.row}>
        {items.filter(item => item.size === 'large').map(item => (
          <Pressable
            key={item.id}
            onPress={() => onPressItem(item.id)}
            style={({ pressed }) => [
              styles.largeCard,
              { 
                backgroundColor: activeId === item.id ? theme.primaryLight : theme.cardBackground,
                borderColor: activeId === item.id ? theme.primary : theme.cardBorder,
                borderWidth: Borders.widthThin,
                borderRadius: Borders.radiusMD,
                opacity: pressed ? 0.9 : 1,
                ...Shadows.light,
              }
            ]}
          >
            <View style={[styles.iconWrapper, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={28} color={activeId === item.id ? theme.primary : item.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        {items.filter(item => item.size !== 'large').map(item => (
          <Pressable
            key={item.id}
            onPress={() => onPressItem(item.id)}
            style={({ pressed }) => [
              styles.smallCard,
              {
                backgroundColor: activeId === item.id ? theme.primaryLight : theme.cardBackground,
                borderColor: activeId === item.id ? theme.primary : theme.cardBorder,
                borderWidth: Borders.widthThin,
                borderRadius: Borders.radiusMD,
                opacity: pressed ? 0.9 : 1,
                ...Shadows.light,
              }
            ]}
          >
            <Ionicons name={item.icon} size={22} color={activeId === item.id ? theme.primary : item.color} />
            <Text style={[styles.smallTitle, { color: theme.text }]}>{item.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    width: '100%',
    paddingVertical: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  largeCard: {
    flex: 1,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 80,
  },
  smallCard: {
    flex: 1,
    padding: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    minHeight: 70,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Borders.radiusSM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  smallTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
