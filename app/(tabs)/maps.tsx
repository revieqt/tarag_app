import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function MapsScreen() {
  return (
   <ThemedView style={{flex: 1}}>
      <ThemedText>Maps Tab</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  
});
