/**
 * WealthMaster Category System
 * Complete expense & income categories with icons, colors, and auto-categorization keywords
 */

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  keywords: string[]; // For auto-categorization
  isFixed: boolean; // Fixed (rent) vs Variable (dining)
  defaultNecessity: number; // 1-5 default necessity level
}

// ===== EXPENSE CATEGORIES =====
export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'rent',
    name: 'Rent / Housing',
    icon: '🏠',
    color: '#FF6B35',
    type: 'expense',
    keywords: ['rent', 'maintenance', 'housing', 'repair', 'plumber', 'electrician', 'landlord', 'pg', 'hostel'],
    isFixed: true,
    defaultNecessity: 5,
  },
  {
    id: 'groceries',
    name: 'Food & Groceries',
    icon: '🛒',
    color: '#FFB800',
    type: 'expense',
    keywords: ['grocery', 'groceries', 'vegetables', 'fruits', 'rice', 'dal', 'oil', 'milk', 'bread', 'egg', 'chicken', 'mutton', 'fish', 'dmart', 'bigbasket', 'blinkit', 'zepto', 'instamart', 'jiomart', 'kirana', 'supermarket', 'ration'],
    isFixed: false,
    defaultNecessity: 5,
  },
  {
    id: 'dining',
    name: 'Dining Out',
    icon: '🍕',
    color: '#FF006E',
    type: 'expense',
    keywords: ['zomato', 'swiggy', 'restaurant', 'cafe', 'hotel', 'biryani', 'pizza', 'burger', 'dosa', 'thali', 'parcel', 'takeaway', 'dominos', 'kfc', 'mcdonalds', 'subway', 'chai', 'tea', 'coffee', 'juice', 'starbucks', 'canteen', 'mess', 'tiffin', 'food delivery', 'eating out'],
    isFixed: false,
    defaultNecessity: 2,
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚌',
    color: '#00F0FF',
    type: 'expense',
    keywords: ['metro', 'bus', 'auto', 'rickshaw', 'ola', 'uber', 'rapido', 'petrol', 'diesel', 'fuel', 'parking', 'toll', 'train', 'railway', 'irctc', 'cab', 'bike', 'cycle', 'pass', 'ticket', 'flight', 'airport'],
    isFixed: false,
    defaultNecessity: 4,
  },
  {
    id: 'mobile_internet',
    name: 'Mobile & Internet',
    icon: '📱',
    color: '#A855F7',
    type: 'expense',
    keywords: ['recharge', 'jio', 'airtel', 'vi', 'bsnl', 'wifi', 'internet', 'broadband', 'data', 'hotspot', 'act fibernet', 'hathway'],
    isFixed: true,
    defaultNecessity: 3,
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: '🔄',
    color: '#6366F1',
    type: 'expense',
    keywords: ['netflix', 'spotify', 'youtube', 'prime', 'amazon prime', 'hotstar', 'disney', 'zee5', 'sonyliv', 'jiocinema', 'apple', 'google one', 'icloud', 'gym', 'membership', 'subscription', 'premium', 'pro plan', 'annual plan'],
    isFixed: true,
    defaultNecessity: 2,
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: '#EC4899',
    type: 'expense',
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'clothes', 'shoes', 'shirt', 'jeans', 'dress', 'gadget', 'phone', 'earphone', 'headphone', 'laptop', 'charger', 'case', 'cover', 'watch', 'bag', 'mall', 'decathlon', 'reliance digital', 'croma'],
    isFixed: false,
    defaultNecessity: 1,
  },
  {
    id: 'health',
    name: 'Health',
    icon: '💊',
    color: '#10B981',
    type: 'expense',
    keywords: ['medicine', 'doctor', 'hospital', 'clinic', 'pharmacy', 'medical', 'apollo', 'medplus', 'netmeds', 'pharmeasy', '1mg', 'test', 'lab', 'scan', 'xray', 'dental', 'eye', 'glasses', 'insurance premium', 'health checkup'],
    isFixed: false,
    defaultNecessity: 5,
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    color: '#3B82F6',
    type: 'expense',
    keywords: ['course', 'udemy', 'coursera', 'book', 'books', 'tuition', 'class', 'coaching', 'exam', 'fee', 'certificate', 'skill', 'training', 'workshop', 'seminar', 'kindle', 'notion'],
    isFixed: false,
    defaultNecessity: 3,
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: '⚡',
    color: '#F59E0B',
    type: 'expense',
    keywords: ['electricity', 'electric', 'light bill', 'water', 'gas', 'cylinder', 'lpg', 'laundry', 'ironing', 'dhobi', 'washing', 'sewage', 'property tax', 'water bill', 'piped gas'],
    isFixed: true,
    defaultNecessity: 5,
  },
  {
    id: 'personal_care',
    name: 'Personal Care',
    icon: '✂️',
    color: '#8B5CF6',
    type: 'expense',
    keywords: ['haircut', 'salon', 'barber', 'spa', 'facial', 'grooming', 'shampoo', 'soap', 'cream', 'perfume', 'deodorant', 'toothpaste', 'razor', 'skincare', 'parlour', 'parlor'],
    isFixed: false,
    defaultNecessity: 3,
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎮',
    color: '#F43F5E',
    type: 'expense',
    keywords: ['movie', 'cinema', 'pvr', 'inox', 'game', 'gaming', 'playstation', 'xbox', 'steam', 'concert', 'event', 'park', 'outing', 'trip', 'picnic', 'bowling', 'arcade', 'bookmyshow', 'ticket'],
    isFixed: false,
    defaultNecessity: 1,
  },
  {
    id: 'gifts',
    name: 'Gifts & Donations',
    icon: '🎁',
    color: '#14B8A6',
    type: 'expense',
    keywords: ['gift', 'birthday', 'anniversary', 'wedding', 'festival', 'diwali', 'holi', 'christmas', 'eid', 'donation', 'charity', 'temple', 'church', 'mosque', 'offering'],
    isFixed: false,
    defaultNecessity: 2,
  },
  {
    id: 'emi_debt',
    name: 'EMI / Debt',
    icon: '🏦',
    color: '#EF4444',
    type: 'expense',
    keywords: ['emi', 'loan', 'credit card', 'repayment', 'installment', 'interest', 'borrowing', 'debt', 'bajaj', 'hdfc loan', 'personal loan', 'education loan'],
    isFixed: true,
    defaultNecessity: 5,
  },
  {
    id: 'emergency',
    name: 'Emergency',
    icon: '🚨',
    color: '#DC2626',
    type: 'expense',
    keywords: ['emergency', 'accident', 'theft', 'loss', 'fine', 'penalty', 'challan', 'unexpected', 'urgent'],
    isFixed: false,
    defaultNecessity: 5,
  },
  {
    id: 'other_expense',
    name: 'Other',
    icon: '📌',
    color: '#6B7280',
    type: 'expense',
    keywords: [],
    isFixed: false,
    defaultNecessity: 3,
  },
];

