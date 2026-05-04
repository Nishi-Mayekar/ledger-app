import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import SessionBadge from '../components/SessionBadge';
import { generateInsights, getOpportunities } from '../utils/insights';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../constants/theme';

const EFFORT_COLORS: Record<string, { bg: string; text: string }> = {
  'LOW EFFORT': { bg: COLORS.greenLight, text: COLORS.greenText },
  '5 MINUTES': { bg: COLORS.blueLight, text: COLORS.blue },
  'SELF-CAP': { bg: COLORS.amberLight, text: COLORS.amber },
  'STRENGTH': { bg: COLORS.greenLight, text: COLORS.greenText },
};

function getEffortStyle(tag: string) {
  return EFFORT_COLORS[tag] || { bg: COLORS.surface, text: COLORS.textSecondary };
}

const RANK_COLORS = [COLORS.red, COLORS.amber, COLORS.blue];

export default function SaveScreen() {
  const { transactions } = useApp();

  const insights = useMemo(() => generateInsights(transactions), [transactions]);
  const opportunities = useMemo(() => getOpportunities(insights), [insights]);
  const totalSavings = opportunities.reduce((s, o) => s + o.savingsPerMonth, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Opportunities</Text>
            <Text style={styles.screenSub}>
              {opportunities.length} low-effort changes · ranked by ₹ impact
            </Text>
          </View>
          <SessionBadge />
        </View>

        {/* Hero savings card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>You could free up</Text>
          <View style={styles.heroAmountRow}>
            <Text style={styles.heroRupee}>₹</Text>
            <Text style={styles.heroAmount}>
              {Math.round(totalSavings).toLocaleString('en-IN')}
            </Text>
          </View>
          <Text style={styles.heroSub}>
            per month · across {opportunities.length} low-effort changes
          </Text>
        </View>

        {/* Opportunities list */}
        <View style={styles.list}>
          {opportunities.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Not enough data yet</Text>
              <Text style={styles.emptyText}>
                Paste more bank SMS to surface savings opportunities.
              </Text>
            </View>
          ) : (
            opportunities.map((op) => {
              const effortStyle = getEffortStyle(op.effortTag);
              const rankColor = RANK_COLORS[(op.rank - 1) % RANK_COLORS.length];

              return (
                <View
                  key={op.rank}
                  style={[styles.opCard, { borderLeftColor: rankColor }]}
                >
                  <View style={styles.opTop}>
                    <Text style={[styles.opRank, { color: rankColor }]}>
                      {String(op.rank).padStart(2, '0')}
                    </Text>
                    <View style={styles.opMain}>
                      <Text style={styles.opTitle}>{op.title}</Text>
                      <Text style={styles.opDesc}>{op.description}</Text>
                      <View style={styles.opBottom}>
                        <View style={[styles.effortTag, { backgroundColor: effortStyle.bg }]}>
                          <Text style={[styles.effortText, { color: effortStyle.text }]}>
                            {op.effortTag}
                          </Text>
                        </View>
                        <Text style={styles.opSavings}>
                          ₹{Math.round(op.savingsPerMonth).toLocaleString('en-IN')}
                          <Text style={styles.opSavingsSub}> /MO</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Disclaimer */}
        {opportunities.length > 0 && (
          <Text style={styles.disclaimer}>
            These are observations, not financial advice.{'\n'}
            Review each suggestion before acting.
          </Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  screenTitle: {
    fontSize: 34,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  screenSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  heroCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  heroLabel: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroRupee: {
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: COLORS.green,
    marginTop: 4,
  },
  heroAmount: {
    fontSize: 56,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: COLORS.green,
    lineHeight: 60,
  },
  heroSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },

  list: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },

  opCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 3,
  },
  opTop: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  opRank: {
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: '700',
    lineHeight: 32,
  },
  opMain: {
    flex: 1,
    gap: SPACING.xs,
  },
  opTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  opDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  opBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  effortTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  effortText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  opSavings: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  opSavingsSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  disclaimer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.lg,
    lineHeight: 18,
  },
});
