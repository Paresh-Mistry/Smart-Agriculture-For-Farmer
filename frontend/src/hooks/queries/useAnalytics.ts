'use client';

import { analyticsApi } from '@component/services/analyticService';
import { useQuery } from '@tanstack/react-query';

export const useAnalyticsKeys = {
  farmerDashboard: ['farmer-dashboard'] as const,
  buyerDashboard: ['buyer-dashboard'] as const,
  aiStatus: ['ai-status'] as const,
  marketTrends: ['market-trends'] as const,
};

export const useFarmerDashboard = () => {
  return useQuery({
    queryKey: useAnalyticsKeys.farmerDashboard,
    queryFn: analyticsApi.getFarmerDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

export const useBuyerDashboard = () => {
  return useQuery({
    queryKey: useAnalyticsKeys.buyerDashboard,
    queryFn: analyticsApi.getBuyerDashboard,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
};

export const useAIStatus = () => {
  return useQuery({
    queryKey: useAnalyticsKeys.aiStatus,
    queryFn: analyticsApi.getAIStatus,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useMarketTrends = () => {
  return useQuery({
    queryKey: useAnalyticsKeys.marketTrends,
    queryFn: analyticsApi.getMarketTrends,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};