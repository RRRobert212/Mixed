// components/Timer.js
import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';

export default function Timer({ isActive = true, start = false, initialSeconds = 0 }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!isActive || !start) return;

    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, start]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <Text style={styles.timerText}>
      {formatTime(seconds)}
    </Text>
  );
}

const styles = StyleSheet.create({
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
    paddingHorizontal: 10,
  },
});
