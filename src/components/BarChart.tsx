import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';

interface BarGroup {
  label: string;
  inflow: number;
  outflow: number;
  invest: number;
}

interface Props {
  data: BarGroup[];
  height?: number;
}

const BAR_COLORS = {
  inflow: COLORS.green,
  outflow: COLORS.red,
  invest: COLORS.blue,
};

export default function BarChart({ data, height = 80 }: Props) {
  const maxVal = Math.max(...data.flatMap(d => [d.inflow, d.outflow, d.invest]));

  return (
    <View>
      <View style={[styles.barsRow, { height }]}>
        {data.map((group, i) => {
          const scale = (v: number) => Math.max(2, (v / maxVal) * height * 0.9);
          return (
            <View key={i} style={styles.group}>
              <View style={styles.bars}>
                {(['inflow', 'outflow', 'invest'] as const).map(key => (
                  group[key] > 0 ? (
                    <View
                      key={key}
                      style={[
                        styles.bar,
                        {
                          height: scale(group[key]),
                          backgroundColor: BAR_COLORS[key],
                        },
                      ]}
                    />
                  ) : null
                ))}
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {data.map((group, i) => (
          <View key={i} style={styles.labelCell}>
            <Text style={styles.label}>{group.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        {(['inflow', 'outflow', 'invest'] as const).map(key => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: BAR_COLORS[key] }]} />
            <Text style={styles.legendText}>
              {key === 'inflow' ? 'In' : key === 'outflow' ? 'Out' : 'Invest'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  group: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 5,
    borderRadius: 2,
  },
  labelsRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    gap: 6,
  },
  labelCell: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  legend: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
});
