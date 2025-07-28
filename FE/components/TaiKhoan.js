import React, { useEffect, useState } from 'react';
import { fetchTaiKhoan, updateTaiKhoan } from '../service/api'; // Đổi tên file api nếu cần
import { Button, Input, Form, message, Spin } from 'antd';

const TaiKhoan = ({ token }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const getTaiKhoan = async () => {
            setLoading(true);
            try {
                const data = await fetchTaiKhoan(token);
                form.setFieldsValue(data);
            } catch (err) {
                message.error(err.message);
            }
            setLoading(false);
        };
        getTaiKhoan();
    }, [token, form]);

    const onFinish = async (values) => {
        setUpdating(true);
        try {
            await updateTaiKhoan(values, token);
            message.success('Cập nhật tài khoản thành công');
        } catch (err) {
            message.error(err.message);
        }
        setUpdating(false);
    };

    return (
        <Spin spinning={loading}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 400, margin: '0 auto', marginTop: 32 }}
            >
                <Form.Item label="Họ tên" name="hoten" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Số điện thoại" name="sdt" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Mật khẩu" name="matkhau" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item label="Địa chỉ" name="diachi">
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={updating} block>
                        Cập nhật
                    </Button>
                </Form.Item>
            </Form>
        </Spin>
    );
};

export default TaiKhoan;