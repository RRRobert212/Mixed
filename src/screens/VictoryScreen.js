//VictoryScreen.js

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // ✅ Add this

const { width } = Dimensions.get('window');

export default function VictoryScreen({ fullQuote, quoteAttribution, hintsUsed, guessesUsed, performance, onClose }) {

  const navigation = useNavigation(); // ✅ Hook into navigation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const overlayFadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldShowContent, setShouldShowContent] = useState(false);

  useEffect(() => {
    setShouldShowContent(true);

    const animationTimeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(overlayFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, 50);

    return () => clearTimeout(animationTimeout);
  }, []);

  if (!shouldShowContent) return null;

  const handleGoHome = () => {
    navigation.navigate('Home');
  };


  function renderAttribution(text) {
  const parts = text.split(/(\*[^*]+\*)/); // splits by *...*
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <Text key={index} style={{ fontStyle: 'italic' }}>
          {part.slice(1, -1)}
        </Text>
      );
    } else {
      return <Text key={index}>{part}</Text>;
    }
  });
}

  return (
    <View style={styles.fullscreen}>
      <Animated.View style={[styles.overlay, { opacity: overlayFadeAnim }]} />
      <Animated.View style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Text style={styles.title}>{performance}</Text>
        <Text style={styles.quote}>"{fullQuote}"</Text>
        <Text style={styles.attribution}>
          {renderAttribution(quoteAttribution)}
        </Text>

        <Text style={styles.stats}>Guesses: {guessesUsed}</Text>
        <Text style={styles.stats}>Hints Used: {hintsUsed}</Text>

        <TouchableOpacity style={styles.button} onPress={handleGoHome}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}


const styles = StyleSheet.create({
  fullscreen: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    width: width * 0.85,
    padding: 25,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  quote: {
    fontSize: 20,
    fontFamily: 'serif',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  attribution: {
  fontSize: 18,
  color: '#666',
  fontFamily: 'serif',
  textAlign: 'center',
  marginBottom: 10,
  },
  stats: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
  position: 'absolute',
  top: 20,
  right: 20,
  zIndex: 1000,
  backgroundColor: 'rgba(0,0,0,0.4)',
  borderRadius: 20,
  width: 36,
  height: 36,
  justifyContent: 'center',
  alignItems: 'center',
},
closeButtonText: {
  color: '#fff',
  fontSize: 24,
  fontWeight: 'bold',
  lineHeight: 24,
},

});
