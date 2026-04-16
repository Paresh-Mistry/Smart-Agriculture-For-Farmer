// import apiInstance from './apiInstance';
// import {
//   SoilWeatherInput,
//   ExistingCropInput,
//   CropRecommendationResponse,
//   FertilizerRecommendationResponse,
// } from '@component/types/recommendation.types';

// export const recommendationApi = {
//   // Recommend crop based on soil and weather
//   recommendCrop: async (
//     data: SoilWeatherInput
//   ): Promise<CropRecommendationResponse> => {
//     const response = await apiInstance.post<CropRecommendationResponse>(
//       '/recommend',
//       data
//     );
//     return response.data;
//   },

//   // Recommend fertilizer for existing crop
//   recommendFertilizer: async (
//     data: ExistingCropInput
//   ): Promise<FertilizerRecommendationResponse> => {
//     const response = await apiInstance.post<FertilizerRecommendationResponse>(
//       '/recommend-existing',
//       data
//     );
//     return response.data;
//   },
// };


// services/recommendation.service.ts
import axios from 'axios';
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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

/* ── interceptors ─────────────────────────────────────────────────────── */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err?.response?.data?.detail;
    if (detail) {
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d.msg).join(', ')
        : String(detail);
      return Promise.reject(new Error(msg));
    }
    return Promise.reject(err);
  },
);

/* ── Recommendation ───────────────────────────────────────────────────── */

/**
 * POST /recommendation/predict
 * Single crop recommendation from soil + weather inputs.
 */
export async function predictCrop(input: RecommendInput): Promise<RecommendResponse> {
  const { data } = await api.post<RecommendResponse>('/recommendation/predict', input);
  return data;
}

/**
 * POST /recommendation/predict/batch
 * Up to 50 predictions in one call.
 */
export async function predictCropBatch(
  batch: BatchRecommendInput,
): Promise<BatchRecommendResponse> {
  const { data } = await api.post<BatchRecommendResponse>(
    '/recommendation/predict/batch',
    batch,
  );
  return data;
}

/**
 * GET /recommendation/crops
 * All crop labels the model supports.
 */
export async function fetchSupportedCrops(): Promise<CropsResponse> {
  const { data } = await api.get<CropsResponse>('/recommendation/crops');
  return data;
}

/**
 * GET /recommendation/model/info
 * Accuracy, CV scores, feature list.
 */
export async function fetchModelInfo(): Promise<ModelInfo> {
  const { data } = await api.get<ModelInfo>('/recommendation/model/info');
  return data;
}

/**
 * GET /recommendation/model/features
 * Feature importance ranking.
 */
export async function fetchFeatureImportance(): Promise<FeatureImportanceResponse> {
  const { data } = await api.get<FeatureImportanceResponse>(
    '/recommendation/model/features',
  );
  return data;
}


export async function fetchCropDetails(input: FetchCropDetailsInput): Promise<CropDetails> {
  const { data } = await api.post<CropDetails>(
    "/recommendation/generate",
    input
  );

  return data;
}