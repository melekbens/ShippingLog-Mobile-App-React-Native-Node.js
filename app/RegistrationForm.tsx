import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Animated } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import { API_URL } from './dbconfig';



export default function DeliveryCompanyRegistration() {
  const [companyName, setCompanyName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [address, setAddress] = useState('');
  const [numCouriers, setNumCouriers] = useState('');
  const [numCouriersError, setNumCouriersError] = useState('');
  const [availableZones, setAvailableZones] = useState<string[]>([]);
  const [chosenZones, setChosenZones] = useState<string[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectAllZones, setSelectAllZones] = useState(true);
  const [zoneSearchQuery, setZoneSearchQuery] = useState('');


  // Fetch zones from backend zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await fetch(`${API_URL}/api/zones`);
        if (!response.ok) throw new Error('Erreur lors du chargement des zones');
        const zones = await response.json();
        setAvailableZones(zones.map((z: any) => z.nom_zone)); // Adjust field name to match your DB
      } catch (err) {
        console.error(err);
        Alert.alert('Erreur', 'Impossible de récupérer les zones de livraison.');
      }
    };
    fetchZones();
  }, []);
// Filter available zones based on search query
  const filteredZones = availableZones.filter(zone =>
  zone.toLowerCase().includes(zoneSearchQuery.toLowerCase())
);


  const addZone = (zone: string) => {
    setChosenZones([...chosenZones, zone]);
    setAvailableZones(prev => prev.filter(z => z !== zone));
  };

  const removeZone = (zone: string) => {
    setChosenZones(prev => prev.filter(z => z !== zone));
    setAvailableZones(prev => [...prev, zone].sort());
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocuments(prev => [...prev, ...result.assets]);
      }
    } catch (err) {
      console.log('Document pick error:', err);
    }
  };

  const removeDocument = (uri: string) => {
    setDocuments(prev => prev.filter(doc => doc.uri !== uri));
  };
  
  const validatePhone = (phone: string) => {
  const regex = /^\d{8}$/; // exactly 8 digits
  return regex.test(phone);
};

const validateEmail = (text: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);


// submit handler
  const handleSubmit = async () => {
  if (!companyName || !managerName || !email || !phone || !address || !numCouriers || (!selectAllZones && chosenZones.length === 0)) {
    Alert.alert('Erreur', 'Veuillez remplir tous les champs et sélectionner au moins une zone.');
    if (numCouriers === '0') setNumCouriersError('Le nombre de livreurs doit être supérieur à 0');
    return;
  }

  if (numCouriers === '0') {
    setNumCouriersError('Le nombre de livreurs doit être supérieur à 0');
    return;
  }

  setNumCouriersError('');

  if (!validateEmail(email)) {
  setEmailError('Format email invalide');
  return;
} else setEmailError('');

if (!validatePhone(phone)) {
  setPhoneError('Le téléphone doit avoir 8 chiffres');
  return;
} else setPhoneError('');


  try {
    // Fetch all zones with IDs if "Toute la Tunisie" is selected
    let zoneIdsToSubmit: number[] = [];
    if (selectAllZones) {
      const response = await fetch(`${API_URL}/api/zones`);
      const allZones = await response.json();
      zoneIdsToSubmit = allZones.map((z: any) => z.id_zone);
    } else {
      // Map chosenZones names to IDs
      const response = await fetch(`${API_URL}/api/zones`);
      const allZones = await response.json();
      zoneIdsToSubmit = allZones
        .filter((z: any) => chosenZones.includes(z.nom_zone))
        .map((z: any) => z.id_zone);
    }




    // Prepare FormData for submission
const formData = new FormData();
formData.append('nom_societe', companyName);
formData.append('nom_responsable', managerName);
formData.append('email', email);
formData.append('telephone', phone);
formData.append('adresse', address);
formData.append('nombre_livreurs', numCouriers.toString());
formData.append('selectAllZones', selectAllZones.toString());
formData.append('selectedZones', JSON.stringify(zoneIdsToSubmit));

// Append documents
documents.forEach((doc, idx) => {
  formData.append('documents', {
    uri: doc.uri,
    name: doc.name,
    type: doc.mimeType || 'application/octet-stream',
  } as any);
});


//form submit
const res = await fetch(`${API_URL}/api/inscription`, {
  method: 'POST',
  body: formData, 
});

const data = await res.json();

if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'enregistrement.');

Alert.alert('Succès', 'Société enregistrée avec succès !');



// Reset form fields
setCompanyName('');
setManagerName('');
setEmail('');
setPhone('');
setAddress('');
setNumCouriers('');
setChosenZones([]);
setSelectAllZones(true);
setDocuments([]);
setEmailError('');
setPhoneError('');
setNumCouriersError('');

// Refetch zones to reset availableZones
const fetchZones = async () => {
  try {
    const response = await fetch(`${API_URL}/api/zones`);
    if (!response.ok) throw new Error('Erreur lors du chargement des zones');
    const zones = await response.json();
    setAvailableZones(zones.map((z: any) => z.nom_zone));
  } catch (err) {
    console.error(err);
    Alert.alert('Erreur', 'Impossible de récupérer les zones de livraison.');
  }
};
fetchZones();

  } catch (err: any) {
    console.error('Submission error:', err);
    Alert.alert('Erreur', err.message);
  }
};



  // Render the form

  return (
  <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
    <Text style={styles.title}>Inscription Société de Livraison</Text>
    <View style={styles.formContainer}>

      {/* Company Name */}
      <View style={styles.inputWrapper}>
        <MaterialIcons name="business" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Nom de la société *"
          value={companyName}
          placeholderTextColor="#999"
          onChangeText={setCompanyName}
        />
      </View>

      {/* Manager Name */}
      <View style={styles.inputWrapper}>
        <MaterialIcons name="person" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholderTextColor="#999"
          placeholder="Nom du responsable *"
          value={managerName}
          onChangeText={setManagerName}
        />
      </View>

      {/* Email */}
      <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
        <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholderTextColor="#999"
          placeholder="Email *"
          value={email}
          onChangeText={text => {
            setEmail(text);
            if (!validateEmail(text)) setEmailError('Format email invalide');
            else setEmailError('');
          }}
          keyboardType="email-address"
        />
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      {/* Phone */}
      <View style={[styles.inputWrapper, phoneError && styles.inputWrapperError]}>
        <FontAwesome name="phone" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholderTextColor="#999"
          placeholder="Téléphone *"
          value={phone}
          onChangeText={text => {
            setPhone(text);
            if (!validatePhone(text)) setPhoneError('Le téléphone doit avoir 8 chiffres');
            else setPhoneError('');
          }}
          keyboardType="number-pad"
        />
      </View>
      {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

      {/* Address */}
      <View style={styles.inputWrapper}>
        <MaterialIcons name="location-on" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholderTextColor="#999"
          placeholder="Adresse *"
          value={address}
          onChangeText={setAddress}
        />
      </View>

      {/* Number of Couriers */}
      <View style={[styles.inputWrapper, numCouriers === '0' && styles.inputWrapperError]}>
        <MaterialIcons name="people" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholderTextColor="#999"
          placeholder="Nombre de livreurs *"
          value={numCouriers}
          onChangeText={text => {
            setNumCouriers(text);
            if (text === '0') setNumCouriersError('Le nombre de livreurs doit être supérieur à 0');
            else setNumCouriersError('');
          }}
          keyboardType="number-pad"
        />
      </View>
      {numCouriersError ? <Text style={styles.errorText}>{numCouriersError}</Text> : null}

<View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 20 }} />


