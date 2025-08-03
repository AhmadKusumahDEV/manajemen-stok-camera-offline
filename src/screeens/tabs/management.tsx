import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { ManagementScreenProps } from '../../types/type';
// import { ManagementScreenProps } from '../../types/type'; // Asumsikan Anda punya tipe ini

// --- Komponen Ikon Placeholder ---
const IconPlaceholder = ({ name }: { name: string }) => {
    // Placeholder sederhana, ganti dengan komponen SVG Anda
    return <View style={styles.iconBackground}><Text style={styles.iconText}>{name.charAt(0)}</Text></View>;
};

// --- Data untuk Menu Manajemen ---
// Di aplikasi nyata, Anda bisa menambahkan properti 'role' untuk menyembunyikan/menampilkan menu tertentu
const managementItems = [
    {
        key: 'products',
        title: 'Kelola Produk',
        description: 'Tambah, ubah, atau hapus jenis produk dari katalog utama.',
        iconName: 'Produk',
        navigateTo: 'ProductManagement', // Nama layar tujuan
    },
];

// --- Komponen Kartu Menu yang Bisa Digunakan Kembali ---
const ManagementMenuItem = ({ item, onPress }: { item: typeof managementItems[0], onPress: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <IconPlaceholder name={item.iconName} />
        <View style={styles.menuItemTextContainer}>
            <Text style={styles.menuItemTitle}>{item.title}</Text>
            <Text style={styles.menuItemDescription}>{item.description}</Text>
        </View>
        <Text style={styles.menuItemArrow}>{'>'}</Text>
    </TouchableOpacity>
);

// --- Komponen Layar Utama ---
const ManagementScreen = ({ navigation }: ManagementScreenProps) => { // Ganti 'any' dengan ManagementScreenProps

    const handleMenuItemPress = (navigateTo: string) => {
        console.log(`Navigasi ke: ${navigateTo}`);
        navigation.navigate('product');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                data={managementItems}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                    <ManagementMenuItem
                        item={item}
                        onPress={() => handleMenuItemPress(item.navigateTo)}
                    />
                )}
                ListHeaderComponent={
                    <Text style={styles.headerTitle}>Settings & Management</Text>
                }
                contentContainerStyle={styles.container}
            />
        </SafeAreaView>
    );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    container: {
        padding: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1c1c1e',
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    menuItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    iconBackground: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#e9f5ff', // Warna biru muda
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF', // Warna biru
    },
    menuItemTextContainer: {
        flex: 1, // Memastikan teks mengambil sisa ruang
    },
    menuItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1c1c1e',
    },
    menuItemDescription: {
        fontSize: 13,
        color: '#8e8e93',
        marginTop: 4,
        lineHeight: 18,
    },
    menuItemArrow: {
        fontSize: 20,
        color: '#c7c7cc',
        fontWeight: 'bold',
        marginLeft: 12,
    },
});

export default ManagementScreen;
