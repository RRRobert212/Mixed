// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import HeaderGameScreen from './src/components/HeaderGameScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
        name="Game" 
        component={GameScreen} 
        options={{
          gestureEnabled: false,
          presentation: 'card',
          fullScreenGestureEnabled: false,
          header: (props) => (
            <HeaderGameScreen
              title="Game"
              onSettingsPress={() => {
                // Navigate to settings or open modal
                props.navigation.navigate('Settings');
              }}
              onInfoPress={() => {
                // Show info modal or screen
                props.navigation.navigate('Info');
              }}
            />
          ),
        }}>
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
