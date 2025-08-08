import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useAuth } from '../../context/Auth';
import { fetchOrderHistory } from '../../service/api';
import Thongtingiaohang from '../Modal/Thongtingiaohang';

export default function LichSuDatHang() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    //modal thông tin giao hàng
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrderInfo, setSelectedOrderInfo] = useState(null);

    const loadOrderHistory = async () => {
        try {
            setRefreshing(true);
            const result = await fetchOrderHistory(token);
            setOrders(result || []);
        } catch (error) {
            console.error('Lỗi khi tải lịch sử đơn hàng:', error);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    const showShippingInfo = (order) => {
        setSelectedOrderInfo(order);
        setModalVisible(true);
    };

    useEffect(() => {
        loadOrderHistory();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.orderItem}>
            <Text style={styles.orderCode}>Mã đơn: {item.dathang_id}</Text>
            <Text style={styles.infoText}>Sản phẩm: {item.tensanpham}</Text>
            <Text style={styles.infoText}>Số lượng: {item.soluong}</Text>
            <Text style={styles.infoText}>Đơn giá: {Number(item.dongia).toLocaleString()}đ</Text>
            <Text style={styles.infoText}>Tổng tiền: {Number(item.tongtien).toLocaleString()}đ</Text>
            <Text style={styles.infoText}>Hình thức thanh toán: {item.hinhthuc_thanhtoan}</Text>
            <Text style={styles.infoText}>Ngày đặt: {new Date(item.ngaydat).toLocaleString()}</Text>
            <TouchableOpacity onPress={() => showShippingInfo(item)}>
                <Text style={{ color: '#2980b9', marginTop: 10, fontWeight: 'bold' }}>
                    Thông tin giao hàng
                </Text>
            </TouchableOpacity>
            <Text style={styles.successText}>Đã giao thành công</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2980b9" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lịch sử đặt hàng</Text>
            <FlatList
                data={orders}
                keyExtractor={(item, index) => `${item.dathang_id}-${index}`}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadOrderHistory} />
                }
                ListEmptyComponent={<Text style={styles.empty}>Chưa có đơn hàng nào được giao.</Text>}
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
        backgroundColor: '#f6f9fc',
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: 12,
    },
    orderItem: {
        backgroundColor: '#ecf0f1',
        padding: 16,
        marginVertical: 8,
        borderRadius: 10,
        borderColor: '#dcdde1',
        borderWidth: 1,
        elevation: 3,
    },
    orderCode: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 6,
        color: '#34495e',
    },
    infoText: {
        fontSize: 15,
        color: '#2f3640',
        marginBottom: 2,
    },
    successText: {
        marginTop: 6,
        fontWeight: 'bold',
        color: '#27ae60',
        fontSize: 15,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        textAlign: 'center',
        color: '#888',
        marginTop: 20,
        fontSize: 16,
    },
});

