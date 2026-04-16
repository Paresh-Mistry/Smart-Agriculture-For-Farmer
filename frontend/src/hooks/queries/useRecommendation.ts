// 'use client';

// import { useMutation } from '@tanstack/react-query';
// import { recommendationApi } from '@component/services/recommendationService';
// import {
//   SoilWeatherInput,
//   ExistingCropInput,
// } from '@component/types/recommendation.types';
// import { toast } from 'sonner';

// export const useRecommendCrop = () => {
//   return useMutation({
//     mutationFn: (data: SoilWeatherInput) =>
//       recommendationApi.recommendCrop(data),
//     onSuccess: (data) => {
//       toast.success(`Recommended Crop: ${data.recommended_crop}`);
//     },
//     onError: (error: any) => {
//       toast.error(error?.response?.data?.detail || 'Failed to get recommendation');
//     },
//   });
// };

// export const useRecommendFertilizer = () => {
//   return useMutation({
//     mutationFn: (data: ExistingCropInput) =>
//       recommendationApi.recommendFertilizer(data),
//     onSuccess: (data) => {
//       toast.success(`Recommended Fertilizer: ${data.recommended_fertilizer}`);
//     },
//     onError: (error: any) => {
//       toast.error(error?.response?.data?.detail || 'Failed to get recommendation');
//     },
//   });
// };



// hooks/queries/useRecommendation.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import {
  predictCrop,
  predictCropBatch,
  fetchSupportedCrops,
  fetchModelInfo,
  fetchFeatureImportance,
  fetchCropDetails
} from '@component/services/recommendationService';

import type {
  RecommendInput,
  RecommendResponse,
  BatchRecommendInput,
  BatchRecommendResponse,
  ModelInfo,
  FeatureImportanceResponse,
  CropsResponse,
} from '@component/types/recommendation.types';
import { CropDetails, FetchCropDetailsInput } from '@component/types/crop.types';

/* ── Query keys ─────────────────────────────────────────────────────────── */
export const RECOMMENDATION_KEYS = {
  all:             ['recommendation'] as const,
  prediction:      () => [...RECOMMENDATION_KEYS.all, 'prediction'] as const,
  crops:           () => [...RECOMMENDATION_KEYS.all, 'crops'] as const,
  modelInfo:       () => [...RECOMMENDATION_KEYS.all, 'modelInfo'] as const,
  featureImportance: () => [...RECOMMENDATION_KEYS.all, 'featureImportance'] as const,
} as const;

/* ─────────────────────────────────────────────────────────────────────────
   useRecommendCrop
   Mutation — POST /recommendation/predict
   ───────────────────────────────────────────────────────────────────────── */
export function useRecommendCrop(): UseMutationResult<
  RecommendResponse,
  Error,
  RecommendInput
> {
  const qc = useQueryClient();

  return useMutation<RecommendResponse, Error, RecommendInput>({
    mutationFn: predictCrop,

    onSuccess: (data, variables) => {
      // Cache the result so it can be read from anywhere without re-fetching
      qc.setQueryData(
        [...RECOMMENDATION_KEYS.prediction(), variables],
        data,
      );
    },

    onError: (err) => {
      console.error('[useRecommendCrop]', err.message);
    },
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   useRecommendCropBatch
   Mutation — POST /recommendation/predict/batch
   ───────────────────────────────────────────────────────────────────────── */
export function useRecommendCropBatch(): UseMutationResult<
  BatchRecommendResponse,
  Error,
  BatchRecommendInput
> {
  return useMutation<BatchRecommendResponse, Error, BatchRecommendInput>({
    mutationFn: predictCropBatch,
    onError: (err) => console.error('[useRecommendCropBatch]', err.message),
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   useSupportedCrops
   Query — GET /recommendation/crops
   Cached for 24 h (crops never change at runtime)
   ───────────────────────────────────────────────────────────────────────── */
export function useSupportedCrops(): UseQueryResult<CropsResponse, Error> {
  return useQuery<CropsResponse, Error>({
    queryKey:  RECOMMENDATION_KEYS.crops(),
    queryFn:   fetchSupportedCrops,
    staleTime: 1000 * 60 * 60 * 24,  // 24 h
    gcTime:    1000 * 60 * 60 * 24,
    retry: 2,
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   useModelInfo
   Query — GET /recommendation/model/info
   Cached for 1 h
   ───────────────────────────────────────────────────────────────────────── */
export function useModelInfo(): UseQueryResult<ModelInfo, Error> {
  return useQuery<ModelInfo, Error>({
    queryKey:  RECOMMENDATION_KEYS.modelInfo(),
    queryFn:   fetchModelInfo,
    staleTime: 1000 * 60 * 60,
    gcTime:    1000 * 60 * 60,
    retry: 2,
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   useFeatureImportance
   Query — GET /recommendation/model/features
   Cached for 1 h
   ───────────────────────────────────────────────────────────────────────── */
export function useFeatureImportance(): UseQueryResult<
  FeatureImportanceResponse,
  Error
> {
  return useQuery<FeatureImportanceResponse, Error>({
    queryKey:  RECOMMENDATION_KEYS.featureImportance(),
    queryFn:   fetchFeatureImportance,
    staleTime: 1000 * 60 * 60,
    gcTime:    1000 * 60 * 60,
    retry: 2,
  });
}

export const useCropDetails = () => {
  return useMutation<CropDetails, Error, FetchCropDetailsInput>({
    mutationFn: fetchCropDetails,
    retry: 1,
    retryDelay: 1000,
  });
};