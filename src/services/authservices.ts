import { SQLiteDatabase } from 'react-native-sqlite-storage';
import StoringData from '../store/store';
import { Alert } from 'react-native';
import { UserSession } from '../types/type';

const store = new StoringData();

export const authenticate = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8085/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Simpan token di AsyncStorage
      await store.saveData('@auth_token', data.token);
      await store.saveData('@token_expiry', data.expires.toString());
      return true;
    } else {
      console.error(data.error || 'Login failed');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

export const authenticatedb = (username: string, password: string, db: SQLiteDatabase): Promise<UserSession | null> => {
  const time = new Date().getTime();
  const expiresInOneHour = time + (60 * 60 * 1000);
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT
    e.employee_code,
    r.role_name,
    e.warehouse_code,
    w.warehouse_name
    FROM
      employee AS e
    INNER JOIN
      role AS r ON e.id_role = r.id
    LEFT JOIN 
      warehouse AS w ON e.warehouse_code = w.warehouse_code
    WHERE
      (e.user_id = ? OR e.employee_name = ?)
      AND e.password = ?;`,
        [username, username, password],
        async (_, { rows }) => {
          if (rows.length > 0) {
            let data = rows.item(0);
            const session: UserSession = {
              user_id: data.employee_code,
              role_name: data.role_name,
              warehouse_code: data.warehouse_code,
              warehouse_name: data.warehouse_name,
              expiredAt: expiresInOneHour,
              avatarUrl: 'https://i.pravatar.cc/150?u=' + time,
            };
            resolve(session);
          } else {
            console.log('Login failed');
            console.log('passwrod salah atau id ngawur rek');
            resolve(null);
          }
        },
        (_, error) => {
          Alert.alert('error on database');
          console.log(error);
          reject(error);
        }
      );
    });
  });
};


export const checksession = async (): Promise<boolean> => {
  const datauser: UserSession = await store.getDataObj('@user');
  return new Promise((resolve, _) => {
    if (datauser.expiredAt > new Date().getTime()) {
      resolve(true);
    } else {
      store.removeData('@user');
      resolve(false);
    }
  });
};
