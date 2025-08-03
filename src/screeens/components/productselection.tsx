import React, { useState } from 'react';
import { Modal, View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ModalDataInventory, SelectProductInStok } from '../../types/type';

type InventorySelectionModalStokProps = {
    visible: boolean;
    products: ModalDataInventory[];
    onClose: () => void;
    onSelect: (product: ModalDataInventory) => void;
};

export const InventorySelectionModalInStok = ({ visible, products, onClose, onSelect }: InventorySelectionModalStokProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter(p =>
        p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectProduct = (product: ModalDataInventory) => {
        onSelect(product);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Select a Product</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeButton}>Close</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search product..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredProducts}
                    keyExtractor={item => String(item.id)}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.productItem} onPress={() => handleSelectProduct(item)}>
                            <Text style={styles.productName}>{`${item.product_name} - ${item.size.toUpperCase()}`}</Text>
                            <Text style={styles.productSizes}>Size : {item.size}</Text>
                            <Text style={styles.productSizes}>barcode : {item.barcode}</Text>
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </Modal>
    );
};

// =====================modal fro product in stok======================

type ProductSelectionModalStokProps = {
    visible: boolean;
    products: SelectProductInStok[];
    onClose: () => void;
    onSelect: (product: SelectProductInStok) => void;
};

export const ProductSelectionModalInStok = ({ visible, products, onClose, onSelect }: ProductSelectionModalStokProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter(p =>
        p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectProduct = (product: SelectProductInStok) => {
        onSelect(product);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Select a Product</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeButton}>Close</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search product..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredProducts}
                    keyExtractor={item => String(item.id)}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.productItem} onPress={() => handleSelectProduct(item)}>
                            <Text style={styles.productName}>{`${item.product_name} - ${item.size.toUpperCase()}`}</Text>
                            <Text style={styles.productSizes}>Size : {item.size}</Text>
                            <Text style={styles.productSizes}>barcode : {item.barcode}</Text>
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </Modal>
    );
};

// ... (tambahkan StyleSheet untuk modal ini)
const styles = StyleSheet.create({
    modalContainer: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    title: { fontSize: 18, fontWeight: 'bold' },
    closeButton: { fontSize: 16, color: '#007bff' },
    searchBar: { height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, margin: 15, paddingHorizontal: 10 },
    productItem: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    productName: { fontSize: 16 },
    productSizes: { fontSize: 12, color: '#666', marginTop: 4 },
});
