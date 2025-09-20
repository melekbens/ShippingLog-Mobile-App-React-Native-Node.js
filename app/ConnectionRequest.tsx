import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import { API_URL } from './dbconfig';

export default function ConnectionAPIRequest() {
  const [companyName, setCompanyName] = useState('');
  const [techEmail, setTechEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [techPhone, setTechPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [apiTypesSelected, setApiTypesSelected] = useState<string[]>([]);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiTypes, setApiTypes] = useState<{ id_api: number; nom: string }[]>([]);
  const [partners, setPartners] = useState<{ societe_id: number; nom_societe: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch API types
  useEffect(() => {
    const fetchApiTypes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/api_type`);
        const data = await response.json();
        setApiTypes(data);
      } catch (error) {
        console.error('Erreur récupération API types:', error);
      }
    };
    fetchApiTypes();
  }, []);

  // Fetch partners
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch(`${API_URL}/api/societes/validated`);
        const data = await response.json();
        setPartners(data);
      } catch (error) {
        console.error('Erreur récupération sociétés partenaires:', error);
      }
    };
    fetchPartners();
  }, []);

  // Filter partners for search
  const filteredPartners = partners.filter(partner =>
    partner.nom_societe.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePartner = (partner: string) => {
    if (selectedPartners.includes(partner)) {
      setSelectedPartners(selectedPartners.filter(p => p !== partner));
    } else {
      setSelectedPartners([...selectedPartners, partner]);
    }
  };

  const toggleApiType = (id: string) => {
    if (apiTypesSelected.includes(id)) {
      setApiTypesSelected(apiTypesSelected.filter(t => t !== id));
    } else {
      setApiTypesSelected([...apiTypesSelected, id]);
    }
  };

  const validatePhone = (phone: string) => /^\d{8}$/.test(phone);
  const validateEmail = (text: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

  const handleSubmit = async () => {
    if (!companyName || !techEmail || !techPhone || apiTypesSelected.length === 0 || selectedPartners.length === 0) {
      Alert.alert(
        'Erreur',
        'Veuillez remplir tous les champs et sélectionner au moins un type d\'API et un partenaire.'
      );
      return;
    }

    if (!validateEmail(techEmail)) {
      setEmailError('Format email invalide');
      return;
    } else setEmailError('');

    if (!validatePhone(techPhone)) {
      setPhoneError('Le téléphone doit avoir 8 chiffres');
      return;
    } else setPhoneError('');

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/demande_api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          societe_requerente: companyName,
          email_technique: techEmail,
          telephone_technique: techPhone,
          apiTypes: apiTypesSelected.map(id => Number(id)),
          partenaires: selectedPartners.map(id => Number(id))
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erreur serveur');

      Alert.alert('Demande envoyée !', 'Votre demande a été enregistrée avec succès.');

      setCompanyName('');
      setTechEmail('');
      setTechPhone('');
      setApiTypesSelected([]);
      setSelectedPartners([]);
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi de la demande :', err);
      Alert.alert('Erreur', err.message || 'Impossible d\'envoyer la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Demande de Connexion API</Text>

      <View style={styles.form}>
        {/* Company Input */}
        <View style={styles.inputWrapper}>
          <MaterialIcons name="business" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { backgroundColor: 'transparent' }]}
            placeholder="Nom de la société *"
            placeholderTextColor="#999"
            value={companyName}
            onChangeText={setCompanyName}
          />
        </View>

        {/* Email Input */}
        <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
          <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { backgroundColor: 'transparent' }]}
            placeholder="Email *"
            placeholderTextColor="#999"
            value={techEmail}
            onChangeText={text => {
              setTechEmail(text);
              if (!validateEmail(text)) setEmailError('Format email invalide');
              else setEmailError('');
            }}
            keyboardType="email-address"
          />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        {/* Phone Input */}
        <View style={[styles.inputWrapper, phoneError && styles.inputWrapperError]}>
          <FontAwesome name="phone" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { backgroundColor: 'transparent' }]}
            placeholderTextColor="#999"
            placeholder="Téléphone *"
            value={techPhone}
            onChangeText={text => {
              setTechPhone(text);
              if (!validatePhone(text)) setPhoneError('Le téléphone doit avoir 8 chiffres');
              else setPhoneError('');
            }}
            keyboardType="number-pad"
          />
        </View>
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

        {/* API Chips */}
        <Text style={styles.label}>Type(s) d'API *</Text>
        <View style={styles.apiChipsContainer}>
          {apiTypes.map(api => {
            const selected = apiTypesSelected.includes(api.id_api.toString());
            return (
              <TouchableOpacity
                key={api.id_api}
                style={[styles.apiChip, selected && styles.apiChipSelected]}
                onPress={() => toggleApiType(api.id_api.toString())}
                activeOpacity={0.8}
              >
                <Text style={selected ? styles.apiChipTextSelected : styles.apiChipText}>
                  {api.nom}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Partner Section */}
        <View style={{ marginTop: 6 }}>
          <Text style={styles.label}>Sociétés partenaires *</Text>

          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une société..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Partner List */}
          <ScrollView
            style={styles.partnerScrollContainer}
            contentContainerStyle={{ padding: 10 }}
            keyboardShouldPersistTaps="handled"
          >
            {filteredPartners.map((partner) => {
              const selected = selectedPartners.includes(partner.societe_id.toString());
              return (
                <TouchableOpacity
                  key={partner.societe_id}
                  style={[styles.partnerCard, selected && styles.partnerCardSelected]}
                  onPress={() => togglePartner(partner.societe_id.toString())}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.partnerText, selected && { fontWeight: '700' }]}>{partner.nom_societe}</Text>
                  {selected && (
                    <View style={styles.checkmark}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, (loading || !companyName || !techEmail || !techPhone || apiTypesSelected.length === 0) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading || !companyName || !techEmail || !techPhone || apiTypesSelected.length === 0}
        >
          {loading ? <ActivityIndicator color="#ffc833" /> : <Text style={styles.submitText}>Envoyer la demande</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', color: '#273e64', textAlign: 'center', marginBottom: 25 },
  form: { backgroundColor: '#f7f7f7', borderRadius: 15, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ccc' },
  inputWrapperError: { borderColor: 'red', borderWidth: 1.5 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14 },

  label: { fontSize: 16, fontWeight: '500', marginBottom: 6, color: '#273e64' },
  errorText: { color: 'red', fontSize: 12, marginBottom: 10 },

  apiChipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  apiChip: { borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 15, marginRight: 10, marginBottom: 10, backgroundColor: '#fff' },
  apiChipSelected: { backgroundColor: '#ffdd66', borderColor: '#ffc833', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  apiChipText: { color: '#273e64', fontWeight: '500' },
  apiChipTextSelected: { color: '#273e64', fontWeight: '700' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 15, paddingHorizontal: 12, height: 45, marginBottom: 8 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },

  partnerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, marginBottom: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, backgroundColor: '#fff' },
  partnerCardSelected: { borderColor: '#ffc833', backgroundColor: '#fff7e6', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  partnerText: { fontSize: 16 },
  checkmark: { backgroundColor: '#ffc833', borderRadius: 13, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  partnerScrollContainer: { borderWidth: 1, borderColor: '#ffc833', borderRadius: 15, marginTop: 4, maxHeight: 180, backgroundColor: '#fff' },

  submitBtn: { backgroundColor: '#273e64', paddingVertical: 15, borderRadius: 15, marginTop: 20, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#8a9bb0' },
  submitText: { color: '#ffc833', fontSize: 18, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
});
