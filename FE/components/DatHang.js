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
} from 'react-native';
import { placeOrder, fetchOrderDetails, cancelOrder, fetchTaiKhoan } from '../service/api';
import { Picker } from '@react-native-picker/picker';


export default function DatHang({ route, token }) {
  const [orderDetails, setOrderDetails] = useState({
    items: [],
    tongtien: 0,
    diaChi: '',
  });
  const [orderId, setOrderId] = useState('');
  const [orderInfo, setOrderInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ ten: '', sdt: '', diachi: '' });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const selectedItem = route?.params?.item;

  useEffect(() => {
    if (selectedItem) {
      setOrderDetails({
        items: [
          {
            sanpham_id: selectedItem.id,
            soluong: 1,
            dongia: selectedItem.gia,
          },
        ],
        tongtien: selectedItem.gia,
        diaChi: '',
      });
    }
  }, [selectedItem]);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await fetchTaiKhoan(token); // API có sẵn
        setUserInfo({
          ten: data.hoten,
          sdt: data.sdt,
          diachi: data.diachi,
        });
        setOrderDetails((prev) => ({ ...prev, diaChi: data.diachi }));
      } catch (err) {
        setMessage('Không thể tải thông tin tài khoản');
      }
    };
    fetchInfo();
  }, []);

  const handlePlaceOrder = async () => {
    const item = orderDetails.items[0];
    if (item.soluong > selectedItem.soluong) {
      setMessage('Số lượng vượt quá tồn kho!');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const data = await placeOrder(orderDetails, token);
      setMessage(`Đặt hàng thành công! Mã đơn hàng: ${data.dathang_id}`);
      setOrderId(data.dathang_id.toString());
      setOrderInfo(null);
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  };

  const handleFetchOrderDetails = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await fetchOrderDetails(orderId, token);
      setOrderInfo(data);
    } catch (err) {
      setMessage(err.message);
      setOrderInfo(null);
    }
    setLoading(false);
  };

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

  const canCancel =
    orderInfo && orderInfo.length > 0 && orderInfo[0].trangthai === 'choxuly';

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Đặt Hàng</Text>

      <View style={styles.rowBetween}>
        <Text style={styles.label}>Thông tin khách hàng</Text>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Text style={{ color: 'blue' }}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>

      <Text>Họ tên: {userInfo.ten}</Text>
      <Text>SĐT: {userInfo.sdt}</Text>
      <Text>Địa chỉ: {userInfo.diachi}</Text>

<Text>Số lượng:</Text>
<Picker
  selectedValue={orderDetails.items[0]?.soluong}
  onValueChange={(itemValue) => {
    if (itemValue > selectedItem.soluong) {
      setError('Số lượng vượt quá tồn kho!');
    } else {
      setError('');
    }

    setOrderDetails((prev) => ({
      ...prev,
      items: [{ ...prev.items[0], soluong: itemValue }],
      tongtien: itemValue * selectedItem.gia,
    }));
  }}
  style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 10 }}
>
  {Array.from({ length: selectedItem?.soluong || 10 }, (_, i) => i + 1).map((num) => (
    <Picker.Item key={num} label={`${num}`} value={num} />
  ))}
</Picker>

{error ? (
  <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
) : null}

<Text>Tổng tiền: {orderDetails.tongtien?.toLocaleString() || 0} VNĐ</Text>


      <Button title="Đặt hàng" onPress={handlePlaceOrder} disabled={loading} />

      <View style={{ marginVertical: 20 }}>
        <Text style={styles.label}>Xem chi tiết đơn hàng</Text>
        <Button title="Xem chi tiết" onPress={handleFetchOrderDetails} disabled={loading} />
      </View>

      {message ? <Text style={{ marginTop: 10, color: 'red' }}>{message}</Text> : null}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {orderInfo && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Chi tiết đơn hàng:</Text>
          {orderInfo.map((item, index) => (
            <View key={index} style={styles.orderBox}>
              <Text>Sản phẩm ID: {item.sanpham_id}</Text>
              <Text>Số lượng: {item.soluong}</Text>
              <Text>Đơn giá: {item.dongia}</Text>
              <Text>TT thanh toán: {item.tinhtrang_thanhtoan}</Text>
              <Text>Trạng thái đơn hàng: {item.trangthai || 'choxuly'}</Text>
            </View>
          ))}
          {canCancel && (
            <Button title="Huỷ đơn hàng" color="red" onPress={handleCancelOrder} />
          )}
        </View>
      )}

      {/* Modal chỉnh sửa thông tin khách hàng */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Chỉnh sửa thông tin</Text>

            <TextInput
              value={userInfo.ten}
              onChangeText={(text) => setUserInfo({ ...userInfo, ten: text })}
              placeholder="Họ tên"
              style={styles.input}
            />
            <TextInput
              value={userInfo.sdt}
              onChangeText={(text) => setUserInfo({ ...userInfo, sdt: text })}
              placeholder="Số điện thoại"
              style={styles.input}
              keyboardType="phone-pad"
            />
            <TextInput
              value={userInfo.diachi}
              onChangeText={(text) => {
                setUserInfo({ ...userInfo, diachi: text });
                setOrderDetails((prev) => ({ ...prev, diaChi: text }));
              }}
              placeholder="Địa chỉ"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <Button title="Lưu" onPress={() => setShowModal(false)} />
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});
