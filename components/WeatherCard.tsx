import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedIcons } from '@/components/ThemedIcons';
import { useLocation } from '@/hooks/useLocation';
import LoadingContainerAnimation from './LoadingContainerAnimation';
import { BACKEND_URL } from '@/constants/Config';
import { useQuery } from '@tanstack/react-query';

interface WeatherCardProps {
  city?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
}

interface WeatherData {
  temperature: number | null;
  precipitation: number | null;
  humidity: number | null;
  windSpeed: number | null;
  weatherType: string;
  weatherCode: number;
}

// Calculate milliseconds until midnight
const getTimeUntilMidnight = (): number => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.max(tomorrow.getTime() - now.getTime(), 0);
};

// Fetch weather from backend
const fetchWeather = async (
  latitude: number,
  longitude: number,
  city: string
): Promise<WeatherData> => {
  const queryParams = new URLSearchParams({
    city,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });

  const response = await fetch(`${BACKEND_URL}/api/weather?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const responseData = await response.json();
  return responseData.data || responseData;
};

// Query hook for weather data
const useWeather = (
  latitude: number | undefined,
  longitude: number | undefined,
  city: string
) => {
  return useQuery<WeatherData>({
    queryKey: ['weather', latitude, longitude],
    queryFn: () => fetchWeather(latitude!, longitude!, city),
    enabled: latitude !== undefined && longitude !== undefined,
    staleTime: getTimeUntilMidnight(),
    refetchInterval: getTimeUntilMidnight(),
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });
};

const getWeatherImage = (weatherCode: number): any => {
  if (weatherCode === 0) {
    return require('@/assets/images/weather-sunny-min.png');
  } else if (weatherCode === 1 || weatherCode === 2) {
    return require('@/assets/images/weather-cloudy-min.png');
  } else if (weatherCode === 3 || weatherCode === 45 || weatherCode === 48) {
    return require('@/assets/images/weather-cloudy-min.png');
  } else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return require('@/assets/images/weather-rainy-min.png');
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    return require('@/assets/images/weather-rainy-min.png');
  } else if (weatherCode >= 85 && weatherCode <= 86) {
    return require('@/assets/images/weather-rainy-min.png');
  } else if (weatherCode >= 95 && weatherCode <= 99) {
    return require('@/assets/images/weather-rainy-min.png');
  }
  return require('@/assets/images/weather-sunny-min.png');
};

export default function WeatherCard({ latitude, longitude, date, city }: WeatherCardProps) {
  const locationData = useLocation();

  // Determine if we have location props
  const hasLocationProps = latitude !== undefined && longitude !== undefined && city !== undefined;

  // Query current location weather
  const currentLocationQuery = useWeather(
    locationData.latitude,
    locationData.longitude,
    locationData.city || locationData.suburb || locationData.region || locationData.state || 'Unknown'
  );

  // Query props-based weather
  const propsQuery = useWeather(latitude, longitude, city || '');

  // Determine which query to use
  const activeQuery = hasLocationProps ? propsQuery : currentLocationQuery;
  const { data: displayWeather, isLoading, error } = activeQuery;

  // Determine display city
  let displayCity = '';
  if (hasLocationProps) {
    displayCity = city || 'Unknown Location';
  } else {
    displayCity = locationData.city || locationData.suburb || locationData.region || locationData.state || 'Minglanilla';
  }

  const showLoading = isLoading || (locationData.loading && !hasLocationProps && !displayWeather);

  if (showLoading) {
    return (
      <ThemedView color='primary' style={[styles.locationContent, { height: 193 }]}>
        <View style={styles.descLoading}><LoadingContainerAnimation /></View>
        <View style={styles.locationLoading}><LoadingContainerAnimation /></View>
        <View style={styles.weatherTypeLoading}><LoadingContainerAnimation /></View>
        
        <View style={styles.weatherDetailsContainer}>
          <View style={styles.weather}>
            <View style={styles.weatherIconLoading}><LoadingContainerAnimation /></View>
            <View style={styles.weatherValueLoading}><LoadingContainerAnimation /></View>
            <View style={styles.weatherLabelLoading}><LoadingContainerAnimation /></View>
          </View>
          <View style={styles.weather}>
            <View style={styles.weatherIconLoading}><LoadingContainerAnimation /></View>
            <View style={styles.weatherValueLoading}><LoadingContainerAnimation /></View>
            <View style={styles.weatherLabelLoading}><LoadingContainerAnimation /></View>
          </View>
          <View style={styles.weather}>
            <View style={styles.weatherIconLoading}><LoadingContainerAnimation /></View>
            <View style={styles.weatherValueLoading}><LoadingContainerAnimation /></View>
            <View style={styles.weatherLabelLoading}><LoadingContainerAnimation /></View>
          </View>
          <View style={styles.weather}>
            <View style={styles.weatherIconLoading}><LoadingContainerAnimation /></View>
            <View style={styles.weatherValueLoading}><LoadingContainerAnimation /></View>
            <View style={styles.weatherLabelLoading}><LoadingContainerAnimation /></View>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView color='primary' style={styles.locationContent}>
      <View>
        <ThemedText style={{ opacity: 0.5, fontSize: 12 }}>
          {hasLocationProps ? 'Weather for' : "You're currently at"}
        </ThemedText>
        <ThemedText type='subtitle' style={{ fontSize: 16 }}>
          {displayCity || 'Minglanilla'}
        </ThemedText>
        
        <ThemedText style={{ opacity: 0.5, fontSize: 12 }}>
          {displayWeather?.weatherType || 'No data'}
        </ThemedText>

        {displayWeather && (
          <Image
            source={getWeatherImage(displayWeather.weatherCode)}
            style={styles.weatherImage}
            resizeMode="contain"
          />
        )}
        
        <View style={styles.weatherDetailsContainer}>
          <View style={styles.weather}>
            <ThemedIcons name='thermometer' size={20} color='#B36B6B' />
            <ThemedText style={{ marginTop: 5 }}>
              {displayWeather?.temperature !== null && displayWeather?.temperature !== undefined
                ? `${Math.round(displayWeather.temperature)}°C`
                : 'N/A'}
            </ThemedText>
            <ThemedText style={styles.weatherLabel}>Heat</ThemedText>
          </View>
          <View style={styles.weather}>
            <ThemedIcons name='cloud' size={20} color='#5A7D9A' />
            <ThemedText style={{ marginTop: 5 }}>
              {displayWeather?.precipitation !== null && displayWeather?.precipitation !== undefined
                ? `${displayWeather.precipitation}mm`
                : 'N/A'}
            </ThemedText>
            <ThemedText style={styles.weatherLabel}>Rain</ThemedText>
          </View>
          <View style={styles.weather}>
            <ThemedIcons name='water' size={20} color='#5A7D9A' />
            <ThemedText style={{ marginTop: 5 }}>
              {displayWeather?.humidity !== null && displayWeather?.humidity !== undefined
                ? `${displayWeather.humidity.toFixed(0)}%`
                : 'N/A'}
            </ThemedText>
            <ThemedText style={styles.weatherLabel}>Humid</ThemedText>
          </View>
          <View style={styles.weather}>
            <ThemedIcons name='fan' size={20} color='#5A7D9A' />
            <ThemedText style={{ marginTop: 5 }}>
              {displayWeather?.windSpeed !== null && displayWeather?.windSpeed !== undefined
                ? `${Math.round(displayWeather.windSpeed)}km/h`
                : 'N/A'}
            </ThemedText>
            <ThemedText style={styles.weatherLabel}>Wind</ThemedText>
          </View>
        </View>

        {error && (
          <ThemedText style={{ opacity: 0.5, marginTop: 10, textAlign: 'center', fontSize: 12, color: '#ff6b6b' }}>
            {error instanceof Error ? error.message : 'Failed to load weather data'}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  locationContent: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  weatherDetailsContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 35,
  },
  weather: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '23%',
  },
  weatherLabel: {
    fontSize: 9,
    opacity: 0.5,
  },
  weatherImage: {
    position: 'absolute',
    top: '-15%',
    right: '-30%',
    width: '75%',
    height: '75%',
    zIndex: 1000,
  },
  weatherValueLoading: {
    width: 50,
    height: 15,
    borderRadius: 100,
    marginVertical: 5,
    overflow: 'hidden',
  },
  weatherLabelLoading: {
    width: 50,
    height: 10,
    borderRadius: 100,
    marginVertical: 1,
    overflow: 'hidden',
  },
  weatherIconLoading: {
    width: 30,
    height: 20,
    borderRadius: 100,
    marginVertical: 1,
    overflow: 'hidden',
  },
  weatherTypeLoading: {
    width: 70,
    height: 15,
    borderRadius: 100,
    marginVertical: 5,
    overflow: 'hidden',
  },
  descLoading: {
    width: 70,
    height: 15,
    borderRadius: 100,
    marginBottom: 5,
    overflow: 'hidden',
  },
  locationLoading: {
    width: 200,
    height: 20,
    marginVertical:3,
    borderRadius: 100,
    overflow: 'hidden',
  },
});