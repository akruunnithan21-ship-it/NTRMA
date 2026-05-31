import React from 'react';
import {
  // Navigation / tabs
  House,
  Wallet,
  TrendingUp,
  BrainCircuit,
  GraduationCap,
  // Actions / chrome
  Settings,
  Search,
  Plus,
  Minus,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Trash2,
  Pencil,
  Send,
  Eye,
  EyeOff,
  Delete,
  Fingerprint,
  // Status / feedback
  Activity,
  Zap,
  ShieldCheck,
  Shield,
  Rocket,
  Scale,
  Target,
  Flame,
  Trophy,
  Award,
  Star,
  Lightbulb,
  Bell,
  Info,
  CircleAlert,
  CircleCheck,
  CircleDot,
  TrendingDown,
  Wifi,
  WifiOff,
  Sparkles,
  Gauge,
  // Finance / data
  IndianRupee,
  Coins,
  Banknote,
  PiggyBank,
  CreditCard,
  Building2,
  ChartLine,
  ChartColumn,
  ChartCandlestick,
  ChartPie,
  Newspaper,
  Percent,
  Calendar,
  Clock,
  Lock,
  BookOpen,
  Bot,
  MessageSquare,
  Briefcase,
  Landmark,
  Bitcoin,
  Car,
  Home as HomeAlt,
  type LucideProps,
} from 'lucide-react-native';
import { colors } from '@/theme';

/**
 * Central icon registry. Every icon used in the app is imported here once and
 * referenced by a stable string name. This gives us:
 *  - a typed `IconName` union (autocomplete + compile-time safety)
 *  - one place to swap the icon set later
 *  - tree-shaking (only these icons ship in the bundle)
 */
const REGISTRY = {
  // tabs
  home: House,
  wallet: Wallet,
  markets: TrendingUp,
  ai: BrainCircuit,
  learn: GraduationCap,
  // chrome / actions
  settings: Settings,
  search: Search,
  plus: Plus,
  minus: Minus,
  close: X,
  check: Check,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  back: ArrowLeft,
  upRight: ArrowUpRight,
  downRight: ArrowDownRight,
  up: ArrowUp,
  down: ArrowDown,
  refresh: RefreshCw,
  trash: Trash2,
  edit: Pencil,
  send: Send,
  eye: Eye,
  eyeOff: EyeOff,
  backspace: Delete,
  biometric: Fingerprint,
  // status
  activity: Activity,
  zap: Zap,
  shieldCheck: ShieldCheck,
  shield: Shield,
  rocket: Rocket,
  scale: Scale,
  target: Target,
  flame: Flame,
  trophy: Trophy,
  award: Award,
  star: Star,
  bulb: Lightbulb,
  bell: Bell,
  info: Info,
  alert: CircleAlert,
  success: CircleCheck,
  dot: CircleDot,
  trendDown: TrendingDown,
  wifi: Wifi,
  wifiOff: WifiOff,
  sparkles: Sparkles,
  gauge: Gauge,
  // finance / data
  rupee: IndianRupee,
  coins: Coins,
  banknote: Banknote,
  piggy: PiggyBank,
  card: CreditCard,
  bank: Building2,
  landmark: Landmark,
  lineChart: ChartLine,
  barChart: ChartColumn,
  candles: ChartCandlestick,
  pie: ChartPie,
  news: Newspaper,
  percent: Percent,
  calendar: Calendar,
  clock: Clock,
  lock: Lock,
  book: BookOpen,
  bot: Bot,
  chat: MessageSquare,
  briefcase: Briefcase,
  crypto: Bitcoin,
  car: Car,
  property: HomeAlt,
} as const;

export type IconName = keyof typeof REGISTRY;

interface IconProps extends Omit<LucideProps, 'name'> {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 22,
  color = colors.textPrimary,
  strokeWidth = 2,
  ...rest
}) => {
  const Cmp = REGISTRY[name];
  if (!Cmp) return null;
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
};

export const ICON_NAMES = Object.keys(REGISTRY) as IconName[];
