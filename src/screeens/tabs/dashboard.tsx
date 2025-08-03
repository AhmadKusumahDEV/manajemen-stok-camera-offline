import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmployeeIcon, ProductIcon, TransactionIcon } from '../../assets/images';
import { DashboardItem, DashboardScreenProps, UserSession } from '../../types/type';
import StoringData from '../../store/store';
import { getTotalCounts } from '../../services/dashboardservices';
import { createDatabse } from '../../database/db';
import { useAuth } from '../../context/authcontext';



const DashboardScreen = ({ navigation }: DashboardScreenProps) => {
  const [warehouse, setwarehouse] = useState<string | null>(null);
  const [employee, setemployee] = useState<number>(0);
  const [transaction, settransaction] = useState<number>(0);
  const [product, setproduct] = useState<number>(0);
  const { session } = useAuth();

  // Komponen Card dengan properti tambahan untuk warna latar belakang kartu
  // eslint-disable-next-line react/no-unstable-nested-components
  const Card = ({
    title,
    value,
    description,
    onViewAllPress,
    iconText,
    iconBackgroundColor,
    cardBackgroundColor,
  }: any) => (
    <View
      style={[
        styles.card,
        cardBackgroundColor ? { backgroundColor: cardBackgroundColor } : {},
      ]}>
      <View style={styles.cardTextContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: iconBackgroundColor || '#E0E0E0' },
        ]}>
        <Text style={styles.iconPlaceholder}>{iconText || 'Icon'}</Text>
      </View>
      <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View All {title.split(' ')[1]} </Text>
        <Text style={styles.arrowText}>→</Text>
      </TouchableOpacity>
    </View>
  );


  useEffect(() => {
    const datadashboard = async () => {
      try {
        const store = new StoringData();
        const db = await createDatabse();
        const data: UserSession = await store.getDataObj('@user');
        setwarehouse(data.warehouse_name);

        const allcount: DashboardItem = await getTotalCounts(db, data.warehouse_code, data.warehouse_name);
        setemployee(allcount.employee);
        settransaction(allcount.transaction);
        setproduct(allcount.product);

      } catch (error) {
        console.log(error);
      }
    };
    datadashboard();
  }, []);

  const handlertestingapi = async () => {
    try {
      console.log('tes');
      const response = await fetch('https://gin-manajemen-stok-1lwf.vercel.app/ping');
      const data = await response.json();
      navigation.navigate('profil', { sendid: { id: session?.user_id, avatarurl: session?.avatarUrl as string } });
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 10 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity
          onPress={handlertestingapi}
          style={styles.avatarButton}>
          <Image source={{ uri: session?.avatarUrl }} style={styles.userAvatar} />
        </TouchableOpacity>
      </View>
      <View style={styles.subHeader}>
        <Text style={styles.warehouseText}>{warehouse}</Text>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header dengan Avatar */}

        <Card
          title="Total Employees"
          value={employee}
          description=""
          iconText={<EmployeeIcon width={30} height={30} color="fffffff" strokeWidth={1.5} stokecolor="blue" opacity={0.5} />} // Bisa juga pakai nama ikon dari library
          iconBackgroundColor="#E3F2FD" // Warna latar ikon (biru muda)
          // cardBackgroundColor="#FEF9E7" // Contoh jika ingin mengubah warna utama card
          onViewAllPress={() => navigation.navigate('home', { screen: 'employee' })}
        />
        <Card
          title="Total Transactions"
          value={transaction}
          description=""
          iconText={<TransactionIcon width={30} height={30} color="fffffff" strokeWidth={18} stokecolor="green" opacity={0.5} />} // Bisa juga pakai nama ikon dari library
          iconBackgroundColor="#E8F5E9" // Warna latar ikon (hijau muda)
          // cardBackgroundColor="#FDEBD0" // Contoh lain
          onViewAllPress={() => navigation.navigate('home', { screen: 'transaction' })}
        />
        <Card
          title="Total Stocks"
          value={product}
          description=""
          iconText={<ProductIcon width={30} height={30} color="fffffff" strokeWidth={1.5} stokecolor="purple" opacity={0.5} />} // Bisa juga pakai nama ikon dari library
          iconBackgroundColor="#F3E5F5" // Warna latar ikon (ungu muda)
          onViewAllPress={() => navigation.navigate('home', { screen: 'stocks' })}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 20,
    // paddingTop: 20, // Dihapus karena header punya container sendiri
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15, // Atur padding atas sesuai kebutuhan (misalnya status bar)
    paddingBottom: 15, // Jarak dari header ke kartu pertama
    paddingLeft: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 23, fontWeight: 'bold', color: '#343a40' },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: 10,
    marginLeft: 10,
  },
  warehouseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  avatarButton: {
    // Tidak perlu style khusus jika placeholder/Image sudah punya style sendiri
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20, // Membuatnya bulat
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  // avatarImage: { // Gunakan ini jika memakai <Image>
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  // },
  avatarImage: {
    width: 45,
    height: 45,
    borderRadius: 40,

    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 5,
  },

  userAvatar: { width: 32, height: 32, borderRadius: 22, backgroundColor: '#f4a261' },
  card: {
    backgroundColor: '#FFFFFF', // Warna default kartu adalah putih
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  cardTextContent: {
    marginRight: 70, // Beri ruang lebih jika ikon lebih besar atau ada padding
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
  },
  iconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    // Mengganti nama dari iconName ke iconText untuk lebih jelas
    fontSize: 24, // Sesuaikan ukuran emoji/teks ikon
    color: '#333', // Warna default teks/emoji ikon
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  viewAllText: {
    fontSize: 15,
    color: '#6A0DAD',
    fontWeight: '500',
  },
  arrowText: {
    fontSize: 18,
    color: '#6A0DAD',
    marginLeft: 5,
  },
});

export default DashboardScreen;
