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
import { useAuth } from '../context/Auth';
import { fetchDiaChi } from '../service/api';


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
  const [userInfo, setUserInfo] = useState({ ten: '', sdt: '', diachi: '' });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const selectedItem = route?.params?.item;
  const [diaChiList, setDiaChiList] = useState([]);
const [selectedDiaChiId, setSelectedDiaChiId] = useState(null);


useEffect(() => {
  let isMounted = true;

  const fetchInfoAndInitOrder = async () => {
    try {
      const data = await fetchTaiKhoan(token);
      const diachiData = await fetchDiaChi(token);

      if (!isMounted) return;

      setUserInfo({
        ten: data.hoten,
        sdt: data.sdt,
        diachi: data.diachi,
      });

      setDiaChiList(diachiData || []);

      const defaultDiaChi = diachiData.find((dc) => dc.macdinh) || diachiData[0];

      if (!selectedItem || selectedItem.soluong == null || isNaN(selectedItem.soluong)) {
        Alert.alert("Lỗi dữ liệu", "Sản phẩm không có thông tin tồn kho.");
        return;
      }

      setOrderDetails({
        items: [
          {
            sanpham_id: selectedItem.id,
            soluong: 1,
            dongia: selectedItem.gia,
          },
        ],
        tongtien: selectedItem.gia,
        diaChi: defaultDiaChi?.diachi || '',
      });

      setSelectedDiaChiId(defaultDiaChi?.id ?? null);
    } catch (err) {
      if (isMounted) setMessage("Không thể tải thông tin tài khoản hoặc địa chỉ.");
    }
  };

  fetchInfoAndInitOrder();

  return () => {
    isMounted = false;
  };
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
// const handleIncrease = (id) => {
//   const updated = data.map((item) => {
//     if (item.id === id) {
//       return { ...item, soluong: (item.soluong ?? 0) + 1 };
//     }
//     return item;
//   });
//   setData(updated);
// };

// const handleDecrease = (id) => {
//   const updated = data.map((item) => {
//     if (item.id === id && (item.soluong ?? 0) > 0) {
//       return { ...item, soluong: item.soluong - 1 };
//     }
//     return item;
//   });
//   setData(updated);
// };

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

<Text style={{ marginTop: 15 }}>Số lượng:</Text>

{orderDetails.items.length > 0 && selectedItem && (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 5 }}>
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
      <Text style={styles.qtyText}>−</Text>
    </TouchableOpacity>

    <Text style={{ marginHorizontal: 20, fontSize: 16 }}>
      {orderDetails.items?.[0]?.soluong ?? 1}
    </Text>

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

    <Text style={{ marginTop: 15, fontWeight: 'bold' }}>Chọn địa chỉ giao hàng:</Text>

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