{/* Delivery Zones */}
<Text style={styles.mainTitle}>Zones de livraison</Text>

{/* Toggle */}
<View style={styles.toggleWrapper}>
  <View style={styles.toggleBackground} />
  <Animated.View
    style={[
      styles.toggleIndicator,
      { width: '50%', left: selectAllZones ? 0 : '50%' },
    ]}
  />
  <TouchableOpacity style={styles.toggleTouchArea} onPress={() => setSelectAllZones(true)}>
    <Text style={[styles.toggleText, selectAllZones && styles.toggleTextSelected]}>Toute la Tunisie</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.toggleTouchArea} onPress={() => setSelectAllZones(false)}>
    <Text style={[styles.toggleText, !selectAllZones && styles.toggleTextSelected]}>Choisir les zones</Text>
  </TouchableOpacity>
</View>

{/* Available & Selected Zones */}
{!selectAllZones && (
  <>
  {/* Available Zones (scrollable list) with Search */}
<Text style={styles.subtitle}>Sélectionnez vos zones *</Text>

{/* Search Bar */}
<View style={styles.searchContainer}>
  <Feather name="search" size={18} color="#999" style={{ marginLeft: 8 }} />
  <TextInput
    style={styles.searchInput}
    placeholder="Rechercher une zone..."
    placeholderTextColor="#999"
    value={zoneSearchQuery}
    onChangeText={setZoneSearchQuery}
  />
</View>

<ScrollView
  style={{
    maxHeight: 250,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  }}
  contentContainerStyle={{ paddingVertical: 5 }}
  keyboardShouldPersistTaps="handled"
  nestedScrollEnabled={true}
>
  {filteredZones.length > 0 ? (
    filteredZones.map((zone, idx) => (
      <TouchableOpacity
        key={idx}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 15,
          borderBottomWidth: idx === filteredZones.length - 1 ? 0 : 1,
          borderBottomColor: '#eee',
        }}
        onPress={() => addZone(zone)}
      >
        <Text style={{ fontSize: 15, color: '#273e64' }}>{zone}</Text>
      </TouchableOpacity>
    ))
  ) : (
    <Text style={{ textAlign: 'center', color: '#999', paddingVertical: 12 }}>
      Aucune zone trouvée
    </Text>
  )}
