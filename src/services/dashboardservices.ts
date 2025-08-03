import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { DashboardItem } from '../types/type';

export const getTotalCounts = (db: SQLiteDatabase, code_warehouse: string, warehouse_name: string): Promise<DashboardItem> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const results: DashboardItem = {
        transaction: 0,
        employee: 0,
        product: 0,
      };
      let completedQueries = 0;

      // Handler untuk menyelesaikan promise setelah 3 query selesai
      const checkCompletion = () => {
        if (completedQueries === 3) {
          resolve(results);
        }
      };


      tx.executeSql(
        'SELECT COUNT(*) AS total FROM transactions where origin_entity_name = ? OR destination_entity_name = ?',
        [warehouse_name, warehouse_name],
        (_, { rows }) => {
          results.transaction = rows.item(0).total;
          completedQueries++;
          checkCompletion();
        },
        (_, error) => {
          reject(error);
          return true;
        }
      );

      tx.executeSql(
        'SELECT COUNT(*) AS total FROM employee where warehouse_code = ?',
        [code_warehouse],
        (_, { rows }) => {
          results.employee = rows.item(0).total;
          completedQueries++;
          checkCompletion();
        },
        (_, error) => {
          reject(error);
          return true;
        }
      );

      tx.executeSql(
        'SELECT COUNT(*) AS total FROM (select *  from inventory as i where i.code_warehouse =  ?  GROUP by i.code_product) as group_row',
        [code_warehouse],
        (_, { rows }) => {
          results.product = rows.item(0).total;
          completedQueries++;
          checkCompletion();
        },
        (_, error) => {
          reject(error);
          return true;
        }
      );
    });
  });
};
