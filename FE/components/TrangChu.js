import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  ToastAndroid
} from 'react-native';
import { fetchDanhMuc, fetchSanPham } from '../service/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/Auth';

const TrangChu = ({ navigation }) => {
  const [danhmuc, setDanhmuc] = useState([]);
  const [sanpham, setSanpham] = useState([]);
  const [filteredSanPham, setFilteredSanPham] = useState([]);
  const [search, setSearch] = useState('');
  const { addToCart } = useCart();
  const { token } = useAuth();


 useEffect(() => {
  const fetchData = async () => {
    try {
      const danhmucRes = await fetchDanhMuc('', token); 
      setDanhmuc(danhmucRes.data);

      const sanphamRes = await fetchSanPham('', token); 
      setSanpham(sanphamRes.data);
      setFilteredSanPham(sanphamRes.data);
    } catch (err) {
      console.error('Lỗi khi load dữ liệu:', err.response?.data || err.message);
    }
  };
  if (token) fetchData(); // đảm bảo token có rồi mới gọi
}, [token]); // depend on token để re-run khi token sẵn sàng



  const handleSearch = (text) => {
    setSearch(text);
    const filtered = sanpham.filter(
      (sp) =>
        sp.ten.toLowerCase().includes(text.toLowerCase()) ||
        danhmuc.find((dm) => dm.id === sp.danhmuc_id && dm.ten.toLowerCase().includes(text.toLowerCase()))
    );
    setFilteredSanPham(filtered);
  };

  const handleAddToCart = (item) => {
     if (soluong > item.soluong) {
          setError("Số lượng vượt quá tồn kho!");
          return;
        }
        addToCart({ ...item, soluong });
    setSoluong(1); // Reset quantity after adding to cart
    setError('');
    // addToCart(item);
    ToastAndroid.show(`${item.ten} đã được thêm vào giỏ`, ToastAndroid.SHORT);
  };

  const handleOrderNow = (item) => {
    navigation.navigate("Đặt hàng", { item });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trang Chủ</Text>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={() => navigation.navigate("Thông báo")}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Tài khoản")}>
            <Ionicons name="person-circle-outline" size={26} color="#000" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Chatbot")}>
            <MaterialIcons name="chat-bubble-outline" size={24} color="#000" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH BAR */}
      <TextInput
        style={styles.searchBar}
        placeholder="Tìm kiếm sản phẩm hoặc danh mục..."
        value={search}
        onChangeText={handleSearch}
      />

    {/* DANH MỤC - lướt ngang */}
      <Text style={styles.heading}>Danh mục</Text>
      <FlatList
        horizontal
        data={danhmuc}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.categoryText}>{item.ten}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 10 }}
      />

      {/* SẢN PHẨM - lưới 3 cột, lướt dọc */}
      <Text style={styles.heading}>Sản phẩm nổi bật</Text>
      <FlatList
        data={filteredSanPham}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        renderItem={({ item: sp }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: sp.anh_dai_dien }} style={styles.productImage} />
            <Text style={styles.productName}>{sp.ten}</Text>
            <Text style={styles.productPrice}>{sp.gia.toLocaleString()}₫</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={() => handleAddToCart(sp)}
              >
                <Text style={styles.buttonText}>Thêm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.orderButton}
                onPress={() => handleOrderNow(sp)}
              >
                <Text style={styles.buttonText}>Mua ngay</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.orderButton, { backgroundColor: '#1976d2', marginTop: 5 }]}
              onPress={() => navigation.navigate("Chi tiết sản phẩm", { item: sp })}
            >
              <Text style={styles.buttonText}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
           )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsWrapper}
      />
    </View>
  )
}

export default TrangChu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  categoryButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 15,
    color: '#333',
  },
  productsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 15,
    color: '#e53935',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cartButton: {
    backgroundColor: '#ffb300',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 5,
    flex: 1,
    alignItems: 'center',
  },
  orderButton: {
    backgroundColor: '#43a047',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