</ScrollView>


    {/* Selected Zones (bubbles) */}
    {chosenZones.length > 0 && (
      <>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={styles.subtitle}>Zones sélectionnées</Text>
          <TouchableOpacity
  style={{
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#dd4345ff',
    borderRadius: 12,
  }}
  onPress={() => {
    setAvailableZones(prev => [...prev, ...chosenZones].sort());
    setChosenZones([]);
  }}
>
  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Tout désélectionner</Text>
</TouchableOpacity>

        </View>

        <View style={styles.bubbleContainer}>
          {chosenZones.map((zone, idx) => (
            <View key={idx} style={styles.bubble}>
              <TouchableOpacity onPress={() => removeZone(zone)}>
                <Text style={styles.bubbleText}>× {zone}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </>
    )}
  </>
)}



  {/* file upload section */}
<Text style={[styles.mainTitle, { marginTop: 30 }]}>Documents à joindre</Text>

<TouchableOpacity
  style={[styles.toggleBubble, { 
    alignSelf: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 30, 
    borderRadius: 30, 
    marginBottom: 10 
  }]}
  onPress={pickDocument}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Ionicons name="document-outline" size={22} color="#273e64" style={{ marginRight: 8 }} />
    <Text style={[styles.toggleText, { fontWeight: '700', fontSize: 16 }]}>Ajouter un document</Text>
  </View>
</TouchableOpacity>

<View style={styles.docContainer}>
  {documents.map((doc, idx) => (
    <View key={idx} style={styles.docBubble}>
      <Ionicons name="document-text-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
      <Text style={styles.docText} numberOfLines={1} ellipsizeMode="tail">{doc.name}</Text>
      <TouchableOpacity onPress={() => removeDocument(doc.uri)}>
        <Ionicons name="close-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  ))}
</View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Envoyer la demande</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  formContainer: {
    backgroundColor: '#f7f7f7',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#273e64', textAlign: 'center', marginBottom: 20 },

  // Inputs
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inputWrapperError: {
    borderColor: 'red',
    borderWidth: 1.5,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14 },
  inputError: { borderColor: 'red', borderWidth: 1.5 },
  errorText: { color: 'red', fontSize: 12, marginBottom: 10 },

  // Labels
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#273e64' },

  // Toggle Zones
  toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  toggleBubble: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },


  // titles for zones
  mainTitle: { fontSize: 20, fontWeight: '700', color: '#273e64', marginBottom: 12 },
subtitle: { fontSize: 14, fontWeight: '500', color: '#555', marginBottom: 6 },


  // Upload / Submit
  uploadBtn: { backgroundColor: '#273e64', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  submitBtn: { backgroundColor: '#273e64', paddingVertical: 15, borderRadius: 15, marginTop: 10,marginBottom:20, alignItems: 'center' },
  submitText: { color: '#ffc833', fontSize: 18, fontWeight: '700' },

  // Documents
  docContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  docBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffc833',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 25,
    marginRight: 8,
    marginBottom: 8,
    maxWidth: 200,
  },
  docText: { color: '#273e64', fontWeight: '600', flexShrink: 1 },
  uploadBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  toggleWrapper: {
  position: 'relative',
  flexDirection: 'row',
  height: 45,
  marginBottom: 20,
  borderRadius: 25,
  backgroundColor: '#e0e0e0',
  overflow: 'hidden',
},
toggleBackground: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: '#e0e0e0',
},
toggleIndicator: {
  position: 'absolute',
  width: '50%',
  height: '100%',
  backgroundColor: '#ffc833',
  borderRadius: 25,
  zIndex: 0,
},
toggleTouchArea: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
},
toggleText: { fontSize: 14, fontWeight: '600', color: '#555' },
toggleTextSelected: { color: '#273e64' },
bubbleContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
bubble: { backgroundColor: '#ffc833', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginRight: 8, marginBottom: 8 },
bubbleText: { color: '#273e64', fontWeight: '600' },

dropdown: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 12,
  marginTop: 8,
  backgroundColor: "#fff",
},
dropdownText: { fontSize: 16, color: "#273e64" },
dropdownArrow: { fontSize: 16, color: "#999" },
dropdownList: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  marginTop: 4,
  backgroundColor: "#fff",
},
dropdownItem: {
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},
dropdownItemText: { fontSize: 16, color: "#273e64" },
chipContainer: { flexDirection: "row", flexWrap: "wrap", paddingVertical: 8 },
chip: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#273e64",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 20,
  marginRight: 8,
  marginBottom: 8,
},
chipText: { color: "#fff", marginRight: 6 },
chipRemove: { color: "#fff", fontWeight: "bold" },

searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f0f0f0',
  borderRadius: 25,
  paddingHorizontal: 10,
  marginBottom: 10,
  height: 45,
},
searchInput: {
  flex: 1,
  marginLeft: 10,
  fontSize: 16,
  color: '#333',
}
});

