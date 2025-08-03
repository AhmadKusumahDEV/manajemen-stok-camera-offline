/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SelectedProduct } from '../../types/type';

type SelectedProductCardProps = {
  product: SelectedProduct;
  onQuantityChange: (productId: string, size: string, quantity: string) => void;
  onRemove: (listKey: string) => void;
};

export const SelectedProductCard = ({ product, onQuantityChange, onRemove }: SelectedProductCardProps) => {

  const totalQuantity = useMemo(() => {
    return Object.values(product.quantities)
      .reduce((sum, current) => sum + (parseInt(current, 10) || 0), 0)
      .toString();
  }, [product.quantities]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.availableSizes}>Available Sizes: {product.availableSizes.join(', ')}</Text>
        </View>
        <TouchableOpacity onPress={() => onRemove(product.listKey)}>
          <Text style={{ color: 'red', fontSize: 24 }}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, styles.totalInput]}
        value={totalQuantity}
        editable={false} // Tidak bisa diedit langsung
        placeholder="Total Quantity"
      />

      <View style={styles.sizeInputGrid}>
        {product.availableSizes.map(size => (
          <View key={size} style={styles.sizeInputContainer}>
            <TextInput
              style={styles.input}
              placeholder={size}
              keyboardType="number-pad"
              value={product.quantities[size] || ''}
              onChangeText={(text) => onQuantityChange(product.id, size, text.replace(/[^0-9]/g, ''))}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

// ... (tambahkan StyleSheet untuk kartu ini)
const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  availableSizes: { fontSize: 12, color: '#666', marginTop: 2 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16 },
  totalInput: { backgroundColor: '#f0f2f5', marginBottom: 10 },
  sizeInputGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  sizeInputContainer: { width: '50%', padding: 4 },
});
