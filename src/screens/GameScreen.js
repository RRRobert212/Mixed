// GameScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import DraggableWord from '../components/DraggableWord';
import { 
  clamp, 
  getValidYPositions, 
  findNearestNonOverlapping,
  getBoundingConstraints
} from '../utils/PositionUtils';
import { 
  generateSpawnPositions, 
  generateSpawnOrder, 
  createInitialPositions 
} from '../utils/spawnUtils';
import { LAYOUT, ANIMATION, WORD_LIST } from '../utils/constants';
import { QUOTE_ATTRIBUTION } from '../utils/constants';
import { verifyOrder } from '../utils/verification';

import Timer from '../components/Timer';
import SubmitButton from '../components/SubmitButton';
import HintButton from '../components/HintButton';

import { evaluateWordPositions } from '../utils/verification';

import ConnectionLines from '../components/ConnectionLines';

import { MAX_SUBMITS, MAX_HINTS } from '../utils/constants';

import VictoryScreen from '../screens/VictoryScreen';





export default function GameScreen() {
  const [wordPositions, setWordPositions] = useState([]);
  const [spawnedWords, setSpawnedWords] = useState(0);
  const [isSpawning, setIsSpawning] = useState(true);
  const [showText, setShowText] = useState(false);
  const textOpacity = useRef(new Animated.Value(0)).current;
  const lastLockedMessageTime = useRef(0);
  const [hasStarted, setHasStarted] = useState(false);

  const [showLockedMessage, setShowLockedMessage] = useState(false);
  const lockedMessageOpacity = useRef(new Animated.Value(0)).current;

  const [showHintMessage, setShowHintMessage] = useState(false);
  const hintMessageOpacity = useRef(new Animated.Value(0)).current;
  const lastHintMessageTime = useRef(0);

  const [connections, setConnections] = useState([]);          // current frame's connections
  const [persistentConnections, setPersistentConnections] = useState([]); // ALL confirmed correct connections

  const [remainingSubmits, setRemainingSubmits] = useState(MAX_SUBMITS);
  const [remainingHints, setRemainingHints] = useState(MAX_HINTS);

  const [hasWon, setHasWon] = useState(false);
  const [finalStats, setFinalStats] = useState(null);



  function updatePosition(index, newX, newY, boxSize) {
    setWordPositions(currentPositions => {

      const currentPos = currentPositions[index];
      if (currentPos && 
          Math.abs(currentPos.x - newX) < 1 && 
          Math.abs(currentPos.y - newY) < 1) {
        return currentPositions;
      }

      const newPositions = [...currentPositions];
      const validYPositions = getValidYPositions(boxSize.height);
      const constraints = getBoundingConstraints(boxSize);

      const candidatePos = {
        x: clamp(newX, constraints.minX, constraints.maxX),
        y: newY,
        width: boxSize.width,
        height: boxSize.height,
      };

      const others = newPositions.filter((_, i) => i !== index);
      const nonOverlapPos = findNearestNonOverlapping(candidatePos, boxSize, others, validYPositions);

      const prev = currentPositions[index];

      newPositions[index] = {
        ...prev, // ✅ Preserve previous metadata like locked, correctIndexTag
        x: nonOverlapPos.x,
        y: nonOverlapPos.y,
        width: boxSize.width,
        height: boxSize.height,
        rect: {
          x: nonOverlapPos.x,
          y: nonOverlapPos.y,
          width: boxSize.width,
          height: boxSize.height,
        },
      };



      return newPositions;
    });
  }

  function handleSpawnComplete(index, finalX, finalY, boxSize) {
    updatePosition(index, finalX, finalY, boxSize);
  }

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const targetPositions = generateSpawnPositions();
    const spawnOrder = generateSpawnOrder(WORD_LIST.length);
    const initialPositions = createInitialPositions(targetPositions, spawnOrder);

    setWordPositions(initialPositions);
    setSpawnedWords(0);
    setIsSpawning(true);
    setShowText(false);
    textOpacity.setValue(0);

    startSpawning();
  };

  const startSpawning = () => {
    const spawnInterval = setInterval(() => {
      setSpawnedWords(current => {
        const next = current + 1;
        if (next >= WORD_LIST.length) {
          clearInterval(spawnInterval);
          setIsSpawning(false);

          setHasStarted(true);
          
          setTimeout(() => {
            setShowText(true);
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: ANIMATION.TEXT_FADE_DURATION,
              useNativeDriver: true,
            }).start();
          }, ANIMATION.TEXT_FADE_DELAY);
        }
        return next;
      });
    }, ANIMATION.SPAWN_INTERVAL);

    return () => clearInterval(spawnInterval);
  };

  const getSortedWords = () => {
    return [...wordPositions]
      .sort((a, b) => {
        const rowA = Math.floor(a.y / LAYOUT.GRID_SIZE);
        const rowB = Math.floor(b.y / LAYOUT.GRID_SIZE);
        if (rowA === rowB) {
          return a.x - b.x;
        }
        return rowA - rowB;
      })
      .map(p => p.word);
  };

