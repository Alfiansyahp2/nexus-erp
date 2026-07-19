import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Row, Col } from 'antd';
import api from '../../../api/axiosConfig';

const WarehouseModal = ({ visible, onClose, onSuccess, editingData }) => {
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
                form.setFieldsValue({ is_active: true });
            }
        }
    }, [visible, editingData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingData) {
                await api.put(`/inventory/warehouses/${editingData.id}/`, values);
            } else {
                await api.post('/inventory/warehouses/', values);
            }
            onSuccess();
        } catch (error) {
            console.error('Validation or API error:', error);
        }
    };

    return (
        <Modal
            title={editingData ? 'Ubah Gudang' : 'Tambah Gudang'}
            open={visible}
            onOk={handleSubmit}
            onCancel={onClose}
            okText="Simpan"
            okButtonProps={{ disabled: !submittable }}
            cancelText="Batal"
            width={600}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="code"
                            label="Kode Gudang"
                            rules={[{ required: true, message: 'Harap masukkan kode gudang!' }]}
                        >
                            <Input placeholder="Contoh: WH-01" />
                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        <Form.Item
                            name="name"
                            label="Nama Gudang"
                            rules={[{ required: true, message: 'Harap masukkan nama gudang!' }]}
                        >
                            <Input placeholder="Contoh: Gudang Utama" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    name="location"
                    label="Lokasi"
                >
                    <Input placeholder="Contoh: Jakarta Selatan" />
                </Form.Item>
                <Form.Item
                    name="address"
                    label="Alamat Lengkap"
                >
                    <Input.TextArea placeholder="Alamat detail" rows={3} />
                </Form.Item>
                <Form.Item
                    name="is_active"
                    label="Status Aktif"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default WarehouseModal;
