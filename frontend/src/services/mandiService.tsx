import apiInstance from "./apiInstance";
import { LivePrice, CompareParams, MandiPriceParams, PriceComparison, PriceTrend, SearchParams, SearchResult, TrendParams } from "../types/mandi.types";

export const mandiService = {
    // Get live mandi prices
    getLivePrices: async (params: MandiPriceParams = {}): Promise<LivePrice[]> => {
        const response = await apiInstance.get<LivePrice[]>('/mandi/live', {
            params,
        });
        return response.data;
    },

    // Get price trend for a commodity
    getPriceTrend: async (params: TrendParams): Promise<PriceTrend> => {
        const { commodity, state, days = 30 } = params;
        const response = await apiInstance.get<PriceTrend>(
            `/mandi/trend/${commodity}`,
            {
                params: { state, days },
            }
        );
        return response.data;
    },

    // Compare prices across states
    comparePrices: async (params: CompareParams): Promise<PriceComparison> => {
        const { commodity, states } = params;
        const queryParams = new URLSearchParams();
        queryParams.append('commodity', commodity);
        states.forEach((state) => queryParams.append('states', state));

        const response = await apiInstance.get<PriceComparison>(
            `/mandi/compare?${queryParams.toString()}`
        );
        return response.data;
    },

    // Get list of commodities
    getCommodities: async (): Promise<string[]> => {
        const response = await apiInstance.get<{ commodities: string[]; count: number }>(
            '/mandi/commodities'
        );
        return response.data.commodities;
    },

    // Get list of states
    getStates: async (): Promise<string[]> => {
        const response = await apiInstance.get<{ states: string[]; count: number }>(
            '/mandi/states'
        );
        return response.data.states;
    },

    // Search prices
    searchPrices: async (params: SearchParams): Promise<SearchResult> => {
        const response = await apiInstance.get<SearchResult>('/mandi/search', {
            params,
        });
        return response.data;
    },

    // Get nearby prices (if location is available)
    getNearbyPrices: async (
        latitude: number,
        longitude: number,
        radius: number = 50,
        commodity?: string
    ) => {
        const response = await apiInstance.get('/mandi/nearby', {
            params: { latitude, longitude, radius_km: radius, commodity },
        });
        return response.data;
    },

    // Get price history from database
    getPriceHistory: async (
        commodity: string,
        state?: string,
        days: number = 30
    ) => {
        const response = await apiInstance.get('/mandi/history', {
            params: { commodity, state, days },
        });
        return response.data;
    },
};