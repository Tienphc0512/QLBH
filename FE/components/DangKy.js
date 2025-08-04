import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../service/api';

export default function DangKy() {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [fullname, setFullname] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!username || !phone || !password || !email || !fullname) {
            Alert.alert('Vui lòng điền đầy đủ thông tin');
            return;
        }
        try {
            await registerUser(username, password, email, phone, fullname);
            Alert.alert('Đăng ký thành công!');
            navigation.navigate('Đăng nhập'); 

        } catch (error) {
            setError(error.response?.data?.message || 'Đăng nhập thất bại');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đăng ký tài khoản</Text>

            <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#555" style={styles.icon} />
                <TextInput
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    placeholderTextColor="#999"
                />
            </View>
            <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#555" style={styles.icon} />
                <TextInput
                    placeholder="Họ và tên"
                    value={fullname}
                    onChangeText={setFullname}
                    style={styles.input}
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="call" size={20} color="#555" style={styles.icon} />
                <TextInput
                    placeholder="Số điện thoại"
                    value={phone}
                    keyboardType="phone-pad"
                    onChangeText={setPhone}
                    style={styles.input}
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#555" style={styles.icon} />
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    placeholderTextColor="#999"
                />
            </View>


            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#555" style={styles.icon} />
                <TextInput
                    placeholder="Mật khẩu"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    placeholderTextColor="#999"
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Đăng ký</Text>
            </TouchableOpacity>
        </View>
    );
}

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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
        width: '80%',
    },
    input: {
        flex: 1,
        padding: 10,
        color: '#333',
    },
    icon: {
        padding: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginTop: 10,
    },
});