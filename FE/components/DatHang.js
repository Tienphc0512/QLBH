import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  ToastAndroid
} from 'react-native';
import { placeOrder, fetchOrderDetails, cancelOrder, fetchTaiKhoan, updateTaiKhoan, fetchDiaChi } from '../service/api';
import { useAuth } from '../context/Auth';
import { useNavigation } from '@react-navigation/native';


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
  const selectedItem = route?.params?.sp; // nếu từ 1 sản phẩm cụ thể
  const { selectedProducts } = route.params ?? {};
  console.log("Sản phẩm được truyền qua:", selectedProducts);

  // nếu từ giỏ hàng

  const [diaChiList, setDiaChiList] = useState([]);
  const [selectedDiaChiId, setSelectedDiaChiId] = useState(null);
  // const [modalVisible, setModalVisible] = useState(false); // CTDH
  const navigation = useNavigation();


  const fetchInfoAndInitOrder = async () => {
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

      // Nếu có selectedProducts (từ giỏ hàng)
      if (selectedProducts && selectedProducts.length > 0) {

        const items = selectedProducts.map((item) => ({
          sanpham_id: item.id,
          soluong: item.soluong || 1,
          dongia: item.gia,
        }));

        const tongtien = items.reduce((sum, item) => sum + item.soluong * item.dongia, 0);

        setOrderDetails({
          items,
          tongtien,
          diaChi: defaultDiaChi?.diachi || '',
        });

        setSelectedDiaChiId(defaultDiaChi?.id ?? null);
      }

      // Nếu đi từ trang sản phẩm riêng lẻ
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


  const handleFetchOrderDetailsWithId = (orderInfo) => {
    navigation.navigate('MainTabs', {
      screen: 'Theo dõi đơn',
    });
    setLoading(true);
    setMessage('');
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



  // const canCancel =
  //   orderInfo && orderInfo.length > 0 && orderInfo[0].trangthai === 'choxuly';

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

       {/* từ giỏ hàng qua */}
        {selectedProducts && selectedProducts.length > 0 && (
  <>
    {selectedProducts.map((item, index) => (
      <View
        key={item.id || index}
        style={{
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 8,
          marginBottom: 15,
        }}
      >
        <Image
          source={{ uri: item.anh_dai_dien }}
          style={{ width: 80, height: 80, marginRight: 10, borderRadius: 8 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.ten_san_pham}</Text>
          <Text>Giá: {Number(item.gia).toLocaleString()}đ</Text>

          {/* Tăng giảm số lượng */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <TouchableOpacity
              onPress={() => {
                const newItems = [...orderDetails.items];
                if (newItems[index].soluong > 1) {
                  newItems[index].soluong -= 1;
                  const tongtien = newItems.reduce((sum, i) => sum + i.soluong * i.dongia, 0);
                  setOrderDetails({ ...orderDetails, items: newItems, tongtien });
                }
              }}
              style={styles.qtyButton}
            >
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>

            <Text style={{ marginHorizontal: 10 }}>
              {orderDetails.items[index]?.soluong ?? 1}
            </Text>

            <TouchableOpacity
  onPress={() => {
    const newItems = [...orderDetails.items];
    if (newItems[index].soluong < newItems[index].tonkho) {
      newItems[index].soluong += 1;
      const tongtien = newItems.reduce((sum, i) => sum + i.soluong * i.dongia, 0);
      setOrderDetails({ ...orderDetails, items: newItems, tongtien });
    } else {
      Alert.alert("Vượt số lượng tồn kho", "Không thể đặt quá số lượng còn lại trong kho.");
    }
  }}
  style={styles.qtyButton}
>
  <Text style={styles.qtyText}>+</Text>
</TouchableOpacity>

          </View>
        </View>
      </View>
    ))}

    {/* Tổng tiền từ giỏ hàng */}
    <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
      Tổng tiền: {Number(orderDetails.tongtien).toLocaleString()}đ
    </Text>
  </>
)}



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
                 ToastAndroid.show("Số lượng vượt quá tồn kho!", ToastAndroid.SHORT);
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
          onPress={() => handleFetchOrderDetailsWithId(orderInfo)}
          style={{ backgroundColor: '#007AFF', padding: 10, marginTop: 10, borderRadius: 5 }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Theo dõi đơn hàng</Text>
        </TouchableOpacity>
      )}

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
});
