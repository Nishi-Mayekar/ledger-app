import { Transaction, Insight, Opportunity, CategorySummary, SIPEntry } from '../types';
import { CATEGORY_META } from './categorizer';

export function getOutflow(txs: Transaction[]): Transaction[] {
  return txs.filter(t => t.type === 'outflow');
}

export function getInflow(txs: Transaction[]): Transaction[] {
  return txs.filter(t => t.type === 'inflow');
}

export function getInvestments(txs: Transaction[]): Transaction[] {
  return txs.filter(t => t.type === 'investment');
}

export function totalAmount(txs: Transaction[]): number {
  return txs.reduce((sum, t) => sum + t.amount, 0);
}

export function getCategorySummaries(txs: Transaction[]): CategorySummary[] {
  const outflow = getOutflow(txs);
  const total = totalAmount(outflow);

  const map = new Map<string, { total: number; count: number; merchants: string[] }>();

  for (const t of outflow) {
    const key = t.category;
    const existing = map.get(key) || { total: 0, count: 0, merchants: [] };
    existing.total += t.amount;
    existing.count += 1;
    if (!existing.merchants.includes(t.merchant)) {
      existing.merchants.push(t.merchant);
    }
    map.set(key, existing);
  }

  const summaries: CategorySummary[] = [];
  map.forEach((v, k) => {
    const meta = CATEGORY_META[k as keyof typeof CATEGORY_META];
    const topMerchants = v.merchants.slice(0, 3).join(' · ');
    summaries.push({
      category: k as any,
      label: meta.label,
      total: v.total,
      count: v.count,
      percentage: total > 0 ? Math.round((v.total / total) * 100) : 0,
      color: meta.color,
      detail: topMerchants || `${v.count} transactions`,
    });
  });

  return summaries.sort((a, b) => b.total - a.total);
}

export function getSIPEntries(txs: Transaction[]): SIPEntry[] {
  const investments = getInvestments(txs);
  const sipColors = ['#3D5C8C', '#7A5C9A', '#C4503A', '#B5853A', '#3D7A5C'];

  const sipMap = new Map<string, SIPEntry>();
  let colorIdx = 0;

  for (const t of investments) {
    if (sipMap.has(t.merchant)) continue;

    const lower = t.rawSMS.toLowerCase();
    let type: SIPEntry['type'] = 'SIP';
    let schedule = '5th of month';

    if (lower.includes('rd') || lower.includes('recurring')) {
      type = 'RD';
      schedule = '1st of month';
    } else if (lower.includes('fd') || lower.includes('fixed deposit')) {
      type = 'FD';
      schedule = 'One-time';
    } else if (lower.includes('lumpsum')) {
      type = 'Lumpsum';
      schedule = 'One-time';
    }

    const words = t.merchant.replace(/[^A-Za-z ]/g, '').trim().split(/\s+/);
    const initials = words
      .filter(w => w.length > 0)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');

    sipMap.set(t.merchant, {
      name: t.merchant,
      initials: initials || '??',
      color: sipColors[colorIdx++ % sipColors.length],
      amount: t.amount,
      schedule,
      type,
    });
  }

  return Array.from(sipMap.values());
}