function handleSubmit() {
  if (remainingSubmits <= 0) {
    // Optional: show game over screen
    return;
  }

  const userAnswer = getSortedWords();
  const isCorrect = verifyOrder(userAnswer);

  setRemainingSubmits(prev => prev - 1);

  if (isCorrect) {
    const hintsUsed = MAX_HINTS - remainingHints;
    const guessesUsed = MAX_SUBMITS - remainingSubmits + 1;

    const performance =
      hintsUsed === 0 && guessesUsed === 1
        ? 'Perfect!'
        : hintsUsed <= 1 && guessesUsed <= 2
        ? 'Excellent!'
        : hintsUsed <= 2 && guessesUsed <= 3
        ? 'Good!'
        : 'A win is a win...';

    setFinalStats({
      fullQuote: userAnswer.join(' '),
      hintsUsed,
      guessesUsed,
      performance,
    });

    setHasWon(true);
  } else {
    console.log('WRONG');
  }
}

  function handleHint() {
  if (remainingHints <= 0) {
    
    //alert message saying no hints remaining
    triggerHintMessage();
    return
  }
    
    

  const userAnswer = getSortedWords();
  const { updatedPositions, connectedPairs } = evaluateWordPositions(wordPositions, WORD_LIST, LAYOUT);

  setWordPositions(updatedPositions);
  setConnections(connectedPairs);

  setPersistentConnections(prev => {
    const hasInbound = new Set(prev.map(pair => pair[1]));
    const hasOutbound = new Set(prev.map(pair => pair[0]));
    const newOnes = [];

    for (const [from, to] of connectedPairs) {
      if (hasOutbound.has(from) || hasInbound.has(to)) continue;
      if (prev.some(([a, b]) => a === from && b === to)) continue;

      newOnes.push([from, to]);
      hasOutbound.add(from);
      hasInbound.add(to);
    }

    return [...prev, ...newOnes];
  });

  // Decrement Hint count
  setRemainingHints(prev => {
    const next = prev - 1;


    return next;
  });

  }

  function handleUnlock(index) {
    setWordPositions(prevPositions => {
      // Only update if the word is actually locked to prevent unnecessary updates
      if (!prevPositions[index]?.locked) return prevPositions;
      
      return prevPositions.map((pos, i) => {
        if (i === index) {
          return {
            ...pos,
            locked: false
          };
        }
        return pos;
      });
    });
  }

  //a message for users if they try to move a locked word.
function triggerLockedMessage() {
  const now = Date.now();

  // Prevent message if it's shown or was shown less than 3s ago
  if (showLockedMessage || now - lastLockedMessageTime.current < 3000) return;

  lastLockedMessageTime.current = now;
  setShowLockedMessage(true);
  lockedMessageOpacity.setValue(0);

  Animated.timing(lockedMessageOpacity, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }).start(() => {
    setTimeout(() => {
      Animated.timing(lockedMessageOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowLockedMessage(false));
    }, 1500); // Message visible duration
  });
}

function triggerHintMessage() {
  const now = Date.now();

  if (showHintMessage || now - lastHintMessageTime.current < 3000) return;

  lastHintMessageTime.current = now;
  setShowHintMessage(true);
  hintMessageOpacity.setValue(0);

  Animated.timing(hintMessageOpacity, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }).start(() => {
    setTimeout(() => {
      Animated.timing(hintMessageOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowHintMessage(false));
    }, 1500); // Visible duration
  });
}


  return (
    <View style={styles.container}>
      <Animated.Text style={[
        styles.orderText,
        { opacity: textOpacity }
      ]}>
        {getSortedWords().join(' ')}
      </Animated.Text>

      <ConnectionLines 
        wordPositions={wordPositions}
        connections={persistentConnections}
      />

      {wordPositions.length === WORD_LIST.length &&
        WORD_LIST.map((word, index) => (
          <DraggableWord
            key={index}
            word={word}
            initialPosition={{ x: wordPositions[index].x, y: wordPositions[index].y }}
            targetPosition={wordPositions[index].targetX !== undefined ? 
              { x: wordPositions[index].targetX, y: wordPositions[index].targetY } : null}
            shouldSpawn={wordPositions[index].spawnOrder < spawnedWords}
            onDragEnd={(x, y, boxSize) => updatePosition(index, x, y, boxSize)}
            onSpawnComplete={(finalX, finalY, boxSize) => handleSpawnComplete(index, finalX, finalY, boxSize)}
            onUnlock={() => handleUnlock(index)}
            isSpawning={isSpawning}
            locked={wordPositions[index].locked}
            onLockedAttempt={triggerLockedMessage}
            adjacentToCorrect={wordPositions[index].adjacentToCorrect}
            correctIndexTag={wordPositions[index].correctIndexTag}
          />
        ))}


      {showLockedMessage && (
            <Animated.View 
            pointerEvents="none"
            style={[styles.lockedMessageContainer, { opacity: lockedMessageOpacity }]}>
              <Text style={styles.lockedMessageText}>Double tap a word to unlock it</Text>
            </Animated.View>
          )}
      {showHintMessage && (
            <Animated.View 
              pointerEvents="none"
              style={[styles.lockedMessageContainer, { opacity: hintMessageOpacity }]}>
              <Text style={styles.lockedMessageText}>No hints remaining</Text>
            </Animated.View>
          )}
      <View style={styles.bottomRow}>
        <HintButton onPress={handleHint} remainingHints={remainingHints} />
        {/*    <Timer start={hasStarted} />  TIMER ELEMENT, REPLACED WITH Hints/guesses (GAME DESIGN CHOICE)*/}

        <SubmitButton onPress={handleSubmit} remainingSubmits = {remainingSubmits} />
      </View>

    {hasWon && finalStats && (
      <VictoryScreen
        fullQuote={finalStats.fullQuote}
        quoteAttribution={QUOTE_ATTRIBUTION[1][0]}
        hintsUsed={finalStats.hintsUsed}
        guessesUsed={finalStats.guessesUsed}
        performance={finalStats.performance}
        onClose={() => {
          setHasWon(false);
          setFinalStats(null);
          initializeGame();
        }}
      />
  )}

    </View>

    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  orderText: {
    marginTop: 0,
    fontSize: 16,
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  bottomRow: {
    position: 'absolute',
    bottom: 65,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockedMessageContainer: {
    position: 'absolute',
    top: '45%',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 100,
  },
  lockedMessageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});