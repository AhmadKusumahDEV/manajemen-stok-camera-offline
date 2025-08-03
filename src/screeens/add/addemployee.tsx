
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
// import { v6 as uuidv6 } from 'uuid';

import { CustomPickerModal } from '../components/picker';
import { getAllRoles } from '../../services/roleServices';
import { getAllWarehouse } from '../../services/warehouseservices';
import { AddEmployeeScreenProps, EmployePost } from '../../types/type';
import { insertEmployee } from '../../services/employeeservices';
import { createDatabse } from '../../database/db';

// --- Ikon Sementara (Placeholder) ---
const PlaceholderIcon = ({ name }: { name: string }) => (
    <Text style={styles.iconPlaceholder}>
        {name === 'eye' ? '👁️' : name === 'eye-off' ? '🚫' : '▼'}
    </Text>
);


// --- Komponen Layar Utama ---
const AddEmployeeScreen = ({ navigation }: AddEmployeeScreenProps) => {
    const SvgIcon = ({ name }: { name: string }) => <Text style={styles.iconPlaceholder}>[{name.charAt(0).toUpperCase()}]</Text>;
    // State untuk setiap field input
    const [fullName, setFullName] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [pickerVisible, setPickerVisible] = useState<'role' | 'warehouse' | null>(null);
    const [selectedrole, setSelectedrole] = useState<string | null | number>(null);
    const [selectedWarehouse, setSelectedwarehouse] = useState<string | null | number>(null);
    const [role, setrole] = useState<{ label: string, value: string }[]>([]);
    const [warehouse, setwarehouse] = useState<{ label: string, value: string }[]>([]);
    // State untuk mengontrol visibilitas password
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        const setdata = async () => {
            const roles = await getAllRoles();
            const warehouses = await getAllWarehouse();
            setrole(roles);
            setwarehouse(warehouses);
        };
        setdata();
    }, []);

    const handleSubmit = async () => {
        // Validasi sederhana
        if (!fullName || !employeeId || !password || !selectedrole || !selectedWarehouse) {
            Alert.alert('Incomplete Form', 'Please fill all the fields.');
            return;
        }

        const db = await createDatabse();

        const employeeData: EmployePost = {
            user_id: employeeId,
            employee_name: fullName,
            password: password,
            warehouse_code: selectedWarehouse as string,
            id_role: selectedrole as number,
        };


        console.log('Submitting Employee Data:', employeeData);
        const id = await insertEmployee(db, employeeData);
        console.log(id);
        Alert.alert('Success', 'Employee data is ready to be submitted.', [
            { text: 'Tidak', style: 'cancel' },
            {
                text: 'Ya', onPress: () => {
                    navigation.navigate('home', { screen: 'employee' });
                },
            },
        ]);
        // Di sini Anda akan memanggil API untuk menyimpan data
    };

    const handleSelect = (option: { label: string; value: string | number }) => {
        if (pickerVisible === 'role') {
            setSelectedrole(option.value);
        } else if (pickerVisible === 'warehouse') {
            setSelectedwarehouse(option.value);
        }
        setPickerVisible(null); // Tutup modal setelah memilih
    };

    const getLabel = (type: 'role' | 'warehouse', value: string | null | number) => {
        if (!value) { return null; }
        const list = type === 'role' ? role : warehouse;
        const selectedItem = list.find(item => item.value === value);
        return selectedItem?.label;
    };

    const handleAddNewItem = () => {
        const type = pickerVisible;
        setPickerVisible(null); // Tutup modal dulu
        // Tampilkan alert berdasarkan tipe picker yang aktif
        Alert.alert('Add New', `Di sini Anda bisa navigasi ke halaman untuk menambah ${type} baru.`);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter employee's full name"
                            placeholderTextColor="#999"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    {/* ID */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ID</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter employee ID"
                            placeholderTextColor="#999"
                            value={employeeId}
                            onChangeText={setEmployeeId}
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.inputInner}
                                placeholder="Enter password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordVisible} // <-- Kunci untuk menyamarkan
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setIsPasswordVisible(prev => !prev)}
                            >
                                <PlaceholderIcon name={isPasswordVisible ? 'eye-off' : 'eye'} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Role Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>role</Text>
                        <TouchableOpacity style={styles.pickerTrigger} onPress={() => setPickerVisible('role')}>
                            <Text style={selectedrole ? styles.pickerText : styles.pickerPlaceholder}>
                                {getLabel('role', selectedrole) || 'Select role'}
                            </Text>
                            <SvgIcon name="dropdown-arrow" />
                        </TouchableOpacity>
                    </View>

                    {/* Assigned Warehouse Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Assigned Warehouse</Text>
                        <TouchableOpacity style={styles.pickerTrigger} onPress={() => setPickerVisible('warehouse')}>
                            <Text style={selectedWarehouse ? styles.pickerText : styles.pickerPlaceholder}>
                                {getLabel('warehouse', selectedWarehouse) || 'Select warehouse'}
                            </Text>
                            <SvgIcon name="dropdown-arrow" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <CustomPickerModal
                    visible={pickerVisible !== null}
                    title={pickerVisible === 'role' ? 'Select role' : 'Select warehouse'}
                    options={pickerVisible === 'role' ? role : warehouse}
                    onClose={() => setPickerVisible(null)}
                    onSelect={handleSelect}
                    onAddItem={handleAddNewItem}
                />

                {/* Tombol Submit */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Add Employee</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    container: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        height: 50,
    },
    inputInner: {
        flex: 1,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        paddingHorizontal: 15,
    },
    iconPlaceholder: {
        color: '#888',
    },
    pickerTrigger: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        height: 50,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerText: {
        fontSize: 16,
        color: '#333',
    },
    pickerPlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    footer: {
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    addButton: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddEmployeeScreen;

