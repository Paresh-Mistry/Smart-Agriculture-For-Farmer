export enum CropCategory {
  GRAINS = "Grains",
  FRUITS = "Fruits",
  VEGETABLES = "Vegetables",
  LEGUMES = "Legumes",
  SPICES = "Spices",
  OILSEEDS = "Oilseeds",
  OTHER = "Other",
}


export enum CropStatus {
  AVAILABLE = "AVAILABLE",
  SOLD = "SOLD",
  PENDING = "PENDING",
  RESERVED = "RESERVED",
}

export interface Crop {
  id: string;
  crop_name: string;
  description: string | null;
  quantity_kg: number | null;
  price_per_kg: number | null;
  discount_percent: number;
  harvest_date: string;
  expiry_date: string | null;
  category: CropCategory;
  status: CropStatus;
  location: string;
  image_url: string | null;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface CreateCropPayload {
  crop_name: string;
  description?: string;
  quantity_kg: number;
  price_per_kg: number;
  discount_percent?: number;
  harvest_date: string;
  expiry_date?: string;
  category: CropCategory;
  status?: CropStatus;
  location: string;
  image_url?: string;
}

export interface UpdateCropPayload extends Partial<CreateCropPayload> {}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}


export interface SoilWeatherInput {
  Nitrogen: number
  Phosphorus: number
  Potassium: number
  Temperature: number
  Humidity: number
  pH_Value: number
  Rainfall: number
}

export interface ExistingCropInput extends SoilWeatherInput {
  Crop: string
}

export interface FertilizerResponse {
  recommended_fertilizer: string
}

export interface ExistingCropFertilizerResponse {
  crop: string
  recommended_fertilizer: string
}
