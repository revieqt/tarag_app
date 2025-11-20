import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemeProvider } from '@/context/ThemeContext';
import { SessionProvider } from '@/context/SessionContext';
import { View } from 'react-native';
// import * as SplashScreen from 'expo-splash-screen';

// SplashScreen.preventAutoHideAsync();

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

  // useEffect(() => {
  //   if (loaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const backgroundColor = useThemeColor({}, 'primary');

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
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaView>
    </View>
  );
}