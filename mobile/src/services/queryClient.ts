import { QueryClient } from '@tanstack/react-query';

/**
 * Shared React Query client.
 * Tuned for a personal app where the backend may be offline (only one PC runs
 * it at a time): short retries, generous stale time, no aggressive refetching.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 800,
      staleTime: 60_000, // data considered fresh for 1 min
      gcTime: 10 * 60_000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
