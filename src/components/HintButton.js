// components/HintButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BUTTON_WIDTH } from '../utils/constants';


export default function HintButton({ onPress, remainingHints }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>Hint ({remainingHints}) </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    button: {
      width: BUTTON_WIDTH,
      backgroundColor: '#2196F3',
      paddingVertical: 10,
      borderRadius: 8,
      marginRight: 10,
      alignItems: 'center',
    },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
