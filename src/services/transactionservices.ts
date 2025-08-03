/* eslint-disable @typescript-eslint/no-shadow */
import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { detailtransactioninsert, Transaction, TransactionQueryResult, TransactionQueryResultSpesific } from '../types/type';
import { createDatabse } from '../database/db';

export const generateNumberString = (length: number): string => {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
};

const formatDaysAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) { return 'Just now'; }
    if (diffMin < 60) { return `${diffMin} minutes ago`; }
    if (diffHours < 24) { return `${diffHours} hours ago`; }
    if (diffDays === 1) { return '1 day ago'; }

    return `${diffDays} days ago`;
};

export const insertTransactionWithDetails = (
    db: SQLiteDatabase,
    transactionDetails: detailtransactioninsert[],
    type_transaction: string,
    employee_code: string,
    origin_entity_name: string,
    destination_entity_name: string,
): Promise<number> => {
    const kodeTransaksi = '#' + generateNumberString(7);

    return new Promise((resolve, reject) => {
        if (!transactionDetails || transactionDetails.length === 0) {
            return reject(new Error('Tidak ada detail produk untuk ditambahkan.'));
        }

        db.transaction(tx => {
            // 1. Insert ke tabel 'transactions' (header)
            tx.executeSql(
                `INSERT INTO transactions 
                 (code_transaksi, origin_entity_name, destination_entity_name, employee_code, id_status, tipe_transaksi) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    kodeTransaksi,
                    origin_entity_name,
                    destination_entity_name,
                    employee_code,
                    2,
                    type_transaction,
                ],
                (_, { insertId }) => {
                    if (!insertId) {
                        reject(new Error('Gagal mendapatkan ID Transaksi.'));
                        return;
                    }

                    console.log('Header transaksi berhasil dibuat dengan ID:', insertId);

                    let detailQuery = `INSERT INTO detail_transactions 
                                       (id_transaction, id_detail_product, quantity, scanner_quantity) 
                                       VALUES `;

                    const params: (number | string)[] = [];
                    const placeholders: string[] = [];

                    transactionDetails.forEach(product => {

                        placeholders.push('(?, ?, ?, ?)');
                        params.push(
                            insertId,
                            product.id_detail_product,
                            product.quantity,
                            0
                        );
                    });

                    detailQuery += placeholders.join(', ');


                    tx.executeSql(
                        detailQuery,
                        params,
                        (_, { rowsAffected }) => {
                            console.log(`Berhasil memasukkan ${rowsAffected} detail transaksi.`);
                            // Resolve HANYA setelah detail berhasil dimasukkan
                            resolve(insertId);
                        },
                        (_, error) => {
                            console.error('Error saat bulk insert detail transaksi:', error);
                            reject(error);
                            return true; // Rollback
                        }
                    );
                },
                (_, error) => {
                    console.error('Error saat insert header transaksi:', error);
                    reject(error);
                    return true; // Rollback
                }
            );
        });
    });
};

export const getAlltransaction = async (): Promise<Transaction[]> => {
    const db = await createDatabse();
    let temp: Transaction[] = [];
    const [result] = await db.executeSql('SELECT * from transactions');
    for (let i = 0; i < result.rows.length; i++) {
        temp.push({
            id: result.rows.item(i).id,
            code_transaksi: result.rows.item(i).code_transaksi,
            origin_entity_name: result.rows.item(i).origin_entity_name,
            destination_entity_name: result.rows.item(i).destination_entity_name,
            employee_code: result.rows.item(i).employee_code,
            id_status: result.rows.item(i).id_status,
            created_at: result.rows.item(i).created_at,
            tipe_transaksi: result.rows.item(i).tipe_transaksi,
            status_name: result.rows.item(i).status_name,
        });
    }
    return temp;
};


export const getTransanctionFromWarehosueData = (
    db: SQLiteDatabase,
    code_warehouse?: string
): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
        if (!code_warehouse) {
            return reject(new Error('code_warehouse is required'));
        }
        db.transaction(tx => {
            tx.executeSql('SELECT t.id as id , t.code_transaksi, t.origin_entity_name as send , t.destination_entity_name as receive, e.employee_name as name , s.name as status , s.id as status_id, t.created_at as times , t.tipe_transaksi FROM  transactions as t INNER JOIN employee as e ON  t.employee_code = e.employee_code INNER JOIN status as s ON t.id_status = s.id WHERE origin_entity_name = ? OR destination_entity_name = ?',
                [code_warehouse, code_warehouse],
                (_, { rows }) => {
                    const result: Transaction[] = [];
                    for (let i = 0; i < rows.length; i++) {
                        result.push({
                            id: rows.item(i).id,
                            code_transaksi: rows.item(i).code_transaksi,
                            origin_entity_name: rows.item(i).send,
                            destination_entity_name: rows.item(i).receive,
                            employee_code: rows.item(i).name,
                            id_status: rows.item(i).status_id,
                            created_at: formatDaysAgo(rows.item(i).times),
                            tipe_transaksi: rows.item(i).tipe_transaksi,
                            status_name: rows.item(i).status,
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

export const getDetailTransanction = (
    db: SQLiteDatabase,
    transaction_id?: string
): Promise<TransactionQueryResult[]> => {
    return new Promise((resolve, reject) => {
        if (!transaction_id) {
            return reject(new Error('transaction_id is required'));
        }
        db.transaction(tx => {
            tx.executeSql('select t.created_at , t.origin_entity_name, t.destination_entity_name, st.name as status_name, t.tipe_transaksi ,t.employee_code, p.product_name , s.name as size_name, td.quantity from detail_transactions as td INNER JOIN transactions as t ON  td.id_transaction = t.id INNER JOIN status as st ON t.id_status = st.id INNER JOIN product_detail as pd ON td.id_detail_product = pd.id INNER JOIN product as p ON  pd.code_product = p.product_code INNER JOIN size as s ON  pd.id_size = s.id WHERE td.id_transaction = ?',
                [transaction_id],
                (_, { rows }) => {
                    const result: TransactionQueryResult[] = [];
                    for (let i = 0; i < rows.length; i++) {
                        result.push({
                            created_at: rows.item(i).created_at,
                            origin_entity_name: rows.item(i).origin_entity_name,
                            destination_entity_name: rows.item(i).destination_entity_name,
                            status_name: rows.item(i).status_name,
                            tipe_transaksi: rows.item(i).tipe_transaksi,
                            employee_code: rows.item(i).employee_code,
                            product_name: rows.item(i).product_name,
                            size_name: rows.item(i).size_name,
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


export const getDataProcessTransanction = (
    db: SQLiteDatabase,
    transaction_id?: string
): Promise<TransactionQueryResultSpesific[]> => {
    return new Promise((resolve, reject) => {
        if (!transaction_id) {
            return reject(new Error('transaction_id is required'));
        }
        db.transaction(tx => {
            tx.executeSql('select pd.id, t.created_at , t.origin_entity_name, t.destination_entity_name, st.name as status_name, t.tipe_transaksi ,t.employee_code, p.product_name , p.product_code, s.name as size_name, s.id as id_size , td.quantity , pd.barcode as barcode from detail_transactions as td INNER JOIN transactions as t ON  td.id_transaction = t.id INNER JOIN status as st ON t.id_status = st.id INNER JOIN product_detail as pd ON td.id_detail_product = pd.id INNER JOIN product as p ON  pd.code_product = p.product_code INNER JOIN size as s ON  pd.id_size = s.id WHERE td.id_transaction = ?',
                [transaction_id],
                (_, { rows }) => {
                    const result: TransactionQueryResultSpesific[] = [];
                    for (let i = 0; i < rows.length; i++) {
                        result.push({
                            id: rows.item(i).id,
                            id_size: rows.item(i).id_size,
                            code_product: rows.item(i).product_code,
                            created_at: rows.item(i).created_at,
                            origin_entity_name: rows.item(i).origin_entity_name,
                            destination_entity_name: rows.item(i).destination_entity_name,
                            status_name: rows.item(i).status_name,
                            tipe_transaksi: rows.item(i).tipe_transaksi,
                            employee_code: rows.item(i).employee_code,
                            product_name: rows.item(i).product_name,
                            size_name: rows.item(i).size_name,
                            quantity: rows.item(i).quantity,
                            barcode: rows.item(i).barcode,
                            scanner_quantity: 0,
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


export const updateTransactionStatus = (
    db: SQLiteDatabase,
    transactionId: number,
    newStatusId: number
): Promise<number> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'UPDATE transactions SET id_status = ? WHERE id = ?',
                [newStatusId, transactionId],
                (_, result) => {
                    console.log(`Status transaksi #${transactionId} berhasil diubah ke ${newStatusId}`);
                    resolve(result.insertId);
                },
                (_, error) => {
                    console.error('Gagal mengubah status transaksi:', error);
                    reject(error);
                    return true;
                }
            );
        });
    });
};


