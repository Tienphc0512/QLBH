import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { fetchSanPham } from '../service/api';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/Auth';

const SanPham = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { ten } = route.params;
  const { addToCart } = useCart();
  const { token } = useAuth();

  const [sanPham, setSanPham] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (ten && token) {
      fetchSanPham(ten, token)
        .then((data) => {
          setSanPham(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error.message);
          setLoading(false);
        });
    }
  }, [ten, token]);

  const handleAddToCart = () => {
    const item = {
      id: sanPham.id,
      ten: sanPham.ten,
      gia: sanPham.gia,
      soluong: quantity,
      anh_dai_dien: sanPham.hinhanh,
    };

    addToCart(item);
    Alert.alert('Thành công', `Đã thêm "${sanPham.ten}" (${quantity} cái) vào giỏ hàng`);
  };

  const handleOrder = () => {
    navigation.navigate('DatHang', { product: sanPham, quantity });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />;
  }

  if (!sanPham) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy sản phẩm.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {sanPham.hinhanh && (
        <Image source={{ uri: sanPham.hinhanh }} style={styles.image} resizeMode="contain" />
      )}
      <Text style={styles.name}>{sanPham.ten}</Text>
      <Text style={styles.price}>Giá: {sanPham.gia?.toLocaleString()}₫</Text>
      <Text style={styles.desc}>Mô tả: {sanPham.mota}</Text>

      <Text style={{ fontWeight: 'bold' }}>Chọn số lượng:</Text>
      <Picker
        selectedValue={quantity}
        onValueChange={(value) => setQuantity(value)}
        style={{ height: 50, width: 150 }}
      >
        {[...Array(10).keys()].map((_, i) => (
          <Picker.Item key={i + 1} label={`${i + 1}`} value={i + 1} />
        ))}
      </Picker>

      <View style={{ marginVertical: 16 }}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleAddToCart}
        >
          <FontAwesome name="shopping-cart" size={20} color="#fff" />
          <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 40 }}>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={handleOrder}
        >
          <FontAwesome name="credit-card" size={20} color="#fff" />
          <Text style={styles.buttonText}>Đặt hàng ngay</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  image: { width: '100%', height: 250, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  price: { fontSize: 20, color: 'green', marginBottom: 8 },
  desc: { fontSize: 16, marginBottom: 20 },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default SanPham;
