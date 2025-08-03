import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Pressable,
} from 'react-native';
import { DetailInventoryScreenProps, InventoryDetail } from '../../types/type';
import { createDatabse } from '../../database/db';
import { getDetailInventoryData } from '../../services/Stockservices';
import { useAuth } from '../../context/authcontext';

const IconPlaceholder = ({ name }: { name: string }) => (
    <View style={styles.iconPlaceholder}>
        <Text style={styles.iconPlaceholderText}>{name.charAt(0)}</Text>
    </View>
);



type DetailItemProps = {
    iconName: string;
    label: string;
    value?: string;
};

const DetailItem = ({ iconName, label, value }: DetailItemProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongText = value && value.length > 15;

    return (
        <View style={styles.detailItemContainer}>
            <View style={styles.detailItemIcon}>
                <IconPlaceholder name={iconName} />
            </View>
            <View style={styles.detailItemTextContainer}>
                <Text style={styles.detailItemLabel}>{label}</Text>
                <Pressable onPress={() => isLongText && setIsExpanded(!isExpanded)}>
                    <Text style={styles.detailItemValue} numberOfLines={isExpanded ? undefined : 1}>
                        {isLongText && !isExpanded ? `${value.substring(0, 15)}...` : value}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

const SizeStockRow = (item: { name: string; quantity: number }) => {
    // Fungsi untuk menentukan warna status stok
    const getStockStatusColor = (quantity: number) => {
        if (quantity < 10) { return '#FF3B30'; } // Merah untuk stok sangat sedkit
        if (quantity < 20) { return '#FFCC00'; } // Kuning untuk stok sedikit
        return '#34C759';
    };

    return (
        <View style={styles.sizeRow}>
            <View style={styles.sizeNameContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: getStockStatusColor(item.quantity) }]} />
                <Text style={styles.sizeName}>{item.name}</Text>
            </View>
            <Text style={styles.sizeQuantity}>{item.quantity} units</Text>
        </View>
    );
};




// Komponen Layar Utama
export const StockDetailScreen = ({ route }: DetailInventoryScreenProps) => {
    const [detailInventory, setDetailInvnetory] = useState<InventoryDetail | null>(null);
    const { id } = route.params?.sendid;
    const { session } = useAuth();

    useEffect(() => {
        const fetchInventoryDetail = async () => {
            try {
                const db = await createDatabse();
                const result = await getDetailInventoryData(db, session?.warehouse_code ?? undefined, id);
                setDetailInvnetory(result);
            } catch (error) {
                console.error('Error fetching inventory detail:', error);
            }
        };

        fetchInventoryDetail();
    }, [id, session?.warehouse_code]);

    if (!detailInventory) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* --- KARTU UTAMA --- */}
                <View style={styles.card}>
                    {/* Bagian Info Produk */}
                    <View style={styles.section}>
                        <Text style={styles.productName}>{detailInventory?.product_name}</Text>
                        <Text style={styles.description}>{detailInventory?.description}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <DetailItem
                            iconName="Package"
                            label="Product Code"
                            value={detailInventory?.sku}
                        />
                        <DetailItem
                            iconName="Warehouse"
                            label="Warehouse"
                            value={session?.warehouse_name}
                        />
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Stock Details by Size</Text>
                        {detailInventory?.size.map((item, index) => (
                            <SizeStockRow key={index} name={item.name} quantity={item.quantity} />
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                    <Text style={styles.actionButtonText}>Edit Stock</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F0F2F5',
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 120,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    section: {
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: '#666',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 20,
    },
    detailItemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    detailItemIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    detailItemTextContainer: {
        flex: 1,
    },
    detailItemLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 4,
    },
    detailItemValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    sizeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    sizeNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
    },
    sizeName: {
        fontSize: 16,
        color: '#555',
    },
    sizeQuantity: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 30,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    actionButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Style untuk Icon Placeholder
    iconPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EAEAEA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconPlaceholderText: {
        color: '#888',
        fontWeight: 'bold',
    },
});
