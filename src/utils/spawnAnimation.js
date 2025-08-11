// spawnAnimation.js
import { Animated, Dimensions } from 'react-native';
import { clamp, findNearestNonOverlapping, getBoundingConstraints, getValidYPositions } from './PositionUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animate spawning of words one by one from center screen to their target position.
// Params:
// - initialPositions: array of target positions for words (each has x,y,width,height)
// - onUpdatePosition(index, x, y) => called every frame to update a word's position
// - onComplete() => called after all words finished spawning
export function playSpawnAnimation(initialPositions, onUpdatePosition, onComplete) {
  // Center position (approx)
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;

  let currentIndex = 0;

  function animateWord(index) {
    if (index >= initialPositions.length) {
      if (onComplete) onComplete();
      return;
    }

    const target = initialPositions[index];
    const boxSize = { width: target.width, height: target.height };

    // Start position = center screen
    let animValue = new Animated.ValueXY({ x: centerX, y: centerY });

    // Each frame update calls onUpdatePosition with snapping and collision avoidance applied.
    const listenerId = animValue.addListener(({ x, y }) => {
      // Compute snapping and non-overlapping position
      const constraints = getBoundingConstraints(boxSize);
      const validYPositions = getValidYPositions(boxSize.height);

      const candidatePos = {
        x: clamp(x, constraints.minX, constraints.maxX),
        y: y,
        width: boxSize.width,
        height: boxSize.height,
      };

      // We want to avoid overlapping with all words except the current one.
      // But since only this word is moving so far, we just pass empty array.
      // For more advanced, we could pass all already spawned words positions.
      // For now, let's just snap to target since we're animating toward final pos.

      // Instead of findNearestNonOverlapping with empty others, just clamp position:
      // But to use same snapping, let's call findNearestNonOverlapping with other positions from initialPositions before index.

      const others = initialPositions.slice(0, index).map(p => ({
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
      }));

      const nonOverlapPos = findNearestNonOverlapping(candidatePos, boxSize, others, validYPositions);

      onUpdatePosition(index, nonOverlapPos.x, nonOverlapPos.y);
    });

    // Animate from center to target with spring for snap effect
    Animated.spring(animValue, {
      toValue: { x: target.x, y: target.y },
      useNativeDriver: false, // position is JS-managed because of collision logic
      speed: 20,
      bounciness: 10,
    }).start(() => {
      animValue.removeListener(listenerId);
      // Final position update to ensure exact target
      onUpdatePosition(index, target.x, target.y);
      animateWord(index + 1);
    });
  }

  animateWord(currentIndex);
}
