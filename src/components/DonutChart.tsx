import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { CategorySummary } from '../types';
import { COLORS, FONT_SIZE } from '../constants/theme';

interface Props {
  categories: CategorySummary[];
  totalLabel: string;
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export default function DonutChart({ categories, totalLabel, size = 200 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.42;
  const innerR = size * 0.27;
  const gap = 2; // gap between segments in degrees

  const total = categories.reduce((s, c) => s + c.total, 0);
  let currentAngle = 0;

  const segments = categories.map(cat => {
    const sweep = (cat.total / total) * 360;
    const startAngle = currentAngle + gap / 2;
    const endAngle = currentAngle + sweep - gap / 2;
    currentAngle += sweep;
    return { ...cat, startAngle, endAngle };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {segments.map(seg => {
          const arcSweep = seg.endAngle - seg.startAngle;
          if (arcSweep < 1) return null;
          const d = describeArc(cx, cy, (outerR + innerR) / 2, seg.startAngle, seg.endAngle);
          return (
            <Path
              key={seg.category}
              d={d}
              stroke={seg.color}
              strokeWidth={outerR - innerR}
              strokeLinecap="butt"
              fill="none"
            />
          );
        })}
        <Circle cx={cx} cy={cy} r={innerR} fill={COLORS.background} />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.amount}>{totalLabel}</Text>
        <Text style={styles.label}>OUTFLOW</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
});
