import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ToastAndroid,
  StyleSheet
} from 'react-native';
import { fetchSanPham } from '../service/api';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/Auth';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const SanPhamTheoDanhMuc = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { danhMucId } = route.params;
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [sanPham, setSanPham] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soluongs, setSoluongs] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (token && danhMucId) {
      console.log("Token:", token);
      console.log("danhMucId:", danhMucId);

      fetchSanPham(token, '')
        .then((data) => {
          // console.log("Tất cả sản phẩm từ API:", data);

          const filtered = data.filter(sp => String(sp.danhmuc_id) === String(danhMucId));

          setSanPham(filtered);
        })
        .catch((error) => {
          console.error("Lỗi khi fetch:", error.message);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, danhMucId]);



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

  const handleOrderNow = (sp) => {
    navigation.navigate("Đặt hàng", { sp });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />;
  }

  if (sanPham.length === 0) {
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
            onPress={() => navigation.navigate('Chi tiết sản phẩm', { sanpham: item })}
          >
            <Image source={{ uri: item.hinhanh }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.ten_san_pham}</Text>
              <Text style={styles.price}>{item.gia.toLocaleString()}₫</Text>
              <Text style={styles.quantityInput}>Tồn kho: {item.soluong}</Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.cartButton} onPress={() => handleAddToCart(item)}>
                  <Text style={styles.buttonText}>Thêm</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.orderButton} onPress={() => handleOrderNow(item)}>
                  <Text style={styles.buttonText}>Mua</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => navigation.navigate("Chi tiết sản phẩm", { item })}
                >
                  <Text style={styles.detailText}>Chi tiết</Text>
                </TouchableOpacity>
              </View>

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

export default SanPhamTheoDanhMuc;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#F5F7FA',
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 12,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    color: '#E53935',
    fontWeight: '600',
    marginBottom: 4,
  },
  quantityInput: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
 buttonGroup: {
  flexDirection: 'row',
  gap: 8, // nếu dùng React Native >= 0.71
  marginTop: 8,
  flexWrap: 'wrap', // giúp co lại nếu không đủ chỗ
},
buttonGroup: {
  flexDirection: 'row',
  marginTop: 8,
  flexWrap: 'wrap',
},
cartButton: {
  backgroundColor: '#43A047',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 6,
  marginRight: 8,
  marginBottom: 6,
  alignSelf: 'flex-start',
  minWidth: 90,
},

orderButton: {
  backgroundColor: '#1E88E5',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 6,
  marginRight: 8,
  marginBottom: 6,
  alignSelf: 'flex-start',
  minWidth: 90,
},

detailButton: {
  borderColor: '#1E88E5',
  borderWidth: 1,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 6,
  marginBottom: 6,
  alignSelf: 'flex-start',
  minWidth: 90,
},

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    width: '90%',
    borderRadius: 12,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
    color: '#333',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    color: '#444',
  },
  productPrice: {
    fontSize: 14,
    color: '#777',
    marginBottom: 16,
    textAlign: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 10,
    minWidth: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
