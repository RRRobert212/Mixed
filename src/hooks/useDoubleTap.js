import { useRef, useCallback } from 'react';

export default function useDoubleTap({ locked, onUnlock }) {
  const lastTapRef = useRef(0);
  const tapTimeoutRef = useRef(null);

  const handleDoubleTap = useCallback(() => {
    if (locked && onUnlock) {
      onUnlock();
    }
  }, [locked, onUnlock]);

  return useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      handleDoubleTap();
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        tapTimeoutRef.current = null;
        // Could handle single tap logic here if needed
      }, 300);
    }
    lastTapRef.current = now;
  }, [handleDoubleTap]);
}
