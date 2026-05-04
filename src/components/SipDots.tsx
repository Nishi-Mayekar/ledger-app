import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  total?: number;
  onSchedule?: number;
}

export default function SipDots({ total = 12, onSchedule = 10 }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < onSchedule ? styles.dotOn : styles.dotMissed,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotOn: {
    backgroundColor: COLORS.green,
  },
  dotMissed: {
    backgroundColor: COLORS.greenLight,
    borderWidth: 1.5,
    borderColor: COLORS.green,
  },
});
