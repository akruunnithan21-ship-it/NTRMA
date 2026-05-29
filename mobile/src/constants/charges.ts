/**
 * WealthMaster Transaction Charges Configuration
 * Last Updated: May 2026 (Budget 2025 tax rates)
 *
 * IMPORTANT: Update these values when SEBI/government changes rates.
 * This is the SINGLE source of truth for all charge calculations.
 */

export const CHARGES = {
  indian_stocks: {
    // Securities Transaction Tax
    stt_buy_delivery: 0.001,        // 0.1% on buy (delivery)
    stt_sell_delivery: 0.001,       // 0.1% on sell (delivery)
    stt_sell_intraday: 0.000625,    // 0.0625% on sell (intraday)

    // Exchange Transaction Charges
    exchange_nse: 0.0000345,        // 0.00345% (NSE)
    exchange_bse: 0.000003,         // 0.0003% (BSE)

    // GST on (brokerage + exchange charges)
    gst_rate: 0.18,                 // 18%

    // SEBI Turnover Charges
    sebi_charges: 0.000001,         // ₹10 per crore (0.0001%)

    // Stamp Duty (state-wise, using max)
    stamp_duty_buy: 0.00015,        // 0.015% on buy only
    stamp_duty_sell: 0,             // 0% on sell

    // DP (Depository Participant) Charges
    dp_charges_per_scrip: 15.93,    // ₹15.93 per company on sell (CDSL)

    // INDmoney specific
    brokerage_per_order: 0,         // ₹0 (zero brokerage)
  },

  mutual_funds: {
    // Exit Load (most equity MFs)
    exit_load_1yr: 0.01,            // 1% if redeemed within 1 year
    exit_load_after_1yr: 0,         // 0% after 1 year

    // STT on redemption
    stt_sell: 0.00001,              // 0.001% on sell/redemption

    // Stamp Duty
    stamp_duty_buy: 0.00005,        // 0.005% on purchase

    // Expense Ratio (varies per fund, these are typical ranges)
    expense_ratio_index: 0.002,     // ~0.2% for index funds
    expense_ratio_active: 0.015,    // ~1.5% for active funds
  },

  us_stocks: {
    // INDmoney US stocks charges
    brokerage_per_share: 0.013,     // $0.013 per share
    min_brokerage_per_order: 1.5,   // $1.5 minimum per order

    // Forex conversion markup
    forex_markup: 0.015,            // 1.5% on USD/INR conversion

    // GST on brokerage + forex
    gst_rate: 0.18,                 // 18%

    // TCS (Tax Collected at Source) under LRS
    tcs_threshold: 700000,          // ₹7 lakh per financial year
    tcs_rate_below: 0,              // 0% below ₹7L (post Budget 2025)
    tcs_rate_above: 0.20,           // 20% above ₹7L

    // No STT for US stocks
    // SEC fee: ~$0.0000278 per dollar (negligible)
  },

  tax: {
    // Short Term Capital Gains (< 12 months holding)
    stcg_rate: 0.20,                // 20% (Budget 2024 update)

    // Long Term Capital Gains (> 12 months holding)
    ltcg_rate: 0.125,              // 12.5% (Budget 2024 update)
    ltcg_exemption: 125000,         // ₹1.25 lakh exemption per year

    // For equity mutual funds
    mf_stcg_rate: 0.20,            // 20% (< 1 year)
    mf_ltcg_rate: 0.125,           // 12.5% (> 1 year, above ₹1.25L)
  },
} as const;

/**
 * Calculate total charges for an Indian stock BUY order
 */
export function calculateBuyCharges(params: {
  price: number;
  quantity: number;
  exchange: 'NSE' | 'BSE';
}) {
  const { price, quantity, exchange } = params;
  const turnover = price * quantity;
  const c = CHARGES.indian_stocks;

  const stt = turnover * c.stt_buy_delivery;
  const exchangeCharge = turnover * (exchange === 'NSE' ? c.exchange_nse : c.exchange_bse);
  const gst = (c.brokerage_per_order + exchangeCharge) * c.gst_rate;
  const sebi = turnover * c.sebi_charges;
  const stampDuty = turnover * c.stamp_duty_buy;

  const totalCharges = stt + exchangeCharge + gst + sebi + stampDuty;
  const totalCost = turnover + totalCharges;

  return {
    grossAmount: turnover,
    stt: round(stt),
    exchangeCharge: round(exchangeCharge),
    gst: round(gst),
    sebi: round(sebi),
    stampDuty: round(stampDuty),
    dpCharges: 0,
    totalCharges: round(totalCharges),
    youPay: round(totalCost),
    chargesPercent: round((totalCharges / turnover) * 100, 4),
  };
}

