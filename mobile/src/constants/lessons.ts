/**
 * WealthMaster Education System — Lesson Content
 * Bite-sized financial education for beginners
 */

export interface Lesson {
  id: string;
  title: string;
  category: string;
  duration: number; // minutes
  content: string;
  keyTakeaway: string;
}

export const LESSONS: Lesson[] = [
  // === BASICS ===
  { id: 'b1', title: 'What is a Stock?', category: 'basics', duration: 2, content: 'A stock is a tiny piece of ownership in a company. When you buy 1 share of Tata Motors, you literally own a tiny fraction of that company. If the company does well, your share becomes more valuable. If it does badly, it loses value. Companies sell shares to raise money to grow their business.', keyTakeaway: 'Buying a stock = buying a piece of a company.' },
  { id: 'b2', title: 'What is a Mutual Fund?', category: 'basics', duration: 3, content: 'A mutual fund pools money from thousands of people and invests it in 30-100 different stocks. A professional fund manager decides which stocks to buy/sell. This gives you diversification (not all eggs in one basket) without needing to pick individual stocks yourself. You can start SIPs from just ₹500/month.', keyTakeaway: 'Mutual fund = professional manages your money across many stocks.' },
  { id: 'b3', title: 'What is SIP?', category: 'basics', duration: 2, content: 'SIP (Systematic Investment Plan) means investing a fixed amount every month automatically. Example: ₹1,000 every month into a mutual fund. When prices are high, you buy fewer units. When prices are low, you buy more units. Over time, this averages out your cost — called "rupee cost averaging". SIP is the #1 way for beginners to start investing.', keyTakeaway: 'SIP = auto-invest fixed amount monthly. Best way to start.' },
  { id: 'b4', title: 'What is an Index Fund?', category: 'basics', duration: 2, content: 'An index fund copies a market index like NIFTY 50 (top 50 Indian companies). Instead of a human picking stocks, it just buys all 50 stocks in the same proportion. Advantage: very low fees (0.1-0.2% vs 1-2% for active funds), and most active managers fail to beat the index over 10+ years anyway.', keyTakeaway: 'Index fund = buy all top stocks cheaply. Often beats expensive fund managers.' },
  // === TECHNICAL ===
  { id: 't1', title: 'What is RSI?', category: 'technical', duration: 3, content: 'RSI (Relative Strength Index) measures if a stock has been bought too much (overbought) or sold too much (oversold) recently. Scale: 0-100. Above 70 = overbought (might fall soon). Below 30 = oversold (might rise soon). Between 40-60 = normal. Our AI uses RSI as one of 150+ indicators to generate signals.', keyTakeaway: 'RSI > 70 = overheated. RSI < 30 = potential buying opportunity.' },
  { id: 't2', title: 'What is MACD?', category: 'technical', duration: 3, content: 'MACD (Moving Average Convergence Divergence) shows when a trend is starting or ending. It uses two moving averages. When the fast line crosses ABOVE the slow line = BUY signal. When it crosses BELOW = SELL signal. Think of it like two runners — when the fast runner overtakes the slow one, momentum is shifting.', keyTakeaway: 'MACD crossover above = trend starting up. Below = trend going down.' },
  { id: 't3', title: 'What is a Stop Loss?', category: 'technical', duration: 2, content: 'A stop loss is a price you set where you automatically sell to prevent bigger losses. Example: You buy at ₹100, set stop loss at ₹94. If price drops to ₹94, you sell — losing only 6%. Without stop loss, it could drop to ₹70 and you lose 30%. Always set a stop loss. Our AI calculates the best stop loss level for every signal.', keyTakeaway: 'Stop loss = safety net. Limits your loss to a small amount.' },
  { id: 't4', title: 'What are Candlestick Patterns?', category: 'technical', duration: 3, content: 'Each candle on a chart shows 4 prices: open, high, low, close for one day. Green candle = price went up. Red = price went down. Certain combinations of candles predict what happens next. Example: "Bullish Engulfing" (big green after small red) means buyers overpowered sellers — price likely to rise. Our AI detects 25+ such patterns.', keyTakeaway: 'Candlestick patterns = clues about what buyers and sellers are doing.' },
  // === RISK ===
  { id: 'r1', title: 'What is Risk:Reward Ratio?', category: 'risk', duration: 2, content: 'Risk:Reward compares how much you can lose vs how much you can gain. Example: Buy at ₹100, stop loss at ₹94 (risk ₹6), target at ₹118 (reward ₹18). Ratio = 1:3 (risking 1 to gain 3). Rule: Never take a trade below 1:2. Our AI only recommends trades with good risk:reward.', keyTakeaway: 'Only take trades where potential gain is 2x or more of potential loss.' },
  { id: 'r2', title: 'Why Diversification Matters', category: 'risk', duration: 2, content: 'Never put all money in one stock. If that company fails, you lose everything. Spread across 5-10 different stocks in different sectors. If pharma falls, your IT stocks might rise. With ₹2,000-3,000/month, start with 2-3 stocks max or use mutual funds for instant diversification.', keyTakeaway: 'Don\'t put all eggs in one basket. Spread across sectors.' },
  { id: 'r3', title: 'Position Sizing for Small Capital', category: 'risk', duration: 3, content: 'With limited money, never risk more than 5% of your total capital on a single trade. If you have ₹10,000 invested, max loss on any trade = ₹500. This means: if stop loss is 5% below entry, you can invest the full ₹10,000. If stop loss is 10% below, only invest ₹5,000. Our AI considers your capital size.', keyTakeaway: 'Never risk more than 5% of total capital on one trade.' },
  // === MONEY ===
  { id: 'm1', title: 'The 50/30/20 Rule', category: 'money', duration: 2, content: '50% of income for Needs (rent, food, bills). 30% for Wants (dining, entertainment, shopping). 20% for Savings & Investments. With ₹13,000 salary: ₹6,500 needs, ₹3,900 wants, ₹2,600 invest. This is your starting framework — our AI adjusts it based on your actual spending patterns.', keyTakeaway: 'Aim to invest at least 20% of income. Track to find where you can do more.' },
  { id: 'm2', title: 'Emergency Fund First', category: 'money', duration: 2, content: 'Before aggressive investing, build a safety net of 3 months expenses. With ₹9,200/month expenses, you need ~₹28,000 as emergency fund. Keep it in a savings account or liquid fund (easy access). Once you have this, you can invest aggressively without fear of needing that money suddenly.', keyTakeaway: 'Build 3-month emergency fund first. Then invest aggressively.' },
  { id: 'm3', title: 'Power of Compounding', category: 'money', duration: 2, content: 'Compounding means your profits earn more profits. ₹2,000/month at 15% annual return: After 1 year = ₹26,000. After 5 years = ₹1,80,000. After 10 years = ₹5,50,000. After 20 years = ₹25,00,000! The earlier you start, the more time compounding works for you. Even ₹500/month matters over 20 years.', keyTakeaway: 'Start now, even if amount is small. Time + compounding = wealth.' },
];

