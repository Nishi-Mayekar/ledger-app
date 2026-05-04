export type Category =
  | 'quickCommerce'
  | 'food'
  | 'shopping'
  | 'transport'
  | 'bills'
  | 'investments'
  | 'transfers'
  | 'income'
  | 'entertainment'
  | 'other';

export type TransactionType = 'inflow' | 'outflow' | 'investment';

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  date: Date;
  type: TransactionType;
  category: Category;
  maskedSMS: string;
  rawSMS: string;
}

export interface CategorySummary {
  category: Category;
  label: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
  detail: string;
}

export interface SIPEntry {
  name: string;
  initials: string;
  color: string;
  amount: number;
  schedule: string;
  type: 'SIP' | 'RD' | 'FD' | 'Lumpsum';
}

export type InsightType = 'watch' | 'pattern' | 'strength';

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  tags: string[];
  detail: {
    headline: string;
    primaryLabel: string;
    primaryAmount: number;
    secondaryLabel?: string;
    secondaryAmount?: number;
    comparisonText: string;
    stats: Array<{ label: string; value: string }>;
    suggestion: string;
    suggestTag: string;
    savingsPerMonth?: number;
  };
}

export interface Opportunity {
  rank: number;
  title: string;
  description: string;
  effortTag: string;
  savingsPerMonth: number;
}

export interface AppState {
  transactions: Transaction[];
  sessionStart: Date;
  isAnalyzed: boolean;
  rawInput: string;
}
