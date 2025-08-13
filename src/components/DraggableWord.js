//draggableword.js

import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import {
  Animated,
  PanResponder,
  Text,
  StyleSheet,
} from 'react-native';
import { clamp, getBoundingConstraints, getValidYPositions, snapToRow } from '../utils/PositionUtils';
import { ANIMATION } from '../utils/constants';

import useSpawnAnimation from '../hooks/useSpawnAnimation';
import useVictoryAnimation from '../hooks/useVictoryAnimation';
import useLockAnimation from '../hooks/useLockAnimation';
import useDoubleTap from '../hooks/useDoubleTap';

export default function DraggableWord({
  word,
  initialPosition = { x: 50, y: 100 },
  targetPosition = null,
  shouldSpawn = false,
  onDragEnd,
  onSpawnComplete,
  onUnlock,
  isSpawning = false,
  locked = false,
  onLockedAttempt,
  adjacentToCorrect = false,
  correctIndexTag,
  shouldPlayVictoryAnimation = false,
  onVictoryAnimationComplete,
}) {
  // Refs & state
  const pan = useRef(new Animated.ValueXY(initialPosition)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const boxSizeRef = useRef({ width: 0, height: 0 });
  const isDragging = useRef(false);
  const [isBeingDragged, setIsBeingDragged] = useState(false);
  const previousLocked = useRef(locked);

  // Spawn animation hook
  const { hasSpawned, isSpawningNow, setScaleValue } = useSpawnAnimation({
    shouldSpawn,
    targetPosition,
    onSpawnComplete,
    pan,
    scale,
    boxSizeRef,
  });
  

  // Victory animation hook
  const {
    victoryAnimationValues,
    shouldStayGreen,
    setShouldStayGreen,
  } = useVictoryAnimation({
    shouldPlayVictoryAnimation,
    onVictoryAnimationComplete,
    shouldSpawn,
  });

  // Lock animation hook
  const {
    lockScale,
    rotate,
    lockOpacity,
  } = useLockAnimation({ locked, previousLocked, hasSpawned });

  // Double tap hook
  const handleDoubleTap = useDoubleTap({
    locked,
    onUnlock,
  });

  // Handle tap and drag gesture logic
  const handlePress = useCallback(() => {
    handleDoubleTap();
  }, [handleDoubleTap]);

  // PanResponder setup
  const panResponder = useMemo(() => PanResponder.create({

    //prevent taps for unlocked words (locked is boolean here)
    onStartShouldSetPanResponder: () => locked, 
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return !locked && !isSpawningNow.current && hasSpawned.current &&
        (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2);
    },
    onPanResponderGrant: () => {
      if (locked) {
        handlePress();
        onLockedAttempt && onLockedAttempt();
        return;
      }
      isDragging.current = true;
      setIsBeingDragged(true);
      pan.setOffset({ x: pan.x._value, y: pan.y._value });
      pan.x.setValue(0);
      pan.y.setValue(0);
    },
    onPanResponderMove: (e, gesture) => {
      if (locked || boxSizeRef.current.width === 0 || boxSizeRef.current.height === 0) return;

      const constraints = getBoundingConstraints(boxSizeRef.current);
      const newX = clamp(gesture.dx + pan.x._offset, constraints.minX, constraints.maxX);
      const newY = clamp(gesture.dy + pan.y._offset, constraints.minY, constraints.maxY);

      pan.x.setValue(newX - pan.x._offset);
      pan.y.setValue(newY - pan.y._offset);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (locked) return;

      if (Math.abs(gestureState.dx) < 2 && Math.abs(gestureState.dy) < 2) {
        handlePress();
      }

      pan.flattenOffset();
      isDragging.current = false;
      setIsBeingDragged(false);

      if (boxSizeRef.current.width === 0 || boxSizeRef.current.height === 0) return;

      const currentX = pan.x._value;
      const currentY = pan.y._value;
      const constraints = getBoundingConstraints(boxSizeRef.current);
      const validYPositions = getValidYPositions(boxSizeRef.current.height);

      const snappedY = snapToRow(currentY, validYPositions);
      const clampedX = clamp(currentX, constraints.minX, constraints.maxX);
      const clampedY = clamp(snappedY, constraints.minY, constraints.maxY);

      onDragEnd && onDragEnd(clampedX, clampedY, boxSizeRef.current);

      const shouldAnimateY = Math.abs(currentY - clampedY) > 5;

      if (shouldAnimateY) {
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
        ]).start();
      } else {
        pan.x.setValue(clampedX);
        pan.y.setValue(clampedY);
      }
    },
  }), [locked, onLockedAttempt, onDragEnd, pan, handlePress, isSpawningNow, hasSpawned]);

  // Sync position if initialPosition changes (for overlap fixes)
  useEffect(() => {
    if (!isDragging.current && !isSpawning && hasSpawned.current) {
      const currentX = pan.x._value;
      const currentY = pan.y._value;
      const targetX = initialPosition.x;
      const targetY = initialPosition.y;

      if (Math.abs(currentX - targetX) > 1 || Math.abs(currentY - targetY) > 1) {
        Animated.parallel([
          Animated.spring(pan.x, {
            toValue: targetX,
            useNativeDriver: true,
            tension: ANIMATION.SPRING_TENSION,
            friction: ANIMATION.SPRING_FRICTION,
          }),
          Animated.spring(pan.y, {
            toValue: targetY,
            useNativeDriver: true,
            tension: ANIMATION.SPRING_TENSION,
            friction: ANIMATION.SPRING_FRICTION,
          }),
        ]).start();
      } else {
        pan.x.setValue(targetX);
        pan.y.setValue(targetY);
      }
    }
  }, [initialPosition, isSpawning, pan, hasSpawned]);

  // Style calculations
  const rotationInterpolation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg'],
  });

  const victoryBackgroundColor = victoryAnimationValues.victoryHighlight.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#4CAF50'], // Green highlight
  });

