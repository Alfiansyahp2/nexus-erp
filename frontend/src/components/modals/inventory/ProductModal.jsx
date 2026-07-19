import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, Row, Col, message } from 'antd';
import api from '../../../api/axiosConfig';

const { Option } = Select;

const ProductModal = ({ visible, onClose, onSuccess, editingData }) => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (visible) {
            if (editingData) {
                form.setFieldsValue(editingData);
            } else {
                form.resetFields();
                form.setFieldsValue({ is_active: true, unit_price: 0, cost_price: 0 });
            }
        }
    }, [visible, editingData, form]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/inventory/categories/');
            setCategories(response.data);
        } catch (error) {
            message.error('Gagal memuat kategori produk');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingData) {
                await api.put(`/inventory/products/${editingData.id}/`, values);
            } else {
                await api.post('/inventory/products/', values);
            }
            onSuccess();
        } catch (error) {
            console.error('Validation or API error:', error);
        }
    };

    return (
        <Modal
            title={editingData ? 'Ubah Produk' : 'Tambah Produk'}
            open={visible}
            onOk={handleSubmit}
            onCancel={onClose}
            okText="Simpan"
            cancelText="Batal"
            width={700}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="code"
                            label="Kode Produk"
                            rules={[{ required: true, message: 'Wajib diisi!' }]}
                        >
                            <Input placeholder="Contoh: PRD-001" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="sku"
                            label="SKU"
                        >
                            <Input placeholder="Contoh: 123456789" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="category"
                            label="Kategori"
                            rules={[{ required: true, message: 'Wajib dipilih!' }]}
                        >
                            <Select placeholder="Pilih Kategori">
                                {categories.map(cat => (
                                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item
                            name="name"
                            label="Nama Produk"
                            rules={[{ required: true, message: 'Wajib diisi!' }]}
                        >
                            <Input placeholder="Contoh: Beras Premium 5KG" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="unit_of_measure"
                            label="Satuan (UoM)"
                            rules={[{ required: true, message: 'Wajib diisi!' }]}
                        >
                            <Input placeholder="Contoh: PCS, KG" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="cost_price"
                            label="Harga Modal (HPP)"
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\Rp\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="unit_price"
                            label="Harga Jual"
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\Rp\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    name="description"
                    label="Deskripsi"
                >
                    <Input.TextArea placeholder="Deskripsi produk" rows={2} />
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

export default ProductModal;
