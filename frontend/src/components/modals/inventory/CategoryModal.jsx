import React, { useEffect, useState } from 'react';
import { Modal, Form, Input } from 'antd';
import api from '../../../api/axiosConfig';

const CategoryModal = ({ visible, onClose, onSuccess, editingData }) => {
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
        if (visible) {
            if (editingData) {
                form.setFieldsValue(editingData);
            } else {
                form.resetFields();
            }
        }
    }, [visible, editingData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingData) {
                await api.put(`/inventory/categories/${editingData.id}/`, values);
            } else {
                await api.post('/inventory/categories/', values);
            }
            onSuccess();
        } catch (error) {
            console.error('Validation or API error:', error);
        }
    };

    return (
        <Modal
            title={editingData ? 'Ubah Kategori' : 'Tambah Kategori'}
            open={visible}
            onOk={handleSubmit}
            onCancel={onClose}
            okText="Simpan"
            okButtonProps={{ disabled: !submittable }}
            cancelText="Batal"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Nama Kategori"
                    rules={[{ required: true, message: 'Harap masukkan nama kategori!' }]}
                >
                    <Input placeholder="Contoh: Elektronik, Bahan Baku" />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Deskripsi"
                >
                    <Input.TextArea placeholder="Deskripsi opsional" rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CategoryModal;
