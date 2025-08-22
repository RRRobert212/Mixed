// src/components/HeaderGameScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HeaderGameScreen({ navigation }) {
  return (
    <View style={styles.header}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backButton, { padding: 12 }]}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Title</Text>

      {/* Info and Settings icons */}
      <View style={styles.icons}>
        <TouchableOpacity onPress={() => navigation.navigate('Info')}>
          <Ionicons name="information-circle-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.icon}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fffbf1ff',
  },
  title: {
    fontSize: 32,
    fontFamily: 'serif',
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    marginTop: 30,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    marginTop: 30,
    zIndex: 1,
  },
  icons: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    gap: 10,
    color: 'black',
    marginTop: 30,
  },
  icon: {
    marginLeft: 5,
  },
});
