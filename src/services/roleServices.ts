/* eslint-disable @typescript-eslint/no-shadow */

import { createDatabse, getDBInstance } from '../database/db';
import { roleid } from '../types/type';

// class roleServices {

//     addRole(...roles: string[]) {
//         try {
//            Promise.all(roles.map((role) => {
//                 const [res] = this.Db_instance('INSERT INTO role (name_role) VALUES (?) ON CONFILICT (name_role) DO NOTHING', [role]);
//                 console.log(res.insertId.toString());
//             }));
//         } catch (error) {
//             console.log(error);
//         }
//     }
// }

export const addInitialRoles = async () => {
  const roles = ['staff', 'admin', 'manager'];
  //   let temp = roles[0];
  console.log('get db instance');
  const db = await getDBInstance();

  // const [res] = await db.executeSql('INSERT INTO role (name_role) VALUES (?)', [temp]);
  // console.log(res.rows.length);
  try {
    // Gunakan transaksi callback style (lebih reliable di React Native)
    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        roles.forEach((roleName, index) => {
          tx.executeSql(
            'SELECT id_role FROM role WHERE name_role = ?',
            [roleName],
            (_, selectResult) => {
              if (selectResult.rows.length === 0) {
                tx.executeSql(
                  'INSERT INTO role (name_role) VALUES (?)',
                  [roleName],
                  (_, insertResult) => {
                    console.log(`✅ Role "${roleName}" ditambahkan, id: ${insertResult.insertId}`);

                    // Cek jika ini iterasi terakhir
                    if (index === roles.length - 1) {
                      resolve();
                    }
                  },
                  (_, error) => {
                    console.error(`❌ Gagal insert ${roleName}:`, error);
                    reject(error);
                    return true;
                  }
                );
              } else {
                console.log(`ℹ️ Role "${roleName}" sudah ada`);

                // Cek jika ini iterasi terakhir
                if (index === roles.length - 1) {
                  resolve();
                }
              }
            },
            (_, error) => {
              console.error(`❌ Gagal cek ${roleName}:`, error);
              reject(error);
              return true;
            }
          );
        });
      },
        (error) => {
          console.error('Transaction error:', error);
          reject(error);
        },
        () => {
          console.log('Transaction committed');
          resolve();
        });
    });

    console.log('✅ Semua initial roles berhasil diproses');
  } catch (error) {
    console.error('❌ Gagal menambahkan initial roles:', error);
  }
};

export const getAllRoles = async (): Promise<{ label: string, value: string }[]> => {
  const db = await createDatabse();
  let temp: { label: string, value: string }[] = [];
  const [result] = await db.executeSql('SELECT * from role');
  for (let i = 0; i < result.rows.length; i++) {
    temp.push({
      label: result.rows.item(i).role_name,
      value: result.rows.item(i).id,
    });
  }
  return temp;
};

export const getAllRolesEmployee = async (): Promise<roleid[]> => {
  const db = await createDatabse();
  let temp: roleid[] = [];
  const [result] = await db.executeSql('SELECT * from role');
  for (let i = 0; i < result.rows.length; i++) {
    temp.push({
      id: result.rows.item(i).id,
      name: result.rows.item(i).role_name,
    });
  }
  return temp;
};
