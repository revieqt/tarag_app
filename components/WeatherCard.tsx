// import React, { useState, useEffect, useRef } from 'react';
// import { View, StyleSheet, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import { ThemedIcons } from '@/components/ThemedIcons';
// import { useLocation } from '@/hooks/useLocation';
// import { useWeather, useOtherLocationWeather } from '@/context/WeatherContext';
// import LoadingContainerAnimation from './LoadingContainerAnimation';
// import { useThemeColor } from '@/hooks/useThemeColor';

// interface WeatherCardProps {
//   latitude?: number;
//   longitude?: number;
//   date?: string;
//   locationName?: string;
// }

// interface LocationData {
//   suburb?: string;
//   city?: string;
//   state?: string;
//   country?: string;
// }

// export default function WeatherCard({ latitude, longitude, date, locationName }: WeatherCardProps) {
//   const currentLocation = useLocation();
//   const lname = locationName || (currentLocation && (
//     currentLocation.suburb + ', ' +
//     currentLocation.city
//   ));
  
//   // Use current location weather if no props passed
//   const currentWeather = useWeather();
  
//   // Use other location weather if props passed
//   const otherLocationWeather = useOtherLocationWeather();
  
//   // Determine which weather data to use
//   const hasLocationProps = latitude !== undefined && longitude !== undefined;
  
//   // Set state based on whether we're fetching current or other location
//   const weather = hasLocationProps ? otherLocationWeather.weather : currentWeather.weather;
//   const loading = hasLocationProps ? otherLocationWeather.loading : currentWeather.loading;
//   const error = hasLocationProps ? otherLocationWeather.error : currentWeather.error;

//   // Debug logging
//   console.log('WeatherCard Debug:', {
//     hasLocationProps,
//     weather,
//     loading,
//     error,
//     currentLocation,
//     currentWeather: currentWeather.weather,
//     currentWeatherError: currentWeather.error,
//     otherLocationWeather: otherLocationWeather.weather,
//   });

//   // Fetch other location weather if props are provided
//   useEffect(() => {
//     if (hasLocationProps && latitude !== undefined && longitude !== undefined) {
//       console.log('Fetching weather for:', { latitude, longitude, date });
//       otherLocationWeather.fetchWeather(latitude, longitude, date);
//     }
//   }, [latitude, longitude, date]);

//   if (loading) {
//     return (
//       <ThemedView shadow color='primary' style={[styles.locationContent, { height: 193 }]}>
//         <View style={styles.descLoading}><LoadingContainerAnimation /></View>
//         <View style={styles.locationLoading}><LoadingContainerAnimation /></View>
//         <View style={styles.weatherTypeLoading}><LoadingContainerAnimation /></View>
        
//         <View style={styles.weatherDetailsContainer}>
//           <View style={styles.weather}>
//             <View style={styles.weatherIconLoading}><LoadingContainerAnimation /></View>
//             <View style={styles.weatherValueLoading}><LoadingContainerAnimation /></View>
//             <View style={styles.weatherLabelLoading}><LoadingContainerAnimation /></View>
//           </View>
//           <View style={styles.weather}>
//             <View style={styles.weatherIconLoading}><LoadingContainerAnimation /></View>
//             <View style={styles.weatherValueLoading}><LoadingContainerAnimation /></View>
//             <View style={styles.weatherLabelLoading}><LoadingContainerAnimation /></View>
//           </View>
//           <View style={styles.weather}>
//             <View style={styles.weatherIconLoading}><LoadingContainerAnimation /></View>
//             <View style={styles.weatherValueLoading}><LoadingContainerAnimation /></View>
//             <View style={styles.weatherLabelLoading}><LoadingContainerAnimation /></View>
//           </View>
//           <View style={styles.weather}>
//             <View style={styles.weatherIconLoading}><LoadingContainerAnimation /></View>
//             <View style={styles.weatherValueLoading}><LoadingContainerAnimation /></View>
//             <View style={styles.weatherLabelLoading}><LoadingContainerAnimation /></View>
//           </View>
//         </View>
//       </ThemedView>
//     );
//   }

//   return (
//     <ThemedView shadow color='primary' style={styles.locationContent}>
//       <View>
        
