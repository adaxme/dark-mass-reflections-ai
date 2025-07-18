import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {LanguageProvider} from './contexts/LanguageContext';
import ReadingsScreen from './screens/ReadingsScreen';
import SaintScreen from './screens/SaintScreen';
import HomilyScreen from './screens/HomilyScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <StatusBar barStyle="light-content" backgroundColor="#141414" />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({route}) => ({
              tabBarIcon: ({focused, color, size}) => {
                let iconName = '';

                if (route.name === 'Readings') {
                  iconName = 'menu-book';
                } else if (route.name === 'Saint') {
                  iconName = 'favorite';
                } else if (route.name === 'Homily') {
                  iconName = 'chat';
                }

                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#FFD700',
              tabBarInactiveTintColor: '#888',
              tabBarStyle: styles.tabBar,
              headerStyle: styles.header,
              headerTintColor: '#FFD700',
              headerTitleStyle: styles.headerTitle,
            })}>
            <Tab.Screen 
              name="Readings" 
              component={ReadingsScreen}
              options={{title: 'Daily Readings'}}
            />
            <Tab.Screen 
              name="Saint" 
              component={SaintScreen}
              options={{title: 'Saint of the Day'}}
            />
            <Tab.Screen 
              name="Homily" 
              component={HomilyScreen}
              options={{title: 'Spiritual Reflection'}}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1F1F1F',
    borderTopColor: '#333',
    borderTopWidth: 1,
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
  header: {
    backgroundColor: '#141414',
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  headerTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;