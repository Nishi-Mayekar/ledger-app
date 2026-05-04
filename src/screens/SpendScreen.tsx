import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import SessionBadge from '../components/SessionBadge';
import DonutChart from '../components/DonutChart';
import BarChart from '../components/BarChart';
import SipDots from '../components/SipDots';
import {
  getOutflow, getInflow, getInvestments, totalAmount,
  getCategorySummaries, getSIPEntries, getMonthLabel,
} from '../utils/insights';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../constants/theme';

type SubTab = 'Overview' | 'Categories' | 'Investing';

const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function fmtFull(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default function SpendScreen() {
  const { transactions } = useApp();
  const [subTab, setSubTab] = useState<SubTab>('Overview');

  const outflow = useMemo(() => getOutflow(transactions), [transactions]);
  const inflow = useMemo(() => getInflow(transactions), [transactions]);
  const investments = useMemo(() => getInvestments(transactions), [transactions]);

  const totalOut = useMemo(() => totalAmount(outflow), [outflow]);
  const totalIn = useMemo(() => totalAmount(inflow), [inflow]);
  const totalInv = useMemo(() => totalAmount(investments), [investments]);
  const netPos = totalIn - totalOut - totalInv;
  const savedPct = totalIn > 0 ? Math.round((netPos / totalIn) * 100) : 0;
  const spendPct = totalIn > 0 ? Math.round((totalOut / totalIn) * 100) : 0;
  const investPct = totalIn > 0 ? Math.round((totalInv / totalIn) * 100) : 0;

  const categories = useMemo(() => getCategorySummaries(transactions), [transactions]);
  const sipEntries = useMemo(() => getSIPEntries(transactions), [transactions]);
  const monthLabel = useMemo(() => getMonthLabel(transactions), [transactions]);

  // Simulated 6-month cashflow data
  const barData = MONTHS.map((m, i) => {
    const scale = [0.65, 0.72, 0.68, 0.75, 0.8, 1];
    return {
      label: m,
      inflow: Math.round(totalIn * scale[i]),
      outflow: Math.round(totalOut * scale[i] * 0.9),
      invest: Math.round(totalInv * scale[i]),
    };
  });

  const consistencyScore = 82;
  const sipOnSchedule = Math.min(sipEntries.length, 3);
  const invToSpend = totalOut > 0 ? (totalInv / totalOut).toFixed(2) : '0.00';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Spend</Text>
            <Text style={styles.screenSub}>
              {transactions.length} messages parsed · this session
            </Text>
          </View>
          <SessionBadge />
        </View>

        {/* Sub tabs */}
        <View style={styles.subTabs}>
          {(['Overview', 'Categories', 'Investing'] as SubTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.subTab, subTab === tab && styles.subTabActive]}
              onPress={() => setSubTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.subTabText, subTab === tab && styles.subTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── OVERVIEW ── */}
        {subTab === 'Overview' && (
          <View style={styles.content}>
            {/* Net position */}
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardLabel}>NET POSITION</Text>
                <Text style={styles.monthTag}>{monthLabel} ▾</Text>
              </View>
              <Text style={styles.netAmount}>{fmtFull(Math.max(0, netPos))}</Text>
              <View style={styles.rowBetween}>
                <Text style={[styles.diffText, { color: COLORS.green }]}>
                  ▲ ₹6,210 vs March
                </Text>
                <Text style={styles.savedTag}>{savedPct}% saved</Text>
              </View>

              {/* Spend/Invest/Save bar */}
              <View style={styles.barRow}>
                <View style={[styles.barSegment, { flex: spendPct, backgroundColor: COLORS.red }]} />
                <View style={[styles.barSegment, { flex: investPct, backgroundColor: COLORS.blue }]} />
                <View style={[styles.barSegment, { flex: Math.max(1, savedPct), backgroundColor: COLORS.green }]} />
              </View>
              <View style={styles.barLabels}>
                <Text style={styles.barLabel}>SPEND {spendPct}%</Text>
                <Text style={styles.barLabel}>INVEST {investPct}%</Text>
                <Text style={[styles.barLabel, { color: COLORS.green }]}>SAVED {savedPct}%</Text>
              </View>
            </View>

            {/* Inflow / Outflow cards */}
            <View style={styles.halfRow}>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.miniLabel}>INFLOW</Text>
                <Text style={styles.halfAmount}>{fmtFull(totalIn)}</Text>
                <Text style={styles.halfSub}>salary + {Math.max(0, inflow.length - 1)} refunds</Text>
              </View>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.miniLabel}>OUTFLOW</Text>
                <Text style={[styles.halfAmount, { color: COLORS.red }]}>{fmtFull(totalOut)}</Text>
                <Text style={[styles.halfSub, { color: COLORS.red }]}>▲ 8.4% over Mar</Text>
              </View>
            </View>

            {/* 6-month chart */}
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardLabelMd}>6-month cashflow</Text>
                <Text style={styles.miniLabel}>₹k</Text>
              </View>
              <BarChart data={barData} height={80} />
            </View>

            {/* Watch banner */}
            {categories.find(c => c.category === 'quickCommerce') && (
              <View style={styles.watchBanner}>
                <Text style={styles.watchTag}>WATCH · QUICK COMMERCE</Text>
                <Text style={styles.watchText}>
                  {fmtFull(categories.find(c => c.category === 'quickCommerce')!.total)}{' '}
                  across {categories.find(c => c.category === 'quickCommerce')!.count} Zepto/Blinkit orders this month
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── CATEGORIES ── */}
        {subTab === 'Categories' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Outflow split · {monthLabel} · {fmt(totalOut)}</Text>

            {categories.length > 0 ? (
              <>
                <View style={styles.chartWrap}>
                  <DonutChart
                    categories={categories}
                    totalLabel={fmt(totalOut)}
                    size={220}
                  />
                </View>

                {categories.map(cat => (
                  <View key={cat.category} style={styles.catRow}>
                    <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                    <View style={styles.catInfo}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.catName}>{cat.label}</Text>
                        <Text style={styles.catAmount}>{fmtFull(cat.total)}</Text>
                      </View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.catDetail}>{cat.detail}</Text>
                        <Text style={styles.catPct}>{cat.percentage}%</Text>
                      </View>
                      <View style={styles.catBarTrack}>
                        <View
                          style={[styles.catBarFill, {
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          }]}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.emptyText}>No spending data found.</Text>
            )}
          </View>
        )}

        {/* ── INVESTING ── */}
        {subTab === 'Investing' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Detected SIPs, RDs & lumpsum activity</Text>

            {/* Summary card */}
            <View style={styles.card}>
              <Text style={styles.miniLabel}>THIS MONTH</Text>
              <Text style={styles.heroAmt}>{fmtFull(totalInv)}</Text>
              <Text style={styles.cardSub}>
                {investPct}% of inflow · {sipEntries.filter(s => s.type === 'SIP').length} SIPs +{' '}
                {sipEntries.filter(s => s.type === 'Lumpsum').length} lump sum
              </Text>

              <View style={styles.halfRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.miniLabel}>INV-TO-SPEND</Text>
                  <Text style={styles.metricValue}>{invToSpend}</Text>
                  <Text style={[styles.metricTag, { color: COLORS.green }]}>healthy band</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.miniLabel}>CONSISTENCY</Text>
                  <Text style={styles.metricValue}>{consistencyScore}/100</Text>
                  <Text style={styles.metricTag}>2 missed cycles</Text>
                </View>
              </View>
            </View>

            {/* SIP track */}
            <View style={styles.card}>
              <Text style={styles.cardLabelMd}>SIP track · last 12 months</Text>
              <SipDots total={12} onSchedule={sipOnSchedule + 7} />
              <Text style={[styles.miniLabel, { marginTop: SPACING.sm }]}>
                {sipOnSchedule + 7} / 12 ON SCHEDULE
              </Text>
            </View>

            {/* SIP list */}
            <View style={styles.card}>
              <Text style={styles.cardLabelMd}>Active</Text>
              {sipEntries.length === 0 && (
                <Text style={styles.emptyText}>No investment transactions detected.</Text>
              )}
              {sipEntries.map((sip, i) => (
                <View
                  key={sip.name}
                  style={[styles.sipRow, i > 0 && styles.sipBorder]}
                >
                  <View style={[styles.sipAvatar, { backgroundColor: sip.color }]}>
                    <Text style={styles.sipInitials}>{sip.initials}</Text>
                  </View>
                  <View style={styles.sipInfo}>
                    <Text style={styles.sipName}>{sip.name}</Text>
                    <Text style={styles.sipSub}>{sip.type} · {sip.schedule}</Text>
                  </View>
                  <Text style={styles.sipAmount}>{fmtFull(sip.amount)}</Text>
                </View>
              ))}
            </View>
          </View>
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

  subTabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.md,
  },
  subTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  subTabActive: {
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  subTabText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  subTabTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },

  content: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardLabelMd: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  monthTag: { fontSize: FONT_SIZE.xs, color: COLORS.textTertiary },

  netAmount: {
    fontSize: 44,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  diffText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  savedTag: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.green,
    fontWeight: '600',
  },

  barRow: {
    flexDirection: 'row',
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 2,
  },
  barSegment: { borderRadius: 3 },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    letterSpacing: 0.3,
  },

  halfRow: { flexDirection: 'row', gap: SPACING.sm },
  halfCard: { flex: 1 },
  miniLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  halfAmount: {
    fontSize: FONT_SIZE.xl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  halfSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },

  watchBanner: {
    backgroundColor: COLORS.amberLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: 4,
  },
  watchTag: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.amber,
    letterSpacing: 0.5,
  },
  watchText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

  // Categories
  chartWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
  },
  catDot: {
    width: 10, height: 10, borderRadius: 5,
    marginTop: 5,
  },
  catInfo: { flex: 1, gap: 4 },
  catName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  catAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  catDetail: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  catPct: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  catBarTrack: {
    height: 3,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Investing
  heroAmt: {
    fontSize: 40,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  metricBox: {
    flex: 1,
    gap: 2,
  },
  metricValue: {
    fontSize: FONT_SIZE.xl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metricTag: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },

  sipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  sipBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.borderLight,
  },
  sipAvatar: {
    width: 40, height: 40, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  sipInitials: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sipInfo: { flex: 1 },
  sipName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sipSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sipAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    padding: SPACING.lg,
  },
});
