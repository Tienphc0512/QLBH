import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image
} from 'react-native';
import { placeOrder, fetchOrderDetails, cancelOrder, fetchTaiKhoan, updateTaiKhoan, fetchDiaChi } from '../service/api';
import { useAuth } from '../context/Auth';
// import { useFocusEffect } from '@react-navigation/native';


export default function DatHang({ route }) {
  const [orderDetails, setOrderDetails] = useState({
    items: [],
    tongtien: 0,
    diaChi: '',
  });

  const { token } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [orderInfo, setOrderInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: '', sdt: '' });
  const [showModal, setShowModal] = useState(false);
  const selectedItem = route?.params?.sp;
  const [diaChiList, setDiaChiList] = useState([]);
  const [selectedDiaChiId, setSelectedDiaChiId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // CTDH



  const fetchInfoAndInitOrder = async () => { // tách ra để sử dụng RefreshControl của rn
    setLoading(true);
    try {
      const data = await fetchTaiKhoan(token);
      const diachiData = await fetchDiaChi(token);

      setUserInfo({
        username: data.username,
        sdt: data.sdt,
      });

      setDiaChiList(diachiData || []);
      const defaultDiaChi = diachiData.find((dc) => dc.macdinh) || diachiData[0];

      if (selectedItem && !isNaN(selectedItem.soluong)) {
        setOrderDetails({
          items: [{
            sanpham_id: selectedItem.id,
            soluong: 1,
            dongia: selectedItem.gia,
          }],
          tongtien: selectedItem.gia,
          diaChi: defaultDiaChi?.diachi || '',
        });

        setSelectedDiaChiId(defaultDiaChi?.id ?? null);
      }
    } catch (err) {
      setMessage("Không thể tải thông tin tài khoản hoặc địa chỉ.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInfoAndInitOrder();
  }, [selectedItem]); // và phải gọi lại khi selectedItem thay đổi 


  //   const handlePlaceOrder = async () => {
  //     const item = orderDetails.items[0];
  //     if (item.soluong > selectedItem.soluong) {
  //       setMessage('Số lượng vượt quá tồn kho!');
  //       return;
  //     }

  //     setLoading(true);
  //     setMessage('');
  //     try {
  //       const data = await placeOrder(orderDetails, token);
  //        console.log(">> Bấm vào nút đặt hàng");
  // const newOrderId = data.dathang_id.toString();
  // setOrderId(newOrderId);
  // setMessage(`Đặt hàng thành công! Mã đơn hàng: ${newOrderId}`);

  // try {
  //   const details = await fetchOrderDetails(newOrderId, token);
  //   setOrderInfo(details);
  // } catch (err) {
  //   Alert.alert("Lỗi", "Không thể tải chi tiết đơn hàng.");
  // }

  //     } catch (err) {
  //       setMessage(err.message);
  //     }
  //     setLoading(false);
  //   };

//   const convertTrangThai = (trangthai) => {
//   switch (trangthai) {
//     case 'choxuly':
//       return 'Chờ xử lý';
//     case 'danggiao':
//       return 'Đang giao';
//     case 'dagiao':
//       return 'Đã giao';
//     case 'dahuy':
//       return 'Đã huỷ';
//     default:
//       return trangthai;
//   }
// };

// const convertThanhToan = (tt) => {
//   switch (tt) {
//     case 'chuathanhtoan':
//       return 'Chưa thanh toán';
//     case 'dathanhtoan':
//       return 'Đã thanh toán';
//     default:
//       return tt;
//   }
// };


  const handlePlaceOrder = async () => {
    const item = orderDetails.items[0];
    console.log(">> Bắt đầu đặt hàng");
    console.log(">> orderDetails:", orderDetails);
    if (item.soluong > selectedItem.soluong) {
      setMessage('Số lượng vượt quá tồn kho!');
      console.log(">> Quá tồn kho!");
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      console.log(">> Gửi API đặt hàng...");
      const data = await placeOrder(orderDetails, token);
      console.log(">> Kết quả từ API:", data);

      const newOrderId = data.dathang_id.toString();
      setOrderId(newOrderId);
      setMessage(`Đặt hàng thành công! Mã đơn hàng: ${newOrderId}`);

      try {
        const details = await fetchOrderDetails(newOrderId, token);
        setOrderInfo(details);
      } catch (err) {
        console.log(">> Lỗi khi fetchOrderDetails:", err);
        Alert.alert("Lỗi", "Không thể tải chi tiết đơn hàng.");
      }

    } catch (err) {
      console.log(">> Lỗi khi đặt hàng:", err);
      setMessage(err.message || "Lỗi không xác định");
    }
    setLoading(false);
  };

  const handleFetchOrderDetailsWithId = async (id) => {
    setLoading(true);
    setMessage('');
    try {
      const data = await fetchOrderDetails(id, token);
      setOrderInfo(data);
      setModalVisible(true);
    } catch (err) {
      setMessage(err.message);
      setOrderInfo(null);
    }
    setLoading(false);
  };

  // hủy khi có đơn hàng chưa được xử lý, còn đang giao thì kh đc hủy nữa
  const handleCancelOrder = async () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn huỷ đơn hàng này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Huỷ đơn',
        onPress: async () => {
          try {
            await cancelOrder(orderId, token);
            setMessage('Đã huỷ đơn hàng thành công!');
            setOrderInfo(null);
          } catch (err) {
            setMessage(err.message);
          }
        },
      },
    ]);
  };


  // hàmh để lưu thông tin khách hàng
  const handleSave = async () => {
    setLoading(true);
    try {
      const currentData = await fetchTaiKhoan(token); // Lấy dữ liệu gốc

      await updateTaiKhoan({
        username: userInfo.username,
        sdt: userInfo.sdt,
        hoten: userInfo.hoten ?? currentData.hoten,
        email: userInfo.email ?? currentData.email,
      }, token);

      const refreshed = await fetchTaiKhoan(token);
      setUserInfo({
        username: refreshed.username,
        sdt: refreshed.sdt,
      });

      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      setShowModal(false);
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setLoading(false);
    }
  };



  const canCancel =
    orderInfo && orderInfo.length > 0 && orderInfo[0].trangthai === 'choxuly';

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchInfoAndInitOrder} />
      }>
      {/* <Text style={styles.title}>Đặt Hàng</Text> */}

      <View style={styles.rowBetween}>
        <Text style={styles.label}>Thông tin khách hàng</Text>

        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Text style={{ color: 'blue' }}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>

      {/* <Text>Họ tên: {userInfo.ten}</Text>
      <Text>SĐT: {userInfo.sdt}</Text> */}
      {selectedItem && (
        <View
          style={{
            flexDirection: 'row', // Thêm dòng này để xếp theo hàng ngang
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            borderRadius: 8,
            marginBottom: 15,
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>
              {selectedItem.ten_san_pham}
            </Text>
            <Text>Giá: {Number(selectedItem.gia).toLocaleString()}đ</Text>
            <Text>Tồn kho: {selectedItem.soluong}</Text>
          </View>

          <Image
            source={{ uri: selectedItem.anh_dai_dien }}
            style={{ width: 100, height: 100, marginLeft: 10, borderRadius: 8 }}
          />
        </View>
      )}

      <Text style={{ marginTop: 15 }}>Số lượng:</Text>

      {orderDetails.items.length > 0 && selectedItem && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <TouchableOpacity
              onPress={() => {
                const currentQty = orderDetails.items[0]?.soluong ?? 1;
                if (currentQty > 1) {
                  const newQty = currentQty - 1;
                  setOrderDetails((prev) => ({
                    ...prev,
                    items: [{ ...prev.items[0], soluong: newQty }],
                    tongtien: newQty * selectedItem.gia,
                  }));
                }
              }}
              style={styles.qtyButton}
            >
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>

            <Text style={{ marginHorizontal: 10 }}>{orderDetails.items[0]?.soluong}</Text>

            <TouchableOpacity
              onPress={() => {
                const currentQty = orderDetails.items[0]?.soluong ?? 1;
                if (currentQty < selectedItem.soluong) {
                  const newQty = currentQty + 1;
                  setOrderDetails((prev) => ({
                    ...prev,
                    items: [{ ...prev.items[0], soluong: newQty }],
                    tongtien: newQty * selectedItem.gia,
                  }));
                } else {
                  Alert.alert('Thông báo', 'Số lượng vượt quá tồn kho!');
                }
              }}
              style={styles.qtyButton}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Tổng tiền ngay bên dưới */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>
              Tổng tiền: {Number(orderDetails.tongtien).toLocaleString()}đ
            </Text>
          </View>
        </>
      )}



      <Text style={{ marginTop: 20, fontWeight: 'bold', fontSize: 16 }}>Chọn địa chỉ giao hàng:</Text>


      {diaChiList.length === 0 ? (
        <Text style={{ fontStyle: 'italic' }}>Chưa có địa chỉ. Vui lòng thêm.</Text>
      ) : (
        diaChiList.map((dc) => (
          <TouchableOpacity
            key={dc.id}
            onPress={() => {
              setSelectedDiaChiId(dc.id);
              setOrderDetails((prev) => ({ ...prev, diaChi: dc.diachi }));
            }}
            style={{
              padding: 10,
              marginVertical: 5,
              borderWidth: 1,
              borderColor: selectedDiaChiId === dc.id ? 'blue' : '#ccc',
              borderRadius: 5,
            }}
          >
            <Text>{dc.diachi}</Text>
            {dc.macdinh && <Text style={{ color: 'green' }}>[Mặc định]</Text>}
          </TouchableOpacity>
        ))
      )}
      <TouchableOpacity
        onPress={handlePlaceOrder}
        style={{ backgroundColor: 'green', padding: 12, borderRadius: 8, marginTop: 20 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Đặt hàng</Text>
      </TouchableOpacity>


      {/* hiển thị chi tiết đơn hàng điều hướng qua theo dõi đơn hàng */}
      {orderId !== '' && (
        <TouchableOpacity
          onPress={() => handleFetchOrderDetailsWithId(orderId)} // THÊM () VÀ TRUYỀN orderId
          style={{ backgroundColor: '#007AFF', padding: 10, marginTop: 10, borderRadius: 5 }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Xem chi tiết đơn hàng</Text>
        </TouchableOpacity>
      )}

{/* 
<Modal
  visible={modalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.orderModalContent}>
      <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>

      {orderInfo
        ?.filter((item) => item.dathang_id == orderId)
        .map((item, index) => (
          <View key={index} style={styles.orderItemBox}>
            <Text style={styles.orderId}>Mã đơn hàng: {orderId}</Text>
            <Text style={styles.itemTitle}>{item.tensanpham}</Text>
            <Text style={styles.itemDetail}>Số lượng: <Text style={styles.itemValue}>{item.soluong}</Text></Text>
            <Text style={styles.itemDetail}>Đơn giá: <Text style={styles.itemValue}>{Number(item.dongia).toLocaleString()}đ</Text></Text>
            <Text style={styles.itemDetail}>Hình thức thanh toán: <Text style={styles.itemValue}>{convertThanhToan(item.hinhthuc_thanhtoan)}</Text></Text>
            <Text style={styles.itemDetail}>Tình trạng: <Text style={styles.itemValue}>{convertTrangThai(item.trangthai)}</Text></Text>
            <Text style={styles.itemDetail}>Ngày đặt: <Text style={styles.itemValue}>{new Date(item.ngaydat).toLocaleString()}</Text></Text>
            <Text style={styles.itemTotal}>Tổng tiền: {Number(orderDetails.tongtien).toLocaleString()}đ</Text>
          </View>
        ))}

      <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Đóng</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal> */}


      {/* Modal chỉnh sửa thông tin khách hàng */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Chỉnh sửa thông tin</Text>

            <TextInput
              value={userInfo.username}
              onChangeText={(text) => setUserInfo({ ...userInfo, username: text })}
              placeholder="Tên đăng nhập"
              style={styles.input}
            />
            <TextInput
              value={userInfo.sdt}
              onChangeText={(text) => setUserInfo({ ...userInfo, sdt: text })}
              placeholder="Số điện thoại"
              style={styles.input}
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <Button title="Lưu" onPress={handleSave} />
              <Button title="Huỷ" color="gray" onPress={() => setShowModal(false)} />
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  label: { fontWeight: 'bold', fontSize: 16 },
  input: { borderWidth: 1, padding: 8, marginVertical: 10 },
  orderBox: { borderWidth: 1, padding: 10, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  qtyButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  qtyText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // theo dõi đơn hàng
// modalOverlay: {
//   flex: 1,
//   backgroundColor: 'rgba(0, 0, 0, 0.4)',
//   justifyContent: 'center',
//   alignItems: 'center',
//   padding: 20,
// },
// orderModalContent: {
//   width: '100%',
//   backgroundColor: '#fff',
//   borderRadius: 12,
//   padding: 20,
//   maxHeight: '80%',
// },
// modalTitle: {
//   fontSize: 20,
//   fontWeight: 'bold',
//   marginBottom: 10,
//   textAlign: 'center',
//   color: '#333',
// },
// orderItemBox: {
//   borderWidth: 1,
//   borderColor: '#eee',
//   borderRadius: 8,
//   padding: 15,
//   marginBottom: 10,
//   backgroundColor: '#f9f9f9',
// },
// itemTitle: {
//   fontSize: 16,
//   fontWeight: 'bold',
//   marginBottom: 6,
//   color: '#222',
// },
// itemDetail: {
//   fontSize: 14,
//   color: '#555',
//   marginBottom: 4,
// },
// itemValue: {
//   fontWeight: '500',
//   color: '#333',
// },
// itemTotal: {
//   fontSize: 15,
//   fontWeight: 'bold',
//   marginTop: 10,
//   color: '#E53935',
// },
// closeButton: {
//   backgroundColor: '#007AFF',
//   paddingVertical: 10,
//   borderRadius: 8,
//   marginTop: 10,
// },
// closeButtonText: {
//   color: '#fff',
//   fontWeight: 'bold',
//   textAlign: 'center',
// },
// orderId: {
//   fontSize: 16,
//   fontWeight: 'bold',
//   marginBottom: 8,
//   color: '#333',
// },
});
