import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface FarmerDashboard {
  summary: {
    total_crops: number;
    active_listings: number;
    sold_crops: number;
    total_revenue: number;
    avg_price_per_kg: number;
    total_views: number;
    conversion_rate: number;
  };
  revenue: {
    total: number;
    last_7_days: number;
    last_30_days: number;
    growth_rate: number;
  };
  category_distribution: Record<string, number>;
  top_performers: {
    most_viewed: {
      crop_name: string;
      views: number;
      category: string;
    } | null;
    best_category: string | null;
  };
  alerts: {
    expiring_soon: Array<{
      id: string;
      crop_name: string;
      expiry_date: string;
      days_left: number;
    }>;
    low_performing: Array<{
      id: string;
      crop_name: string;
      views: number;
      days_listed: number;
    }>;
  };
  ai_insights: string;
  ai_status: {
    service: string;
    model: string;
    available: boolean;
  };
}

export interface BuyerDashboard {
  summary: {
    total_orders: number;
    total_spent: number;
    avg_order_value: number;
    active_searches: number;
  };
  preferences: {
    favorite_categories: string[];
    recent_views: Array<{
      id: string;
      crop_name: string;
      category: string;
      price_per_kg: number;
    }>;
  };
  deals: {
    active_deals: Array<{
      id: string;
      crop_name: string;
      original_price: number;
      discount_percent: number;
      final_price: number;
      savings: number;
    }>;
  };
  seasonal: {
    current_season_crops: Array<{
      id: string;
      crop_name: string;
      price_per_kg: number;
      location: string;
    }>;
  };
  price_insights: Record<string, {
    average: number;
    lowest: number;
    highest: number;
  }>;
  ai_recommendations: string;
  ai_status: {
    service: string;
    model: string;
    available: boolean;
  };
}

export const analyticsApi = {
  getFarmerDashboard: async (): Promise<FarmerDashboard> => {
    const response = await apiClient.get('/farmer/dashboard');
    return response.data;
  },

  getBuyerDashboard: async (): Promise<BuyerDashboard> => {
    const response = await apiClient.get('/buyer/dashboard');
    return response.data;
  },

  getAIStatus: async () => {
    const response = await apiClient.get('/ai/status');
    return response.data;
  },

  getMarketTrends: async () => {
    const response = await apiClient.get('/market/trends');
    return response.data;
  },
};