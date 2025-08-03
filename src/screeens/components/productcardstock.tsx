import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProductStockCardProps } from '../../types/type';
import React, { useCallback, useState } from 'react';
import { SizeStepper } from './sizeStepper';
import { DeleteIcon } from '../../assets/images';
import { CustomPickerModal } from './picker';
import { useFocusEffect } from '@react-navigation/native';
import { getAllSize } from '../../services/sizeservices';

export const ProductStockCard = ({
    item,
    onQuantityChange,
    onAddSize,
    onRemoveProduct,
}: ProductStockCardProps) => {

    const [pickerVisible, setPickerVisible] = useState<boolean>(false);
    const [size, setSize] = useState<{ label: string, value: string }[]>([]);

    const { product, stockEntries } = item;
    const totalStock = stockEntries.reduce((sum, entry) => sum + entry.quantity, 0);

    useFocusEffect(
        // Gunakan useCallback untuk mencegah effect berjalan ulang tanpa henti
        useCallback(() => {
            console.log('Layar Warehouse menjadi fokus, mengambil data terbaru...');

            const fetchData = async () => {
                try {
                    const result = await getAllSize();
                    console.log(result);
                    setSize(result);
                } catch (error) {
                    console.error('Gagal mengambil data warehouse:', error);
                }
            };

            fetchData();

            // Anda bisa menambahkan fungsi cleanup di sini jika perlu
            return () => {
                console.log('Layar Warehouse tidak lagi fokus.');
            };
        }, []) // Dependency array kosong untuk useCallback
    );

    const addsize = () => {
        console.log('add size');
    };

    const handleSelect = (option: { label: string; value: string }) => {
        onAddSize(product.product_code, Number(option.value), option.label);
        setPickerVisible(false);
    };

    return (
        <View style={cardStyles.card}>
            <View style={cardStyles.cardHeader}>
                <View style={cardStyles.cardHeaderTextContainer}>
                    <Text style={cardStyles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
                        {product.product_name}
                    </Text>
                    <Text style={cardStyles.cardSubtitle}>Total Stock: {totalStock} units</Text>
                </View>

                <TouchableOpacity onPress={() => onRemoveProduct(product.product_code)}>
                    <DeleteIcon />
                </TouchableOpacity>
            </View>

            {stockEntries.map(entry => (
                <SizeStepper
                    key={entry.sizeId}
                    entry={entry}

                    onQuantityChange={(sizeId, newQuantity) =>
                        onQuantityChange(product.product_code, sizeId, newQuantity)
                    }
                />
            ))}

            <TouchableOpacity style={cardStyles.addSizeButton} onPress={() => setPickerVisible(true)}>
                <Text style={cardStyles.addSizeButtonText}>Add another size</Text>
            </TouchableOpacity>

            <CustomPickerModal
                options={size}
                visible={pickerVisible}
                title={'Select Size'}
                onClose={() => setPickerVisible(false)}
                onSelect={handleSelect}
                onAddItem={addsize}
            />
        </View>
    );
};

// cardStylesheet khusus untuk ProductStockCard
const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 18,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 12,
        marginBottom: 12,
    },
    cardHeaderTextContainer: {
        flex: 1, // <-- INI KUNCINYA
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    addSizeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    addSizeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    iconPlaceholder: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: 'bold',
    },
});
