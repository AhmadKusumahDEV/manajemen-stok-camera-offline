/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView, // Menggunakan ScrollView untuk layout yang lebih fleksibel
} from 'react-native';
import { useAuth } from '../../context/authcontext';
import { ProfilEmployee, ProfilScreenProps } from '../../types/type';
import { createDatabse } from '../../database/db';
import { profil } from '../../services/employeeservices';

const PlaceholderIcon = ({ name, size = 22, color = '#666' }: { name: string, size?: number, color?: string }) => {
  return <Text style={{ fontSize: size, color, fontWeight: 'bold' }}>{name === 'arrow' ? '>' : '?'}</Text>;
};

// --- Komponen Layar Utama ---
const ProfileScreen = ({ navigation, route }: ProfilScreenProps) => {
  const [employee, setEmployee] = React.useState<ProfilEmployee | null>(null);
  const { session, logout } = useAuth(); // Ambil data sesi dari context
  const { params } = route;


  useEffect(() => {
    const getdataprofil = async () => {
      try {
        const db = await createDatabse();
        // Cek apakah profil yang ditampilkan adalah profil sendiri atau orang lain
        const targetEmployeeId = params?.sendid?.id || session?.user_id; // Gunakan ID dari params, atau ID sendiri jika tidak ada
        if (!targetEmployeeId) {return;}

        console.log(targetEmployeeId);
        const dataprofil = await profil({ id: targetEmployeeId, avatarurl: params?.sendid?.avatarurl }, db);
        console.log(dataprofil);
        setEmployee(dataprofil);
      } catch (error) {
        console.log('error on db layer employee detail page');
        console.error('Error fetching employee details:', error);
      }
    };
    getdataprofil();
  }, [params, session]);

  const handleUpdateProfile = () => {
    navigation.navigate('edit_employee', { sendid: { id: employee?.employeeCode as string } });
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Tidak', style: 'cancel' },
      {
        text: 'Ya', onPress: () => {
          logout();
        },
      },
    ]);
  };

  // --- PERUBAHAN UTAMA: Menambahkan Menu Manajemen ---
  const renderManagementMenu = () => {
    // Tampilkan menu ini HANYA jika role bukan 'staff'
    if (session?.role_name !== 'staff') {
      return (
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Management</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('management')} // Navigasi ke layar manajemen
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Settings & Management</Text>
            <PlaceholderIcon name="arrow" />
          </TouchableOpacity>
        </View>
      );
    }
    return null; // Jangan tampilkan apa-apa untuk 'staff'
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          {/* --- Kartu Profil Utama --- */}
          <View style={styles.profileCard}>
            <Image source={{ uri: employee?.avatarUrl }} style={styles.avatar} />
            <Text style={styles.name}>{employee?.name}</Text>
            <Text style={styles.role}>{employee?.role}</Text>
            <Text style={styles.idText}>
              Code: {employee?.employeeCode} ID: {employee?.user_id}
            </Text>
          </View>

          {/* --- Menu Aksi --- */}
          <View style={styles.menuSection}>
            <Text style={styles.menuTitle}>Profil</Text>
            <TouchableOpacity style={styles.actionButton} onPress={handleUpdateProfile} activeOpacity={0.7}>
              <Text style={styles.actionButtonText}>Update Profile</Text>
              <PlaceholderIcon name="arrow" />
            </TouchableOpacity>

            {/* Panggil fungsi untuk merender menu manajemen di sini */}
            {renderManagementMenu()}

          </View>
        </View>

        {/* --- Tombol Logout di Bawah --- */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
    flexGrow: 1, // Menggunakan flexGrow agar bisa scroll jika konten panjang
    padding: 20,
    justifyContent: 'space-between',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  role: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 4,
    marginBottom: 12,
  },
  idText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  // Style baru untuk mengelompokkan menu
  menuSection: {
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginBottom: 12, // Jarak antar tombol
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // Jarak dari menu di atasnya
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
