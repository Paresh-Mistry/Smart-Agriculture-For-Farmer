'use client';

import { useQuery } from '@tanstack/react-query';
import { mandiService } from '@component/services/mandiService';
import {
  MandiPriceParams,
  TrendParams,
  CompareParams,
  SearchParams,
} from '@component/types/mandi.types';

// Query Keys
export const mandiKeys = {
  all: ['mandi'] as const,
  livePrices: (params?: MandiPriceParams) =>
    [...mandiKeys.all, 'live', params] as const,
  trend: (params: TrendParams) => [...mandiKeys.all, 'trend', params] as const,
  compare: (params: CompareParams) =>
    [...mandiKeys.all, 'compare', params] as const,
  commodities: () => [...mandiKeys.all, 'commodities'] as const,
  states: () => [...mandiKeys.all, 'states'] as const,
  search: (params: SearchParams) => [...mandiKeys.all, 'search', params] as const,
  nearby: (lat: number, lng: number, radius: number, commodity?: string) =>
    [...mandiKeys.all, 'nearby', lat, lng, radius, commodity] as const,
  history: (commodity: string, state?: string, days?: number) =>
    [...mandiKeys.all, 'history', commodity, state, days] as const,
};

// Hooks

/**
 * Get live mandi prices
 * @example
 * const { data: prices } = useLivePrices({ commodity: 'Tomato', state: 'Maharashtra' });
 */
export const useLivePrices = (params: MandiPriceParams = {}) => {
  return useQuery({
    queryKey: mandiKeys.livePrices(params),
    queryFn: () => mandiService.getLivePrices(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

/**
 * Get price trend for a commodity
 * @example
 * const { data: trend } = usePriceTrend({ commodity: 'Tomato', days: 30 });
 */
export const usePriceTrend = (params: TrendParams) => {
  return useQuery({
    queryKey: mandiKeys.trend(params),
    queryFn: () => mandiService.getPriceTrend(params),
    enabled: !!params.commodity,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Compare prices across states
 * @example
 * const { data: comparison } = useComparePrices({ 
 *   commodity: 'Tomato', 
 *   states: ['Maharashtra', 'Punjab'] 
 * });
 */
export const useComparePrices = (params: CompareParams) => {
  return useQuery({
    queryKey: mandiKeys.compare(params),
    queryFn: () => mandiService.comparePrices(params),
    enabled: !!params.commodity && params.states.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get list of available commodities
 * @example
 * const { data: commodities } = useCommodities();
 */
export const useCommodities = () => {
  return useQuery({
    queryKey: mandiKeys.commodities(),
    queryFn: () => mandiService.getCommodities(),
    staleTime: 60 * 60 * 1000, // 1 hour (static data)
  });
};

/**
 * Get list of states
 * @example
 * const { data: states } = useStates();
 */
export const useStates = () => {
  return useQuery({
    queryKey: mandiKeys.states(),
    queryFn: () => mandiService.getStates(),
    staleTime: 60 * 60 * 1000, // 1 hour (static data)
  });
};

/**
 * Search prices by query
 * @example
 * const { data: results } = useSearchPrices({ query: 'Tomato', limit: 20 });
 */
export const useSearchPrices = (params: SearchParams) => {
  return useQuery({
    queryKey: mandiKeys.search(params),
    queryFn: () => mandiService.searchPrices(params),
    enabled: params.query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get nearby mandi prices
 * @example
 * const { data: nearby } = useNearbyPrices(18.5204, 73.8567, 50, 'Tomato');
 */
export const useNearbyPrices = (
  latitude: number,
  longitude: number,
  radius: number = 50,
  commodity?: string
) => {
  return useQuery({
    queryKey: mandiKeys.nearby(latitude, longitude, radius, commodity),
    queryFn: () =>
      mandiService.getNearbyPrices(latitude, longitude, radius, commodity),
    enabled: !!latitude && !!longitude,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Get price history from database
 * @example
 * const { data: history } = usePriceHistory('Tomato', 'Maharashtra', 30);
 */
export const usePriceHistory = (
  commodity: string,
  state?: string,
  days: number = 30
) => {
  return useQuery({
    queryKey: mandiKeys.history(commodity, state, days),
    queryFn: () => mandiService.getPriceHistory(commodity, state, days),
    enabled: !!commodity,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};