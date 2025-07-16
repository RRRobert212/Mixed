// DraggableWord.js
import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Animated,
  PanResponder,
  Text,
  StyleSheet,
} from 'react-native';
import { 
  clamp, 
  getBoundingConstraints,
  getValidYPositions, 
  snapToRow 
} from '../utils/PositionUtils';
import { ANIMATION } from '../utils/constants';

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


}) {
  const pan = useRef(new Animated.ValueXY(initialPosition)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const lockScale = useRef(new Animated.Value(1)).current;
  const lockRotation = useRef(new Animated.Value(0)).current;
  const lockOpacity = useRef(new Animated.Value(1)).current;
  const boxSizeRef = useRef({ width: 0, height: 0 });
  const isDragging = useRef(false);
  const hasSpawned = useRef(false);
  const isCurrentlySpawning = useRef(false);
  const [isBeingDragged, setIsBeingDragged] = useState(false);
  const lastTapRef = useRef(0);
  const tapTimeoutRef = useRef(null);
  const previousLocked = useRef(locked);

  // Handle lock/unlock animations
  useEffect(() => {
    if (previousLocked.current !== locked && hasSpawned.current) {
      if (locked) {
        // Locking animation - scale up with slight rotation
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
            })
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
            })
          ])
        ]).start();
      } else {
        // Unlocking animation - brief flash and scale
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
            })
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
            })
          ])
        ]).start();
      }
    }
    previousLocked.current = locked;
  }, [locked]);

  // Handle spawning animation
  useEffect(() => {
    if (shouldSpawn && !hasSpawned.current && targetPosition && !isDragging.current) {
      hasSpawned.current = true;
      isCurrentlySpawning.current = true;
      
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: false,
          tension: ANIMATION.SCALE_TENSION,
          friction: ANIMATION.SPRING_FRICTION,
        }),
        Animated.spring(pan, {
          toValue: targetPosition,
          useNativeDriver: false,
          tension: ANIMATION.SPAWN_TENSION,
          friction: ANIMATION.SPRING_FRICTION,
        })
      ]).start(() => {
        handleSpawnComplete();
      });
    }
  }, [shouldSpawn, targetPosition]);

  const handleSpawnComplete = () => {
    if (boxSizeRef.current.width > 0 && boxSizeRef.current.height > 0) {
      const constraints = getBoundingConstraints(boxSizeRef.current);
      const validYPositions = getValidYPositions(boxSizeRef.current.height);
      
      const clampedX = clamp(targetPosition.x, constraints.minX, constraints.maxX);
      const snappedY = snapToRow(targetPosition.y, validYPositions);
      const clampedY = clamp(snappedY, constraints.minY, constraints.maxY);

      pan.setValue({ x: clampedX, y: clampedY });
      isCurrentlySpawning.current = false;
      scale.setValue(1);
      
      onSpawnComplete && onSpawnComplete(clampedX, clampedY, boxSizeRef.current);
    }
  };

  // Set scale for already spawned words
  useEffect(() => {
    if (!shouldSpawn && hasSpawned.current) {
      scale.setValue(1);
    }
  }, [shouldSpawn]);

  // Update position when initialPosition changes (for overlap resolution)
  useEffect(() => {
    if (!isDragging.current && !isSpawning && hasSpawned.current) {
      const currentX = pan.x._value;
      const currentY = pan.y._value;
      const targetX = initialPosition.x;
      const targetY = initialPosition.y;
      
      if (Math.abs(currentX - targetX) > 1 || Math.abs(currentY - targetY) > 1) {
        Animated.spring(pan, {
          toValue: initialPosition,
          useNativeDriver: false,
          tension: ANIMATION.SPRING_TENSION,
          friction: ANIMATION.SPRING_FRICTION,
        }).start();
      } else {
        pan.setValue(initialPosition);
      }
    }
  }, [initialPosition, isSpawning, pan]);

  const handleDoubleTap = () => {
    if (locked && onUnlock) {
      onUnlock();
    }
  };

  const handlePress = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300) { // Double tap detected
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      handleDoubleTap();
    } else {
      // Single tap - wait to see if there's a second tap
      tapTimeoutRef.current = setTimeout(() => {
        tapTimeoutRef.current = null;
        // Handle single tap if needed
      }, 300);
    }
    
    lastTapRef.current = now;
  };

  const panResponder = useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only set pan responder for movement if not locked and actually moving
        return !locked && !isCurrentlySpawning.current && hasSpawned.current && 
               (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2);
      },

      onPanResponderGrant: (evt) => {
        if (locked) {
          handlePress();
          onLockedAttempt && onLockedAttempt();
          return;
        }
      
        isDragging.current = true;
        setIsBeingDragged(true);
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      
      
      onPanResponderMove: (e, gesture) => {
        if (locked || boxSizeRef.current.width === 0 || boxSizeRef.current.height === 0) return;
      
        const constraints = getBoundingConstraints(boxSizeRef.current);
        const newX = clamp(gesture.dx + pan.x._offset, constraints.minX, constraints.maxX);
        const newY = clamp(gesture.dy + pan.y._offset, constraints.minY, constraints.maxY);
      
        pan.setValue({ x: newX - pan.x._offset, y: newY - pan.y._offset });
      },

      onPanResponderRelease: (evt, gestureState) => {
        if (locked) return;

        // If minimal movement, treat as tap
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
      
        // Immediately notify
        onDragEnd && onDragEnd(clampedX, clampedY, boxSizeRef.current);
      
        const shouldAnimateY = Math.abs(currentY - clampedY) > 5;
      
        if (shouldAnimateY) {
          Animated.spring(pan, {
            toValue: { x: clampedX, y: clampedY },
            useNativeDriver: false,
            tension: ANIMATION.SPRING_TENSION,
            friction: ANIMATION.SPRING_FRICTION,
          }).start();
        } else {
          pan.setValue({ x: clampedX, y: clampedY });
        }
      },
    }),
    [locked, onLockedAttempt, onDragEnd, pan, scale]// Recreate panResponder when locked changes
  );

  // Calculate rotation interpolation
  const rotationInterpolation = lockRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg']
  });

  return (
    <Animated.View
      style={[
        styles.wordContainer,
        isBeingDragged && styles.wordContainerDragging,
        locked && styles.lockedWord,
        adjacentToCorrect && !locked && styles.adjacentWord, // highlight only if not already locked
        pan.getLayout(),
        {
          transform: [
            { scale: scale },
            { scale: lockScale },
            { rotate: rotationInterpolation }
          ],
          opacity: lockOpacity
        }
      ]}
      {...panResponder.panHandlers}
      onLayout={event => {
        const { width, height } = event.nativeEvent.layout;
        boxSizeRef.current = { width, height };
      }}
      
    >
      {correctIndexTag != null && (
        <Text style={styles.indexBadge}>{correctIndexTag}</Text>
      )}

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
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  backgroundColor: '#FFEB3B', // Material yellow
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
  height: 16,                 // ✅ Set fixed height
  lineHeight: 16,             // ✅ Match height exactly
  textAlign: 'center',
  includeFontPadding: false,  // ✅ Prevent extra vertical padding on Android
  textAlignVertical: 'center',// ✅ Android vertical center (has no effect on iOS)
},


});