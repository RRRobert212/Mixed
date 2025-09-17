// src/components/HeaderHomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Info, Settings } from 'lucide-react-native';

export default function HeaderHomeScreen({ navigation }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Title</Text>
      <View style={styles.icons}>
        <TouchableOpacity onPress={() => navigation.navigate('Info')} style={styles.iconButton}>
          <Info size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={[styles.icon, styles.iconButton]}>
          <Settings size={24} color="black" />
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
    backgroundColor: '#fffae9',
  },
  title: {
    fontSize: 32,
    fontFamily: 'serif',
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    marginTop: 30
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
  iconButton: {
    padding: 4,
  },
});