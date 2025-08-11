import { useState, useEffect, useRef, useCallback } from 'react';
import { createVictoryAnimationValues, playWordVictoryAnimation, resetVictoryAnimation } from '../utils/victoryAnimation';

export default function useVictoryAnimation({ shouldPlayVictoryAnimation, onVictoryAnimationComplete, shouldSpawn }) {
  const victoryAnimationValues = useRef(createVictoryAnimationValues()).current;
  const hasPlayedVictoryAnimation = useRef(false);
  const victoryAnimationInProgress = useRef(false);
  const [shouldStayGreen, setShouldStayGreen] = useState(false);

  const handleVictoryAnimationComplete = useCallback(() => {
    if (victoryAnimationInProgress.current) {
      victoryAnimationInProgress.current = false;
      setTimeout(() => {
        setShouldStayGreen(true);
        onVictoryAnimationComplete && onVictoryAnimationComplete();
      }, 0);
    }
  }, [onVictoryAnimationComplete]);

  useEffect(() => {
    if (shouldPlayVictoryAnimation && !hasPlayedVictoryAnimation.current && !victoryAnimationInProgress.current) {
      hasPlayedVictoryAnimation.current = true;
      victoryAnimationInProgress.current = true;
      setTimeout(() => {
        playWordVictoryAnimation(victoryAnimationValues, handleVictoryAnimationComplete, true);
      }, 0);
    }
  }, [shouldPlayVictoryAnimation, handleVictoryAnimationComplete]);

  // Reset when starting new game
  useEffect(() => {
    if (!shouldSpawn && !hasPlayedVictoryAnimation.current) {
      hasPlayedVictoryAnimation.current = false;
      victoryAnimationInProgress.current = false;
      setShouldStayGreen(false);
      resetVictoryAnimation(victoryAnimationValues, true);
    }
  }, [shouldSpawn, victoryAnimationValues]);

  return { victoryAnimationValues, shouldStayGreen, setShouldStayGreen };
}
