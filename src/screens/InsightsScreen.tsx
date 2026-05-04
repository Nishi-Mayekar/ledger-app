import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import SessionBadge from '../components/SessionBadge';
import { generateInsights } from '../utils/insights';
import { Insight, InsightType } from '../types';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../constants/theme';

type Filter = 'All' | 'Watch' | 'Pattern' | 'Strength';

const BADGE_STYLES: Record<InsightType, { bg: string; text: string }> = {
  watch: { bg: COLORS.redLight, text: COLORS.red },
  pattern: { bg: COLORS.amberLight, text: COLORS.amber },
  strength: { bg: COLORS.greenLight, text: COLORS.green },
};

function InsightCard({ insight, onPress }: { insight: Insight; onPress: () => void }) {
  const badge = BADGE_STYLES[insight.type];
  return (
    <TouchableOpacity style={styles.insightCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.insightCardInner}>
        <View style={styles.cardTop}>
          <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.typeBadgeText, { color: badge.text }]}>
              {insight.type.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>

        <Text style={styles.insightTitle}>{insight.title}</Text>
        <Text style={styles.insightDesc}>{insight.description}</Text>

        {/* Tags row */}
        <View style={styles.tagsRow}>
          {insight.tags.map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function InsightsScreen() {
  const navigation = useNavigation<any>();
  const { transactions } = useApp();
  const [filter, setFilter] = useState<Filter>('All');

  const insights = useMemo(() => generateInsights(transactions), [transactions]);

  const counts: Record<Filter, number> = {
    All: insights.length,
    Watch: insights.filter(i => i.type === 'watch').length,
    Pattern: insights.filter(i => i.type === 'pattern').length,
    Strength: insights.filter(i => i.type === 'strength').length,
  };

  const filtered = filter === 'All'
    ? insights
    : insights.filter(i => i.type === filter.toLowerCase() as InsightType);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Insights</Text>
            <Text style={styles.screenSub}>
              {insights.length} observations from this session's parse
            </Text>
          </View>
          <SessionBadge />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {(['All', 'Watch', 'Pattern', 'Strength'] as Filter[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
                {f} {counts[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Insight cards */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>
              No insights in this category. Paste more SMS for richer analysis.
            </Text>
          ) : (
            filtered.map((insight, idx) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onPress={() =>
                  navigation.navigate('InsightDetail', { insight, index: idx, total: filtered.length })
                }
              />
            ))
          )}
        </View>

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

  filterScroll: { marginBottom: SPACING.sm },
  filterRow: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: { color: '#FFFFFF' },

  list: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },

  insightCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  insightCardInner: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  typeBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.textTertiary,
    marginTop: -2,
  },
  insightTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  insightDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  tagText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    padding: SPACING.xl,
    lineHeight: 22,
  },
});
