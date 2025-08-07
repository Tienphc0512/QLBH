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
import { useAuth } from '../../context/Auth';
import { fetchCancelDetailsHis } from '../../service/api';
import Thongtingiaohang from '../Modal/Thongtingiaohang';

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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#2c3e50',
  },
  orderItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 15,
    color: '#2c3e50',
    marginBottom: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#7f8c8d',
  },
});
