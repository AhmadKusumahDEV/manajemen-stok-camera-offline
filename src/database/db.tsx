import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

// var db = SQLite.openDatabase({
//     name: 'manajemen_database',
//     location: 'default',
// });

// db.then(tx => {
//     tx.transaction(exec => {
//         exec.executeSql('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT)');
//     });
// });


const DATABASE_NAME: string = 'second_warehouse.db';

let db: SQLiteDatabase | null = null;


export const createDatabse = async (): Promise<SQLiteDatabase> => {
  if (db) {
    return db;
  }
  try {
    console.log('Membuka koneksi database...');
    db = await SQLite.openDatabase({
      name: DATABASE_NAME,
      createFromLocation: '~second_warehouse.db',
    }
    );
    console.log('Database terbuka:', db);
    return db;
  } catch (error) {
    console.error('Gagal membuka database:', error);
    throw error; // Lempar error agar bisa ditangani di level atas
  }
};

