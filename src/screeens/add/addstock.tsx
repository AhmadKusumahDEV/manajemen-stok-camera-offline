/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import React, { useState, useCallback, useEffect } from 'react';
import { Alert, SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { AddStokScreenNavigationProp, SelectedProductWithStock, SelectProductInStok } from '../../types/type';
import { ProductStockCard } from '../components/productcardstock';
import { ProductSelectionModalInStok } from '../components/productselection';
import { CameraIcon } from '../../assets/images';
import { createDatabse } from '../../database/db';
import { getproductmodalstok } from '../../services/Stockservices';
import { useFocusEffect } from '@react-navigation/native';
import { useCameraPermission } from 'react-native-vision-camera';

const AddStockScreen = ({ navigation, route }: AddStokScreenNavigationProp) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<SelectedProductWithStock[]>([]);
    const [modalproducts, setmodalproducts] = useState<SelectProductInStok[]>([]);
    const [barcode, setBarcode] = useState('');
    const { hasPermission, requestPermission } = useCameraPermission();

    useFocusEffect(
        // Gunakan useCallback untuk mencegah effect berjalan ulang tanpa henti
        useCallback(() => {
            console.log('Layar Warehouse menjadi fokus, mengambil data terbaru...');

            const fetchData = async () => {
                try {
                    const db = await createDatabse();
                    const result = await getproductmodalstok(db);
                    console.log(result);
                    setmodalproducts(result);
                } catch (error) {
                    console.error('Gagal mengambil data warehouse:', error);
                }
            };

            fetchData();


            return () => {
                console.log('Layar Warehouse tidak lagi fokus.');
            };
        }, [])
    );

    useEffect(() => {
        const scannedCode = route.params?.scannedBarcode;

        if (!scannedCode) { return; }

        console.log('Menerima barcode dari scanner:', scannedCode);
        setBarcode(scannedCode);

        const result = modalproducts.find(item => item.barcode === barcode);
        if (result) {
            handleProductSelect(result);
        } else {
            Alert.alert('Barcode Tidak Dikenali', 'Barcode tidak dikenali dalam daftar produk. \n ' + barcode);
        }

        // Bersihkan parameter agar tidak trigger ulang
        navigation.setParams({ scannedBarcode: undefined });
    }, [route.params?.scannedBarcode]);


    const handleScanBarcode = async () => {
        // Cek perizinan terlebih dahulu
        if (hasPermission) {
            // Jika sudah ada izin, langsung navigasi
            console.log('Izin sudah ada, membuka kamera...');
            navigation.navigate('barcode', { targetScreen: 2 });
        } else {
            // Jika belum ada izin, meminta izin
            console.log('Meminta izin kamera...');
            const isPermissionGranted = await requestPermission();
            if (isPermissionGranted) {
                console.log('Izin diberikan, membuka kamera...');
                navigation.navigate('barcode', { targetScreen: 2 });
            } else {
                console.log('Izin ditolak.');
                Alert.alert('Izin Ditolak', 'Anda perlu memberikan izin kamera untuk menggunakan fitur ini.');
            }
        }
    };

    const handleProductSelect = (productToAdd: SelectProductInStok) => {
        const isAlreadySelected = selectedProduct.some(
            item => item.product.product_code === productToAdd.product_code
        );

        if (isAlreadySelected) {
            setSelectedProduct(currentProducts =>
                currentProducts.map(item => {
                    if (item.product.product_code === productToAdd.product_code) {
                        const existingEntryIndex = item.stockEntries.findIndex(
                            entry => entry.sizeId === productToAdd.id_size
                        );

                        let updatedStockEntries;

                        if (existingEntryIndex !== -1) {
                            updatedStockEntries = item.stockEntries.map((entry, idx) =>
                                idx === existingEntryIndex
                                    ? { ...entry, quantity: entry.quantity + 1 }
                                    : entry
                            );
                        } else {
                            updatedStockEntries = [
                                ...item.stockEntries,
                                {
                                    sizeId: productToAdd.id_size,
                                    sizeName: productToAdd.size,
                                    quantity: 1,
                                },
                            ];
                        }

                        return {
                            ...item,
                            stockEntries: updatedStockEntries,
                        };
                    }
                    return item;
                })
            );
            return;
        }

        setSelectedProduct(currentProducts => [
            ...currentProducts,
            {
                product: productToAdd,
                stockEntries: [{ sizeId: productToAdd.id_size, sizeName: productToAdd.size, quantity: 1 }],
            },
        ]);
    };

    const handleRemoveProduct = useCallback((productCodeToRemove: string) => {
        setSelectedProduct(currentProducts =>
            currentProducts.filter(item => item.product.product_code !== productCodeToRemove)
        );
    }, []);

    const handleQuantityChange = useCallback((productCode: string, sizeId: number, newQuantity: number) => {
        setSelectedProduct(currentProducts =>
            currentProducts.map(item =>
                item.product.product_code === productCode
                    ? {
                        ...item,
                        stockEntries: item.stockEntries.map(entry =>
                            entry.sizeId === sizeId ? { ...entry, quantity: newQuantity } : entry
                        ),
                    }
                    : item
            )
        );
    }, []);

    const handleAddSize = useCallback((productCode: string, sizeId: number, sizeName: string) => {
        setSelectedProduct(currentProducts =>
            currentProducts.map(item => {
                if (item.product.product_code === productCode) {
                    const hasL = item.stockEntries.some(entry => entry.sizeId === sizeId);
                    if (!hasL) {
                        return {
                            ...item,
                            stockEntries: [...item.stockEntries, { sizeId: sizeId, sizeName: sizeName, quantity: 0 }],
                        };
                    } else {
                        Alert.alert('Size already added');
                    }
                }
                return item;
            })
        );
    }, []);

    const handleSubmit = () => {
        if (selectedProduct.length === 0) {
            Alert.alert('Incomplete', 'Please add at least one product.');
            return;
        }
        console.log('Submitting Stock Data:', selectedProduct);
        Alert.alert('Success', 'Stock has been added successfully!');
    };

    return (
        <SafeAreaView style={styles.screenContainer}>
            <View style={styles.headerSection}>
                <Text style={styles.headerTitle}>Select Product</Text>
                <TouchableOpacity onPress={handleScanBarcode}>
                    <CameraIcon />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.addAnotherButton} onPress={() => setIsModalVisible(true)}>
                <Text style={styles.addAnotherText}>+ Add Another Product</Text>
            </TouchableOpacity>

            <FlatList
                data={selectedProduct}
                keyExtractor={item => item.product.product_code}
                renderItem={({ item }) => (
                    <ProductStockCard
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onAddSize={handleAddSize}
                        onRemoveProduct={handleRemoveProduct}
                    />
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No products added yet.</Text>}
                contentContainerStyle={{ padding: 16 }}
            />

            <ProductSelectionModalInStok
                visible={isModalVisible}
                products={modalproducts}
                onClose={() => setIsModalVisible(false)}
                onSelect={handleProductSelect}
            />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Add Stock</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#F0F2F5',
    },
    scrollContainer: {
        padding: 16,
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        padding: 16,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
    },
    addAnotherButton: { borderWidth: 1, borderColor: '#007bff', borderRadius: 8, padding: 15, alignItems: 'center', borderStyle: 'dashed', margin: 16 },
    addAnotherText: { color: '#007bff', fontWeight: 'bold' },
    searchInput: {
        backgroundColor: '#FFFFFF',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 24,
    },
    footer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    iconPlaceholder: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
});

export default AddStockScreen;
