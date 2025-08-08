import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ToastAndroid
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { fetchChiTietSanPham } from '../service/api';
import { useAuth } from '../context/Auth';


const DEFAULT_IMAGE = 'https://via.placeholder.com/150';

const ChiTietSanPham = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;
  const [sanpham, setSanpham] = useState(null);
  const [soluong, setSoluong] = useState(1);
  const [loading, setLoading] = useState(true);


  const { token } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    const loadChiTiet = async () => {
      try {
        const data = await fetchChiTietSanPham(item.id, token);
        setSanpham(data);
        console.log(data);
      } catch (err) {
        Alert.alert('Lỗi', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadChiTiet();
  }, [item.id]);

  const handleIncrease = () => {
    const tonKho = parseInt(sanpham.soluong);
    const current = parseInt(soluong) || 0; // Nếu rỗng thì coi là 0

    if (current + 1 > tonKho) {
      Alert.alert('Thông báo', 'Số lượng vượt quá tồn kho!');
    } else {
      setSoluong(current + 1);
    }
  };


  const handleDecrease = () => {
    const current = parseInt(soluong) || 1;
    setSoluong(current > 1 ? current - 1 : 1);
  };

  const handleAddToCart = (item) => {
    const parsedSoLuong = parseInt(soluong);
    const validatedSoluong = !parsedSoLuong || parsedSoLuong <= 0 ? 1 : parsedSoLuong;

    addToCart({ ...item, soluong: validatedSoluong });
    ToastAndroid.show(`${item.ten} đã được thêm vào giỏ`, ToastAndroid.SHORT);
  };

  // hàm xử lý số lượng khi nhập tay
const handleChangeSoluong = (text, max) => {
  // Cho phép rỗng để người dùng nhập tiếp
  if (text.trim() === '') {
    setSoluong(''); 
    return;
  }

  const newValue = parseInt(text);
  if (isNaN(newValue)) return;

  if (newValue > max) {
    Alert.alert('Thông báo', `Số lượng vượt quá tồn kho! (Tối đa: ${max})`);
    setSoluong(max.toString());
  } else {
    setSoluong(text);
  }
};


  const handleOrderNow = () => {
      const parsedSoluong = parseInt(soluong);

  if (!parsedSoluong || parsedSoluong <= 0) {
    Alert.alert('Lỗi', 'Vui lòng nhập số lượng hợp lệ (ít nhất 1)');
    return;
  }

  if (parsedSoluong > parseInt(sanpham.soluong)) {
    Alert.alert('Lỗi', 'Số lượng vượt quá tồn kho');
    return;
  }
    navigation.navigate('Đặt hàng', {
      sp: {
        ...sanpham,
        soluong,
        ten_san_pham: sanpham.ten,
        anh_dai_dien: sanpham.anh_dai_dien || sanpham.hinhanh?.[0] || '',
      },
    });
  };


  if (loading || !sanpham) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Đang tải chi tiết sản phẩm...</Text>
      </View>
    );
  }

  const hinhAnhArray = sanpham?.hinhanh?.length > 0 ? sanpham.hinhanh : [sanpham.anh_dai_dien || DEFAULT_IMAGE];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {hinhAnhArray.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.image} />
        ))}
      </ScrollView>
      <Text style={styles.swipeHint}>← Vuốt để xem thêm ảnh →</Text>
      <Text style={styles.name}>{sanpham.ten}</Text>
      <Text style={styles.price}>{parseInt(sanpham.gia).toLocaleString()} đ</Text>
      <Text style={styles.desc}>{sanpham.mota || 'Không có mô tả.'}</Text>
      <Text style={styles.stock}>Tồn kho: {sanpham.soluong}</Text>

      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={handleDecrease}>
          <Ionicons name="remove-circle-outline" size={32} color="black" />
        </TouchableOpacity>
        <TextInput
          style={styles.quantityInput}
          keyboardType="numeric"
          value={soluong.toString()}
          onChangeText={(text) => handleChangeSoluong(text, sanpham.soluong)}
        />



        <TouchableOpacity onPress={handleIncrease}>
          <Ionicons name="add-circle-outline" size={32} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.cartButton} onPress={() => handleAddToCart(sanpham)}>
          <Text style={styles.buttonText}>Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.orderButton} onPress={handleOrderNow}>
          <Text style={styles.buttonText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    borderRadius: 10,
    marginRight: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  price: {
    fontSize: 18,
    color: '#007BFF',
    marginBottom: 6,
  },
  desc: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  stock: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantity: {
    fontSize: 20,
    marginHorizontal: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  cartButton: {
    backgroundColor: '#388e3c',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  orderButton: {
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  quantityInput: {
    width: 60,
    height: 40,
    textAlign: 'center',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginHorizontal: 10,
  },

});

export default ChiTietSanPham;
