/**
 * Shared TypeScript types between mobile and backend
 */

export interface StockData {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ';
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
}

export interface Signal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskReward: string;
  timeHorizon: string;
  explanation: string;
  status: 'active' | 'hit_target' | 'hit_stoploss' | 'expired';
  factors: {
    technical: number;
    fundamental: number;
    sentiment: number;
    macro: number;
  };
  chargesImpact: number;
  netExpectedReturn: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  name: string;
  date: string;
  note?: string;
  recurring?: boolean;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
  monthYear: string;
  color: string;
}

export interface Holding {
  id: string;
  symbol: string;
  exchange: 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ';
  quantity: number;
  avgBuyPrice: number;
  buyDate: string;
  currentPrice?: number;
  pnl?: number;
  pnlPercent?: number;
}

export interface ChargesBreakdown {
  grossAmount: number;
  stt: number;
  exchangeCharge: number;
  gst: number;
  sebi: number;
  stampDuty: number;
  dpCharges: number;
  totalCharges: number;
  youPay?: number;
  youReceive?: number;
  chargesPercent: number;
}

export type StrategyMode = 'aggressive' | 'balanced' | 'protect';
export type RiskProfile = 'aggressive' | 'balanced' | 'conservative';
