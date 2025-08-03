import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';


export type BottomTabParamList = {
  dashboard: undefined;
  employee: undefined;
  transaction: undefined;
  stocks: undefined;
  warehouse: undefined;
};

export type RootStackParamList = {
  login: undefined;
  home: NavigatorScreenParams<BottomTabParamList>;
  product: undefined;
  barcode: { targetScreen?: number };
  edit_product: { productID?: string | number };
  edit_employee: { sendid: SendID };
  edit_warehouse: { sendid: SendID };
  add_product: { scannedBarcode?: string };
  add_transaction: { scannedBarcode?: string };
  add_employee: undefined;
  add_warehouse: undefined;
  add_stok: { scannedBarcode?: string };
  detail_product: { id: string };
  detail_transaction: { sendid: SendID };
  detail_warehouse: { sendid: SendID };
  detail_employee: { sendid: SendIdCustom };
  detail_stock: { sendid: SendID };
  scanning: { scannedBarcode?: string, transaction_id?: number, type_transacion?: string };
  profil: { sendid: SendIdCustom };
  management: undefined;
}

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'login'>
export type ProductScreenProps = NativeStackScreenProps<RootStackParamList, 'product'>
export type AddProductScreenNavigationProp = NativeStackScreenProps<RootStackParamList, 'add_product'>;
export type AddStokScreenNavigationProp = NativeStackScreenProps<RootStackParamList, 'add_stok'>;
export type AddTransactionScreenNavigationProp = NativeStackScreenProps<RootStackParamList, 'add_transaction'>;
export type AddEmployeeScreenProps = NativeStackScreenProps<RootStackParamList, 'add_employee'>
export type AddWarehouseScreenProps = NativeStackScreenProps<RootStackParamList, 'add_warehouse'>
export type DetailEmployeeScreenProps = NativeStackScreenProps<RootStackParamList, 'detail_employee'>
export type DetailInventoryScreenProps = NativeStackScreenProps<RootStackParamList, 'detail_stock'>
export type DetailWarehouseScreenProps = NativeStackScreenProps<RootStackParamList, 'detail_warehouse'>
export type DetailTransactionScreenProps = NativeStackScreenProps<RootStackParamList, 'detail_transaction'>
export type DetailProductScreenProps = NativeStackScreenProps<RootStackParamList, 'detail_product'>
export type EditProductScreenProps = NativeStackScreenProps<RootStackParamList, 'edit_product'>
export type EditEmployeeScreenProps = NativeStackScreenProps<RootStackParamList, 'edit_employee'>
export type EditWarehouseScreenProps = NativeStackScreenProps<RootStackParamList, 'edit_warehouse'>
export type ProfilScreenProps = NativeStackScreenProps<RootStackParamList, 'profil'>
export type BarcodeScreenProps = NativeStackScreenProps<RootStackParamList, 'barcode'>
export type ScanningScreenProps = NativeStackScreenProps<RootStackParamList, 'scanning'>
export type ManagementScreenProps = NativeStackScreenProps<RootStackParamList, 'management'>

export type DashboardScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type StockScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'stocks'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type TransactionScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'transaction'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type EmployeeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'employee'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type WarehouseScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'warehouse'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type AvailableProduct = {
  id: string;
  name: string;
  availableSizes: string[];
};

export type ProductDetail = {
  id: string;
  name: string;
  price: number;
  description: string;
  productCode: string;
}

export type finalProductData = {
  product_name: string;
  price: number;
  description_product: string;
  code_product: string;
  id_category: string;
  id_size: string;
  barcode: string;
}

export type updatedProductData = {
  id: number;
  product_name: string;
  price: number;
  description_product: string;
  code_product: string;
  id_category: string;
  id_size: string;
  barcode: string;
}

export type ProductWithDetailUpdateData = {
  product_name?: string;
  price: number;
  description_product?: string;
  id_category?: number;
  id_size: number;
  barcode?: string;
};

export type SelectProductInStok = {
  id: number;
  product_name: string;
  product_code: string;
  id_size: number;
  size: string
  barcode: string;
};

export type ModalDataInventory = {
  id: number;
  product_name: string;
  product_code: string;
  quantity: number
  id_size: number;
  size: string
  barcode: string;
};

export type SelectAvailableProduct = {
  id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  id_size: number;
  size: string
  barcode: string;
};

export type UserSession = {
  user_id: string;
  role_name: string
  warehouse_code: string;
  warehouse_name: string;
  expiredAt: number
  avatarUrl: string
}

export interface AuthContextType {
  session: UserSession | null;
  loading: boolean;
  login: (sessionData: UserSession) => Promise<void>;
  logout: () => Promise<void>;
}

