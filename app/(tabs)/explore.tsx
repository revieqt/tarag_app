import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ExploreScreen() {
  return (
    <ThemedView style={{flex: 1}}>
      <ThemedText>Explore Tab</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  
});
