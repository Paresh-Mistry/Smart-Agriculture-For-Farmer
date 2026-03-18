export interface LivePrice {
  commodity: string;
  state: string;
  district: string;
  market: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  date: string;
  trend?: string;
}

export interface PriceTrend {
  commodity: string;
  dates: string[];
  prices: number[];
  average_price: number;
  min_price: number;
  max_price: number;
  trend: string;
  data_points?: number;
}

export interface PriceComparison {
  commodity: string;
  comparison: Array<{
    state: string;
    district: string;
    market: string;
    modal_price: number;
    min_price: number;
    max_price: number;
    date: string;
  }>;
  average_price: number;
  cheapest_market: {
    state: string;
    market: string;
    price: number;
  };
  expensive_market: {
    state: string;
    market: string;
    price: number;
  };
  price_difference: number;
}

export interface SearchResult {
  query: string;
  results: LivePrice[];
  count: number;
}

export interface MandiPriceParams {
  commodity?: string;
  state?: string;
  district?: string;
  limit?: number;
}

export interface TrendParams {
  commodity: string;
  state?: string;
  days?: number;
}

export interface CompareParams {
  commodity: string;
  states: string[];
}

export interface SearchParams {
  query: string;
  limit?: number;
}