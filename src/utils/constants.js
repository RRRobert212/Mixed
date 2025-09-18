// constants.js
import { Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const BUTTON_WIDTH = SCREEN_WIDTH * 0.5;

export const LAYOUT = {
  EDGE_PADDING: 10,
  TOP_OFFSET: 15,
  BOTTOM_OFFSET: 190,
  GRID_SIZE: 20,
  ROW_COUNT: 11,
  MIN_WORD_HEIGHT: 50,
  MIN_ROW_SPACING: 10,
};

export const ANIMATION = {
  SPAWN_INTERVAL: 200,
  TEXT_FADE_DELAY: 500,
  TEXT_FADE_DURATION: 3000,
  SPRING_TENSION: 150,
  SPRING_FRICTION: 8,
  SPAWN_TENSION: 80,
  SCALE_TENSION: 200,
};

// Difficulty changes with these, max guesses
export const MAX_SUBMITS = 6;