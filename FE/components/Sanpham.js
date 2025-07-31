import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { fetchSanPham } from '../service/api';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/Auth';

const SanPham = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { danhmucId } = route.params;
  const { token } = useAuth();

  const [sanPham, setSanPham] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (danhmucId && token) {
      fetchSanPham(token)
        .then((data) => {
          const filtered = data.filter(sp => sp.danhmuc_id === danhmucId);
          setSanPham(filtered);
        })
        .catch((error) => {
          console.error(error.message);
        })
        .finally(() => setLoading(false));
    }
  }, [danhmucId, token]);

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
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
