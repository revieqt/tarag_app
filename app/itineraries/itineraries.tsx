import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import WaveHeader from '@/components/WaveHeader';
import RoundedButton from '@/components/RoundedButton';
import { useRouter } from 'expo-router';

export default function ItinerariesScreen() {
  const router = useRouter();
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView>
        <WaveHeader title='Itineraries' subtitle='Your travel plans' iconName='google-earth'/>
        
      </ScrollView>

      <RoundedButton
        iconName="plus"
        onPress={() => router.push('/itineraries/itineraries-create')}
        style={styles.addButton}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});