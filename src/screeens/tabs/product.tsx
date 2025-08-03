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
  GestureResponderEvent,
} from 'react-native';
import { cateogryId,ProductScreenProps } from '../../types/type';
import FilterModal from '../components/filter';
import { ConfirmationModal } from '../components/confimationmodal';
import { DeleteIcon, EditIcon, FilterIcon, SearchIcon } from '../../assets/images';
import { getAllCategory } from '../../services/categoryservices';
import { getproduct } from '../../services/productservices';
import { createDatabse } from '../../database/db';
// import { useNavigation } from '@react-navigation/native'; // Opsi lain jika tidak ingin pass navigation prop
// import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Untuk typing yang lebih ketat

type ProductCardProps = {
  item: { id: string, name: string, id_category: number, category: string };
  navigation: ProductScreenProps;
  onOpenDeleteModal: () => void;
};

const StockCard = ({ item, navigation: navigasi, onOpenDeleteModal }: ProductCardProps) => {
  const handlePress = () => {
    // Navigasi ke layar 'ProductDetail' dan kirim 'productId' sebagai parameter
    console.log(`Navigating to detail for product ID: ${item.id}`);
    navigasi.navigation.navigate('detail_product', { id: item.id });
  };

  const handleDeletePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onOpenDeleteModal();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productcategory}>Category: {item.category}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => navigasi.navigation.navigate('edit_product', { productID: item.id })}>
          <EditIcon />
        </TouchableOpacity>
        <View style={{ marginHorizontal: 18 }}>
          <TouchableOpacity onPress={handleDeletePress}>
            <DeleteIcon />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};


const ProductScreen = ({ navigation, route }: ProductScreenProps) => {
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false); // Untuk toggle tampilan search bar
  const [searchQuery, setSearchQuery] = useState<string>(''); // Untuk menyimpan teks pencarian
  const [filteredProducts, setFilteredProducts] = useState<{ id: string, name: string, id_category: number, category: string }[]>([]); // Untuk daftar produk yang ditampilkan
  const [allProducts, setAllProducts] = useState<{ id: string, name: string, id_category: number, category: string }[]>([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [category, setcategory] = useState<cateogryId[]>([]);
  const [productToDelete, setProductToDelete] = useState<{ id: string, name: string, id_category: number, category: string }| null>(null);


  useEffect(() => {
    const getdatastock = async () => {
      const db = await createDatabse();
      const categorys = await getAllCategory();
      const data_product = await getproduct(db);
      setAllProducts(data_product);
      setcategory(categorys);
    };

       getdatastock();
  }, []);

  useEffect(() => {
    let result = allProducts;

    if (searchQuery.trim() !== '') {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter berdasarkan Kategori yang Dipilih
    if (selectedCategories.length > 0) {
      result = result.filter((product) => {
        const productId = product.id_category;

        if (productId === undefined) {
          return false;
        }

        return selectedCategories.includes(productId);
      });
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategories, allProducts]);

  // handler function modal delete
  const handleOpenDeleteModal = (product: { id: string, name: string, id_category: number, category: string }) => {
    setProductToDelete(product);
    setIsDeleteModalVisible(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) { return; }

    console.log(`Menghapus produk: ${productToDelete.name} (ID: ${productToDelete.id})`);
    // await api.delete(`/products/${productToDelete.id}`);

    // Setelah berhasil, update state untuk menghapus item dari UI
    setAllProducts(prevProducts =>
      prevProducts.filter(p => p.id !== productToDelete.id)
    );

    // Tutup modal
    handleCloseDeleteModal();
  };

  const handleCancelSearch = () => {
    setIsSearchActive(false);
    setSearchQuery(''); // Reset query dan filter
    Keyboard.dismiss(); // Tutup keyboard
  };

  const handleSearchPress = () => {
    setIsSearchActive(true);
  };

  const handleToggleCategory = (categoryId: string) => {
    const categoryIdAsNumber = parseInt(categoryId, 10);

    if (isNaN(categoryIdAsNumber)) {
      console.error('Invalid categoryId provided:', categoryId);
      return; // Hentikan fungsi jika ID tidak valid
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
        <Text style={styles.warehouseText}>warehouse</Text>
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={ // Tampilan jika hasil pencarian kosong
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          }
        />

        {productToDelete && (
          <ConfirmationModal
            visible={isDeleteModalVisible}
            title="Confirm Deletion"
            message={
              // Menggunakan View dan Text agar bisa di-styling
              <View>
                <Text style={{ textAlign: 'center' }}>Are you sure you want to delete this product?</Text>
                <Text style={{ fontWeight: 'bold', marginTop: 10, textAlign: 'center' }}>
                  {productToDelete.name}
                </Text>
              </View>
            }
            onCancel={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            confirmButtonText="Delete"
          />
        )}

        {!isSearchActive && ( // menghlangkan button tambah bila search active
          <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('add_product', { scannedBarcode: undefined })}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        )}
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

export default ProductScreen;
