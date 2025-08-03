/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useCallback, useEffect } from 'react';
import { Alert, SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { AddTransactionScreenNavigationProp, detailtransactioninsert, ModalDataInventory, SelectedProductWithStock, SelectProductInStok } from '../../types/type';
import { ProductStockCard } from '../components/productcardstock';
import { InventorySelectionModalInStok, ProductSelectionModalInStok } from '../components/productselection';
import { CameraIcon } from '../../assets/images';
import { createDatabse } from '../../database/db';
import { getModalDataInventory, getproductmodalstok } from '../../services/Stockservices';
import { useFocusEffect } from '@react-navigation/native';
import { useCameraPermission } from 'react-native-vision-camera';
import { CustomPickerModal } from '../components/picker';
import { getAllWarehouse } from '../../services/warehouseservices';
import ToastNotification from '../components/notifiacton';
import { useAuth } from '../../context/authcontext';
import { insertTransactionWithDetails } from '../../services/transactionservices';

const TRANSACTION_TYPE_OPTIONS = [
    { label: 'Penerimaan Barang (Inbound)', value: 'inbound' },
    { label: 'Pengeluaran Barang (Outbound)', value: 'outbound' },
    { label: 'Transfer Antar Gudang', value: 'transfer' },
];

const MemoizedHeader = React.memo(({
    selectTypeTransaction,
    selectedWarehouse,
    name,
    getLabel,
    handleScanBarcode,
    setPickerVisible,
    setName,
    setIsModalVisible,
    setIsModalInvenotryVisible,
}: any) => {
    const SvgIcon = ({ name }: { name: string }) => <Text style={styles.iconPlaceholder}>{name.charAt(0).toUpperCase()}</Text>;
    return (
        <View>
            {/* Judul "Add Transaction" dihapus dari sini */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Transaction Details</Text>
                <TouchableOpacity style={styles.pickerTrigger} onPress={() => setPickerVisible('transaction')}>
                    <Text style={selectTypeTransaction ? styles.pickerText : styles.pickerPlaceholder}>
                        {getLabel('transaction', selectTypeTransaction) || 'Select transaction type'}
                    </Text>
                    <SvgIcon name="v" />
                </TouchableOpacity>
            </View>

            {selectTypeTransaction && selectTypeTransaction !== 'transfer' && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{selectTypeTransaction === 'inbound' ? 'Sender Name' : 'Recipient Name'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={selectTypeTransaction === 'inbound' ? 'Enter sender name' : 'Enter recipient name'}
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                    />
                </View>
            )}

            {selectTypeTransaction && selectTypeTransaction === 'transfer' && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Destination Warehouse</Text>
                    <TouchableOpacity style={styles.pickerTrigger} onPress={() => setPickerVisible('warehouse')}>
                        <Text style={selectedWarehouse ? styles.pickerText : styles.pickerPlaceholder}>
                            {getLabel('warehouse', selectedWarehouse) || 'Select warehouse'}
                        </Text>
                        <SvgIcon name="v" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Bagian untuk menambah produk, sekarang menggabungkan tombol manual dan scan */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Products</Text>
                <View style={styles.addProductActionsContainer}>
                    <TouchableOpacity style={styles.addManualButton} onPress={() => {
                        if (selectTypeTransaction === null) {
                            Alert.alert('Incomplete', 'Please select a transaction type first.');
                            return;
                        }
                        if (selectTypeTransaction !== 'inbound') {
                            setIsModalInvenotryVisible(true);
                            return;
                        }
                        setIsModalVisible(true);
                    }}>
                        <SvgIcon name="+" />
                        <Text style={styles.addManualButtonText}>Add Manually</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.scanButton} onPress={handleScanBarcode}>
                        <CameraIcon />
                        <Text style={styles.scanButtonText}>Scan</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
});

const AddTransactionScreen = ({ navigation, route }: AddTransactionScreenNavigationProp) => {
    // const SvgIcon = ({ name }: { name: string }) => <Text style={styles.iconPlaceholder}>{name.charAt(0).toUpperCase()}</Text>;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalInvenotryVisible, setIsModalInvenotryVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<SelectedProductWithStock[]>([]);
    const [modalproducts, setmodalproducts] = useState<SelectProductInStok[]>([]);
    const [modalDataInventory, setmodalInventory] = useState<ModalDataInventory[]>([]);
    const [pickerVisible, setPickerVisible] = useState<'transaction' | 'warehouse' | null>(null);
    const [selectTypeTransaction, setSelectTypeTransaction] = useState<string | null | number>(null);
    const [transactionType, setTransactionType] = useState<{ label: string, value: string }[]>([]);
    const [warehouse, setwarehouse] = useState<{ label: string, value: string }[]>([]);
    const [barcode, setBarcode] = useState('');
    const [name, setName] = useState('');
    const [selectedWarehouse, setSelectedwarehouse] = useState<string | null | number>(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const { session } = useAuth();

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // b. Tambahkan fungsi helper ini di dalam komponen
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);
    };

    useEffect(() => {
        setName('');
        setSelectedwarehouse(null);
    }, [selectTypeTransaction]);

    useFocusEffect(
        // menggunakan useCallback untuk mencegah effect berjalan ulang tanpa henti
        useCallback(() => {
            console.log('Layar Warehouse menjadi fokus, mengambil data terbaru...');
            const fetchData = async () => {
                try {
                    const db = await createDatabse();
                    setTransactionType(TRANSACTION_TYPE_OPTIONS);
                    const warehouses = await getAllWarehouse();
                    const result = await getproductmodalstok(db);
                    setmodalproducts(result);
                    const results = await getModalDataInventory(db, session?.warehouse_code);
                    setmodalInventory(results);
                    setwarehouse(warehouses);
                } catch (error) {
                    console.error('Gagal mengambil data warehouse:', error);
                }
            };

            fetchData();

            return () => {
                console.log('Layar Warehouse tidak lagi fokus.');
            };
        }, []) // Dependency array kosong untuk useCallback
    );

    // process scanning barcode
    useEffect(() => {
        const scannedCode = route.params?.scannedBarcode;

        if (!scannedCode) { return; }

        setBarcode(scannedCode);

        if (selectTypeTransaction !== 'inbound') {
            const result = modalDataInventory.find(item => item.barcode === scannedCode);
            if (result) {
                showToast('Produk  ditambahkan!', 'success');
                handleProductSelect(result);
                return;
            } else {
                const result = modalproducts.find(item => item.barcode === barcode);
                if (result) {
                    showToast('berang tidak tersedia di gudang', 'error');
                    return;
                }
                else {
                    showToast(`barcode tidak dikenali ${scannedCode}`, 'error');
                    return;
                }
            }
        }

        const result = modalproducts.find(item => item.barcode === barcode);
        if (result) {
            showToast('Produk  ditambahkan!', 'success');
            handleProductSelect(result);
        } else {
            showToast(`Barcode tidak dikenali ${scannedCode}`, 'error');
        }

        // Bersihkan parameter agar tidak trigger ulang
        navigation.setParams({ scannedBarcode: undefined });
    }, [route.params?.scannedBarcode]);


    const handleScanBarcode = async () => {
        if (selectTypeTransaction === null) {
            Alert.alert('Error', 'Please select a transaction type.');
            return;
        }
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

    const handleInvenotryStockSelect = (productToAdd: ModalDataInventory) => {
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
                            const currentQuantity = item.stockEntries[existingEntryIndex].quantity;

                            const stockLimit = modalDataInventory.find(
                                inv => inv.product_code === item.product.product_code && inv.id_size === productToAdd.id_size
                            );

                            const maxQuantity = stockLimit?.quantity ?? 0;

                            const validatedQuantity = currentQuantity + 1 > maxQuantity
                                ? maxQuantity
                                : currentQuantity + 1;

                            if (currentQuantity + 1 > maxQuantity) {
                                Alert.alert(
                                    'Stok Melebihi',
                                    `Jumlah yang dimasukkan melebihi stok tersedia (${maxQuantity}). Jumlah otomatis disesuaikan.`
                                );
                            }
                            updatedStockEntries = item.stockEntries.map((entry, idx) =>
                                idx === existingEntryIndex
                                    ? { ...entry, quantity: validatedQuantity }
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

    const handleQuantityChange = useCallback(
        (productCode: string, sizeId: number, newQuantity: number) => {
            if (selectTypeTransaction !== 'inbound') {
                const stockLimit = modalDataInventory.find(
                    item => item.product_code === productCode && item.id_size === sizeId
                );

                const maxQuantity = stockLimit?.quantity ?? 0;
                const validatedQuantity = newQuantity > maxQuantity ? maxQuantity : newQuantity;

                if (newQuantity > maxQuantity) {
                    Alert.alert(
                        'Stok Melebihi',
                        `Jumlah yang dimasukkan melebihi stok tersedia (${maxQuantity}). Jumlah otomatis disesuaikan.`
                    );
                }

                setSelectedProduct(currentProducts =>
                    currentProducts.map(item =>
                        item.product.product_code === productCode
                            ? {
                                ...item,
                                stockEntries: item.stockEntries.map(entry =>
                                    entry.sizeId === sizeId
                                        ? { ...entry, quantity: validatedQuantity }
                                        : entry
                                ),
                            }
                            : item
                    )
                );
            } else {
                setSelectedProduct(currentProducts =>
                    currentProducts.map(item =>
                        item.product.product_code === productCode
                            ? {
                                ...item,
                                stockEntries: item.stockEntries.map(entry =>
                                    entry.sizeId === sizeId
                                        ? { ...entry, quantity: newQuantity }
                                        : entry
                                ),
                            }
                            : item
                    )
                );
            }

        },
        [modalDataInventory, selectTypeTransaction, modalproducts]
    );

    const handleAddSize = useCallback((productCode: string, sizeId: number, sizeName: string) => {
        const isSizeAvailable = modalproducts.some(item =>
            item.product_code === productCode &&
            item.id_size === sizeId
        );

        if (!isSizeAvailable) {
            Alert.alert('Ukuran tidak terdaftar untuk produk ini');
            return;
        }

        if (selectTypeTransaction !== 'inbound') {
            const isSizeAvailable = modalDataInventory.some(item =>
                item.product_code === productCode && item.id_size === sizeId
            );

            if (!isSizeAvailable) {
                Alert.alert('Ukuran tidak ada pada gudang ini');
                return;
            }
        }

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
    }, [selectTypeTransaction]);

    // const handleAddNewItem = () => {
    //     const type = pickerVisible;
    //     setPickerVisible(null); // Tutup modal dulu
    //     // Tampilkan alert berdasarkan tipe picker yang aktif
    //     Alert.alert('Add New', `Di sini Anda bisa navigasi ke halaman untuk menambah ${type} baru.`);
    // };

    const getLabel = (type: 'transaction' | 'warehouse', value: string | null | number) => {
        if (!value) { return null; }
        const list = type === 'transaction' ? transactionType : warehouse;
        const selectedItem = list.find(item => item.value === value || item.label === value);
        return selectedItem?.label;
    };

    const handleSelect = (option: { label: string; value: string | number }) => {
        if (pickerVisible === 'transaction') {
            setSelectTypeTransaction(option.value);
            if (selectTypeTransaction === 'inbound') {

            }
        } else if (pickerVisible === 'warehouse') {
            setSelectedwarehouse(option.label);
        }
        setPickerVisible(null); // Tutup modal setelah memilih
    };


    const handleSubmit = async () => {
        let temp_name = name;
        if (selectedProduct.length === 0) {
            Alert.alert('Incomplete', 'Please add at least one product. Name is required.');
            return;
        }

        if (selectTypeTransaction === 'inbound' || selectTypeTransaction === 'outbound') {
            console.log(temp_name);
            if (temp_name === '') {
                Alert.alert('Incomplete', 'Please enter a name.');
                return;
            }
        }

        const db = await createDatabse();
        console.log(selectedProduct);
        let temp_transaction: detailtransactioninsert[] = [];
        for (let i = 0; i < selectedProduct.length; i++) {
            let temp = selectedProduct[i].product as unknown as ModalDataInventory;
            for (let j = 0; j < selectedProduct[i].stockEntries.length; j++) {
                const id_detail_product = modalproducts.find(item => item.product_code === temp.product_code && item.id_size === selectedProduct[i].stockEntries[j].sizeId);
                temp_transaction.push({
                    id_detail_product: id_detail_product?.id as number,
                    quantity: selectedProduct[i].stockEntries[j].quantity,
                });
            }
        }
        console.log(temp_transaction);
        if (selectTypeTransaction === 'inbound') {
            const res = await insertTransactionWithDetails(db, temp_transaction, selectTypeTransaction, session?.user_id as string, name, session?.warehouse_name as string);
            console.log(res);
            showToast('Stock has been added successfully!', 'success');
            navigation.navigate('home', { screen: 'transaction' });
            return;
        } else if (selectTypeTransaction === 'outbound') {
            const res = await insertTransactionWithDetails(db, temp_transaction, selectTypeTransaction, session?.user_id as string, session?.warehouse_name as string, name);
            console.log(res);
            showToast('Stock has been added successfully!', 'success');
            navigation.navigate('home', { screen: 'transaction' });
            return;
        } else {
            const res = await insertTransactionWithDetails(db, temp_transaction, selectTypeTransaction as string, session?.user_id as string, session?.warehouse_name as string, selectedWarehouse as string);
            console.log(res);
            showToast('Stock has been added successfully!', 'success');
            navigation.navigate('home', { screen: 'transaction' });
            return;
        }
    };

    return (
        <SafeAreaView style={styles.screenContainer}>
            <FlatList
                data={selectedProduct}
                keyExtractor={(item) => item.product.product_code}
                renderItem={({ item }) => (
                    <ProductStockCard
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onAddSize={handleAddSize}
                        onRemoveProduct={handleRemoveProduct}
                    />
                )}
                ListHeaderComponent={
                    <MemoizedHeader
                        selectTypeTransaction={selectTypeTransaction}
                        selectedWarehouse={selectedWarehouse}
                        name={name}
                        getLabel={getLabel}
                        handleScanBarcode={handleScanBarcode}
                        setPickerVisible={setPickerVisible}
                        setName={setName}
                        setIsModalVisible={setIsModalVisible}
                        setIsModalInvenotryVisible={setIsModalInvenotryVisible}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyProductList}>
                        <Text style={styles.emptyProductText}>No products added yet.</Text>
                    </View>
                }
                contentContainerStyle={styles.scrollContainer}
            />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Create Transaction</Text>
                </TouchableOpacity>
            </View>

            {/* --- MODAL-MODAL --- */}
            <CustomPickerModal
                visible={pickerVisible !== null}
                title={pickerVisible === 'transaction' ? 'Select Transaction' : 'Select Warehouse'}
                options={pickerVisible === 'transaction' ? transactionType : warehouse}
                onClose={() => setPickerVisible(null)}
                onSelect={handleSelect}
                onAddItem={() => Alert.alert('Add New', 'Navigasi ke halaman tambah item...')}
            />

            <ProductSelectionModalInStok
                visible={isModalVisible}
                products={modalproducts}
                onClose={() => setIsModalVisible(false)}
                onSelect={handleProductSelect}
            />

            <InventorySelectionModalInStok visible={isModalInvenotryVisible} products={modalDataInventory} onClose={() => setIsModalInvenotryVisible(false)} onSelect={handleInvenotryStockSelect} />

            <ToastNotification
                visible={toastVisible}
                message={toastMessage}
                type={toastType}
                onHide={() => setToastVisible(false)}
            />
        </SafeAreaView>
    );
};

export default AddTransactionScreen;

// =================================================================
// STYLESHEET LENGKAP
// =================================================================
const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: '#F0F2F5' },
    scrollContainer: { paddingBottom: 120 }, // Padding bottom untuk ruang footer
    headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 0 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111' },
    inputGroup: { marginBottom: 20, paddingHorizontal: 16 },
    label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' },
    pickerTrigger: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, height: 50, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pickerPlaceholder: { fontSize: 16, color: '#999' },
    addManualButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 8,
        padding: 15,
        borderStyle: 'dashed',
        marginRight: 8,
    },
    pickerText: { fontSize: 16, color: '#333' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 50, fontSize: 16, color: '#333' },
    addAnotherButton: { borderWidth: 1, borderColor: '#007bff', borderRadius: 8, padding: 15, alignItems: 'center', borderStyle: 'dashed', marginHorizontal: 2, marginTop: 30 },
    addAnotherText: { color: '#007bff', fontWeight: 'bold' },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#E0E0E0', backgroundColor: '#FFFFFF', position: 'absolute', bottom: 0, left: 0, right: 0 },
    submitButton: { backgroundColor: '#007AFF', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    emptyProductList: { height: 150, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed', marginHorizontal: 16 },
    emptyProductText: { color: '#999' },
    productCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0', marginHorizontal: 16 },
    // Styles untuk Modal
    iconPlaceholder: {
        color: '#888',
    },
    scanButtonText: {
        color: '#333',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    addManualButtonText: {
        color: '#007bff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    scanButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFEFEF',
        borderRadius: 8,
        padding: 15,
        marginLeft: 8,
    },
    addProductActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContent: { backgroundColor: 'white', maxHeight: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    optionButton: { paddingVertical: 15, paddingHorizontal: 20 },
    optionText: { fontSize: 16, color: '#333' },
    separator: { height: 1, backgroundColor: '#f0f0f0' },
    addButton: { paddingVertical: 15, paddingHorizontal: 20 },
    addButtonText: { fontSize: 16, color: '#007bff', fontWeight: 'bold' },
});
