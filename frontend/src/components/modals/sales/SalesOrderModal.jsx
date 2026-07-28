import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Space, message, InputNumber, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../api/axiosConfig';

const { Option } = Select;

const SalesOrderModal = ({ visible, onClose, onSuccess, editingData }) => {
    const [form] = Form.useForm();
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchCustomers();
            fetchProducts();
            
            if (editingData) {
                form.setFieldsValue({
                    ...editingData,
                    order_date: editingData.order_date ? dayjs(editingData.order_date) : null,
                    expected_delivery_date: editingData.expected_delivery_date ? dayjs(editingData.expected_delivery_date) : null,
                    lines: editingData.lines ? editingData.lines.map(line => ({
                        ...line,
                        unit_price: parseFloat(line.unit_price)
                    })) : []
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    order_date: dayjs(),
                    lines: [{ product: null, quantity: 1, unit_price: 0 }]
                });
            }
        }
    }, [visible, editingData, form]);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/sales/customers/');
            setCustomers(response.data.results || response.data || []);
        } catch (error) {
            message.error('Gagal mengambil data pelanggan');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/inventory/products/');
            setProducts(response.data.results || response.data || []);
        } catch (error) {
            message.error('Gagal mengambil data produk');
        }
    };

    const handleProductChange = (productId, namePath) => {
        const selectedProduct = products.find(p => p.id === productId);
        if (selectedProduct) {
            const lines = form.getFieldValue('lines');
            lines[namePath].unit_price = parseFloat(selectedProduct.sales_price || selectedProduct.base_price || 0);
            lines[namePath].uom = selectedProduct.uom;
            form.setFieldsValue({ lines });
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues = {
                ...values,
                order_date: values.order_date ? values.order_date.format('YYYY-MM-DD') : null,
                expected_delivery_date: values.expected_delivery_date ? values.expected_delivery_date.format('YYYY-MM-DD') : null,
            };

            if (editingData) {
                await api.put(`/sales/orders/${editingData.id}/`, formattedValues);
                message.success('Sales Order berhasil diperbarui');
            } else {
                await api.post('/sales/orders/', formattedValues);
                message.success('Sales Order berhasil dibuat');
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
        <Modal
            title={editingData ? 'Edit Sales Order' : 'Buat Sales Order Baru'}
            open={visible}
            onOk={handleSubmit}
            onCancel={onClose}
            width={850}
            okText="Simpan SO"
            cancelText="Batal"
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="document_number" label="No. Dokumen SO" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <Input placeholder="SO/2026/08/001" disabled={!!editingData} />
                    </Form.Item>
                    <Form.Item name="customer" label="Pelanggan" rules={[{ required: true }]} style={{ flex: 2 }}>
                        <Select
                            showSearch
                            placeholder="Pilih Pelanggan"
                            optionFilterProp="children"
                        >
                            {customers.map(c => (
                                <Option key={c.id} value={c.id}>{c.name} ({c.code})</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="order_date" label="Tanggal Order" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="expected_delivery_date" label="Tgl. Rencana Kirim" style={{ flex: 1 }}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                </div>

                <Divider style={{ margin: '12px 0' }}>Item Pesanan</Divider>
                
                <Form.List name="lines">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'product']}
                                        rules={[{ required: true, message: 'Pilih produk' }]}
                                        style={{ width: 300 }}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Pilih Produk"
                                            optionFilterProp="children"
                                            onChange={(val) => handleProductChange(val, name)}
                                        >
                                            {products.map(p => (
                                                <Option key={p.id} value={p.id}>{p.code} - {p.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'quantity']}
                                        rules={[{ required: true, message: 'Qty' }]}
                                    >
                                        <InputNumber placeholder="Qty" min={0.01} style={{ width: 100 }} />
                                    </Form.Item>

                                    <Form.Item
                                        {...restField}
                                        name={[name, 'uom']}
                                    >
                                        <Input placeholder="UOM" style={{ width: 80 }} disabled />
                                    </Form.Item>

                                    <Form.Item
                                        {...restField}
                                        name={[name, 'unit_price']}
                                        rules={[{ required: true, message: 'Harga' }]}
                                    >
                                        <InputNumber 
                                            placeholder="Harga Satuan" 
                                            style={{ width: 150 }}
                                            formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/\Rp\s?|(,*)/g, '')}
                                        />
                                    </Form.Item>
                                    
                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Tambah Item Produk
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Form.Item name="notes" label="Catatan Tambahan">
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SalesOrderModal;
