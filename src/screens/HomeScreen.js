// src/screens/HomeScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PUZZLE_PACKS } from '../utils/packs';
import { Ionicons } from '@expo/vector-icons'; // or from 'react-native-vector-icons/Ionicons'

const STREAK_COUNT = 3; // Dynamically calculate in future

export default function HomeScreen() {
  const navigation = useNavigation();

  const handlePlayDaily = () => {
    navigation.navigate('Game', {newGame: true}, { mode: 'daily' });
  };

  const handlePlayPack = (packId) => {
    navigation.navigate('Game', {newGame: true}, { mode: 'pack', packId });
  };

  const handlePastQuotes = () => {
    navigation.navigate('PastQuotes');
  };

  const handleInfo = () => {
    navigation.navigate('HowToPlay');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <ScrollView style={styles.container}>

      {/* Welcome Message & Subscribe */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeText}>
          <Text style={{ fontWeight: 'bold' , fontSize:22,}}>Welcome! </Text>
          {'\n\n'}
          Subscribe for unlimited puzzle packs and an ad free experience.
        </Text>
        <TouchableOpacity style={styles.subscribeButton}>
          <Text style={styles.subscribeButtonText}>Subscribe</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Quote Card */}
      <TouchableOpacity style={styles.dailyCard} onPress={handlePlayDaily}>
        <Text style={styles.cardTitle}>Today's Quote</Text>
        <Text style={styles.streakText}>Streak: {STREAK_COUNT}</Text>
      </TouchableOpacity>

      {/* Past Quotes */}
      <TouchableOpacity style={styles.pastQuotesCard} onPress={handlePastQuotes}>
        <Text style={styles.cardTitle}>Past Quotes</Text>
      </TouchableOpacity>

      {/* Puzzle Packs */}
      <Text style={styles.sectionTitle}>Puzzle Packs</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.puzzleScroll}
      >
        {PUZZLE_PACKS.map((pack) => (
          <TouchableOpacity
            key={pack.id}
            style={styles.packCard}
            onPress={() => handlePlayPack(pack.id)}
          >
            <Text style={styles.packTitle}>{pack.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffae9',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeBox: {
    backgroundColor: '#fffae9',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center'
  },
  subscribeButton: {
    backgroundColor: '#5e5e5eff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dailyCard: {
    backgroundColor: '#95e198',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  streakText: {
    marginTop: 8,
    fontSize: 16,
    color: '#333',
  },
  pastQuotesCard: {
    backgroundColor: '#e1d895',
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  puzzleScroll: {
    paddingBottom: 40,
  },
  packCard: {
    backgroundColor: '#959ce1',
    width: 120,
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  packTitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
