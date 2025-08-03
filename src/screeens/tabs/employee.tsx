/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Keyboard,
  Alert,
} from 'react-native';
import { FilterIcon, IconModify, SearchIcon } from '../../assets/images';
import FilterModal from '../components/filter';
import { Employee, EmployeeScreenProps, roleid } from '../../types/type';
import { getAllRolesEmployee } from '../../services/roleServices';
import { getEmployeeData } from '../../services/employeeservices';
import { createDatabse } from '../../database/db';
import { useAuth } from '../../context/authcontext';

// --- Tipe Data untuk Karyawan ---

// --- Komponen untuk setiap baris karyawan ---
const EmployeeListItem = ({ employee, navigation }: { employee: Employee, navigation: EmployeeScreenProps }) => {
  return (
    <TouchableOpacity onPress={() => navigation.navigation.navigate('detail_employee', { sendid: { id: employee.employeeCode, avatarurl: employee.avatarUrl } })}>
      <View style={styles.listItem}>
        <Image source={{ uri: employee.avatarUrl }} style={styles.avatar} />
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{employee.name}</Text>
          <Text style={styles.employeeRole}>{employee.role.name}</Text>
        </View>
        <TouchableOpacity style={{ marginRight: 10 }} onPress={() => navigation.navigation.navigate('edit_employee', { sendid: { id: employee.employeeCode } })}>
          <IconModify />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};


// --- Komponen Layar Utama ---
const EmployeeScreen = ({ navigation, route }: EmployeeScreenProps) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number[]>([]);
  const [filteredemployees, setFilteredemployees] = useState<Employee[] | null>(null);
  const [role, setrole] = useState<roleid[] | null>(null);
  const [employees, setemployee] = useState<Employee[]>([]);
  const { session } = useAuth();

  useEffect(() => {
    const fecthingdataDB = async () => {

      const db = await createDatabse();
      const result = await getEmployeeData(db, session?.warehouse_code ?? null , session?.user_id ?? null);
      const datarole: roleid[] = await getAllRolesEmployee();
      setrole(datarole);
      setemployee(result);
      setFilteredemployees(result);
    };

    fecthingdataDB();
  }, [session?.user_id, session?.warehouse_code]);

  useEffect(() => {
    let result = employees;

    if (searchQuery.trim() !== '') {
      result = result.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.role.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter berdasarkan Kategori yang Dipilih
    if (selectedStatus.length > 0) {
      result = result.filter((employee) => {
        const employeeId = employee.role.id;

        if (employeeId === undefined) {
          return false;
        }

        return selectedStatus.includes(employeeId);
      });
    }

    setFilteredemployees(result);
  }, [employees, searchQuery, selectedStatus]);

  const handleCancelSearch = () => {
    setIsSearchActive(false);
    setSearchQuery(''); // Reset query dan filter
    Keyboard.dismiss(); // Tutup keyboard
  };

  const handleSearchPress = () => {
    setIsSearchActive(true);
  };

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

  const handleAddCategory = () => {
    // add category direct to anonther page
    setIsFilterModalVisible(false); // Tutup modal
    Alert.alert('testing mode');
  };

  const renderSubHeader = () => {
    if (isSearchActive) {
      // Jika mode search aktif, tampilkan TextInput
      return (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by employee role..."
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Employee</Text>
          {/* Avatar Pengguna di pojok kanan atas */}
          <TouchableOpacity onPress={() => navigation.navigate('profil', { sendid: { id: session?.user_id, avatarurl: session?.avatarUrl as string } })}>
            <Image source={{ uri: session?.avatarUrl }} style={styles.userAvatar} />
          </TouchableOpacity>
        </View>

        {/* Sub-Header */}
        {renderSubHeader()}

        <FlatList
          data={filteredemployees}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <EmployeeListItem employee={item} navigation={{ navigation, route: route }} />}
          // Penyesuaian posisi agar item terakhir tidak tertutup FAB
          contentContainerStyle={styles.listContainer}
        />
      </View>

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        categories={role || []}
        selectedCategories={selectedStatus}
        onCategoryChange={handleToggleCategory}
        onAddCategory={handleAddCategory}
      />

      {/* Floating Action Button (FAB) untuk menambah employee */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('add_employee')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};


// --- StyleSheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Latar belakang putih seperti di gambar
  },
  container: { flex: 1, paddingHorizontal: 20 },
  listContainer: {
    paddingBottom: 100, // Memberi ruang di bawah untuk FAB
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 23, fontWeight: 'bold', color: '#343a40' },
  userAvatar: { width: 32, height: 32, borderRadius: 22, backgroundColor: '#f4a261' },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  warehouseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  filterIcons: {
    flexDirection: 'row',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 0.9, shadowColor: '#000000', shadowOpacity: 20, shadowRadius: 3, borderRadius: 15, marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 13,
    marginLeft: 7,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  employeeRole: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
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
  cancelButton: {
    marginLeft: 10,
    padding: 5,
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
});

export default EmployeeScreen;
