// Soil and Weather Input for Crop Recommendation
export interface SoilWeatherInput {
  Nitrogen: number;
  Phosphorus: number;
  Potassium: number;
  Temperature: number;
  Humidity: number;
  pH_Value: number;
  Rainfall: number;
}

// Existing Crop Input for Fertilizer Recommendation
export interface ExistingCropInput {
  Crop: string;
  Nitrogen: number;
  Phosphorus: number;
  Potassium: number;
  Temperature: number;
  Humidity: number;
  pH_Value: number;
  Rainfall: number;
}

// Responses
export interface CropRecommendationResponse {
  recommended_crop: string;
  message: string;
}

export interface FertilizerRecommendationResponse {
  crop: string;
  recommended_fertilizer: string;
  accuracy: string;
  input_conditions: ExistingCropInput;
}