import { StyleSheet, View, TouchableOpacity} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import EmptyMessage from '@/components/EmptyMessage';
import { ThemedView } from '@/components/ThemedView';
import BackButton from '@/components/BackButton';
import Wave from '@/components/Wave';
import { useThemeColor } from '@/hooks/useThemeColor';
import RoundedButton from '@/components/RoundedButton';
import OptionsPopup from '@/components/OptionsPopup';
import ThemedIcons from '@/components/ThemedIcons';

export default function ExploreScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const buttonColor = useThemeColor({}, 'secondary');
  return (
    <>
      <ThemedView style={{flex: 1}}>
        <ThemedView color='secondary' style={styles.headerContainer}>
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

        
      </ThemedView>
      
      <OptionsPopup
        key="mapType"
        style={[styles.optionsButton, {backgroundColor: buttonColor}]}
        options={[
          <TouchableOpacity 
            key="standard" 
            style={styles.options}
            onPress={() => []}
          >
            <ThemedIcons name='plus' size={20}/>
            <ThemedText>Create a Route</ThemedText>
          </TouchableOpacity>,
          <TouchableOpacity 
            key="standard" 
            style={styles.options}
            onPress={() => []}
          >
            <ThemedIcons name='crosshairs-gps' size={20}/>
            <ThemedText>Track my Route</ThemedText>
          </TouchableOpacity>,
        ]}
        >
          <ThemedIcons name='play' size={30} color='#fff'/>
        </OptionsPopup>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
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
  options: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  
});
