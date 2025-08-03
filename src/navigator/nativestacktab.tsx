import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Screens } from '../screeens';
// import DashboardScreen from '../screeens/tabs/dashboard';
import LoginScreen from '../screeens/auth/login';
import BottomTab from './bottomtab';
import { ProductDetailScreen } from '../screeens/details/detailproduct';
import { AddProductScreen } from '../screeens/add/addproduct';
import { EditProductScreen } from '../screeens/edit/editproduct';
import { BarcodeScannerScreen } from '../screeens/components/BarcodeScanner';
import { RootStackParamList } from '../types/type';
import AddTransactionScreen from '../screeens/add/addtransaction';
import TransactionDetailScreen from '../screeens/details/detailtransaction';
import ScanningScreen from '../screeens/edit/editTransaction';
import AddEmployeeScreen from '../screeens/add/addemployee';
import EditEmployeeScreen from '../screeens/edit/editemployee';
import AddWarehouseScreen from '../screeens/add/addwarehouse';
import EditWarehouseScreen from '../screeens/edit/editwarehouse';
import WarehouseDetailScreen from '../screeens/details/detailwarehouse';
import EmployeeDetailScreen from '../screeens/details/detailemployee';
import ProfileScreen from '../screeens/tabs/profil';
// import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import LoadingScreen from '../screeens/loadingscreen';
import { useAuth } from '../context/authcontext';
import AddStockScreen from '../screeens/add/addstock';
import { StockDetailScreen } from '../screeens/details/detailstock';
import ManagementScreen from '../screeens/tabs/management';
import ProductScreen from '../screeens/tabs/product';


const Stack = createNativeStackNavigator<RootStackParamList>();

function NativeStackNavigation() {
  const { session , loading } = useAuth();

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  const handlerstack = () => {
    if (session) {
      console.log(session);
      return (
        <Stack.Navigator initialRouteName={'home'}>
          <Stack.Screen name={Screens.HOME} component={BottomTab} options={{ headerShown: false }} />
          <Stack.Screen name={'detail_product'} component={ProductDetailScreen} options={{ title: 'Detail Product' }} />
          <Stack.Screen name={'add_product'} component={AddProductScreen} options={{ title: 'Add Product' }} />
          <Stack.Screen name={'add_transaction'} component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
          <Stack.Screen name={'add_employee'} component={AddEmployeeScreen} options={{ title: 'Add Employee' }} />
          <Stack.Screen name={'add_warehouse'} component={AddWarehouseScreen} options={{ title: 'Add Warehouse' }} />
          <Stack.Screen name={'add_stok'} component={AddStockScreen} options={{ title: 'Add Stok' }} />
          <Stack.Screen name={'edit_product'} component={EditProductScreen} options={{ title: 'Edit Product' }} />
          <Stack.Screen name={'edit_employee'} component={EditEmployeeScreen} options={{ title: 'Edit Employee' }} />
          <Stack.Screen name={'edit_warehouse'} component={EditWarehouseScreen} options={{ title: 'Edit Warehouse' }} />
          <Stack.Screen name={'detail_transaction'} component={TransactionDetailScreen} options={{ title: 'Detail Transaction' }} />
          <Stack.Screen name={'detail_warehouse'} component={WarehouseDetailScreen} options={{ title: 'Detail Warehouse' }} />
          <Stack.Screen name={'detail_employee'} component={EmployeeDetailScreen} options={{ title: 'Detail Employee' }} />
          <Stack.Screen name={'detail_stock'} component={StockDetailScreen} options={{ title: 'Detail Stock' }} />
          <Stack.Screen name={'scanning'} component={ScanningScreen} options={{ title: 'Process Transaction' }} />
          <Stack.Screen name={'profil'} component={ProfileScreen} options={{ title: 'Profil' }} />
          <Stack.Screen name={'management'} component={ManagementScreen} options={{ title: 'management screen' }} />
          <Stack.Screen name={'product'} component={ProductScreen} />
          <Stack.Screen name={'barcode'} component={BarcodeScannerScreen} options={{ title: 'Scan Barcode', presentation: 'modal' }} />
        </Stack.Navigator>
      );
    }
    else {
      return (
        <Stack.Navigator initialRouteName={Screens.LOGIN}>
          <Stack.Screen name={'login'} component={LoginScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      );
    }
  };

  return (
    <NavigationContainer>
      {handlerstack()}
    </NavigationContainer>
  );
}

export default NativeStackNavigation;






// {
//         Dashboard: 'Dashboard',
//         Camera: 'Camera',
//         History: 'History',
//         Profile: 'Profile',
//     };
