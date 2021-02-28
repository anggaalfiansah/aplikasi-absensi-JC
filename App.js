import React, {useEffect, useState} from 'react';
import * as eva from '@eva-design/eva';
import {ApplicationProvider} from '@ui-kitten/components';
import LoginScreen from './src/Screen/LoginScreen';
import HomeScreen from './src/Screen/HomeScreen';
import CheckInScreen from './src/Screen/CheckInScreen';
import IzinScreen from './src/Screen/IzinScreen';
import HistoryScreen from './src/Screen/HistoryScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {PermissionsAndroid, Platform} from 'react-native';
import auth from '@react-native-firebase/auth';
import CheckInResultScreen from './src/Screen/CheckInResultScreen';

const Stack = createStackNavigator();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const authStateChanged = (users) => {
    setUser(users);
    if (loading) {
      setLoading(false);
    }
  };

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        // If Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        alert('Write permission err', err);
      }
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    requestPermission();

    const subscriber = auth().onAuthStateChanged(authStateChanged);
    return subscriber;
  });

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen
                name="Home"
                options={{
                  title: 'Home',
                  headerTitleStyle: {alignSelf: 'center'},
                }}>
                {(props) => <HomeScreen {...props} extraData={user} />}
              </Stack.Screen>
              <Stack.Screen name="Check In" component={CheckInScreen} />
              <Stack.Screen name="Check In Result" component={CheckInResultScreen} />
              <Stack.Screen name="Izin" component={IzinScreen} />
              <Stack.Screen name="History" component={HistoryScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" options={{
                title: 'Selamat Datang Di Aplikasi Absensi',
                headerTitleStyle: {alignSelf: 'center'},
              }} component={LoginScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ApplicationProvider>
  );
};

export default App;
