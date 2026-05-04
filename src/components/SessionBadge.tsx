import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../constants/theme';

interface Props {
  dark?: boolean;
}

export default function SessionBadge({ dark = false }: Props) {
  return (
    <View style={[styles.badge, dark && styles.badgeDark]}>
      <View style={[styles.dot, dark && styles.dotDark]} />
      <Text style={[styles.text, dark && styles.textDark]}>
        SESSION-ONLY · NO DATA STORED
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    gap: 5,
  },
  badgeDark: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  dotDark: {
    backgroundColor: '#5DCA8A',
  },
  text: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.greenText,
    letterSpacing: 0.3,
  },
  textDark: {
    color: '#A8D4B8',
  },
});
