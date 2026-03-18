'use client';

import { useMutation } from '@tanstack/react-query';
import { recommendationApi } from '@component/services/recommendationService';
import {
  SoilWeatherInput,
  ExistingCropInput,
} from '@component/types/recommendation.types';
import { toast } from 'sonner';

export const useRecommendCrop = () => {
  return useMutation({
    mutationFn: (data: SoilWeatherInput) =>
      recommendationApi.recommendCrop(data),
    onSuccess: (data) => {
      toast.success(`Recommended Crop: ${data.recommended_crop}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to get recommendation');
    },
  });
};

export const useRecommendFertilizer = () => {
  return useMutation({
    mutationFn: (data: ExistingCropInput) =>
      recommendationApi.recommendFertilizer(data),
    onSuccess: (data) => {
      toast.success(`Recommended Fertilizer: ${data.recommended_fertilizer}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to get recommendation');
    },
  });
};