import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Entypo, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  DemoAppointment: undefined;
  RegistrationForm: undefined;
  ConnectionRequest: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1 }}>

      {/* Main content */}
      <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20 }}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo.png')}
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('DemoAppointment')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="event-available" size={48} color="#ffc833" />
            <Text style={styles.cardTitle}>Rendez-vous Démo</Text>
            <Text style={styles.cardDesc}>30 min pour découvrir ShippingLog</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('RegistrationForm')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="clipboard-list" size={48} color="#ffc833" />
            <Text style={styles.cardTitle}>Inscription</Text>
            <Text style={styles.cardDesc}>Rejoignez ShippingLog</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('ConnectionRequest')}
            activeOpacity={0.8}
          >
            <Entypo name="network" size={48} color="#ffc833" />
            <Text style={styles.cardTitle}>Demande de connexion API</Text>
            <Text style={styles.cardDesc}>Intégrez votre système</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 270, height: 90, marginBottom: 3 },
  slogan: { fontSize: 18, color: '#273e64', fontWeight: '600', fontStyle: 'italic' },
  cardsContainer: { justifyContent: 'space-between' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height:3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  cardTitle: { marginTop: 15, fontSize: 20, fontWeight: '700', color: '#273e64' },
  cardDesc: { marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' },
});
