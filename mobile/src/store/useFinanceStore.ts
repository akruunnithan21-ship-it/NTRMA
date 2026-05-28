import { create } from 'zustand';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  name: string;
  date: string;
  note?: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
  color: string;
}

interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  monthlyIncome: number;
  monthlyExpenses: number;
  investableSurplus: number;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  setBudgets: (budgets: Budget[]) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  budgets: [
    { category: 'Rent', limit: 5000, spent: 5000, color: '#FF6B35' },
    { category: 'Food', limit: 3000, spent: 2800, color: '#FFB800' },
    { category: 'Transport', limit: 800, spent: 650, color: '#00F0FF' },
    { category: 'Subscriptions', limit: 500, spent: 499, color: '#A855F7' },
    { category: 'Miscellaneous', limit: 500, spent: 251, color: '#8A8AA3' },
  ],
  monthlyIncome: 13000,
  monthlyExpenses: 9200,
  investableSurplus: 2600,

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [
        { ...tx, id: Date.now().toString() },
        ...state.transactions,
      ],
    })),

  setBudgets: (budgets) => set({ budgets }),
}));
