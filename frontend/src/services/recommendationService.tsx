import apiInstance from './apiInstance';
import {
  SoilWeatherInput,
  ExistingCropInput,
  CropRecommendationResponse,
  FertilizerRecommendationResponse,
} from '@component/types/recommendation.types';

export const recommendationApi = {
  // Recommend crop based on soil and weather
  recommendCrop: async (
    data: SoilWeatherInput
  ): Promise<CropRecommendationResponse> => {
    const response = await apiInstance.post<CropRecommendationResponse>(
      '/recommend',
      data
    );
    return response.data;
  },

  // Recommend fertilizer for existing crop
  recommendFertilizer: async (
    data: ExistingCropInput
  ): Promise<FertilizerRecommendationResponse> => {
    const response = await apiInstance.post<FertilizerRecommendationResponse>(
      '/recommend-existing',
      data
    );
    return response.data;
  },
};