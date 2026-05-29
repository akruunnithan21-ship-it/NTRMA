/**
 * Charges Configuration - Backend
 * Single source of truth for transaction cost calculations
 * Update when SEBI/government modifies rates
 */

export const CHARGES_CONFIG = {
  indian_stocks: {
    stt_buy_delivery: 0.001,
    stt_sell_delivery: 0.001,
    stt_sell_intraday: 0.000625,
    exchange_nse: 0.0000345,
    exchange_bse: 0.000003,
    gst_rate: 0.18,
    sebi_charges: 0.000001,
    stamp_duty_buy: 0.00015,
    dp_charges_per_scrip: 15.93,
    brokerage: 0,
  },
  mutual_funds: {
    exit_load_1yr: 0.01,
    stt_sell: 0.00001,
    stamp_duty_buy: 0.00005,
  },
  us_stocks: {
    brokerage_per_share: 0.013,
    min_brokerage: 1.5,
    forex_markup: 0.015,
    gst_rate: 0.18,
    tcs_threshold: 700000,
    tcs_rate_above: 0.20,
  },
  tax: {
    stcg_rate: 0.20,
    ltcg_rate: 0.125,
    ltcg_exemption: 125000,
  },
} as const;
