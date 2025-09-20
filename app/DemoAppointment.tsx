import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from './dbconfig';

export default function DemoAppointment() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Available times
  const availableTimes: string[] = [];
  for (let hour = 9; hour <= 16; hour++) {
    for (let min = 0; min < 60; min += 30) {
      if (hour === 16 && min > 30) continue;
      availableTimes.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }

  // Validators
  const handlePhoneChange = (text: string) => {
    setPhone(text);
    setPhoneError(text.length !== 8 || !/^\d+$/.test(text) ? 'Entrer un numéro de téléphone valide *' : '');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(!emailRegex.test(text) ? 'Entrer un email valide *' : '');
  };

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    if (!selected) return;

    const day = selected.getDay();
    if (day === 0 || day === 6) {
      Alert.alert('Erreur', 'Veuillez choisir un jour entre lundi et vendredi.');
      return;
    }

    const newDate = new Date(date);
    newDate.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    setDate(newDate);

    // Open time modal immediately
    setShowTimeModal(true);
  };

  const handleSubmit = async () => {
    if (!name || !email || !phone || !company) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (phoneError || emailError) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/demande_demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_prenom: name,
          email,
          telephone: phone,
          societe: company,
          date_selectionnee: date.toISOString().split('T')[0],
          heure_selectionnee: selectedTime,
          message
        })
      });

      if (!response.ok) throw new Error('Impossible d’enregistrer le rendez-vous.');
      await response.json();

      Alert.alert('Succès', 'Votre demande a été enregistrée.\nVous recevrez une notification dès que votre rendez-vous sera confirmé.');

      setName(''); setEmail(''); setEmailError(''); setPhone(''); setPhoneError('');
      setCompany(''); setMessage(''); setDate(new Date()); setSelectedTime('');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible d’enregistrer le rendez-vous.');
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Formatters
  const formatDay = (d: Date) => {
    const days = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
    return days[d.getDay()];
  };
  const formatDate = (d: Date) => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
      <Text style={styles.title}>Rendez-vous Démo</Text>
      <View style={styles.formContainer}>
        {/* Name */}
        <View style={styles.inputWrapper}>
          <MaterialIcons name="person" size={18} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nom complet *"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
          <MaterialIcons name="email" size={18} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email *"
            keyboardType="email-address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={handleEmailChange}
          />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        {/* Phone */}
        <View style={[styles.inputWrapper, phoneError && styles.inputWrapperError]}>
          <FontAwesome name="phone" size={18} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Téléphone *"
            keyboardType="phone-pad"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={handlePhoneChange}
          />
        </View>
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

        {/* Company */}
        <View style={styles.inputWrapper}>
          <MaterialIcons name="business" size={18} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Société *"
            placeholderTextColor="#999"
            value={company}
            onChangeText={setCompany}
          />
        </View>

        {/* Message */}
        <View style={styles.inputWrapper}>
          <MaterialIcons name="message" size={18} color="#999" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Message"
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#999"
            multiline
          />
        </View>

        

        {/* Calendar-style Card */}
        <TouchableOpacity
          style={styles.calendarCard}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.cardSubtitle}>Sélectionnez votre rendez-vous</Text>
          <View style={styles.dayDateRow}>
            <Text style={styles.dayText}>{formatDay(date)}</Text>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </View>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => {
              if (!date) {
                Alert.alert('Erreur', 'Veuillez sélectionner une date d’abord.');
                return;
              }
              setShowTimeModal(true);
            }}
          >
            <Text style={styles.timeText}>{selectedTime || 'Sélectionnez l’heure'}</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleDateChange}
            minimumDate={tomorrow}
          />
        )}

        {/* Time Modal */}
        <Modal visible={showTimeModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                {availableTimes.map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.modalItem, selectedTime === time && styles.modalItemSelected]}
                    onPress={() => {
                      setSelectedTime(time);
                      setShowTimeModal(false);
                      const newDate = new Date(date);
                      const [hours, minutes] = time.split(':').map(Number);
                      newDate.setHours(hours, minutes, 0, 0);
                      setDate(newDate);
                    }}
                  >
                    <Text style={[styles.modalText, selectedTime === time && styles.modalTextSelected]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Submit */}
        <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Enregistrement...' : 'Planifier ma démo'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', color: '#273e64', textAlign: 'center', marginBottom: 20 },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  inputWrapperError: { borderColor: 'red', borderWidth: 1.5 },
  inputIcon: { marginRight: 6, width: 18, height: 18 },
  input: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#273e64' },
  errorText: { color: 'red', fontSize: 11, marginBottom: 8 },
  button: {
    backgroundColor: '#ffc833',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#273e64' },

  /* Calendar card */
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20
  },
  cardSubtitle: { fontSize: 12, color: '#999', marginBottom: 12, textAlign: 'left' },
  dayDateRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, justifyContent: 'flex-start' },
  dayText: { fontSize: 26, fontWeight: '700', color: '#273e64', marginRight: 8 },
  dateText: { fontSize: 16, color: '#273e64' },
  timeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'flex-start'
  },
  timeText: { fontSize: 16, color: '#273e64' },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: 300,
    paddingVertical: 12
  },
  modalItem: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItemSelected: { backgroundColor: '#ffc833' },
  modalText: { fontSize: 16, color: '#273e64' },
  modalTextSelected: { fontWeight: '700' }
});
