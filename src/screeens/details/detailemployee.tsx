import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import { DetailEmployee, DetailEmployeeScreenProps, SendIdCustom } from '../../types/type';
import { detailEmployee, removeEmployee } from '../../services/employeeservices';
import { createDatabse } from '../../database/db';

// --- Ikon Sementara (Placeholder) ---
const PlaceholderIcon = ({ name, size = 22, color = '#888' }: { name: string, size?: number, color?: string }) => {
  const iconMap = {
    'warehouse': '🏢',
    'code': '#️⃣',
    'edit': '🗑️',
  };
  return <Text style={{ fontSize: size, color }}>{iconMap[name as keyof typeof iconMap] || '?'}</Text>;
};


const DetailRow = ({ iconName, label, value }: { iconName: string; label: string | null | undefined; value: string | null | undefined }) => {



  const [isExpanded, setIsExpanded] = useState(false);


  const isLongText = value && typeof value === 'string' && value.length > 11;


  const toggleText = () => {

    if (isLongText) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <View style={styles.detailRow}>
      <PlaceholderIcon name={iconName} />
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Pressable onPress={toggleText} disabled={!isLongText}>
          <Text
            style={styles.detailValue}

            numberOfLines={isExpanded ? undefined : 1}
            ellipsizeMode="tail"
          >

            {isLongText && !isExpanded
              ? `${value.substring(0, 11)}...`
              : value}
          </Text>
        </Pressable>

      </View>
    </View>
  );
};

// --- Komponen Layar Utama ---
const EmployeeDetailScreen = ({ navigation, route }: DetailEmployeeScreenProps) => {
  const employeeId: SendIdCustom | undefined = route.params?.sendid;
  const [employee, setEmployee] = useState<DetailEmployee | null>(null);

  const handlerdetailbutton = async () => {
    const db = await createDatabse();
    Alert.alert('remove employee', 'Apakah Anda yakin ingin menghapus employee?', [
      { text: 'Tidak', style: 'cancel' },
      {
        text: 'Ya', onPress: async () => {
          await removeEmployee(db, Number(employeeId.id));
          navigation.navigate('home', { screen: 'employee' });
        },
      },
    ]);
  };

  useEffect(() => {
    const getdetailemployee = async () => {
      try {
        const db = await createDatabse();
        console.log(employeeId.id);
        const detailemployee = await detailEmployee({ id: employeeId.id, avatarurl: employeeId.avatarurl }, db);
        console.log(detailemployee);
        setEmployee(detailemployee);
      } catch (error) {
        console.log('error on db layer employee detail page');
        console.error('Error fetching employee details:', error);
      }
    };
    getdetailemployee();
    console.log('Employee ID:', employeeId);
  }, [employeeId]);


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* --- Kartu Profil Utama --- */}
        <View style={styles.profileCard}>
          <Image source={{ uri: employeeId.avatarurl }} style={styles.avatar} />
          <Text style={styles.employeeName}>{employee?.name}</Text>
          <Text style={styles.employeeRole}>{employee?.role}</Text>
        </View>

        {/* --- Kartu Informasi Tambahan --- */}
        <View style={styles.infoCard}>
          <DetailRow
            iconName="warehouse"
            label="Assigned Warehouse"
            value={employee?.warehouse}
          />
          <View style={styles.divider} />
          <DetailRow
            iconName="code"
            label="Employee Code"
            value={employee?.employeeCode}
          />
        </View>

      </ScrollView>

      {/* Tombol Aksi di Bawah */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={handlerdetailbutton}>
          <Text style={styles.actionButtonText}>Deleted Employee</Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
    paddingTop: 10,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  employeeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  employeeRole: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5ea',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailTextContainer: {
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#1c1c1e',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  actionButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default EmployeeDetailScreen;
