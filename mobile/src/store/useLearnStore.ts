import { create } from 'zustand';
import { LESSONS } from '@/constants/lessons';

const XP_PER_LESSON = 50;

interface LearnState {
  completed: string[]; // lesson ids
  lastStudyDate: string | null; // ISO date (yyyy-mm-dd)
  streak: number;
  isComplete: (id: string) => boolean;
  markComplete: (id: string) => void;
  getXP: () => number;
  getLevel: () => string;
  getCategoryProgress: (category: string) => { done: number; total: number };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export const useLearnStore = create<LearnState>((set, get) => ({
  completed: [],
  lastStudyDate: null,
  streak: 0,

  isComplete: (id) => get().completed.includes(id),

  markComplete: (id) =>
    set((s) => {
      if (s.completed.includes(id)) return s;
      // streak logic
      const today = todayStr();
      let streak = s.streak;
      if (s.lastStudyDate !== today) {
        const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        streak = s.lastStudyDate === y ? s.streak + 1 : 1;
      }
      return { completed: [...s.completed, id], lastStudyDate: today, streak };
    }),

  getXP: () => get().completed.length * XP_PER_LESSON,

  getLevel: () => {
    const xp = get().getXP();
    if (xp >= 500) return 'Pro';
    if (xp >= 250) return 'Intermediate';
    if (xp >= 100) return 'Novice';
    return 'Beginner';
  },

  getCategoryProgress: (category) => {
    const total = LESSONS.filter((l) => l.category === category).length;
    const done = get().completed.filter((id) => LESSONS.find((l) => l.id === id)?.category === category).length;
    return { done, total };
  },
}));
