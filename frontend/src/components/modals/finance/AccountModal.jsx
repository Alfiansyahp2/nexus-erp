import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message, Space, Button } from 'antd';
import axios from 'axios';

const { Option } = Select;

const AccountModal = ({ open, onCancel, onSuccess }) => {
    const [form] = Form.useForm();

    const [submittable, setSubmittable] = useState(false);
    const values = Form.useWatch([], form);

    useEffect(() => {
        form.validateFields({ validateOnly: true }).then(
            () => setSubmittable(true),
            () => setSubmittable(false)
        );
    }, [form, values]);

    useEffect(() => {
        if (open) {
            form.resetFields();
        }
    }, [open, form]);

    const handleAddAccount = async (values) => {
        try {
            await axios.post('http://localhost:8000/api/finance/accounts/', values, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            message.success('Akun berhasil ditambahkan');
            onSuccess();
        } catch (error) {
            message.error('Gagal menambahkan akun');
        }
    };

    return (
        <Modal
            title="Tambah Akun Baru"
            open={open}
            onCancel={onCancel}
            onOk={form.submit}
            okText="Simpan"
            cancelText="Batal"
            okButtonProps={{ disabled: !submittable }}
        >
            <Form form={form} layout="vertical" onFinish={handleAddAccount}>
                <Form.Item name="account_code" label="Kode Akun" rules={[{ required: true }]}>
                    <Input placeholder="Contoh: 1100" />
                </Form.Item>
                <Form.Item name="name" label="Nama Akun" rules={[{ required: true }]}>
                    <Input placeholder="Contoh: Kas Kecil" />
                </Form.Item>
                <Form.Item name="account_type" label="Tipe Akun" rules={[{ required: true }]}>
                    <Select placeholder="Pilih Tipe">
                        <Option value="ASSET">Asset (Aset)</Option>
                        <Option value="LIABILITY">Liability (Kewajiban/Hutang)</Option>
                        <Option value="EQUITY">Equity (Modal)</Option>
                        <Option value="REVENUE">Revenue (Pendapatan)</Option>
                        <Option value="EXPENSE">Expense (Beban/Biaya)</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="description" label="Deskripsi">
                    <Input.TextArea rows={2} />
                </Form.Item>
                
            </Form>
        </Modal>
    );
};

export default AccountModal;
