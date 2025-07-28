import React, { useEffect, useState } from 'react';
import { fetchNotifications } from '../service/api'; 
import { Spin, List, Alert } from 'antd';

export default function ThongBao({ token }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError('');
            try {
                const data = await fetchNotifications(token);
                setNotifications(data);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        }
        loadData();
    }, [token]);

    if (loading) return <Spin tip="Đang tải thông báo..." />;
    if (error) return <Alert type="error" message={error} />;

    return (
        <List
            header={<b>Thông báo</b>}
            bordered
            dataSource={notifications}
            renderItem={item => (
                <List.Item>
                    <div>
                        <b>{item.title || 'Không có tiêu đề'}</b>
                        <div>{item.content || ''}</div>
                        <small>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</small>
                    </div>
                </List.Item>
            )}
            locale={{ emptyText: 'Không có thông báo nào.' }}
        />
    );
}