import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Row, Col, Divider, message } from 'antd';
import api from '../../../api/axiosConfig';

const VendorModal = ({ visible, onClose, onSuccess, editingData }) => {
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
                form.setFieldsValue({ payment_terms_days: 30, is_active: true });
            }
        }
    }, [visible, editingData, form]);

    const handleSubmit = async () => {
        try {
            const val = await form.validateFields();
            if (editingData) {
                await api.put(`/purchasing/vendors/${editingData.id}/`, val);
                message.success('Data vendor berhasil diperbarui');
            } else {
                await api.post('/purchasing/vendors/', val);
                message.success('Vendor baru berhasil ditambahkan');
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving vendor:', error);
            if (error.response?.data) {
                message.error('Gagal menyimpan vendor: ' + JSON.stringify(error.response.data));
            }
        }
    };

    return (
        <Modal
            title={editingData ? 'Ubah Vendor / Supplier' : 'Tambah Vendor Baru'}
            open={visible}
            onOk={handleSubmit}
            onCancel={onClose}
            okText="Simpan"
            okButtonProps={{ disabled: !submittable }}
            cancelText="Batal"
            width={700}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="code"
                            label="Kode Vendor"
                            rules={[{ required: true, message: 'Kode wajib diisi' }]}
                        >
                            <Input placeholder="VEND-0001" disabled={!!editingData} />
                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        <Form.Item
                            name="name"
                            label="Nama Vendor / Perusahaan"
                            rules={[{ required: true, message: 'Nama wajib diisi' }]}
                        >
                            <Input placeholder="PT. Supplier Utama" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="email" label="Email">
                            <Input placeholder="contact@vendor.com" type="email" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="phone" label="No. Telepon / HP">
                            <Input placeholder="021-1234567" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="address" label="Alamat">
                    <Input.TextArea rows={2} placeholder="Alamat lengkap kantor/gudang vendor" />
                </Form.Item>

                <Divider style={{ margin: '12px 0', fontSize: 13, color: '#888' }}>Informasi Finansial & Pembayaran</Divider>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="npwp" label="NPWP">
                            <Input placeholder="00.000.000.0-000.000" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="payment_terms_days"
                            label="Term Pembayaran (Hari)"
                            rules={[{ required: true, message: 'Wajib diisi' }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} addonAfter="Hari" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="bank_name" label="Nama Bank">
                            <Input placeholder="BCA / Mandiri / BNI" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="bank_account_number" label="No. Rekening">
                            <Input placeholder="1234567890" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="bank_account_name" label="Atas Nama (A.N)">
                            <Input placeholder="PT. Supplier Utama" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="is_active" label="Status Aktif" valuePropName="checked">
                    <Switch checkedChildren="Aktif" unCheckedChildren="Non-aktif" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default VendorModal;
