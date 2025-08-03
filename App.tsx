/* eslint-disable semi */
import NativeStackNavigation from './src/navigator/nativestacktab';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-get-random-values';
import SplashScreen from 'react-native-splash-screen';
import LoadingScreen from './src/screeens/loadingscreen';
import { AuthProvider } from './src/context/authcontext';


export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);


  useEffect(() => {
    const initializeApp = async () => {
      try {
        const response = await fetch('https://gin-manajemen-stok-1lwf.vercel.app/ping');
        const data = await response.json();
        console.log(data);
      } catch (e) {
        console.error(e);
      } finally {
        SplashScreen.hide();
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    // <View>
    //   <Text>heello world</Text>
    // </View>
    // <View>
    //   <Text>heello world</Text>
    //   <Button color={'blue'} title="Click Me" onPress={addInitialRoles} />
    //   <Button color={'black'} title="Click Me" onPress={getAllRoles} />
    //   <Button color={'purple'} title="Click Me" onPress={HanlderStore} />
    //   <Button color={'red'} title="Click Me" onPress={handlePermission} />
    //   {hasPermission && device != null ? <Camera style={styles.container} format={format} device={device} codeScanner={codeScanner} isActive={false}  fps={15}  /> : <Text>Camera permission not granted</Text>}
    //   {/* {barcodes.map((barcode, idx) => (
    //     <Text key={idx} style={styles.barcodeTextURL}>
    //       {barcode.displayValue}
    //     </Text>
    //   ))} */}
    // </View>
    <SafeAreaProvider>
      <AuthProvider>
        <NativeStackNavigation />
      </AuthProvider>
    </SafeAreaProvider>

  )
}
