// victoryAnimation.js
import { Animated } from 'react-native';

export const VICTORY_ANIMATION = {
  WORD_DELAY: 200, // Delay between each word animation
  BOUNCE_DURATION: 400, // Duration of each word's bounce
  SCALE_UP: 1.3, // How much to scale up during bounce
  TENSION: 200, // Spring tension for bounce
  FRICTION: 8, // Spring friction for bounce
  HIGHLIGHT_DELAY: 100, // Delay before highlighting after bounce starts
};

/**
 * Animates words in sequence with bounce and highlight effects
 * @param {Array} wordPositions - Array of word position objects
 * @param {Function} onWordAnimationStart - Callback when each word starts animating
 * @param {Function} onComplete - Callback when all animations complete
 * @param {Function} onWordHighlighted - Callback when each word gets highlighted green (optional)
 */
export function playVictoryAnimation(wordPositions, onWordAnimationStart, onComplete, onWordHighlighted) {
  const sortedIndices = [...wordPositions]
    .map((pos, index) => ({ ...pos, originalIndex: index }))
    .sort((a, b) => {
      const rowA = Math.floor(a.y / 50); // Assuming GRID_SIZE is 50
      const rowB = Math.floor(b.y / 50);
      if (rowA === rowB) {
        return a.x - b.x;
      }
      return rowA - rowB;
    })
    .map(pos => pos.originalIndex);

  const animations = [];
  
  sortedIndices.forEach((wordIndex, sequenceIndex) => {
    const delay = sequenceIndex * VICTORY_ANIMATION.WORD_DELAY;
    
    const animation = new Promise((resolve) => {
      setTimeout(() => {
        // Notify that this word's animation is starting
        onWordAnimationStart && onWordAnimationStart(wordIndex);
        
        // Start the bounce animation
        animateWordBounce(wordIndex, () => {
          // Mark this word as permanently highlighted green
          onWordHighlighted && onWordHighlighted(wordIndex);
          resolve();
        });
      }, delay);
    });
    
    animations.push(animation);
  });

  // Wait for all animations to complete
  Promise.all(animations).then(() => {
    // Small delay before calling onComplete
    setTimeout(() => {
      onComplete && onComplete();
    }, 300);
  });
}

/**
 * Animates a single word with bounce effect
 * @param {number} wordIndex - Index of the word to animate
 * @param {Function} onComplete - Callback when animation completes
 */
function animateWordBounce(wordIndex, onComplete) {
  // The actual animation will be handled by the DraggableWord component
  // This function serves as a coordinator
  
  // Simulate animation duration
  setTimeout(() => {
    onComplete && onComplete();
  }, VICTORY_ANIMATION.BOUNCE_DURATION);
}

/**
 * Creates victory animation values for a word
 * @returns {Object} Animation values for scale and highlight
 */
export function createVictoryAnimationValues() {
  return {
    victoryScale: new Animated.Value(1),
    victoryHighlight: new Animated.Value(0),
  };
}

/**
 * Plays victory animation for a single word
 * @param {Object} animationValues - Animation values from createVictoryAnimationValues
 * @param {Function} onComplete - Callback when animation completes
 * @param {boolean} keepHighlighted - Whether to keep the highlight after animation (default: true)
 */
export function playWordVictoryAnimation(animationValues, onComplete, keepHighlighted = true) {
  const { victoryScale, victoryHighlight } = animationValues;
  
  Animated.parallel([
    // Bounce animation
    Animated.sequence([
      Animated.spring(victoryScale, {
        toValue: VICTORY_ANIMATION.SCALE_UP,
        tension: VICTORY_ANIMATION.TENSION,
        friction: VICTORY_ANIMATION.FRICTION,
        useNativeDriver: false,
      }),
      Animated.spring(victoryScale, {
        toValue: 1,
        tension: VICTORY_ANIMATION.TENSION,
        friction: VICTORY_ANIMATION.FRICTION,
        useNativeDriver: false,
      })
    ]),
    
    // Highlight animation (starts slightly after bounce)
    Animated.sequence([
      Animated.delay(VICTORY_ANIMATION.HIGHLIGHT_DELAY),
      Animated.timing(victoryHighlight, {
        toValue: 1,
        duration: VICTORY_ANIMATION.BOUNCE_DURATION - VICTORY_ANIMATION.HIGHLIGHT_DELAY,
        useNativeDriver: false,
      })
    ])
  ]).start(() => {
    // If keepHighlighted is false, reset the highlight
    if (!keepHighlighted) {
      victoryHighlight.setValue(0);
    }
    // Note: victoryHighlight stays at 1 if keepHighlighted is true
    onComplete && onComplete();
  });
}

/**
 * Resets victory animation values to initial state
 * @param {Object} animationValues - Animation values to reset
 * @param {boolean} resetHighlight - Whether to reset the highlight (default: false to keep green)
 */
export function resetVictoryAnimation(animationValues, resetHighlight = false) {
  const { victoryScale, victoryHighlight } = animationValues;
  victoryScale.setValue(1);
  
  // Only reset highlight if explicitly requested
  if (resetHighlight) {
    victoryHighlight.setValue(0);
  }
}

/**
 * Sets a word to permanent green highlight state
 * @param {Object} animationValues - Animation values to update
 */
export function setWordToVictoryHighlight(animationValues) {
  const { victoryHighlight } = animationValues;
  victoryHighlight.setValue(1);
}

/**
 * Removes the victory highlight from a word
 * @param {Object} animationValues - Animation values to update
 */
export function removeVictoryHighlight(animationValues) {
  const { victoryHighlight } = animationValues;
  victoryHighlight.setValue(0);
}