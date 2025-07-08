// positionUtils.js
import { SCREEN_WIDTH, SCREEN_HEIGHT, LAYOUT } from './constants';

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * determines if two objects which have height and width are overlapping
 * 
 * @param {any} r1 
 * @param {any} r2 
 * @returns True if overlapping False otherwise
 */
export function rectsOverlap(r1, r2) {
  return !(
    r1.x + r1.width <= r2.x ||
    r1.x >= r2.x + r2.width ||
    r1.y + r1.height <= r2.y ||
    r1.y >= r2.y + r2.height
  );
}

export function getValidYPositions(boxHeight) {
  const minY = LAYOUT.EDGE_PADDING + LAYOUT.TOP_OFFSET;
  const maxY = SCREEN_HEIGHT - LAYOUT.BOTTOM_OFFSET - boxHeight;
  
  const totalAvailableHeight = maxY - minY;
  const wordHeight = Math.max(boxHeight, LAYOUT.MIN_WORD_HEIGHT);
  const rowSpacing = Math.max(
    LAYOUT.MIN_ROW_SPACING, 
    (totalAvailableHeight - (LAYOUT.ROW_COUNT * wordHeight)) / (LAYOUT.ROW_COUNT - 1)
  );
  
  return Array.from({ length: LAYOUT.ROW_COUNT }, (_, i) => {
    return minY + i * (wordHeight + rowSpacing);
  }).filter(y => y <= maxY);
}

export function getBoundingConstraints(boxSize) {
  return {
    minX: LAYOUT.EDGE_PADDING,
    maxX: SCREEN_WIDTH - LAYOUT.EDGE_PADDING - boxSize.width,
    minY: LAYOUT.EDGE_PADDING + LAYOUT.TOP_OFFSET,
    maxY: SCREEN_HEIGHT - LAYOUT.BOTTOM_OFFSET - boxSize.height,
  };
}

export function snapToRow(yPosition, validYPositions) {
  if (validYPositions.length === 0) {
    return LAYOUT.EDGE_PADDING + LAYOUT.TOP_OFFSET;
  }
  
  return validYPositions.reduce((closest, y) =>
    Math.abs(y - yPosition) < Math.abs(closest - yPosition) ? y : closest
  );
}

export function findNearestNonOverlapping(position, boxSize, existingPositions, validYPositions) {

  const currentRowY = snapToRow(position.y, validYPositions);
  const constraints = getBoundingConstraints(boxSize);
  
  // Check if there's overlap in the current row
  const currentRect = { 
    x: position.x, 
    y: currentRowY, 
    width: boxSize.width, 
    height: boxSize.height 
  };
  
  const overlappingInCurrentRow = existingPositions.filter(p => 
    Math.abs(p.rect.y - currentRowY) < 5 && rectsOverlap(currentRect, p.rect)
  );
  
  if (overlappingInCurrentRow.length === 0) {
    return { x: position.x, y: currentRowY };
  }
  
  // Try to place word horizontally in current row
  const horizontalPosition = findHorizontalPosition(
    position.x, 
    currentRowY, 
    boxSize, 
    overlappingInCurrentRow, 
    existingPositions,
    constraints
  );
  
  if (horizontalPosition) {
    return horizontalPosition;
  }
  
  // If current row is full, try other rows
  return findPositionInOtherRows(position, boxSize, existingPositions, validYPositions, constraints);
}

function findHorizontalPosition(originalX, rowY, boxSize, overlappingWords, allPositions, constraints) {
  // Try right of rightmost overlapping word
  const rightmostOverlapping = overlappingWords.reduce((rightmost, word) => 
    (word.rect.x + word.rect.width) > (rightmost.rect.x + rightmost.rect.width) ? word : rightmost
  );
  
  let rightPosition = clamp(
    rightmostOverlapping.rect.x + rightmostOverlapping.rect.width,
    constraints.minX,
    constraints.maxX
  );
  
  const rightRect = { x: rightPosition, y: rowY, width: boxSize.width, height: boxSize.height };
  if (!allPositions.some(p => rectsOverlap(rightRect, p.rect))) {
    return { x: rightPosition, y: rowY };
  }
  
  // Try left of leftmost overlapping word
  const leftmostOverlapping = overlappingWords.reduce((leftmost, word) => 
    word.rect.x < leftmost.rect.x ? word : leftmost
  );
  
  let leftPosition = clamp(
    leftmostOverlapping.rect.x - boxSize.width,
    constraints.minX,
    constraints.maxX
  );
  
  const leftRect = { x: leftPosition, y: rowY, width: boxSize.width, height: boxSize.height };
  if (!allPositions.some(p => rectsOverlap(leftRect, p.rect))) {
    return { x: leftPosition, y: rowY };
  }
  
  return null;
}

function findPositionInOtherRows(originalPosition, boxSize, allPositions, validYPositions, constraints) {
  const currentRowIndex = validYPositions.findIndex(y => 
    Math.abs(y - snapToRow(originalPosition.y, validYPositions)) < 5
  );
  
  for (let rowOffset = 1; rowOffset < validYPositions.length; rowOffset++) {
    for (const direction of [1, -1]) { // Try down first, then up
      const targetRowIndex = currentRowIndex + (rowOffset * direction);
      
      if (targetRowIndex >= 0 && targetRowIndex < validYPositions.length) {
        const targetY = validYPositions[targetRowIndex];
        
        // Check if original X position works in this row
        const testRect = { 
          x: originalPosition.x, 
          y: targetY, 
          width: boxSize.width, 
          height: boxSize.height 
        };
        
        if (!allPositions.some(p => rectsOverlap(testRect, p.rect))) {
          return { x: originalPosition.x, y: targetY };
        }
        
        // If overlap exists, try horizontal positioning in new row
        const overlappingInNewRow = allPositions.filter(p => 
          Math.abs(p.rect.y - targetY) < 5 && rectsOverlap(testRect, p.rect)
        );
        
        if (overlappingInNewRow.length > 0) {
          const horizontalPosition = findHorizontalPosition(
            originalPosition.x,
            targetY,
            boxSize,
            overlappingInNewRow,
            allPositions,
            constraints
          );
          
          if (horizontalPosition) {
            return horizontalPosition;
          }
        }
      }
    }
  }
  
  // If all else fails, return original position with row snapping
  return { 
    x: originalPosition.x, 
    y: snapToRow(originalPosition.y, validYPositions) 
  };
}