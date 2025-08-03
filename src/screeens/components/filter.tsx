import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import { FilterModalProps } from '../../types/type';


// Komponen Checkbox kustom
const Checkbox = ({ label, isSelected, onToggle }: { label: string, isSelected: boolean, onToggle: () => void }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
      {isSelected && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const FilterModal = ({
  visible,
  onClose,
  categories,
  selectedCategories,
  onCategoryChange,
  onAddCategory,
}: FilterModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      {/* Latar belakang yang bisa ditekan untuk menutup modal */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          {/* Konten Modal (mencegah penutupan saat ditekan) */}
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter by Category</Text>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Checkbox
                    label={item.name}
                    isSelected={selectedCategories.includes(item.id)}
                    onToggle={() => onCategoryChange(item.id.toString())}
                  />
                )}
              />
              <View style={styles.divider} />
              <TouchableOpacity style={styles.addButton} onPress={onAddCategory}>
                <Text style={styles.addButtonText}>+ Tambah Kategori</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 120, // Sesuaikan posisi vertikal
    marginRight: 20, // Sesuaikan posisi horizontal
    width: 280, // Lebar modal
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#007bff',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 15,
  },
  addButton: {
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FilterModal;
