import React, { useState } from 'react';
import { EyeIconClose, EyeIconOpen, IMAGES } from '../../assets/images';

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

// import { authenticate } from '../../services/authservices';
import { UserSession } from '../../types/type';
import { authenticatedb } from '../../services/authservices';
import { createDatabse } from '../../database/db';
import { useAuth } from '../../context/authcontext';

// --- Komponen Ikon Placeholder (Ganti dengan SVG Anda nanti) ---
const IconPlaceholder = ({ name }: { name: string }) => (
  <Text style={styles.iconPlaceholder}>
    {name === 'open' ? <EyeIconOpen /> : <EyeIconClose />}
  </Text>
);

const LoginScreen = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  // --- PERUBAHAN 1: Tambahkan state untuk visibilitas password ---
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    const db = await createDatabse();
    // Logika untuk login
    if (!id || !password) {
      Alert.alert('Error', 'ID dan Password tidak boleh kosong.');
      return;
    }

    const auth: UserSession | null = await authenticatedb(id, password, db);

    if (!auth) {
      Alert.alert('Error', 'ID atau Password salah.');
      return;
    } else {
      login(auth);
      console.log('berhasil');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.logoContainer}>
          <Image
            source={IMAGES.Logo_tranfashion}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="ID"
            placeholderTextColor="#888"
            value={id}
            onChangeText={text => setId(text.trim())}
            keyboardType="default"
            autoCapitalize="none"
          />

          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput} // Menggunakan style baru
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}

              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <IconPlaceholder name={isPasswordVisible ? 'open' : 'close'} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  logoContainer: {
    marginBottom: 140,
    alignItems: 'center',
  },
  logo: {
    width: 213,
    height: 85,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 25,
    fontSize: 18,
    color: '#333',
  },
  // --- STYLE BARU UNTUK PASSWORD INPUT ---
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 25,
  },
  passwordInput: {
    flex: 1, // Memastikan input mengambil sisa ruang
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#333',
  },
  eyeIcon: {
    padding: 10, // Area sentuh yang lebih besar
  },
  iconPlaceholder: {
    color: '#007AFF',
  },
  // --- AKHIR STYLE BARU ---
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 70,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