const computedBackgroundColor = useMemo(() => {
  if (shouldStayGreen || shouldPlayVictoryAnimation) return victoryBackgroundColor;
  if (locked) return '#4CAF50';
  if (adjacentToCorrect && !locked) return '#FFEB3B';
  if (isBeingDragged) return '#bbb'; // <-- darken while dragging
  return '#ddd';
}, [shouldStayGreen, shouldPlayVictoryAnimation, locked, adjacentToCorrect, victoryBackgroundColor, isBeingDragged]);

  return (
<Animated.View
  style={[
    styles.wordContainer,
    locked && styles.lockedWord,
    adjacentToCorrect && !locked && !shouldStayGreen && styles.adjacentWord,
    {
      transform: [
        { translateX: pan.x },
        { translateY: pan.y },
        { scale: scale }, // spawn scale
        { scale: lockScale }, // lock animation
        { scale: victoryAnimationValues.victoryScale }, // victory animation
        { rotate: rotate }, // from useLockAnimation
      ],
      opacity: lockOpacity,
      backgroundColor: isBeingDragged
        ? '#bbb' // darken when dragging
        : shouldStayGreen || shouldPlayVictoryAnimation
        ? victoryBackgroundColor
        : locked
        ? '#4CAF50'
        : adjacentToCorrect && !locked
        ? '#FFEB3B'
        : '#ddd',
      // optionally keep shadows/elevation when dragging
      shadowColor: isBeingDragged ? '#000' : undefined,
      shadowOffset: isBeingDragged ? { width: 0, height: 4 } : undefined,
      shadowOpacity: isBeingDragged ? 0.3 : undefined,
      shadowRadius: isBeingDragged ? 6 : undefined,
      elevation: isBeingDragged ? 8 : undefined,
    },
  ]}
  {...panResponder.panHandlers}
  onLayout={event => {
    const { width, height } = event.nativeEvent.layout;
    boxSizeRef.current = { width, height };
  }}
>
  {correctIndexTag != null && <Text style={styles.indexBadge}>{correctIndexTag}</Text>}
  <Text style={styles.wordText}>{word}</Text>
</Animated.View>

  );
}

const styles = StyleSheet.create({
  wordContainer: {
    position: 'absolute',
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 8,
  },
  wordContainerDragging: {
    backgroundColor: '#bbb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  wordText: {
    fontSize: 18,
    fontFamily: 'serif',
  },
  lockedWord: {
    backgroundColor: '#4CAF50',
  },
  adjacentWord: {
    backgroundColor: '#FFEB3B',
  },
  indexBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 4,
    fontSize: 10,
    fontWeight: 'bold',
    overflow: 'hidden',
    zIndex: 10,
    minWidth: 24,
    height: 16,
    lineHeight: 16,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
