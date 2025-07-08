import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');

export default function VictoryScreen({ fullQuote, hintsUsed, guessesUsed, performance, onClose }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [shouldShowContent, setShouldShowContent] = useState(false);

  useEffect(() => {
    // Show content immediately when component mounts
    setShouldShowContent(true);
    
    // Start animation after a brief delay to ensure content is rendered
    const animationTimeout = setTimeout(() => {
      Animated.parallel([
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

  if (!shouldShowContent) {
    return null; // Don't render anything until ready
  }

  return (
    <Animated.View style={[styles.fullscreen, { opacity: fadeAnim }]}>
      <View style={styles.overlay} />
      <Animated.View style={[
        styles.container, 
        { 
          transform: [{ scale: scaleAnim }] 
        }
      ]}>
        <Text style={styles.title}>{performance}</Text>
        <Text style={styles.quote}>"{fullQuote}"</Text>
        <Text style={styles.stats}>Guesses: {guessesUsed}</Text>
        <Text style={styles.stats}>Hints Used: {hintsUsed}</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
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
    fontSize: 18,
    fontStyle: 'italic',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  stats: {
    fontSize: 16,
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
});
