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

export default function HomeScreen() {
  const navigation = useNavigation();

  const handlePlayDaily = () => {
    navigation.navigate('Game', { mode: 'daily' });
  };

  const handlePlayPack = (packId) => {
    navigation.navigate('Game', { mode: 'pack', packId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Quote</Text>
      <TouchableOpacity style={styles.dailyButton} onPress={handlePlayDaily}>
        <Text style={styles.dailyButtonText}>Play Today's Quote</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Puzzle Packs</Text>
      <ScrollView contentContainerStyle={styles.packsContainer}>
        {PUZZLE_PACKS.map((pack) => (
          <TouchableOpacity
            key={pack.id}
            style={styles.packButton}
            onPress={() => handlePlayPack(pack.id)}
          >
            <Text style={styles.packTitle}>{pack.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dailyButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  dailyButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  packsContainer: {
    paddingBottom: 40,
  },
  packButton: {
    backgroundColor: '#eee',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  packTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});
