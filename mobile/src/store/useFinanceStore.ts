import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths } from 'date-fns';
import { EXPENSE_CATEGORIES } from '@/constants/categories';

// ===== TYPES =====

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  name: string;
  date: string; // ISO string
  paymentMethod?: string;
  necessityLevel?: number; // 1-5
  isRecurring?: boolean;
  recurrence?: string; // daily, weekly, monthly, yearly
  note?: string;
  tags?: string[];
  createdAt: string;
}

export interface Budget {
  category: string;
  limit: number;
  color: string;
}

export interface RecurringTemplate {
  id: string;
  type: 'income' | 'expense';
  category: string;
  name: string;
  amount: number;
  frequency: string; // daily, weekly, monthly, yearly
  nextDueDate: string;
  active: boolean;
  paymentMethod?: string;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpenses: number;
  saved: number;
  investableSurplus: number;
  categoryBreakdown: { category: string; spent: number; limit: number; color: string }[];
  dailyAverage: number;
  transactionCount: number;
}

export interface SpendingInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'achievement';
  title: string;
  message: string;
  potentialSaving?: number;
  category?: string;
  createdAt: string;
}

// ===== STORE =====

interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  recurringTemplates: RecurringTemplate[];
  insights: SpendingInsight[];
  budgetCycleStartDay: number; // 1-31, what day salary comes

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  setBudget: (category: string, limit: number) => void;
  setBudgets: (budgets: Budget[]) => void;
  setBudgetCycleStartDay: (day: number) => void;
  addRecurringTemplate: (template: Omit<RecurringTemplate, 'id'>) => void;
  removeRecurringTemplate: (id: string) => void;

  // Computed / Getters
  getMonthlyStats: (monthDate?: Date) => MonthlyStats;
  getTransactionsForMonth: (monthDate?: Date) => Transaction[];
  getTransactionsByCategory: (category: string, monthDate?: Date) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
  getInvestableSurplus: () => number;
  getNecessityBreakdown: (monthDate?: Date) => { level: number; total: number; percent: number }[];
  getMonthOverMonthComparison: () => { thisMonth: number; lastMonth: number; change: number; changePercent: number };
  detectRecurringPatterns: () => RecurringTemplate[];
  generateInsights: () => SpendingInsight[];
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [
        // Seed data for demo
        { id: '1', type: 'income', amount: 13000, category: 'salary', name: 'May Salary', date: '2026-05-28T09:00:00Z', paymentMethod: 'net_banking', necessityLevel: 5, isRecurring: true, recurrence: 'monthly', createdAt: '2026-05-28T09:00:00Z' },
        { id: '2', type: 'expense', amount: 5000, category: 'rent', name: 'Room Rent', date: '2026-05-01T10:00:00Z', paymentMethod: 'upi', necessityLevel: 5, isRecurring: true, recurrence: 'monthly', createdAt: '2026-05-01T10:00:00Z' },
        { id: '3', type: 'expense', amount: 345, category: 'dining', name: 'Zomato Biryani', date: '2026-05-28T13:00:00Z', paymentMethod: 'upi', necessityLevel: 2, createdAt: '2026-05-28T13:00:00Z' },
        { id: '4', type: 'expense', amount: 200, category: 'transport', name: 'Metro Card', date: '2026-05-27T08:00:00Z', paymentMethod: 'upi', necessityLevel: 4, createdAt: '2026-05-27T08:00:00Z' },
        { id: '5', type: 'expense', amount: 199, category: 'subscriptions', name: 'Netflix', date: '2026-05-15T00:00:00Z', paymentMethod: 'card', necessityLevel: 2, isRecurring: true, recurrence: 'monthly', createdAt: '2026-05-15T00:00:00Z' },
        { id: '6', type: 'expense', amount: 2800, category: 'groceries', name: 'Monthly Groceries DMart', date: '2026-05-05T11:00:00Z', paymentMethod: 'upi', necessityLevel: 5, createdAt: '2026-05-05T11:00:00Z' },
        { id: '7', type: 'expense', amount: 650, category: 'transport', name: 'Ola rides', date: '2026-05-20T18:00:00Z', paymentMethod: 'upi', necessityLevel: 3, createdAt: '2026-05-20T18:00:00Z' },
        { id: '8', type: 'expense', amount: 499, category: 'subscriptions', name: 'Spotify Premium', date: '2026-05-22T00:00:00Z', paymentMethod: 'card', necessityLevel: 1, isRecurring: true, recurrence: 'monthly', createdAt: '2026-05-22T00:00:00Z' },
        { id: '9', type: 'expense', amount: 120, category: 'dining', name: 'Chai & Snacks', date: '2026-05-26T16:00:00Z', paymentMethod: 'cash', necessityLevel: 2, createdAt: '2026-05-26T16:00:00Z' },
        { id: '10', type: 'expense', amount: 249, category: 'mobile_internet', name: 'Jio Recharge', date: '2026-05-10T09:00:00Z', paymentMethod: 'upi', necessityLevel: 4, isRecurring: true, recurrence: 'monthly', createdAt: '2026-05-10T09:00:00Z' },
      ],

      budgets: [
        { category: 'rent', limit: 5000, color: '#FF6B35' },
        { category: 'groceries', limit: 3000, color: '#FFB800' },
        { category: 'dining', limit: 800, color: '#FF006E' },
        { category: 'transport', limit: 1000, color: '#00F0FF' },
        { category: 'subscriptions', limit: 700, color: '#6366F1' },
        { category: 'mobile_internet', limit: 300, color: '#A855F7' },
        { category: 'shopping', limit: 500, color: '#EC4899' },
        { category: 'health', limit: 500, color: '#10B981' },
        { category: 'personal_care', limit: 300, color: '#8B5CF6' },
        { category: 'entertainment', limit: 400, color: '#F43F5E' },
        { category: 'bills', limit: 600, color: '#F59E0B' },
      ],

      recurringTemplates: [
        { id: 'r1', type: 'expense', category: 'rent', name: 'Room Rent', amount: 5000, frequency: 'monthly', nextDueDate: '2026-06-01', active: true, paymentMethod: 'upi' },
        { id: 'r2', type: 'expense', category: 'subscriptions', name: 'Netflix', amount: 199, frequency: 'monthly', nextDueDate: '2026-06-15', active: true, paymentMethod: 'card' },
        { id: 'r3', type: 'expense', category: 'mobile_internet', name: 'Jio Recharge', amount: 249, frequency: 'monthly', nextDueDate: '2026-06-10', active: true, paymentMethod: 'upi' },
        { id: 'r4', type: 'income', category: 'salary', name: 'Monthly Salary', amount: 13000, frequency: 'monthly', nextDueDate: '2026-06-28', active: true, paymentMethod: 'net_banking' },
      ],

      insights: [],
      budgetCycleStartDay: 28, // Salary day

      // ===== ACTIONS =====

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [
            { ...tx, id: Date.now().toString(), createdAt: new Date().toISOString() },
            ...state.transactions,
          ],
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      setBudget: (category, limit) =>
        set((state) => {
          const existing = state.budgets.find((b) => b.category === category);
          if (existing) {
            return { budgets: state.budgets.map((b) => b.category === category ? { ...b, limit } : b) };
          }
          const catConfig = EXPENSE_CATEGORIES.find((c) => c.id === category);
          return { budgets: [...state.budgets, { category, limit, color: catConfig?.color || '#6B7280' }] };
        }),

      setBudgets: (budgets) => set({ budgets }),

      setBudgetCycleStartDay: (day) => set({ budgetCycleStartDay: day }),

      addRecurringTemplate: (template) =>
        set((state) => ({
          recurringTemplates: [...state.recurringTemplates, { ...template, id: Date.now().toString() }],
        })),

      removeRecurringTemplate: (id) =>
        set((state) => ({
          recurringTemplates: state.recurringTemplates.filter((t) => t.id !== id),
        })),

      // ===== COMPUTED =====

      getTransactionsForMonth: (monthDate = new Date()) => {
        const state = get();
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        return state.transactions.filter((t) => {
          const txDate = parseISO(t.date);
          return isWithinInterval(txDate, { start, end });
        });
      },

      getTransactionsByCategory: (category, monthDate = new Date()) => {
        const txns = get().getTransactionsForMonth(monthDate);
        return txns.filter((t) => t.category === category);
      },

      getRecentTransactions: (limit = 20) => {
        const state = get();
        return [...state.transactions]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      },

      getMonthlyStats: (monthDate = new Date()) => {
        const state = get();
        const txns = state.getTransactionsForMonth(monthDate);

        const totalIncome = txns
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = txns
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const saved = totalIncome - totalExpenses;

        // Category breakdown
        const categoryBreakdown = state.budgets.map((budget) => {
          const spent = txns
            .filter((t) => t.type === 'expense' && t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0);
          return { category: budget.category, spent, limit: budget.limit, color: budget.color };
        });

        // Days in month so far
        const today = new Date();
        const daysElapsed = monthDate.getMonth() === today.getMonth() ? today.getDate() : 30;
        const dailyAverage = daysElapsed > 0 ? totalExpenses / daysElapsed : 0;

        // Investable surplus: whatever remains after essential expenses minus emergency buffer
        const investableSurplus = Math.max(0, totalIncome - totalExpenses - 1300); // Keep ₹1300 emergency buffer

        return {
          totalIncome,
          totalExpenses,
          saved,
          investableSurplus,
          categoryBreakdown,
          dailyAverage: Math.round(dailyAverage),
          transactionCount: txns.length,
        };
      },

      getInvestableSurplus: () => {
        const stats = get().getMonthlyStats();
        return stats.investableSurplus;
      },

      getNecessityBreakdown: (monthDate = new Date()) => {
        const txns = get().getTransactionsForMonth(monthDate);
        const expenses = txns.filter((t) => t.type === 'expense');
        const total = expenses.reduce((sum, t) => sum + t.amount, 0);

        const levels = [5, 4, 3, 2, 1];
        return levels.map((level) => {
          const levelTotal = expenses
            .filter((t) => (t.necessityLevel || 3) === level)
            .reduce((sum, t) => sum + t.amount, 0);
          return {
            level,
            total: levelTotal,
            percent: total > 0 ? Math.round((levelTotal / total) * 100) : 0,
          };
        });
      },

      getMonthOverMonthComparison: () => {
        const state = get();
        const thisMonthStats = state.getMonthlyStats(new Date());
        const lastMonthStats = state.getMonthlyStats(subMonths(new Date(), 1));

        const change = thisMonthStats.totalExpenses - lastMonthStats.totalExpenses;
        const changePercent = lastMonthStats.totalExpenses > 0
          ? Math.round((change / lastMonthStats.totalExpenses) * 100)
          : 0;

        return {
          thisMonth: thisMonthStats.totalExpenses,
          lastMonth: lastMonthStats.totalExpenses,
          change,
          changePercent,
        };
      },

      detectRecurringPatterns: () => {
        const state = get();
        const patterns: RecurringTemplate[] = [];
        const nameGroups: Record<string, Transaction[]> = {};

        state.transactions.forEach((t) => {
          const key = `${t.name.toLowerCase()}_${t.category}`;
          if (!nameGroups[key]) nameGroups[key] = [];
          nameGroups[key].push(t);
        });

        Object.entries(nameGroups).forEach(([key, txns]) => {
          if (txns.length >= 2) {
            const avgAmount = txns.reduce((s, t) => s + t.amount, 0) / txns.length;
            const first = txns[0];
            if (!state.recurringTemplates.find((r) => r.name.toLowerCase() === first.name.toLowerCase())) {
              patterns.push({
                id: `detected_${key}`,
                type: first.type,
                category: first.category,
                name: first.name,
                amount: Math.round(avgAmount),
                frequency: 'monthly',
                nextDueDate: '',
                active: false,
              });
            }
          }
        });

        return patterns;
      },

      generateInsights: () => {
        const state = get();
        const stats = state.getMonthlyStats();
        const insights: SpendingInsight[] = [];
        const now = new Date().toISOString();

        // Check budget breaches
        stats.categoryBreakdown.forEach((cb) => {
          if (cb.spent > cb.limit) {
            const catConfig = EXPENSE_CATEGORIES.find((c) => c.id === cb.category);
            insights.push({
              id: `breach_${cb.category}`,
              type: 'warning',
              title: `${catConfig?.icon} ${catConfig?.name} over budget!`,
              message: `You've spent ₹${cb.spent.toLocaleString('en-IN')} of ₹${cb.limit.toLocaleString('en-IN')} budget.`,
              category: cb.category,
              createdAt: now,
            });
          } else if (cb.spent > cb.limit * 0.9 && cb.spent > 0) {
            const catConfig = EXPENSE_CATEGORIES.find((c) => c.id === cb.category);
            insights.push({
              id: `warn_${cb.category}`,
              type: 'warning',
              title: `${catConfig?.icon} ${catConfig?.name} almost full`,
              message: `${Math.round((cb.spent / cb.limit) * 100)}% used — ₹${(cb.limit - cb.spent).toLocaleString('en-IN')} remaining.`,
              category: cb.category,
              createdAt: now,
            });
          }
        });

        // Subscription savings
        const subSpend = stats.categoryBreakdown.find((c) => c.category === 'subscriptions');
        if (subSpend && subSpend.spent > 500) {
          insights.push({
            id: 'sub_high',
            type: 'suggestion',
            title: '🔄 Subscription check',
            message: `You're spending ₹${subSpend.spent}/month on subscriptions. Review if all are worth keeping.`,
            potentialSaving: Math.round(subSpend.spent * 0.3),
            category: 'subscriptions',
            createdAt: now,
          });
        }

        // Dining savings
        const diningSpend = stats.categoryBreakdown.find((c) => c.category === 'dining');
        if (diningSpend && diningSpend.spent > 500) {
          insights.push({
            id: 'dining_high',
            type: 'suggestion',
            title: '🍕 Dining out savings',
            message: `Cooking 2 meals instead of ordering could save ~₹${Math.round(diningSpend.spent * 0.4)}/month.`,
            potentialSaving: Math.round(diningSpend.spent * 0.4),
            category: 'dining',
            createdAt: now,
          });
        }

        // Zero spend days achievement
        const daysThisMonth = new Date().getDate();
        const daysWithExpenses = new Set(
          state.getTransactionsForMonth()
            .filter((t) => t.type === 'expense')
            .map((t) => parseISO(t.date).getDate())
        ).size;
        const zeroSpendDays = daysThisMonth - daysWithExpenses;
        if (zeroSpendDays >= 5) {
          insights.push({
            id: 'zero_spend',
            type: 'achievement',
            title: '🏆 Zero-spend streak!',
            message: `${zeroSpendDays} days with no spending this month. Keep it up!`,
            createdAt: now,
          });
        }

        return insights;
      },
    }),
    {
      name: 'wealthmaster-finance',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the data fields, not computed functions
      partialize: (state) => ({
        transactions: state.transactions,
        budgets: state.budgets,
        recurringTemplates: state.recurringTemplates,
        budgetCycleStartDay: state.budgetCycleStartDay,
      }),
    }
  )
);
