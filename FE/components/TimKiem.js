import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { fetchDanhMuc, fetchSanPham } from '../service/api';
import { useAuth } from '../context/Auth';
import { useNavigation } from '@react-navigation/native';

const TimKiem = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchDanhMuc('', token);
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getCategories();
  }, [token]);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchSanPham(searchText, token);
        const filtered = selectedCategory
          ? data.filter((sp) => sp.categoryId === Number(selectedCategory))
          : data;
        setProducts(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, [searchText, selectedCategory, token]);

  const handleSelectProduct = (product) => {
    navigation.navigate('Chitietsanpham', { id: product.id });
  };

  const handleSelectCategory = (cat) => {
    navigation.navigate('SanPham', { danhmucId: cat.id, danhmucTen: cat.ten || cat.name });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tìm kiếm sản phẩm</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Nhập tên sản phẩm..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <Text style={styles.subtitle}>Chọn danh mục:</Text>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.category,
            selectedCategory === String(cat.id) && styles.selectedCategory,
          ]}
          onPress={() =>
            selectedCategory === String(cat.id)
              ? setSelectedCategory('')
              : setSelectedCategory(String(cat.id))
          }
          onLongPress={() => handleSelectCategory(cat)}
        >
          <Text>{cat.ten || cat.name}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.subtitle}>Kết quả tìm kiếm:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : products.length === 0 ? (
        <Text>Không tìm thấy sản phẩm phù hợp.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.product}
              onPress={() => handleSelectProduct(item)}
            >
              <Text>{item.ten || item.name}</Text>
              <Text style={styles.categoryName}>
                {
                  categories.find((cat) => cat.id === item.categoryId)?.ten ||
                  categories.find((cat) => cat.id === item.categoryId)?.name
                }
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontWeight: '600', marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  category: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 6,
  },
  selectedCategory: {
    backgroundColor: '#add8e6',
  },
  product: {
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});

export default TimKiem;
