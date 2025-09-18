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

import { PUZZLE_PACKS } from '../utils/packs';
import { useRoute } from '@react-navigation/native';

import { loadProgress, updateLevelProgress } from '../utils/ProgressStorage';

export default function GameScreen({ navigation }) {
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

  const [submitLocked, setSubmitLocked] = useState(true);
  const [submitText, setSubmitText] = useState(`Submit (${remainingSubmits})`);
  const currentSubmitText = hasWon ? submitText : `Submit (${remainingSubmits})`;
  const submitScale = useRef(new Animated.Value(1)).current;

  const route = useRoute();
  const params = route.params || {};

  const levelKeyRef = useRef(null); // store dynamic level key across functions

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

  const initializeGame = useCallback(async () => {
    let quote;

    if (params?.mode && params?.quoteIndex !== undefined && params?.packId) {
      const pack = PUZZLE_PACKS.find(p => p.id === params.packId);
      quote = pack?.quoteFile?.[params.quoteIndex];
    }

    if (!quote) quote = getRandomQuote();

    setCurrentQuote(quote);

    const targetPositions = generateSpawnPositions(quote.words);
    const spawnOrder = generateSpawnOrder(quote.words.length);
    const initialPositions = createInitialPositions(targetPositions, spawnOrder, quote.words);
    setWordPositions(initialPositions);

    levelKeyRef.current = params.mode && params?.quoteIndex !== undefined
      ? `${params.mode}_${params.quoteIndex}`
      : `daily_${params.date || 'today'}`;

    const progress = await loadProgress();
    const packId = params?.packId || 'daily';
    const levelData = progress.packs?.[packId]?.[levelKeyRef.current];
    setRemainingSubmits(levelData?.guessesRemaining ?? MAX_SUBMITS);

    setSpawnedWords(0);
    setIsSpawning(true);
    setShowText(false);
    textOpacity.setValue(0);
    setConnections([]);
    setPersistentConnections([]);
    setHasWon(false);
    setFinalStats(null);
    setShowVictoryScreen(false);
    setSubmitLocked(true);

    startSpawning(quote.words.length);
  }, [params]);

  const startSpawning = useCallback((wordCount) => {
    const spawnInterval = setInterval(() => {
      setSpawnedWords(current => {
        const next = current + 1;
        if (next >= wordCount) {
          clearInterval(spawnInterval);
          setIsSpawning(false);
          setHasStarted(true);
          setTimeout(() => setSubmitLocked(false), 1000);
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
// ----------- PERSISTENT QUOTE STATE HELPER -----------
const updateQuoteState = async (status, guessesRemaining) => {
  // status: 'not_started' | 'started' | 'completed' | 'failed'
  const packId = params?.packId || 'daily';
  if (!levelKeyRef.current) return;

  await updateLevelProgress(packId, levelKeyRef.current, {
    status,
    guessesRemaining, // <-- explicitly pass the value
  });
};

const handleSubmit = useCallback(() => {
  if (submitLocked || remainingSubmits <= 0) return;

  const nextRemaining = Math.max(remainingSubmits - 1, 0); // only declare once
  setRemainingSubmits(nextRemaining);

  // Update progress immediately
  if (levelKeyRef.current) {
    const packId = params?.packId || 'daily';
    updateLevelProgress(packId, levelKeyRef.current, { guessesRemaining: nextRemaining });
  }

  const userAnswer = getSortedWords();
  const isCorrect = verifyOrder(userAnswer, currentQuote.words);

  const { updatedPositions, connectedPairs } = evaluateWordPositions(
    wordPositions,
    currentQuote.words,
    LAYOUT
  );
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

  // --------- UPDATE QUOTE STATE ----------
  if (isCorrect) {
    updateQuoteState('completed', nextRemaining);
  } else if (nextRemaining === 0) {
    updateQuoteState('failed', nextRemaining); // persist 0 guesses
  } else {
    updateQuoteState('started', nextRemaining);
  }

  if (isCorrect) {
    setSubmitLocked(true);
    const guessesUsed = MAX_SUBMITS - nextRemaining;
    const performance =
      guessesUsed === 1 ? 'Perfect!' :
      guessesUsed <= 2 ? 'Excellent!' :
      guessesUsed <= 3 ? 'Good!' :
      'A win is a win...';
    setFinalStats({
      fullQuote: currentQuote.words.join(' '),
      quoteAttribution: currentQuote.attribution,
      guessesUsed,
      performance,
    });
    setHasWon(true);
    setTimeout(() => {
      Animated.timing(submitScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setSubmitText('Congratulations!');
        submitScale.setValue(0.5);
        Animated.spring(submitScale, {
          toValue: 1,
          friction: 15,
          tension: 60,
          useNativeDriver: true,
        }).start();
      });
    }, 150);
    setTimeout(() => setShowVictoryScreen(true), ANIMATION.HINT_LOCK_DURATION || 1700);
  } else if (nextRemaining <= 0) {
    setSubmitLocked(true);
  }

}, [remainingSubmits, currentQuote, getSortedWords, wordPositions, submitLocked]);


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
        <SubmitButton
          onPress={handleSubmit}
          isLocked={submitLocked}
          text={currentSubmitText}
          scale={submitScale}
        />

      </View>

      {hasWon && finalStats && showVictoryScreen && (
        <VictoryScreen
          fullQuote={finalStats.fullQuote}
          quoteAttribution={finalStats.quoteAttribution}
          guessesUsed={finalStats.guessesUsed}
          performance={finalStats.performance}
          params={params}              // <-- pass params here
          onClose={() => {
            setFinalStats(null);
            setShowVictoryScreen(false);
          }}
          onGoHome={() => {
            if (params.mode === 'pack' && params.packId) {
              navigation.navigate('PackDetail', { packId: params.packId });
            } else {
              navigation.navigate('Home');
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20,  backgroundColor: '#fffae9', },
  orderText: { marginTop: 0, fontSize: 18, fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', color: '#333', textAlign: 'center' },
  bottomRow: { position: 'absolute', bottom: 65, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  lockedMessageContainer: { position: 'absolute', top: '45%', left: '10%', right: '10%', backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: 12, borderRadius: 8, alignItems: 'center', zIndex: 100 },
  lockedMessageText: { color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center' },
  loadingText: { fontSize: 18, textAlign: 'center', marginTop: 100, color: '#666' },
});