export type SelectedProductWithStock = {
  product: ProductStokcomponents;
  stockEntries: StockEntry[];
};

export type ProductStokcomponents = {
  id: number;
  product_name: string;
  product_code: string;
  total_stock?: number; // Opsional, bisa dihitung
};

export type detailtransactioninsert = {
  id_detail_product: number;
  quantity: number;
}

export type TransactionQueryResult = {
  created_at: string;
  origin_entity_name: string;
  destination_entity_name: string | null;
  status_name: string;
  tipe_transaksi: string;
  employee_code: string;
  product_name: string;
  size_name: string;
  quantity: number;
};

export type TransactionQueryResultSpesific = {
  id: number;
  id_size: number
  code_product: string
  created_at: string;
  origin_entity_name: string;
  destination_entity_name: string | null;
  status_name: string;
  tipe_transaksi: string;
  employee_code: string;
  product_name: string;
  size_name: string;
  quantity: number;
  barcode: string
  scanner_quantity: number
};

export type ProductStockCardProps = {
  item: SelectedProductWithStock; // Menerima satu objek 'item'
  onQuantityChange: (productCode: string, sizeId: number, newQuantity: number) => void;
  onAddSize: (productCode: string, sizeId: number, sizeName: string) => void;
  onRemoveProduct: (productCode: string) => void;
};

export type SizeStepperProps = {
  entry: StockEntry;
  onQuantityChange: (sizeId: number, newQuantity: number) => void;
};

export type StockEntry = {
  sizeId: number;
  sizeName: string;
  quantity: number;
};

export type size = {
  id: number;
  name_size: string;
}

export type EmployePost = {
  user_id: string;
  employee_name: string;
  password: string;
  id_role: number;
  warehouse_code: string;
}

// Tipe untuk produk yang sudah dipilih dan ada di form transaksi
export type SelectedProduct = AvailableProduct & {
  listKey: string; // Kunci unik untuk FlatList, untuk handle jika produk sama ditambahkan 2x
  quantities: { [size: string]: string }; // Contoh: { S: '10', M: '5' }
};

export type InventoryItem = {
  product_name: string;
  quantity: number;
  sku: string;
  code_product: string;
  category: cateogryId
}

export type InventoryDetail = {
  product_name: string;
  sku: string;
  size: {
    name: string,
    quantity: number
  }[];
  description: string;
  warehouse: string;
}

export type Warehouse = {
  id: number;
  warehouse_name: string;
  warehouse_code: string;
  location_description: string | null;
};


export type WarehouseCreateData = {
  warehouse_name: string;
  location_description?: string;
};


export type WarehouseUpdateData = {
  warehouse_name?: string;
  location_description?: string;
};


export interface DashboardItem {
  transaction: number;
  employee: number;
  product: number;
  // Tambahkan properti lain jika diperlukan
}

export type StatusId = {
  id: number
  name: string
}

export type Employee = {
  id: string;
  name: string;
  employeeCode: string;
  role: roleid;
  avatarUrl: string; // URL ke gambar avatar
};

export interface Transaction {
  id: number; // optional saat insert, akan otomatis dibuat
  code_transaksi: string;
  origin_entity_name: string;
  destination_entity_name: string;
  employee_code: string;
  id_status: number;
  status_name: string;
  created_at: string; // optional karena default CURRENT_TIMESTAMP
  tipe_transaksi: string;
}

export interface IconProps {
  opacity?: number;
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  stokecolor?: string;
}

export type DetailEmployee = {
  name: string;
  role: string
  employeeCode: string
  warehouse: string
  avatarUrl: string
}

export type ProfilEmployee = {
  id: string
  name: string;
  role: string
  employeeCode: string
  user_id: string
  avatarUrl: string
}

export type SendID = {
  id: string
}

export type SendIdCustom = {
  id: string | undefined
  avatarurl: string
}

// export interface EmployeePost {

// }

export interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  category?: cateogryId;
}

export type RouteParams = {
  product: Product; // or a more specific type if you know what it is
}

export type BarcodeValue = {
  scannedBarcode: string;
}

type Option = { label: string; value: string };


export type CustomPickerModalProps = {
  visible: boolean;
  title: string;
  options: Option[];
  onClose: () => void;
  onSelect: (option: Option) => void;
  onAddItem: () => void;
};

export type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  categories: FilterableItem[];
  selectedCategories: number[];
  onCategoryChange: (categoryId: string) => void;
  onAddCategory: () => void;
};

export type FilterableItem = cateogryId | StatusId | roleid;

export type cateogryId = {
  id: number;
  name: string;
}

export type roleid = {
  id: number;
  name: string;
}
