import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { DetailTransactionScreenProps, TransactionQueryResult } from '../../types/type';
import { getDetailTransanction } from '../../services/transactionservices';
import { createDatabse } from '../../database/db';
// import { useRoute, useFocusEffect } from '@react-navigation/native'; // Hook yang akan Anda gunakan
// import { getTransactionDetails } from './path/to/your/db/functions'; // Fungsi DB Anda

// =================================================================
// LANGKAH 1: DEFINISIKAN TIPE DATA SESUAI HASIL QUERY ANDA
// =================================================================

// Tipe ini merepresentasikan satu baris hasil mentah dari query SQL Anda


// Tipe ini merepresentasikan data yang sudah diolah dan siap ditampilkan di UI
type GroupedProduct = {
    name: string;
    // Setiap produk sekarang memiliki array berisi detail ukuran dan kuantitasnya
    quantities: {
        size: string;
        quantity: number;
    }[];
};

// Tipe ini merepresentasikan data yang sudah diolah dan siap untuk di UI
type TransactionDisplayData = {
    header: {
        createdAt: string;
        origin: string;
        destination: string | null;
        status: string;
        type: string;
        employee: string;
    };
    products: GroupedProduct[]; // Menggunakan tipe produk yang sudah dikelompokkan
    totalQuantity: number;
};

// --- Komponen untuk menampilkan header transaksi ---
const TransactionHeaderCard = ({ header }: { header: TransactionDisplayData['header'] }) => {
    const getStatusStyle = (status: string) => {
        if (status.toLowerCase() === 'completed') { return styles.statusBadgeCompleted; }
        if (status.toLowerCase() === 'pending') { return styles.statusBadgePending; }
        return styles.statusBadgeFailed;
    };

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.transactionId}>Transaction Details</Text>
                <View style={[styles.statusBadge, getStatusStyle(header.status)]}>
                    <Text style={styles.statusText}>{header.status}</Text>
                </View>
            </View>
            <Text style={styles.infoText}>Created at: {new Date(header.createdAt).toLocaleString()}</Text>
            <Text style={styles.infoText}>Type: {header.type}</Text>
            <Text style={styles.infoText}>Origin: {header.origin}</Text>
            {header.destination && <Text style={styles.infoText}>Destination: {header.destination}</Text>}
            <Text style={styles.infoText}>By Employee: {header.employee}</Text>
        </View>
    );
};

// --- PERBAIKAN: Komponen untuk menampilkan daftar produk yang sudah dikelompokkan ---
const ProductSummaryCard = ({ products, totalQuantity }: { products: TransactionDisplayData['products'], totalQuantity: number }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>Product Summary</Text>
        {products.map((product, index) => (
            <View key={index} style={styles.productGroup}>
                <Text style={styles.productGroupName}>{product.name}</Text>
                {product.quantities.map((item, subIndex) => (
                    <View key={subIndex} style={styles.sizeDetailRow}>
                        <Text style={styles.sizeLabel}>Size: {item.size}</Text>
                        <Text style={styles.value}>{item.quantity} units</Text>
                    </View>
                ))}
            </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.row}>
            <Text style={styles.boldLabel}>Total Quantity</Text>
            <Text style={styles.boldValue}>{totalQuantity} units</Text>
        </View>
    </View>
);

const TransactionDetailScreen = ({ route }: DetailTransactionScreenProps) => {

    const [transactionData, setTransactionData] = useState<TransactionDisplayData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { id } = route.params?.sendid;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const db = await createDatabse();
                const flatResults: TransactionQueryResult[] = await getDetailTransanction(db, id);

                if (flatResults.length === 0) {
                    // Handle kasus jika transaksi tidak ditemukan
                    setTransactionData(null);
                    return;
                }

                // 2. Olah data mentah menjadi struktur yang siap ditampilkan
                const headerInfo = {
                    createdAt: flatResults[0].created_at,
                    origin: flatResults[0].origin_entity_name,
                    destination: flatResults[0].destination_entity_name,
                    status: flatResults[0].status_name,
                    type: flatResults[0].tipe_transaksi,
                    employee: flatResults[0].employee_code,
                };

                const groupedProducts = flatResults.reduce<GroupedProduct[]>((acc, item) => {
                    let product = acc.find(p => p.name === item.product_name);
                    if (!product) {
                        product = { name: item.product_name, quantities: [] };
                        acc.push(product);
                    }
                    product.quantities.push({ size: item.size_name, quantity: item.quantity });
                    return acc;
                }, []);

                const total = flatResults.reduce((sum, item) => sum + item.quantity, 0);

                setTransactionData({
                    header: headerInfo,
                    products: groupedProducts,
                    totalQuantity: total,
                });

            } catch (error) {
                console.error('Gagal mengambil detail transaksi:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (!transactionData) {
        return <View style={styles.centered}><Text>Transaction not found.</Text></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <TransactionHeaderCard header={transactionData.header} />
                <ProductSummaryCard products={transactionData.products} totalQuantity={transactionData.totalQuantity} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    container: { padding: 16 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    transactionId: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1c1c1e',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusBadgeCompleted: { backgroundColor: '#d4edda' },
    statusBadgePending: { backgroundColor: '#fff3cd' },
    statusBadgeFailed: { backgroundColor: '#f8d7da' },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoText: {
        fontSize: 14,
        color: '#6c757d',
        lineHeight: 22,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1c1c1e',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 15,
        color: '#3c3c43',
        flex: 1,
    },
    value: {
        fontSize: 15,
        color: '#3c3c43',
        textAlign: 'right',
    },
    boldLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    boldValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e5ea',
        marginVertical: 12,
    },
    // Style baru untuk tampilan produk yang dikelompokkan
    productGroup: {
        marginBottom: 16,
    },
    productGroupName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1c1c1e',
        marginBottom: 8,
    },
    sizeDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 16, // Indentasi untuk detail ukuran
        marginBottom: 6,
    },
    sizeLabel: {
        fontSize: 14,
        color: '#6c757d',
    },
});

export default TransactionDetailScreen;
