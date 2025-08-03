/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import { CustomPickerModalProps } from '../../types/type';


export const CustomPickerModal = ({
  visible,
  title,
  options,
  onClose,
  onSelect,
  onAddItem,
}: CustomPickerModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <SafeAreaView style={styles.modalContent}>
              <Text style={styles.title}>{title}</Text>

              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => onSelect(item)}>
                    <Text style={styles.optionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />

              {/* Tombol untuk menambah item baru */}
              <View style={styles.separator} />
              <TouchableOpacity style={styles.addButton} onPress={onAddItem}>
                <Text style={styles.addButtonText}>+ Add New</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    maxHeight: '60%', // Batasi tinggi modal
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  addButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
});
