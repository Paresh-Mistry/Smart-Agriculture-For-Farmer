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




export interface FertEntry {
  timing: string;
  product: string;
  dose: string;
  color: string;
}

export interface GrowthPhase {
  label: string;
  days: string;
  color: string;
  tip: string;
}

export interface PestEntry {
  name: string;
  severity: 'high' | 'medium' | 'low';
  fix: string;
}

export interface CropDetails {
  rowSpacing: string;
  plantSpacing: string;
  waterPerWeek: string;
  totalWater: string;
  seedRate: string;
  harvestDays: string;
  yieldPerAcre: string;
  npk: string;
  phRange: string;
  marketPrice: string;
  storageLife: string;
  criticalStages: string[];
  fertSchedule: FertEntry[];
  growthPhases: GrowthPhase[];
  topPests: PestEntry[];
  smartTips: string[];
}

export interface FetchCropDetailsInput {
  crop: string;
  soilType: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  fieldSizeAcres: number;
  // cropCategory: string;
  fieldUnit: string;
  experience: string;
  city? : string;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  soilPH?: number;
}



export interface WeedCluster {
  id: number; x: number; y: number;
  width: number; height: number;
  area_px: number; area_pct: number;
}

export interface OpenCVStats {
  weed_coverage_pct: number;
  green_coverage_pct: number;
  bare_soil_pct: number;
  weed_cluster_count: number;
  clusters: WeedCluster[];
  image_width: number;
  image_height: number;
}

export interface WeedIdentification {
  name: string;
  confidence: 'high' | 'medium' | 'low';
  description: string;
  threat_level: 'critical' | 'high' | 'moderate' | 'low';
}

export interface TreatmentOption {
  type: 'chemical' | 'organic' | 'mechanical';
  product: string;
  dose: string;
  timing: string;
  notes: string;
}

export interface WeedAnalysisResult {
  opencv_stats: OpenCVStats;
  annotated_image_b64: string;
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'none';
  overall_summary: string;
  weeds_identified: WeedIdentification[];
  treatments: TreatmentOption[];
  best_treatment_time: string;
  reinspection_days: number;
  yield_loss_risk_pct: string;
  urgency_note: string;
  smart_tips: string[];
}