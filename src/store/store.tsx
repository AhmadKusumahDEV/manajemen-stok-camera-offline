import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSession } from '../types/type';

class StoringData {
    async saveData(key: string, value: any): Promise<void> {
        try {
            await AsyncStorage.setItem(key, value);
            console.log('Data berhasil disimpan di AsyncStorage.');
        } catch (error) {
            console.error('Gagal menyimpan data di AsyncStorage:', error);
        }
    }

    async saveDataObj(key: string, value: any): Promise<void> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
            console.log('Data berhasil disimpan di AsyncStorage.');
        } catch (error) {
            console.error('Gagal menyimpan data di AsyncStorage:', error);
        }
    }

    async getData(key: string): Promise<any> {
        try {
            const value = await AsyncStorage.getItem(key);
            if (value !== null) {
                return value;
            } else {
                return 'value not found';
            }
        } catch (error) {
            console.error('Gagal mengambil data dari AsyncStorage:', error);
        }
    }

    async getDataObj(key: string): Promise<any> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error('Gagal mengambil data dari AsyncStorage:', error);
        }
    }

    async removeData(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
            console.log('Data berhasil dihapus di AsyncStorage.');
        } catch (error) {
            console.error('Gagal menghapus data di AsyncStorage:', error);
        }
    }

    async validationsession(): Promise<UserSession | null> {
        const session: UserSession = await this.getDataObj('@user');
        if (!session) {
            return null;
        }

        if (session.expiredAt > new Date().getTime()) {
            return session;
        } else {
            this.removeData('@user');
            return null;
        }
    }
}

export default StoringData;
