import apiInstance from "./apiInstance";
import { WeatherData } from "../types/weather.types";

export const weatherService = {

  // Get current weather using latitude & longitude
  getCurrentWeatherByCoords: async (
    lat: number,
    lon: number
  ): Promise<WeatherData> => {
    const response = await apiInstance.get<WeatherData>(
      "/current",
      {
        params: { lat, lon },
      }
    );

    return response.data;
  },

  // Check if location is valid / serviceable
  checkLocation: async (
    lat: number,
    lon: number
  ): Promise<{ valid: boolean; message?: string }> => {
    const response = await apiInstance.get<{ valid: boolean; message?: string }>(
      "/api/weather/check-location",
      {
        params: { lat, lon },
      }
    );

    return response.data;
  },
};
