import LocationAutocomplete, { LocationItem } from '@/components/LocationAutocomplete';
import { useRef } from 'react';
import MapView from 'react-native-maps';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedIcons } from '@/components/ThemedIcons';
import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert} from 'react-native';
import { useLocation } from '@/hooks/useLocation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRoute } from '@/context/RouteContext';
import { useSession } from '@/context/SessionContext';
import { getRoutes } from '@/services/routeService';
import BackButton from '@/components/BackButton';
import { router, useLocalSearchParams } from 'expo-router';
import { Polyline } from 'react-native-maps';
import PointMarker from '@/components/maps/PointMarker';

const MODES = [
  { label: 'Car', value: 'driving-car', icon: 'car'},
  { label: 'Bicycle', value: 'cycling-regular', icon: 'bike'},
  { label: 'Walking', value: 'foot-walking', icon: 'walk'},
  { label: 'Hiking', value: 'foot-hiking', icon: 'hiking'},
];

export default function CreateRouteScreen() {
  const { latitude: paramLatitude, longitude: paramLongitude, locationName: paramLocationName } = useLocalSearchParams<{ 
    latitude?: string;
    longitude?: string;
    locationName?: string;
  }>();
  
  const [endLocation, setEndLocation] = useState<LocationItem | null>(null);
  const [waypoints, setWaypoints] = useState<LocationItem[]>([]);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchedLocations, setSearchedLocations] = useState<LocationItem[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<{latitude: number, longitude: number}[]>([]);
  const [animatedCoordinates, setAnimatedCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [skipForm, setSkipForm] = useState(false);

  // Initialize end location if parameters provided
//   useEffect(() => {
//     if (paramLatitude && paramLongitude && paramLocationName) {
//       const location: LocationItem = {
//         locationName: paramLocationName,
//         latitude: parseFloat(paramLatitude),
//         longitude: parseFloat(paramLongitude),
//         note: ''
//       };
//       setEndLocation(location);
//       setSearchedLocations([location]);
//       setSkipForm(true);
//       console.log('Route parameters provided, skipping form:', location);
//     }
//   }, [paramLatitude, paramLongitude, paramLocationName]);

  // Auto-fit map when searched locations change (but not during route generation)
//   useEffect(() => {
//     if (searchedLocations.length > 0 && !isGenerating) {
//       console.log('Fitting map to', searchedLocations.length, 'searched locations');
//       setTimeout(() => fitMapToLocations(), 300);
//     }
//   }, [searchedLocations, isGenerating]);

  const secondaryColor = useThemeColor({}, 'secondary');
  const backgroundColor = useThemeColor({}, 'background');
  const { setActiveRoute } = useRoute();
  const { session } = useSession();

  const { loading, suburb , city, latitude, longitude } = useLocation();

  const mapRef = useRef<MapView>(null);

  // Function to fit map to show all locations including route coordinates
  const fitMapToLocations = () => {
    if (!mapRef.current || !latitude || !longitude) {
      console.log('Cannot fit map: missing mapRef or location');
      return;
    }
    
    let allLocations = [
      { latitude: latitude as number, longitude: longitude as number },
      ...searchedLocations.filter(loc => loc.latitude && loc.longitude).map(loc => ({
        latitude: loc.latitude!,
        longitude: loc.longitude!
      }))
    ];
    
    // Don't include route coordinates in fitting to prevent zoom out
    // Only fit to user location and searched locations (waypoints)
    
    console.log('Fitting map to', allLocations.length, 'locations');
    
    if (allLocations.length > 1) {
      mapRef.current.fitToCoordinates(allLocations, {
        edgePadding: { top: 80, right: 50, bottom: 150, left: 50 },
        animated: true
      });
    } else if (allLocations.length === 1) {
      mapRef.current.animateToRegion({
        latitude: allLocations[0].latitude,
        longitude: allLocations[0].longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      }, 1000);
    }
  };

  // Animation function for polyline
  const animatePolyline = (coordinates: {latitude: number, longitude: number}[]) => {
    console.log('Starting polyline animation with', coordinates.length, 'coordinates');
    setAnimatedCoordinates([]);
    let index = 0;
    const interval = setInterval(() => {
      if (index < coordinates.length) {
        const currentCoords = coordinates.slice(0, index + 1);
        setAnimatedCoordinates(currentCoords);
        
        // Follow the animation with camera
        if (mapRef.current && currentCoords.length > 0) {
          const currentPoint = currentCoords[currentCoords.length - 1];
          mapRef.current.animateToRegion({
            latitude: currentPoint.latitude,
            longitude: currentPoint.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }, 50); // Fast camera follow
        }
        
        index++;
      } else {
        console.log('Animation completed - returning to fit all locations');
        clearInterval(interval);
        // Return to fit all locations after animation completes
        setTimeout(() => fitMapToLocations(), 500);
      }
    }, 5); // Very fast animation - 5ms intervals
  };

  // Handle end location selection
  const handleEndLocationSelect = (location: LocationItem) => {
    console.log('End location selected:', location);
    setEndLocation(location);
    
    // Add to searched locations for map markers
    if (location.latitude && location.longitude) {
      setSearchedLocations(prev => {
        const exists = prev.some(loc => 
          loc.latitude === location.latitude && loc.longitude === location.longitude
        );
        if (!exists) {
          const newLocations = [...prev, location];
          console.log('Updated searched locations:', newLocations);
          // Fit map to show all locations after state update
          setTimeout(() => fitMapToLocations(), 100);
          return newLocations;
        }
        return prev;
      });
    }
  };

  const handleAddWaypoint = () => {
    setWaypoints([...waypoints, { locationName: '', latitude: null, longitude: null, note: '' }]);
  };

  const handleWaypointSelect = (index: number, location: LocationItem) => {
    console.log('Waypoint selected:', location);
    const updatedWaypoints = [...waypoints];
    updatedWaypoints[index] = location;
    setWaypoints(updatedWaypoints);
    
    // Add to searched locations for map markers
    if (location.latitude && location.longitude) {
      setSearchedLocations(prev => {
        const exists = prev.some(loc => 
          loc.latitude === location.latitude && loc.longitude === location.longitude
        );
        if (!exists) {
          const newLocations = [...prev, location];
          console.log('Updated searched locations:', newLocations);
          // Fit map to show all locations after state update
          setTimeout(() => fitMapToLocations(), 100);
          return newLocations;
        }
        return prev;
      });
    }
  };

  const handleRemoveWaypoint = (index: number) => {
    const updatedWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(updatedWaypoints);
  };

  const handleModeToggle = (value: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedMode(value);
    } else {
      setSelectedMode(null);
    }
  };

  const handleGenerateRoute = async () => {
    if (!selectedMode || !endLocation || !latitude || !longitude) {
      console.log('Missing required data for route generation');
      return;
    }

    setIsGenerating(true);
    try {
      // Build location array: start -> waypoints -> end
      const locationArray = [
        { latitude: latitude as number, longitude: longitude as number }, // Starting location
        ...waypoints.filter(wp => wp.latitude && wp.longitude).map(wp => ({
          latitude: wp.latitude!,
          longitude: wp.longitude!
        })), // Waypoints
        { latitude: endLocation.latitude!, longitude: endLocation.longitude! } // End location
      ];

      const route = await getRoutes({
        location: locationArray,
        mode: selectedMode,
        accessToken: session?.accessToken || ''
      });

      if (route) {
        setRouteData(route);
        console.log('Route generated:', route);
        
        // Extract coordinates for polyline from route geometry
        if (route.geometry && route.geometry.coordinates && route.geometry.coordinates.length > 0) {
          console.log('Route geometry found:', route.geometry);
          const coordinates = route.geometry.coordinates.map((coord: any) => ({
            latitude: coord[1],
            longitude: coord[0]
          }));
          console.log('Extracted coordinates:', coordinates.length, 'points');
          console.log('First few coordinates:', coordinates.slice(0, 3));
          setRouteCoordinates(coordinates);
          
          // Start animation without refitting map
          animatePolyline(coordinates);
        } else {
          console.log('No geometry coordinates found, trying to extract from segments/steps');
          // Fallback: create simple line between waypoints
          const fallbackCoordinates = [
            { latitude: latitude as number, longitude: longitude as number },
            ...waypoints.filter(wp => wp.latitude && wp.longitude).map(wp => ({
              latitude: wp.latitude!,
              longitude: wp.longitude!
            })),
            { latitude: endLocation.latitude!, longitude: endLocation.longitude! }
          ];
          console.log('Using fallback coordinates:', fallbackCoordinates.length, 'points');
          setRouteCoordinates(fallbackCoordinates);
          animatePolyline(fallbackCoordinates);
        }
      } else {
        console.log('Failed to generate route');
      }
    } catch (error) {
      console.error('Error generating route:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelRoute = async () => {
    Alert.alert(
      "Cancel Route",
      "Are you sure you want to cancel the route?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Cancel Route", 
          style: "destructive",
          onPress: async () => {
            router.back();
          }
        }
      ]
    );
  };

  const handleStartRoute = async () => {
    if (!routeData || !selectedMode || !endLocation || !latitude || !longitude) {
      console.log('Missing required data for starting route');
      return;
    }

    try {
      // Build location array with names for ActiveRoute
      const locationArray = [
        { 
          latitude: latitude as number, 
          longitude: longitude as number, 
          locationName: `${suburb}, ${city}` 
        }, // Starting location
        ...waypoints.filter(wp => wp.latitude && wp.longitude).map(wp => ({
          latitude: wp.latitude!,
          longitude: wp.longitude!,
          locationName: wp.locationName
        })), // Waypoints
        { 
          latitude: endLocation.latitude!, 
          longitude: endLocation.longitude!,
          locationName: endLocation.locationName 
        } // End location
      ];

      const activeRoute = {
        routeID: `route_${Date.now()}`, // Generate unique ID
        type: 'generated' as const,
        location: locationArray,
        mode: selectedMode,
        status: 'active',
        createdOn: new Date(),
        routeData: routeData
      };

      // Save to RouteContext
      await setActiveRoute(activeRoute);
      console.log('Route saved to RouteContext:', activeRoute);

      // Use a more reliable navigation approach
      try {
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 50));
        router.replace('/(tabs)/maps');
      } catch (navError) {
        console.error('Navigation error:', navError);
        // Fallback navigation
        router.push('/(tabs)/maps');
      }
    } catch (error) {
      console.error('Error starting route:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1, zIndex: 1 }}
        initialRegion={{
          latitude: latitude || 14.5995, // User location or Manila coords
          longitude: longitude || 120.9842,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* User Location Marker */}
        {latitude && longitude && (
          <PointMarker
            key="user-location"
            coordinate={{
              latitude: latitude,
              longitude: longitude
            }}
          />
        )}

        {/* Searched Location Markers - Using TaraMarker */}
        {searchedLocations.map((location, index) => {
          if (!location.latitude || !location.longitude) {
            console.log(`Skipping TaraMarker ${index}: missing coordinates`);
            return null;
          }
          console.log(`Rendering TaraMarker ${index + 1} at:`, location.latitude, location.longitude, 'with color:', '#FF6B6B');
          console.log(`TaraMarker coordinate validation:`, {
            lat: typeof location.latitude,
            lng: typeof location.longitude,
            latValue: location.latitude,
            lngValue: location.longitude
          });
          return (
            <PointMarker
              key={`searched-${index}-${location.latitude}-${location.longitude}`}
              coordinate={{
                latitude: Number(location.latitude),
                longitude: Number(location.longitude)
              }}
              title={location.locationName}
            />
          );
        })}
        
        
        {/* Animated Route Polyline */}
        {animatedCoordinates.length > 1 && (
          <Polyline
            coordinates={animatedCoordinates}
            strokeColor={secondaryColor}
            strokeWidth={6}
          />
        )}
      </MapView>

      <LinearGradient
        colors={['rgba(0,0,0)', 'rgba(0,0,0,0.6)', 'transparent']}
        style={styles.header}
      >
        {routeData? (
          <View style={styles.routeDataContainer}>
            <ThemedText type="title" style={{color: '#ccc'}}>
              {(routeData.distance / 1000).toFixed(2)} km • {Math.round(routeData.duration / 60)} min
            </ThemedText>
            <ThemedText style={{color: '#ccc', flexWrap: 'wrap'}}>
              {suburb}, {city}{waypoints.length > 0 && waypoints.map(wp => wp.locationName ? ` → ${wp.locationName}` : '').join('')} → {endLocation?.locationName}
            </ThemedText>
          </View>
        ):(!skipForm && (<>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10}}>
            <BackButton type='default' color='#ccc'/>
            <ThemedText style={{color: '#ccc'}}>Your Location to</ThemedText>
          </View>
          
          <TouchableOpacity style={styles.addWaypointButton} onPress={handleAddWaypoint}>
            <ThemedText style={{color: '#ccc'}}>Add Stop</ThemedText>
          </TouchableOpacity>

          {waypoints.map((waypoint, index) => (
          <View key={`waypoint-${index}`}>
          <TouchableOpacity 
            onPress={() => handleRemoveWaypoint(index)}
            style={styles.removeButton}
          >
            <ThemedIcons name="close" size={25} color="#ff4444" />
          </TouchableOpacity>
          <LocationAutocomplete
            value={waypoint.locationName}
            onSelect={(location) => handleWaypointSelect(index, location)}
            placeholder={`Enter waypoint ${index + 1}`}
            style={{ zIndex: 100 - index, backgroundColor: 'rgba(0,0,0,.5)' }}
          />
        </View>))}
        <View key="end">
          <LocationAutocomplete
            value={endLocation?.locationName || ''}
            onSelect={handleEndLocationSelect}
            placeholder="Enter destination"
            style={{ zIndex: 100 - waypoints.length, backgroundColor: 'rgba(0,0,0,.5)' }}
          />
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modeRowContent}
        >
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode.value}
              onPress={() => handleModeToggle(mode.value, true)}
            >
              <ThemedView
              style={[
                styles.modeButton,
                selectedMode === mode.value && {backgroundColor: secondaryColor},
              ]}>
                <ThemedIcons name={mode.icon} size={15} color="#ccc"/>
                <ThemedText style={{color: '#ccc'}}>
                  {mode.label}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ScrollView>
        </>))}
      </LinearGradient>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,.5)']}
        style={styles.buttonsContainer}
      >
        {routeData ? (<>
          <TouchableOpacity style={styles.sideButton} onPress={() => setRouteData(null)}>
            <ThemedIcons name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.startButton} onPress={handleStartRoute}>
            <ThemedIcons name="play" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideButton} onPress={handleCancelRoute}>
            <ThemedIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </>
      ):(
        <View style={styles.generateButtonContainer}>
          <Button
            title={isGenerating ? "Generating..." : "Generate Route"}
            onPress={handleGenerateRoute}
            type="primary"
            disabled={isGenerating || !selectedMode || !endLocation}
          />
        </View>
      )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    pointerEvents: 'box-none',
    padding: 16,
    paddingBottom: 60,
  },
  routeDataContainer: {
    marginTop: 20,
    gap: 5,
  },
  addWaypointButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    position: 'absolute',
    right: 7,
    top: 16,
    zIndex: 20,
  },
  removeButton: {
    position: 'absolute',
    right: 40,
    top: 11,
    zIndex: 20,
  },
  modeRowContent: {
    flexDirection: 'row',
    gap: 5,
  },
  modeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,.7)',
    gap: 7,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 15,
    paddingBottom: 40,
  },
  startButton:{
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButton:{
    backgroundColor: 'rgba(0,0,0,.5)',
    padding: 10,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: -20,
  },
});