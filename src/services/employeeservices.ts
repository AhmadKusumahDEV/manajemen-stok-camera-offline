import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { DetailEmployee, Employee, EmployePost, ProfilEmployee, SendIdCustom } from '../types/type';
import { v6 as uuidv6 } from 'uuid';

export const getEmployeeData = (
  db: SQLiteDatabase,
  warehouse_code: string | null,
  employee_code: string | null
): Promise<Employee[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'select e.id, e.employee_code, e.employee_name, r.role_name, r.id AS role_id_primary, r.role_name from employee as e join role as r on  e.id_role = r.id WHERE E.warehouse_code = ? and e.employee_code <> ?',
        [warehouse_code, employee_code],
        (_, { rows }) => {
          const result: Employee[] = [];
          for (let i = 0; i < rows.length; i++) {
            const timestamp = new Date().getTime() + i;
            const temp = rows.item(i);
            const setavatar: Employee = {
              id: String(temp.id),
              name: temp.employee_name,
              employeeCode: temp.employee_code,
              role: { id: temp.role_id_primary, name: temp.role_name },
              avatarUrl: 'https://i.pravatar.cc/150?u=' + timestamp,
            };
            result.push(setavatar);
          }
          resolve(result);
        },
        (_, error) => {
          reject(error);
          return true; // Rollback transaction on error
        }
      );
    });
  });
};

export const profil = (id: SendIdCustom, db: SQLiteDatabase): Promise<ProfilEmployee> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT e.id, e.employee_name as name, r.role_name as role , e.employee_code, e.user_id from employee as e join role as r on e.id_role = r.id WHERE employee_code = ?',
        [id.id],
        (_, { rows }) => {
          const result = rows.item(0);
          const setavatar: ProfilEmployee = {
            id: String(result.id),
            name: result.name,
            role: result.role,
            employeeCode: result.employee_code,
            user_id: result.user_id,
            avatarUrl: id.avatarurl,
          };
          resolve(setavatar);
        },
        (_, error) => {
          reject(error);
          return true; // Rollback transaction on error
        }
      );
    });
  });
};

export const detailEmployee = (id: SendIdCustom, db: SQLiteDatabase): Promise<DetailEmployee> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT e.employee_name as name , r.role_name as role , w.warehouse_name as warehouse , e.employee_code from employee as e join role as r on e.id_role = r.id join warehouse as w on e.warehouse_code = w.warehouse_code  WHERE e.employee_code = ?',
        [id.id],
        (_, { rows }) => {
          const results = rows.item(0);
          const result: DetailEmployee = {
            name: results.name,
            role: results.role,
            employeeCode: results.employee_code,
            warehouse: results.warehouse,
            avatarUrl: id.avatarurl,
          };
          console.log(result);
          resolve(result);
        },
        (_, error) => {
          console.error('Error get data');
          reject(error);
          return true; // Rollback transaction on error
        }
      );
    });
  });
};

export const customEmployeedetail = (id: SendIdCustom, db: SQLiteDatabase): Promise<DetailEmployee> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT e.employee_name as name , r.id as role , w.warehouse_code as warehouse , e.employee_code from employee as e join role as r on e.id_role = r.id join warehouse as w on e.warehouse_code = w.warehouse_code  WHERE e.employee_code = ?',
        [id.id],
        (_, { rows }) => {
          const results = rows.item(0);
          const result: DetailEmployee = {
            name: results.name,
            role: results.role,
            employeeCode: results.employee_code,
            warehouse: results.warehouse,
            avatarUrl: id.avatarurl,
          };
          console.log(result);
          resolve(result);
        },
        (_, error) => {
          console.error('Error get data');
          reject(error);
          return true; // Rollback transaction on error
        }
      );
    });
  });
};

export const insertEmployee = (db: SQLiteDatabase, employee: EmployePost): Promise<number> => {
  const uuid6 = uuidv6();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO employee (user_id, employee_name, password, employee_code, id_role, warehouse_code) VALUES (?, ?, ?, ?, ?, ?)',
        [employee.user_id, employee.employee_name, employee.password, uuid6, employee.id_role, employee.warehouse_code],
        (_, { insertId }) => {
          console.log('Data inserted with ID:', insertId);
          resolve(insertId);
        },
        (_, error) => {
          console.error('Error inserting data:');
          reject(error);
          return true; // Rollback transaction on error
        }
      );
    });
  });
};

export const removeEmployee = (db: SQLiteDatabase, id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM employee WHERE id = ?',
        [id],
        () => {
          console.log('Data deleted successfully');
          resolve();
        },
        (_, error) => {
          console.error('Error deleting data:');
          reject(error);
          return true; // Rollback transaction on error
        }
      );
    });
  });
};


export const updatedEmployee = async (db: SQLiteDatabase, id: string, employee: EmployePost): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      if (employee.password === '') {
        tx.executeSql(
          'UPDATE employee SET employee_name = ? , id_role = ? , warehouse_code = ? WHERE employee_code = ?',
          [employee.employee_name, employee.id_role, employee.warehouse_code, id],
          () => {
            console.log('Data Updated successfully');
            resolve();
          },
          (_, error) => {
            console.error('Error updating data:');
            reject(error);
            return true; // Rollback transaction on error
          }
        );
      }
      tx.executeSql(
        'UPDATE employee SET employee_name = ? , password = ? , id_role = ? , warehouse_code = ? WHERE employee_code = ?',
        [employee.employee_name, employee.password, employee.id_role, employee.warehouse_code, id],
        () => {
          console.log('Data Updated successfully');
          resolve();
        },
        (_, error) => {
          console.error('Error updating data:');
          reject(error);
          return true; // Rollback transaction on error
        }
      );
    });
  });
};
