// utils/verification.js

export function evaluateWordPositions(positions, correctList, layout) {
  const updated = [...positions];
  const connectedPairs = [];

  const sorted = [...positions].sort((a, b) => {
    const rowA = Math.floor(a.y / layout.GRID_SIZE);
    const rowB = Math.floor(b.y / layout.GRID_SIZE);
    if (rowA === rowB) return a.x - b.x;
    return rowA - rowB;
  });

  const userAnswer = sorted.map(p => p.word);

  // 1. Handle exact matches (green highlight + lock)
  sorted.forEach((pos, i) => {
    const correctWord = correctList[i];
    const isCorrect = pos.word === correctWord;
    const previous = positions[pos.index];

    updated[pos.index] = {
      ...updated[pos.index],
      locked: isCorrect,
      isCorrect: isCorrect,
      correctIndexTag: previous?.correctIndexTag ?? (isCorrect ? i + 1 : null),
      adjacentToCorrect: false
    };
  });

  // 2. Handle adjacency-based yellow highlights
  for (let i = 0; i < sorted.length - 1; i++) {
    const actualWordA = sorted[i].word;
    const actualWordB = sorted[i + 1].word;

    const matchIndex = correctList.findIndex((word, idx) =>
      word === actualWordA &&
      correctList[idx + 1] === actualWordB &&
      !connectedPairs.some(([from, to]) =>
        from === sorted[i].index && to === sorted[i + 1].index
      )

    );

    if (matchIndex !== -1) {
      // Only apply yellow if not already green (exact)
      if (!updated[sorted[i].index].isCorrect) {
        updated[sorted[i].index].adjacentToCorrect = true;
      }
      if (!updated[sorted[i + 1].index].isCorrect) {
        updated[sorted[i + 1].index].adjacentToCorrect = true;
      }

      console.log("pair", sorted[i].word, sorted[i+1].word, sorted[i].index, sorted[i+1].index);

      connectedPairs.push([sorted[i].index, sorted[i + 1].index]);
    }
  }

  

  return { updatedPositions: updated, connectedPairs };
}

export function verifyOrder(userOrder, correctOrder) {
  return arraysEqual(userOrder, correctOrder);
}

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}