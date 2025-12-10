import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemeProvider } from '@/context/ThemeContext';
import { SessionProvider } from '@/context/SessionContext';
import { View } from 'react-native';
import { RouteProvider } from '@/context/RouteContext';
import { AlertsProvider } from '@/context/AlertsContext';
import mobileAds from 'react-native-google-mobile-ads';
import * as SplashScreen from 'expo-splash-screen';
import AnnouncementModal from '@/components/modals/AnnouncementModal';
import {
  getTodaysAnnouncementsToDisplay,
  getNextAnnouncement,
  handleNextAnnouncement,
  Announcement,
} from '@/services/announcementService';

SplashScreen.preventAutoHideAsync();

export {
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => console.log('AdMob initialized'));
  }, []);

  return (
    <ThemeProvider>
      <SessionProvider>
        <RouteProvider>
          <AlertsProvider>
            <AppContent />
          </AlertsProvider>
        </RouteProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const backgroundColor = useThemeColor({}, 'primary');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load announcements when app starts
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        console.log('[Layout] 🟡 Starting announcement load on app start');
        const announcementsList = await getTodaysAnnouncementsToDisplay();
        console.log(`[Layout] 📊 Got ${announcementsList.length} announcements to display`);
        
        if (announcementsList.length > 0) {
          setAnnouncements(announcementsList);
          const firstAnnouncement = await getNextAnnouncement(announcementsList);
          console.log(`[Layout] 📌 First announcement:`, firstAnnouncement?.title);
          
          if (firstAnnouncement) {
            setCurrentAnnouncement(firstAnnouncement);
            console.log('[Layout] ✅ Setting modal visible');
            setIsModalVisible(true);
          }
        } else {
          console.log('[Layout] ℹ️ No announcements to display');
        }
      } catch (error) {
        console.error('[Layout] ❌ Error loading announcements:', error);
      }
    };

    loadAnnouncements();
  }, []);

  const handleAnnouncementModalClose = async () => {
    console.log('[Layout] 🔄 Announcement modal closed, checking for next');
    setIsModalVisible(false);
    
    try {
      // Load next announcement if available
      const nextAnnouncement = await handleNextAnnouncement(announcements);
      console.log(`[Layout] ➡️ Next announcement:`, nextAnnouncement?.title);
      
      if (nextAnnouncement) {
        setCurrentAnnouncement(nextAnnouncement);
        // Small delay before showing next modal
        setTimeout(() => {
          console.log('[Layout] ✅ Showing next announcement modal');
          setIsModalVisible(true);
        }, 500);
      } else {
        console.log('[Layout] ✅ All announcements shown');
      }
    } catch (error) {
      console.error('[Layout] ❌ Error handling next announcement:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top', 'bottom']}>
        <Stack 
          screenOptions={{ headerShown: false }}
          initialRouteName={"index"}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="document-view" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/forgotPassword" />
          <Stack.Screen name="auth/verifyEmail" />
          <Stack.Screen name="auth/changePassword" />
          <Stack.Screen name="account/firstLogin" />
          <Stack.Screen name="account/profile" />
          <Stack.Screen name="account/settings-accountControl" />
          <Stack.Screen name="routes/routes" />
          <Stack.Screen name="routes/routes-create" />
          <Stack.Screen name="itineraries/itineraries" />
          <Stack.Screen name="itineraries/itineraries-create" />
          <Stack.Screen name="safety/safety" />
          <Stack.Screen name="translate/translate" />
          <Stack.Screen name="+not-found" />
        </Stack>
        
      </SafeAreaView>
      <AnnouncementModal
        visible={isModalVisible}
        announcement={currentAnnouncement}
        onClose={handleAnnouncementModalClose}
      />
    </View>
  );
}