// ===== INCOME CATEGORIES =====
export const INCOME_CATEGORIES: Category[] = [
  {
    id: 'salary',
    name: 'Salary',
    icon: '💰',
    color: '#39FF14',
    type: 'income',
    keywords: ['salary', 'wages', 'pay', 'paycheck', 'monthly salary', 'credited'],
    isFixed: true,
    defaultNecessity: 5,
  },
  {
    id: 'freelance',
    name: 'Freelance',
    icon: '💻',
    color: '#00F0FF',
    type: 'income',
    keywords: ['freelance', 'fiverr', 'upwork', 'project', 'client', 'gig', 'contract', 'consulting'],
    isFixed: false,
    defaultNecessity: 5,
  },
  {
    id: 'investment_returns',
    name: 'Investment Returns',
    icon: '📈',
    color: '#A855F7',
    type: 'income',
    keywords: ['dividend', 'interest', 'returns', 'profit', 'capital gain', 'mutual fund', 'fd interest', 'bond'],
    isFixed: false,
    defaultNecessity: 5,
  },
  {
    id: 'cashback',
    name: 'Cashback / Rewards',
    icon: '🎯',
    color: '#FFB800',
    type: 'income',
    keywords: ['cashback', 'reward', 'refund', 'coupon', 'offer', 'discount', 'cred', 'gpay reward', 'paytm cashback'],
    isFixed: false,
    defaultNecessity: 5,
  },
  {
    id: 'gift_received',
    name: 'Gift Received',
    icon: '🎁',
    color: '#14B8A6',
    type: 'income',
    keywords: ['gift', 'birthday money', 'rakhi', 'festival', 'wedding', 'angpao', 'shagun'],
    isFixed: false,
    defaultNecessity: 5,
  },
  {
    id: 'side_hustle',
    name: 'Side Hustle',
    icon: '⚡',
    color: '#F59E0B',
    type: 'income',
    keywords: ['side', 'hustle', 'part-time', 'tuition', 'teaching', 'delivery', 'resell', 'youtube', 'content'],
    isFixed: false,
    defaultNecessity: 5,
  },
  {
    id: 'other_income',
    name: 'Other',
    icon: '📌',
    color: '#6B7280',
    type: 'income',
    keywords: [],
    isFixed: false,
    defaultNecessity: 5,
  },
];

// ===== PAYMENT METHODS =====
export const PAYMENT_METHODS = [
  { id: 'upi', name: 'UPI', icon: '📲' },
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'card', name: 'Card', icon: '💳' },
  { id: 'wallet', name: 'Wallet', icon: '👛' },
  { id: 'net_banking', name: 'Net Banking', icon: '🏦' },
] as const;

// ===== NECESSITY LEVELS =====
export const NECESSITY_LEVELS = [
  { level: 5, label: 'Essential', description: "Can't survive without", color: '#10B981' },
  { level: 4, label: 'Important', description: 'Hard to cut', color: '#3B82F6' },
  { level: 3, label: 'Useful', description: 'Could reduce', color: '#F59E0B' },
  { level: 2, label: 'Nice to Have', description: 'Should reduce', color: '#F97316' },
  { level: 1, label: 'Luxury', description: 'Cut first', color: '#EF4444' },
] as const;

// ===== RECURRENCE OPTIONS =====
export const RECURRENCE_OPTIONS = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
] as const;

// ===== HELPER: Get category by ID =====
export function getCategoryById(id: string): Category | undefined {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find((c) => c.id === id);
}

// ===== HELPER: Get all categories by type =====
export function getCategoriesByType(type: 'expense' | 'income'): Category[] {
  return type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}
