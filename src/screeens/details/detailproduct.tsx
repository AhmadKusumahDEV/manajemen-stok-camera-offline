import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { createDatabse } from '../../database/db';
import { getproductdetail } from '../../services/productservices';
import { DetailProductScreenProps, ProductDetail } from '../../types/type';
// import { createDatabse } from '../../database/db';
// import { getproductdetail } from '../../services/productservices';

const IconPlaceholder = ({ name }: { name: string }) => (
  <View style={styles.iconPlaceholder}>
    <Text style={styles.iconPlaceholderText}>{name.charAt(0)}</Text>
  </View>
);

// --- Komponen untuk baris detail ---
const DetailRow = ({ label, value, iconName }: { label: string; value: string; iconName: string }) => (
  <View style={styles.detailRow}>
    <IconPlaceholder name={iconName} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
    </View>
  </View>
);

// --- Komponen untuk menampilkan barcode (placeholder visual) ---
const BarcodeDisplay = () => (
  <View style={styles.barcodeContainer}>
    <Text style={styles.barcodeLabel}>BARCODE</Text>
    <View style={styles.barcodeLines}>
      {[...Array(30)].map((_, i) => (
        <View key={i} style={[styles.barcodeLine, { height: Math.random() * 30 + 20 }]} />
      ))}
    </View>
  </View>
);


export const ProductDetailScreen = ({ route }: DetailProductScreenProps) => { // Ganti 'any' dengan DetailProductScreenProps
  const { id } = route.params;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getproductdetails = async () => {
      try {
        const db = await createDatabse();
        const result = await getproductdetail(db, id);
        setProduct(result);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getproductdetails();
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text>Product not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* --- Kartu Info Utama --- */}
        <View style={styles.card}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.price}>Rp {product.price.toLocaleString('id-ID')}</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* --- Kartu Detail Tambahan --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <DetailRow label="Product Code" value={product.productCode} iconName="Code" />
        </View>

        {/* --- Kartu Barcode --- */}
        <View style={styles.card}>
          <BarcodeDisplay />
        </View>
      </ScrollView>

      {/* --- Footer Tombol Aksi --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
          <Text style={styles.actionButtonText}>Edit Product</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120, // Ruang untuk footer
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconPlaceholderText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  barcodeContainer: {
    alignItems: 'center',
  },
  barcodeLabel: {
    fontSize: 12,
    color: '#aaa',
    letterSpacing: 2,
    marginBottom: 8,
  },
  barcodeLines: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'flex-end',
  },
  barcodeLine: {
    width: 2,
    backgroundColor: '#333',
    marginHorizontal: 0.5,
  },
  barcodeValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
