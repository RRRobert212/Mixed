//utils/feedback.js

export function evaluateWordPositions(wordPositions, wordList, layout) {
  const sorted = [...wordPositions].sort((a, b) => {
    const rowA = Math.floor(a.y / layout.GRID_SIZE);
    const rowB = Math.floor(b.y / layout.GRID_SIZE);
    return rowA === rowB ? a.x - b.x : rowA - rowB;
  });

  const updated = wordPositions.map(pos => {
    const sortedIndex = sorted.findIndex(p => p.word === pos.word && p.index === pos.index);
    const isCorrect = sortedIndex !== -1 && wordList[sortedIndex] === pos.word;
    return { ...pos, locked: isCorrect, highlight: isCorrect ? 'green' : null };
  });

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i].word;
    const next = sorted[i + 1].word;

    const i1 = wordList.indexOf(current);
    const i2 = wordList.indexOf(next);

    if (i1 !== -1 && i2 === i1 + 1) {
      updated.forEach(pos => {
        if ((pos.word === current || pos.word === next) && pos.highlight !== 'green') {
          pos.highlight = 'yellow';
        }
      });
    }
  }

  return updated;
}
