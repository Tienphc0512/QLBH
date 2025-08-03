import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ToastAndroid,
  Alert,
  TextInput
} from 'react-native';
import { fetchSanPham } from '../service/api';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/Auth';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const SanPham = () => {
  const route = useRoute();
  const navigation = useNavigation();
   const { addToCart } = useCart();
  const { token } = useAuth();

  const [sanPham, setSanPham] = useState([]);
  const [loading, setLoading] = useState(true);
const [soluongs, setSoluongs] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showModal, setShowModal] = useState(false);

   useEffect(() => {
    if (token) {
      fetchSanPham(token)
        .then((data) => setSanPham(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleIncrease = (productId, tonKho) => {
      setSoluongs((prev) => {
        const current = prev[productId] || 1;
        if (current < tonKho) {
          return { ...prev, [productId]: current + 1 };
        }
        ToastAndroid.show("Vượt quá tồn kho!", ToastAndroid.SHORT);
        return prev;
      });
    };
  
    const handleDecrease = (productId) => {
      setSoluongs((prev) => {
        const current = prev[productId] || 1;
        return { ...prev, [productId]: Math.max(current - 1, 1) };
      });
    };
  
    const handleChangeSoluong = (text, productId, max) => {
      const newValue = parseInt(text);
      if (!text || isNaN(newValue) || newValue <= 0) {
        setSoluongs((prev) => ({ ...prev, [productId]: '' }));
        return;
      }
  
      if (newValue > max) {
        Alert.alert('Thông báo', `Số lượng vượt quá tồn kho! (Tối đa: ${max})`);
        setSoluongs((prev) => ({ ...prev, [productId]: max }));
      } else {
        setSoluongs((prev) => ({ ...prev, [productId]: newValue }));
      }
    };
  
    const handleAddToCart = (item) => {
      setSelectedProduct(item);
      setShowModal(true);
      setSoluongs((prev) => ({ ...prev, [item.id]: prev[item.id] || 1 }));
    };
  
    const handleConfirmAddToCart = (sp) => {
      const sl = soluongs[sp.id] || 1;
      const tonKho = parseInt(sp.soluong);
      if (sl > tonKho) {
        ToastAndroid.show("Số lượng vượt quá tồn kho!", ToastAndroid.SHORT);
        return;
      }
  
      addToCart({ ...sp, soluong: sl });
      ToastAndroid.show(`${sp.ten_san_pham} đã được thêm vào giỏ`, ToastAndroid.SHORT);
      setSelectedProductId(null);
    };
  
    const handleOrderNow = (item) => {
      navigation.navigate("Đặt hàng", { item });
    };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />;
  }

  if (!sanPham || sanPham.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Không có sản phẩm trong danh mục này.</Text>
      </View>
    );
  }

  return (
    <>
    <ScrollView style={styles.container}>
      {sanPham.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() =>
            navigation.navigate('Chi tiết sản phẩm', { sanpham: item })
          }
        >
          <Image source={{ uri: item.hinhanh }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.ten}</Text>
            <Text style={styles.price}>{item.gia.toLocaleString()}₫</Text>
            <Text style={styles.quantityInput}>Tồn kho: {item.soluong}</Text>
            
                          <TouchableOpacity style={styles.cartButton} onPress={() => handleAddToCart(item)}>
                            <Text style={styles.buttonText}>Thêm</Text>
                          </TouchableOpacity>
            
                          <TouchableOpacity style={styles.orderButton} onPress={() => handleOrderNow(item)}>
                            <Text style={styles.buttonText}>Mua</Text>
                          </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>

    <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
          <View style={styles.overlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chọn số lượng</Text>
              {selectedProduct && (
                <>
                  <Text style={styles.productName}>{selectedProduct.ten_san_pham}</Text>
                  <Text style={styles.productPrice}>Tồn kho: {selectedProduct.soluong}</Text>
  
                  <View style={styles.quantityRow}>
                    <TouchableOpacity onPress={() => handleDecrease(selectedProduct.id)}>
                      <Ionicons name="remove-circle-outline" size={32} />
                    </TouchableOpacity>
  
                    <TextInput
                      style={styles.quantityInput}
                      keyboardType="numeric"
                      value={soluongs[selectedProduct.id]?.toString() ?? ''}
                      onChangeText={(text) =>
                        handleChangeSoluong(text, selectedProduct.id, selectedProduct.soluong)
                      }
                    />
  
                    <TouchableOpacity onPress={() => handleIncrease(selectedProduct.id, selectedProduct.soluong)}>
                      <Ionicons name="add-circle-outline" size={32} />
                    </TouchableOpacity>
                  </View>
  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={() => {
                        handleConfirmAddToCart(selectedProduct);
                        setShowModal(false);
                      }}
                    >
                      <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
  
                    <TouchableOpacity
                      style={[styles.confirmButton, { backgroundColor: '#999' }]}
                      onPress={() => setShowModal(false)}
                    >
                      <Text style={styles.buttonText}>Hủy</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </>
    );
  };
  

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  card: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: 'green',
  },
});

export default SanPham;
