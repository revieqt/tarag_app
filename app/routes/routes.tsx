import { StyleSheet, View, TouchableOpacity, ScrollView} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import EmptyMessage from '@/components/EmptyMessage';
import { ThemedView } from '@/components/ThemedView';
import BackButton from '@/components/BackButton';
import Wave from '@/components/Wave';
import { useThemeColor } from '@/hooks/useThemeColor';
import OptionsPopup from '@/components/OptionsPopup';
import ThemedIcons from '@/components/ThemedIcons';
import { CustomAlert } from '@/components/Alert';
import { useInternetConnection } from '@/utils/checkInternetConnection';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useRoute } from '@/context/RouteContext';
import GradientBlobs from '@/components/GradientBlobs';

export default function ExploreScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const buttonColor = useThemeColor({}, 'secondary');
  const isConnected = useInternetConnection();
  const [showNoInternetAlert, setShowNoInternetAlert] = useState(false);
  const router = useRouter();
  const { activeRoute } = useRoute();

  return (
    <>
      <ThemedView style={{flex: 1}}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <OptionsPopup
            key="settings"
            style={styles.settingsButton}
            options={[
              <TouchableOpacity style={styles.settingsOption}>
                <ThemedIcons name='delete' size={18}/>
                <ThemedText style={{marginLeft: 10}}>Clear Route History</ThemedText>
              </TouchableOpacity>,
              !isConnected && <TouchableOpacity 
                style={styles.settingsOption}>
                <ThemedIcons name='information' size={18}/>
                <ThemedText style={{marginLeft: 10}}>Route Guide</ThemedText>
              </TouchableOpacity>
            ]}
          >
            <ThemedIcons name='dots-vertical' size={20} color='#fff'/>
          </OptionsPopup>
          <ThemedView color='secondary' style={styles.headerContainer}>
            <GradientBlobs/>
            <BackButton style={{padding: 16}} color='#fff'/>
            
            <View style={styles.activeRouteContainer}>
              <EmptyMessage
                iconName="map-search"
                title="No Active Route"
                description="Start a new route to begin tracking your journey." 
                isWhite
                isSolid
              />
            </View>
            <Wave color={backgroundColor}/>
          </ThemedView>
        </ScrollView>
      </ThemedView>
      
      <OptionsPopup
        key="mapType"
        style={[styles.optionsButton, {backgroundColor: buttonColor}]}
        options={[
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.options, {opacity: isConnected ? 1 : 0.5}]}
              onPress={() => router.push('/routes/routes-create')}
              disabled={!isConnected }
            >
              <ThemedIcons name='map-marker-radius' size={30} color='#0065F8'/>
              <ThemedText style={{marginTop: 7}}>Create a Route</ThemedText>
              {isConnected ? <ThemedText style={styles.optionsDescription}>Get directions to your destination.</ThemedText>
              : <ThemedText style={styles.optionsDescription}>You need an internet connection to create a route</ThemedText>}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.options}
              onPress={() => router.replace('(tabs)/maps')}
              disabled={activeRoute !== null}
            >
              <ThemedIcons name='crosshairs-gps' size={30} color='#0065F8'/>
              <ThemedText style={{marginTop: 7}}>Track my Route</ThemedText>
              <ThemedText style={styles.optionsDescription}>Track your Route</ThemedText>
            </TouchableOpacity>
          </View>
        ]}
      >
        <ThemedIcons name='play' size={30} color='#fff'/>
      </OptionsPopup>

      <CustomAlert
        visible={showNoInternetAlert}
        title="No Internet Connection"
        message="You need an internet connection to create routes. Please try again later."
        icon='alert'
        fadeAfter={3000}
        onClose={() => setShowNoInternetAlert(false)}
        buttons={[
          { text: 'OK', style: 'default', onPress: () => setShowNoInternetAlert(false) }
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    overflow: 'hidden',
  },
  settingsButton: {
    position: 'absolute',
    top: 5,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex:1
  },
  activeRouteContainer: {
    marginHorizontal: 16,
  },
  optionsButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    width: 60,
    aspectRatio: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  options: {
    width: '48%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 222,.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgb(0, 255, 222)',
    padding: 10
  },
  optionsDescription: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
});