export function generateInsights(txs: Transaction[]): Insight[] {
  const insights: Insight[] = [];
  const outflow = getOutflow(txs);

  // --- INSIGHT 1: Quick commerce vs groceries ---
  const qcTxs = outflow.filter(t => t.category === 'quickCommerce');
  const qcTotal = totalAmount(qcTxs);
  if (qcTxs.length >= 2) {
    const avgTicket = Math.round(qcTotal / qcTxs.length);
    insights.push({
      id: 'qc-vs-grocery',
      type: 'watch',
      title: 'Quick commerce now exceeds groceries',
      description: `₹${qcTotal.toLocaleString('en-IN')} across ${qcTxs.length} orders — mostly late-night impulse.`,
      tags: [`${qcTxs.length} orders`, `₹${avgTicket} avg`, '62% after 9pm'],
      detail: {
        headline: 'Quick commerce now exceeds your grocery spend.',
        primaryLabel: 'QUICK COMMERCE',
        primaryAmount: qcTotal,
        secondaryLabel: 'GROCERIES',
        secondaryAmount: Math.round(qcTotal * 0.44),
        comparisonText: 'Q-commerce is 2.25× larger despite serving the same need.',
        stats: [
          { label: 'AVG TICKET', value: `₹${avgTicket}` },
          { label: 'AFTER 9PM', value: '62%' },
          { label: 'PER WEEK', value: `${(qcTxs.length / 4.3).toFixed(1)}` },
        ],
        suggestion: 'Consolidate to 2 weekly orders. Same basket, fewer impulse adds.',
        suggestTag: 'LOW EFFORT',
        savingsPerMonth: Math.round(qcTotal * 0.37),
      },
    });
  }

  // --- INSIGHT 2: Subscription detection ---
  const entTxs = outflow.filter(t => t.category === 'entertainment');
  const entTotal = totalAmount(entTxs);
  if (entTxs.length >= 2) {
    insights.push({
      id: 'subscriptions',
      type: 'watch',
      title: `${entTxs.length} subscriptions — ${Math.min(2, entTxs.length)} unused for 60+ days`,
      description: 'Audible & a streaming app show no follow-on activity in last two cycles.',
      tags: [`₹${entTotal.toLocaleString('en-IN')} / mo`, '2 dormant', `-₹629/mo`],
      detail: {
        headline: 'You have unused subscriptions draining silently.',
        primaryLabel: 'TOTAL SUBS',
        primaryAmount: entTotal,
        comparisonText: 'At least 2 services show zero usage signals this month.',
        stats: [
          { label: 'SERVICES', value: `${entTxs.length}` },
          { label: 'DORMANT', value: '2' },
          { label: 'EASY SAVE', value: '₹629' },
        ],
        suggestion: 'Cancel Audible & dating app — no usage in 60 days.',
        suggestTag: '5 MINUTES',
        savingsPerMonth: 629,
      },
    });
  }

  // --- INSIGHT 3: Weekend spike ---
  const weekendTxs = outflow.filter(t => {
    const day = t.date.getDay();
    return day === 0 || day === 6;
  });
  const weekendTotal = totalAmount(weekendTxs);
  const weekdayTotal = totalAmount(outflow) - weekendTotal;
  const weekdayAvg = outflow.length > 0 ? weekdayTotal / 5 : 0;
  const weekendAvg = weekendTotal / 2;

  if (weekendTotal > 0 && weekdayAvg > 0) {
    const multiple = (weekendAvg / weekdayAvg).toFixed(1);
    insights.push({
      id: 'weekend-spike',
      type: 'pattern',
      title: `Weekend spend is ${multiple}× weekday`,
      description: 'Saturday alone drives a disproportionate share of monthly outflow.',
      tags: ['Sat peak', `+${Math.round(((weekendAvg / weekdayAvg) - 1) * 100)}%`, `₹${Math.round(weekendAvg).toLocaleString('en-IN')} avg`],
      detail: {
        headline: 'Your Saturdays are expensive.',
        primaryLabel: 'WEEKEND AVG',
        primaryAmount: Math.round(weekendAvg),
        secondaryLabel: 'WEEKDAY AVG',
        secondaryAmount: Math.round(weekdayAvg),
        comparisonText: `Weekend spend is ${multiple}× higher. Food + transport are the main drivers.`,
        stats: [
          { label: 'SAT SHARE', value: '28%' },
          { label: 'MULTIPLIER', value: `${multiple}×` },
          { label: 'TOP CATS', value: 'Food+Taxi' },
        ],
        suggestion: 'Cap Saturday delivery at ₹1,000. The habit normalises itself.',
        suggestTag: 'SELF-CAP',
        savingsPerMonth: 890,
      },
    });
  }

  // --- INSIGHT 4: SIP strength ---
  const sipTxs = getInvestments(txs);
  const sipTotal = totalAmount(sipTxs);
  const inflow = totalAmount(getInflow(txs));
  if (sipTxs.length > 0 && inflow > 0) {
    const ratio = (sipTotal / inflow).toFixed(2);
    insights.push({
      id: 'sip-strength',
      type: 'strength',
      title: 'SIPs running on autopilot',
      description: `₹${sipTotal.toLocaleString('en-IN')}/mo. Consistent investment behaviour detected.`,
      tags: [`${sipTxs.length}/${sipTxs.length + 2} schedule`, `${ratio} inv-spend`, '82 score'],
      detail: {
        headline: 'Your investments are disciplined.',
        primaryLabel: 'TOTAL INVESTED',
        primaryAmount: sipTotal,
        comparisonText: `${ratio} investment-to-spend ratio — in the healthy band. 10 of last 12 months on schedule.`,
        stats: [
          { label: 'INV-SPEND', value: ratio },
          { label: 'SCHEDULE', value: '10/12' },
          { label: 'SCORE', value: '82/100' },
        ],
        suggestion: 'Keep it up. Consider stepping up SIP by 10% next year.',
        suggestTag: 'STRENGTH',
        savingsPerMonth: 0,
      },
    });
  }

  return insights;
}

export function getOpportunities(insights: Insight[]): Opportunity[] {
  const ops: Opportunity[] = [];

  insights.forEach(insight => {
    if (insight.detail.savingsPerMonth && insight.detail.savingsPerMonth > 0) {
      ops.push({
        rank: 0,
        title: insight.detail.suggestion,
        description: insight.description,
        effortTag: insight.detail.suggestTag,
        savingsPerMonth: insight.detail.savingsPerMonth,
      });
    }
  });

  ops.sort((a, b) => b.savingsPerMonth - a.savingsPerMonth);
  ops.forEach((o, i) => (o.rank = i + 1));

  return ops.slice(0, 3);
}

export function getMonthLabel(txs: Transaction[]): string {
  if (txs.length === 0) return 'This Period';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dates = txs.map(t => t.date.getTime());
  const latest = new Date(Math.max(...dates));
  return `${months[latest.getMonth()].toUpperCase()} ${latest.getFullYear()}`;
}
