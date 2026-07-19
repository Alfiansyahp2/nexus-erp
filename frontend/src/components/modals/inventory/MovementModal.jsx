import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Row, Col, DatePicker, message } from 'antd';
import api from '../../../api/axiosConfig';

const { Option } = Select;

const MovementModal = ({ visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();

    const [submittable, setSubmittable] = useState(false);
    const values = Form.useWatch([], form);

    useEffect(() => {
        form.validateFields({ validateOnly: true }).then(
            () => setSubmittable(true),
            () => setSubmittable(false)
        );
    }, [form, values]);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        if (visible) {
            form.resetFields();
            fetchData();
        }
    }, [visible, form]);

    const fetchData = async () => {
        try {
            const [prodRes, whRes] = await Promise.all([
                api.get('/inventory/products/'),
                api.get('/inventory/warehouses/')
            ]);
            setProducts(prodRes.data);
            setWarehouses(whRes.data);
        } catch (error) {
            message.error('Gagal memuat data master produk/gudang');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // Format date for Django (YYYY-MM-DD)
            values.date = values.date.format('YYYY-MM-DD');
            await api.post('/inventory/stock-movements/', values);
            onSuccess();
        } catch (error) {
            console.error('Validation or API error:', error);
        }
    };

    return (
        <Modal
            title="Tambah Mutasi Stok"
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
                    <Col span={12}>
                        <Form.Item
                            name="reference_number"
                            label="Nomor Referensi"
                            rules={[{ required: true, message: 'Wajib diisi!' }]}
                        >
                            <Input placeholder="Contoh: TR-2023-001" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="date"
                            label="Tanggal"
                            rules={[{ required: true, message: 'Wajib dipilih!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                </Row>
                
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="product"
                            label="Produk"
                            rules={[{ required: true, message: 'Wajib dipilih!' }]}
                        >
                            <Select placeholder="Pilih Produk" showSearch optionFilterProp="children">
                                {products.map(p => (
                                    <Option key={p.id} value={p.id}>{p.code} - {p.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="warehouse"
                            label="Gudang"
                            rules={[{ required: true, message: 'Wajib dipilih!' }]}
                        >
                            <Select placeholder="Pilih Gudang" showSearch optionFilterProp="children">
                                {warehouses.map(w => (
                                    <Option key={w.id} value={w.id}>{w.code} - {w.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="movement_type"
                            label="Jenis Mutasi"
                            rules={[{ required: true, message: 'Wajib dipilih!' }]}
                        >
                            <Select placeholder="Pilih Jenis">
                                <Option value="IN">Stok Masuk (IN)</Option>
                                <Option value="OUT">Stok Keluar (OUT)</Option>
                                <Option value="TRANSFER">Pindah Gudang (TRANSFER)</Option>
                                <Option value="ADJUSTMENT">Penyesuaian (ADJUSTMENT)</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="quantity"
                            label="Kuantitas"
                            rules={[{ required: true, message: 'Wajib diisi!' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0.01} step={0.01} placeholder="0.00" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="notes"
                    label="Catatan"
                >
                    <Input.TextArea placeholder="Keterangan tambahan" rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default MovementModal;
