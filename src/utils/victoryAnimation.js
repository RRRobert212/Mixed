import { Animated } from 'react-native';

export const VICTORY_ANIMATION = {
  WORD_DELAY: 200,        // Delay between each word animation
  BOUNCE_DURATION: 400,    // Duration of each word's bounce
  SCALE_UP: 1.3,           // How much to scale up during bounce
  TENSION: 200,            // Spring tension for bounce
  FRICTION: 8,             // Spring friction for bounce
};

/**
 * Animates an array of words in sequence with bounce effect (native driver)
 * @param {Array} wordAnimationValuesArray - Array of { victoryScale: Animated.Value } for each word
 * @param {Function} onWordAnimationStart - Optional callback per word start
 * @param {Function} onComplete - Callback when all animations complete
 */
export function playVictoryAnimation(
  wordAnimationValuesArray,
  onWordAnimationStart,
  onComplete
) {
  const animations = wordAnimationValuesArray.map((animationValues, index) => {
    const { victoryScale } = animationValues;

    // Optional callback when this word starts
    onWordAnimationStart && onWordAnimationStart(index);

    return Animated.sequence([
      Animated.spring(victoryScale, {
        toValue: VICTORY_ANIMATION.SCALE_UP,
        tension: VICTORY_ANIMATION.TENSION,
        friction: VICTORY_ANIMATION.FRICTION,
        useNativeDriver: true,
      }),
      Animated.spring(victoryScale, {
        toValue: 1,
        tension: VICTORY_ANIMATION.TENSION,
        friction: VICTORY_ANIMATION.FRICTION,
        useNativeDriver: true,
      }),
    ]);
  });

  Animated.stagger(VICTORY_ANIMATION.WORD_DELAY, animations).start(() => {
    onComplete && onComplete();
  });
}

/**
 * Creates victory animation values for a single word
 */
export function createVictoryAnimationValues() {
  return {
    victoryScale: new Animated.Value(1),
  };
}

/**
 * Plays victory animation for a single word
 * @param {Object} animationValues - { victoryScale: Animated.Value }
 * @param {Function} onComplete
 */
export function playWordVictoryAnimation(animationValues, onComplete) {
  const { victoryScale } = animationValues;

  Animated.sequence([
    Animated.spring(victoryScale, {
      toValue: VICTORY_ANIMATION.SCALE_UP,
      tension: VICTORY_ANIMATION.TENSION,
      friction: VICTORY_ANIMATION.FRICTION,
      useNativeDriver: true,
    }),
    Animated.spring(victoryScale, {
      toValue: 1,
      tension: VICTORY_ANIMATION.TENSION,
      friction: VICTORY_ANIMATION.FRICTION,
      useNativeDriver: true,
    }),
  ]).start(() => {
    onComplete && onComplete();
  });
}

/**
 * Resets victory animation values for a single word
 * @param {Object} animationValues - { victoryScale: Animated.Value }
 */
export function resetVictoryAnimation(animationValues) {
  animationValues.victoryScale.setValue(1);
}
