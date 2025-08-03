/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';

import { v6 as uuidv6 } from 'uuid';
import { CustomPickerModal } from '../components/picker';
import { useCameraPermission } from 'react-native-vision-camera';
import { AddProductScreenNavigationProp, finalProductData } from '../../types/type';
import { CameraIcon } from '../../assets/images';
import { getAllCategorycustom } from '../../services/categoryservices';
import { getAllSize } from '../../services/sizeservices';
import { insertProductWithDetail } from '../../services/productservices';
import { createDatabse } from '../../database/db';

const SvgIcon = ({ name }: { name: string }) => <Text style={styles.iconPlaceholder}>[{name.charAt(0).toUpperCase()}]</Text>;

export const AddProductScreen = ({ navigation, route }: AddProductScreenNavigationProp) => {

    const [pickerVisible, setPickerVisible] = useState<'category' | 'size' | null>(null);
    const [productName, setProductName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [category, setcategory] = useState<{ label: string, value: string }[]>([]);
    const [size, setSize] = useState<{ label: string, value: string }[]>([]);
    const [description, setDescription] = useState('');
    const { hasPermission, requestPermission } = useCameraPermission();

    useEffect(() => {
        const getalldata = async () => {
            try {
                const categorys = await getAllCategorycustom();
                const sizes = await getAllSize();
                setcategory(categorys);
                setSize(sizes);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        getalldata();
    }, []);

    useEffect(() => {
        // Cek jika ada parameter 'scannedBarcode' di route
        if (route.params?.scannedBarcode) {
            const scannedCode = route.params.scannedBarcode;
            console.log('Menerima barcode dari scanner:', scannedCode);
            setBarcode(scannedCode);

            // Hapus parameter setelah digunakan agar tidak terpicu lagi
            navigation.setParams({ scannedBarcode: undefined });
        }
    }, [route.params?.scannedBarcode]);

    const handleScanBarcode = async () => {
        // Cek perizinan terlebih dahulu
        if (hasPermission) {
            // Jika sudah ada izin, langsung navigasi
            console.log('Izin sudah ada, membuka kamera...');
            navigation.navigate('barcode', { targetScreen: 1 });
        } else {
            // Jika belum ada izin, minta izin
            console.log('Meminta izin kamera...');
            const isPermissionGranted = await requestPermission();
            if (isPermissionGranted) {
                console.log('Izin diberikan, membuka kamera...');
                navigation.navigate('barcode', { targetScreen: 1 });
            } else {
                console.log('Izin ditolak.');
                Alert.alert('Izin Ditolak', 'Anda perlu memberikan izin kamera untuk menggunakan fitur ini.');
            }
        }
    };

    const handlePriceChange = (text: string) => {
        // Hanya izinkan angka dan format ke format Rupiah
        const numericValue = text.replace(/[^0-9]/g, '');
        setPrice(numericValue);
    };

    const formatPrice = (value: string) => {
        if (!value) { return 'Rp 0'; }
        return 'Rp ' + parseInt(value, 10).toLocaleString('id-ID');
    };

    const handleSelect = (option: { label: string; value: string }) => {
        if (pickerVisible === 'category') {
            setSelectedCategory(option.value);
        } else if (pickerVisible === 'size') {
            setSelectedSize(option.value);
        }
        setPickerVisible(null); // Tutup modal setelah memilih
    };

    const getLabel = (type: 'category' | 'size', value: string | null) => {
        if (!value) { return null; }
        const list = type === 'category' ? category : size;
        const selectedItem = list.find(item => item.value === value);
        return selectedItem?.label;
    };


    const handleAddProduct = async () => {
        // Validasi input sederhana
        if (!productName || !price || !selectedCategory || !selectedSize) {
            Alert.alert('Error', 'Please fill all required fields.');
            return;
        }
        const db = await createDatabse();
        // Generate UUID v6 untuk kode produk
        const productCode = uuidv6();

        // Kumpulkan semua data untuk dikirim ke API
        const finalProductDataproduct: finalProductData = {
            product_name: productName,
            price: parseInt(price, 10),
            description_product: description,
            code_product: productCode,
            id_category: selectedCategory,
            id_size: selectedSize,
            barcode: barcode,
        };

        await insertProductWithDetail(db, finalProductDataproduct);
        navigation.navigate('product');
    };

    const handleAddNewItem = () => {
        const type = pickerVisible;
        setPickerVisible(null); // Tutup modal dulu
        // Tampilkan alert berdasarkan tipe picker yang aktif
        Alert.alert('Add New', `Di sini Anda bisa navigasi ke halaman untuk menambah ${type} baru.`);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Product Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Product Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter product name"
                        placeholderTextColor="#999"
                        value={productName}
                        onChangeText={setProductName}
                    />
                </View>

                {/* Barcode */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Barcode</Text>
                    <View style={styles.inputWithIcon}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Scan or enter barcode"
                            placeholderTextColor="#999"
                            value={barcode}
                            onChangeText={setBarcode}
                        />
                        <TouchableOpacity onPress={handleScanBarcode} style={styles.iconButton}>
                            <CameraIcon />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Price */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Price</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Rp 0"
                        placeholderTextColor="#999"
                        value={formatPrice(price)}
                        onChangeText={handlePriceChange}
                        keyboardType="numeric"
                    />
                </View>

                {/* Category Dropdown */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity style={styles.pickerTrigger} onPress={() => setPickerVisible('category')}>
                        <Text style={selectedCategory ? styles.pickerText : styles.pickerPlaceholder}>
                            {getLabel('category', selectedCategory) || 'Select category'}
                        </Text>
                        <SvgIcon name="dropdown-arrow" />
                    </TouchableOpacity>
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Enter product description"
                        placeholderTextColor="#999"
                        value={description}
                        onChangeText={setDescription}
                        multiline={true}
                        numberOfLines={4}
                    />
                </View>

                {/* Size Dropdown */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Size</Text>
                    <TouchableOpacity style={styles.pickerTrigger} onPress={() => setPickerVisible('size')}>
                        <Text style={selectedSize ? styles.pickerText : styles.pickerPlaceholder}>
                            {getLabel('size', selectedSize) || 'Select size'}
                        </Text>
                        <SvgIcon name="dropdown-arrow" />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Tombol Add Product */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
                    <Text style={styles.addButtonText}>Add Product</Text>
                </TouchableOpacity>
            </View>

            <CustomPickerModal
                visible={pickerVisible !== null}
                title={pickerVisible === 'category' ? 'Select Category' : 'Select Size'}
                options={pickerVisible === 'category' ? category : size}
                onClose={() => setPickerVisible(null)}
                onSelect={handleSelect}
                onAddItem={handleAddNewItem}
            />

        </SafeAreaView>
    );
};

// 4. STYLING
const styles = StyleSheet.create({
    pickerTrigger: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addAnotherButton: { borderWidth: 1, borderColor: '#007bff', borderRadius: 8, padding: 15, alignItems: 'center', borderStyle: 'dashed' },
    addAnotherText: { color: '#007bff', fontWeight: 'bold' },
    pickerText: {
        fontSize: 16,
        color: '#333',
    },
    pickerPlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    container: { padding: 20, paddingBottom: 100 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    inputWithIcon: { flexDirection: 'row', alignItems: 'center' },
    iconButton: { position: 'absolute', right: 0, padding: 12 },
    iconPlaceholder: { color: '#888', fontWeight: 'bold' },
    textArea: { height: 100, textAlignVertical: 'top' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    addButton: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
