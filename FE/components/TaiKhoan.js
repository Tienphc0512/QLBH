import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Button, ActivityIndicator, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { fetchTaiKhoan, updateTaiKhoan } from '../service/api';
import { useAuth } from '../context/Auth';
import DiaChiModal from './DiaChiModal .js';


const TaiKhoan = () => {
    const [formData, setFormData] = useState({
        hoten: '',
        sdt: '',
        email: '',
        matkhau: '',
        diachi: '',
    });
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const { logout, token } = useAuth();
    const [showDiaChiModal, setShowDiaChiModal] = useState(false);



    useEffect(() => {
        const getTaiKhoan = async () => {
            setLoading(true);
            try {
                const data = await fetchTaiKhoan(token);
                setFormData(data);
            } catch (err) {
                Alert.alert('Lỗi', err.message);
            }
            setLoading(false);
        };
        getTaiKhoan();
    }, [token]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const onSubmit = async () => {
        setUpdating(true);
        try {
            await updateTaiKhoan(formData, token);
            Alert.alert('Thành công', 'Cập nhật tài khoản thành công');
        } catch (err) {
            Alert.alert('Lỗi', err.message);
        }
        setUpdating(false);
    };

    const handleLogout = () => {
        logout();
        Alert.alert('Đăng xuất', 'Bạn đã đăng xuất thành công');
    };

    if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

    return (
        <>
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Họ tên</Text>
            <TextInput
                style={styles.input}
                value={formData.hoten}
                onChangeText={text => handleChange('hoten', text)}
                placeholder="Nhập họ tên"
            />

            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
                style={styles.input}
                value={formData.sdt}
                onChangeText={text => handleChange('sdt', text)}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={text => handleChange('email', text)}
                placeholder="Nhập email"
                keyboardType="email-address"
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
                style={styles.input}
                value={formData.matkhau}
                onChangeText={text => handleChange('matkhau', text)}
                placeholder="(Mật khẩu đã được ẩn) Nhập mật khẩu"
                secureTextEntry
            />

            <View style={styles.buttonContainer}>
                <Button
                    title={updating ? 'Đang cập nhật...' : 'Cập nhật tài khoản'}
                    onPress={onSubmit}
                    color="#007bff"
                    disabled={updating}
                />
            </View>
            
<Text style={styles.label}>Địa chỉ</Text>
<TouchableOpacity onPress={() => setShowDiaChiModal(true)}>
  <Text style={styles.link}>Quản lý địa chỉ ➤</Text>
</TouchableOpacity>

            <View style={styles.logoutContainer}>
                <Button
                    title="Đăng xuất"
                    onPress={handleLogout}
                    color="#dc3545"
                />
            </View>
        </ScrollView>
        <DiaChiModal
  visible={showDiaChiModal}
  onClose={() => setShowDiaChiModal(false)}
/>
</>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
    },
    buttonContainer: {
        marginTop: 25,
        marginBottom: 10,
    },
    logoutContainer: {
        marginTop: 10,
    },
    link: {
  color: '#007bff',
  fontWeight: 'bold',
  marginBottom: 10,
}

});

export default TaiKhoan;
