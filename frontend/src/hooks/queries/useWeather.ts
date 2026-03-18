import { useQuery } from "@tanstack/react-query";
import { weatherService } from "@component/services/weatherService";

const weatherKeys = {
  all: ["weather"] as const,
  current: (lat: number, lon: number) =>
    [...weatherKeys.all, "current", lat, lon] as const,
};

export const useCurrentWeather = (
    lat?: number,
    lon?: number,
    options: { enabled?: boolean } = {},
) => {
    const { enabled = true } = options;

    return useQuery({
        queryKey: weatherKeys.current(lat!, lon!),
        queryFn: () =>
            weatherService.getCurrentWeatherByCoords(lat!, lon!),
        enabled: enabled && !!lat && !!lon,
    });
};