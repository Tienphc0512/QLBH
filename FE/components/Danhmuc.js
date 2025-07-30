import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";   
import { fetchDanhMuc } from "../service/api";
import { useAuth } from "../context/Auth";

const DanhMuc = () => {
  const [danhMucList, setDanhMucList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { token } = useAuth();

  useEffect(() => {
    fetchDanhMuc('', token)
      .then((data) => setDanhMucList(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate("Sản phẩm", {
        danhmucId: item.id,
        danhmucTen: item.ten,
      })}
    >
      <Text style={styles.itemText}>{item.ten}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh Mục</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : danhMucList.length === 0 ? (
        <Text>Không có danh mục nào.</Text>
      ) : (
        <FlatList
          data={danhMucList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  item: {
    padding: 16,
    backgroundColor: "#eee",
    marginBottom: 8,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
  },
});

export default DanhMuc;
