// components/SubmitButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BUTTON_WIDTH } from '../utils/constants';

export default function SubmitButton({ onPress, remainingSubmits }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>Submit ({remainingSubmits})</Text>
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
