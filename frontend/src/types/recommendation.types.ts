// // Soil and Weather Input for Crop Recommendation
// export interface SoilWeatherInput {
//   Nitrogen: number;
//   Phosphorus: number;
//   Potassium: number;
//   Temperature: number;
//   Humidity: number;
//   pH_Value: number;
//   Rainfall: number;
// }

// // Existing Crop Input for Fertilizer Recommendation
// export interface ExistingCropInput {
//   Crop: string;
//   Nitrogen: number;
//   Phosphorus: number;
//   Potassium: number;
//   Temperature: number;
//   Humidity: number;
//   pH_Value: number;
//   Rainfall: number;
// }

// // Responses
// export interface CropRecommendationResponse {
//   recommended_crop: string;
//   message: string;
// }

// export interface FertilizerRecommendationResponse {
//   crop: string;
//   recommended_fertilizer: string;
//   accuracy: string;
//   input_conditions: ExistingCropInput;
// }



// types/recommendation.types.ts

export type SoilType = 'Alluvial' | 'Sandy' | 'Red' | 'Clay' | 'Black' | 'Loamy';
export type CropCategory = 'Fruits' | 'Vegetables' | 'Pulses';
export type Suitability = 'Excellent' | 'Good' | 'Fair' | 'Low';

/* ── Request ────────────────────────────────────────────────────────────── */
export interface RecommendInput {
  nitrogen:         number;   // 0–200 kg/ha
  phosphorus:       number;   // 0–150 kg/ha
  potassium:        number;   // 0–210 kg/ha
  temperature:      number;   // 10–45 °C
  humidity:         number;   // 10–100 %
  rainfall:         number;   // 15–300 mm
  soil_pH:          number;   // 3.0–10.0
  moisture:         number;   // 15–85 %
  field_size_acres: number;   // 0.1–50
  soil_type:        SoilType;
  crop_category:    CropCategory;
  city?:            string;
  top_k?:           number;   // 1–10, default 3
}

/* ── Response ───────────────────────────────────────────────────────────── */
export interface CropResult {
  rank:        number;
  crop:        string;
  confidence:  number;   // 0–100 %
  suitability: Suitability;
}

export interface RecommendResponse {
  recommended_crop:   string;
  confidence:         number;
  top_predictions:    CropResult[];
  input_echo:         Partial<RecommendInput>;
  model_accuracy_pct: number | null;
  message:            string;
}

/* ── Batch ──────────────────────────────────────────────────────────────── */
export interface BatchRecommendInput {
  inputs: RecommendInput[];
}

export interface BatchRecommendResponse {
  total:   number;
  results: RecommendResponse[];
}

/* ── Model info ─────────────────────────────────────────────────────────── */
export interface ModelInfo {
  model:             string;
  n_classes:         number;
  classes:           string[];
  features_num:      string[];
  features_cat:      string[];
  soil_types:        string[];
  crop_categories:   string[];
  test_accuracy:     number;
  cv_mean:           number;
  cv_std:            number;
  test_accuracy_pct: number;
  cv_mean_pct:       number;
  cv_std_pct:        number;
}

/* ── Feature importance ─────────────────────────────────────────────────── */
export interface FeatureImportanceItem {
  feature:        string;
  importance:     number;
  importance_pct: number;
}

export interface FeatureImportanceResponse {
  features: FeatureImportanceItem[];
}

/* ── Supported crops ────────────────────────────────────────────────────── */
export interface CropsResponse {
  n_crops: number;
  crops:   string[];
}