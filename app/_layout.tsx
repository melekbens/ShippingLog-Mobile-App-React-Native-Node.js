// _layout.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './HomeScreen';
import DemoAppointment from './DemoAppointment';
import RegistrationForm from './RegistrationForm';
import ConnectionRequest from './ConnectionRequest';

export type RootStackParamList = {
  Home: undefined;
  DemoAppointment: undefined;
  RegistrationForm: undefined;
  ConnectionRequest: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Layout() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#273e64' },
        headerTintColor: '#ffc833',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Stack.Screen name="DemoAppointment" component={DemoAppointment} options={{ title: 'Rendez-vous Démo' }} />
      <Stack.Screen name="RegistrationForm" component={RegistrationForm} options={{ title: 'Inscription' }} />
      <Stack.Screen name="ConnectionRequest" component={ConnectionRequest} options={{ title: 'Connexion Société' }} />
    </Stack.Navigator>
  );
}
