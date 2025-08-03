/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal, // Ditambahkan untuk status picker
    TouchableWithoutFeedback, // Ditambahkan untuk status picker
} from 'react-native';
import { ScanningScreenProps, TransactionQueryResultSpesific } from '../../types/type';
import { getDataProcessTransanction, removestockinventory, updateTransactionStatus, upsertInventory } from '../../services/transactionservices';
import { createDatabse } from '../../database/db';
import { CameraIcon } from '../../assets/images';
import { useCameraPermission } from 'react-native-vision-camera';
import { useAuth } from '../../context/authcontext';
import { getWarehouseCode } from '../../services/warehouseservices';
// import { useRoute, useFocusEffect } from '@react-navigation/native';
// import { getTransactionDetails, updateTransactionStatus, updateInventoryFromTransaction } from './path/to/db/functions';

// Tipe untuk satu item detail dalam transaksi


type ProcessedTransaction = {
    id_transaction: number;
    status: string;
    details: TransactionQueryResultSpesific[];
};


type StatusOption = {
    label: string;
    value: 'Completed' | 'Failed';
};

type ProductProcessCardProps = {
    item: TransactionQueryResultSpesific;
    onScan: () => void;
};

const ProductProcessCard = ({ item, onScan }: ProductProcessCardProps) => {
    const isCompleted = item.scanner_quantity >= item.quantity;
    const pendingQuantity = item.quantity - item.scanner_quantity;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.productName}>{item.product_name}</Text>
                <Text style={styles.sizeName}>Size: {item.size_name}</Text>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.quantityInfo}>
                    <Text style={styles.quantityLabel}>Expected</Text>
                    <Text style={styles.quantityValue}>{item.quantity}</Text>
                </View>
                <View style={styles.quantityInfo}>
                    <Text style={styles.quantityLabel}>Scanned</Text>
                    <Text style={[styles.quantityValue, { color: isCompleted ? '#34C759' : '#111' }]}>
                        {item.scanner_quantity}
                    </Text>
                </View>
                <TouchableOpacity style={styles.scanItemButton} onPress={() => onScan()}>
                    <CameraIcon />
                    <Text style={styles.scanItemButtonText}>Scan Item</Text>
                </TouchableOpacity>
            </View>
            {!isCompleted && (
                <View style={styles.pendingFooter}>
                    <Text style={styles.pendingText}>{pendingQuantity} more to scan</Text>
                </View>
            )}
        </View>
    );
};


