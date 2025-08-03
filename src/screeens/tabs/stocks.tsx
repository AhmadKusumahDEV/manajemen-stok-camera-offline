/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Keyboard,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { cateogryId, InventoryItem, StockScreenProps } from '../../types/type';
import FilterModal from '../components/filter';
import { ConfirmationModal } from '../components/confimationmodal';
import { FilterIcon, SearchIcon } from '../../assets/images';
import { useAuth } from '../../context/authcontext';
import { createDatabse } from '../../database/db';
import { getAllCategory } from '../../services/categoryservices';
import { getInventoryData } from '../../services/Stockservices';


const SvgIcon = ({ name, size }: { name: string; size?: number }) => {
  let iconText = '';
  switch (name) {
    case 'check-circle':
      iconText = '✓';
      break;
    case 'alert':
      iconText = '!';
      break;
    case 'clock-alert':
      iconText = '[⏳]';
      break;
    case 'edit':
      iconText = '[E]';
      break;
    case 'delete':
      iconText = '[D]';
      break;
    case 'next':
      iconText = '[>]';
      break;
    case 'filter':
      iconText = '[F]';
      break;
    case 'search':
      iconText = '[S]';
      break;
    case 'plus':
      iconText = '[+]';
      break;
    default:
      iconText = '[?]';
  }
  return <Text style={{ fontSize: size || 16, color: '#6c757d' }}>{iconText}</Text>;
};


const StockStatus = ({ stock }: { stock: number }) => {
  const getStatus = () => {
    if (stock > 50) {
      return { color: '#28a745', iconName: 'check-circle', text: 'in stock' };
    } else if (stock > 10) {
      return { color: '#ffc107', iconName: 'alert', text: 'in stock' };
    } else {
      return { color: '#dc3545', iconName: 'clock-alert', text: 'in stock' };
    }
  };

  const status = getStatus();

  return (
    <View style={styles.stockContainer}>
      {/* Menggunakan SvgIcon di sini */}
      <SvgIcon name={status.iconName} />
      <Text style={[styles.stockText, { color: status.color }]}>
        {stock} {status.text}
      </Text>
    </View>
  );
};

type StockCardProps = {
  item: InventoryItem;
  navigation: StockScreenProps;
  onOpenDeleteModal: () => void;
};

const StockCard = ({ item, navigation: navigasi, onOpenDeleteModal }: StockCardProps) => {
  const handlePress = () => {
    if (item === null) {
      onOpenDeleteModal();
      return null;
    }
    console.log(`Navigating to detail for product ID: ${item.code_product}`);
    navigasi.navigation.navigate('detail_stock', { sendid: { id: item.code_product } });
  };


  return (
    <TouchableOpacity onPress={handlePress} style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.productcategory}>Category: {item.category?.name}</Text>
        <StockStatus stock={item.quantity} />
      </View>
      {/* <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => navigasi.navigation.navigate('edit_product', { productID: item.code_product })}>
          <EditIcon />
        </TouchableOpacity>
        <View style={{ marginHorizontal: 18 }}>
          <TouchableOpacity onPress={handleDeletePress}>
            <DeleteIcon />
          </TouchableOpacity>
        </View>
      </View> */}
    </TouchableOpacity>
  );
};


