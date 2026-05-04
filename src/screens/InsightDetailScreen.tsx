import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Insight, InsightType } from '../types';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../constants/theme';

const BADGE_STYLES: Record<InsightType, { bg: string; text: string }> = {
  watch: { bg: COLORS.redLight, text: COLORS.red },
  pattern: { bg: COLORS.amberLight, text: COLORS.amber },
  strength: { bg: COLORS.greenLight, text: COLORS.green },
};

function fmtFull(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default function InsightDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { insight, index, total } = route.params as {
    insight: Insight;
    index: number;
    total: number;
  };

  const badge = BADGE_STYLES[insight.type];
  const d = insight.detail;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Nav bar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navCounter}>INSIGHT {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Type badge */}
          <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.typeBadgeText, { color: badge.text }]}>
              {insight.type.toUpperCase()}
            </Text>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>{d.headline}</Text>

          {/* Comparison card */}
          <View style={styles.compareCard}>
            <View style={styles.compareRow}>
              <View style={styles.compareCol}>
                <Text style={styles.compareLabel}>{d.primaryLabel}</Text>
                <Text style={[styles.compareAmount, { color: COLORS.red }]}>
                  {fmtFull(d.primaryAmount)}
                </Text>
                {insight.detail.primaryLabel.includes('QUICK') && (
                  <Text style={styles.compareSubLabel}>{insight.tags[0] || ''} · APR</Text>
                )}
              </View>
              {d.secondaryLabel && d.secondaryAmount !== undefined && (
                <View style={styles.compareCol}>
                  <Text style={styles.compareLabel}>{d.secondaryLabel}</Text>
                  <Text style={styles.compareAmount}>
                    {fmtFull(d.secondaryAmount)}
                  </Text>
                  {d.secondaryLabel.includes('GROCER') && (
                    <Text style={styles.compareSubLabel}>3 SHOPS · APR</Text>
                  )}
                </View>
              )}
            </View>

            {/* Comparison bar */}
            {d.secondaryAmount !== undefined && (
              <>
                <View style={styles.compBarTrack}>
                  <View
                    style={[
                      styles.compBarFill,
                      {
                        width: `${Math.min(100, Math.round((d.primaryAmount / (d.primaryAmount + d.secondaryAmount)) * 100))}%`,
                        backgroundColor: COLORS.red,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.comparisonText}>
                  {d.comparisonText}
                </Text>
              </>
            )}
          </View>

          {/* Stats cards */}
          <View style={styles.statsRow}>
            {d.stats.map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Suggestion card (dark) */}
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTag}>SUGGESTED CUT · {d.suggestTag}</Text>
            <Text style={styles.suggestionText}>{d.suggestion}</Text>
            {d.savingsPerMonth && d.savingsPerMonth > 0 ? (
              <View style={styles.savingsRow}>
                <Text style={styles.savingsAmount}>{fmtFull(d.savingsPerMonth)}</Text>
                <Text style={styles.savingsLabel}>/MONTH BACK</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.disclaimer}>
            These are observations, not advice. Review before acting.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 28,
    color: COLORS.textPrimary,
    marginTop: -4,
  },
  navCounter: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
  },

  scroll: { flex: 1 },
  container: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },

  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  headline: {
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 36,
  },

  compareCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compareCol: {
    gap: 3,
  },
  compareLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  compareAmount: {
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  compareSubLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },

  compBarTrack: {
    height: 8,
    backgroundColor: COLORS.greenLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  compBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  comparisonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  suggestionCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  suggestionTag: {
    fontSize: FONT_SIZE.xs,
    color: '#8AB59A',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  suggestionText: {
    fontSize: 22,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: '#FFFFFF',
    lineHeight: 30,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: SPACING.xs,
  },
  savingsAmount: {
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  savingsLabel: {
    fontSize: FONT_SIZE.sm,
    color: '#8AB59A',
    fontWeight: '600',
  },

  disclaimer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
