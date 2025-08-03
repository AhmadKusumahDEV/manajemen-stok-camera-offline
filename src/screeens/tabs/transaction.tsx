/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Alert,
  Image,
} from 'react-native';
import { CameraIcon, FilterIcon, IconChevronRight, SearchIcon } from '../../assets/images';
import FilterModal from '../components/filter';
import { StatusId, Transaction, TransactionScreenProps } from '../../types/type';
import { useAuth } from '../../context/authcontext';
import { useFocusEffect } from '@react-navigation/native';
import { createDatabse } from '../../database/db';
import { getTransanctionFromWarehosueData } from '../../services/transactionservices';

const dummyStatus: StatusId[] = [
  { id: 1, name: 'Completed' },
  { id: 2, name: 'Pending' },
  { id: 3, name: 'Failed' },
];

// Komponen kecil untuk Badge Status agar kode lebih bersih
const StatusBadge = ({ status }: { status: StatusId }) => {
  const getStatusStyle = () => {
    switch (status.name) {
      case 'Completed':
        return { backgroundColor: '#d4edda', color: '#155724' }; // Hijau
      case 'Failed':
        return { backgroundColor: '#f8d7da', color: '#721c24' }; // Merah
      case 'Pending':
      default:
        return { backgroundColor: '#fff3cd', color: '#856404' }; // Kuning
    }
  };

  const style = getStatusStyle();

  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: style.color }]}>{status.name}</Text>
    </View>
  );
};


// Komponen untuk setiap kartu transaksi
const TransactionCard = ({ transaction, navigation }: { transaction: Transaction, navigation: TransactionScreenProps }) => {

  const handlerIconChange = () => {
    return transaction.id_status === 2 ? <CameraIcon /> : <IconChevronRight />;
  };


  const handlePress = () => {
    // Navigasi ke layar 'ProductDetail' dan kirim 'productId' sebagai parameter
    console.log(`Navigating to detail for product ID: ${transaction.id}`);
    // navigasi.navigate(Screens.DETAIL_PRODUCT, { product: item });
    navigation.navigation.navigate('detail_transaction' , { sendid: { id: transaction.id as unknown as string } });
  };

  const handleProcessingtransaction = () => {
    console.log('Processing transaction...');
    navigation.navigation.navigate('scanning', {transaction_id: transaction.id, type_transacion: transaction.tipe_transaksi});
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <View>
        <View style={styles.cardHeader}>
          <StatusBadge status={{ id: transaction.id_status, name: transaction.status_name }} />
          <Text style={styles.timestamp}>{transaction.created_at}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardMainInfo}>
            <Text style={styles.transactionNumber}>Transaction {transaction.code_transaksi}</Text>
            <Text style={styles.subText}>Employee: {transaction.employee_code}</Text>
            {transaction.tipe_transaksi !== 'inbound' ? <Text style={styles.subText}>receive: {transaction.destination_entity_name}</Text> : <Text style={styles.subText}>sender: {transaction.origin_entity_name}</Text>}
            <Text style={styles.subText}>Type: {transaction.tipe_transaksi}</Text>
          </View>
          <TouchableOpacity onPress={handleProcessingtransaction}>
            {handlerIconChange()}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};


