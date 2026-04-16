import {
  Crop,
  CreateCropPayload,
  UpdateCropPayload,
  PaginationParams,
  CropCountParams,
  CropCountResponse,
  FertilizerResponse,
  ExistingCropInput,
  ExistingCropFertilizerResponse,
  SoilWeatherInput
} from "../types/crop.types";
import apiInstance from "./apiInstance";

export const cropService = {

  getAllCrops: async (params: PaginationParams = {}): Promise<Crop[]> => {
    const { skip = 0, limit = 100 } = params;
    const response = await apiInstance.get<Crop[]>("/get_crops", {
      params: { skip, limit },
    });
    return response.data;
  },


  getCropsByCategory: async (
    category: string,
    params: PaginationParams = {},
  ): Promise<Crop[]> => {
    const { skip = 0, limit = 100 } = params;
    const response = await apiInstance.get<Crop[]>(
      `/get_category/${category}`,
      {
        params: { skip, limit },
      },
    );
    return response.data;
  },

  getMyCrops: async (
    params: PaginationParams = {},
    token: string
  ): Promise<Crop[]> => {
    const { skip = 0, limit = 100 } = params;

    const response = await apiInstance.get<Crop[]>("/my_crops", {
      params: { skip, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  getCropById: async (id: string): Promise<Crop> => {
    const response = await apiInstance.get<Crop>(`/get_crops/${id}`);
    return response.data;
  },

  // getCropCount: async (
  //   params = {},
  // ) => {
  //   const { category, status } = params;

  //   const response = await apiInstance.get<CropCountResponse>(
  //     "/get_crops_count",
  //     {
  //       params: {
  //         category,
  //         status,
  //       },
  //     },
  //   );

  //   return response.data;
  // },



  // Create crop
  createCrop: async (cropData: CreateCropPayload): Promise<Crop> => {
    const response = await apiInstance.post<Crop>("/crops", cropData);
    return response.data;
  },

  // Update crop
  updateCrop: async (
    id: string,
    cropData: UpdateCropPayload,
  ): Promise<Crop> => {
    const response = await apiInstance.put<Crop>(`/crops/${id}`, cropData);
    return response.data;
  },

  // Delete crop
  deleteCrop: async (id: string): Promise<void> => {
    await apiInstance.delete(`/crops/${id}`);
  },


};
