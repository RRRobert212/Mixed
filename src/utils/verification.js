// utils/verification.js

import { WORD_LIST } from './constants';

export function evaluateWordPositions(currentPositions, targetList, layout) {
  const sorted = [...currentPositions].sort((a, b) => {
    const rowA = Math.floor(a.y / layout.GRID_SIZE);
    const rowB = Math.floor(b.y / layout.GRID_SIZE);
    return rowA === rowB ? a.x - b.x : rowA - rowB;
  });

  const newPositions = currentPositions.map((pos, i) => {
    const sortedIndex = sorted.findIndex(
      p => p.word === pos.word && p.index === pos.index
    );
    const isCorrectlyPlaced = sortedIndex !== -1 && targetList[sortedIndex] === pos.word;

    return {
      ...pos,
      locked: isCorrectlyPlaced,
      adjacentToCorrect: false, // default to false for now
    };
  });

  // Set adjacentToCorrect flags
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const next = sorted[i + 1];

    const correctIndex = targetList.indexOf(curr.word);
    if (correctIndex !== -1 && targetList[correctIndex + 1] === next.word) {
      // find them in newPositions and set adjacentToCorrect to true
      const i1 = newPositions.findIndex(p => p.word === curr.word && p.index === curr.index);
      const i2 = newPositions.findIndex(p => p.word === next.word && p.index === next.index);
      if (i1 !== -1) newPositions[i1].adjacentToCorrect = true;
      if (i2 !== -1) newPositions[i2].adjacentToCorrect = true;
    }
  }

  return newPositions;
}

export function verifyOrder(userOrder) {
  return arraysEqual(userOrder, WORD_LIST);
}

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}
