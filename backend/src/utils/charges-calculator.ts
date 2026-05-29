/**
 * Server-side Transaction Charges Calculator
 * Mirrors the mobile charges.ts but for API responses
 */

import { CHARGES_CONFIG } from '../config/charges.config';

export function calculateIndianStockBuy(price: number, quantity: number, exchange: 'NSE' | 'BSE') {
  const c = CHARGES_CONFIG.indian_stocks;
  const turnover = price * quantity;

  const stt = turnover * c.stt_buy_delivery;
  const exchangeCharge = turnover * (exchange === 'NSE' ? c.exchange_nse : c.exchange_bse);
  const gst = exchangeCharge * c.gst_rate;
  const sebi = turnover * c.sebi_charges;
  const stampDuty = turnover * c.stamp_duty_buy;
  const totalCharges = stt + exchangeCharge + gst + sebi + stampDuty;

  return {
    grossAmount: r(turnover),
    charges: {
      stt: r(stt),
      exchangeCharge: r(exchangeCharge),
      gst: r(gst),
      sebi: r(sebi),
      stampDuty: r(stampDuty),
      dpCharges: 0,
    },
    totalCharges: r(totalCharges),
    youPay: r(turnover + totalCharges),
    chargesPercent: r((totalCharges / turnover) * 100, 4),
  };
}

export function calculateIndianStockSell(price: number, quantity: number, exchange: 'NSE' | 'BSE') {
  const c = CHARGES_CONFIG.indian_stocks;
  const turnover = price * quantity;

  const stt = turnover * c.stt_sell_delivery;
  const exchangeCharge = turnover * (exchange === 'NSE' ? c.exchange_nse : c.exchange_bse);
  const gst = exchangeCharge * c.gst_rate;
  const sebi = turnover * c.sebi_charges;
  const dpCharges = c.dp_charges_per_scrip;
  const totalCharges = stt + exchangeCharge + gst + sebi + dpCharges;

  return {
    grossAmount: r(turnover),
    charges: {
      stt: r(stt),
      exchangeCharge: r(exchangeCharge),
      gst: r(gst),
      sebi: r(sebi),
      stampDuty: 0,
      dpCharges: r(dpCharges),
    },
    totalCharges: r(totalCharges),
    youReceive: r(turnover - totalCharges),
    chargesPercent: r((totalCharges / turnover) * 100, 4),
  };
}

function r(val: number, dec = 2): number {
  return Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
}
