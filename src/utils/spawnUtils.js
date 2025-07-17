// spawnUtils.js
import { SCREEN_WIDTH, SCREEN_HEIGHT, LAYOUT } from './constants';
import { rectsOverlap, getValidYPositions } from './PositionUtils';

export function generateSpawnPositions(words) {
  const defaultBoxSize = { width: 120, height: 40 };
  const validYPositions = getValidYPositions(defaultBoxSize.height);
  const targetPositions = [];

  // Generate all target positions
  for (let i = 0; i < words.length; i++) {
    let pos;
    let attempts = 0;
    
    do {
      // Random X position (grid-aligned)
      const randomX = Math.floor(
        Math.random() *
        ((SCREEN_WIDTH - LAYOUT.EDGE_PADDING * 2 - defaultBoxSize.width) / LAYOUT.GRID_SIZE)
      ) * LAYOUT.GRID_SIZE + LAYOUT.EDGE_PADDING;
      
      // Random Y position from valid rows
      const randomYIndex = Math.floor(Math.random() * validYPositions.length);
      const randomY = validYPositions[randomYIndex];
      
      pos = {
        x: randomX,
        y: randomY,
        width: defaultBoxSize.width,
        height: defaultBoxSize.height,
      };
      attempts++;
    } while (
      targetPositions.some(p => rectsOverlap(pos, p)) &&
      attempts < 100
    );

    pos.rect = { x: pos.x, y: pos.y, width: pos.width, height: pos.height };
    pos.index = i;
    pos.word = words[i];
    targetPositions.push(pos);
  }

  return targetPositions;
}

export function generateSpawnOrder(length) {
  const spawnOrder = Array.from({ length }, (_, i) => i);
  for (let i = spawnOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [spawnOrder[i], spawnOrder[j]] = [spawnOrder[j], spawnOrder[i]];
  }
  return spawnOrder;
}

export function createInitialPositions(targetPositions, spawnOrder, words) {
  const defaultBoxSize = { width: 120, height: 40 };
  const centerX = SCREEN_WIDTH / 2 - defaultBoxSize.width / 2;
  const centerY = SCREEN_HEIGHT / 2 - defaultBoxSize.height / 2;

  return words.map((word, i) => ({
    x: centerX,
    y: centerY,
    width: defaultBoxSize.width,
    height: defaultBoxSize.height,
    rect: {
      x: centerX,
      y: centerY,
      width: defaultBoxSize.width,
      height: defaultBoxSize.height
    },
    index: i,
    word: word,
    targetX: targetPositions[i].x,
    targetY: targetPositions[i].y,
    spawnOrder: spawnOrder.indexOf(i),
  }));
}