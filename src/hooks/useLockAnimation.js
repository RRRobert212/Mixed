import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function useLockAnimation({ locked, previousLocked, hasSpawned }) {
  const lockScale = useRef(new Animated.Value(1)).current;
  const lockRotation = useRef(new Animated.Value(0)).current;
  const lockOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (previousLocked.current !== locked && hasSpawned.current) {
      if (locked) {
        Animated.parallel([
          Animated.sequence([
            Animated.spring(lockScale, {
              toValue: 1.15,
              useNativeDriver: false,
              tension: 200,
              friction: 8,
            }),
            Animated.spring(lockScale, {
              toValue: 1,
              useNativeDriver: false,
              tension: 150,
              friction: 8,
            }),
          ]),
          Animated.sequence([
            Animated.timing(lockRotation, {
              toValue: 1,
              duration: 100,
              useNativeDriver: false,
            }),
            Animated.timing(lockRotation, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
          ]),
        ]).start();
      } else {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(lockOpacity, {
              toValue: 0.3,
              duration: 100,
              useNativeDriver: false,
            }),
            Animated.timing(lockOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.spring(lockScale, {
              toValue: 0.9,
              useNativeDriver: false,
              tension: 200,
              friction: 8,
            }),
            Animated.spring(lockScale, {
              toValue: 1,
              useNativeDriver: false,
              tension: 150,
              friction: 8,
            }),
          ]),
        ]).start();
      }
    }
    previousLocked.current = locked;
  }, [locked, previousLocked, hasSpawned, lockScale, lockRotation, lockOpacity]);

  return { lockScale, lockRotation, lockOpacity };
}
