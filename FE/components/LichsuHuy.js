import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { useAuth } from '../context/Auth';
import { fetchCancelDetailsHis } from '../service/api';
import Thongtingiaohang from './Modal/Thongtingiaohang';

export default function DonHangDaHuy() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    //modal thông tin giao hàng 
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrderInfo, setSelectedOrderInfo] = useState(null);

    const loadCancelledOrders = async () => {
        try {
            setRefreshing(true);
            const result = await fetchCancelDetailsHis(token); // Gọi API lấy lịch sử huỷ
            setOrders(result || []);
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng đã huỷ:', error);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCancelledOrders();
    }, []);

    //xử lý modal
    const showShippingInfo = (order) => {
        setSelectedOrderInfo(order);
        setModalVisible(true);
    }

    const renderItem = ({ item }) => (
        <View style={styles.orderItem}>
            <Text style={styles.orderCode}>Mã đơn: {item.dathang_id}</Text>
            <Text style={styles.infoText}>Sản phẩm: {item.tensanpham}</Text>
            <Text style={styles.infoText}>Số lượng: {item.soluong}</Text>
            <Text style={styles.infoText}>Đơn giá: {Number(item.dongia).toLocaleString()}đ</Text>
            <Text style={styles.infoText}>Tổng tiền: {Number(item.tongtien).toLocaleString()}đ</Text>
            <Text style={styles.infoText}>Ngày huỷ: {new Date(item.ngayhuy).toLocaleString()}</Text>
            <TouchableOpacity onPress={() => showShippingInfo(item)}>
                <Text style={{ color: '#2980b9', marginTop: 10, fontWeight: 'bold' }}>
                    Thông tin giao hàng
                </Text>
            </TouchableOpacity>
            <Text style={[styles.infoText, { color: '#e74c3c' }]}>Đơn hàng đã huỷ</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lịch sử đơn hàng đã huỷ</Text>
            <FlatList
                data={orders}
                keyExtractor={(item, index) => `${item.dathang_id}-${index}`}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadCancelledOrders} />
                }
                ListEmptyComponent={<Text style={styles.empty}>Không có đơn hàng đã huỷ.</Text>}
            />
            <Thongtingiaohang
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                orderInfo={selectedOrderInfo}
            />
        </View>
    );
}
