import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { fetchOrderDetails } from '../service/api'; // API của bạn
import { useAuth } from '../context/Auth'; // Lấy thông tin người dùng đã đăng nhập

export default function TheodoiDH() {
  const { user } = useAuth(); // Lấy user hiện tại
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hàm gọi API lấy danh sách đơn hàng
  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const result = await fetchOrderDetails(user.id); // user.id từ context
      setOrders(result || []);
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.orderItem}>
        <Text style={styles.orderCode}>Mã đơn hàng: {item.madonhang}</Text>
        <Text>Tên sản phẩm: {item.tensanpham}</Text>
        <Text>Số lượng: {item.soluong}</Text>
        <Text>Đơn giá: {Number(item.dongia).toLocaleString()}đ</Text>
        <Text>Thành tiền: {Number(item.thanhtien).toLocaleString()}đ</Text>
        <Text>Tổng tiền: {Number(item.tongtien).toLocaleString()}đ</Text>
        <Text>
          Hình thức thanh toán:{' '}
          {item.hinhthuc_thanhtoan === 'cod' ? 'Thanh toán khi nhận hàng' : item.hinhthuc_thanhtoan}
        </Text>
        <Text>
          Trạng thái:{' '}
          {item.trangthai === 'choxuly'
            ? 'Chờ xử lý'
            : item.trangthai === 'danggiao'
            ? 'Đang giao'
            : item.trangthai === 'dagiao'
            ? 'Đã giao'
            : item.trangthai}
        </Text>
        <Text>Ngày đặt: {new Date(item.ngaydat).toLocaleString()}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item, index) => `${item.madonhang}-${index}`}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadOrders} />
      }
      contentContainerStyle={orders.length === 0 && styles.center}
      ListEmptyComponent={<Text>Không có đơn hàng nào.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  orderItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    color: '#34495e',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
