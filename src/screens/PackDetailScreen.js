import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { PUZZLE_PACKS } from '../utils/packs';
import { loadProgress } from '../utils/ProgressStorage';

const { width } = Dimensions.get('window');
const QUOTES_PER_PAGE = 40;

export default function PackDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { packId } = route.params;

  const pack = PUZZLE_PACKS.find(p => p.id === packId);
  const quotes = pack?.quoteFile || [];

  const [quoteStatus, setQuoteStatus] = useState({});

  // Reload statuses whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadStatuses = async () => {
        const progress = await loadProgress();
        const packProgress = progress.packs?.[packId] || {};
        const statuses = {};

        Object.entries(packProgress).forEach(([levelKey, data]) => {
          const index = parseInt(levelKey.split('_')[1], 10);
          statuses[index] = data.status || 'not_started';
        });

        setQuoteStatus(statuses);
      };
      loadStatuses();
    }, [packId])
  );

  // Break quotes into pages
  const pages = [];
  for (let i = 0; i < quotes.length; i += QUOTES_PER_PAGE) {
    pages.push(quotes.slice(i, i + QUOTES_PER_PAGE));
  }

  const handlePlayQuote = (quoteIndex) => {
    navigation.navigate('Game', {
      newGame: true,
      mode: 'pack',
      packId,
      quoteIndex,
    });
  };

  const getButtonColor = (index) => {
    switch (quoteStatus[index]) {
      case 'completed': return '#6fcf97';
      case 'started': return '#f2c94c';
      case 'failed': return '#eb5757';
      case 'not_started':
      default: return '#d2d8ffff';
    }
  };

  const renderPage = ({ item, index: pageIndex }) => {
    const startIndex = pageIndex * QUOTES_PER_PAGE;

    return (
      <View style={[styles.page, { width }]}>
        <View style={styles.grid}>
          {item.map((quote, idx) => {
            const globalIndex = startIndex + idx;
            return (
              <TouchableOpacity
                key={globalIndex}
                style={[styles.quoteButton, { backgroundColor: getButtonColor(globalIndex) }]}
                onPress={() => handlePlayQuote(globalIndex)}
              >
                <Text style={styles.buttonText}>{globalIndex + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{pack?.title}</Text>
      <FlatList
        data={pages}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffae9', paddingTop: 20 },
  title: { fontSize: 22, fontWeight: '700', fontFamily: 'serif', marginBottom: 16, textAlign: 'center' },
  page: { flex: 1, padding: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  quoteButton: { width: 60, height: 60, margin: 6, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 20, fontWeight: '600', color: '#000000ff' },
});
