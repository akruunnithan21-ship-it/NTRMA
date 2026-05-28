/**
 * Auto-Categorization Engine
 * Matches expense descriptions to categories using keyword rules + history learning
 */

import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, Category } from '@/constants/categories';

interface CategorizationResult {
  categoryId: string;
  confidence: number; // 0-1
  source: 'keyword' | 'history' | 'fallback';
}

// In-memory history store (persisted via MMKV in production)
let historyMap: Record<string, { categoryId: string; count: number }[]> = {};

/**
 * Auto-categorize an expense/income based on its name/description
 */
export function autoCategorize(
  text: string,
  type: 'expense' | 'income' = 'expense'
): CategorizationResult {
  const normalized = text.toLowerCase().trim();
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // 1. Check history first (user's own patterns take priority)
  const historyResult = checkHistory(normalized);
  if (historyResult && historyResult.confidence >= 0.8) {
    return historyResult;
  }

  // 2. Keyword matching
  const keywordResult = matchKeywords(normalized, categories);
  if (keywordResult) {
    return keywordResult;
  }

  // 3. Partial matching (substring)
  const partialResult = partialMatch(normalized, categories);
  if (partialResult) {
    return partialResult;
  }

  // 4. Fallback to "Other"
  return {
    categoryId: type === 'expense' ? 'other_expense' : 'other_income',
    confidence: 0,
    source: 'fallback',
  };
}

/**
 * Check user's history for this name
 */
function checkHistory(text: string): CategorizationResult | null {
  const entries = historyMap[text];
  if (!entries || entries.length === 0) return null;

  // Sort by count (most used category for this name)
  const sorted = [...entries].sort((a, b) => b.count - a.count);
  const top = sorted[0];
  const totalUses = entries.reduce((sum, e) => sum + e.count, 0);
  const confidence = top.count / totalUses;

  if (confidence >= 0.5 && top.count >= 2) {
    return {
      categoryId: top.categoryId,
      confidence: Math.min(confidence, 0.95),
      source: 'history',
    };
  }

  return null;
}

/**
 * Match against category keywords (exact word match)
 */
function matchKeywords(text: string, categories: Category[]): CategorizationResult | null {
  let bestMatch: { categoryId: string; score: number } | null = null;

  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (text === keyword || text.includes(keyword)) {
        const score = keyword.length / text.length; // Longer keyword match = higher confidence
        const adjustedScore = text === keyword ? 1.0 : Math.min(score + 0.5, 0.95);

        if (!bestMatch || adjustedScore > bestMatch.score) {
          bestMatch = { categoryId: category.id, score: adjustedScore };
        }
      }
    }
  }

  if (bestMatch) {
    return {
      categoryId: bestMatch.categoryId,
      confidence: bestMatch.score,
      source: 'keyword',
    };
  }

  return null;
}

/**
 * Partial/fuzzy matching for close matches
 */
function partialMatch(text: string, categories: Category[]): CategorizationResult | null {
  const words = text.split(/\s+/);

  for (const word of words) {
    if (word.length < 3) continue; // Skip short words

    for (const category of categories) {
      for (const keyword of category.keywords) {
        // Check if any word starts with the keyword or vice versa
        if (keyword.startsWith(word) || word.startsWith(keyword)) {
          return {
            categoryId: category.id,
            confidence: 0.5,
            source: 'keyword',
          };
        }
      }
    }
  }

  return null;
}

/**
 * Learn from user's categorization choice (call after user confirms/changes category)
 */
export function learnCategorization(text: string, categoryId: string): void {
  const normalized = text.toLowerCase().trim();

  if (!historyMap[normalized]) {
    historyMap[normalized] = [];
  }

  const existing = historyMap[normalized].find((e) => e.categoryId === categoryId);
  if (existing) {
    existing.count++;
  } else {
    historyMap[normalized].push({ categoryId, count: 1 });
  }
}

/**
 * Get suggested names based on category (for quick-pick)
 */
export function getSuggestedNames(categoryId: string): string[] {
  const suggestions: Record<string, string[]> = {
    groceries: ['Vegetables', 'Rice & Dal', 'Milk', 'Fruits', 'DMart', 'BigBasket', 'Blinkit', 'Zepto'],
    dining: ['Zomato', 'Swiggy', 'Chai', 'Coffee', 'Lunch', 'Dinner', 'Biryani', 'Pizza'],
    transport: ['Metro', 'Bus', 'Auto', 'Ola', 'Uber', 'Petrol', 'Rapido', 'Train'],
    mobile_internet: ['Jio Recharge', 'Airtel Recharge', 'WiFi Bill', 'Data Pack'],
    subscriptions: ['Netflix', 'Spotify', 'YouTube Premium', 'Amazon Prime', 'Gym'],
    shopping: ['Amazon', 'Flipkart', 'Myntra', 'Clothes', 'Gadget', 'Shoes'],
    health: ['Medicine', 'Doctor Visit', 'Lab Test', 'Pharmacy'],
    bills: ['Electricity', 'Water Bill', 'Gas Cylinder', 'Laundry'],
    personal_care: ['Haircut', 'Salon', 'Toiletries', 'Grooming'],
    entertainment: ['Movie', 'Outing', 'Game', 'Event'],
    education: ['Udemy Course', 'Book', 'Exam Fee', 'Coaching'],
    rent: ['Rent', 'Maintenance', 'Repair'],
    gifts: ['Birthday Gift', 'Festival', 'Donation'],
    emi_debt: ['EMI', 'Credit Card Bill', 'Loan Payment'],
    salary: ['Monthly Salary', 'Salary Credited'],
    freelance: ['Fiverr', 'Client Payment', 'Project Fee'],
    cashback: ['GPay Cashback', 'Cred Reward', 'Refund'],
  };

  return suggestions[categoryId] || [];
}

/**
 * Export history for backup
 */
export function getHistoryData(): typeof historyMap {
  return { ...historyMap };
}

/**
 * Import history from backup
 */
export function loadHistoryData(data: typeof historyMap): void {
  historyMap = { ...data };
}
