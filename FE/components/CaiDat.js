import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const CaiDat = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Thông tin tài khoản */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('Tài khoản')}
      >
        <Icon name="account-circle" size={24} color="#333" />
        <Text style={styles.text}>Thông tin tài khoản</Text>
      </TouchableOpacity>

      {/* Lịch sử đặt hàng */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('Lịch sử đặt hàng')}
      >
        <Icon name="shopping-cart" size={24} color="#333" />
        <Text style={styles.text}>Lịch sử đặt hàng</Text>
      </TouchableOpacity>

      {/* Lịch sử đơn đã hủy */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('Lịch sử hủy')}
      >
        <Icon name="cancel" size={24} color="#d9534f" />
        <Text style={styles.text}>Lịch sử đơn đã hủy</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  text: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default CaiDat;