// Komponen Layar Utama
const TransactionScreen = ({ navigation, route }: TransactionScreenProps) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]); // Untuk daftar transaksi yang ditampilkan
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Untuk daftar transaksi yang ditampilkan
  const { session } = useAuth();



  useFocusEffect(
    // Gunakan useCallback untuk mencegah effect berjalan ulang tanpa henti
    useCallback(() => {
      console.log('Layar Warehouse menjadi fokus, mengambil data terbaru...');

      const fetchData = async () => {
        try {
          const db = await createDatabse();
          const result = await getTransanctionFromWarehosueData(db, session?.warehouse_name);
          setTransactions(result);
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
    let result = transactions;

    if (searchQuery.trim() !== '') {
      result = result.filter(
        (transaction) =>
          transaction.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.code_transaksi.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter berdasarkan Kategori yang Dipilih
    if (selectedStatus.length > 0) {
      result = result.filter((transaction) => {
        const transactionId = transaction.id_status;

        if (transactionId === undefined) {
          return false;
        }

        return selectedStatus.includes(transactionId);
      });
    }

    setFilteredTransactions(result);
  }, [searchQuery, selectedStatus, transactions]);

  const handleToggleCategory = (statusid: string) => {
    const statusIdAsNumber = parseInt(statusid, 10);

    if (isNaN(statusIdAsNumber)) {
      console.error('Invalid statusid provided:', statusid);
      return;
    }

    setSelectedStatus((prev) =>
      prev.includes(statusIdAsNumber)
        ? prev.filter((id) => id !== statusIdAsNumber) // Bandingkan number dengan number
        : [...prev, statusIdAsNumber] // menambahakan number ke array
    );
  };

  const handleCancelSearch = () => {
    setIsSearchActive(false);
    setSearchQuery(''); // Reset query dan filter
    Keyboard.dismiss(); // Tutup keyboard
  };

  const handleSearchPress = () => {
    setIsSearchActive(true);
  };

  const renderSubHeader = () => {
    if (isSearchActive) {
      // Jika mode search aktif, tampilkan TextInput
      return (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by employee code..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true} // Langsung fokus dan buka keyboard
          />
          <TouchableOpacity onPress={handleCancelSearch} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.subHeader}>
        <Text style={styles.warehouseText}>{session?.warehouse_name}</Text>
        <View style={styles.filterIcons}>
          <TouchableOpacity onPress={() => setIsFilterModalVisible(true)} style={{ marginTop: 4 }}>
            <FilterIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSearchPress} style={{ marginLeft: 16, marginTop: 4 }}>
            <SearchIcon />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleAddCategory = () => {
    // add category direct to anonther page
    setIsFilterModalVisible(false); // Tutup modal
    Alert.alert('Fitur Selanjutnya', 'Anda menekan tombol Tambah Kategori!');
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
          {/* Avatar Icon */}
          <TouchableOpacity onPress={() => navigation.navigate('profil', { sendid: { id: session?.user_id, avatarurl: session?.avatarUrl as string } })}>
            <Image source={{ uri: session?.avatarUrl }} style={styles.userAvatar} />
          </TouchableOpacity>
        </View>
        {/* rendering sub header */}
        {renderSubHeader()}

        <FilterModal
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          categories={dummyStatus}
          selectedCategories={selectedStatus}
          onCategoryChange={handleToggleCategory}
          onAddCategory={handleAddCategory}
        />

        <FlatList
          data={filteredTransactions}
          renderItem={({ item }) => <TransactionCard transaction={item} navigation={{ navigation, route: route }} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('add_transaction', { scannedBarcode: undefined })}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// StyleSheet
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    height: 50,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButton: {
    marginLeft: 10,
    padding: 5,
  },
  headerTitle: { fontSize: 23, fontWeight: 'bold', color: '#343a40' },
  avatar: { width: 32, height: 32, borderRadius: 22, backgroundColor: '#f4a261' },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginBottom: 10 },
  warehouseText: { fontSize: 16, fontWeight: '600', color: '#495057' },
  filterIcons: { flexDirection: 'row' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  userAvatar: { width: 32, height: 32, borderRadius: 22, backgroundColor: '#f4a261' },
  timestamp: { marginLeft: 8, fontSize: 12, color: '#6c757d' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between' },
  cardMainInfo: { flex: 1 },
  transactionNumber: { fontSize: 18, fontWeight: 'bold', color: '#212529', marginBottom: 4 },
  subText: { fontSize: 14, color: '#495057', marginBottom: 2 },
  deleteButton: { padding: 8 },
  viewDetails: { color: '#007bff', fontWeight: 'bold', marginTop: 12, fontSize: 14 },
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

export default TransactionScreen;