export const upsertInventory = async (
    db: SQLiteDatabase,
    items: { code_product: string; id_size: number; code_warehouse: string; quantity: number }[]
): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!items || items.length === 0) {
            return resolve(); // Tidak ada yang perlu dilakukan
        }

        // Mulai satu transaksi untuk semua operasi
        db.transaction(
            tx => {
                // Buat sebuah array promise untuk setiap item yang akan diproses
                const promises = items.map(item => {
                    return new Promise<void>((itemResolve, itemReject) => {
                        tx.executeSql(
                            `SELECT id FROM inventory 
               WHERE code_product = ? AND id_size = ? AND code_warehouse = ?`,
                            [item.code_product, item.id_size, item.code_warehouse],
                            (_, { rows }) => {
                                const exists = rows.length > 0;

                                if (exists) {
                                    tx.executeSql(
                                        `UPDATE inventory 
                     SET quantity = quantity + ? 
                     WHERE code_product = ? AND id_size = ? AND code_warehouse = ?`,
                                        [item.quantity, item.code_product, item.id_size, item.code_warehouse],
                                        () => itemResolve(), // Selesaikan promise untuk item ini
                                        (_, error) => itemReject(error)
                                    );
                                } else {
                                    tx.executeSql(
                                        `INSERT INTO inventory 
                     (code_product, id_size, code_warehouse, quantity) 
                     VALUES (?, ?, ?, ?)`,
                                        [item.code_product, item.id_size, item.code_warehouse, item.quantity],
                                        () => itemResolve(), // Selesaikan promise untuk item ini
                                        (_, error) => itemReject(error)
                                    );
                                }
                            },
                            (_, error) => itemReject(error)
                        );
                    });
                });

                // Tunggu semua promise (semua item) selesai diproses
                Promise.all(promises)
                    .then(() => {
                        console.log('Semua operasi UPSERT selesai.');
                    })
                    .catch(error => {
                        // Jika ada satu saja yang gagal, seluruh transaksi akan di-rollback.
                        console.error('Salah satu operasi UPSERT gagal, transaksi di-rollback:', error);
                    });
            },
            // Callback jika transaksi GAGAL secara keseluruhan
            error => {
                console.error('Transaksi UPSERT inventory gagal:', error);
                reject(error);
            },
            // Callback jika transaksi SUKSES secara keseluruhan
            () => {
                console.log(`Berhasil melakukan upsert untuk ${items.length} item.`);
                resolve();
            }
        );
    });
};

