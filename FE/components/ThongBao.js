import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { fetchNotifications } from '../service/api';
import { useAuth } from '../context/Auth';
import { useNavigation } from '@react-navigation/native';


export default function ThongBao() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigation = useNavigation();


  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchNotifications(token);
        setNotifications(data);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải thông báo');
      }
      setLoading(false);
    }
    loadData();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Đang tải thông báo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Không có thông báo nào.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thông báo</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {/* <Text style={styles.title}>{item.noidung || 'Không có tiêu đề'}</Text> */}
            <Text>{item.noidung || ''}</Text>
            {/* Hiển thị ngày giờ */}
            <Text style={styles.date}>
              {item.created_at
                ? new Date(item.created_at).toLocaleString('vi-VN')
                : ''}
            </Text>
            <Text
              style={styles.linkText}
              onPress={() => {
                if (item.noidung?.toLowerCase().includes('hủy') || item.noidung?.toLowerCase().includes('huỷ')) {
                  navigation.navigate('Lịch sử hủy', { dathangId: item.dathang_id });
                } else {
                  navigation.navigate('Theo dõi đơn', { dathangId: item.dathang_id });
                }
              }}
            >
              Xem chi tiết
            </Text>

          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  linkText: {
    marginTop: 6,
    color: '#007AFF',
    fontSize: 13,
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
  },

});
