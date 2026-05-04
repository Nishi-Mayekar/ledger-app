import { Category, TransactionType } from '../types';

type RuleSet = { keywords: string[]; category: Category };

const RULES: RuleSet[] = [
  {
    keywords: ['zepto', 'blinkit', 'instamart', 'dunzo', 'swiggy instamart', 'bigbasket now', 'jiomart'],
    category: 'quickCommerce',
  },
  {
    keywords: ['swiggy', 'zomato', 'eatsure', 'freshmenu', 'box8', 'faasos', 'foodpanda', 'restaurant'],
    category: 'food',
  },
  {
    keywords: ['amazon', 'flipkart', 'myntra', 'nykaa', 'meesho', 'ajio', 'tata cliq', 'snapdeal', 'shopsy'],
    category: 'shopping',
  },
  {
    keywords: ['uber', 'ola', 'rapido', 'irctc', 'redbus', 'metro', 'taxi', 'auto', 'cab'],
    category: 'transport',
  },
  {
    keywords: ['electricity', 'airtel', 'jio', 'vodafone', 'vi ', 'bescom', 'tata power', 'rent', 'recharge', 'broadband', 'gas', 'water'],
    category: 'bills',
  },
  {
    keywords: ['sip', 'mutual fund', 'mf ', 'rd ', 'recurring deposit', 'fd ', 'fixed deposit', 'ppf', 'nps', 'lumpsum', 'index fund', 'groww', 'zerodha', 'kuvera', 'upstox', 'parag parikh', 'mirae', 'nippon', 'hdfc rd', 'nifty'],
    category: 'investments',
  },
  {
    keywords: ['netflix', 'hotstar', 'spotify', 'audible', 'prime video', 'zee5', 'sony liv', 'youtube premium', 'dating'],
    category: 'entertainment',
  },
  {
    keywords: ['salary', 'credited', 'refund', 'cashback', 'interest', 'dividend', 'reward'],
    category: 'income',
  },
  {
    keywords: ['@upi', 'friend', 'sister', 'brother', 'mom', 'dad', 'send', 'transfer', 'p2p', 'paytm', 'phonepe', 'gpay'],
    category: 'transfers',
  },
];

export function categorize(
  merchant: string,
  smsText: string,
  type: TransactionType
): Category {
  if (type === 'inflow') return 'income';
  if (type === 'investment') return 'investments';

  const searchText = `${merchant} ${smsText}`.toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some(k => searchText.includes(k))) {
      return rule.category;
    }
  }

  return 'other';
}

export const CATEGORY_META: Record<
  Category,
  { label: string; color: string; icon: string }
> = {
  bills: { label: 'Bills & utilities', color: '#1A1614', icon: 'receipt' },
  food: { label: 'Food & dining', color: '#C4503A', icon: 'restaurant' },
  quickCommerce: { label: 'Quick commerce', color: '#D4904A', icon: 'flash' },
  shopping: { label: 'Online shopping', color: '#B5853A', icon: 'bag' },
  transport: { label: 'Transport', color: '#4A7A8C', icon: 'car' },
  investments: { label: 'Investments', color: '#3A5C8C', icon: 'trending-up' },
  entertainment: { label: 'Entertainment', color: '#7A5C9A', icon: 'play-circle' },
  transfers: { label: 'Transfers (P2P)', color: '#9A9288', icon: 'swap-horizontal' },
  income: { label: 'Income', color: '#3D7A5C', icon: 'arrow-down-circle' },
  other: { label: 'Other', color: '#C8C0B4', icon: 'ellipsis-horizontal' },
};
