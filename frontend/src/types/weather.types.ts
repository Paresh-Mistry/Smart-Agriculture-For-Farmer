export interface WeatherData {
  location: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;

  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
  pressure: number;
  visibility: number;
  clouds: number;
  uv_index: number;

  condition: string;
  icon: string;
  timestamp: string;
}
