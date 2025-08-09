import React, { useEffect, useState } from 'react';
import { fetchChatHistoryAI } from '../../service/api';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { useAuth } from '../../context/Auth';

export default function LichSuChatBot() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const [refreshing, setRefreshing] = useState(false);


    const loadHistory = async () => {
        setRefreshing(true);
        try {
            const data = await fetchChatHistoryAI(token);
            setHistory(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        setRefreshing(false);
    };

    useEffect(() => {
        if (token) {
            loadHistory();
        }
    }, [token]);


    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    if (!history.length) {
        return (
            <View style={styles.center}>
                <Text>Chưa có lịch sử chat.</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.question}>Bạn: {item.question}</Text>
            <Text style={styles.answer}>Chatbot: {item.answer}</Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={history}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadHistory} />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    error: { color: 'red', fontSize: 16 },
    item: {
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    question: { fontWeight: 'bold', marginBottom: 4 },
    answer: { color: '#333', marginBottom: 4 },
    time: { fontSize: 12, color: '#888', textAlign: 'right' },
});