import BackButton from '@/components/BackButton';
import { ThemedView } from '@/components/ThemedView';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import DropDownField from '@/components/DropDownField';
import { GENDER_OPTIONS } from '@/constants/Config';
import {useState} from 'react';
import ThemedIcons from '@/components/ThemedIcons';
import { router } from 'expo-router';
import {ThemedText} from '@/components/ThemedText';

export default function TranslateScreen() {
  const [gender, setGender] = useState<string>("Male");
  return (
    <ThemedView style={{flex: 1}}>
      <View style={styles.upperButtonsContainer}>
        <DropDownField
          placeholder="Tagalog"
          value={gender}
          onValueChange={setGender}
          values={GENDER_OPTIONS}
          style={{width: '44%'}}
        />
        <TouchableOpacity style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ThemedIcons name='arrow-left-right' size={20} />
        </TouchableOpacity>
        <DropDownField
          placeholder="English"
          value={gender}
          onValueChange={setGender}
          values={GENDER_OPTIONS}
          style={{width: '44%'}}
        /> 
      </View>
      
      <ThemedView style={styles.otherUserArea}>
      
      </ThemedView>

      <ThemedView color='primary' style={styles.userArea}>
        <View style={styles.userText}>
        </View>
        <View style={styles.userButtonsContainer}>
          <TouchableOpacity style={styles.userButtons} onPress={()=> router.back()}>
            <ThemedIcons name='arrow-left' size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.userButtons}>
            <ThemedIcons name='format-clear' size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.userButtons}>
            <ThemedIcons name='microphone' size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.userButtons}>
            <ThemedIcons name='information' size={20} />
          </TouchableOpacity>
        </View>
        
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  otherUserArea: {
    flex: 1,
    transform: [{ scaleY: -1 }],
  },
  otherUserButton:{
    position: 'absolute',
    top: 16,
    width: '30%',
    zIndex: 3,
    alignSelf: 'center',
  },
  userArea: {
    flex: 1,
  },
  userText:{
    flexGrow: 1,
  },
  upperButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 3,
    gap: 15
  },
  userButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  userButtons: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
