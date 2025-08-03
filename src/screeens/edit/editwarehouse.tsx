import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { EditWarehouseScreenProps, WarehouseUpdateData } from '../../types/type';
import { createDatabse } from '../../database/db';
import { getWarehousesDetail, updateWarehouse } from '../../services/warehouseservices';

// --- Komponen Layar Utama ---
const EditWarehouseScreen = ({ navigation, route }: EditWarehouseScreenProps) => { // Terima `navigation` dari props
  const [warehouseName, setWarehouseName] = useState('');
  const [LocationName, setLocationName] = useState('');

  const { sendid } = route.params;

  useEffect(() => {
    const warehousedata = async () => {
      try {
        const db = await createDatabse();
        const result = await getWarehousesDetail(db, sendid.id);
        setWarehouseName(result.warehouse_name);
        setLocationName(result.location_description as string);
      } catch (error) {
        console.error('Error adding warehouse:', error);
      }
    };

    warehousedata();
  }, [LocationName, navigation, sendid, warehouseName]);

  const handleUpdatedWarehouse = async () => {

    if (warehouseName.trim() === '' && LocationName.trim() === '') {
      Alert.alert('Validation Error', 'Warehouse name cannot be empty.');
      return;
    }

    const db = await createDatabse();
    const data: WarehouseUpdateData = {
      warehouse_name: warehouseName,
      location_description: LocationName,
    };
    const resultid = await updateWarehouse(db, sendid.id, data);
    console.log(resultid);
    navigation.navigate('home', { screen: 'warehouse' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Gunakan TouchableWithoutFeedback untuk menutup keyboard saat menekan area kosong */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            {/* Form Input */}
            <View>
              <Text style={styles.label}>Warehouse Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter warehouse name"
                placeholderTextColor="#999"
                value={warehouseName}
                onChangeText={setWarehouseName}
                autoFocus={true} // Langsung fokus ke input saat layar dibuka
              />
            </View>
            <View>
              <Text style={styles.label}>Warehouse Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter warehouse name"
                placeholderTextColor="#999"
                value={LocationName}
                onChangeText={setLocationName}
                autoFocus={true} // Langsung fokus ke input saat layar dibuka
              />
            </View>

            {/* Tombol Submit diletakkan di bagian bawah */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpdatedWarehouse}
              >
                <Text style={styles.submitButtonText}>
                  Updated Warehouse
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    // justifyContent: 'space-between', // Mendorong footer ke bawah
    padding: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  footer: {
    paddingTop: 20,
  },
  submitButton: {
    marginTop: 260,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditWarehouseScreen;