const ProcessTransactionScreen = ({ navigation, route }: ScanningScreenProps) => {
    const { transaction_id, type_transacion } = route.params;

    const [transaction, setTransaction] = useState<ProcessedTransaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStatusModalVisible, setStatusModalVisible] = useState(false); // State untuk modal status
    const { hasPermission, requestPermission } = useCameraPermission();
    const { session } = useAuth();
    // Opsi untuk picker status
    const statusOptions: StatusOption[] = [
        { label: 'Completed', value: 'Completed' },
        { label: 'Failed', value: 'Failed' },
    ];

    const handleScanBarcode = async () => {
        // Cek perizinan terlebih dahulu
        if (hasPermission) {
            // Jika sudah ada izin, langsung navigasi
            console.log('Izin sudah ada, membuka kamera...');
            navigation.navigate('barcode', { targetScreen: 3 });
        } else {
            // Jika belum ada izin, meminta izin
            console.log('Meminta izin kamera...');
            const isPermissionGranted = await requestPermission();
            if (isPermissionGranted) {
                console.log('Izin diberikan, membuka kamera...');
                navigation.navigate('barcode', { targetScreen: 3 });
            } else {
                console.log('Izin ditolak.');
                Alert.alert('Izin Ditolak', 'Anda perlu memberikan izin kamera untuk menggunakan fitur ini.');
            }
        }
    };

    useEffect(() => {
        const scannedCode = route.params?.scannedBarcode;

        if (!scannedCode) { return; }
        handleScan(scannedCode);
        navigation.setParams({ scannedBarcode: undefined });
    }, [navigation, route.params?.scannedBarcode]);

    useEffect(() => {
        const fetchData = async () => {
            if (type_transacion === 'inbound') {
                console.log('Fetching inbound transaction details...');
            } else if (type_transacion === 'outbound') {
                console.log('Fetching outbound transaction details...');
            } else {
                console.log('Invalid transaction type.');
            }
            setIsLoading(true);
            try {
                const db = await createDatabse();
                const dummyFlatResults: TransactionQueryResultSpesific[] = await getDataProcessTransanction(db, String(transaction_id));

                if (dummyFlatResults.length > 0) {
                    const processedData: ProcessedTransaction = {
                        id_transaction: Number(transaction_id),
                        status: dummyFlatResults[0].status_name,
                        details: dummyFlatResults,
                    };
                    setTransaction(processedData);
                }
            } catch (error) {
                console.error('Gagal memuat transaksi:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [transaction_id]);

    // Handler untuk scan (simulasi)
    const handleScan = (barcode: string) => {
        if (!transaction) { return; }
        const updatedDetails = transaction.details.map(item => {
            if (item.barcode === barcode && item.scanner_quantity < item.quantity) {
                return { ...item, scanner_quantity: item.scanner_quantity + 1 };
            }
            return item;
        });
        setTransaction({ ...transaction, details: updatedDetails });
    };

    // Handler untuk mengubah status (tetap sama, tapi dipanggil dari modal)
    const handleUpdateStatus = async (newStatus: 'Completed' | 'Failed') => {
        if (!transaction) { return; }
        Alert.alert(
            `Confirm ${newStatus}`,
            'apakah semua product sudah di scanned ?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            const db = await createDatabse();
                            setIsLoading(true);
                            if (newStatus === 'Completed') {
                                if (type_transacion === 'inbound') {
                                    console.log(transaction.details);
                                    const temp: { code_product: string; id_size: number; code_warehouse: string; quantity: number }[] = [];
                                    transaction.details.forEach(item => {
                                        temp.push({
                                            code_product: item.code_product,
                                            id_size: item.id_size,
                                            code_warehouse: session?.warehouse_code as string,
                                            quantity: item.quantity,
                                        });
                                    });
                                    await upsertInventory(db, temp);
                                    await updateTransactionStatus(db, transaction_id as number, 3);
                                    navigation.navigate('home', { screen: 'transaction' });
                                    return;
                                } else if (type_transacion === 'outbound') {
                                    console.log(transaction.details);
                                    const temp: { code_product: string; id_size: number; code_warehouse: string; quantity: number }[] = [];
                                    transaction.details.forEach(item => {
                                        temp.push({
                                            code_product: item.code_product,
                                            id_size: item.id_size,
                                            code_warehouse: session?.warehouse_code as string,
                                            quantity: -Math.abs(item.quantity),
                                        });
                                    });
                                    await removestockinventory(db, temp);
                                    await updateTransactionStatus(db, transaction_id as number, 3);
                                    navigation.navigate('home', { screen: 'transaction' });
                                    return;
                                } else {
                                    const warehousecode_origin = await getWarehouseCode(db, transaction.details[0].origin_entity_name as string);
                                    const warehousecode_destination = await getWarehouseCode(db, transaction.details[0].destination_entity_name as string);
                                    const temp: { code_product: string; id_size: number; code_warehouse: string; quantity: number }[] = [];
                                    const temp_destination: { code_product: string; id_size: number; code_warehouse: string; quantity: number }[] = [];
                                    transaction.details.forEach(item => {
                                        temp.push({
                                            code_product: item.code_product,
                                            id_size: item.id_size,
                                            code_warehouse: warehousecode_origin,
                                            quantity: -Math.abs(item.quantity),
                                        });
                                    });

                                    transaction.details.forEach(item => {
                                        temp_destination.push({
                                            code_product: item.code_product,
                                            id_size: item.id_size,
                                            code_warehouse: warehousecode_destination,
                                            quantity: item.quantity,
                                        });
                                    });
                                    await removestockinventory(db, temp);
                                    await removestockinventory(db, temp_destination);
                                    await updateTransactionStatus(db, transaction_id as number, 3);
                                    navigation.navigate('home', { screen: 'transaction' });
                                }
                            } else if (newStatus === 'Failed') {
                                console.log('LOGIC: wrong inventory...');
                            }
                            // fetchData(transaction.id_transaction);
                            Alert.alert('Success', `Transaction has been marked as ${newStatus}.`);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to update transaction.');
                            console.error(error);
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleStatusSelect = (option: StatusOption) => {
        setStatusModalVisible(false);
        handleUpdateStatus(option.value);
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (!transaction) {
        return <View style={styles.centered}><Text>Transaction not found.</Text></View>;
    }

    const isPending = transaction.status.toLowerCase() === 'pending';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity
                    style={styles.headerCard}
                    onPress={() => isPending && setStatusModalVisible(true)}
                    disabled={!isPending}
                >
                    <Text style={styles.headerLabel}>Transaction Status</Text>
                    <View style={styles.statusContainer}>
                        <Text style={styles.headerStatus}>{transaction.status}</Text>
                        {isPending && <Text style={styles.statusArrow}>▼</Text>}
                    </View>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Products to Process</Text>

                {transaction.details.map(item => (
                    <ProductProcessCard
                        key={item.id}
                        item={item}
                        onScan={handleScanBarcode}
                    />
                ))}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isStatusModalVisible}
                onRequestClose={() => setStatusModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setStatusModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Update Status</Text>
                                {statusOptions.map(option => (
                                    <TouchableOpacity key={option.value} style={styles.optionButton} onPress={() => handleStatusSelect(option)}>
                                        <Text style={styles.optionText}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    container: { padding: 16, paddingBottom: 150 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerLabel: {
        fontSize: 14,
        color: '#6c757d',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    headerStatus: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1c1c1e',
    },
    statusArrow: {
        fontSize: 14,
        color: '#007AFF',
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    cardHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    sizeName: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 4,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    quantityInfo: {
        alignItems: 'center',
    },
    quantityLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    quantityValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scanItemButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    scanItemButtonText: {
        color: '#000000',
        fontWeight: '600',
        marginLeft: 8,
    },
    pendingFooter: {
        backgroundColor: '#fff3cd',
        paddingVertical: 8,
        alignItems: 'center',
    },
    pendingText: {
        color: '#856404',
        fontSize: 12,
        fontWeight: '500',
    },
    iconPlaceholder: {
    },
    // Styles untuk Modal Status
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
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
        fontSize: 18,
        textAlign: 'center',
        color: '#007AFF',
    },
});

export default ProcessTransactionScreen;

