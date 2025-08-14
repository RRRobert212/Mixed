import { useState, useEffect } from 'react';

/**
 * Hook to delay showing the victory screen
 * @param {boolean} trigger - when true, start the delay
 * @param {number} delayMs - delay before showing (default 1000ms)
 */
export default function useVictoryScreenDelay(trigger, delayMs = 1000) {
  const [showVictory, setShowVictory] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (trigger) {
      timeoutId = setTimeout(() => {
        setShowVictory(true);
      }, delayMs);
    } else {
      setShowVictory(false);
    }

    return () => clearTimeout(timeoutId);
  }, [trigger, delayMs]);

  return showVictory;
}
