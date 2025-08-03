
/* eslint-disable react/no-unstable-nested-components */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ScreensBottomTab } from '../screeens';
import DashboardScreen from '../screeens/tabs/dashboard';
import Employee from '../screeens/tabs/employee';
import Transaction from '../screeens/tabs/transaction';
import StockScreen from '../screeens/tabs/stocks';
import Warhouse from '../screeens/tabs/warehouse';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, EmployeeIcon, ProductIcon, TransactionIcon, WarehouseIcon } from '../assets/images';
import { BottomTabParamList } from '../types/type';
import { useAuth } from '../context/authcontext';



// --- Komponen Utama ---

// Beri tipe return pada function component
export default function BottomTab(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const Tab = createBottomTabNavigator<BottomTabParamList>();

  const handlenavgationrole = () => {
    switch (session?.role_name) {
      case 'administrator':
        return (
          <>
            <Tab.Screen
              name={'employee'}
              component={Employee}
              options={{
                title: ScreensBottomTab.EMPLOYEE,
                tabBarIcon: ({ focused }) => (
                  <EmployeeIcon
                    color={focused ? '#007AFF' : '#ffffff'}
                    width={30}
                    height={30}
                    opacity={focused ? 0 : 0.7}
                    strokeWidth={1.1} stokecolor={'gray'} />
                ),
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
              }}
            />
            <Tab.Screen
              name={'transaction'}
              component={Transaction}
              options={{
                title: 'Transaction',
                tabBarIcon: ({ focused }) => (
                  <TransactionIcon
                    color={focused ? '#007AFF' : '#ffffff'}
                    width={30}
                    height={30}
                    opacity={focused ? 0 : 0.7}
                    strokeWidth={18} stokecolor={'gray'} />
                ),
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
              }}
            />
            <Tab.Screen
              name={'stocks'}
              component={StockScreen}
              options={{
                title: 'Stock',
                tabBarIcon: ({ focused }) => (
                  <ProductIcon
                    color={focused ? '#007AFF' : '#ffffff'}
                    width={30}
                    height={30}
                    opacity={focused ? 0 : 0.7}
                    strokeWidth={1.3} stokecolor={'gray'} />
                ),
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
              }}
            />
            <Tab.Screen
              name={'warehouse'}
              component={Warhouse}
              options={{
                title: ScreensBottomTab.WAREHOUSE,
                tabBarIcon: ({ focused }) => (
                  <WarehouseIcon
                    color={focused ? '#007AFF' : '#ffffff'}
                    width={30}
                    height={30}
                    opacity={focused ? 0 : 0.8}
                    strokeWidth={1} stokecolor={'gray'} />
                ),
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
              }}
            />
          </>
        );
      case 'manager':
        return (
          <>
            <Tab.Screen
              name={'employee'}
              component={Employee}
              options={{
                title: ScreensBottomTab.EMPLOYEE,
                tabBarIcon: ({ focused }) => (
                  <EmployeeIcon
                    color={focused ? '#007AFF' : '#ffffff'}
                    width={30}
                    height={30}
                    opacity={focused ? 0 : 0.7}
                    strokeWidth={1.1} stokecolor={'gray'} />
                ),
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
              }}
            />
            <Tab.Screen
              name={'transaction'}
              component={Transaction}
              options={{
                title: 'Transaction',
                tabBarIcon: ({ focused }) => (
                  <TransactionIcon
                    color={focused ? '#007AFF' : '#ffffff'}
                    width={30}
                    height={30}
                    opacity={focused ? 0 : 0.7}
                    strokeWidth={18} stokecolor={'gray'} />
                ),
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
              }}
            />
            <Tab.Screen
              name={'stocks'}
              component={StockScreen}
              options={{
                title: 'Stock',
                tabBarIcon: ({ focused }) => (
                  <ProductIcon
                    color={focused ? '#007AFF' : '#ffffff'}
                    width={30}
                    height={30}
                    opacity={focused ? 0 : 0.7}
                    strokeWidth={1.3} stokecolor={'gray'} />
                ),
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
              }}
            />
          </>
        );
      default:
        return (
          <>
            <Tab.Screen
              name={'transaction'}
              component={Transaction}
              options={{
                title: 'Transaction',
                tabBarIcon: ({ focused }) => (
                  <TransactionIcon
                    color={focused ? '#007AFF' : '#ffffff'}
                    width={30}
                    height={30}
                    opacity={focused ? 0 : 0.7}
                    strokeWidth={18} stokecolor={'gray'} />
                ),
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
              }}
            />
            <Tab.Screen
              name={'stocks'}
              component={StockScreen}
              options={{
                title: 'Stock',
                tabBarIcon: ({ focused }) => (
                  <ProductIcon
                    color={focused ? '#007AFF' : '#ffffff'}
                    width={30}
                    height={30}
                    opacity={focused ? 0 : 0.7}
                    strokeWidth={1.3} stokecolor={'gray'} />
                ),
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
              }}
            />
          </>
        );
    }
  };

  return (
    <Tab.Navigator
      initialRouteName={ScreensBottomTab.DASHBOARD}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 75, // Cara yang lebih baik untuk mengatur tinggi
          paddingBottom: insets.bottom,
          borderTopWidth: 0,
          elevation: 1,
          paddingTop: 20,
        },
        headerShown: false,
      }}>
      <Tab.Screen
        name={'dashboard'}
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <HomeIcon
              opacity={focused ? 0 : 0.8}
              strokeWidth={20}
              width={30}
              height={30}
              color={focused ? '#007AFF' : '#ffffff'} stokecolor={'gray'} />
          ),
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
        }}
      />
      {handlenavgationrole()}
    </Tab.Navigator>
  );
}

