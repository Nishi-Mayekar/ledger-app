import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Modal, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { SAMPLE_SMS } from '../utils/sampleData';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../constants/theme';

const PRIVACY_BULLETS = [
  { title: 'No account · no login', sub: 'Every session is anonymous' },
  { title: 'Local parsing only', sub: 'Nothing leaves your phone' },
  { title: 'Sensitive fields masked', sub: 'Card / UPI / OTP redacted' },
  { title: 'Auto-discard on exit', sub: 'Close the app, it\'s gone' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { analyze } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [smsText, setSmsText] = useState('');
  const [msgCount, setMsgCount] = useState(0);

  const handleSmsChange = (text: string) => {
    setSmsText(text);
    const lines = text.split('\n').filter(l => l.trim().length > 10);
    setMsgCount(lines.length);
  };

  const handleAnalyze = () => {
    if (smsText.trim()) {
      analyze(smsText);
      setModalVisible(false);
      navigation.navigate('Main');
    }
  };

  const handleSampleData = () => {
    analyze(SAMPLE_SMS);
    navigation.navigate('Main');
  };

  const handlePasteOpen = () => {
    setSmsText('');
    setMsgCount(0);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Session badge */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>SESSION-ONLY · NO DATA STORED</Text>
        </View>

        {/* Hero headline */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Your money,{'\n'}</Text>
          <Text style={styles.heroItalic}>without the{'\n'}surveillance.</Text>
        </View>

        <Text style={styles.subtitle}>
          Paste your bank SMS. Ledger parses it inside this app, shows you patterns,
          and forgets it the moment you close.
        </Text>

        {/* Privacy bullets */}
        <View style={styles.bullets}>
          {PRIVACY_BULLETS.map((b, i) => (
            <View key={i} style={[styles.bullet, i < PRIVACY_BULLETS.length - 1 && styles.bulletBorder]}>
              <View style={styles.bulletCheck}>
                <Text style={styles.bulletCheckText}>✓</Text>
              </View>
              <View style={styles.bulletTextWrap}>
                <Text style={styles.bulletTitle}>{b.title}</Text>
                <Text style={styles.bulletSub}>{b.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <View style={styles.ctas}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handlePasteOpen} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Paste SMS to begin →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ghostBtn} onPress={handleSampleData} activeOpacity={0.7}>
            <Text style={styles.ghostBtnText}>Try with sample data</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>v0.4 · EPHEMERAL · SESSION-ONLY</Text>
      </ScrollView>

      {/* Paste SMS Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <SafeAreaView style={styles.modalSafe}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Paste SMS</Text>
              <TouchableOpacity
                onPress={handleAnalyze}
                disabled={msgCount === 0}
              >
                <Text style={[styles.modalDone, msgCount === 0 && styles.modalDoneDisabled]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            {/* Text area */}
            <TextInput
              style={styles.textarea}
              multiline
              placeholder={
                'HDFCBK: Rs 489.00 debited from a/c XXXX4471 to ZEPTO@upi on 18-Apr-26. UPI Ref 412***\n\nHDFCBK: Rs 75000 credited to a/c XXXX4471 — Salary Apr 2026\n\nICICI: Rs 5000 debited via SIP — Parag Parikh Flexi Cap MF on 05-Apr-26\n\n...'
              }
              placeholderTextColor={COLORS.textTertiary}
              value={smsText}
              onChangeText={handleSmsChange}
              textAlignVertical="top"
              autoFocus
            />

            {/* Bottom hint */}
            <View style={styles.modalHint}>
              <Text style={styles.modalHintIcon}>🔒</Text>
              <Text style={styles.modalHintText}>
                <Text style={{ fontWeight: '600' }}>Stays on this device.</Text>
                {msgCount > 0
                  ? ` ${msgCount} message${msgCount !== 1 ? 's' : ''} detected · OTPs and full card numbers will be redacted before display.`
                  : ' Paste one or more bank SMS messages above.'}
              </Text>
            </View>

            {msgCount > 0 && (
              <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze} activeOpacity={0.85}>
                <Text style={styles.analyzeBtnText}>Analyse {msgCount} message{msgCount !== 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            )}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  container: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    gap: 5,
    marginBottom: SPACING.xl,
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs, fontWeight: '600',
    color: COLORS.greenText, letterSpacing: 0.3,
  },

  hero: { marginBottom: SPACING.md },
  heroTitle: {
    fontSize: 42,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 50,
  },
  heroItalic: {
    fontSize: 42,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    lineHeight: 50,
  },

  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },

  bullets: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  bulletBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  bulletCheck: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.greenLight,
    alignItems: 'center', justifyContent: 'center',
  },
  bulletCheckText: { fontSize: 12, color: COLORS.green, fontWeight: '700' },
  bulletTextWrap: { flex: 1 },
  bulletTitle: {
    fontSize: FONT_SIZE.md, fontWeight: '600',
    color: COLORS.textPrimary,
  },
  bulletSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  ctas: { gap: SPACING.sm, marginBottom: SPACING.xl },
  primaryBtn: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: RADIUS.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  ghostBtn: {
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostBtnText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },

  version: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
  },

  // Modal
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  modalCancel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  modalTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalDone: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  modalDoneDisabled: { color: COLORS.textTertiary },

  textarea: {
    flex: 1,
    padding: SPACING.lg,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  modalHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.greenLight,
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  modalHintIcon: { fontSize: 14, marginTop: 1 },
  modalHintText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.greenText,
    lineHeight: 20,
  },

  analyzeBtn: {
    backgroundColor: COLORS.textPrimary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.full,
    paddingVertical: 15,
    alignItems: 'center',
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});
