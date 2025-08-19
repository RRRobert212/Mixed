// src/screens/PackDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PUZZLE_PACKS } from '../utils/packs';

const { width } = Dimensions.get('window');
const QUOTES_PER_PAGE = 42;

export default function PackDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { packId } = route.params;

  const pack = PUZZLE_PACKS.find(p => p.id === packId);
  const quotes = pack?.quoteFile || [];

  // Break quotes into pages of 42
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
                style={styles.quoteButton}
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
  container: {
    flex: 1,
    backgroundColor: '#fffae9',
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  page: {
    flex: 1,
    padding: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quoteButton: {
    backgroundColor: '#959ce1',
    width: 60,
    height: 60,
    margin: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
