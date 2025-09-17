// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import HeaderGameScreen from './src/components/HeaderGameScreen';
import HeaderHomeScreen from './src/components/HeaderHomeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SettingsScreen from './src/screens/SettingsScreen';
import InfoScreen from './src/screens/InfoScreen';
import PackDetailScreen from './src/screens/PackDetailScreen';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              header: () => <HeaderHomeScreen navigation={navigation} />,
            })}
          />
          <Stack.Screen
            name="Game"
            options={({ navigation }) => ({
              gestureEnabled: false,
              presentation: 'card',
              fullScreenGestureEnabled: false,
              header: () => (
                <HeaderGameScreen navigation={navigation} />
              ),
            })}
          >
            {(props) => <GameScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen
            name="PackDetail"
            component={PackDetailScreen}
            options={({ navigation }) => ({
              title: 'Puzzle Pack',
              headerStyle: { backgroundColor: '#fffae9' },
              headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Home')}
                  style={{ marginLeft: 16, padding: 4 }}
                >
                  <ChevronLeft size={24} color="black" />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Info" component={InfoScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}