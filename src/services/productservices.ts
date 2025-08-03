/* eslint-disable @typescript-eslint/no-shadow */
import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { finalProductData, ProductDetail, ProductWithDetailUpdateData, updatedProductData } from '../types/type';
import { v6 as uuidv6 } from 'uuid';

export const getproduct = (db: SQLiteDatabase): Promise<{ id: string, name: string, id_category: number, category: string }[]> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'select p.product_code , p.product_name , c.id , c.name from product as p INNER JOIN category as c on p.id_category = c.id',
                [],
                (_, { rows }) => {
                    const result: { id: string, name: string, id_category: number, category: string }[] = [];
                    for (let i = 0; i < rows.length; i++) {
                        result.push({
                            id: rows.item(i).product_code,
                            name: rows.item(i).product_name,
                            id_category: rows.item(i).id,
                            category: rows.item(i).name,
                        });
                    }
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

export const getproductdetail = (db: SQLiteDatabase, product_code: string): Promise<ProductDetail> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT p.id as id, p.product_name, p.price, p.description_product, p.product_code FROM product as p WHERE p.product_code = ? ',
                [product_code],
                (_, { rows }) => {
                    const results = rows.item(0);
                    const result: ProductDetail = {
                        id: results.id,
                        name: results.product_name,
                        price: results.price,
                        description: results.description_product,
                        productCode: results.product_code,
                    };
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

export const insertProductWithDetail = (db: SQLiteDatabase, data: finalProductData): Promise<number> => {
    // Generate UUIDv6 unik untuk product_code
    const newProductCode = uuidv6();

    return new Promise((resolve, reject) => {
        // Memulai satu transaksi untuk kedua operasi INSERT
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO product (product_name, price, description_product, product_code, id_category) VALUES (?, ?, ?, ?, ?)',
                [
                    data.product_name,
                    data.price,
                    data.description_product || null,
                    newProductCode,
                    data.id_category,
                ],
                // Callback jika insert produk utama berhasil
                (_, { insertId: productId }) => {
                    if (!productId) {
                        reject(new Error('Gagal mendapatkan ID Produk.'));
                        return; // Hentikan eksekusi jika gagal
                    }
                    console.log('Produk baru berhasil dimasukkan dengan ID:', productId);

                    tx.executeSql(
                        'INSERT INTO product_detail (code_product, id_size, barcode) VALUES (?, ?, ?)',
                        [
                            newProductCode, // Gunakan product_code yang sama dari produk yang baru dibuat
                            data.id_size,
                            data.barcode,
                        ],
                        // Callback jika insert detail berhasil
                        (_, { insertId: detailId }) => {
                            if (detailId) {
                                console.log('Detail produk berhasil dimasukkan dengan ID:', detailId);
                                resolve(productId);
                            } else {
                                reject(new Error('Gagal mendapatkan ID untuk detail produk.'));
                            }
                        },
                        (_, error) => {
                            console.error('Error saat memasukkan data detail produk:', error);
                            reject(error);
                            return true;
                        }
                    );
                },
                // Callback jika insert produk utama GAGAL
                (_, error) => {
                    console.error('Error saat memasukkan data produk:', error);
                    reject(error);
                    return true; // Rollback seluruh transaksi
                }
            );
        });
    });
};

export const getProductEdit = (db: SQLiteDatabase, product_code: string): Promise<updatedProductData> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'select pd.id as id, p.product_name, p.product_code ,pd.barcode, p.price, p.id_category, p.description_product, pd.id_size from product_detail as pd INNER JOIN product as p ON pd.code_product = p.product_code WHERE pd.code_product = ? ',
                [product_code],
                (_, { rows }) => {
                    const results = rows.item(0);
                    const result: updatedProductData = {
                        id: results.id,
                        product_name: results.product_name,
                        price: results.price,
                        description_product: results.description_product,
                        id_category: results.id_category,
                        id_size: results.id_size,
                        code_product: product_code,
                        barcode: results.barcode,
                    };
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


export const updateProductWithDetail = (
    db: SQLiteDatabase,
    productCode: string,
    detailId: number,
    data: ProductWithDetailUpdateData
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const productFields: (keyof ProductWithDetailUpdateData)[] = ['product_name', 'price', 'description_product', 'id_category'];
        const detailFields: (keyof ProductWithDetailUpdateData)[] = ['id_size', 'barcode'];

        const productUpdates = productFields.filter(key => data[key] !== undefined);
        const detailUpdates = detailFields.filter(key => data[key] !== undefined);

        if (productUpdates.length === 0 && detailUpdates.length === 0) {
            return reject(new Error('Tidak ada data yang diberikan untuk diupdate.'));
        }

        db.transaction(tx => {
            const promises: Promise<void>[] = [];

            // 1. Buat dan jalankan query UPDATE untuk tabel 'product' jika ada
            if (productUpdates.length > 0) {
                const setClause = productUpdates.map(key => `${key} = ?`).join(', ');
                const params = productUpdates.map(key => data[key]);
                params.push(productCode);

                promises.push(new Promise((pResolve, pReject) => {
                    tx.executeSql(
                        `UPDATE product SET ${setClause} WHERE product_code = ?`,
                        params,
                        () => pResolve(),
                        (_, error) => { pReject(error); return false; }
                    );
                }));
            }

            // 2. Buat dan jalankan query UPDATE untuk tabel 'product_detail' jika ada
            if (detailUpdates.length > 0) {
                const setClause = detailUpdates.map(key => `${key} = ?`).join(', ');
                const params = detailUpdates.map(key => data[key]);
                params.push(detailId);

                promises.push(new Promise((pResolve, pReject) => {
                    tx.executeSql(
                        `UPDATE product_detail SET ${setClause} WHERE id = ?`,
                        params,
                        () => pResolve(),
                        (_, error) => { pReject(error); return false; }
                    );
                }));
            }

            // 3. Jalankan semua promise update
            Promise.all(promises)
                .then(() => {
                    // Ini akan dieksekusi setelah semua tx.executeSql di atas berhasil
                })
                .catch(error => {
                    console.error('Salah satu operasi update gagal:', error);
                    // Transaksi akan otomatis di-rollback oleh library jika ada error
                });
        },
        (error) => { // Callback jika transaksi GAGAL
            console.error('Transaksi update produk gagal:', error);
            reject(error);
        },
        () => { // Callback jika transaksi SUKSES
            console.log('Produk dan detailnya berhasil diupdate.');
            resolve();
        });
    });
};
