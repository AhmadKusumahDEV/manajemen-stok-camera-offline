import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { DetailWarehouseScreenProps, Warehouse } from '../../types/type';
import { createDatabse } from '../../database/db';
import { getWarehousesDetail } from '../../services/warehouseservices';

// --- Ikon Sementara (Placeholder) ---
const PlaceholderIcon = ({ name, size = 32, color = '#007AFF' }: { name: string, size?: number, color?: string }) => {
  const iconMap = {
    'warehouse': '🏢',
    'location': '📍',
    'code': '#️⃣',
  };
  return <Text style={{ fontSize: size, color }}>{iconMap[name as keyof typeof iconMap] || '?'}</Text>;
};

// --- Komponen Kecil untuk Baris Detail ---
const DetailRow = ({ iconName, label, value }: { iconName: string; label: string; value: string }) => (
  <View style={styles.detailRow}>
    <PlaceholderIcon name={iconName} size={22} color="#888" />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);


// --- Komponen Layar Utama ---
const WarehouseDetailScreen = ({ route }: DetailWarehouseScreenProps) => {
  const [detail, setdetail] = useState<Warehouse | null>(null);
  const { id } = route.params.sendid;

  useEffect(() => {
    const getDetail = async () => {
      try {
        const db = await createDatabse();
        const result = await getWarehousesDetail(db, id);
        setdetail(result);
      } catch (error) {
        console.error('Error fetching warehouse details:', error);
      }
    };

    getDetail();
  });
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {/* Header Kartu */}
          <View style={styles.cardHeader}>
            <PlaceholderIcon name="warehouse" size={40} />
            <Text style={styles.warehouseName}>{detail?.warehouse_name}</Text>
          </View>

          <View style={styles.divider} />

          {/* Konten Detail */}
          <View style={styles.detailsSection}>
            <DetailRow
              iconName="location"
              label="Location"
              value={detail?.location_description as string}
            />
            <DetailRow
              iconName="code"
              label="Warehouse Code"
              value={detail?.warehouse_code as string}
            />
          </View>
        </View>
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
    padding: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  warehouseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginTop: 12,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5ea',
    marginVertical: 20,
  },
  detailsSection: {
    // Styling jika diperlukan
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  detailTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1c1c1e',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    backgroundColor: '#f0f2f5',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WarehouseDetailScreen;
