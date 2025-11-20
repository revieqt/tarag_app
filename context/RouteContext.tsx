import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for route data
const ROUTE_STORAGE_KEY = 'activeRoute';

// 🛣️ Route Data Types
export type RouteStep = {
  distance: number;        // meters for this step
  duration: number;        // seconds for this step
  instruction: string;     // "Turn left onto Main St"
  name?: string;           // street/POI name if available
  way_points: [number, number]; // indices in geometry polyline
};

export type RouteSegment = {
  distance: number;        // meters between two stops
  duration: number;        // seconds between two stops
  steps?: RouteStep[];     // turn-by-turn steps if requested
};

export type RouteData = {
  geometry: {
    coordinates: [number, number, number?][]; // [lon, lat, ele?] if elevation enabled
    type: string; // "LineString"
  };
  distance: number;   // total meters
  duration: number;   // total seconds
  bbox?: number[];
  segments: RouteSegment[]; // per-stop breakdown
};

// 📍 ActiveRoute type
export type ActiveRoute = {
  routeID: string;
  userID: string;
  location: { latitude: number; longitude: number; locationName: string }[];  // start point, waypoints, and endpoint
  mode: string;  // transport mode
  status: string;
  createdOn: Date;
  routeData?: RouteData; // ✅ ORS data
};

// 💡 Context shape
type RouteContextType = {
  activeRoute: ActiveRoute | undefined;
  setActiveRoute: (route: ActiveRoute | undefined) => Promise<void>;
  clearActiveRoute: () => Promise<void>;
};

// 🔗 Context init
const RouteContext = createContext<RouteContextType | undefined>(undefined);

// 🔐 Provider
export const RouteProvider = ({ children }: { children: ReactNode }) => {
  const [activeRoute, setActiveRouteState] = useState<ActiveRoute | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load route data on mount
  useEffect(() => {
    const loadRoute = async () => {
      try {
        const stored = await AsyncStorage.getItem(ROUTE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert date strings back to Date objects
          if (parsed) {
            parsed.createdOn = new Date(parsed.createdOn);
          }
          setActiveRouteState(parsed);
        }
      } catch (err) {
        console.error('Failed to load route data:', err);
      } finally {
        setIsInitialized(true);
      }
    };

    loadRoute();
  }, []);

  const setActiveRoute = async (route: ActiveRoute | undefined) => {
    try {
      if (route) {
        await AsyncStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(route));
      } else {
        await AsyncStorage.removeItem(ROUTE_STORAGE_KEY);
      }
      setActiveRouteState(route);
    } catch (err) {
      console.error('Failed to update active route:', err);
    }
  };

  const clearActiveRoute = async () => {
    try {
      await AsyncStorage.removeItem(ROUTE_STORAGE_KEY);
      setActiveRouteState(undefined);
    } catch (err) {
      console.error('Failed to clear active route:', err);
    }
  };

  if (!isInitialized) {
    return null; // Or a loading indicator
  }

  return (
    <RouteContext.Provider value={{
      activeRoute,
      setActiveRoute,
      clearActiveRoute,
    }}>
      {children}
    </RouteContext.Provider>
  );
};

// 🎯 Hook
export const useRoute = (): RouteContextType => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
};