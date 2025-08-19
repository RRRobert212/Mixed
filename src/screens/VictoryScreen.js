// VictoryScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Modal } from 'react-native';

const { width } = Dimensions.get('window');

export default function VictoryScreen({ fullQuote, quoteAttribution, guessesUsed, performance, onClose, onGoHome, params }) {

  const [visible, setVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const overlayFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
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

    return () => clearTimeout(timeout);
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(overlayFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      onClose?.();
    });
  };

  const handleGoHome = () => {
    Animated.parallel([
      Animated.timing(overlayFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      onGoHome?.();
    });
  };

  function renderAttribution(text) {
    const parts = text.split(/(\*[^*]+\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return <Text key={index} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</Text>;
      }
      return <Text key={index}>{part}</Text>;
    });
  }

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.fullscreen}>
        <Animated.View style={[styles.overlay, { opacity: overlayFadeAnim }]} />
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.title}>{performance}</Text>
          <Text style={styles.quote}>"{fullQuote}"</Text>
          <Text style={styles.attribution}>{renderAttribution(quoteAttribution)}</Text>
          <Text style={styles.stats}>Guesses Used: {guessesUsed}</Text>

          <TouchableOpacity style={styles.button} onPress={handleGoHome}>
            <Text style={styles.buttonText}>
              {params.mode === 'pack' ? 'Back to Pack' : 'Back to Home'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
