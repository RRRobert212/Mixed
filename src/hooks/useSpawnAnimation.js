import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { clamp, getBoundingConstraints, getValidYPositions, snapToRow } from '../utils/PositionUtils';
import { ANIMATION } from '../utils/constants';

export default function useSpawnAnimation({ shouldSpawn, targetPosition, onSpawnComplete, pan, scale, boxSizeRef }) {
  const hasSpawned = useRef(false);
  const isSpawningNow = useRef(false);

  useEffect(() => {
    if (shouldSpawn && !hasSpawned.current && targetPosition && !isSpawningNow.current) {
      hasSpawned.current = true;
      isSpawningNow.current = true;

      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: ANIMATION.SCALE_TENSION,
          friction: ANIMATION.SPRING_FRICTION,
        }),
        Animated.spring(pan.x, {
          toValue: targetPosition.x,
          useNativeDriver: true,
          tension: ANIMATION.SPAWN_TENSION,
          friction: ANIMATION.SPRING_FRICTION,
        }),
        Animated.spring(pan.y, {
          toValue: targetPosition.y,
          useNativeDriver: true,
          tension: ANIMATION.SPAWN_TENSION,
          friction: ANIMATION.SPRING_FRICTION,
        }),
      ]).start(() => {
        // Smoothly animate to clamped and snapped position to avoid snapping glitch
        if (boxSizeRef.current.width > 0 && boxSizeRef.current.height > 0) {
          const constraints = getBoundingConstraints(boxSizeRef.current);
          const validYPositions = getValidYPositions(boxSizeRef.current.height);

          const clampedX = clamp(targetPosition.x, constraints.minX, constraints.maxX);
          const snappedY = snapToRow(targetPosition.y, validYPositions);
          const clampedY = clamp(snappedY, constraints.minY, constraints.maxY);

          Animated.parallel([
            Animated.spring(pan.x, {
              toValue: clampedX,
              useNativeDriver: true,
              tension: ANIMATION.SPRING_TENSION,
              friction: ANIMATION.SPRING_FRICTION,
            }),
            Animated.spring(pan.y, {
              toValue: clampedY,
              useNativeDriver: true,
              tension: ANIMATION.SPRING_TENSION,
              friction: ANIMATION.SPRING_FRICTION,
            }),
          ]).start(() => {
            isSpawningNow.current = false;
            scale.setValue(1);
            onSpawnComplete && onSpawnComplete(clampedX, clampedY, boxSizeRef.current);
          });
        }
      });
    }
  }, [shouldSpawn, targetPosition, onSpawnComplete, pan, scale, boxSizeRef]);

  // Reset spawn animation state if needed
  function setScaleValue(value) {
    scale.setValue(value);
  }

  return { hasSpawned, isSpawningNow, startSpawnAnimation: () => {}, setScaleValue };
}
