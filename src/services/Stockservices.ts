import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { InventoryDetail, InventoryItem, ModalDataInventory, SelectProductInStok } from '../types/type';

export const getInventoryData = (
  db: SQLiteDatabase,
  code_warehouse?: string
): Promise<InventoryItem[]> => {
  return new Promise((resolve, reject) => {
    if (!code_warehouse) {
      return reject(new Error('code_warehouse is required'));
    }
    db.transaction(tx => {
      tx.executeSql('SELECT p.product_name AS product_name, sum(i.quantity) as quantity, p.product_code, c.id, c.name as categorys FROM inventory as i INNER JOIN product as p ON i.code_product = p.product_code INNER JOIN warehouse as w ON i.code_warehouse = w.warehouse_code INNER JOIN category as c ON p.id_category = c.id WHERE w.warehouse_code = ? GROUP by p.product_name',
        [code_warehouse],
        (_, { rows }) => {
          const result: InventoryItem[] = [];
          for (let i = 0; i < rows.length; i++) {
            result.push({
              product_name: rows.item(i).product_name,
              quantity: rows.item(i).quantity,
              sku: rows.item(i).product_code,
              code_product: rows.item(i).product_code,
              category: { id: rows.item(i).id, name: rows.item(i).categorys },
            });
          }
          resolve(result);
        },
        (_, error) => {
          reject(error);
          return true; // rollback
        }
      );
    });
  });
};

export const getDetailInventoryData = (
  db: SQLiteDatabase,
  code_warehouse?: string,
  product_code?: string
): Promise<InventoryDetail> => {
  return new Promise((resolve, reject) => {
    if (!code_warehouse || !product_code) {
      return reject(new Error('code_warehouse is required'));
    }
    db.transaction(tx => {
      tx.executeSql('select p.product_name, p.description_product, i.code_product, s.name as size , i.quantity , w.warehouse_name FROM inventory as i INNER JOIN product as p on i.code_product = p.product_code INNER JOIN size as s ON i.id_size = s.id INNER JOIN warehouse as w ON i.code_warehouse = w.warehouse_code WHERE i.code_warehouse = ? AND i.code_product = ?',
        [code_warehouse, product_code],
        (_, { rows }) => {
          const tempsize: { name: string, quantity: number }[] = [];
          for (let i = 0; i < rows.length; i++) {
            tempsize.push({
              name: rows.item(i).size,
              quantity: rows.item(i).quantity,
            });
          }
          const result: InventoryDetail = {
            product_name: rows.item(0).product_name,
            sku: rows.item(0).code_product,
            size: tempsize,
            warehouse: rows.item(0).warehouse_name,
            description: rows.item(0).description_product,
          };
          resolve(result);
        },
        (_, error) => {
          reject(error);
          return true; // rollback
        }
      );
    });
  });
};

export const getproductmodalstok = (
  db: SQLiteDatabase,
): Promise<SelectProductInStok[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'select pd.id , p.product_name, s.name as size, s.id as id_size ,pd.code_product , pd.barcode from product_detail as pd join product as p ON pd.code_product = p.product_code JOIN size as s ON pd.id_size = s.id',
        [],
        (_, { rows }) => {
          const result: SelectProductInStok[] = [];
          for (let i = 0; i < rows.length; i++) {
            result.push({
              id: rows.item(i).id,
              product_name: rows.item(i).product_name,
              size: rows.item(i).size,
              id_size: rows.item(i).id_size,
              product_code: rows.item(i).code_product,
              barcode: rows.item(i).barcode,
            });
          }
          resolve(result);
        },
        (_, error) => {
          reject(error);
          return true; // rollback
        }
      );
    });
  });
};


export const getModalDataInventory = ( // mengambil data product yang tersedia pada inventory
  db: SQLiteDatabase,
  code_warehouse?: string
): Promise<ModalDataInventory[]> => {
  return new Promise((resolve, reject) => {
    if (!code_warehouse) {
      return reject(new Error('code_warehouse is required'));
    }
    db.transaction(tx => {
      tx.executeSql('SELECT pd.id as id , p.product_name AS product_name, i.quantity as quantity, p.product_code as code_product, s.id as id_size, s.name as size , pd.barcode as barcode FROM inventory as i INNER JOIN product as p ON i.code_product = p.product_code INNER JOIN size as s ON i.id_size = s.id INNER JOIN product_detail as pd ON  i.id_size = pd.id_size and p.product_code = pd.code_product  WHERE i.code_warehouse = ?',
        [code_warehouse],
        (_, { rows }) => {
          const result: ModalDataInventory[] = [];
          for (let i = 0; i < rows.length; i++) {
            result.push({
              id: rows.item(i).id,
              product_name: rows.item(i).product_name,
              size: rows.item(i).size,
              id_size: rows.item(i).id_size,
              product_code: rows.item(i).code_product,
              barcode: rows.item(i).barcode,
              quantity: rows.item(i).quantity,
            });
          }
          resolve(result);
        },
        (_, error) => {
          reject(error);
          return true; // rollback
        }
      );
    });
  });
};
