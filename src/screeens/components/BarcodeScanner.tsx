import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, AppState } from 'react-native';
import { Camera, Code, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

import { BarcodeScreenProps } from '../../types/type';
import { useIsFocused } from '@react-navigation/native';


export const BarcodeScannerScreen = ({ navigation, route }: BarcodeScreenProps) => {
  const [isScanned, setIsScanned] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  const isFocused = useIsFocused();
  const isAppActive = appState === 'active';
  const isCameraActive = isFocused && isAppActive;
  const device = useCameraDevice('back');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const candidateCode = useRef<string | null>(null);
  const scanCount = useRef(0);
  const STABILITY_THRESHOLD = 3; // Butuh 3x scan yang sama berturut-turut

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128', 'upc-a', 'upc-e'],
    onCodeScanned: (codes: Code[]) => {
      if (isScanned) {
        return;
      }

      const newCode = codes[0]?.value;
      if (!newCode) {
        return;
      }

      // Jika kode yang baru discan berbeda dengan kandidat sebelumnya, reset.
      if (candidateCode.current !== newCode) {
        candidateCode.current = newCode;
        scanCount.current = 1; // Mulai hitung dari 1
        return;
      }

      // Jika kode yang discan sama dengan kandidat, tingkatkan hitungan.
      scanCount.current += 1;

      // anggap itu stabil dan proses.
      if (scanCount.current >= STABILITY_THRESHOLD) {
        setIsScanned(true); // Kunci proses scan

        const stableCode = candidateCode.current;
        console.log(`Barcode stabil terdeteksi: ${stableCode}`);

        const targetScreen = route.params?.targetScreen;
        navigation.goBack();

        setTimeout(() => {
          if (targetScreen === 1) {
            navigation.navigate('add_product', { scannedBarcode: stableCode });
          } else if (targetScreen === 2) {
            navigation.navigate('add_transaction', { scannedBarcode: stableCode });
          } else if (targetScreen === 3) {
            navigation.navigate('scanning', { scannedBarcode: stableCode });
          }
        }, 1);
      }
    },
  });


  if (device == null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.text}>Loading kamera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isCameraActive}
        codeScanner={codeScanner}
        enableZoomGesture
      />
      <View style={styles.overlay}>
        <View style={styles.viewfinder} />
        <Text style={styles.text}>Arahkan kamera ke barcode</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewfinder: {
    width: '80%',
    height: '30%',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
  },
});
