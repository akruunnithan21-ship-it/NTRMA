import { create } from 'zustand';

// ===== TYPES =====

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  value: number;
  purchaseValue?: number;
  date: string;
  note?: string;
}

export interface Debt {
  id: string;
  name: string;
  category: DebtCategory;
  totalAmount: number;
  remainingAmount: number;
  emiAmount?: number;
  interestRate?: number;
  dueDate?: string;
  note?: string;
}

export type AssetCategory =
  | 'cash_savings' | 'bank_account' | 'stocks' | 'mutual_funds'
  | 'gold' | 'crypto' | 'fixed_deposit' | 'ppf_epf'
  | 'real_estate' | 'vehicle' | 'electronics' | 'other_asset';

export type DebtCategory =
  | 'personal_loan' | 'education_loan' | 'home_loan' | 'vehicle_loan'
  | 'credit_card' | 'family_borrowed' | 'friend_borrowed'
  | 'emi_pending' | 'other_debt';

export type ViewMode = 'both' | 'assets_only' | 'debts_only';

interface NetWorthState {
  assets: Asset[];
  debts: Debt[];
  viewMode: ViewMode;
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  getTotalAssets: () => number;
  getTotalDebts: () => number;
  getNetWorth: () => number;
  getAssetsByCategory: () => { category: AssetCategory; total: number; count: number }[];
  getDebtsByCategory: () => { category: DebtCategory; total: number; count: number }[];
  getMonthlyDebtObligation: () => number;
}

export const ASSET_CATEGORIES: { id: AssetCategory; name: string; icon: string; color: string }[] = [
  { id: 'cash_savings', name: 'Cash / Savings', icon: '💵', color: '#39FF14' },
  { id: 'bank_account', name: 'Bank Account', icon: '🏦', color: '#00F0FF' },
  { id: 'stocks', name: 'Stocks', icon: '📈', color: '#A855F7' },
  { id: 'mutual_funds', name: 'Mutual Funds', icon: '📊', color: '#3B82F6' },
  { id: 'gold', name: 'Gold / Silver', icon: '🥇', color: '#FFB800' },
  { id: 'crypto', name: 'Crypto', icon: '₿', color: '#F59E0B' },
  { id: 'fixed_deposit', name: 'Fixed Deposit', icon: '🔒', color: '#10B981' },
  { id: 'ppf_epf', name: 'PPF / EPF / NPS', icon: '🏛️', color: '#14B8A6' },
  { id: 'real_estate', name: 'Real Estate', icon: '🏠', color: '#FF6B35' },
  { id: 'vehicle', name: 'Vehicle', icon: '🚗', color: '#8B5CF6' },
  { id: 'electronics', name: 'Electronics', icon: '💻', color: '#6366F1' },
  { id: 'other_asset', name: 'Other', icon: '📦', color: '#6B7280' },
];

export const DEBT_CATEGORIES: { id: DebtCategory; name: string; icon: string; color: string }[] = [
  { id: 'personal_loan', name: 'Personal Loan', icon: '🏦', color: '#EF4444' },
  { id: 'education_loan', name: 'Education Loan', icon: '🎓', color: '#F97316' },
  { id: 'home_loan', name: 'Home Loan', icon: '🏠', color: '#DC2626' },
  { id: 'vehicle_loan', name: 'Vehicle Loan', icon: '🚗', color: '#E11D48' },
  { id: 'credit_card', name: 'Credit Card', icon: '💳', color: '#FF006E' },
  { id: 'family_borrowed', name: 'Borrowed (Family)', icon: '👨‍👩‍👦', color: '#F43F5E' },
  { id: 'friend_borrowed', name: 'Borrowed (Friend)', icon: '🤝', color: '#FB7185' },
  { id: 'emi_pending', name: 'EMI / BNPL', icon: '📱', color: '#BE123C' },
  { id: 'other_debt', name: 'Other Debt', icon: '📋', color: '#6B7280' },
];

export const useNetWorthStore = create<NetWorthState>((set, get) => ({
  assets: [
    { id: 'a1', name: 'Savings Account (SBI)', category: 'bank_account', value: 8500, date: '2026-01-01' },
    { id: 'a2', name: 'Cash in hand', category: 'cash_savings', value: 1200, date: '2026-05-28' },
    { id: 'a3', name: 'Tata Motors (2 shares)', category: 'stocks', value: 1905, purchaseValue: 1800, date: '2026-04-15' },
    { id: 'a4', name: 'Axis Small Cap SIP', category: 'mutual_funds', value: 3200, purchaseValue: 3000, date: '2026-02-01' },
  ],
  debts: [
    { id: 'd1', name: 'Borrowed from brother', category: 'family_borrowed', totalAmount: 5000, remainingAmount: 3000, note: 'Return by July' },
    { id: 'd2', name: 'Amazon Pay Later', category: 'emi_pending', totalAmount: 2400, remainingAmount: 1600, emiAmount: 800, dueDate: '2026-06-05' },
  ],
  viewMode: 'both',

  addAsset: (asset) => set((s) => ({ assets: [...s.assets, { ...asset, id: `a_${Date.now()}` }] })),
  updateAsset: (id, updates) => set((s) => ({ assets: s.assets.map((a) => a.id === id ? { ...a, ...updates } : a) })),
  deleteAsset: (id) => set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),
  addDebt: (debt) => set((s) => ({ debts: [...s.debts, { ...debt, id: `d_${Date.now()}` }] })),
  updateDebt: (id, updates) => set((s) => ({ debts: s.debts.map((d) => d.id === id ? { ...d, ...updates } : d) })),
  deleteDebt: (id) => set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),
  setViewMode: (mode) => set({ viewMode: mode }),

  getTotalAssets: () => get().assets.reduce((sum, a) => sum + a.value, 0),
  getTotalDebts: () => get().debts.reduce((sum, d) => sum + d.remainingAmount, 0),
  getNetWorth: () => get().getTotalAssets() - get().getTotalDebts(),

  getAssetsByCategory: () => {
    const map: Record<string, { total: number; count: number }> = {};
    get().assets.forEach((a) => {
      if (!map[a.category]) map[a.category] = { total: 0, count: 0 };
      map[a.category].total += a.value;
      map[a.category].count += 1;
    });
    return Object.entries(map)
      .map(([category, data]) => ({ category: category as AssetCategory, ...data }))
      .sort((a, b) => b.total - a.total);
  },

  getDebtsByCategory: () => {
    const map: Record<string, { total: number; count: number }> = {};
    get().debts.forEach((d) => {
      if (!map[d.category]) map[d.category] = { total: 0, count: 0 };
      map[d.category].total += d.remainingAmount;
      map[d.category].count += 1;
    });
    return Object.entries(map)
      .map(([category, data]) => ({ category: category as DebtCategory, ...data }))
      .sort((a, b) => b.total - a.total);
  },

  getMonthlyDebtObligation: () => get().debts.reduce((sum, d) => sum + (d.emiAmount || 0), 0),
}));
