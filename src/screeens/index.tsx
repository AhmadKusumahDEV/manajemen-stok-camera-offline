import { BottomTabParamList, RootStackParamList } from '../types/type';

type ScreenNativeStack = keyof RootStackParamList;
type ScreenBottomTabtype = keyof BottomTabParamList

export const Screens: { [key: string]: ScreenNativeStack } = {
    LOGIN: 'login',
    HOME: 'home',
    DETAIL_PRODUCT: 'detail_product',
    ADD_PRODUCT: 'add_product',
    EDIT_PRODUCT: 'edit_product',
    BARCODE: 'barcode',
};

export const ScreensBottomTab: { [key: string]: ScreenBottomTabtype } = {
    DASHBOARD: 'dashboard',
    EMPLOYEE: 'employee',
    TRANSACTION: 'transaction',
    PRODUCT: 'product',
    WAREHOUSE: 'warehouse',
};
