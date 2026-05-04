import { Transaction, TransactionType } from '../types';
import { categorize } from './categorizer';

// Mask sensitive info: full card numbers, UPI handles, OTPs
function maskSensitive(text: string): string {
  return text
    // Full 16-digit card numbers → XXXX1234
    .replace(/\b\d{12}(\d{4})\b/g, 'XXXX$1')
    // UPI IDs with full handles (name@bank) → ***@upi
    .replace(/\b[a-zA-Z0-9._+-]{3,}@[a-zA-Z]{2,}\b/g, '***@upi')
    // OTPs (standalone 4–8 digit numbers surrounded by space/punctuation)
    .replace(/(?<![\/\d-])\b\d{4,8}\b(?![\/\d-])/g, '****')
    // Ref numbers after "Ref" → masked
    .replace(/(Ref\s*)[A-Z0-9*]{4,}/gi, '$1***');
}

function extractAmount(text: string): number | null {
  // Patterns: Rs 489.00, Rs. 489, INR 489, ₹489
  const patterns = [
    /(?:Rs\.?\s*|INR\s*|₹\s*)(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:Rs|INR|₹)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
  }
  return null;
}

function extractDate(text: string): Date {
  // Formats: 18-Apr-26, 18-Apr-2026, 18/04/2026, 18-04-26
  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  // DD-Mon-YY or DD-Mon-YYYY
  const namedMonth = text.match(/(\d{1,2})[/-]([A-Za-z]{3})[/-](\d{2,4})/);
  if (namedMonth) {
    const day = parseInt(namedMonth[1], 10);
    const mon = monthMap[namedMonth[2].toLowerCase()];
    let year = parseInt(namedMonth[3], 10);
    if (year < 100) year += 2000;
    if (mon !== undefined) return new Date(year, mon, day);
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const numericDate = text.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (numericDate) {
    return new Date(
      parseInt(numericDate[3], 10),
      parseInt(numericDate[2], 10) - 1,
      parseInt(numericDate[1], 10)
    );
  }

  return new Date(); // fallback to today
}

function extractMerchant(text: string): string {
  const upper = text.toUpperCase();

  // "paid to X on", "debited to X on", "debited from a/c ... to X on"
  const patterns = [
    /(?:paid to|debited to)\s+([A-Z][A-Z0-9 &._-]{1,30?}?)\s+(?:on|@|$)/i,
    /to\s+([A-Z][A-Z0-9@._-]{1,30?})\s+on/i,
    /(?:SIP\s*[-–]|via SIP\s*[-–])\s*(.{4,40?}?)\s+(?:on|MF|Fund)/i,
    /(?:Lumpsum|RD)\s+([A-Z][A-Z0-9 &-]{1,30?})\s+on/i,
    /(?:for|to)\s+([A-Z][A-Z0-9 &+._-]{2,30})/i,
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      return m[1].trim().replace(/@upi$/i, '').replace(/\*/g, '').trim();
    }
  }

  // Known merchant keywords
  const merchants = [
    'ZEPTO', 'BLINKIT', 'INSTAMART', 'SWIGGY', 'ZOMATO',
    'AMAZON', 'FLIPKART', 'MYNTRA', 'NYKAA',
    'UBER', 'OLA', 'RAPIDO',
    'NETFLIX', 'HOTSTAR', 'SPOTIFY', 'AUDIBLE',
    'GROWW', 'ZERODHA', 'KUVERA', 'UPSTOX',
    'AIRTEL', 'JIO', 'VODAFONE',
  ];
  for (const m of merchants) {
    if (upper.includes(m)) return m;
  }

  // Credited/Salary
  if (/salary/i.test(text)) return 'Salary';
  if (/credited/i.test(text)) return 'Credit';

  return 'Unknown';
}

function detectType(text: string, merchant: string): TransactionType {
  const lower = text.toLowerCase();
  const merch = merchant.toLowerCase();

  // Investment signals
  const investmentKeywords = ['sip', 'mutual fund', 'mf', 'rd', 'recurring deposit', 'fd', 'fixed deposit', 'ppf', 'nps', 'lumpsum', 'index', 'groww', 'zerodha', 'kuvera'];
  if (investmentKeywords.some(k => lower.includes(k) || merch.includes(k))) {
    return 'investment';
  }

  // Inflow signals
  if (/credited|received|salary|refund|cashback/i.test(text)) return 'inflow';

  // Everything else is outflow
  return 'outflow';
}

export function parseSMS(raw: string): Transaction[] {
  const lines = raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 10);

  const transactions: Transaction[] = [];

  for (const line of lines) {
    const amount = extractAmount(line);
    if (!amount) continue;

    const merchant = extractMerchant(line);
    const date = extractDate(line);
    const type = detectType(line, merchant);
    const category = categorize(merchant, line, type);

    transactions.push({
      id: Math.random().toString(36).slice(2),
      amount,
      merchant,
      date,
      type,
      category,
      maskedSMS: maskSensitive(line),
      rawSMS: line,
    });
  }

  return transactions;
}
