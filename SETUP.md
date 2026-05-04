# Ledger — Setup & Run Guide

A privacy-first SMS expense intelligence app built with React Native + Expo.

---

## Quick Start (Expo Go)

### 1. Prerequisites
- Node.js 18+  
- Expo Go app installed on your Android/iOS device  
  → Android: https://play.google.com/store/apps/details?id=host.exp.exponent  
  → iOS: https://apps.apple.com/app/expo-go/id982107779

### 2. Install dependencies
```bash
cd ledger-app
npm install
```

### 3. Start the dev server
```bash
npx expo start
```

Scan the QR code in your terminal with:
- **Android:** Expo Go app → "Scan QR code"
- **iOS:** Camera app → scan QR code

---

## File Structure
```
ledger-app/
├── App.tsx                        # Root navigation + FAB tab bar
├── app.json                       # Expo config (no permissions)
├── src/
│   ├── constants/theme.ts         # Colors, spacing, typography
│   ├── context/AppContext.tsx     # Global in-memory state
│   ├── types/index.ts             # TypeScript interfaces
│   ├── utils/
│   │   ├── parser.ts              # SMS → Transaction (regex engine)
│   │   ├── categorizer.ts         # Transaction → Category
│   │   ├── insights.ts            # Transactions → Insights + Opportunities
│   │   └── sampleData.ts          # 25 realistic sample SMS messages
│   ├── components/
│   │   ├── SessionBadge.tsx       # "SESSION-ONLY" pill badge
│   │   ├── DonutChart.tsx         # SVG donut chart (react-native-svg)
│   │   ├── BarChart.tsx           # 6-month cashflow bar chart
│   │   └── SipDots.tsx            # SIP schedule dots
│   └── screens/
│       ├── HomeScreen.tsx         # Onboarding + paste modal
│       ├── SpendScreen.tsx        # Overview / Categories / Investing tabs
│       ├── InsightsScreen.tsx     # Insight cards with filters
│       ├── InsightDetailScreen.tsx# Full insight drill-down
│       ├── SaveScreen.tsx         # Opportunities ranked by ₹ impact
│       └── PrivacyScreen.tsx      # Session info + discard
```

---

## Build APK (Android)

### Option A — EAS Build (recommended, free tier available)
```bash
npm install -g eas-cli
eas login          # create free account at expo.dev
eas build:configure
eas build -p android --profile preview
```
Download the `.apk` from the Expo dashboard and install on your device.

### Option B — Local build
```bash
npx expo run:android
```
Requires Android Studio + SDK installed locally.

---

## Privacy Architecture

| What | How |
|------|-----|
| No login | App opens directly, zero auth |
| No backend | All parsing runs in JS, zero network calls |
| No storage | No AsyncStorage, no SQLite, no file system writes |
| Session-only | React Context (in-memory), cleared on app close |
| Sensitive masking | Regex strips full card numbers, UPI handles, OTPs before display |

---

## Sample SMS Formats Supported

- `HDFCBK: Rs 489.00 debited from a/c XXXX4471 to ZEPTO@upi on 18-Apr-26`
- `ICICI: Rs 5000 debited via SIP — Parag Parikh Flexi Cap MF on 05-Apr-26`
- `AXIS: Rs 75000 credited to a/c XXXX4471 — Salary Apr 2026`
- `HDFCBK: Rs 2310 paid to UBER INDIA on 14-Apr-26`
- `AXIS: Rs 5760 debited HDFC RD — Recurring Deposit on 01-Apr-26`

---

## Screens

| # | Screen | Description |
|---|--------|-------------|
| 1 | Home | Hero, privacy bullets, paste CTA, sample data |
| 2 | Paste Modal | Full-screen SMS input with live message count |
| 3 | Spend — Overview | Net position, inflow/outflow, 6-month chart |
| 4 | Spend — Categories | Donut chart + category list with ₹ breakdown |
| 5 | Spend — Investing | SIP tracking, consistency score, active SIPs |
| 6 | Insights List | Filter by Watch / Pattern / Strength |
| 7 | Insight Detail | Deep-dive with comparison chart + suggestion |
| 8 | Opportunities | Top 3 savings ranked by ₹/month impact |
| 9 | Privacy | Session stats + discard session |