export const removestockinventory = async (
    db: SQLiteDatabase,
    items: { code_product: string; id_size: number; code_warehouse: string; quantity: number }[]
): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!items || items.length === 0) {
            return resolve();
        }
        db.transaction(
            tx => {
                // Buat sebuah array promise untuk setiap item yang akan diproses
                const promises = items.map(item => {
                    return new Promise<void>((itemResolve, itemReject) => {
                        tx.executeSql(
                            `SELECT id FROM inventory 
               WHERE code_product = ? AND id_size = ? AND code_warehouse = ?`,
                            [item.code_product, item.id_size, item.code_warehouse],
                            (_, { rows }) => {
                                const exists = rows.length > 0;

                                if (exists) {
                                    tx.executeSql(
                                        `UPDATE inventory 
                     SET quantity = quantity + ? 
                     WHERE code_product = ? AND id_size = ? AND code_warehouse = ?
                     AND quantity + ? >= 0`, // agar stock tidak minus
                                        [item.quantity, item.code_product, item.id_size, item.code_warehouse, item.quantity],
                                        (_, { rowsAffected }) => {
                                            if (item.quantity < 0 && rowsAffected === 0) {
                                                itemReject(new Error(`Stok tidak mencukupi untuk produk ${item.code_product}`));
                                            } else {
                                                itemResolve();
                                            }
                                        },
                                        (_, error) => itemReject(error)
                                    );
                                } else {
                                    if (item.quantity < 0) {
                                        itemReject(new Error(`Tidak bisa mengurangi stok untuk produk ${item.code_product} karena belum ada di inventaris.`));
                                        return;
                                    }
                                    tx.executeSql(
                                        'INSERT INTO inventory (code_product, id_size, code_warehouse, quantity)  VALUES (?, ?, ?, ?)',
                                        [item.code_product, item.id_size, item.code_warehouse, item.quantity],
                                        () => itemResolve(),
                                        (_, error) => itemReject(error)
                                    );
                                }
                            },
                            (_, error) => itemReject(error)
                        );
                    });
                });

                // Tunggu semua promise (semua item) selesai diproses
                Promise.all(promises)
                    .then(() => {
                        // Jika semua berhasil, transaksi akan di-commit
                    })
                    .catch(error => {
                        // Jika ada satu saja yang gagal, seluruh transaksi akan di-rollback.
                        console.error('Salah satu operasi UPSERT gagal, transaksi di-rollback:', error);
                    });
            },
            error => {
                console.error('Transaksi UPSERT inventory gagal:', error);
                reject(error);
            },
            () => {
                console.log(`Berhasil melakukan upsert untuk ${items.length} item.`);
                resolve();
            }
        );
    });
};
