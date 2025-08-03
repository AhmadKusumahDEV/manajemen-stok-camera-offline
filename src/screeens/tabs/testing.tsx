import { addInitialRoles, getAllRoles } from '../../services/roleServices';
import React, { useEffect } from 'react';
import StoringData from '../../store/store';
import { Camera, CodeScanner, useCameraDevice, useCameraFormat, useCameraPermission } from 'react-native-vision-camera';
import { Button, StyleSheet, Text, View } from 'react-native';
import { createDatabse } from '../../database/db';

function Testing() {

const device = useCameraDevice('back');

   const format = useCameraFormat(device, [
    { fps: 15 }, // Prioritas utama: format dengan 15 FPS
  ]);
  const codeScanner: CodeScanner = {
  codeTypes: ['qr', 'ean-13'],
  onCodeScanned: (codes: string | any[]) => {
    console.log(codes[0].value);
    console.log(`Scanned ${codes.length} codes!`);
  },
};
  const { hasPermission, requestPermission } = useCameraPermission();

  const handlePermission = async () => {
    if (!hasPermission) {
      console.log('Kamera: Izin belum ada, meminta izin...');
      const permissionGranted = await requestPermission(); // Ini akan memunculkan pop-up
      console.log('Kamera: Hasil permintaan izin:', permissionGranted);
      // Setelah ini, nilai `hasPermission` dari hook akan diperbarui secara otomatis
      // dan komponen akan re-render.
    }
    if (!hasPermission) { return <Text>Camera permission not granted</Text>; }
    if (device == null) { return <Text>Camera device not found</Text>; }
  };

  //   const handleAddRoles = async () => {
  //   try {
  //     const obj: roleServices = new roleServices();
  //     obj.addRole('ceo', 'admin', 'manager');
  //     console.log('Roles added successfully');
  //   } catch (error) {
  //     console.error('Error adding roles:', error);
  //   }
  // };

  const HanlderStore = async () => {
    const store = new StoringData();
    const data = await store.getData('jawa');
    console.log(data);
  };

  useEffect(() => {
    const initializeDB = async () => {
      try {
        const store = new StoringData();
        store.saveData('jawa', 'alamak');
        await createDatabse();
        console.log('Database berhasil diinisialisasi.');
      } catch (error: any) {
        console.error('Gagal menginisialisasi database di App.tsx:', error);
      }
    };

    initializeDB();
  }, []);
  return (
        <View>
      <Text>heello world</Text>
      <Button color={'blue'} title="Click Me" onPress={addInitialRoles} />
      <Button color={'black'} title="Click Me" onPress={getAllRoles} />
      <Button color={'purple'} title="Click Me" onPress={HanlderStore} />
      <Button color={'red'} title="Click Me" onPress={handlePermission} />
      {hasPermission && device != null ? <Camera style={styles.container} format={format} device={device} codeScanner={codeScanner} isActive={false}  fps={15}  /> : <Text>Camera permission not granted</Text>}
      {/* {barcodes.map((barcode, idx) => (
        <Text key={idx} style={styles.barcodeTextURL}>
          {barcode.displayValue}
        </Text>
      ))} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 250,
    bottom: 0,
  },
  barcodeTextURL: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Testing;
