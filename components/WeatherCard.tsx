import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedIcons } from '@/components/ThemedIcons';
import { useLocation } from '@/hooks/useLocation';
import LoadingContainerAnimation from './LoadingContainerAnimation';
import { BACKEND_URL } from '@/constants/Config';

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

// Session-based cache for current location weather
let currentLocationWeatherCache: { data: WeatherData | null; timestamp: number } | null = null;

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
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);
  
  // State for props-based weather
  const [propsWeather, setPropsWeather] = useState<WeatherData | null>(null);
  const [propsLoading, setPropsLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Determine if we have location props
  const hasLocationProps = latitude !== undefined && longitude !== undefined && city !== undefined;

  // Fetch weather from backend
  const fetchWeather = async (
    fetchLatitude: number,
    fetchLongitude: number,
    fetchCity: string,
    isCurrentLocation: boolean
  ) => {
    try {
      if (isCurrentLocation) {
        setCurrentLocationLoading(true);
      } else {
        setPropsLoading(true);
      }
      setError(null);

      const queryParams = new URLSearchParams({
        city: fetchCity,
        latitude: fetchLatitude.toString(),
        longitude: fetchLongitude.toString(),
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
      // Unwrap data if it's nested in a 'data' property
      const weatherData: WeatherData = responseData.data || responseData;

      if (isCurrentLocation) {
        setCurrentWeather(weatherData);
        // Update cache with timestamp
        currentLocationWeatherCache = {
          data: weatherData,
          timestamp: Date.now(),
        };
      } else {
        setPropsWeather(weatherData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather';
      setError(errorMessage);
    } finally {
      if (isCurrentLocation) {
        setCurrentLocationLoading(false);
      } else {
        setPropsLoading(false);
      }
    }
  };

  // Effect: Fetch current location weather (with cache)
  useEffect(() => {
    
    // Allow fetching if we have coordinates, city is optional
    if (!locationData.loading && locationData.latitude !== undefined && locationData.longitude !== undefined) {
      // Check if we have cached data for current location
      if (currentLocationWeatherCache?.data) {
        setCurrentWeather(currentLocationWeatherCache.data);
      } else {
        // Fetch if not cached
        fetchWeather(
          locationData.latitude,
          locationData.longitude,
          locationData.city || 'Unknown',
          true
        );
      }
    }
  }, [locationData.city, locationData.latitude, locationData.longitude, locationData.loading]);

  // Effect: Fetch props-based weather (separate from cache)
  useEffect(() => {
    if (hasLocationProps) {
      fetchWeather(latitude, longitude, city, false);
    }
  }, [latitude, longitude, city, hasLocationProps]);

  // Show loading state if still fetching
  const isLoading = currentLocationLoading || propsLoading;
  // Show loading only if we need location data and it's still loading
  const showLoading = isLoading || (locationData.loading && !hasLocationProps && !currentWeather);

  if (showLoading) {
    return (
      <ThemedView shadow color='primary' style={[styles.locationContent, { height: 193 }]}>
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

  // Determine which weather data to display
  const displayWeather = hasLocationProps ? propsWeather : currentWeather;
  // For current location, try to get the best location name from useLocation
  let displayCity = '';
  if (hasLocationProps) {
    displayCity = city || 'Unknown Location';
  } else {
    // Try all available fields to find a location name
    displayCity = locationData.city || locationData.suburb || locationData.region || locationData.state || '';
    
  }

  return (
    <ThemedView shadow color='primary' style={styles.locationContent}>
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
            <ThemedText style={styles.weatherLabel}>Rainfall</ThemedText>
          </View>
          <View style={styles.weather}>
            <ThemedIcons name='water' size={20} color='#5A7D9A' />
            <ThemedText style={{ marginTop: 5 }}>
              {displayWeather?.humidity !== null && displayWeather?.humidity !== undefined
                ? `${displayWeather.humidity.toFixed(0)}%`
                : 'N/A'}
            </ThemedText>
            <ThemedText style={styles.weatherLabel}>Humidity</ThemedText>
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
            {error}
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
    borderColor: '#ccc3',
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