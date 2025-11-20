import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedIcons } from '@/components/ThemedIcons';
import BackButton from './BackButton';
import Wave from './Wave';

interface WaveHeaderProps {
  color?: string;
  title?: string;
  subtitle?: string;
  iconName?: string;
}

const WaveHeader: React.FC<WaveHeaderProps> = ({ color, title, subtitle, iconName }) => {
  const secondaryColor = useThemeColor({}, 'secondary');
  const backgroundColor = useThemeColor({}, 'background');
  return (
    <View style={[styles.container, {backgroundColor: color || secondaryColor}]}>
      {/* <BackButton style={{padding: 16, zIndex: 1000}} color='#fff'/>
      {title && <ThemedText type='subtitle'>{title}</ThemedText>}
      {subtitle && <ThemedText style={{opacity: .7}}>{subtitle}</ThemedText>}
      {iconName && (
        <>
          <View style={styles.iconContainer}>
          
            <ThemedIcons
              name={iconName}
              size={120}
              color="#fff"
            />
          </View>
          <LinearGradient
            colors={[backgroundColor, backgroundColor, 'transparent']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={styles.circle}
          >

            <LinearGradient
              colors={[backgroundColor, backgroundColor, 'transparent']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={styles.innerCirlce}
            />
          </LinearGradient>
        </>
      )} */}
      <BackButton style={{padding: 16, zIndex: 1000}} color='#fff'/>
      <Wave/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 120,
    overflow: 'hidden'
  },
  gradientOverlay: {
    paddingTop: 50,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100
  },
  iconContainer: {
    position: 'absolute',
    top: 20,
    right: -10,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: .9,
    zIndex: 99
  },
  circle: {
    position: 'absolute',
    top: 10,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 1000,
    overflow: 'hidden',
    opacity: .4,
    padding: 30,
  },
  innerCirlce:{
    flex: 1,
    borderRadius: 1000,
    overflow: 'hidden',
    opacity: .5,
    padding: 30,
  }
});

export default WaveHeader;