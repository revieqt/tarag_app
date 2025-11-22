import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useSession } from '@/context/SessionContext';
// import { useItinerary, Itinerary } from '@/context/ItineraryContext';
import { ThemedIcons } from '@/components/ThemedIcons';
import CubeButton from '@/components/RoundedButton';
// import FadedHeader from '@/components/custom/FadedHeader';
import { useThemeColor } from '@/hooks/useThemeColor';
import EmptyMessage from '@/components/EmptyMessage';
import WaveHeader from '@/components/WaveHeader';

export default function ItinerariesScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView>
        <WaveHeader title='Itineraries' subtitle='Your travel plans' iconName='google-earth'/>
        
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    margin: 16,
    borderRadius: 14
  },
  typeButtonsContainer: {
    paddingTop: 5,
    paddingBottom: 16,
  },
  typeButton: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  itinerariesContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  itineraryCard: {
    marginBottom: 14,
    borderRadius: 10,
    padding: 16,
    overflow: 'hidden',
  },
  cardDates: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});