// utils/verification.js

import { WORD_LIST } from './constants';

export function evaluateWordPositions(positions, correctList, layout) {
  const updated = [...positions];
  const connectedPairs = [];

  const sorted = [...positions].sort((a, b) => {
    const rowA = Math.floor(a.y / layout.GRID_SIZE);
    const rowB = Math.floor(b.y / layout.GRID_SIZE);
    if (rowA === rowB) return a.x - b.x;
    return rowA - rowB;
  });

  for (let i = 0; i < sorted.length - 1; i++) {
    const w1 = sorted[i].word;
    const w2 = sorted[i + 1].word;

    const correctIndex1 = correctList.indexOf(w1);
    const correctIndex2 = correctList.indexOf(w2);

    if (correctIndex2 === correctIndex1 + 1) {
      updated[sorted[i].index].adjacentToCorrect = true;
      updated[sorted[i + 1].index].adjacentToCorrect = true;
      connectedPairs.push([sorted[i].index, sorted[i + 1].index]);
    } else {
      updated[sorted[i].index].adjacentToCorrect = false;
      updated[sorted[i + 1].index].adjacentToCorrect = false;
    }
  }

  return { updatedPositions: updated, connectedPairs };
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
