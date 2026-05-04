import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../constants/theme';

const DONT_DOS = [
  {
    title: 'Create accounts',
    sub: 'No login, no email, no profile.',
  },
  {
    title: 'Send to a server',
    sub: 'Parsing happens in this app.',
  },
  {
    title: 'Track across sessions',
    sub: 'No cookies, no device fingerprint.',
  },
  {
    title: 'Store sensitive fields',
    sub: 'OTPs, full card numbers, UPI handles are masked.',
  },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export default function PrivacyScreen() {
  const navigation = useNavigation<any>();
  const { transactions, sessionStart, reset } = useApp();

  const handleDiscard = () => {
    Alert.alert(
      'Discard session',
      'This will clear all parsed data from memory and return to the start screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            reset();
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Privacy</Text>
          <Text style={styles.screenSub}>What this app does & doesn't do</Text>
        </View>

        {/* SESSION ACTIVE dark card */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionActiveRow}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>SESSION ACTIVE</Text>
          </View>

          <Text style={styles.sessionHeadline}>
            Everything you've parsed lives only in this app.
          </Text>

          <View style={styles.sessionGrid}>
            <View style={styles.sessionCell}>
              <Text style={styles.sessionMetaLabel}>STARTED</Text>
              <Text style={styles.sessionMetaValue}>
                {formatTime(sessionStart)} · {formatDate(sessionStart)}
              </Text>
            </View>
            <View style={styles.sessionCell}>
              <Text style={styles.sessionMetaLabel}>MESSAGES</Text>
              <Text style={styles.sessionMetaValue}>{transactions.length} parsed</Text>
            </View>
            <View style={styles.sessionCell}>
              <Text style={styles.sessionMetaLabel}>STORED</Text>
              <Text style={styles.sessionMetaValue}>0 bytes</Text>
            </View>
            <View style={styles.sessionCell}>
              <Text style={styles.sessionMetaLabel}>SHARED</Text>
              <Text style={styles.sessionMetaValue}>0 bytes</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.discardBtn} onPress={handleDiscard} activeOpacity={0.85}>
            <Text style={styles.discardBtnText}>Discard session now</Text>
          </TouchableOpacity>
        </View>

        {/* What we don't do */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHAT WE DON'T DO</Text>
          {DONT_DOS.map((item, i) => (
            <View
              key={i}
              style={[styles.dontRow, i < DONT_DOS.length - 1 && styles.dontBorder]}
            >
              <View style={styles.xIcon}>
                <Text style={styles.xText}>✕</Text>
              </View>
              <View style={styles.dontText}>
                <Text style={styles.dontTitle}>{item.title}</Text>
                <Text style={styles.dontSub}>{item.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Code block */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLine}>
            {'$ ledger --session-only --no-cloud --no-account'}
          </Text>
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
    marginTop: 3,
  },

  sessionCard: {
    backgroundColor: COLORS.darkCard,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sessionActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#5DCA8A',
  },
  activeText: {
    fontSize: FONT_SIZE.xs,
    color: '#8AB59A',
    fontWeight: '700',
    letterSpacing: 1,
  },

  sessionHeadline: {
    fontSize: 22,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 30,
  },

  sessionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  sessionCell: {
    flex: 1,
    minWidth: '40%',
    gap: 3,
  },
  sessionMetaLabel: {
    fontSize: FONT_SIZE.xs,
    color: '#8AB59A',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sessionMetaValue: {
    fontSize: FONT_SIZE.md,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  discardBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  discardBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },

  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  dontRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  dontBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  xIcon: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.red,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  xText: {
    fontSize: 11,
    color: COLORS.red,
    fontWeight: '700',
  },
  dontText: { flex: 1 },
  dontTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dontSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },

  codeCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.textPrimary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  codeLine: {
    fontSize: FONT_SIZE.xs,
    color: '#8AB59A',
    fontFamily: 'Menlo, monospace',
    letterSpacing: 0.3,
  },
});
