import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { DeleteIcon, EditIcon, IconHome, SearchIcon } from '../../assets/images';
import { Warehouse, WarehouseScreenProps } from '../../types/type';
import { useAuth } from '../../context/authcontext';
import { createDatabse } from '../../database/db';
import { deleteWarehouse, getWarehouses } from '../../services/warehouseservices';
import { useFocusEffect } from '@react-navigation/native';


const WarehouseCard = ({ warehouse, navigation, triggerrefresh }: { warehouse: Warehouse, navigation: WarehouseScreenProps, triggerrefresh: () => void }) => {
  const handlerremovewarehouse = async (id: string) => {
    const db = await createDatabse();
    await deleteWarehouse(db, id);
    triggerrefresh();
  };

  const handlerpopup = async () => {
    Alert.alert('remove warehouse', 'Apakah Anda yakin ingin menghapus warehouse?', [
      { text: 'Tidak', style: 'cancel' },
      {
        text: 'Ya', onPress: async () => {
          await handlerremovewarehouse(warehouse.warehouse_code);
        },
      },
    ]);
  };

  return (
    // Seluruh kartu adalah tombol untuk melihat detail
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigation.navigate('detail_warehouse', { sendid: { id: warehouse.warehouse_code } })}
      activeOpacity={0.7}
    >
      <View style={styles.warehouseIconContainer}>
        <IconHome />
      </View>

      <View style={styles.warehouseInfo}>
        <Text style={styles.warehouseName}>{warehouse.warehouse_name}</Text>
        <Text style={styles.warehouseAddress}>{warehouse.location_description?.substring(0, 17)}...</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigation.navigate('edit_warehouse', { sendid: { id: warehouse.warehouse_code } })}>
          <EditIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handlerpopup()}>
          <DeleteIcon />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};


// --- Komponen Layar Utama ---
const WarehouseScreen = ({ navigation, route }: WarehouseScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouse, setwarehouse] = useState<Warehouse[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { session } = useAuth();

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    const fetchData = async () => {
      try {
        const db = await createDatabse();
        const result = await getWarehouses(db);
        setwarehouse(result);
      } catch (error) {
        console.error('Gagal mengambil data warehouse:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchData();
  }, []);


  useFocusEffect(

    useCallback(() => {
      console.log('Layar Warehouse menjadi fokus, mengambil data terbaru...');

      const fetchData = async () => {
        try {
          const db = await createDatabse();
          const result = await getWarehouses(db);
          setwarehouse(result);
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

  const filteredWarehouses = warehouse.filter(w =>
    w.warehouse_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Warehouse</Text>
          <TouchableOpacity onPress={() => navigation.navigate('profil', { sendid: { id: session?.user_id, avatarurl: session?.avatarUrl as string } })}>
            <Image source={{ uri: session?.avatarUrl }} style={styles.userAvatar} />
          </TouchableOpacity>
        </View>

        {/* Sub-Header (Search Bar) */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Warehouses"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <FlatList
          data={filteredWarehouses}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <WarehouseCard warehouse={item} navigation={{ navigation, route }} triggerrefresh={refresh} />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.listTitle}>All Warehouses</Text>}
          // Penyesuaian posisi agar item terakhir tidak tertutup FAB
          contentContainerStyle={styles.listContainer}
          onRefresh={refresh}
          refreshing={isRefreshing}
        />

        {/* Floating Action Button (FAB) untuk menambah gudang */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('add_warehouse')}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


// --- StyleSheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Latar belakang sedikit abu-abu
  },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 23, fontWeight: 'bold', color: '#343a40' },
  searchSection: {
    paddingBottom: 10,
  },
  avatar: { width: 32, height: 32, borderRadius: 22, backgroundColor: '#f4a261' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchInput: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    fontSize: 16,
    color: '#1c1c1e',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginTop: 20,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 2,
    paddingBottom: 100, // Memberi ruang di bawah untuk FAB
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  userAvatar: { width: 32, height: 32, borderRadius: 22, backgroundColor: '#f4a261' },
  warehouseIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    marginLeft: 11,
  },
  warehouseInfo: {
    flex: 1,
  },
  warehouseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  warehouseAddress: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabText: {
    fontSize: 30,
    color: '#FFFFFF',
    lineHeight: 32,
  },
});

export default WarehouseScreen;
