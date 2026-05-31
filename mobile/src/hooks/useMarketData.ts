/**
 * Market Data Hook
 * Handles fetching, refreshing, and state for market data
 * with offline awareness and stale data handling.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { marketAPI } from '@/services/api';
import { useMarketStore } from '@/store/useMarketStore';

interface MarketStatus {
  nseOpen: boolean;
  usOpen: boolean;
  cacheConnected: boolean;
  aiEngineConnected: boolean;
  lastRefresh: string | null;
  isStale: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useMarketData() {
  const [status, setStatus] = useState<MarketStatus>({
    nseOpen: false,
    usOpen: false,
    cacheConnected: false,
    aiEngineConnected: false,
    lastRefresh: null,
    isStale: false,
    isLoading: false,
    error: null,
  });

  const setIndices = useMarketStore((s) => s.setIndices);
  const updatePrices = useMarketStore((s) => s.updatePrices);
  const watchlist = useMarketStore((s) => s.watchlist);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch indices
  const fetchIndices = useCallback(async () => {
    try {
      const response = await marketAPI.getIndices();
      const data = response.data;
      if (data.indices && data.indices.length > 0) {
        setIndices(data.indices.map((idx: any) => ({
          symbol: idx.symbol,
          name: idx.name,
          exchange: idx.exchange,
          price: idx.price,
          change: idx.change,
          changePercent: idx.change_percent,
        })));
        setStatus((s) => ({ ...s, isStale: false, lastRefresh: new Date().toISOString() }));
      }
    } catch (error) {
      setStatus((s) => ({ ...s, isStale: true, error: 'Could not fetch indices' }));
    }
  }, [setIndices]);

  // Fetch watchlist prices
  const fetchWatchlistPrices = useCallback(async () => {
    if (watchlist.length === 0) return;

    try {
      const symbols = watchlist.map((w) => ({ symbol: w.symbol, exchange: w.exchange }));
      const response = await marketAPI.getBatchPrices(symbols);
      const prices = response.data.prices;

      if (prices && prices.length > 0) {
        // Push fresh prices into the store (in-place update of the watchlist).
        updatePrices(
          prices
            .filter((p: any) => !p.error && p.price > 0)
            .map((p: any) => ({
              symbol: p.symbol,
              price: p.price,
              change: p.change,
              change_percent: p.change_percent,
            }))
        );
      }
    } catch (error) {
      // Silently fail - watchlist shows last known prices
    }
  }, [watchlist, updatePrices]);

  // Fetch market status
  const fetchMarketStatus = useCallback(async () => {
    try {
      const response = await marketAPI.getMarketStatus();
      setStatus((s) => ({
        ...s,
        nseOpen: response.data.nse_open || false,
        usOpen: response.data.us_open || false,
        cacheConnected: response.data.cache_connected || false,
        aiEngineConnected: response.data.ai_engine !== 'disconnected',
      }));
    } catch {
      setStatus((s) => ({ ...s, aiEngineConnected: false }));
    }
  }, []);

  // Full refresh
  const refresh = useCallback(async () => {
    setStatus((s) => ({ ...s, isLoading: true, error: null }));
    await Promise.all([fetchIndices(), fetchWatchlistPrices(), fetchMarketStatus()]);
    setStatus((s) => ({ ...s, isLoading: false }));
  }, [fetchIndices, fetchWatchlistPrices, fetchMarketStatus]);

  // Auto-refresh: every 5 min during market hours, every 30 min otherwise
  useEffect(() => {
    refresh(); // Initial fetch

    const interval = status.nseOpen || status.usOpen ? 5 * 60 * 1000 : 30 * 60 * 1000;
    refreshInterval.current = setInterval(refresh, interval);

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [status.nseOpen, status.usOpen]);

  // Refresh when app comes to foreground
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        refresh();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [refresh]);

  return {
    ...status,
    refresh,
    fetchIndices,
    fetchWatchlistPrices,
  };
}
