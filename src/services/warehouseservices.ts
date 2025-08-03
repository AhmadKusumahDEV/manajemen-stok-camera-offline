import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { createDatabse } from '../database/db';
import { WarehouseCreateData, Warehouse, WarehouseUpdateData } from '../types/type';
import { v6 as uuidv6 } from 'uuid';

export const getAllWarehouse = async (): Promise<{ label: string, value: string }[]> => {
  const db = await createDatabse();
  let temp: { label: string, value: string }[] = [];
  const [result] = await db.executeSql('SELECT warehouse_name as name , warehouse_code from warehouse');
  for (let i = 0; i < result.rows.length; i++) {
    temp.push({
      label: result.rows.item(i).name,
      value: result.rows.item(i).warehouse_code,
    });
  }
  return temp;
};

export const addWarehouse = (db: SQLiteDatabase, warehouseData: WarehouseCreateData): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!warehouseData.warehouse_name) {
      return reject(new Error('Nama gudang tidak boleh kosong.'));
    }

    const newWarehouseCode = uuidv6();

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO warehouse (warehouse_name, warehouse_code, location_description) VALUES (?, ?, ?)',
        [warehouseData.warehouse_name, newWarehouseCode, warehouseData.location_description || null],
        (_, { insertId }) => {
          if (insertId) {
            console.log(`Warehouse baru berhasil dibuat dengan ID: ${insertId}`);
            resolve(insertId);
          } else {
            reject(new Error('Gagal mendapatkan ID untuk warehouse baru.'));
          }
        },
        (_, error) => {
          console.error('Error saat menambahkan warehouse:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

/**
 * 2. READ: Mengambil semua data warehouse dari database.
 * @param db - Instance koneksi database SQLite.
 * @returns Promise yang resolve dengan array berisi semua objek warehouse.
 */
export const getWarehouses = (db: SQLiteDatabase): Promise<Warehouse[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM warehouse ORDER BY warehouse_name ASC',
        [],
        (_, { rows }) => {
          const warehouses: Warehouse[] = [];
          for (let i = 0; i < rows.length; i++) {
            warehouses.push(rows.item(i));
          }
          console.log(`${warehouses.length} warehouse berhasil diambil.`);
          resolve(warehouses);
        },
        (_, error) => {
          console.error('Error saat mengambil data warehouse:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const getWarehousesDetail = (db: SQLiteDatabase, warehouseCode: string): Promise<Warehouse> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM warehouse WHERE warehouse_code = ?',
        [warehouseCode],
        (_, { rows }) => {
          const warehouses: Warehouse = rows.item(0);
          resolve(warehouses);
        },
        (_, error) => {
          console.error('Error saat mengambil data warehouse:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const getWarehouseCode = (db: SQLiteDatabase, warehouse_name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'select warehouse_code from warehouse WHERE warehouse_name = ?',
        [warehouse_name],
        (_, { rows }) => {
          const warehouses: string = rows.item(0).warehouse_code;
          resolve(warehouses);
        },
        (_, error) => {
          console.error('Error saat mengambil data warehouse:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

/**
 * @param db - Instance koneksi database SQLite.
 * @param id - ID dari warehouse yang akan diupdate.
 * @param warehouseData - Objek berisi data yang akan diubah.
 * @returns Promise yang resolve dengan jumlah baris yang terpengaruh (seharusnya 1).
 */
export const updateWarehouse = (db: SQLiteDatabase, id: string, warehouseData: WarehouseUpdateData): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(new Error('ID warehouse tidak valid atau tidak diberikan.'));
    }

    const fieldsToUpdate = Object.keys(warehouseData).filter(key => warehouseData[key as keyof WarehouseUpdateData] !== undefined);
    if (fieldsToUpdate.length === 0) {
      return reject(new Error('Tidak ada data yang diberikan untuk diupdate.'));
    }

    const setClause = fieldsToUpdate.map(key => `${key} = ?`).join(', ');
    const params = [...fieldsToUpdate.map(key => warehouseData[key as keyof WarehouseUpdateData]), id];

    const query = `UPDATE warehouse SET ${setClause} WHERE id = ?`;

    db.transaction(tx => {
      tx.executeSql(
        query,
        params,
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            console.log(`Warehouse dengan ID ${id} berhasil diupdate.`);
            resolve(rowsAffected);
          } else {
            reject(new Error(`Warehouse dengan ID ${id} tidak ditemukan.`));
          }
        },
        (_, error) => {
          console.error('Error saat mengupdate warehouse:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

/**
 * @param db - Instance koneksi database SQLite.
 * @param id - ID dari warehouse yang akan dihapus.
 * @returns Promise yang resolve jika berhasil, atau reject jika gagal.
 */
export const deleteWarehouse = (db: SQLiteDatabase, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(new Error('ID warehouse tidak valid atau tidak diberikan.'));
    }

    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM warehouse WHERE warehouse_code = ?',
        [id],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            console.log(`Warehouse dengan ID ${id} berhasil dihapus.`);
            resolve();
          } else {
            reject(new Error(`Warehouse dengan ID ${id} tidak ditemukan.`));
          }
        },
        (_, error) => {
          console.error('Error saat menghapus warehouse:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