export const GLOSSARY: { term: string; definition: string }[] = [
  { term: 'P/E Ratio', definition: 'Price ÷ Earnings per share. Shows how much investors pay per ₹1 of profit. Lower P/E = cheaper stock.' },
  { term: 'Market Cap', definition: 'Total value of all shares. Share price × total shares. Large cap = ₹20,000+ Cr, Mid = ₹5,000-20,000 Cr, Small = below ₹5,000 Cr.' },
  { term: 'NAV', definition: 'Net Asset Value. Price of 1 unit of a mutual fund. Goes up when fund performs well.' },
  { term: 'Bull Market', definition: 'Market going UP consistently. Investors are optimistic.' },
  { term: 'Bear Market', definition: 'Market going DOWN consistently (20%+ fall from peak). Investors are fearful.' },
  { term: 'Volume', definition: 'Number of shares traded in a day. High volume = many people interested. Confirms trends.' },
  { term: 'Dividend', definition: 'Cash paid by company to shareholders from profits. Like a bonus for owning the stock.' },
  { term: 'NIFTY 50', definition: 'Index of top 50 Indian companies on NSE. If NIFTY goes up, overall market is doing well.' },
  { term: 'FII/DII', definition: 'FII = Foreign investors. DII = Indian institutions (mutual funds, insurance). Their buying/selling moves markets.' },
  { term: 'Intraday', definition: 'Buy and sell on same day. High risk. Not recommended for beginners.' },
  { term: 'Delivery', definition: 'Buy and hold for multiple days/weeks. Safer than intraday. Our AI focuses on this.' },
  { term: 'Blue Chip', definition: 'Large, well-established companies (Reliance, TCS, HDFC). Safer but slower growth.' },
  { term: 'Small Cap', definition: 'Small companies. Higher risk but can grow 2x-10x faster than large caps.' },
  { term: 'LTCG', definition: 'Long Term Capital Gains tax. 12.5% on profit above ₹1.25L if held >1 year.' },
  { term: 'STCG', definition: 'Short Term Capital Gains tax. 20% on all profit if sold within 1 year.' },
];

export function getLessonsByCategory(category: string): Lesson[] {
  return LESSONS.filter((l) => l.category === category);
}
