

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
// import RNPickerSelect from 'react-native-picker-select';
import { CustomPickerModal } from '../components/picker';
import { EditProductScreenProps, ProductWithDetailUpdateData, updatedProductData } from '../../types/type';
import { CameraIcon } from '../../assets/images';
import { getAllCategorycustom } from '../../services/categoryservices';
import { getAllSize } from '../../services/sizeservices';
import { createDatabse } from '../../database/db';
import { getProductEdit, updateProductWithDetail } from '../../services/productservices';

// Komponen ikon placeholder (ganti dengan SVG atau Icon library Anda)
const SvgIcon = ({ name }: { name: string }) => <Text style={styles.iconPlaceholder}>[{name.charAt(0).toUpperCase()}]</Text>;

export const EditProductScreen = ({ navigation, route }: EditProductScreenProps) => {
    const [pickerVisible, setPickerVisible] = useState<'category' | 'size' | null>(null);
    const [productName, setProductName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [category, setcategory] = useState<{ label: string, value: string }[]>([]);
    const [size, setSize] = useState<{ label: string, value: string }[]>([]);
    const [updated, setupdated] = useState<updatedProductData>();
    const { productID } = route.params;

    useEffect(() => {
        const getalldata = async () => {
            try {
                const db = await createDatabse();
                const categorys = await getAllCategorycustom();
                const sizes = await getAllSize();
                setcategory(categorys);
                setSize(sizes);
                const data = await getProductEdit(db, productID as string);
                setupdated(data);
                setProductName(data.product_name);
                setBarcode(data.barcode);
                setPrice(data.price.toString());
                setSelectedCategory(data.id_category);
                setSelectedSize(data.id_size);
                setDescription(data.description_product);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        getalldata();
    }, [productID]);

    const handlePriceChange = (text: string) => {
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

    const handleScanBarcode = () => {
        const scannedBarcode = '123456789-SCANNED';
        setBarcode(scannedBarcode);
        Alert.alert('Barcode Scanned', `Barcode: ${scannedBarcode}`);
    };

    const handleAddProduct = async () => {
        // Validasi input sederhana
        if (!productName || !price || !selectedCategory || !selectedSize) {
            Alert.alert('Error', 'Please fill all required fields.');
            return;
        }
        const db = await createDatabse();
        const pd: ProductWithDetailUpdateData = {
            product_name: updated?.product_name,
            price: updated?.price as number,
            description_product: description,
            id_category: Number(updated?.id_category),
            id_size: Number(updated?.id_size),
            barcode: barcode,
        };
        await updateProductWithDetail(db, updated?.code_product as string, updated?.id as number, pd);
        navigation.navigate('product');
    };

    const handleAddNewItem = () => {
        const type = pickerVisible;
        setPickerVisible(null); // Tutup modal dulu
        // Tampilkan alert berdasarkan tipe picker yang aktif
        Alert.alert('Add New', `Di sini Anda bisa navigasi ke halaman untuk menambah ${type} baru.`);
    };
    // 3. RENDER JSX
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
