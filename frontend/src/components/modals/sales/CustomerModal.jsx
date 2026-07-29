import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col, Switch, message } from 'antd';
import { FormModal } from '../../common';
import api from '../../../api/axiosConfig';

const CustomerModal = ({ visible, onClose, onSuccess, editingData }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (editingData) {
                form.setFieldsValue({
                    ...editingData,
                    credit_limit: parseFloat(editingData.credit_limit || 0)
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, editingData, form]);

    const handleSubmit = async (values) => {
        try {
            if (editingData) {
                await api.put(`/sales/customers/${editingData.id}/`, values);
                message.success('Pelanggan berhasil diperbarui');
            } else {
                await api.post('/sales/customers/', values);
                message.success('Pelanggan berhasil ditambahkan');
            }
            onSuccess();
        } catch (error) {
            if (error.response?.data) {
                const errorMsg = Object.values(error.response.data).flat().join(', ');
                message.error(`Gagal menyimpan: ${errorMsg}`);
            }
        }
    };

    return (
        <FormModal
            title={editingData ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
            visible={visible}
            onSubmit={handleSubmit}
            onCancel={onClose}
            form={form}
            width={700}
        >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="code" label="Kode Pelanggan" rules={[{ required: true }]}>
                            <Input placeholder="CUST-001" disabled={!!editingData} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="name" label="Nama Pelanggan/Perusahaan" rules={[{ required: true }]}>
                            <Input placeholder="PT Maju Bersama" />
                        </Form.Item>
                    </Col>
                </Row>
                
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="email" label="Email">
                            <Input placeholder="email@perusahaan.com" type="email" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="phone" label="No. Telepon / HP">
                            <Input placeholder="08123456789" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="address" label="Alamat Lengkap">
                    <Input.TextArea rows={3} placeholder="Alamat pengiriman / penagihan" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="npwp" label="NPWP">
                            <Input placeholder="Nomor NPWP" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="credit_limit" label="Limit Kredit (Rp)">
                            <InputNumber 
                                style={{ width: '100%' }}
                                formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\Rp\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="payment_terms_days" label="Term Bayar (Hari)" rules={[{ required: true }]}>
                            <InputNumber min={0} max={365} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="is_active" label="Status Aktif" valuePropName="checked" initialValue={true}>
                    <Switch checkedChildren="Aktif" unCheckedChildren="Non-aktif" />
                </Form.Item>
        </FormModal>
    );
};

export default CustomerModal;
