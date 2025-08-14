import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { BUTTON_WIDTH } from '../utils/constants';

export default function SubmitButton({ onPress, isLocked, text, scale }) {
  return (
    <TouchableOpacity
      style={[styles.button, isLocked && styles.buttonLocked]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={isLocked ? 1 : 0.7}
    >
      <Animated.Text style={[styles.buttonText, { transform: [{ scale }] }]}>
        {text}
      </Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: BUTTON_WIDTH,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },

});
