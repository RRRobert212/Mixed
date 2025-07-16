// constants.js
import { Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BUTTON_WIDTH = SCREEN_WIDTH * 0.3;

export const LAYOUT = {
  EDGE_PADDING: 10,
  TOP_OFFSET: 90,
  BOTTOM_OFFSET: 170,
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

export const WORD_LIST = [
'abandon', 'all', 'hope,', 'ye', 'who', 'enter', 'here' 
];

//workaround to avoid annoying refactor, just have this second thing be where you get the text for the end screen
//hmm should it just be a straightup string? should the first one be a straightup string? my next project
export const QUOTE_ATTRIBUTION = [
  ['abandon', 'all', 'hope,', 'ye', 'who', 'enter', 'here' ], ['Dante Aligheri *Inferno*']
]

//difficulty changes with these, max guesses and hints
export const MAX_SUBMITS = 4;
export const MAX_HINTS = 3;

