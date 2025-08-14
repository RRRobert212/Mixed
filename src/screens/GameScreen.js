import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { LAYOUT, ANIMATION, MAX_SUBMITS } from '../utils/constants';
import { getRandomQuote } from '../utils/QuoteService';
import { verifyOrder, evaluateWordPositions } from '../utils/verification';

import Timer from '../components/Timer';
import SubmitButton from '../components/SubmitButton';
import ConnectionLines from '../components/ConnectionLines';
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

  const [connections, setConnections] = useState([]);
  const [persistentConnections, setPersistentConnections] = useState([]);

  const [remainingSubmits, setRemainingSubmits] = useState(MAX_SUBMITS);
  const [hasWon, setHasWon] = useState(false);
  const [finalStats, setFinalStats] = useState(null);

  const [currentQuote, setCurrentQuote] = useState(null);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);

  const updatePosition = useCallback((index, newX, newY, boxSize) => {
    setWordPositions(currentPositions => {
      const currentPos = currentPositions[index];
      if (currentPos && Math.abs(currentPos.x - newX) < 1 && Math.abs(currentPos.y - newY) < 1) {
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

      newPositions[index] = {
        ...currentPositions[index],
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
  }, []);

  const handleSpawnComplete = useCallback((index, finalX, finalY, boxSize) => {
    updatePosition(index, finalX, finalY, boxSize);
  }, [updatePosition]);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = useCallback(() => {
    const quote = getRandomQuote();
    setCurrentQuote(quote);

    const targetPositions = generateSpawnPositions(quote.words);
    const spawnOrder = generateSpawnOrder(quote.words.length);
    const initialPositions = createInitialPositions(targetPositions, spawnOrder, quote.words);

    setWordPositions(initialPositions);
    setSpawnedWords(0);
    setIsSpawning(true);
    setShowText(false);
    textOpacity.setValue(0);

    setRemainingSubmits(MAX_SUBMITS);
    setConnections([]);
    setPersistentConnections([]);

    setHasWon(false);
    setFinalStats(null);
    setShowVictoryScreen(false);

    startSpawning(quote.words.length);
  }, []);

  const startSpawning = useCallback((wordCount) => {
    const spawnInterval = setInterval(() => {
      setSpawnedWords(current => {
        const next = current + 1;
        if (next >= wordCount) {
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
  }, [textOpacity]);

  const getSortedWords = useCallback(() => {
    return [...wordPositions]
      .sort((a, b) => {
        const rowA = Math.floor(a.y / LAYOUT.GRID_SIZE);
        const rowB = Math.floor(b.y / LAYOUT.GRID_SIZE);
        if (rowA === rowB) return a.x - b.x;
        return rowA - rowB;
      })
      .map(p => p.word);
  }, [wordPositions]);

const handleSubmit = useCallback(() => {
  if (remainingSubmits <= 0 || !currentQuote || hasWon) return;

  const userAnswer = getSortedWords();
  const isCorrect = verifyOrder(userAnswer, currentQuote.words);

  setRemainingSubmits(prev => prev - 1);

  if (isCorrect) {
    const guessesUsed = MAX_SUBMITS - remainingSubmits + 1;

    const performance =
        guessesUsed === 1
        ? 'Perfect!'
        : guessesUsed <= 2
        ? 'Excellent!'
        : guessesUsed <= 3
        ? 'Good!'
        : 'A win is a win...';

    setFinalStats({
      fullQuote: currentQuote.words.join(' '),
      quoteAttribution: currentQuote.attribution,
      guessesUsed,
      performance,
    });

    setHasWon(true);

    setTimeout(() => setShowVictoryScreen(true), 1000);
  } else {
    // Wrong answer → give hint automatically
    if (remainingSubmits > 0) {
      const { updatedPositions, connectedPairs } = evaluateWordPositions(wordPositions, currentQuote.words, LAYOUT);
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


    } else {

      //no submits left!!!
    }
  }
}, [remainingSubmits, currentQuote, getSortedWords, wordPositions, hasWon]);

  const handleUnlock = useCallback((index) => {
    setWordPositions(prevPositions => {
      if (!prevPositions[index]?.locked) return prevPositions;
      return prevPositions.map((pos, i) => i === index ? { ...pos, locked: false } : pos);
    });
  }, []);

  const triggerLockedMessage = useCallback(() => {
    const now = Date.now();
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
      }, 1500);
    });
  }, [showLockedMessage, lockedMessageOpacity]);


  if (!currentQuote) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.orderText, { opacity: textOpacity }]}>
        {getSortedWords().join(' ')}
      </Animated.Text>

      <ConnectionLines 
        wordPositions={wordPositions}
        connections={persistentConnections}
      />

      {wordPositions.length === currentQuote.words.length &&
        currentQuote.words.map((word, index) => (
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
        <Animated.View pointerEvents="none" style={[styles.lockedMessageContainer, { opacity: lockedMessageOpacity }]}>
          <Text style={styles.lockedMessageText}>Double tap a word to unlock it</Text>
        </Animated.View>
      )}


      <View style={styles.bottomRow}>
        <SubmitButton onPress={handleSubmit} remainingSubmits={remainingSubmits} />
      </View>

      {hasWon && finalStats && showVictoryScreen && (
        <VictoryScreen
          fullQuote={finalStats.fullQuote}
          quoteAttribution={finalStats.quoteAttribution}
          guessesUsed={finalStats.guessesUsed}
          performance={finalStats.performance}
          onClose={() => {
            setHasWon(false);
            setFinalStats(null);
            setShowVictoryScreen(false);
            initializeGame();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fffbf1ff' },
  orderText: { marginTop: 0, fontSize: 16, fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', color: '#333', textAlign: 'center' },
  bottomRow: { position: 'absolute', bottom: 65, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lockedMessageContainer: { position: 'absolute', top: '45%', left: '10%', right: '10%', backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: 12, borderRadius: 8, alignItems: 'center', zIndex: 100 },
  lockedMessageText: { color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center' },
  loadingText: { fontSize: 18, textAlign: 'center', marginTop: 100, color: '#666' },
});
