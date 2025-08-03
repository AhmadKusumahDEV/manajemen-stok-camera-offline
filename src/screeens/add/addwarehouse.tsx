import React, { useState } from 'react';
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
import { AddWarehouseScreenProps, WarehouseCreateData } from '../../types/type';
import { createDatabse } from '../../database/db';
import { addWarehouse } from '../../services/warehouseservices';

// --- Komponen Layar Utama ---
const AddWarehouseScreen = ({ navigation }: AddWarehouseScreenProps) => {
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('');

  const handleAddWarehouse = () => {

    const data: WarehouseCreateData = {
      warehouse_name: warehouseName,
      location_description: warehouseLocation,
    };

    if (warehouseName.trim() === '' && warehouseLocation.trim() === '') {
      Alert.alert('Validation Error', 'Warehouse name cannot be empty.');
      return;
    }

    const postwarehouse = async () => {
      try {
        const db = await createDatabse();
        await addWarehouse(db, data);
      } catch (error) {
        console.error('Error adding warehouse:', error);
      }
    };

    postwarehouse();
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
              <Text style={styles.label}>Warehouse Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter warehouse location"
                placeholderTextColor="#999"
                value={warehouseLocation}
                onChangeText={setWarehouseLocation}
                autoFocus={true} // Langsung fokus ke input saat layar dibuka
              />
            </View>

            {/* Tombol Submit diletakkan di bagian bawah */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddWarehouse}
              >
                <Text style={styles.submitButtonText}>
                  {'Add Warehouse'}
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
    justifyContent: 'space-between', // Mendorong footer ke bawah
    padding: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
    paddingTop: 10,
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
  },
  footer: {
    paddingTop: 20,
  },
  submitButton: {
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

export default AddWarehouseScreen;
