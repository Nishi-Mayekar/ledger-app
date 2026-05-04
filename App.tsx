import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, TextInput,
  KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider, useApp } from './src/context/AppContext';
import { SAMPLE_SMS } from './src/utils/sampleData';

import HomeScreen from './src/screens/HomeScreen';
import SpendScreen from './src/screens/SpendScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import InsightDetailScreen from './src/screens/InsightDetailScreen';
import SaveScreen from './src/screens/SaveScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';

import { COLORS, SPACING, RADIUS, FONT_SIZE } from './src/constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────
export type RootStackParams = {
  Home: undefined;
  Main: undefined;
  InsightDetail: { insight: any; index: number; total: number };
};

export type TabParams = {
  Spend: undefined;
  Insights: undefined;
  AddSMS: undefined;
  Save: undefined;
  Privacy: undefined;
};

// ─── FAB Add SMS Sheet ────────────────────────────────────────────────────────
function AddSMSSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { analyze } = useApp();
  const [text, setText] = useState('');
  const count = text.split('\n').filter(l => l.trim().length > 10).length;

  const handleAnalyze = () => {
    if (text.trim()) {
      analyze(text);
      setText('');
      onClose();
    }
  };

  const handleSample = () => {
    analyze(SAMPLE_SMS);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={fabStyles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={fabStyles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={fabStyles.title}>Paste SMS</Text>
            <TouchableOpacity onPress={handleAnalyze} disabled={count === 0}>
              <Text style={[fabStyles.done, count === 0 && { color: COLORS.textTertiary }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={fabStyles.textarea}
            multiline
            placeholder={'HDFCBK: Rs 1299 paid to SWIGGY on 18-Apr-26. UPI Ref ***\n\nICICI: Rs 5000 debited via SIP on 05-Apr-26\n\n...'}
            placeholderTextColor={COLORS.textTertiary}
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
            autoFocus
          />

          {/* Hint */}
          <View style={fabStyles.hint}>
            <Text style={fabStyles.hintText}>
              🔒 <Text style={{ fontWeight: '600' }}>Stays on this device.</Text>
              {count > 0
                ? ` ${count} message${count !== 1 ? 's' : ''} detected · sensitive fields will be redacted.`
                : ' Paste one or more bank SMS messages above.'}
            </Text>
          </View>

          <View style={fabStyles.btns}>
            {count > 0 && (
              <TouchableOpacity style={fabStyles.analyzeBtn} onPress={handleAnalyze} activeOpacity={0.85}>
                <Text style={fabStyles.analyzeBtnText}>Analyse {count} message{count !== 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={fabStyles.sampleBtn} onPress={handleSample} activeOpacity={0.7}>
              <Text style={fabStyles.sampleBtnText}>Use sample data</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const fabStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  cancel: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  title: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  done: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  textarea: {
    flex: 1,
    padding: SPACING.lg,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  hint: {
    backgroundColor: COLORS.greenLight,
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  hintText: { fontSize: FONT_SIZE.sm, color: COLORS.greenText, lineHeight: 20 },
  btns: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.sm },
  analyzeBtn: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: RADIUS.full,
    paddingVertical: 15,
    alignItems: 'center',
  },
  analyzeBtnText: { color: '#FFF', fontSize: FONT_SIZE.md, fontWeight: '600' },
  sampleBtn: {
    borderRadius: RADIUS.full,
    paddingVertical: 13,
    alignItems: 'center',
  },
  sampleBtnText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md },
});

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: any) {
  const [addVisible, setAddVisible] = useState(false);

  const tabs = [
    { key: 'Spend', label: 'Spend', icon: 'bar-chart' as const },
    { key: 'Insights', label: 'Insights', icon: 'bulb-outline' as const },
    { key: 'AddSMS', label: '', icon: 'add' as const },
    { key: 'Save', label: 'Save', icon: 'arrow-up-outline' as const },
    { key: 'Privacy', label: 'Privacy', icon: 'lock-closed-outline' as const },
  ];

  return (
    <>
      <AddSMSSheet visible={addVisible} onClose={() => setAddVisible(false)} />

      <View style={tabStyles.container}>
        {tabs.map((tab) => {
          const isFAB = tab.key === 'AddSMS';
          const routeIndex = state.routes.findIndex((r: any) => r.name === tab.key);
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            if (isFAB) {
              setAddVisible(true);
              return;
            }
            const event = navigation.emit({ type: 'tabPress', target: state.routes[routeIndex]?.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.key);
            }
          };

          if (isFAB) {
            return (
              <TouchableOpacity key={tab.key} style={tabStyles.fabWrap} onPress={onPress} activeOpacity={0.85}>
                <View style={tabStyles.fab}>
                  <Ionicons name="add" size={28} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.key}
              style={tabStyles.tab}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={isFocused ? COLORS.tabActive : COLORS.tabInactive}
              />
              <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.tabBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: SPACING.xs,
    alignItems: 'flex-end',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    marginTop: -10,
  },
  label: {
    fontSize: 11,
    color: COLORS.tabInactive,
  },
  labelActive: {
    color: COLORS.tabActive,
    fontWeight: '600',
  },
});

// ─── Navigators ───────────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator<RootStackParams>();
const Tab = createBottomTabNavigator<TabParams>();
const InsightStack = createNativeStackNavigator();

function InsightsStack() {
  return (
    <InsightStack.Navigator screenOptions={{ headerShown: false }}>
      <InsightStack.Screen name="InsightsList" component={InsightsScreen} />
      <InsightStack.Screen name="InsightDetail" component={InsightDetailScreen} />
    </InsightStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Spend" component={SpendScreen} />
      <Tab.Screen name="Insights" component={InsightsStack} />
      <Tab.Screen name="AddSMS" component={SpendScreen} />
      <Tab.Screen name="Save" component={SaveScreen} />
      <Tab.Screen name="Privacy" component={PrivacyScreen} />
    </Tab.Navigator>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function RootNavigator() {
  const { isAnalyzed } = useApp();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor={COLORS.background} />
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