/**
 * Calculate total charges for an Indian stock SELL order
 */
export function calculateSellCharges(params: {
  price: number;
  quantity: number;
  exchange: 'NSE' | 'BSE';
}) {
  const { price, quantity, exchange } = params;
  const turnover = price * quantity;
  const c = CHARGES.indian_stocks;

  const stt = turnover * c.stt_sell_delivery;
  const exchangeCharge = turnover * (exchange === 'NSE' ? c.exchange_nse : c.exchange_bse);
  const gst = (c.brokerage_per_order + exchangeCharge) * c.gst_rate;
  const sebi = turnover * c.sebi_charges;
  const dpCharges = c.dp_charges_per_scrip;

  const totalCharges = stt + exchangeCharge + gst + sebi + dpCharges;
  const youReceive = turnover - totalCharges;

  return {
    grossAmount: turnover,
    stt: round(stt),
    exchangeCharge: round(exchangeCharge),
    gst: round(gst),
    sebi: round(sebi),
    stampDuty: 0,
    dpCharges: round(dpCharges),
    totalCharges: round(totalCharges),
    youReceive: round(youReceive),
    chargesPercent: round((totalCharges / turnover) * 100, 4),
  };
}

/**
 * Calculate break-even price (price at which you neither profit nor lose)
 */
export function calculateBreakEven(params: {
  buyPrice: number;
  quantity: number;
  exchange: 'NSE' | 'BSE';
}) {
  const { buyPrice, quantity, exchange } = params;
  const buyCharges = calculateBuyCharges({ price: buyPrice, quantity, exchange });

  // Binary search for sell price where net = 0
  let low = buyPrice;
  let high = buyPrice * 1.1; // 10% above buy price as upper bound

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const sellCharges = calculateSellCharges({ price: mid, quantity, exchange });
    const netProfit = sellCharges.youReceive - buyCharges.youPay;

    if (Math.abs(netProfit) < 0.01) return round(mid);
    if (netProfit < 0) low = mid;
    else high = mid;
  }

  return round((low + high) / 2);
}

/**
 * Calculate US stock buy charges
 */
export function calculateUSBuyCharges(params: {
  priceUSD: number;
  quantity: number;
  usdInrRate: number;
}) {
  const { priceUSD, quantity, usdInrRate } = params;
  const c = CHARGES.us_stocks;

  const grossUSD = priceUSD * quantity;
  const brokerage = Math.max(quantity * c.brokerage_per_share, c.min_brokerage_per_order);
  const forexCharge = grossUSD * c.forex_markup;
  const gst = (brokerage + forexCharge) * c.gst_rate;

  const totalChargesUSD = brokerage + forexCharge + gst;
  const totalCostUSD = grossUSD + totalChargesUSD;

  return {
    grossAmountUSD: round(grossUSD),
    grossAmountINR: round(grossUSD * usdInrRate),
    brokerage: round(brokerage),
    forexCharge: round(forexCharge),
    gst: round(gst),
    totalChargesUSD: round(totalChargesUSD),
    totalChargesINR: round(totalChargesUSD * usdInrRate),
    youPayUSD: round(totalCostUSD),
    youPayINR: round(totalCostUSD * usdInrRate),
    chargesPercent: round((totalChargesUSD / grossUSD) * 100, 4),
  };
}

/**
 * Calculate tax liability
 */
export function calculateTax(params: {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  holdingDays: number;
  previousLTCGUsed?: number; // How much of ₹1.25L exemption already used
}) {
  const { buyPrice, sellPrice, quantity, holdingDays, previousLTCGUsed = 0 } = params;
  const profit = (sellPrice - buyPrice) * quantity;

  if (profit <= 0) return { taxable: 0, tax: 0, type: 'no-tax' as const, effectiveRate: 0 };

  const isLongTerm = holdingDays >= 365;

  if (isLongTerm) {
    const remainingExemption = Math.max(0, CHARGES.tax.ltcg_exemption - previousLTCGUsed);
    const taxableProfit = Math.max(0, profit - remainingExemption);
    const tax = taxableProfit * CHARGES.tax.ltcg_rate;
    return {
      taxable: round(taxableProfit),
      tax: round(tax),
      type: 'LTCG' as const,
      effectiveRate: profit > 0 ? round((tax / profit) * 100, 2) : 0,
    };
  } else {
    const tax = profit * CHARGES.tax.stcg_rate;
    return {
      taxable: round(profit),
      tax: round(tax),
      type: 'STCG' as const,
      effectiveRate: round(CHARGES.tax.stcg_rate * 100, 2),
    };
  }
}

// Utility
function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
