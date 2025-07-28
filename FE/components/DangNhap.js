import React, { useState } from 'react';
import { Text, View, Alert, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { loginUser } from '../service/api';
import { useAuth } from '../context/Auth';
import { useNavigation } from '@react-navigation/native';

export default function DangNhap() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    if (!username || !password) {
      Alert.alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      const data = await loginUser(username, password);

      await login(data.token, data.userId);


    }
    catch (error) {
      setError(error.response?.data?.message || 'Đăng nhập thất bại');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Ten đăng nhập"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={handleLogin}>
        <Text style={styles.loginText}>Đăng Nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Quên mật khẩu')}>
        <Text style={styles.linkText}>Quên mật khẩu</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Đăng ký')}>
        <Text style={styles.linkText}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  loginText: {
    color: '#fff',
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    width: '80%',
  },
  linkText: {
    color: '#007BFF',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },

});