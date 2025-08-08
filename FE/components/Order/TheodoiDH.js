import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ToastAndroid  
} from 'react-native';
import { useAuth } from '../../context/Auth';
import { useRoute } from '@react-navigation/native';
import {cancelOrder, fetchOrderDetails } from '../../service/api'; // Import cancelOrder nếu cần
import Checkbox from 'expo-checkbox';
import Thongtingiaohang from '../Modal/Thongtingiaohang';


export default function TheodoiDH() {
  const { token, userId } = useAuth();
  const route = useRoute();
  const { orderInfo } = route.params || {};
  


  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
const [selectedOrders, setSelectedOrders] = useState([]);

//modal info ng đặt 
const [modalVisible, setModalVisible] = useState(false);
const [selectedOrderInfo, setSelectedOrderInfo] = useState(null);

  const loadOrders = async (id) => {
    try {
      setRefreshing(true);
      const result = await fetchOrderDetails(id, token); // api đơn hàng chi tiết đã có sắp xếp desc từ truy vâsn
      console.log(">> Kết quả fetchOrderDetails:", result);
      setOrders(result || []);
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }

  };

  useEffect(() => {
    if (!orderInfo) {
      loadOrders(userId); // gọi userId vì giỏ hàng lưu data theo userId


    } else {
      // Nếu có orderInfo, hiển thị đơn đó
      setOrders([orderInfo]);
      setLoading(false);
    }
  }, [userId]);

 const handleCancelOrders = async () => {
  Alert.alert(
    'Xác nhận',
    `Bạn có chắc muốn huỷ ${selectedOrders.length} đơn hàng?`,
    [
      { text: 'Không' },
      {
        text: 'Có',
        onPress: async () => {
          try {
            for (const id of selectedOrders) {
              console.log("Gọi huỷ đơn:", id); 
              const res = await cancelOrder(id, token);
              //  console.log("Huỷ thành công đơn:", id, res);
            }
            ToastAndroid.show('Hủy các đơn hàng thành công!', ToastAndroid.SHORT);
            setSelectedOrders([]); 
            loadOrders(userId);
          } catch (error) {
            console.error('Lỗi khi huỷ nhiều đơn:', error);
            ToastAndroid.show('Hủy đơn hàng thất bại.', ToastAndroid.SHORT);
          }
        },
      },
    ]
  );
};

  //chọn và bỏ chọn đơn hàng
const toggleSelectOrder = (id) => {
  setSelectedOrders((prev) => {
    if (prev.includes(id)) {
      return prev.filter((item) => item !== id);
    } else {
      return [...prev, id];
    }
  });
};

//xử lý mở modal
const showShippingInfo = (order) => {
  setSelectedOrderInfo({
    username: order.username || 'Không xác định',
    sdt: order.sdt || 'Chưa có',
    diachi: order.diachi || 'Chưa cung cấp',
  });
  setModalVisible(true);
};

//chia màu cho tunefg trạng thái đơn hàng
const getStatusColor = (status) => {
  switch (status) {
    case 'choxuly':
      return '#f39c12'; // Vàng
    case 'danggiao':
      return '#3498db'; // Xanh dương
    case 'dagiao':
      return '#2ecc71'; // Xanh lá
    default:
      return '#7f8c8d'; // Xám
  }
};


const renderItem = ({ item }) => {
  const isPending = item.trangthai === 'choxuly';
  const isSelected = selectedOrders.includes(item.dathang_id);

  return (
    <View style={styles.orderItem}>
 {isPending && (
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={isSelected}
            onValueChange={() => toggleSelectOrder(item.dathang_id)}
            color="#e74c3c"
          />
          <Text style={styles.checkboxLabel}>Chọn để hủy</Text>
        </View>
      )}

      <Text style={styles.orderCode}>Mã đơn hàng: {item.dathang_id}</Text>
      <Text style={styles.infoText}>Tên sản phẩm: {item.tensanpham}</Text>
      <Text style={styles.infoText}>Số lượng: {item.soluong}</Text>
      <Text style={styles.infoText}>Đơn giá: {Number(item.dongia).toLocaleString()}đ</Text>
      <Text style={styles.infoText}>
        Hình thức thanh toán:{' '}
        {item.hinhthuc_thanhtoan === 'cod'
          ? 'Thanh toán khi nhận hàng'
          : item.hinhthuc_thanhtoan}
      </Text>
      <Text style={styles.infoText}>
        Trạng thái:{' '}
         <Text style={{ color: getStatusColor(item.trangthai) }}>
    {item.trangthai === 'choxuly'
      ? 'Chờ xử lý'
      : item.trangthai === 'danggiao'
      ? 'Đang giao'
      : item.trangthai === 'dagiao'
      ? 'Đã giao'
      : item.trangthai}
  </Text>
      </Text>
      <Text style={styles.infoText1}>Tổng tiền: {Number(item.tongtien).toLocaleString()}đ</Text>
      <Text style={styles.infoText}>Ngày đặt: {new Date(item.ngaydat).toLocaleString()}</Text>
      <TouchableOpacity onPress={() => showShippingInfo(item)}>
  <Text style={{ color: '#2980b9', marginTop: 10, fontWeight: 'bold' }}>
    Thông tin giao hàng
  </Text>
</TouchableOpacity>

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

  // if (orderInfo) {
  //   return (
  //     <View style={styles.orderItem}>
  //       <Text style={styles.orderCode}>Mã đơn hàng: {orderInfo.id}</Text>
  //       <Text>Tên sản phẩm: {orderInfo.tensanpham}</Text>
  //       <Text>Số lượng: {orderInfo.soluong}</Text>
  //       <Text>Đơn giá: {Number(orderInfo.dongia).toLocaleString()}đ</Text>
  //       <Text>Thành tiền: {Number(orderInfo.thanhtien).toLocaleString()}đ</Text>
  //       <Text>Tổng tiền: {Number(orderInfo.tongtien).toLocaleString()}đ</Text>
  //       <Text>
  //         Hình thức thanh toán:{' '}
  //         {orderInfo.hinhthuc_thanhtoan === 'cod'
  //           ? 'Thanh toán khi nhận hàng'
  //           : orderInfo.hinhthuc_thanhtoan}
  //       </Text>
  //       <Text>
  //         Trạng thái:{' '}
  //         {orderInfo.trangthai === 'choxuly'
  //           ? 'Chờ xử lý'
  //           : orderInfo.trangthai === 'danggiao'
  //           ? 'Đang giao'
  //           : orderInfo.trangthai === 'dagiao'
  //           ? 'Đã giao'
  //           : orderInfo.trangthai}
  //       </Text>
  //       <Text>Ngày đặt: {new Date(orderInfo.ngaydat).toLocaleString()}</Text>
  //     </View>
  //   );
  // }


  return (
      <View style={styles.container}>
    {/* Tiêu đề đặt phía trên FlatList */}
    <Text style={styles.Title}>Các đơn hàng đang được tiến hành</Text>
  <FlatList
    data={orders}
    keyExtractor={(item, index) => `${item.id}-${index}`}
    // keyExtractor={(item) => `${item.dathang_id}`}
    renderItem={renderItem}
    refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={() => loadOrders(userId)} />
    }
    contentContainerStyle={orders.length === 0 && styles.center}
    ListEmptyComponent={<Text>Không có đơn hàng nào.</Text>}
  />

  {selectedOrders.length > 0 && (
    <TouchableOpacity
      style={styles.cancelButton}
      onPress={handleCancelOrders}
    >
      <Text style={styles.cancelButtonText}>
        Hủy {selectedOrders.length} đơn hàng đã chọn
      </Text>
    </TouchableOpacity>
  )}
<Thongtingiaohang
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  orderInfo={selectedOrderInfo}
/>

</View>
  );
}

const styles = StyleSheet.create({
 orderItem: {
    backgroundColor: '#ecf0f1', // Nền nhẹ
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2980b9', // Màu xanh biển đậm
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
    color: '#2c3e50', // Xanh đậm hơn
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f0f6fa',
  },
  infoText: {
    fontSize: 15,
    marginBottom: 4,
    color: '#2f3640',
  },
infoText1: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#e74c3c', // Màu đỏ cho tổng tiền
  },

  cancelButton: {
  backgroundColor: '#e74c3c',
  padding: 14,
  margin: 16,
  borderRadius: 8,
  alignItems: 'center',
},
cancelButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

checkboxContainer: {
  flexDirection: 'row',
  justifyContent: 'flex-end', // Di chuyển nội dung sang phải
  alignItems: 'center',
  marginBottom: 8,
},
checkboxLabel: {
  marginLeft: 8,
  fontSize: 14,
  color: '#333',
},
cancelSingleButton: {
  backgroundColor: '#e67e22', // Cam cho nút riêng
  padding: 10,
  marginTop: 10,
  borderRadius: 6,
  alignItems: 'center',
},
Title: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 10,
  textAlign: 'center',
  color: '#333',
},
  container: {
    flex: 1,
    backgroundColor: '#f0f6fa',
    padding: 16,
  },

  //css modal thông tin ng dùng 
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  width: '80%',
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
  textAlign: 'center',
},
modalText: {
  fontSize: 16,
  marginVertical: 4,
  color: '#2c3e50',
},
closeButton: {
  marginTop: 15,
  backgroundColor: '#3498db',
  paddingVertical: 10,
  borderRadius: 6,
  alignItems: 'center',
},
closeButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

});