//         <ThemedText style={{ opacity: 0.5, fontSize: 12 }}>
//           {hasLocationProps ? "Weather for" : "You're currently at"}
//         </ThemedText>
//         <ThemedText type='subtitle' style={{fontSize: 16}}>
//           {lname || (hasLocationProps ? 'Unknown Location' : 'Your Location')}
//         </ThemedText>
        
//         <ThemedText style={{ opacity: 0.5, fontSize: 12 }}>
//           {weather?.weatherType || 'No data'}
//         </ThemedText>
        
//         <View style={styles.weatherDetailsContainer}>
//           <View style={styles.weather}>
//             <ThemedIcons name='thermometer' size={20} color='#B36B6B'/>
//             <ThemedText style={{marginTop: 5}}>
//               {weather && weather.temperature !== null ? `${Math.round(weather.temperature)}°C` : 'N/A'}
//             </ThemedText>
//             <ThemedText style={styles.weatherLabel}>Heat</ThemedText>
//           </View>
//           <View style={styles.weather}>
//             <ThemedIcons name='cloud' size={20} color='#5A7D9A'/>
//             <ThemedText style={{marginTop: 5}}>
//               {weather && weather.precipitation !== null ? `${weather.precipitation}mm` : 'N/A'}
//             </ThemedText>
//             <ThemedText style={styles.weatherLabel}>Rainfall</ThemedText>
//           </View>
//           <View style={styles.weather}>
//             <ThemedIcons name='water' size={20} color='#5A7D9A'/>
//             <ThemedText style={{marginTop: 5}}>
//               {weather && weather.humidity !== null ? `${weather.humidity}%` : 'N/A'}
//             </ThemedText>
//             <ThemedText style={styles.weatherLabel}>Humidity</ThemedText>
//           </View>
//           <View style={styles.weather}>
//             <ThemedIcons name='fan' size={20} color='#5A7D9A'/>
//             <ThemedText style={{marginTop: 5}}>
//               {weather && weather.windSpeed !== null ? `${Math.round(weather.windSpeed)}km/h` : 'N/A'}
//             </ThemedText>
//             <ThemedText style={styles.weatherLabel}>Wind</ThemedText>
//           </View>
//         </View>
        
//         {!weather && error && (
//           <ThemedText style={{ opacity: 0.5, marginTop: 10, textAlign: 'center', fontSize: 12 }}>
//             {error}
//           </ThemedText>
//         )}
//       </View>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   locationContent: {
//     width: '100%',
//     padding: 14,
//     borderRadius: 10,
//     overflow: 'hidden',
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#ccc3',
//   },
//   weatherDetailsContainer: {
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     flexDirection: 'row',
//     gap: 7,
//     marginTop: 35,
//   },
//   weather: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '23%',
//   },
//   weatherLabel: {
//     fontSize: 9,
//     opacity: 0.5,
//   },
//   weatherImage: {
//     position: 'absolute',
//     top: '3%',
//     right: '-17%',
//     width: '45%',
//     height: '45%',
//     zIndex: 1000,
//   },
//   weatherValueLoading: {
//     width: 50,
//     height: 15,
//     borderRadius: 100,
//     marginVertical: 5,
//     overflow: 'hidden',
//   },
//   weatherLabelLoading: {
//     width: 50,
//     height: 10,
//     borderRadius: 100,
//     marginVertical: 1,
//     overflow: 'hidden',
//   },
//   weatherIconLoading: {
//     width: 30,
//     height: 20,
//     borderRadius: 100,
//     marginVertical: 1,
//     overflow: 'hidden',
//   },
//   weatherTypeLoading: {
//     width: 70,
//     height: 15,
//     borderRadius: 100,
//     marginVertical: 5,
//     overflow: 'hidden',
//   },
//   descLoading: {
//     width: 70,
//     height: 15,
//     borderRadius: 100,
//     marginBottom: 5,
//     overflow: 'hidden',
//   },
//   locationLoading: {
//     width: 200,
//     height: 20,
//     marginVertical:3,
//     borderRadius: 100,
//     overflow: 'hidden',
//   },
// });