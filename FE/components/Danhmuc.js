// DanhMuc.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const DanhMuc = () => {
  const [danhMucList, setDanhMucList] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchDanhMuc('', token)
      .then(setDanhMucList)
      .catch(console.error);
  }, []);



  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("Sản phẩm", { danhmucId: item.id, danhmucTen: item.ten })}>
      <Text>{item.ten}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh Mục</Text>
      <FlatList data={danhMucList} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  item: { padding: 16, backgroundColor: "#eee", marginBottom: 8, borderRadius: 8 },
});

export default DanhMuc;