const StockScreen = ({ navigation, route }: StockScreenProps) => {
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<InventoryItem[]>([]);
  const [allStock, setAllStock] = useState<InventoryItem[]>([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [category, setcategory] = useState<cateogryId[]>([]);
  const [stockToDelete, setstockToDelete] = useState<InventoryItem | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    const getdatastock = async () => {
      const db = await createDatabse();
      const categorys = await getAllCategory();
      const inventorydata = await getInventoryData(db, session?.warehouse_code);
      setcategory(categorys);
      setAllStock(inventorydata);
      setFilteredProducts(inventorydata);
    };

    getdatastock();
  }, [session?.warehouse_code]);

  useEffect(() => {
    let result = allStock;

    if (searchQuery.trim() !== '') {
      result = result.filter(
        (stock) =>
          stock.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter berdasarkan Kategori yang Dipilih
    if (selectedCategories.length > 0) {
      result = result.filter((product) => {
        const productId = product.category?.id;

        if (productId === undefined) {
          return false;
        }

        return selectedCategories.includes(productId);
      });
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategories, allStock]);

  // handler function modal delete
  const handleOpenDeleteModal = (stock: InventoryItem) => {
    setstockToDelete(stock);
    setIsDeleteModalVisible(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setstockToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!stockToDelete) { return; }

    console.log(`Menghapus produk: ${stockToDelete.product_name} (ID: ${stockToDelete.code_product})`);

    setAllStock(prevProducts =>
      prevProducts.filter(p => p.code_product !== stockToDelete.code_product)
    );

    // Tutup modal
    handleCloseDeleteModal();
  };

  const handleCancelSearch = () => {
    setIsSearchActive(false);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const handleSearchPress = () => {
    setIsSearchActive(true);
  };

  const handleToggleCategory = (categoryId: string) => {
    const categoryIdAsNumber = parseInt(categoryId, 10);

    if (isNaN(categoryIdAsNumber)) {
      console.error('Invalid categoryId provided:', categoryId);
      return;
    }

    setSelectedCategories((prev) =>
      prev.includes(categoryIdAsNumber)
        ? prev.filter((id) => id !== categoryIdAsNumber)
        : [...prev, categoryIdAsNumber]
    );
  };

  const handleAddCategory = () => {
    // add category direct to anonther page
    setIsFilterModalVisible(false); // Tutup modal
    Alert.alert('proses tahap testing');
  };

  const renderSubHeader = () => {
    if (isSearchActive) {
      // Jika mode search aktif, tampilkan TextInput
      return (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true} // fokus keyboard
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Stocks</Text>
          <TouchableOpacity>
            <Image source={{ uri: session?.avatarUrl }} style={styles.userAvatar} />
          </TouchableOpacity>
        </View>

        {/* rendering sub header */}
        {renderSubHeader()}

        <FilterModal
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          categories={category}
          selectedCategories={selectedCategories}
          onCategoryChange={handleToggleCategory}
          onAddCategory={handleAddCategory}
        />

        {/* Daftar Produk */}
        <FlatList
          // Gunakan state `filteredProducts` sebagai data
          data={filteredProducts}
          renderItem={({ item }) => (
            <StockCard item={item} navigation={{ navigation, route }} onOpenDeleteModal={() => handleOpenDeleteModal(item)} />
          )}
          keyExtractor={(item) => item.code_product}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={ // Tampilan jika hasil pencarian kosong
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          }
        />

        {stockToDelete && (
          <ConfirmationModal
            visible={isDeleteModalVisible}
            title="Confirm Deletion"
            message={
              <View>
                <Text style={{ textAlign: 'center' }}>Are you sure you want to delete this product?</Text>
                <Text style={{ fontWeight: 'bold', marginTop: 10, textAlign: 'center' }}>
                  {stockToDelete.product_name}
                </Text>
                <Text style={{ color: '#666', textAlign: 'center' }}>SKU: {stockToDelete.code_product}</Text>
              </View>
            }
            onCancel={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            confirmButtonText="Delete"
          />
        )}

        {/* {!isSearchActive && ( // menghlangkan button tambah bila search active
          <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('add_stok', { scannedBarcode: undefined })}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        )} */}
      </View>
    </SafeAreaView>
  );
};

// --- Stylesheet (dengan beberapa penyesuaian kecil) ---
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
  headerTitle: { fontSize: 23, fontWeight: 'bold', color: '#343a40' },
  avatar: { width: 32, height: 32, borderRadius: 22, backgroundColor: '#f4a261' },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  userAvatar: { width: 32, height: 32, borderRadius: 22, backgroundColor: '#f4a261' },
  warehouseText: { fontSize: 16, fontWeight: '600', color: '#495057' },
  filterIcons: { flexDirection: 'row' },
  listContainer: { paddingBottom: 80 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButton: {
    marginLeft: 10,
    padding: 5,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  cardContent: { flex: 1 },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#343a40', marginBottom: 4 },
  productSku: { fontSize: 13, color: '#6c757d', marginBottom: 2 },
  productcategory: { fontSize: 13, color: '#6c757d', marginBottom: 12 },
  stockContainer: { flexDirection: 'row', alignItems: 'center' },
  stockText: { marginLeft: 6, fontSize: 13, fontWeight: '500' },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    height: 50, // Samakan tinggi dengan subHeader
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
});

export default StockScreen;
