import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function useLockAnimation({ locked, previousLocked, hasSpawned }) {
  const lockScale = useRef(new Animated.Value(1)).current;
  const lockRotation = useRef(new Animated.Value(0)).current; // will interpolate to degrees
  const lockOpacity = useRef(new Animated.Value(1)).current;

  // Interpolated rotation for native driver
  const rotate = lockRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'], // adjust the max rotation angle
  });

  useEffect(() => {
    if (previousLocked.current !== locked && hasSpawned.current) {
      if (locked) {
        // Animate locking
        Animated.parallel([
          Animated.sequence([
            Animated.spring(lockScale, {
              toValue: 1.15,
              useNativeDriver: true,
              tension: 200,
              friction: 8,
            }),
            Animated.spring(lockScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 150,
              friction: 8,
            }),
          ]),
          Animated.sequence([
            Animated.timing(lockRotation, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(lockRotation, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      } else {
        // Animate unlocking
        Animated.parallel([
          Animated.sequence([
            Animated.timing(lockOpacity, {
              toValue: 0.3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(lockOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.spring(lockScale, {
              toValue: 0.9,
              useNativeDriver: true,
              tension: 200,
              friction: 8,
            }),
            Animated.spring(lockScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 150,
              friction: 8,
            }),
          ]),
        ]).start();
      }
    }
    previousLocked.current = locked;
  }, [locked, previousLocked, hasSpawned, lockScale, lockRotation, lockOpacity]);

  return { lockScale, rotate, lockOpacity };
}
